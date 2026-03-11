/**
 * 网络同步服务
 *
 * 处理同步回合制的网络通信，包括状态同步、断线重连等
 */

import type {
  SyncMessage,
  SyncMessageType,
  TimeSyncPacket,
  SyncTurnState,
} from "../types/syncBattle";
import type { PlayerId } from "../types/domain";

type ConnectionState = "connected" | "disconnected" | "reconnecting";

interface NetworkConfig {
  serverUrl: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
}

const DEFAULT_NETWORK_CONFIG: NetworkConfig = {
  serverUrl: "ws://localhost:8080",
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
  heartbeatInterval: 5000,
};

export class NetworkSyncService {
  private ws: WebSocket | null = null;
  private config: NetworkConfig;
  private playerId: PlayerId;
  private connectionState: ConnectionState = "disconnected";
  private reconnectAttempts = 0;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private messageQueue: SyncMessage[] = [];

  // 回调函数
  private onStateUpdate: ((state: SyncTurnState) => void) | null = null;
  private onMessage: ((message: SyncMessage) => void) | null = null;
  private onConnect: (() => void) | null = null;
  private onDisconnect: ((reason: string) => void) | null = null;
  private onReconnecting: ((attempt: number) => void) | null = null;

  constructor(playerId: PlayerId, config: Partial<NetworkConfig> = {}) {
    this.playerId = playerId;
    this.config = { ...DEFAULT_NETWORK_CONFIG, ...config };
  }

  /**
   * 连接到服务器
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.serverUrl);

        this.ws.onopen = () => {
          console.log("[Network] Connected to server");
          this.connectionState = "connected";
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.flushMessageQueue();
          this.onConnect?.();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onclose = (event) => {
          console.log("[Network] Connection closed:", event.reason);
          this.handleDisconnect(event.reason);
        };

        this.ws.onerror = (error) => {
          console.error("[Network] WebSocket error:", error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connectionState = "disconnected";
  }

  /**
   * 发送消息
   */
  sendMessage(type: SyncMessageType, payload: unknown): void {
    const message: SyncMessage = {
      type,
      timestamp: Date.now(),
      playerId: this.playerId,
      payload,
    };

    if (this.connectionState === "connected" && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // 离线时加入队列
      this.messageQueue.push(message);
    }
  }

  /**
   * 发送时间同步请求
   */
  sendTimeSync(): void {
    const packet: Omit<TimeSyncPacket, "serverReceiveTime" | "serverSendTime"> = {
      clientSendTime: Date.now(),
      clientReceiveTime: 0,
    };

    this.sendMessage("SYNC_TIME", packet);
  }

  /**
   * 处理收到的消息
   */
  private handleMessage(data: string): void {
    try {
      const message: SyncMessage = JSON.parse(data);

      // 处理时间同步响应
      if (message.type === "SYNC_TIME") {
        this.handleTimeSyncResponse(message.payload as TimeSyncPacket);
        return;
      }

      // 处理状态更新
      if (message.type === "STATE_UPDATE") {
        const state = message.payload as SyncTurnState;
        this.onStateUpdate?.(state);
        return;
      }

      // 通知消息处理器
      this.onMessage?.(message);
    } catch (error) {
      console.error("[Network] Failed to parse message:", error);
    }
  }

  /**
   * 处理时间同步响应
   */
  private handleTimeSyncResponse(packet: TimeSyncPacket): void {
    const now = Date.now();
    const latency = (now - packet.clientSendTime) / 2;
    const offset = packet.serverReceiveTime - packet.clientSendTime - latency;

    console.log("[Network] Time sync - Latency:", latency, "Offset:", offset);
  }

  /**
   * 处理断开连接
   */
  private handleDisconnect(reason: string): void {
    this.stopHeartbeat();
    this.connectionState = "disconnected";
    this.onDisconnect?.(reason);

    // 尝试重连
    if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.attemptReconnect();
    }
  }

  /**
   * 尝试重连
   */
  private attemptReconnect(): void {
    this.reconnectAttempts++;
    this.connectionState = "reconnecting";
    this.onReconnecting?.(this.reconnectAttempts);

    console.log(
      `[Network] Reconnecting... Attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts}`
    );

    setTimeout(() => {
      this.connect().catch(() => {
        // 重连失败会继续尝试
      });
    }, this.config.reconnectInterval);
  }

  /**
   * 启动心跳
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      this.sendMessage("HEARTBEAT", { timestamp: Date.now() });
    }, this.config.heartbeatInterval);
  }

  /**
   * 停止心跳
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * 刷新消息队列
   */
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.ws?.send(JSON.stringify(message));
      }
    }
  }

  /**
   * 请求完整状态（用于断线重连）
   */
  requestFullState(): void {
    this.sendMessage("REQUEST_STATE", {});
  }

  // ==================== 事件监听 ====================

  onStateUpdateCallback(callback: (state: SyncTurnState) => void): void {
    this.onStateUpdate = callback;
  }

  onMessageCallback(callback: (message: SyncMessage) => void): void {
    this.onMessage = callback;
  }

  onConnectCallback(callback: () => void): void {
    this.onConnect = callback;
  }

  onDisconnectCallback(callback: (reason: string) => void): void {
    this.onDisconnect = callback;
  }

  onReconnectingCallback(callback: (attempt: number) => void): void {
    this.onReconnecting = callback;
  }

  // ==================== 状态查询 ====================

  isConnected(): boolean {
    return this.connectionState === "connected";
  }

  isReconnecting(): boolean {
    return this.connectionState === "reconnecting";
  }

  getConnectionState(): ConnectionState {
    return this.connectionState;
  }
}

export default NetworkSyncService;
