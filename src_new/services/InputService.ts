export type InputAction = 
  | "click"
  | "dblclick"
  | "mousedown"
  | "mouseup"
  | "mousemove"
  | "keydown"
  | "keyup"
  | "scroll"
  | "touchstart"
  | "touchend"
  | "touchmove"
  | "wheel";

export interface InputBinding {
  id: string;
  action: InputAction;
  key?: string;
  button?: number;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  callback: (event: InputEvent) => void;
  priority?: number;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

export interface InputEvent {
  type: InputAction;
  x?: number;
  y?: number;
  key?: string;
  button?: number;
  deltaX?: number;
  deltaY?: number;
  target?: EventTarget;
  originalEvent: Event;
  timestamp: number;
}

export interface GestureState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
  scale: number;
  rotation: number;
}

export class InputService {
  private bindings: Map<string, InputBinding> = new Map();
  private gestureState: GestureState | null = null;
  private isListening: boolean = false;
  private observers: Set<(event: InputEvent) => void> = new Set();

  constructor() {
    this.setupListeners();
  }

  private setupListeners(): void {
    if (this.isListening) return;

    // Mouse events
    document.addEventListener("click", this.handleMouseEvent);
    document.addEventListener("dblclick", this.handleMouseEvent);
    document.addEventListener("mousedown", this.handleMouseEvent);
    document.addEventListener("mouseup", this.handleMouseEvent);
    document.addEventListener("mousemove", this.handleMouseEvent);

    // Keyboard events
    document.addEventListener("keydown", this.handleKeyboardEvent);
    document.addEventListener("keyup", this.handleKeyboardEvent);

    // Wheel/Scroll events
    document.addEventListener("wheel", this.handleWheelEvent);

    // Touch events
    document.addEventListener("touchstart", this.handleTouchEvent);
    document.addEventListener("touchend", this.handleTouchEvent);
    document.addEventListener("touchmove", this.handleTouchEvent);

    this.isListening = true;
  }

  private handleMouseEvent = (e: MouseEvent): void => {
    const inputEvent: InputEvent = {
      type: e.type as InputAction,
      x: e.clientX,
      y: e.clientY,
      button: e.button,
      target: e.target,
      originalEvent: e,
      timestamp: Date.now(),
    };

    this.processInput(inputEvent);
  };

  private handleKeyboardEvent = (e: KeyboardEvent): void => {
    const inputEvent: InputEvent = {
      type: e.type as InputAction,
      key: e.key,
      target: e.target,
      originalEvent: e,
      timestamp: Date.now(),
    };

    this.processInput(inputEvent);
  };

  private handleWheelEvent = (e: WheelEvent): void => {
    const inputEvent: InputEvent = {
      type: "wheel",
      x: e.clientX,
      y: e.clientY,
      deltaX: e.deltaX,
      deltaY: e.deltaY,
      target: e.target,
      originalEvent: e,
      timestamp: Date.now(),
    };

    this.processInput(inputEvent);
  };

  private handleTouchEvent = (e: TouchEvent): void => {
    const touch = e.touches[0] || e.changedTouches[0];
    
    const inputEvent: InputEvent = {
      type: e.type as InputAction,
      x: touch?.clientX,
      y: touch?.clientY,
      target: e.target,
      originalEvent: e,
      timestamp: Date.now(),
    };

    // Handle gestures
    if (e.type === "touchstart") {
      this.gestureState = {
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY,
        deltaX: 0,
        deltaY: 0,
        scale: 1,
        rotation: 0,
      };
    } else if (e.type === "touchmove" && this.gestureState) {
      this.gestureState.currentX = touch.clientX;
      this.gestureState.currentY = touch.clientY;
      this.gestureState.deltaX = touch.clientX - this.gestureState.startX;
      this.gestureState.deltaY = touch.clientY - this.gestureState.startY;
    }

    this.processInput(inputEvent);
  };

  private processInput(event: InputEvent): void {
    // Notify observers
    this.observers.forEach((callback) => callback(event));

    // Process bindings
    const matchingBindings = Array.from(this.bindings.values())
      .filter((binding) => this.matchesBinding(binding, event))
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));

    for (const binding of matchingBindings) {
      binding.callback(event);

      if (binding.preventDefault) {
        event.originalEvent.preventDefault();
      }
      if (binding.stopPropagation) {
        event.originalEvent.stopPropagation();
      }
    }
  }

  private matchesBinding(binding: InputBinding, event: InputEvent): boolean {
    if (binding.action !== event.type) return false;

    // Check key
    if (binding.key && binding.key !== event.key) return false;

    // Check button
    if (binding.button !== undefined && binding.button !== event.button) return false;

    // Check modifiers
    const originalEvent = event.originalEvent;
    if (originalEvent instanceof KeyboardEvent || originalEvent instanceof MouseEvent) {
      if (binding.ctrl && !originalEvent.ctrlKey) return false;
      if (binding.shift && !originalEvent.shiftKey) return false;
      if (binding.alt && !originalEvent.altKey) return false;
    }

    return true;
  }

  register(binding: InputBinding): () => void {
    this.bindings.set(binding.id, binding);
    return () => this.unregister(binding.id);
  }

  unregister(id: string): boolean {
    return this.bindings.delete(id);
  }

  onClick(
    callback: (event: InputEvent) => void,
    options?: { priority?: number; preventDefault?: boolean; stopPropagation?: boolean }
  ): () => void {
    return this.register({
      id: `click_${Date.now()}_${Math.random()}`,
      action: "click",
      callback,
      ...options,
    });
  }

  onKey(
    key: string,
    callback: (event: InputEvent) => void,
    options?: { ctrl?: boolean; shift?: boolean; alt?: boolean; priority?: number }
  ): () => void {
    return this.register({
      id: `key_${key}_${Date.now()}`,
      action: "keydown",
      key,
      callback,
      ...options,
    });
  }

  onMouseMove(callback: (event: InputEvent) => void): () => void {
    return this.register({
      id: `mousemove_${Date.now()}`,
      action: "mousemove",
      callback,
    });
  }

  onScroll(callback: (event: InputEvent) => void): () => void {
    return this.register({
      id: `scroll_${Date.now()}`,
      action: "wheel",
      callback,
    });
  }

  getGestureState(): GestureState | null {
    return this.gestureState ? { ...this.gestureState } : null;
  }

  subscribe(callback: (event: InputEvent) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  destroy(): void {
    document.removeEventListener("click", this.handleMouseEvent);
    document.removeEventListener("dblclick", this.handleMouseEvent);
    document.removeEventListener("mousedown", this.handleMouseEvent);
    document.removeEventListener("mouseup", this.handleMouseEvent);
    document.removeEventListener("mousemove", this.handleMouseEvent);
    document.removeEventListener("keydown", this.handleKeyboardEvent);
    document.removeEventListener("keyup", this.handleKeyboardEvent);
    document.removeEventListener("wheel", this.handleWheelEvent);
    document.removeEventListener("touchstart", this.handleTouchEvent);
    document.removeEventListener("touchend", this.handleTouchEvent);
    document.removeEventListener("touchmove", this.handleTouchEvent);
    
    this.bindings.clear();
    this.observers.clear();
    this.isListening = false;
  }
}

export const inputService = new InputService();
