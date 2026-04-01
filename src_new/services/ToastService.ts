// ToastService - 轻提示服务
// 提供全局轻提示、消息通知、自动消失等功能

export type ToastType = "info" | "success" | "warning" | "error" | "loading";
export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface ToastConfig {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
  position?: ToastPosition;
  closable?: boolean;
  showIcon?: boolean;
  pauseOnHover?: boolean;
  onClose?: () => void;
  onClick?: () => void;
  action?: {
    text: string;
    onClick: () => void;
  };
}

export interface ToastOptions
  extends Omit<Partial<ToastConfig>, "id" | "type" | "message"> {
  message: string;
  description?: string;
}

export const DEFAULT_TOAST_CONFIG: Partial<ToastConfig> = {
  duration: 3000,
  position: "top-center",
  closable: true,
  showIcon: true,
  pauseOnHover: true,
};

export const TOAST_DURATION: Record<ToastType, number> = {
  info: 3000,
  success: 2000,
  warning: 4000,
  error: 5000,
  loading: 0, // Loading toasts don't auto close
};

export interface ToastInstance extends ToastConfig {
  visible: boolean;
  createdAt: number;
  timer?: ReturnType<typeof setTimeout>;
}

type ToastEventCallback = (toasts: ToastInstance[]) => void;

export class ToastService {
  private toasts: Map<string, ToastInstance> = new Map();
  private listeners: Set<ToastEventCallback> = new Set();
  private idCounter = 0;
  private maxToasts = 5;

  private generateId(): string {
    return `toast_${++this.idCounter}_${Date.now()}`;
  }

  private notifyListeners(): void {
    const toastList = Array.from(this.toasts.values());
    this.listeners.forEach((listener) => listener(toastList));
  }

  private createToast(config: ToastConfig): ToastInstance {
    const toast: ToastInstance = {
      ...DEFAULT_TOAST_CONFIG,
      ...config,
      visible: false,
      createdAt: Date.now(),
    };
    return toast;
  }

  private startTimer(toast: ToastInstance): void {
    if (toast.timer) {
      clearTimeout(toast.timer);
    }

    const duration = toast.duration ?? TOAST_DURATION[toast.type];
    if (duration > 0) {
      toast.timer = setTimeout(() => {
        this.close(toast.id);
      }, duration);
    }
  }

  private stopTimer(toast: ToastInstance): void {
    if (toast.timer) {
      clearTimeout(toast.timer);
      toast.timer = undefined;
    }
  }

  private enforceMaxToasts(): void {
    const toasts = Array.from(this.toasts.values());
    if (toasts.length > this.maxToasts) {
      // Remove oldest non-loading toasts
      const sorted = toasts
        .filter((t) => t.type !== "loading")
        .sort((a, b) => a.createdAt - b.createdAt);

      const toRemove = sorted.slice(0, toasts.length - this.maxToasts);
      toRemove.forEach((t) => this.close(t.id));
    }
  }

  show(type: ToastType, options: ToastOptions): string {
    const id = this.generateId();
    const config: ToastConfig = {
      ...DEFAULT_TOAST_CONFIG,
      ...options,
      id,
      type,
      duration: options.duration ?? TOAST_DURATION[type],
    };

    const toast = this.createToast(config);
    this.toasts.set(id, toast);

    // Trigger animation
    setTimeout(() => {
      toast.visible = true;
      this.notifyListeners();
      this.startTimer(toast);
    }, 0);

    this.enforceMaxToasts();
    this.notifyListeners();

    return id;
  }

  info(message: string, description?: string, options?: ToastOptions): string {
    return this.show("info", { message, description, ...options });
  }

  success(message: string, description?: string, options?: ToastOptions): string {
    return this.show("success", { message, description, ...options });
  }

  warning(message: string, description?: string, options?: ToastOptions): string {
    return this.show("warning", { message, description, ...options });
  }

  error(message: string, description?: string, options?: ToastOptions): string {
    return this.show("error", { message, description, ...options });
  }

  loading(message: string, description?: string, options?: ToastOptions): string {
    return this.show("loading", { message, description, ...options });
  }

  close(id: string): void {
    const toast = this.toasts.get(id);
    if (!toast) return;

    this.stopTimer(toast);
    toast.visible = false;
    toast.onClose?.();
    this.notifyListeners();

    // Wait for animation
    setTimeout(() => {
      this.toasts.delete(id);
      this.notifyListeners();
    }, 300);
  }

  closeAll(): void {
    const ids = Array.from(this.toasts.keys());
    ids.forEach((id) => this.close(id));
  }

  closeByType(type: ToastType): void {
    this.getToastsByType(type).forEach((toast) => this.close(toast.id));
  }

  update(id: string, updates: Partial<ToastConfig>): boolean {
    const toast = this.toasts.get(id);
    if (!toast) return false;

    Object.assign(toast, updates);
    this.notifyListeners();
    return true;
  }

  updateMessage(id: string, message: string): boolean {
    return this.update(id, { message });
  }

  // Transform loading toast to success/error
  resolveLoading(id: string, type: "success" | "error", message: string): boolean {
    const toast = this.toasts.get(id);
    if (!toast || toast.type !== "loading") return false;

    this.stopTimer(toast);
    toast.type = type;
    toast.message = message;
    toast.duration = TOAST_DURATION[type];
    this.startTimer(toast);
    this.notifyListeners();

    return true;
  }

  getToast(id: string): ToastInstance | undefined {
    return this.toasts.get(id);
  }

  getAllToasts(): ToastInstance[] {
    return Array.from(this.toasts.values());
  }

  getVisibleToasts(): ToastInstance[] {
    return this.getAllToasts().filter((t) => t.visible);
  }

  getToastsByType(type: ToastType): ToastInstance[] {
    return this.getAllToasts().filter((t) => t.type === type);
  }

  getToastsByPosition(position: ToastPosition): ToastInstance[] {
    return this.getAllToasts().filter((t) => t.position === position);
  }

  hasToast(id: string): boolean {
    return this.toasts.has(id);
  }

  hasVisibleToasts(): boolean {
    return this.getVisibleToasts().length > 0;
  }

  onToastsChange(callback: ToastEventCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  pauseTimer(id: string): void {
    const toast = this.toasts.get(id);
    if (toast?.pauseOnHover) {
      this.stopTimer(toast);
    }
  }

  resumeTimer(id: string): void {
    const toast = this.toasts.get(id);
    if (toast?.pauseOnHover && toast.visible) {
      this.startTimer(toast);
    }
  }

  setMaxToasts(max: number): void {
    this.maxToasts = Math.max(1, max);
    this.enforceMaxToasts();
  }

  // Promise-based loading toast
  async promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    },
    options?: ToastOptions
  ): Promise<T> {
    const id = this.loading(messages.loading, undefined, options);

    try {
      const result = await promise;
      this.resolveLoading(id, "success", messages.success);
      return result;
    } catch (err) {
      this.resolveLoading(
        id,
        "error",
        err instanceof Error ? err.message : messages.error
      );
      throw err;
    }
  }

  // Convenience method for async operations
  async wrap<T>(
    fn: () => Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ): Promise<T | undefined> {
    try {
      return await this.promise(fn(), messages);
    } catch {
      return undefined;
    }
  }
}

export const toastService = new ToastService();
