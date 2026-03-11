export type AssetType = "image" | "audio" | "json" | "font" | "video" | "blob";

export interface Asset {
  key: string;
  url: string;
  type: AssetType;
  priority?: number;
  cache?: boolean;
}

export interface LoadProgress {
  loaded: number;
  total: number;
  percentage: number;
  currentAsset?: string;
}

export interface AssetLoaderConfig {
  concurrent: number;
  retryCount: number;
  timeout: number;
  basePath: string;
}

export const DEFAULT_ASSET_LOADER_CONFIG: AssetLoaderConfig = {
  concurrent: 6,
  retryCount: 3,
  timeout: 30000,
  basePath: "",
};

export class AssetLoaderService {
  private cache: Map<string, unknown> = new Map();
  private config: AssetLoaderConfig;
  private loading: Map<string, Promise<unknown>> = new Map();
  private observers: Set<(progress: LoadProgress) => void> = new Set();

  constructor(config?: Partial<AssetLoaderConfig>) {
    this.config = { ...DEFAULT_ASSET_LOADER_CONFIG, ...config };
  }

  async load(assets: Asset[], onProgress?: (progress: LoadProgress) => void): Promise<Map<string, unknown>> {
    const results = new Map<string, unknown>();
    const total = assets.length;
    let loaded = 0;

    const updateProgress = (currentAsset?: string) => {
      const progress: LoadProgress = {
        loaded,
        total,
        percentage: Math.round((loaded / total) * 100),
        currentAsset,
      };
      this.notifyObservers(progress);
      onProgress?.(progress);
    };

    // Sort by priority
    const sortedAssets = [...assets].sort((a, b) => (b.priority || 0) - (a.priority || 0));

    // Process in batches
    for (let i = 0; i < sortedAssets.length; i += this.config.concurrent) {
      const batch = sortedAssets.slice(i, i + this.config.concurrent);
      const batchPromises = batch.map(async (asset) => {
        try {
          const result = await this.loadSingle(asset);
          results.set(asset.key, result);
          loaded++;
          updateProgress(asset.key);
        } catch (error) {
          console.error(`Failed to load asset: ${asset.key}`, error);
          loaded++;
          updateProgress(asset.key);
        }
      });

      await Promise.all(batchPromises);
    }

    return results;
  }

  private async loadSingle(asset: Asset): Promise<unknown> {
    // Check cache first
    if (asset.cache && this.cache.has(asset.key)) {
      return this.cache.get(asset.key);
    }

    // Check if already loading
    if (this.loading.has(asset.key)) {
      return this.loading.get(asset.key);
    }

    const loadPromise = this.loadWithRetry(asset);
    this.loading.set(asset.key, loadPromise);

    try {
      const result = await loadPromise;
      if (asset.cache) {
        this.cache.set(asset.key, result);
      }
      return result;
    } finally {
      this.loading.delete(asset.key);
    }
  }

  private async loadWithRetry(asset: Asset, attempt = 0): Promise<unknown> {
    try {
      return await this.loadByType(asset);
    } catch (error) {
      if (attempt < this.config.retryCount) {
        await this.delay(1000 * (attempt + 1));
        return this.loadWithRetry(asset, attempt + 1);
      }
      throw error;
    }
  }

  private loadByType(asset: Asset): Promise<unknown> {
    const url = this.config.basePath + asset.url;

    switch (asset.type) {
      case "image":
        return this.loadImage(url);
      case "audio":
        return this.loadAudio(url);
      case "json":
        return this.loadJSON(url);
      case "font":
        return this.loadFont(asset.key, url);
      case "video":
        return this.loadVideo(url);
      case "blob":
        return this.loadBlob(url);
      default:
        throw new Error(`Unknown asset type: ${asset.type}`);
    }
  }

  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  private loadAudio(url: string): Promise<HTMLAudioElement> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.oncanplaythrough = () => resolve(audio);
      audio.onerror = reject;
      audio.src = url;
    });
  }

  private async loadJSON(url: string): Promise<unknown> {
    const response = await fetch(url);
    return response.json();
  }

  private loadFont(name: string, url: string): Promise<void> {
    const font = new FontFace(name, `url(${url})`);
    return font.load().then(() => {
      document.fonts.add(font);
    });
  }

  private loadVideo(url: string): Promise<HTMLVideoElement> {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.oncanplaythrough = () => resolve(video);
      video.onerror = reject;
      video.src = url;
    });
  }

  private async loadBlob(url: string): Promise<Blob> {
    const response = await fetch(url);
    return response.blob();
  }

  get(key: string): unknown {
    return this.cache.get(key);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  remove(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  subscribe(callback: (progress: LoadProgress) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private notifyObservers(progress: LoadProgress): void {
    this.observers.forEach((callback) => callback(progress));
  }
}

export const assetLoader = new AssetLoaderService();
