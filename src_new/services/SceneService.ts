export type SceneTransition = "fade" | "slide" | "scale" | "none";

export interface Scene {
  id: string;
  name: string;
  component: React.ComponentType<any>;
  params?: Record<string, unknown>;
  keepAlive?: boolean;
}

export interface SceneStackItem {
  scene: Scene;
  enteredAt: number;
  isActive: boolean;
}

export interface SceneTransitionConfig {
  type: SceneTransition;
  duration: number;
  easing?: string;
}

export const DEFAULT_TRANSITION: SceneTransitionConfig = {
  type: "fade",
  duration: 300,
  easing: "ease-in-out",
};

export class SceneService {
  private scenes: Map<string, Scene> = new Map();
  private stack: SceneStackItem[] = [];
  private currentTransition: SceneTransitionConfig = DEFAULT_TRANSITION;
  private observers: Set<(event: SceneEvent) => void> = new Set();

  register(scene: Scene): void {
    this.scenes.set(scene.id, scene);
  }

  unregister(sceneId: string): boolean {
    return this.scenes.delete(sceneId);
  }

  async push(
    sceneId: string,
    params?: Record<string, unknown>,
    transition?: SceneTransitionConfig
  ): Promise<boolean> {
    const scene = this.scenes.get(sceneId);
    if (!scene) {
      console.warn(`Scene not found: ${sceneId}`);
      return false;
    }

    // Deactivate current scene
    if (this.stack.length > 0) {
      this.stack[this.stack.length - 1].isActive = false;
    }

    // Create new scene instance
    const sceneInstance: Scene = {
      ...scene,
      params: { ...scene.params, ...params },
    };

    const stackItem: SceneStackItem = {
      scene: sceneInstance,
      enteredAt: Date.now(),
      isActive: true,
    };

    this.stack.push(stackItem);

    this.notifyObservers({
      type: "push",
      from: this.stack.length > 1 ? this.stack[this.stack.length - 2].scene.id : undefined,
      to: sceneId,
      transition: transition || this.currentTransition,
    });

    return true;
  }

  async pop(transition?: SceneTransitionConfig): Promise<boolean> {
    if (this.stack.length <= 1) {
      return false;
    }

    const fromScene = this.stack.pop();
    if (!fromScene) return false;

    // Activate previous scene
    if (this.stack.length > 0) {
      this.stack[this.stack.length - 1].isActive = true;
    }

    this.notifyObservers({
      type: "pop",
      from: fromScene.scene.id,
      to: this.stack[this.stack.length - 1]?.scene.id,
      transition: transition || this.currentTransition,
    });

    return true;
  }

  async replace(
    sceneId: string,
    params?: Record<string, unknown>,
    transition?: SceneTransitionConfig
  ): Promise<boolean> {
    if (this.stack.length === 0) {
      return this.push(sceneId, params, transition);
    }

    const scene = this.scenes.get(sceneId);
    if (!scene) {
      console.warn(`Scene not found: ${sceneId}`);
      return false;
    }

    const fromScene = this.stack[this.stack.length - 1];

    // Replace current scene
    const sceneInstance: Scene = {
      ...scene,
      params: { ...scene.params, ...params },
    };

    this.stack[this.stack.length - 1] = {
      scene: sceneInstance,
      enteredAt: Date.now(),
      isActive: true,
    };

    this.notifyObservers({
      type: "replace",
      from: fromScene.scene.id,
      to: sceneId,
      transition: transition || this.currentTransition,
    });

    return true;
  }

  async popTo(sceneId: string, transition?: SceneTransitionConfig): Promise<boolean> {
    const index = this.stack.findIndex((item) => item.scene.id === sceneId);
    if (index === -1) {
      return false;
    }

    const fromScene = this.stack[this.stack.length - 1];

    // Pop until we reach the target scene
    while (this.stack.length > index + 1) {
      this.stack.pop();
    }

    // Activate the target scene
    this.stack[this.stack.length - 1].isActive = true;

    this.notifyObservers({
      type: "popTo",
      from: fromScene.scene.id,
      to: sceneId,
      transition: transition || this.currentTransition,
    });

    return true;
  }

  async popToRoot(transition?: SceneTransitionConfig): Promise<boolean> {
    if (this.stack.length <= 1) {
      return false;
    }

    const fromScene = this.stack[this.stack.length - 1];

    // Keep only the root scene
    while (this.stack.length > 1) {
      this.stack.pop();
    }

    this.stack[0].isActive = true;

    this.notifyObservers({
      type: "popToRoot",
      from: fromScene.scene.id,
      to: this.stack[0].scene.id,
      transition: transition || this.currentTransition,
    });

    return true;
  }

  getCurrentScene(): Scene | null {
    if (this.stack.length === 0) return null;
    return this.stack[this.stack.length - 1].scene;
  }

  getPreviousScene(): Scene | null {
    if (this.stack.length < 2) return null;
    return this.stack[this.stack.length - 2].scene;
  }

  getStack(): Scene[] {
    return this.stack.map((item) => item.scene);
  }

  getStackSize(): number {
    return this.stack.length;
  }

  canGoBack(): boolean {
    return this.stack.length > 1;
  }

  setTransition(config: SceneTransitionConfig): void {
    this.currentTransition = config;
  }

  getTransition(): SceneTransitionConfig {
    return { ...this.currentTransition };
  }

  updateParams(params: Record<string, unknown>): void {
    if (this.stack.length === 0) return;

    const current = this.stack[this.stack.length - 1];
    current.scene.params = { ...current.scene.params, ...params };

    this.notifyObservers({
      type: "updateParams",
      to: current.scene.id,
      params,
    });
  }

  subscribe(callback: (event: SceneEvent) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private notifyObservers(event: SceneEvent): void {
    this.observers.forEach((callback) => callback(event));
  }

  clear(): void {
    this.stack = [];
    this.observers.clear();
  }
}

export interface SceneEvent {
  type: "push" | "pop" | "replace" | "popTo" | "popToRoot" | "updateParams";
  from?: string;
  to?: string;
  transition?: SceneTransitionConfig;
  params?: Record<string, unknown>;
}

export const sceneService = new SceneService();
