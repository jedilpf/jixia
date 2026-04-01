/**
 * 快捷键服务
 *
 * 管理游戏内所有快捷键绑定
 */

export type HotkeyAction =
  | "CONFIRM"
  | "CANCEL"
  | "END_TURN"
  | "SELECT_CARD_1"
  | "SELECT_CARD_2"
  | "SELECT_CARD_3"
  | "SELECT_CARD_4"
  | "SELECT_CARD_5"
  | "PLAY_CARD"
  | "ATTACK"
  | "HERO_POWER"
  | "EMOTE_GREAT"
  | "EMOTE_THANKS"
  | "EMOTE_SORRY"
  | "EMOTE_WELL_PLAYED"
  | "SURRENDER"
  | "MENU"
  | "FULLSCREEN"
  | "MUTE";

interface HotkeyConfig {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  preventDefault?: boolean;
}

type HotkeyMap = Record<HotkeyAction, HotkeyConfig>;

const DEFAULT_HOTKEYS: HotkeyMap = {
  CONFIRM: { key: "Enter", preventDefault: true },
  CANCEL: { key: "Escape", preventDefault: true },
  END_TURN: { key: "Space", preventDefault: true },
  SELECT_CARD_1: { key: "1" },
  SELECT_CARD_2: { key: "2" },
  SELECT_CARD_3: { key: "3" },
  SELECT_CARD_4: { key: "4" },
  SELECT_CARD_5: { key: "5" },
  PLAY_CARD: { key: "q" },
  ATTACK: { key: "a" },
  HERO_POWER: { key: "w" },
  EMOTE_GREAT: { key: "g", ctrl: true },
  EMOTE_THANKS: { key: "t", ctrl: true },
  EMOTE_SORRY: { key: "s", ctrl: true },
  EMOTE_WELL_PLAYED: { key: "w", ctrl: true },
  SURRENDER: { key: "F10" },
  MENU: { key: "Escape" },
  FULLSCREEN: { key: "f", ctrl: true },
  MUTE: { key: "m", ctrl: true },
};

export class HotkeyService {
  private hotkeys: HotkeyMap = { ...DEFAULT_HOTKEYS };
  private handlers: Map<HotkeyAction, () => void> = new Map();
  private isEnabled: boolean = true;
  private readonly STORAGE_KEY = "jixia_hotkeys";

  constructor() {
    this.loadHotkeys();
    this.setupListeners();
  }

  /**
   * 设置快捷键监听器
   */
  private setupListeners(): void {
    document.addEventListener("keydown", (e) => {
      if (!this.isEnabled) return;

      const action = this.getActionFromEvent(e);
      if (action) {
        const handler = this.handlers.get(action);
        if (handler) {
          const config = this.hotkeys[action];
          if (config.preventDefault) {
            e.preventDefault();
          }
          handler();
        }
      }
    });
  }

  /**
   * 从键盘事件获取对应的动作
   */
  private getActionFromEvent(e: KeyboardEvent): HotkeyAction | null {
    for (const [action, config] of Object.entries(this.hotkeys)) {
      if (
        config.key.toLowerCase() === e.key.toLowerCase() &&
        !!config.ctrl === e.ctrlKey &&
        !!config.alt === e.altKey &&
        !!config.shift === e.shiftKey
      ) {
        return action as HotkeyAction;
      }
    }
    return null;
  }

  /**
   * 注册快捷键处理器
   */
  on(action: HotkeyAction, handler: () => void): void {
    this.handlers.set(action, handler);
  }

  /**
   * 移除快捷键处理器
   */
  off(action: HotkeyAction): void {
    this.handlers.delete(action);
  }

  /**
   * 设置快捷键
   */
  setHotkey(action: HotkeyAction, config: HotkeyConfig): void {
    this.hotkeys[action] = config;
    this.saveHotkeys();
  }

  /**
   * 获取快捷键配置
   */
  getHotkey(action: HotkeyAction): HotkeyConfig {
    return this.hotkeys[action];
  }

  /**
   * 获取所有快捷键
   */
  getAllHotkeys(): HotkeyMap {
    return { ...this.hotkeys };
  }

  /**
   * 重置为默认快捷键
   */
  resetToDefault(): void {
    this.hotkeys = { ...DEFAULT_HOTKEYS };
    this.saveHotkeys();
  }

  /**
   * 启用快捷键
   */
  enable(): void {
    this.isEnabled = true;
  }

  /**
   * 禁用快捷键
   */
  disable(): void {
    this.isEnabled = false;
  }

  /**
   * 检查是否启用
   */
  isHotkeysEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * 保存快捷键到本地存储
   */
  private saveHotkeys(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.hotkeys));
    } catch (error) {
      console.error("[Hotkey] Failed to save hotkeys:", error);
    }
  }

  /**
   * 从本地存储加载快捷键
   */
  private loadHotkeys(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.hotkeys = { ...DEFAULT_HOTKEYS, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error("[Hotkey] Failed to load hotkeys:", error);
    }
  }

  /**
   * 获取快捷键的显示文本
   */
  getHotkeyDisplay(action: HotkeyAction): string {
    const config = this.hotkeys[action];
    const parts: string[] = [];

    if (config.ctrl) parts.push("Ctrl");
    if (config.alt) parts.push("Alt");
    if (config.shift) parts.push("Shift");
    parts.push(config.key);

    return parts.join("+");
  }
}

// 便捷导出
export const hotkeyService = new HotkeyService();
export default hotkeyService;
