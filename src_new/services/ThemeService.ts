// ThemeService - 主题服务
// 提供主题切换、暗黑模式、自定义主题等功能

export type ThemeMode = "light" | "dark" | "auto";
export type ThemeColor = "blue" | "purple" | "green" | "orange" | "red" | "pink";

export interface ThemeConfig {
  mode: ThemeMode;
  primaryColor: ThemeColor;
  fontSize: "small" | "medium" | "large";
  borderRadius: "none" | "small" | "medium" | "large";
  animations: boolean;
  compactMode: boolean;
  storageKey: string;
}

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  mode: "auto",
  primaryColor: "blue",
  fontSize: "medium",
  borderRadius: "medium",
  animations: true,
  compactMode: false,
  storageKey: "jixia_theme",
};

export interface ColorPalette {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export const COLOR_PALETTES: Record<ThemeColor, ColorPalette> = {
  blue: {
    primary: "#3b82f6",
    primaryLight: "#60a5fa",
    primaryDark: "#2563eb",
    secondary: "#64748b",
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
  },
  purple: {
    primary: "#8b5cf6",
    primaryLight: "#a78bfa",
    primaryDark: "#7c3aed",
    secondary: "#64748b",
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#8b5cf6",
  },
  green: {
    primary: "#22c55e",
    primaryLight: "#4ade80",
    primaryDark: "#16a34a",
    secondary: "#64748b",
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
  },
  orange: {
    primary: "#f97316",
    primaryLight: "#fb923c",
    primaryDark: "#ea580c",
    secondary: "#64748b",
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
  },
  red: {
    primary: "#ef4444",
    primaryLight: "#f87171",
    primaryDark: "#dc2626",
    secondary: "#64748b",
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
  },
  pink: {
    primary: "#ec4899",
    primaryLight: "#f472b6",
    primaryDark: "#db2777",
    secondary: "#64748b",
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
  },
};

type ThemeEventCallback = (config: ThemeConfig) => void;

export class ThemeService {
  private config: ThemeConfig;
  private listeners: Set<ThemeEventCallback> = new Set();
  private mediaQuery: MediaQueryList | null = null;

  constructor(config: Partial<ThemeConfig> = {}) {
    this.config = { ...DEFAULT_THEME_CONFIG, ...this.loadConfig(), ...config };
    this.initMediaQuery();
    this.applyTheme();
  }

  private loadConfig(): Partial<ThemeConfig> {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem(DEFAULT_THEME_CONFIG.storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore parse errors
    }
    return {};
  }

