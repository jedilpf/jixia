/**
 * 战斗回放服务
 *
 * 记录和回放战斗过程，支持暂停、快进、慢放等功能
 */

import type { SyncTurnState, TurnResolution, SyncPhase } from "../types/syncBattle";
import type { Card, PlayerId } from "../types/domain";

export interface ReplayEvent {
  timestamp: number;
  type: "phase_change" | "card_select" | "card_play" | "attack" | "effect" | "turn_end";
  payload: unknown;
}

export interface ReplayData {
  id: string;
  date: number;
  players: {
    player: { id: string; name: string };
    enemy: { id: string; name: string };
  };
  winner: PlayerId;
  duration: number;
  events: ReplayEvent[];
  initialState: SyncTurnState;
  finalState: SyncTurnState;
}

export type ReplaySpeed = 0.5 | 1 | 2 | 4 | 8;

export class ReplayService {
  private currentReplay: ReplayData | null = null;
  private currentEventIndex: number = 0;
  private isPlaying: boolean = false;
  private speed: ReplaySpeed = 1;
  private playbackTimer: NodeJS.Timeout | null = null;
  private onEventCallback: ((event: ReplayEvent) => void) | null = null;
  private onCompleteCallback: (() => void) | null = null;
  private onProgressCallback: ((progress: number) => void) | null = null;

