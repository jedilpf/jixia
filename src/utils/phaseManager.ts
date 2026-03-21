﻿﻿﻿﻿﻿﻿﻿import {
  SyncPhase,
  SyncGameState,
  PlayerSyncState,
  DebateAction,
  SecretAction,
  SettlementItem,
  PHASE_DURATIONS,
  PHASE_NAMES,
  PhaseTransition,
} from '@/types/syncBattle';
import { PlayerId } from '@/types/battle';
import { generateSettlementQueue } from './settlementEngine';

export class PhaseManager {
  private syncState: SyncGameState;
  private phaseHistory: PhaseTransition[] = [];
  private onPhaseChange?: (transition: PhaseTransition) => void;
  private onSettlement?: (layer: number, items: SettlementItem[]) => void;

  constructor() {
    this.syncState = this.createInitialSyncState();
  }

  private createInitialSyncState(): SyncGameState {
    return {
      currentPhase: 'waiting',
      phaseStartTime: Date.now(),
      phaseDuration: 0,
      playerSync: this.createEmptyPlayerSyncState(),
      enemySync: this.createEmptyPlayerSyncState(),
      revealedSecrets: {
        player: null,
        enemy: null,
      },
      settlementQueue: [],
      currentSettlementLayer: 0,
    };
  }

  private createEmptyPlayerSyncState(): PlayerSyncState {
    return {
      debateAction: null,
      secretAction: null,
      isLocked: false,
      lockedAt: null,
    };
  }

  getSyncState(): SyncGameState {
    return this.syncState;
  }

  getPhaseHistory(): PhaseTransition[] {
    return this.phaseHistory;
  }

  getCurrentPhase(): SyncPhase {
    return this.syncState.currentPhase;
  }

  getPhaseTimeRemaining(): number {
    const elapsed = Date.now() - this.syncState.phaseStartTime;
    const remaining = this.syncState.phaseDuration - elapsed;
    return Math.max(0, remaining);
  }

  isPhaseExpired(): boolean {
    return this.getPhaseTimeRemaining() <= 0;
  }

  setCallbacks(
    onPhaseChange?: (transition: PhaseTransition) => void,
    onSettlement?: (layer: number, items: SettlementItem[]) => void
  ): void {
    this.onPhaseChange = onPhaseChange;
    this.onSettlement = onSettlement;
  }

  startNewTurn(): void {
    this.syncState = {
      ...this.createInitialSyncState(),
      currentPhase: 'debate',
      phaseStartTime: Date.now(),
      phaseDuration: PHASE_DURATIONS.debate,
    };
    this.recordTransition('waiting', 'debate', '新回合开始');
  }

  submitDebateAction(playerId: PlayerId, action: DebateAction): boolean {
    const sync = playerId === 'player' ? this.syncState.playerSync : this.syncState.enemySync;
    
    if (this.syncState.currentPhase !== 'debate') return false;
    if (sync.isLocked) return false;
    
    sync.debateAction = action;
    return true;
  }

  submitSecretAction(playerId: PlayerId, action: SecretAction): boolean {
    const sync = playerId === 'player' ? this.syncState.playerSync : this.syncState.enemySync;
    
    if (this.syncState.currentPhase !== 'secret') return false;
    if (sync.isLocked) return false;
    
    sync.secretAction = action;
    return true;
  }

  lockDecision(playerId: PlayerId): boolean {
    const sync = playerId === 'player' ? this.syncState.playerSync : this.syncState.enemySync;
    
    if (sync.isLocked) return false;
    
    sync.isLocked = true;
    sync.lockedAt = Date.now();
    
    this.checkPhaseCompletion();
    return true;
  }

  private checkPhaseCompletion(): void {
    const bothLocked = this.syncState.playerSync.isLocked && this.syncState.enemySync.isLocked;
    
    if (bothLocked || this.isPhaseExpired()) {
      this.advancePhase();
    }
  }

  advancePhase(): void {
    const currentPhase = this.syncState.currentPhase;
    let nextPhase: SyncPhase;
    let reason: string;

    switch (currentPhase) {
      case 'debate':
        nextPhase = 'secret';
        reason = '明辩阶段结束，进入暗谋';
        break;
      case 'secret':
        nextPhase = 'reveal';
        reason = '暗谋阶段结束，开始揭示';
        this.revealSecrets();
        break;
      case 'reveal':
        nextPhase = 'settle1';
        reason = '揭示完成，开始五层结算';
        this.prepareSettlement();
        break;
      case 'settle1':
        nextPhase = 'settle2';
        reason = '第一层结算完成';
        break;
      case 'settle2':
        nextPhase = 'settle3';
        reason = '第二层结算完成';
        break;
      case 'settle3':
        nextPhase = 'settle4';
        reason = '第三层结算完成';
        break;
      case 'settle4':
        nextPhase = 'settle5';
        reason = '第四层结算完成';
        break;
      case 'settle5':
        nextPhase = 'turn_end';
        reason = '第五层结算完成';
        break;
      case 'turn_end':
        nextPhase = 'debate';
        reason = '回合结束，开始新回合';
        this.resetForNewTurn();
        break;
      default:
        return;
    }

    this.recordTransition(currentPhase, nextPhase, reason);
    
    this.syncState.currentPhase = nextPhase;
    this.syncState.phaseStartTime = Date.now();
    this.syncState.phaseDuration = PHASE_DURATIONS[nextPhase];

    if (nextPhase.startsWith('settle')) {
      const layer = parseInt(nextPhase.replace('settle', '')) as 1 | 2 | 3 | 4 | 5;
      this.executeCurrentSettlementLayer(layer);
    }
  }