  private saveConfig(): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      DEFAULT_THEME_CONFIG.storageKey,
      JSON.stringify(this.config)
    );
  }

  private initMediaQuery(): void {
    if (typeof window === "undefined") return;
    this.mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    this.mediaQuery.addEventListener("change", () => this.applyTheme());
  }

  private applyTheme(): void {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    const isDark = this.isDarkMode();

    // Apply mode
    if (isDark) {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }

    // Apply colors
    const palette = COLOR_PALETTES[this.config.primaryColor];
    root.style.setProperty("--color-primary", palette.primary);
    root.style.setProperty("--color-primary-light", palette.primaryLight);
    root.style.setProperty("--color-primary-dark", palette.primaryDark);
    root.style.setProperty("--color-secondary", palette.secondary);
    root.style.setProperty("--color-success", palette.success);
    root.style.setProperty("--color-warning", palette.warning);
    root.style.setProperty("--color-error", palette.error);
    root.style.setProperty("--color-info", palette.info);

    // Apply font size
    const fontSizeMap = {
      small: "14px",
      medium: "16px",
      large: "18px",
    };
    root.style.setProperty("--font-size-base", fontSizeMap[this.config.fontSize]);

    // Apply border radius
    const radiusMap = {
      none: "0px",
      small: "4px",
      medium: "8px",
      large: "16px",
    };
    root.style.setProperty("--border-radius", radiusMap[this.config.borderRadius]);

    // Apply animations
    if (this.config.animations) {
      root.classList.remove("reduce-motion");
    } else {
      root.classList.add("reduce-motion");
    }

    // Apply compact mode
    if (this.config.compactMode) {
      root.classList.add("compact");
    } else {
      root.classList.remove("compact");
    }
  }

  isDarkMode(): boolean {
    if (this.config.mode === "auto") {
      return this.mediaQuery?.matches ?? false;
    }
    return this.config.mode === "dark";
  }

  getConfig(): ThemeConfig {
    return { ...this.config };
  }

  setMode(mode: ThemeMode): void {
    if (this.config.mode === mode) return;
    this.config.mode = mode;
    this.saveConfig();
    this.applyTheme();
    this.notifyListeners();
  }

  setPrimaryColor(color: ThemeColor): void {
    if (this.config.primaryColor === color) return;
    this.config.primaryColor = color;
    this.saveConfig();
    this.applyTheme();
    this.notifyListeners();
  }

  setFontSize(size: ThemeConfig["fontSize"]): void {
    if (this.config.fontSize === size) return;
    this.config.fontSize = size;
    this.saveConfig();
    this.applyTheme();
    this.notifyListeners();
  }

  setBorderRadius(radius: ThemeConfig["borderRadius"]): void {
    if (this.config.borderRadius === radius) return;
    this.config.borderRadius = radius;
    this.saveConfig();
    this.applyTheme();
    this.notifyListeners();
  }

  setAnimations(enabled: boolean): void {
    if (this.config.animations === enabled) return;
    this.config.animations = enabled;
    this.saveConfig();
    this.applyTheme();
    this.notifyListeners();
  }

  setCompactMode(enabled: boolean): void {
    if (this.config.compactMode === enabled) return;
    this.config.compactMode = enabled;
    this.saveConfig();
    this.applyTheme();
    this.notifyListeners();
  }

  updateConfig(updates: Partial<ThemeConfig>): void {
    let changed = false;
    for (const [key, value] of Object.entries(updates)) {
      if (key in this.config && this.config[key as keyof ThemeConfig] !== value) {
        (this.config as Record<string, unknown>)[key] = value;
        changed = true;
      }
    }
    if (changed) {
      this.saveConfig();
      this.applyTheme();
      this.notifyListeners();
    }
  }

  resetConfig(): void {
    this.config = { ...DEFAULT_THEME_CONFIG };
    this.saveConfig();
    this.applyTheme();
    this.notifyListeners();
  }

  onThemeChange(callback: ThemeEventCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    const config = this.getConfig();
    this.listeners.forEach((callback) => callback(config));
  }

  getCSSVariables(): Record<string, string> {
    const isDark = this.isDarkMode();
    const palette = COLOR_PALETTES[this.config.primaryColor];

    return {
      "--color-primary": palette.primary,
      "--color-primary-light": palette.primaryLight,
      "--color-primary-dark": palette.primaryDark,
      "--color-secondary": palette.secondary,
      "--color-success": palette.success,
      "--color-warning": palette.warning,
      "--color-error": palette.error,
      "--color-info": palette.info,
      "--bg-primary": isDark ? "#1f2937" : "#ffffff",
      "--bg-secondary": isDark ? "#111827" : "#f3f4f6",
      "--bg-tertiary": isDark ? "#374151" : "#e5e7eb",
      "--text-primary": isDark ? "#f9fafb" : "#111827",
      "--text-secondary": isDark ? "#d1d5db" : "#6b7280",
      "--text-tertiary": isDark ? "#9ca3af" : "#9ca3af",
      "--border-color": isDark ? "#374151" : "#e5e7eb",
      "--font-size-base":
        this.config.fontSize === "small" ? "14px" : this.config.fontSize === "large" ? "18px" : "16px",
      "--border-radius":
        this.config.borderRadius === "none"
          ? "0px"
          : this.config.borderRadius === "small"
          ? "4px"
          : this.config.borderRadius === "large"
          ? "16px"
          : "8px",
    };
  }
}

export const themeService = new ThemeService();
