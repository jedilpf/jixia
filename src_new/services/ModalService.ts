// ModalService - 弹窗服务
// 提供统一的弹窗管理、层级控制、动画效果等功能

export type ModalSize = "small" | "medium" | "large" | "fullscreen" | "auto";
export type ModalPosition = "center" | "top" | "bottom" | "left" | "right";

export interface ModalConfig {
  id: string;
  title?: string;
  content?: React.ReactNode;
  size?: ModalSize;
  position?: ModalPosition;
  closable?: boolean;
  maskClosable?: boolean;
  showMask?: boolean;
  showCloseButton?: boolean;
  destroyOnClose?: boolean;
  zIndex?: number;
  className?: string;
  style?: React.CSSProperties;
  headerStyle?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
  footerStyle?: React.CSSProperties;
  onOpen?: () => void;
  onClose?: () => void;
  onOk?: () => boolean | Promise<boolean>;
  onCancel?: () => void;
  footer?: React.ReactNode | null;
  okText?: string;
  cancelText?: string;
  okButtonProps?: Record<string, unknown>;
  cancelButtonProps?: Record<string, unknown>;
}

export interface ModalInstance {
  id: string;
  config: ModalConfig;
  visible: boolean;
  resolve: (value: boolean) => void;
  reject: (reason?: unknown) => void;
}

export interface ModalOptions
  extends Omit<Partial<ModalConfig>, "id" | "content"> {
  content?: React.ReactNode | string;
}

export const DEFAULT_MODAL_CONFIG: Partial<ModalConfig> = {
  size: "medium",
  position: "center",
  closable: true,
  maskClosable: true,
  showMask: true,
  showCloseButton: true,
  destroyOnClose: false,
  zIndex: 1000,
  okText: "确认",
  cancelText: "取消",
};

export class ModalService {
  private modals: Map<string, ModalInstance> = new Map();
  private modalStack: string[] = [];
  private baseZIndex = 1000;
  private listeners: Set<(modals: ModalInstance[]) => void> = new Set();
  private idCounter = 0;

  private generateId(): string {
    return `modal_${++this.idCounter}_${Date.now()}`;
  }

  private notifyListeners(): void {
    const modalList = Array.from(this.modals.values());
    this.listeners.forEach((listener) => listener(modalList));
  }

  private createModal(config: ModalConfig): ModalInstance {
    const modal: ModalInstance = {
      id: config.id,
      config: { ...DEFAULT_MODAL_CONFIG, ...config },
      visible: false,
      resolve: () => {},
      reject: () => {},
    };
    return modal;
  }

  open(config: ModalOptions): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const id = this.generateId();
      const fullConfig: ModalConfig = {
        ...DEFAULT_MODAL_CONFIG,
        ...config,
        id,
        zIndex: this.baseZIndex + this.modalStack.length * 10,
      } as ModalConfig;

      const modal = this.createModal(fullConfig);
      modal.resolve = resolve;
      modal.reject = reject;

      this.modals.set(id, modal);
      this.modalStack.push(id);

      // Trigger open animation
      setTimeout(() => {
        modal.visible = true;
        this.notifyListeners();
        fullConfig.onOpen?.();
      }, 0);

