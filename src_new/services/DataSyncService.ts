export type SyncStatus = "idle" | "syncing" | "error" | "offline";

export type SyncPriority = "high" | "normal" | "low";

export interface SyncItem {
  id: string;
  key: string;
  data: unknown;
  timestamp: number;
  priority: SyncPriority;
  retryCount: number;
  lastError?: string;
}

export interface SyncResult {
  success: boolean;
  syncedItems: number;
  failedItems: number;
  errors: string[];
}

export interface SyncConfig {
  autoSync: boolean;
  syncInterval: number;
  retryAttempts: number;
  retryDelay: number;
  batchSize: number;
  conflictResolution: "server" | "client" | "timestamp";
}

export const DEFAULT_SYNC_CONFIG: SyncConfig = {
  autoSync: true,
  syncInterval: 30000,
  retryAttempts: 3,
  retryDelay: 5000,
  batchSize: 50,
  conflictResolution: "timestamp",
};

export class DataSyncService {
  private static readonly SYNC_QUEUE_KEY = "jixia_sync_queue";
  private static readonly LAST_SYNC_KEY = "jixia_last_sync";
  private static readonly SYNC_VERSION_KEY = "jixia_sync_version";

  private queue: Map<string, SyncItem> = new Map();
  private status: SyncStatus = "idle";
  private config: SyncConfig = { ...DEFAULT_SYNC_CONFIG };
  private syncTimer: number | null = null;
  private observers: Set<(event: SyncEvent) => void> = new Set();
  private dataVersion: number = 0;

  constructor(config?: Partial<SyncConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    this.loadFromStorage();
    if (this.config.autoSync) {
      this.startAutoSync();
    }
  }

  private loadFromStorage(): void {
    try {
      const queueData = localStorage.getItem(DataSyncService.SYNC_QUEUE_KEY);
      if (queueData) {
        const items = JSON.parse(queueData);
        this.queue = new Map(Object.entries(items));
      }

      const versionData = localStorage.getItem(DataSyncService.SYNC_VERSION_KEY);
      if (versionData) {
        this.dataVersion = parseInt(versionData, 10);
      }
    } catch (e) {
      console.warn("Failed to load sync queue from storage");
    }
  }

  private saveToStorage(): void {
    try {
      const items = Object.fromEntries(this.queue);
      localStorage.setItem(DataSyncService.SYNC_QUEUE_KEY, JSON.stringify(items));
      localStorage.setItem(DataSyncService.SYNC_VERSION_KEY, this.dataVersion.toString());
    } catch (e) {
      console.warn("Failed to save sync queue to storage");
    }
  }

  // 添加同步项
  queueSync(key: string, data: unknown, priority: SyncPriority = "normal"): void {
    const existing = this.queue.get(key);
    
    const item: SyncItem = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      key,
      data,
      timestamp: Date.now(),
      priority,
      retryCount: existing ? existing.retryCount : 0,
    };

    this.queue.set(key, item);
    this.dataVersion++;
    this.saveToStorage();

    this.notifyObservers({
      type: "item_queued",
      data: { key, priority },
    });

