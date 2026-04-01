import { SyncTurnState, TurnAction } from "../types/syncBattle";

export interface SpectatorRoom {
  id: string;
  matchId: string;
  player1: {
    id: string;
    name: string;
    avatar?: string;
    rank: number;
    tier: string;
  };
  player2: {
    id: string;
    name: string;
    avatar?: string;
    rank: number;
    tier: string;
  };
  turn: number;
  phase: "preparation" | "action" | "resolution";
  timeRemaining: number;
  spectatorCount: number;
  isPrivate: boolean;
  allowChat: boolean;
  createdAt: number;
}

export interface SpectatorState {
  isSpectating: boolean;
  currentRoom: SpectatorRoom | null;
  gameState: SyncTurnState | null;
  actions: TurnAction[];
  chatMessages: SpectatorChatMessage[];
  delay: number;
}

export interface SpectatorChatMessage {
  id: string;
  spectatorId: string;
  spectatorName: string;
  message: string;
  timestamp: number;
}

export interface SpectatorSettings {
  showCards: boolean;
  showHand: boolean;
  delay: number;
  enableChat: boolean;
  showPredictions: boolean;
}

export class SpectatorService {
  private static readonly SETTINGS_KEY = "jixia_spectator_settings";
  private static readonly MAX_CHAT_HISTORY = 100;
  private static readonly DEFAULT_DELAY = 3000;

  private availableRooms: Map<string, SpectatorRoom> = new Map();
  private currentState: SpectatorState = {
    isSpectating: false,
    currentRoom: null,
    gameState: null,
    actions: [],
    chatMessages: [],
    delay: SpectatorService.DEFAULT_DELAY,
  };
  private settings: SpectatorSettings = {
    showCards: true,
    showHand: false,
    delay: SpectatorService.DEFAULT_DELAY,
    enableChat: true,
    showPredictions: true,
  };
  private observers: Set<(state: SpectatorState) => void> = new Set();
  private chatObservers: Set<(message: SpectatorChatMessage) => void> = new Set();
  private roomUpdateInterval: number | null = null;
  private currentSpectatorId: string = "";

  constructor(spectatorId: string = `spec_${Date.now()}`) {
    this.currentSpectatorId = spectatorId;
    this.loadSettings();
  }

  private loadSettings(): void {
    try {
      const settings = localStorage.getItem(SpectatorService.SETTINGS_KEY);
      if (settings) {
        this.settings = { ...this.settings, ...JSON.parse(settings) };
      }
    } catch (e) {
      console.warn("Failed to load spectator settings");
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(
        SpectatorService.SETTINGS_KEY,
        JSON.stringify(this.settings)
      );
    } catch (e) {
      console.warn("Failed to save spectator settings");
    }
  }

  async getAvailableRooms(): Promise<SpectatorRoom[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    return Array.from(this.availableRooms.values())
      .filter((room) => !room.isPrivate)
      .sort((a, b) => b.spectatorCount - a.spectatorCount);
  }

  async joinRoom(roomId: string): Promise<boolean> {
    const room = this.availableRooms.get(roomId);
    if (!room) {
      throw new Error("房间不存在");
    }

    if (room.isPrivate) {
      throw new Error("该房间为私密房间");
    }

    await new Promise((resolve) => setTimeout(resolve, 300));

    room.spectatorCount++;
    this.availableRooms.set(roomId, room);

    this.currentState = {
      isSpectating: true,
      currentRoom: room,
      gameState: null,
      actions: [],
      chatMessages: [],
      delay: this.settings.delay,
    };

    this.startRoomUpdates();
    this.notifyObservers();

    return true;
  }

  async leaveRoom(): Promise<void> {
    if (this.currentState.currentRoom) {
      const room = this.availableRooms.get(this.currentState.currentRoom.id);
      if (room) {
        room.spectatorCount = Math.max(0, room.spectatorCount - 1);
        this.availableRooms.set(room.id, room);
      }
    }

    this.stopRoomUpdates();

    this.currentState = {
      isSpectating: false,
      currentRoom: null,
      gameState: null,
      actions: [],
      chatMessages: [],
      delay: this.settings.delay,
    };

    this.notifyObservers();
  }

  private startRoomUpdates(): void {
    this.stopRoomUpdates();
    this.roomUpdateInterval = window.setInterval(() => {
      this.fetchRoomUpdate();
    }, 1000);
  }

  private stopRoomUpdates(): void {
    if (this.roomUpdateInterval !== null) {
      clearInterval(this.roomUpdateInterval);
      this.roomUpdateInterval = null;
    }
  }

