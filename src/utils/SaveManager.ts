/**
 * 统一存档管理器
 *
 * 功能：
 * - 本地存档槽位管理
 * - 自动存档（带防抖）
 * - 云同步架构（预留）
 */

import type { PlayerProgressState } from './persistence';
import type { StorySaveData } from '@/game/story/types';

// 存档槽位类型
export type SaveSlotType = 'autosave' | 'manual_1' | 'manual_2' | 'manual_3';

// 存档操作结果
export interface SaveResult {
  success: boolean;
  error?: 'DEBOUNCED' | 'STORAGE_FULL' | 'WRITE_FAILED' | 'UNKNOWN';
  reason?: string;
  message?: string;
}

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
const DEFAULT_MIN_INTERVAL = 5000; // 5秒最小存档间隔

class SaveManager {
  private static instance: SaveManager;
  private autoSaveInterval: ReturnType<typeof setInterval> | null = null;
  private playTimeStart: number = Date.now();

  // 存档锁（防抖机制）
  private saveLock = {
    lastNodeId: '',
    lastTimestamp: 0,
    minInterval: DEFAULT_MIN_INTERVAL,
    locked: false,
  };

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

  // === 自动存档（带防抖）===

  enableAutoSave(intervalMs: number = 30000, getState: () => { data: UnifiedSaveData; nodeId: string } | null): void {
    this.disableAutoSave();
    this.autoSaveInterval = setInterval(() => {
      const state = getState();
      if (state) {
        this.smartSave('autosave', state.data, state.nodeId, false);
      }
    }, intervalMs);
  }

  disableAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  // === 智能存档（带防抖）===

  /**
   * 智能存档 - 带防抖机制
   * @param slot 存档槽位
   * @param data 存档数据
   * @param currentNodeId 当前节点ID（用于防抖判断）
   * @param force 是否强制存档（绕过防抖）
   */
  smartSave(
    slot: SaveSlotType,
    data: UnifiedSaveData,
    currentNodeId: string,
    force: boolean = false
  ): SaveResult {
    // 强制存档绕过防抖
    if (force) {
      return this.doSave(slot, data, currentNodeId);
    }

    // 防抖检查
    const now = Date.now();
    const sameNode = currentNodeId === this.saveLock.lastNodeId;
    const tooSoon = now - this.saveLock.lastTimestamp < this.saveLock.minInterval;

    if (sameNode && tooSoon) {
      console.log('[SaveManager] 存档被防抖拦截：同节点间隔过短');
      return { success: false, error: 'DEBOUNCED', reason: '同节点间隔过短' };
    }

    if (tooSoon) {
      console.log('[SaveManager] 存档被防抖拦截：间隔过短');
      return { success: false, error: 'DEBOUNCED', reason: '间隔过短' };
    }

    return this.doSave(slot, data, currentNodeId);
  }

  /**
   * 执行存档写入
   */
  private doSave(
    slot: SaveSlotType,
    data: UnifiedSaveData,
    currentNodeId: string
  ): SaveResult {
    this.saveLock.locked = true;

    try {
      // 容量检测
      const estimatedSize = JSON.stringify(data).length;
      const available = this.checkStorageAvailable();
      if (estimatedSize > available) {
        console.warn('[SaveManager] 存储空间不足');
        return { success: false, error: 'STORAGE_FULL', message: '存储空间不足，请清理浏览器缓存' };
      }

      // 写入
      const key = this.getSlotKey(slot);
      localStorage.setItem(key, JSON.stringify(data));

      // 更新锁状态
      this.saveLock.lastNodeId = currentNodeId;
      this.saveLock.lastTimestamp = Date.now();

      console.log(`[SaveManager] 存档成功: ${slot} @ ${currentNodeId}`);

      // 延迟解锁（500ms）
      setTimeout(() => {
        this.saveLock.locked = false;
      }, 500);

      return { success: true };
    } catch (e) {
      console.error('[SaveManager] 存档写入失败:', e);
      this.saveLock.locked = false;
      return { success: false, error: 'WRITE_FAILED', message: String(e) };
    }
  }

  /**
   * 检测 localStorage 剩余空间
   * localStorage 通常上限 5MB
   */
  private checkStorageAvailable(): number {
    const used = Object.keys(localStorage)
      .filter(k => k.startsWith(SAVE_KEY_PREFIX))
      .reduce((sum, k) => sum + (localStorage.getItem(k)?.length || 0), 0);
    return 5 * 1024 * 1024 - used; // 5MB - 已用
  }

  /**
   * 设置最小存档间隔
   */
  setMinInterval(ms: number): void {
    this.saveLock.minInterval = Math.max(1000, ms); // 最少1秒
  }

  /**
   * 获取存档锁状态（用于调试）
   */
  getLockStatus(): { locked: boolean; lastNodeId: string; lastTimestamp: number; minInterval: number } {
    return {
      locked: this.saveLock.locked,
      lastNodeId: this.saveLock.lastNodeId,
      lastTimestamp: this.saveLock.lastTimestamp,
      minInterval: this.saveLock.minInterval,
    };
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