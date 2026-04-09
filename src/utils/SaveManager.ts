/**
 * 统一存档管理器
 *
 * 功能：
 * - 本地存档槽位管理
 * - 自动存档
 * - 云同步架构（预留）
 */

import type { PlayerProgressState } from './persistence';
import type { StorySaveData } from '@/game/story/types';

// 存档槽位类型
export type SaveSlotType = 'autosave' | 'manual_1' | 'manual_2' | 'manual_3';

// 存档元数据
export interface SaveMetadata {
  chapter: number;
  currentNodeId: string;
  playTimeMs: number;
  screenshot?: string;
}

// 统一存档数据结构
export interface UnifiedSaveData {
  version: string;
  timestamp: number;
  playerProgress: PlayerProgressState;
  storyData: StorySaveData | null;
  settings: {
    masterVolume: number;
    bgmVolume: number;
    sfxVolume: number;
    brightness: number;
    fullscreen: boolean;
  };
  metadata: SaveMetadata;
}

// 存档槽位信息
export interface SaveSlotInfo {
  id: SaveSlotType;
  exists: boolean;
  timestamp?: number;
  chapter?: number;
  currentNodeId?: string;
  playTime?: number;
  nodeCount?: number;
}

const SAVE_KEY_PREFIX = 'jixia.mvp.save.';

class SaveManager {
  private static instance: SaveManager;
  private autoSaveInterval: ReturnType<typeof setInterval> | null = null;
  private playTimeStart: number = Date.now();

  static getInstance(): SaveManager {
    if (!SaveManager.instance) {
      SaveManager.instance = new SaveManager();
    }
    return SaveManager.instance;
  }

  // === 本地存储操作 ===

  private getSlotKey(slot: SaveSlotType): string {
    return `${SAVE_KEY_PREFIX}${slot}`;
  }

  saveToSlot(slot: SaveSlotType, data: UnifiedSaveData): boolean {
    try {
      const key = this.getSlotKey(slot);
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`[SaveManager] 存档成功: ${slot}`);
      return true;
    } catch (err) {
      console.error('[SaveManager] 存档失败:', err);
      return false;
    }
  }

  loadFromSlot(slot: SaveSlotType): UnifiedSaveData | null {
    try {
      const key = this.getSlotKey(slot);
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as UnifiedSaveData;
    } catch (err) {
      console.error('[SaveManager] 读档失败:', err);
      return null;
    }
  }

  deleteSlot(slot: SaveSlotType): boolean {
    try {
      localStorage.removeItem(this.getSlotKey(slot));
      return true;
    } catch {
      return false;
    }
  }

  getSlotInfo(slot: SaveSlotType): SaveSlotInfo {
    const data = this.loadFromSlot(slot);
    if (!data) {
      return { id: slot, exists: false };
    }
    return {
      id: slot,
      exists: true,
      timestamp: data.timestamp,
      chapter: data.metadata.chapter,
      currentNodeId: data.metadata.currentNodeId,
      playTime: data.metadata.playTimeMs,
      nodeCount: data.storyData?.progress.completedNodes.length ?? 0,
    };
  }

  getAllSlotInfos(): Record<SaveSlotType, SaveSlotInfo> {
    const slots: SaveSlotType[] = ['autosave', 'manual_1', 'manual_2', 'manual_3'];
    return slots.reduce((acc, slot) => {
      acc[slot] = this.getSlotInfo(slot);
      return acc;
    }, {} as Record<SaveSlotType, SaveSlotInfo>);
  }

  // === 自动存档 ===

  enableAutoSave(intervalMs: number = 30000, getState: () => UnifiedSaveData | null): void {
    this.disableAutoSave();
    this.autoSaveInterval = setInterval(() => {
      const data = getState();
      if (data) {
        this.saveToSlot('autosave', data);
      }
    }, intervalMs);
  }

  disableAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  // === 游戏时间追踪 ===

  getPlayTimeMs(): number {
    return Date.now() - this.playTimeStart;
  }

  resetPlayTime(): void {
    this.playTimeStart = Date.now();
  }

  // === 云同步架构（预留）===

  async syncToCloud(_userId: string): Promise<boolean> {
    // TODO: 实现云同步
    console.warn('[SaveManager] 云同步功能尚未实现');
    return false;
  }

  async syncFromCloud(_userId: string): Promise<boolean> {
    // TODO: 实现云恢复
    console.warn('[SaveManager] 云同步功能尚未实现');
    return false;
  }
}

export const saveManager = SaveManager.getInstance();