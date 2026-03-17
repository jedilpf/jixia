﻿﻿﻿import { GameState, PlayerId } from '@/types/battle';
import {
  GameCommand,
  CommandType,
  CommandData,
  DebateAction,
  SecretAction,
} from '@/types/syncBattle';
import { PhaseManager } from './phaseManager';
import { SettlementEngine, createSettlementEngine, generateSettlementQueue } from './settlementEngine';

function generateCommandId(): string {
  return `cmd_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export interface CommandResult {
  success: boolean;
  game?: GameState;
  error?: string;
  command?: GameCommand;
}

export abstract class GameCommandBase {
  abstract execute(game: GameState): CommandResult;
  abstract validate(game: GameState): boolean;
  abstract getCommandType(): CommandType;
  abstract getCommandData(): CommandData;
}

export class DebateActionCommand extends GameCommandBase {
  private playerId: PlayerId;
  private action: DebateAction;

  constructor(playerId: PlayerId, action: DebateAction) {
    super();
    this.playerId = playerId;
    this.action = action;
  }

  getCommandType(): CommandType {
    return 'debate_action';
  }

  getCommandData(): CommandData {
    return { debateAction: this.action };
  }

  validate(game: GameState): boolean {
    const player = this.playerId === 'player' ? game.player : game.enemy;

    if (this.action.type === 'pass') {
      return true;
    }

    if (this.action.type === 'play_main' || this.action.type === 'play_counter') {
      if (this.action.cardIndex === undefined) return false;
      const card = player.hand[this.action.cardIndex];
      if (!card) return false;
      if (player.mana < card.cost) return false;
    }

    if (this.action.type === 'write_book') {
      if (this.action.cardIndex === undefined) return false;
      const card = player.hand[this.action.cardIndex];
      if (!card) return false;
    }

    return true;
  }

  execute(game: GameState): CommandResult {
    if (!this.validate(game)) {
      return { success: false, error: '无效的明辩操作' };
    }

    const command: GameCommand = {
      id: generateCommandId(),
      type: this.getCommandType(),
      playerId: this.playerId,
      timestamp: Date.now(),
      data: this.getCommandData(),
    };

    return {
      success: true,
      game: game,
      command,
    };
  }
}

export class SecretActionCommand extends GameCommandBase {
  private playerId: PlayerId;
  private action: SecretAction;

  constructor(playerId: PlayerId, action: SecretAction) {
    super();
    this.playerId = playerId;
    this.action = action;
  }

  getCommandType(): CommandType {
    return 'secret_action';
  }

  getCommandData(): CommandData {
    return { secretAction: this.action };
  }

  validate(game: GameState): boolean {
    const player = this.playerId === 'player' ? game.player : game.enemy;

    if (this.action.type === 'pass') {
      return true;
    }

    if (this.action.type === 'play_secret') {
      if (this.action.cardIndex === undefined) return false;
      const card = player.hand[this.action.cardIndex];
      if (!card) return false;
      if (player.mana < card.cost) return false;
    }

    return true;
  }

  execute(game: GameState): CommandResult {
    if (!this.validate(game)) {
      return { success: false, error: '无效的暗谋操作' };
    }

    const command: GameCommand = {
      id: generateCommandId(),
      type: this.getCommandType(),
      playerId: this.playerId,
      timestamp: Date.now(),
      data: this.getCommandData(),
    };

    return {
      success: true,
      game: game,
      command,
    };
  }
}

export class LockDecisionCommand extends GameCommandBase {
  private playerId: PlayerId;

  constructor(playerId: PlayerId) {
    super();
    this.playerId = playerId;
  }

  getCommandType(): CommandType {
    return 'lock_decision';
  }

  getCommandData(): CommandData {
    return {};
  }

  validate(_game: GameState): boolean {
    return true;
  }

  execute(game: GameState): CommandResult {
    const command: GameCommand = {
      id: generateCommandId(),
      type: this.getCommandType(),
      playerId: this.playerId,
      timestamp: Date.now(),
      data: this.getCommandData(),
    };

    return {
      success: true,
      game: game,
      command,
    };
  }
}

export class CommandProcessor {
  private commandHistory: GameCommand[] = [];
  private phaseManager: PhaseManager;
  private settlementEngine: SettlementEngine | null = null;

  constructor(phaseManager: PhaseManager) {
    this.phaseManager = phaseManager;
  }

  processCommand(game: GameState, command: GameCommandBase): CommandResult {
    const result = command.execute(game);

    if (result.success && result.command) {
      this.commandHistory.push(result.command);
    }

    return result;
  }

  getCommandHistory(): GameCommand[] {
    return [...this.commandHistory];
  }

  replayCommands(initialGame: GameState, commands: GameCommand[]): GameState {
    let game = JSON.parse(JSON.stringify(initialGame)) as GameState;

    for (const cmd of commands) {
      game = this.applyCommand(game, cmd);
    }

    return game;
  }

  private applyCommand(game: GameState, command: GameCommand): GameState {
    const newGame = JSON.parse(JSON.stringify(game)) as GameState;
    const player = command.playerId === 'player' ? newGame.player : newGame.enemy;

    if (command.type === 'debate_action' && command.data.debateAction) {
      const action = command.data.debateAction;
      
      if (action.type === 'play_main' && action.cardIndex !== undefined) {
        const card = player.hand[action.cardIndex];
        if (card) {
          player.mana -= card.cost;
          player.hand.splice(action.cardIndex, 1);
        }
      } else if (action.type === 'play_counter' && action.cardIndex !== undefined) {
        const card = player.hand[action.cardIndex];
        if (card) {
          player.mana -= card.cost;
          player.hand.splice(action.cardIndex, 1);
        }
      } else if (action.type === 'write_book' && action.cardIndex !== undefined) {
        const card = player.hand[action.cardIndex];
        if (card) {
          player.hand.splice(action.cardIndex, 1);
          player.bookArea.push(card);
          player.maxMana = Math.min(10, player.maxMana + 1);
        }
      }
    }

    if (command.type === 'secret_action' && command.data.secretAction) {
      const action = command.data.secretAction;
      
      if (action.type === 'play_secret' && action.cardIndex !== undefined) {
        const card = player.hand[action.cardIndex];
        if (card) {
          player.mana -= card.cost;
          player.hand.splice(action.cardIndex, 1);
        }
      }
    }

    return newGame;
  }

  executeSettlement(game: GameState): GameState {
    const playerDebate = this.phaseManager.getDebateAction('player');
    const enemyDebate = this.phaseManager.getDebateAction('enemy');
    const playerSecret = this.phaseManager.getRevealedSecret('player');
    const enemySecret = this.phaseManager.getRevealedSecret('enemy');

    const queue = generateSettlementQueue(playerDebate, enemyDebate, playerSecret, enemySecret);

    this.settlementEngine = createSettlementEngine(game);
    return this.settlementEngine.executeAllLayers(queue);
  }

  getSettlementLog(): string | null {
    return this.settlementEngine?.exportLog() || null;
  }

  exportState(): string {
    return JSON.stringify({
      commandHistory: this.commandHistory,
      settlementLog: this.settlementEngine?.exportLog(),
    });
  }

  clearHistory(): void {
    this.commandHistory = [];
    this.settlementEngine = null;
  }
}

export function createCommandProcessor(phaseManager: PhaseManager): CommandProcessor {
  return new CommandProcessor(phaseManager);
}