  private recordTransition(from: SyncPhase, to: SyncPhase, reason: string): void {
    const transition: PhaseTransition = {
      from,
      to,
      reason,
      timestamp: Date.now(),
    };
    this.phaseHistory.push(transition);
    
    if (this.onPhaseChange) {
      this.onPhaseChange(transition);
    }
  }

  private revealSecrets(): void {
    this.syncState.revealedSecrets = {
      player: this.syncState.playerSync.secretAction,
      enemy: this.syncState.enemySync.secretAction,
    };
  }

  private prepareSettlement(): void {
    this.syncState.settlementQueue = generateSettlementQueue(
      this.syncState.playerSync.debateAction,
      this.syncState.enemySync.debateAction,
      this.syncState.revealedSecrets.player,
      this.syncState.revealedSecrets.enemy
    );
    this.syncState.currentSettlementLayer = 1;
  }

  private executeCurrentSettlementLayer(layer: 1 | 2 | 3 | 4 | 5): void {
    const items = this.syncState.settlementQueue.filter(item => item.layer === layer);
    
    if (this.onSettlement) {
      this.onSettlement(layer, items);
    }
  }

  private resetForNewTurn(): void {
    this.syncState.playerSync = this.createEmptyPlayerSyncState();
    this.syncState.enemySync = this.createEmptyPlayerSyncState();
    this.syncState.revealedSecrets = { player: null, enemy: null };
    this.syncState.settlementQueue = [];
    this.syncState.currentSettlementLayer = 0;
  }

  tick(): void {
    if (this.isPhaseExpired()) {
      this.autoLockUnlockedPlayers();
      this.advancePhase();
    }
  }

  private autoLockUnlockedPlayers(): void {
    const currentPhase = this.syncState.currentPhase;
    
    if (currentPhase === 'debate') {
      if (!this.syncState.playerSync.isLocked) {
        this.syncState.playerSync.debateAction = { type: 'pass' };
        this.syncState.playerSync.isLocked = true;
      }
      if (!this.syncState.enemySync.isLocked) {
        this.syncState.enemySync.debateAction = { type: 'pass' };
        this.syncState.enemySync.isLocked = true;
      }
    } else if (currentPhase === 'secret') {
      if (!this.syncState.playerSync.isLocked) {
        this.syncState.playerSync.secretAction = { type: 'pass' };
        this.syncState.playerSync.isLocked = true;
      }
      if (!this.syncState.enemySync.isLocked) {
        this.syncState.enemySync.secretAction = { type: 'pass' };
        this.syncState.enemySync.isLocked = true;
      }
    }
  }

  getPhaseName(): string {
    return PHASE_NAMES[this.syncState.currentPhase];
  }

  getDebateAction(playerId: PlayerId): DebateAction | null {
    const sync = playerId === 'player' ? this.syncState.playerSync : this.syncState.enemySync;
    return sync.debateAction;
  }

  getSecretAction(playerId: PlayerId): SecretAction | null {
    const sync = playerId === 'player' ? this.syncState.playerSync : this.syncState.enemySync;
    return sync.secretAction;
  }

  isPlayerLocked(playerId: PlayerId): boolean {
    const sync = playerId === 'player' ? this.syncState.playerSync : this.syncState.enemySync;
    return sync.isLocked;
  }

  getRevealedSecret(playerId: PlayerId): SecretAction | null {
    return playerId === 'player' 
      ? this.syncState.revealedSecrets.player 
      : this.syncState.revealedSecrets.enemy;
  }

  getSettlementQueue(): SettlementItem[] {
    return this.syncState.settlementQueue;
  }

  exportState(): string {
    return JSON.stringify({
      syncState: this.syncState,
      phaseHistory: this.phaseHistory,
    });
  }

  importState(stateJson: string): void {
    const state = JSON.parse(stateJson);
    this.syncState = state.syncState;
    this.phaseHistory = state.phaseHistory;
  }
}

export const phaseManager = new PhaseManager();