  private async fetchRoomUpdate(): Promise<void> {
    if (!this.currentState.isSpectating || !this.currentState.currentRoom) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));

    const mockState: SyncTurnState = {
      turn: this.currentState.currentRoom.turn,
      phase: this.currentState.currentRoom.phase,
      timeRemaining: this.currentState.currentRoom.timeRemaining,
      player: {
        hero: {
          id: "player_hero",
          name: this.currentState.currentRoom.player1.name,
          health: 25,
          maxHealth: 30,
          mana: 5,
          maxMana: 10,
        },
        hand: this.settings.showHand
          ? [
              { id: "card1", name: "卡牌1", cost: 2 },
              { id: "card2", name: "卡牌2", cost: 3 },
            ]
          : [],
        field: [],
        deckCount: 20,
        graveyard: [],
      },
      enemy: {
        hero: {
          id: "enemy_hero",
          name: this.currentState.currentRoom.player2.name,
          health: 22,
          maxHealth: 30,
          mana: 4,
          maxMana: 10,
        },
        handCount: 4,
        field: [],
        deckCount: 18,
        graveyard: [],
      },
      pendingActions: [],
      isGameOver: false,
      winner: null,
    };

    this.currentState.gameState = mockState;
    this.notifyObservers();
  }

  sendChatMessage(message: string): void {
    if (!this.settings.enableChat || !this.currentState.isSpectating) {
      return;
    }

    const chatMessage: SpectatorChatMessage = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      spectatorId: this.currentSpectatorId,
      spectatorName: `观众${this.currentSpectatorId.slice(-4)}`,
      message: message.slice(0, 200),
      timestamp: Date.now(),
    };

    this.currentState.chatMessages.push(chatMessage);

    if (this.currentState.chatMessages.length > SpectatorService.MAX_CHAT_HISTORY) {
      this.currentState.chatMessages = this.currentState.chatMessages.slice(
        -SpectatorService.MAX_CHAT_HISTORY
      );
    }

    this.notifyChatObservers(chatMessage);
  }

  getCurrentState(): SpectatorState {
    return { ...this.currentState };
  }

  isSpectating(): boolean {
    return this.currentState.isSpectating;
  }

  getSettings(): SpectatorSettings {
    return { ...this.settings };
  }

  updateSettings(settings: Partial<SpectatorSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.saveSettings();

    if (this.currentState.isSpectating) {
      this.currentState.delay = this.settings.delay;
      this.notifyObservers();
    }
  }

  subscribeToState(callback: (state: SpectatorState) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  subscribeToChat(callback: (message: SpectatorChatMessage) => void): () => void {
    this.chatObservers.add(callback);
    return () => this.chatObservers.delete(callback);
  }

  private notifyObservers(): void {
    this.observers.forEach((callback) =>
      callback({ ...this.currentState })
    );
  }

  private notifyChatObservers(message: SpectatorChatMessage): void {
    this.chatObservers.forEach((callback) => callback(message));
  }

  async getFeaturedMatches(): Promise<SpectatorRoom[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    return Array.from(this.availableRooms.values())
      .filter((room) => room.spectatorCount > 10)
      .sort((a, b) => b.spectatorCount - a.spectatorCount)
      .slice(0, 5);
  }

  async getFriendMatches(friendIds: string[]): Promise<SpectatorRoom[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    return Array.from(this.availableRooms.values()).filter(
      (room) =>
        friendIds.includes(room.player1.id) || friendIds.includes(room.player2.id)
    );
  }

  async getHighRankMatches(minRank: number = 3000): Promise<SpectatorRoom[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    return Array.from(this.availableRooms.values()).filter(
      (room) => room.player1.rank >= minRank || room.player2.rank >= minRank
    );
  }

  addMockRoom(room: Omit<SpectatorRoom, "id" | "createdAt">): SpectatorRoom {
    const fullRoom: SpectatorRoom = {
      ...room,
      id: `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
    };

    this.availableRooms.set(fullRoom.id, fullRoom);
    return fullRoom;
  }

  removeMockRoom(roomId: string): boolean {
    return this.availableRooms.delete(roomId);
  }

  getPrediction(): {
    player1WinRate: number;
    player2WinRate: number;
    reasoning: string;
  } | null {
    if (!this.settings.showPredictions || !this.currentState.gameState) {
      return null;
    }

    const state = this.currentState.gameState;
    const player1Health = state.player.hero.health;
    const player2Health = state.enemy.hero.health;
    const totalHealth = player1Health + player2Health;

    const player1WinRate = Math.round((player1Health / totalHealth) * 100);
    const player2WinRate = 100 - player1WinRate;

    let reasoning = "";
    if (player1WinRate > 60) {
      reasoning = `${state.player.hero.name}血量优势明显`;
    } else if (player2WinRate > 60) {
      reasoning = `${state.enemy.hero.name}血量优势明显`;
    } else {
      reasoning = "双方势均力敌";
    }

    return {
      player1WinRate,
      player2WinRate,
      reasoning,
    };
  }

  clearChat(): void {
    this.currentState.chatMessages = [];
    this.notifyObservers();
  }

  exportSpectatorData(): string {
    if (!this.currentState.gameState) {
      throw new Error("没有正在观战的游戏");
    }

    const data = {
      room: this.currentState.currentRoom,
      actions: this.currentState.actions,
      exportDate: Date.now(),
    };

    return JSON.stringify(data, null, 2);
  }

  destroy(): void {
    this.stopRoomUpdates();
    this.observers.clear();
    this.chatObservers.clear();
  }
}

export const createSpectatorService = (spectatorId?: string) => {
  return new SpectatorService(spectatorId);
};