    // 高优先级立即同步
    if (priority === "high") {
      this.sync();
    }
  }

  // 批量添加同步项
  queueMultiple(items: Array<{ key: string; data: unknown; priority?: SyncPriority }>): void {
    for (const item of items) {
      this.queueSync(item.key, item.data, item.priority || "normal");
    }
  }

  // 执行同步
  async sync(): Promise<SyncResult> {
    if (this.status === "syncing") {
      return {
        success: false,
        syncedItems: 0,
        failedItems: 0,
        errors: ["Sync already in progress"],
      };
    }

    if (this.queue.size === 0) {
      return {
        success: true,
        syncedItems: 0,
        failedItems: 0,
        errors: [],
      };
    }

    // 检查网络状态
    if (!navigator.onLine) {
      this.status = "offline";
      return {
        success: false,
        syncedItems: 0,
        failedItems: this.queue.size,
        errors: ["Device is offline"],
      };
    }

    this.status = "syncing";
    this.notifyObservers({ type: "sync_started", data: null });

    const result: SyncResult = {
      success: true,
      syncedItems: 0,
      failedItems: 0,
      errors: [],
    };

    // 按优先级排序
    const sortedItems = Array.from(this.queue.values()).sort((a, b) => {
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // 批量处理
    for (let i = 0; i < sortedItems.length; i += this.config.batchSize) {
      const batch = sortedItems.slice(i, i + this.config.batchSize);
      
      try {
        await this.syncBatch(batch, result);
      } catch (e) {
        result.success = false;
        result.errors.push(`Batch ${i / this.config.batchSize + 1} failed: ${e}`);
      }
    }

    this.status = result.success ? "idle" : "error";
    
    if (result.success) {
      localStorage.setItem(DataSyncService.LAST_SYNC_KEY, Date.now().toString());
    }

    this.notifyObservers({
      type: result.success ? "sync_completed" : "sync_failed",
      data: result,
    });

    return result;
  }

  private async syncBatch(batch: SyncItem[], result: SyncResult): Promise<void> {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 500));

    for (const item of batch) {
      try {
        // 模拟同步操作
        const success = await this.syncItem(item);
        
        if (success) {
          this.queue.delete(item.key);
          result.syncedItems++;
        } else {
          item.retryCount++;
          if (item.retryCount >= this.config.retryAttempts) {
            item.lastError = "Max retry attempts reached";
            result.failedItems++;
            result.errors.push(`Failed to sync ${item.key}: ${item.lastError}`);
          }
        }
      } catch (e) {
        item.retryCount++;
        item.lastError = e instanceof Error ? e.message : String(e);
        
        if (item.retryCount >= this.config.retryAttempts) {
          result.failedItems++;
          result.errors.push(`Failed to sync ${item.key}: ${item.lastError}`);
        }
      }
    }

    this.saveToStorage();
  }

  private async syncItem(item: SyncItem): Promise<boolean> {
    // 这里应该调用实际的API
    // 模拟成功率90%
    return Math.random() > 0.1;
  }

  // 启动自动同步
  startAutoSync(): void {
    this.stopAutoSync();
    this.syncTimer = window.setInterval(() => {
      if (this.queue.size > 0 && navigator.onLine) {
        this.sync();
      }
    }, this.config.syncInterval);
  }

  // 停止自动同步
  stopAutoSync(): void {
    if (this.syncTimer !== null) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  // 获取同步状态
  getStatus(): SyncStatus {
    return this.status;
  }

  // 获取队列信息
  getQueueInfo(): {
    total: number;
    highPriority: number;
    normalPriority: number;
    lowPriority: number;
  } {
    const items = Array.from(this.queue.values());
    return {
      total: items.length,
      highPriority: items.filter((i) => i.priority === "high").length,
      normalPriority: items.filter((i) => i.priority === "normal").length,
      lowPriority: items.filter((i) => i.priority === "low").length,
    };
  }

  // 获取最后同步时间
  getLastSyncTime(): number | null {
    const time = localStorage.getItem(DataSyncService.LAST_SYNC_KEY);
    return time ? parseInt(time, 10) : null;
  }

  // 获取数据版本
  getDataVersion(): number {
    return this.dataVersion;
  }

  // 清除队列
  clearQueue(): void {
    this.queue.clear();
    this.saveToStorage();
    this.notifyObservers({ type: "queue_cleared", data: null });
  }

  // 移除特定项
  removeFromQueue(key: string): boolean {
    const deleted = this.queue.delete(key);
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }

  // 更新配置
  updateConfig(config: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (this.config.autoSync && !this.syncTimer) {
      this.startAutoSync();
    } else if (!this.config.autoSync && this.syncTimer) {
      this.stopAutoSync();
    }
  }

  // 获取配置
  getConfig(): SyncConfig {
    return { ...this.config };
  }

  // 强制同步特定键
  async forceSyncKey(key: string): Promise<boolean> {
    const item = this.queue.get(key);
    if (!item) return false;

    try {
      const success = await this.syncItem(item);
      if (success) {
        this.queue.delete(key);
        this.saveToStorage();
      }
      return success;
    } catch (e) {
      return false;
    }
  }

  // 处理冲突
  resolveConflict(key: string, serverData: unknown, clientData: unknown): unknown {
    switch (this.config.conflictResolution) {
      case "server":
        return serverData;
      case "client":
        return clientData;
      case "timestamp":
        // 使用时间戳决定
        const serverTime = (serverData as any)?.timestamp || 0;
        const clientTime = (clientData as any)?.timestamp || 0;
        return serverTime > clientTime ? serverData : clientData;
      default:
        return serverData;
    }
  }

  subscribe(callback: (event: SyncEvent) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private notifyObservers(event: SyncEvent): void {
    this.observers.forEach((callback) => callback(event));
  }

  // 销毁
  destroy(): void {
    this.stopAutoSync();
    this.observers.clear();
  }
}

export interface SyncEvent {
  type: "item_queued" | "sync_started" | "sync_completed" | "sync_failed" | "queue_cleared";
  data: unknown;
}

export const dataSyncService = new DataSyncService();
