﻿﻿﻿﻿﻿﻿﻿import { GameState, PlayerId } from '@/types/battle';
import { DebateAction, SecretAction, SyncPhase, SettlementItem } from '@/types/syncBattle';
import { PhaseManager } from './phaseManager';
import { CommandProcessor, createCommandProcessor, DebateActionCommand, SecretActionCommand, LockDecisionCommand } from './commandSystem';
import { createInitialGameState, drawCard, checkWinner } from './gameLogic';

export interface SyncGameCallbacks {
  onPhaseChange?: (phase: SyncPhase, timeRemaining: number) => void;
  onSettlement?: (layer: number, items: SettlementItem[]) => void;
  onGameEnd?: (winner: PlayerId) => void;
  onStateUpdate?: (game: GameState) => void;
}

export class SyncBattleManager {
  private game: GameState;
  private phaseManager: PhaseManager;
  private commandProcessor: CommandProcessor;
  private callbacks: SyncGameCallbacks = {};
  private tickInterval: ReturnType<typeof setInterval> | null = null;
  private isRunning: boolean = false;

  constructor() {
    this.game = createInitialGameState();
    this.phaseManager = new PhaseManager();
    this.commandProcessor = createCommandProcessor(this.phaseManager);

    this.phaseManager.setCallbacks(
      (transition) => this.handlePhaseChange(transition.to),
      (layer, items) => this.handleSettlement(layer, items)
    );
  }

  initialize(callbacks: SyncGameCallbacks): void {
    this.callbacks = callbacks;
  }

  startGame(): void {
    this.game = createInitialGameState();
    this.phaseManager.startNewTurn();
    this.startTurnSetup();
    this.startTicking();
    this.isRunning = true;

    if (this.callbacks.onStateUpdate) {
      this.callbacks.onStateUpdate(this.game);
    }
  }

  private startTurnSetup(): void {
    const currentPlayer = this.game.currentPlayer;
    const player = currentPlayer === 'player' ? this.game.player : this.game.enemy;

    player.mana = player.maxMana;
    drawCard(player);

    if (this.callbacks.onStateUpdate) {
      this.callbacks.onStateUpdate(this.game);
    }
  }

  private startTicking(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
    }

    this.tickInterval = setInterval(() => {
      this.tick();
    }, 100);
  }

  private stopTicking(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  private tick(): void {
    if (!this.isRunning) return;

    this.phaseManager.tick();

    const phase = this.phaseManager.getCurrentPhase();
    const timeRemaining = this.phaseManager.getPhaseTimeRemaining();

    if (this.callbacks.onPhaseChange) {
      this.callbacks.onPhaseChange(phase, timeRemaining);
    }

    const winner = checkWinner(this.game);
    if (winner && this.callbacks.onGameEnd) {
      this.callbacks.onGameEnd(winner);
      this.stopTicking();
      this.isRunning = false;
    }
  }

  private handlePhaseChange(newPhase: SyncPhase): void {
    switch (newPhase) {
      case 'reveal':
        break;

      case 'settle1':
        this.executeAllSettlements();
        break;

      case 'turn_end':
        this.advanceTurn();
        break;

      case 'debate':
        this.startTurnSetup();
        break;
    }

    if (this.callbacks.onStateUpdate) {
      this.callbacks.onStateUpdate(this.game);
    }
  }

  private handleSettlement(layer: number, items: SettlementItem[]): void {
    if (this.callbacks.onSettlement) {
      this.callbacks.onSettlement(layer, items);
    }
  }

  private executeAllSettlements(): void {
    this.game = this.commandProcessor.executeSettlement(this.game);

    if (this.callbacks.onStateUpdate) {
      this.callbacks.onStateUpdate(this.game);
    }
  }

  private advanceTurn(): void {
    const nextPlayer: PlayerId = this.game.currentPlayer === 'player' ? 'enemy' : 'player';
    this.game.currentPlayer = nextPlayer;

    if (nextPlayer === 'player') {
      this.game.turnNumber++;
    }

    this.commandProcessor.clearHistory();
  }

  submitDebateAction(playerId: PlayerId, action: DebateAction): boolean {
    const currentPhase = this.phaseManager.getCurrentPhase();
    if (currentPhase !== 'debate') return false;

    const isLocked = this.phaseManager.isPlayerLocked(playerId);
    if (isLocked) return false;

    const command = new DebateActionCommand(playerId, action);
    const result = this.commandProcessor.processCommand(this.game, command);

    if (result.success) {
      this.phaseManager.submitDebateAction(playerId, action);
      return true;
    }

    return false;
  }

  submitSecretAction(playerId: PlayerId, action: SecretAction): boolean {
    const currentPhase = this.phaseManager.getCurrentPhase();
    if (currentPhase !== 'secret') return false;

    const isLocked = this.phaseManager.isPlayerLocked(playerId);
    if (isLocked) return false;

    const command = new SecretActionCommand(playerId, action);
    const result = this.commandProcessor.processCommand(this.game, command);

    if (result.success) {
      this.phaseManager.submitSecretAction(playerId, action);
      return true;
    }

    return false;
  }

  lockDecision(playerId: PlayerId): boolean {
    const currentPhase = this.phaseManager.getCurrentPhase();
    if (currentPhase !== 'debate' && currentPhase !== 'secret') return false;

    const command = new LockDecisionCommand(playerId);
    const result = this.commandProcessor.processCommand(this.game, command);

    if (result.success) {
      this.phaseManager.lockDecision(playerId);
      return true;
    }

    return false;
  }

  getGame(): GameState {
    return this.game;
  }

  getCurrentPhase(): SyncPhase {
    return this.phaseManager.getCurrentPhase();
  }

  getPhaseTimeRemaining(): number {
    return this.phaseManager.getPhaseTimeRemaining();
  }

  getPhaseName(): string {
    return this.phaseManager.getPhaseName();
  }

  isPlayerLocked(playerId: PlayerId): boolean {
    return this.phaseManager.isPlayerLocked(playerId);
  }

  getRevealedSecret(playerId: PlayerId): SecretAction | null {
    return this.phaseManager.getRevealedSecret(playerId);
  }

  getDebateAction(playerId: PlayerId): DebateAction | null {
    return this.phaseManager.getDebateAction(playerId);
  }

  pause(): void {
    this.isRunning = false;
  }

  resume(): void {
    this.isRunning = true;
  }

  stop(): void {
    this.stopTicking();
    this.isRunning = false;
  }

  exportState(): string {
    return JSON.stringify({
      game: this.game,
      phaseManager: this.phaseManager.exportState(),
      commandProcessor: this.commandProcessor.exportState(),
    });
  }

  importState(stateJson: string): void {
    const state = JSON.parse(stateJson);
    this.game = state.game;
    this.phaseManager.importState(JSON.stringify(state.phaseManager));
  }
}

export function createSyncBattleManager(): SyncBattleManager {
  return new SyncBattleManager();
}

export const syncBattleManager = new SyncBattleManager();
