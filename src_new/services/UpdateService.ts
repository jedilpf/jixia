export type UpdateStatus = "idle" | "checking" | "available" | "downloading" | "ready" | "error";

export interface VersionInfo {
  version: string;
  buildNumber: number;
  releaseDate: number;
  releaseNotes: string;
  downloadUrl: string;
  size: number;
  checksum: string;
  isMandatory: boolean;
  minVersion: string;
}

export interface UpdateProgress {
  downloaded: number;
  total: number;
  percentage: number;
  speed: number; // bytes per second
}

export interface UpdateConfig {
  checkInterval: number;
  autoDownload: boolean;
  silentCheck: boolean;
}

export const DEFAULT_UPDATE_CONFIG: UpdateConfig = {
  checkInterval: 3600000, // 1 hour
  autoDownload: false,
  silentCheck: true,
};

export class UpdateService {
  private static readonly CURRENT_VERSION_KEY = "jixia_current_version";
  private static readonly LAST_CHECK_KEY = "jixia_last_update_check";
  private static readonly UPDATE_CONFIG_KEY = "jixia_update_config";

  private status: UpdateStatus = "idle";
  private currentVersion: string = "1.0.0";
  private latestVersion: VersionInfo | null = null;
  private progress: UpdateProgress | null = null;
  private config: UpdateConfig = { ...DEFAULT_UPDATE_CONFIG };
  private checkTimer: number | null = null;
  private observers: Set<(event: UpdateEvent) => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const version = localStorage.getItem(UpdateService.CURRENT_VERSION_KEY);
      if (version) {
        this.currentVersion = version;
      }

      const config = localStorage.getItem(UpdateService.UPDATE_CONFIG_KEY);
      if (config) {
        this.config = { ...this.config, ...JSON.parse(config) };
      }
    } catch (e) {
      console.warn("Failed to load update config from storage");
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(UpdateService.CURRENT_VERSION_KEY, this.currentVersion);
      localStorage.setItem(UpdateService.UPDATE_CONFIG_KEY, JSON.stringify(this.config));
    } catch (e) {
      console.warn("Failed to save update config to storage");
    }
  }

  async checkForUpdate(): Promise<{ hasUpdate: boolean; version?: VersionInfo }> {
    if (this.status === "checking") {
      return { hasUpdate: false };
    }

    this.status = "checking";
    this.notifyObservers({ type: "checking", data: null });

    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 模拟返回新版本
      const mockVersion: VersionInfo = {
        version: "1.1.0",
        buildNumber: 110,
        releaseDate: Date.now(),
        releaseNotes: "- 新增同步对战模式\n- 优化游戏性能\n- 修复已知bug",
        downloadUrl: "https://cdn.jixia.game/updates/v1.1.0.zip",
        size: 1024 * 1024 * 50, // 50MB
        checksum: "abc123def456",
        isMandatory: false,
        minVersion: "1.0.0",
      };

      localStorage.setItem(UpdateService.LAST_CHECK_KEY, Date.now().toString());

      if (this.compareVersions(mockVersion.version, this.currentVersion) > 0) {
        this.latestVersion = mockVersion;
        this.status = "available";
        this.notifyObservers({ type: "update_available", data: mockVersion });

        if (this.config.autoDownload) {
          this.downloadUpdate();
        }

        return { hasUpdate: true, version: mockVersion };
      }

      this.status = "idle";
      this.notifyObservers({ type: "no_update", data: null });
      return { hasUpdate: false };
    } catch (e) {
      this.status = "error";
      this.notifyObservers({ type: "error", data: e });
      return { hasUpdate: false };
    }
  }

  async downloadUpdate(): Promise<boolean> {
    if (!this.latestVersion || this.status === "downloading") {
      return false;
    }

    this.status = "downloading";
    this.progress = { downloaded: 0, total: this.latestVersion.size, percentage: 0, speed: 0 };
    this.notifyObservers({ type: "download_started", data: this.progress });

    try {
      // 模拟下载过程
      const chunkSize = 1024 * 1024; // 1MB chunks
      const totalChunks = Math.ceil(this.latestVersion.size / chunkSize);

      for (let i = 0; i < totalChunks; i++) {
        await new Promise((resolve) => setTimeout(resolve, 100));

        this.progress!.downloaded = Math.min((i + 1) * chunkSize, this.latestVersion.size);
        this.progress!.percentage = Math.round(
          (this.progress!.downloaded / this.latestVersion.size) * 100
        );
        this.progress!.speed = chunkSize * 10; // 10MB/s

        this.notifyObservers({ type: "download_progress", data: this.progress });
      }

      this.status = "ready";
      this.notifyObservers({ type: "download_complete", data: this.latestVersion });

      return true;
    } catch (e) {
      this.status = "error";
      this.notifyObservers({ type: "error", data: e });
      return false;
    }
  }

  async installUpdate(): Promise<boolean> {
    if (this.status !== "ready" || !this.latestVersion) {
      return false;
    }

    try {
      // 模拟安装过程
      await new Promise((resolve) => setTimeout(resolve, 2000));

      this.currentVersion = this.latestVersion.version;
      this.saveToStorage();

      this.status = "idle";
      this.latestVersion = null;
      this.progress = null;

      this.notifyObservers({ type: "install_complete", data: { version: this.currentVersion } });

      return true;
    } catch (e) {
      this.status = "error";
      this.notifyObservers({ type: "error", data: e });
      return false;
    }
  }

  startAutoCheck(): void {
    this.stopAutoCheck();
    this.checkTimer = window.setInterval(() => {
      this.checkForUpdate();
    }, this.config.checkInterval);
  }

  stopAutoCheck(): void {
    if (this.checkTimer !== null) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }
  }

  getStatus(): UpdateStatus {
    return this.status;
  }

  getCurrentVersion(): string {
    return this.currentVersion;
  }

  getLatestVersion(): VersionInfo | null {
    return this.latestVersion;
  }

  getProgress(): UpdateProgress | null {
    return this.progress;
  }

  getConfig(): UpdateConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<UpdateConfig>): void {
    this.config = { ...this.config, ...config };
    this.saveToStorage();

    if (this.checkTimer) {
      this.startAutoCheck();
    }
  }

  getLastCheckTime(): number | null {
    const time = localStorage.getItem(UpdateService.LAST_CHECK_KEY);
    return time ? parseInt(time, 10) : null;
  }

  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split(".").map(Number);
    const parts2 = v2.split(".").map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;
      if (p1 < p2) return -1;
      if (p1 > p2) return 1;
    }
    return 0;
  }

  subscribe(callback: (event: UpdateEvent) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private notifyObservers(event: UpdateEvent): void {
    this.observers.forEach((callback) => callback(event));
  }

  destroy(): void {
    this.stopAutoCheck();
    this.observers.clear();
  }
}

export interface UpdateEvent {
  type:
    | "checking"
    | "update_available"
    | "no_update"
    | "download_started"
    | "download_progress"
    | "download_complete"
    | "install_complete"
    | "error";
  data: unknown;
}

export const updateService = new UpdateService();