      this.notifyListeners();
    });
  }

  close(id: string, result = false): void {
    const modal = this.modals.get(id);
    if (!modal) return;

    modal.visible = false;
    modal.config.onClose?.();
    this.notifyListeners();

    // Wait for animation to complete
    setTimeout(() => {
      this.modals.delete(id);
      const index = this.modalStack.indexOf(id);
      if (index > -1) {
        this.modalStack.splice(index, 1);
      }
      modal.resolve(result);
      this.notifyListeners();
    }, 300);
  }

  closeAll(): void {
    const ids = Array.from(this.modals.keys());
    ids.forEach((id) => this.close(id, false));
  }

  closeTop(): void {
    const topId = this.modalStack[this.modalStack.length - 1];
    if (topId) {
      this.close(topId, false);
    }
  }

  confirm(options: ModalOptions): Promise<boolean> {
    return this.open({
      ...options,
      closable: false,
      maskClosable: false,
    });
  }

  alert(message: string, title?: string): Promise<void> {
    return new Promise((resolve) => {
      this.open({
        title: title || "提示",
        content: message,
        size: "small",
        closable: false,
        maskClosable: false,
        showCloseButton: false,
        footer: null,
        cancelText: undefined,
        onOk: () => {
          resolve();
          return true;
        },
      }).then(() => resolve());
    });
  }

  info(content: string | React.ReactNode, title?: string): Promise<boolean> {
    return this.open({
      title: title || "信息",
      content,
      size: "small",
      okText: "知道了",
      cancelText: undefined,
    });
  }

  success(content: string | React.ReactNode, title?: string): Promise<boolean> {
    return this.open({
      title: title || "成功",
      content,
      size: "small",
      okText: "确定",
      cancelText: undefined,
      className: "modal-success",
    });
  }

  warning(content: string | React.ReactNode, title?: string): Promise<boolean> {
    return this.open({
      title: title || "警告",
      content,
      size: "small",
      okText: "确定",
      cancelText: undefined,
      className: "modal-warning",
    });
  }

  error(content: string | React.ReactNode, title?: string): Promise<boolean> {
    return this.open({
      title: title || "错误",
      content,
      size: "small",
      okText: "确定",
      cancelText: undefined,
      className: "modal-error",
    });
  }

  getModal(id: string): ModalInstance | undefined {
    return this.modals.get(id);
  }

  getAllModals(): ModalInstance[] {
    return Array.from(this.modals.values());
  }

  getVisibleModals(): ModalInstance[] {
    return this.getAllModals().filter((m) => m.visible);
  }

  getTopModal(): ModalInstance | undefined {
    const topId = this.modalStack[this.modalStack.length - 1];
    return topId ? this.modals.get(topId) : undefined;
  }

  isModalOpen(id: string): boolean {
    const modal = this.modals.get(id);
    return modal?.visible ?? false;
  }

  hasOpenModals(): boolean {
    return this.getVisibleModals().length > 0;
  }

  updateModal(id: string, updates: Partial<ModalConfig>): boolean {
    const modal = this.modals.get(id);
    if (!modal) return false;

    modal.config = { ...modal.config, ...updates };
    this.notifyListeners();
    return true;
  }

  setModalContent(id: string, content: React.ReactNode): boolean {
    return this.updateModal(id, { content });
  }

  setModalTitle(id: string, title: string): boolean {
    return this.updateModal(id, { title });
  }

  onModalsChange(callback: (modals: ModalInstance[]) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  handleMaskClick(id: string): void {
    const modal = this.modals.get(id);
    if (!modal) return;

    if (modal.config.maskClosable) {
      this.close(id, false);
    }
  }

  handleCloseButtonClick(id: string): void {
    const modal = this.modals.get(id);
    if (!modal) return;

    if (modal.config.closable) {
      this.close(id, false);
    }
  }

  async handleOkClick(id: string): Promise<void> {
    const modal = this.modals.get(id);
    if (!modal) return;

    if (modal.config.onOk) {
      try {
        const result = await modal.config.onOk();
        if (result !== false) {
          this.close(id, true);
        }
      } catch {
        // Keep modal open on error
      }
    } else {
      this.close(id, true);
    }
  }

  handleCancelClick(id: string): void {
    const modal = this.modals.get(id);
    if (!modal) return;

    modal.config.onCancel?.();
    this.close(id, false);
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      const topModal = this.getTopModal();
      if (topModal && topModal.config.closable) {
        this.close(topModal.id, false);
      }
    }
  }

  getSizeStyles(size: ModalSize): React.CSSProperties {
    const sizes: Record<ModalSize, React.CSSProperties> = {
      small: { width: "400px", maxWidth: "90vw" },
      medium: { width: "600px", maxWidth: "90vw" },
      large: { width: "900px", maxWidth: "90vw" },
      fullscreen: { width: "100vw", height: "100vh", margin: 0, borderRadius: 0 },
      auto: { width: "auto", maxWidth: "90vw" },
    };
    return sizes[size];
  }

  getPositionStyles(position: ModalPosition): React.CSSProperties {
    const positions: Record<ModalPosition, React.CSSProperties> = {
      center: {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      },
      top: { top: "10%", left: "50%", transform: "translateX(-50%)" },
      bottom: { bottom: "10%", left: "50%", transform: "translateX(-50%)" },
      left: { top: "50%", left: "10%", transform: "translateY(-50%)" },
      right: { top: "50%", right: "10%", transform: "translateY(-50%)" },
    };
    return positions[position];
  }
}

export const modalService = new ModalService();

// Add keyboard event listener
if (typeof window !== "undefined") {
  window.addEventListener("keydown", (e) => modalService.handleKeyDown(e));
}
