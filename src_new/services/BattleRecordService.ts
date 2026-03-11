export type BattleActionType = 
  | "play_card"
  | "attack"
  | "use_hero_power"
  | "end_turn"
  | "draw_card"
  | "summon"
  | "death"
  | "damage"
  | "heal"
  | "buff"
  | "debuff"
  | "mulligan";

export interface BattleAction {
  id: string;
  turn: number;
  playerId: string;
  type: BattleActionType;
  sourceId?: string;
  targetId?: string;
  value?: number;
  cardId?: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface BattleState {
  turn: number;
  playerHealth: number;
  playerMana: number;
  playerHand: string[];
  playerField: string[];
  enemyHealth: number;
  enemyMana: number;
  enemyHand: number;
  enemyField: string[];
}

export interface BattleRecord {
  id: string;
  matchId: string;
  startTime: number;
  endTime?: number;
  winner?: string;
  playerId: string;
  enemyId: string;
  actions: BattleAction[];
  states: BattleState[];
  duration?: number;
  isComplete: boolean;
}

export interface BattleStats {
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  averageDuration: number;
  totalActions: number;
  mostUsedCard?: string;
  winRate: number;
}

export class BattleRecordService {
  private static readonly RECORDS_KEY = "jixia_battle_records";
  private static readonly MAX_RECORDS = 100;

  private currentRecord: BattleRecord | null = null;
  private records: BattleRecord[] = [];
  private observers: Set<(event: BattleRecordEvent) => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem(BattleRecordService.RECORDS_KEY);
      if (data) {
        this.records = JSON.parse(data);
      }
    } catch (e) {
      console.warn("Failed to load battle records from storage");
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(BattleRecordService.RECORDS_KEY, JSON.stringify(this.records));
    } catch (e) {
      console.warn("Failed to save battle records to storage");
    }
  }

  startRecord(matchId: string, playerId: string, enemyId: string): BattleRecord {
    this.currentRecord = {
      id: `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      matchId,
      startTime: Date.now(),
      playerId,
      enemyId,
      actions: [],
      states: [],
      isComplete: false,
    };

    this.notifyObservers({ type: "record_started", data: this.currentRecord });
    return this.currentRecord;
  }

  recordAction(action: Omit<BattleAction, "id" | "timestamp">): void {
    if (!this.currentRecord) return;

    const fullAction: BattleAction = {
      ...action,
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    this.currentRecord.actions.push(fullAction);
    this.notifyObservers({ type: "action_recorded", data: fullAction });
  }

  recordState(state: BattleState): void {
    if (!this.currentRecord) return;
    this.currentRecord.states.push(state);
  }

  endRecord(winner: string): BattleRecord | null {
    if (!this.currentRecord) return null;

    this.currentRecord.endTime = Date.now();
    this.currentRecord.winner = winner;
    this.currentRecord.duration = this.currentRecord.endTime - this.currentRecord.startTime;
    this.currentRecord.isComplete = true;

    // Save to history
    this.records.unshift(this.currentRecord);
    if (this.records.length > BattleRecordService.MAX_RECORDS) {
      this.records = this.records.slice(0, BattleRecordService.MAX_RECORDS);
    }

    this.saveToStorage();

    const record = this.currentRecord;
    this.notifyObservers({ type: "record_ended", data: record });
    this.currentRecord = null;

    return record;
  }

  getCurrentRecord(): BattleRecord | null {
    return this.currentRecord ? { ...this.currentRecord } : null;
  }

  getRecord(recordId: string): BattleRecord | undefined {
    return this.records.find((r) => r.id === recordId);
  }

  getAllRecords(): BattleRecord[] {
    return [...this.records];
  }

  getRecordsByPlayer(playerId: string): BattleRecord[] {
    return this.records.filter((r) => r.playerId === playerId || r.enemyId === playerId);
  }

  getRecentRecords(limit: number = 10): BattleRecord[] {
    return this.records.slice(0, limit);
  }

  getStats(playerId: string): BattleStats {
    const playerRecords = this.getRecordsByPlayer(playerId).filter((r) => r.isComplete);

    const wins = playerRecords.filter((r) => r.winner === playerId).length;
    const losses = playerRecords.filter((r) => r.winner && r.winner !== playerId).length;
    const draws = playerRecords.filter((r) => !r.winner).length;

    const totalDuration = playerRecords.reduce((sum, r) => sum + (r.duration || 0), 0);
    const totalActions = playerRecords.reduce((sum, r) => sum + r.actions.length, 0);

    // Find most used card
    const cardUsage: Record<string, number> = {};
    for (const record of playerRecords) {
      for (const action of record.actions) {
        if (action.cardId && action.playerId === playerId) {
          cardUsage[action.cardId] = (cardUsage[action.cardId] || 0) + 1;
        }
      }
    }

    const mostUsedCard = Object.entries(cardUsage).sort((a, b) => b[1] - a[1])[0]?.[0];

    return {
      totalMatches: playerRecords.length,
      wins,
      losses,
      draws,
      averageDuration: playerRecords.length > 0 ? totalDuration / playerRecords.length : 0,
      totalActions,
      mostUsedCard,
      winRate: playerRecords.length > 0 ? Math.round((wins / playerRecords.length) * 100) : 0,
    };
  }

  getTurnActions(recordId: string, turn: number): BattleAction[] {
    const record = this.getRecord(recordId);
    if (!record) return [];
    return record.actions.filter((a) => a.turn === turn);
  }

  getActionAtTime(recordId: string, timestamp: number): BattleAction | undefined {
    const record = this.getRecord(recordId);
    if (!record) return undefined;
    return record.actions.find((a) => a.timestamp >= timestamp);
  }

  exportRecord(recordId: string): string | null {
    const record = this.getRecord(recordId);
    if (!record) return null;
    return JSON.stringify(record, null, 2);
  }

  importRecord(jsonData: string): BattleRecord | null {
    try {
      const record: BattleRecord = JSON.parse(jsonData);
      if (record.id && record.matchId) {
        this.records.unshift(record);
        this.saveToStorage();
        return record;
      }
    } catch (e) {
      console.error("Failed to import battle record", e);
    }
    return null;
  }

  deleteRecord(recordId: string): boolean {
    const index = this.records.findIndex((r) => r.id === recordId);
    if (index === -1) return false;

    this.records.splice(index, 1);
    this.saveToStorage();
    this.notifyObservers({ type: "record_deleted", data: { recordId } });
    return true;
  }

  clearRecords(): void {
    this.records = [];
    localStorage.removeItem(BattleRecordService.RECORDS_KEY);
    this.notifyObservers({ type: "records_cleared", data: null });
  }

  subscribe(callback: (event: BattleRecordEvent) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private notifyObservers(event: BattleRecordEvent): void {
    this.observers.forEach((callback) => callback(event));
  }
}

export interface BattleRecordEvent {
  type: "record_started" | "action_recorded" | "record_ended" | "record_deleted" | "records_cleared";
  data: unknown;
}

export const battleRecordService = new BattleRecordService();