  /**
   * 开始录制
   */
  startRecording(initialState: SyncTurnState, players: ReplayData["players"]): string {
    const replayId = `replay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.currentReplay = {
      id: replayId,
      date: Date.now(),
      players,
      winner: "player",
      duration: 0,
      events: [],
      initialState: JSON.parse(JSON.stringify(initialState)),
      finalState: initialState,
    };

    this.currentEventIndex = 0;
    console.log("[Replay] Started recording:", replayId);

    return replayId;
  }

  /**
   * 记录事件
   */
  recordEvent(type: ReplayEvent["type"], payload: unknown): void {
    if (!this.currentReplay) return;

    const event: ReplayEvent = {
      timestamp: Date.now() - this.currentReplay.date,
      type,
      payload,
    };

    this.currentReplay.events.push(event);
  }

  /**
   * 结束录制
   */
  stopRecording(winner: PlayerId, finalState: SyncTurnState): ReplayData | null {
    if (!this.currentReplay) return null;

    this.currentReplay.winner = winner;
    this.currentReplay.finalState = JSON.parse(JSON.stringify(finalState));
    this.currentReplay.duration = Date.now() - this.currentReplay.date;

    const replay = { ...this.currentReplay };
    this.saveReplay(replay);

    console.log("[Replay] Stopped recording:", replay.id);
    console.log("[Replay] Total events:", replay.events.length);
    console.log("[Replay] Duration:", replay.duration, "ms");

    this.currentReplay = null;
    return replay;
  }

  /**
   * 保存回放到本地存储
   */
  private saveReplay(replay: ReplayData): void {
    try {
      const replays = this.getStoredReplays();
      replays.unshift(replay);

      // 只保留最近20场回放
      if (replays.length > 20) {
        replays.pop();
      }

      localStorage.setItem("jixia_replays", JSON.stringify(replays));
    } catch (error) {
      console.error("[Replay] Failed to save replay:", error);
    }
  }

  /**
   * 获取存储的回放列表
   */
  getStoredReplays(): ReplayData[] {
    try {
      const stored = localStorage.getItem("jixia_replays");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("[Replay] Failed to load replays:", error);
      return [];
    }
  }

  /**
   * 加载回放
   */
  loadReplay(replayId: string): ReplayData | null {
    const replays = this.getStoredReplays();
    const replay = replays.find((r) => r.id === replayId);

    if (replay) {
      this.currentReplay = replay;
      this.currentEventIndex = 0;
      console.log("[Replay] Loaded replay:", replayId);
    }

    return replay || null;
  }

  /**
   * 开始播放回放
   */
  play(): void {
    if (!this.currentReplay || this.isPlaying) return;

    this.isPlaying = true;
    this.playNextEvent();
  }

  /**
   * 暂停播放
   */
  pause(): void {
    this.isPlaying = false;
    if (this.playbackTimer) {
      clearTimeout(this.playbackTimer);
      this.playbackTimer = null;
    }
  }

  /**
   * 停止播放
   */
  stop(): void {
    this.pause();
    this.currentEventIndex = 0;
    this.onProgressCallback?.(0);
  }

  /**
   * 播放下一个事件
   */
  private playNextEvent(): void {
    if (!this.currentReplay || !this.isPlaying) return;

    if (this.currentEventIndex >= this.currentReplay.events.length) {
      this.onCompleteCallback?.();
      this.isPlaying = false;
      return;
    }

    const event = this.currentReplay.events[this.currentEventIndex];
    this.onEventCallback?.(event);

    // 计算下一个事件的延迟
    let delay = 1000; // 默认1秒
    if (this.currentEventIndex < this.currentReplay.events.length - 1) {
      const nextEvent = this.currentReplay.events[this.currentEventIndex + 1];
      delay = (nextEvent.timestamp - event.timestamp) / this.speed;
    }

    // 更新进度
    const progress = (this.currentEventIndex / this.currentReplay.events.length) * 100;
    this.onProgressCallback?.(progress);

    this.currentEventIndex++;

    this.playbackTimer = setTimeout(() => {
      this.playNextEvent();
    }, Math.max(100, delay));
  }

  /**
   * 跳转到指定时间点
   */
  seekTo(timestamp: number): void {
    if (!this.currentReplay) return;

    // 找到最接近的时间点
    let targetIndex = 0;
    for (let i = 0; i < this.currentReplay.events.length; i++) {
      if (this.currentReplay.events[i].timestamp <= timestamp) {
        targetIndex = i;
      } else {
        break;
      }
    }

    this.currentEventIndex = targetIndex;

    // 重新播放
    if (this.isPlaying) {
      this.pause();
      this.play();
    }
  }

  /**
   * 跳转到指定事件索引
   */
  seekToEvent(index: number): void {
    if (!this.currentReplay) return;

    this.currentEventIndex = Math.max(0, Math.min(index, this.currentReplay.events.length - 1));

    if (this.isPlaying) {
      this.pause();
      this.play();
    }
  }

  /**
   * 设置播放速度
   */
  setSpeed(speed: ReplaySpeed): void {
    this.speed = speed;
    console.log("[Replay] Speed set to:", speed + "x");
  }

  /**
   * 获取当前播放速度
   */
  getSpeed(): ReplaySpeed {
    return this.speed;
  }

  /**
   * 获取当前播放状态
   */
  isReplayPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * 获取当前回放数据
   */
  getCurrentReplay(): ReplayData | null {
    return this.currentReplay;
  }

  /**
   * 获取当前事件索引
   */
  getCurrentEventIndex(): number {
    return this.currentEventIndex;
  }

  /**
   * 获取总事件数
   */
  getTotalEvents(): number {
    return this.currentReplay?.events.length || 0;
  }

  /**
   * 删除回放
   */
  deleteReplay(replayId: string): boolean {
    try {
      const replays = this.getStoredReplays();
      const filtered = replays.filter((r) => r.id !== replayId);
      localStorage.setItem("jixia_replays", JSON.stringify(filtered));
      console.log("[Replay] Deleted replay:", replayId);
      return true;
    } catch (error) {
      console.error("[Replay] Failed to delete replay:", error);
      return false;
    }
  }

  /**
   * 清空所有回放
   */
  clearAllReplays(): void {
    try {
      localStorage.removeItem("jixia_replays");
      console.log("[Replay] Cleared all replays");
    } catch (error) {
      console.error("[Replay] Failed to clear replays:", error);
    }
  }

  /**
   * 导出回放为JSON
   */
  exportReplay(replayId: string): string | null {
    const replays = this.getStoredReplays();
    const replay = replays.find((r) => r.id === replayId);

    if (replay) {
      return JSON.stringify(replay, null, 2);
    }

    return null;
  }

  /**
   * 从JSON导入回放
   */
  importReplay(json: string): ReplayData | null {
    try {
      const replay: ReplayData = JSON.parse(json);

      // 验证回放数据
      if (!replay.id || !replay.events || !Array.isArray(replay.events)) {
        throw new Error("Invalid replay data");
      }

      this.saveReplay(replay);
      console.log("[Replay] Imported replay:", replay.id);

      return replay;
    } catch (error) {
      console.error("[Replay] Failed to import replay:", error);
      return null;
    }
  }

  // ==================== 事件监听 ====================

  onEvent(callback: (event: ReplayEvent) => void): void {
    this.onEventCallback = callback;
  }

  onComplete(callback: () => void): void {
    this.onCompleteCallback = callback;
  }

  onProgress(callback: (progress: number) => void): void {
    this.onProgressCallback = callback;
  }
}

// 便捷导出
export const replayService = new ReplayService();
export default replayService;
