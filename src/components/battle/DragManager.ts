// src/components/battle/DragManager.ts
// ========================================================================
// 游戏引擎级拖拽管理器 — 生产级实现
// - 帧时间补偿 Lerp (帧率无关平滑)
// - 旋转角度独立阻尼
// - pointercancel / blur 安全退出
// - 并发保护 (重复 startDrag 自动清理)
// - 坐标空间：内部一律存储屏幕坐标 (clientX/Y)
// ========================================================================

export type DragType = 'card' | 'minion_attack' | 'hero_attack';

type TransformCallback = (x: number, y: number, rotation: number, isDragging: boolean, payload?: any) => void;

// 工具函数
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

class DragEngine {
    private active: boolean = false;

    // ---- 原始鼠标/触摸输入 (屏幕坐标) ----
    public mouseX: number = 0;
    public mouseY: number = 0;

    // ---- 平滑插值后的坐标 (屏幕坐标) ----
    public currentX: number = 0;
    public currentY: number = 0;

    // ---- 旋转状态 ----
    private lastX: number = 0;
    private currentRotation: number = 0;

    // ---- RAF 时间戳 ----
    private lastTimestamp: number = 0;
    private rafId: number | null = null;

    // ---- 订阅者 ----
    private subscribers: Set<TransformCallback> = new Set();

    // ---- 拖拽类型 ----
    public dragType: DragType | null = null;
    public payload: any = null;

    // ---- 物理参数 ----
    /** Lerp 系数 (0-1)，在 60fps 下的归一化值。越小越平滑/延迟越大 */
    private lerpFactor: number = 0.35;
    /** 旋转阻尼系数，越小旋转越平滑 */
    private rotationDamping: number = 0.12;
    /** 最大旋转角度 (度) */
    private maxRotation: number = 18;
    /** 旋转灵敏度系数 */
    private rotationSensitivity: number = 0.6;

    constructor() {
        this.handlePointerMove = this.handlePointerMove.bind(this);
        this.handleSafetyExit = this.handleSafetyExit.bind(this);
    }

    // ==================== 公共 API ====================

    /**
     * 开启拖拽引擎 (由 BattleLayout pointerdown 触发)
     * @param type 拖拽类型
     * @param screenX e.clientX (屏幕坐标)
     * @param screenY e.clientY (屏幕坐标)
     * @param payload 可选的数据载荷 (如拖拽卡牌时的 Card 对象)
     */
    public startDrag(type: DragType, screenX: number, screenY: number, payload?: any) {
        // 并发保护：如果已有拖拽进行中，先清理
        if (this.active) {
            this.stopDrag();
        }

        this.dragType = type;
        this.payload = payload || null;
        this.mouseX = screenX;
        this.mouseY = screenY;

        // 初始位置不需要 Lerp，直接就位
        this.currentX = screenX;
        this.currentY = screenY;
        this.lastX = screenX;
        this.currentRotation = 0;
        this.lastTimestamp = 0; // 将在第一帧 loop 中初始化

        this.active = true;

        // 注册事件监听
        window.addEventListener('pointermove', this.handlePointerMove, { passive: true });
        window.addEventListener('pointercancel', this.handleSafetyExit);
        window.addEventListener('blur', this.handleSafetyExit);

        // 启动 RAF 循环
        if (!this.rafId) {
            this.rafId = requestAnimationFrame(this.loop);
        }
    }

    /**
     * 停止拖拽引擎 (由 BattleLayout pointerup 触发)
     */
    public stopDrag() {
        if (!this.active) return;

        this.active = false;
        this.dragType = null;
        this.payload = null;

        // 移除所有事件监听
        window.removeEventListener('pointermove', this.handlePointerMove);
        window.removeEventListener('pointercancel', this.handleSafetyExit);
        window.removeEventListener('blur', this.handleSafetyExit);

        // 停止 RAF
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }

        // 广播停止信号
        this.notifySubscribers(false);
    }

    /**
     * 注册订阅者 (DragGhost / AttackPointer 等)
     * @returns 取消订阅函数
     */
    public subscribe(callback: TransformCallback): () => void {
        this.subscribers.add(callback);
        return () => {
            this.subscribers.delete(callback);
        };
    }

    /**
     * 获取当前平滑坐标 (屏幕空间)
     */
    public getCurrentPos(): { x: number; y: number } {
        return { x: this.currentX, y: this.currentY };
    }

    /**
     * 引擎是否活跃中
     */
    public isActive(): boolean {
        return this.active;
    }

    // ==================== 内部实现 ====================

    /** 纯粹地采集原始输入 — 零 DOM 操作 */
    private handlePointerMove(e: PointerEvent) {
        if (!this.active) return;
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
    }

    /** 安全退出 — pointercancel / 页面失焦 */
    private handleSafetyExit() {
        if (this.active) {
            this.stopDrag();
        }
    }

    /** RAF 主渲染循环 — 帧时间补偿 */
    private loop = (timestamp: number) => {
        if (!this.active) {
            this.rafId = null;
            return;
        }

        // ---- 计算 deltaTime (秒)，cap 在 50ms 防止跳帧雪崩 ----
        const dt = this.lastTimestamp
            ? Math.min((timestamp - this.lastTimestamp) / 1000, 0.05)
            : 1 / 60; // 第一帧假设 60fps
        this.lastTimestamp = timestamp;

        // ---- 帧率归一化 Lerp ----
        // lerpFactor 在 60fps 下的等效行为：
        //   factor = 1 - (1 - lerpFactor)^(dt * 60)
        // 这保证在 30fps / 120fps / 144fps 下的平滑追踪速度一致
        const factor = 1 - Math.pow(1 - this.lerpFactor, dt * 60);
        this.currentX += (this.mouseX - this.currentX) * factor;
        this.currentY += (this.mouseY - this.currentY) * factor;

        // ---- 旋转：基于横向速度 + 独立阻尼 ----
        const velocityX = this.currentX - this.lastX;
        const targetRotation = clamp(
            velocityX * this.rotationSensitivity,
            -this.maxRotation,
            this.maxRotation
        );
        // 旋转本身也做一层 Lerp，停止时平滑归零
        const rotFactor = 1 - Math.pow(1 - this.rotationDamping, dt * 60);
        this.currentRotation += (targetRotation - this.currentRotation) * rotFactor;

        // ---- 广播给订阅者 ----
        this.notifySubscribers(true, this.currentRotation);

        // ---- 记录上帧位置 ----
        this.lastX = this.currentX;

        // ---- 请求下一帧 ----
        this.rafId = requestAnimationFrame(this.loop);
    };

    private notifySubscribers(isDragging: boolean, rotation: number = 0) {
        const { currentX, currentY, payload } = this;
        for (const callback of this.subscribers) {
            callback(currentX, currentY, rotation, isDragging, payload);
        }
    }
}

export const dragManager = new DragEngine();
