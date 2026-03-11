import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { ThemeId, ThemeColors, themes, defaultTheme, getTheme } from '@/config/themes';

interface ThemeContextType {
  currentTheme: ThemeId;
  theme: ThemeColors;
  setTheme: (id: ThemeId) => void;
  themeIds: ThemeId[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'jixia-theme-preference';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null;
      if (saved && themes[saved]) {
        return saved;
      }
    }
    return defaultTheme;
  });

  const theme = getTheme(currentTheme);

  const setTheme = useCallback((id: ThemeId) => {
    if (themes[id]) {
      setCurrentTheme(id);
      localStorage.setItem(THEME_STORAGE_KEY, id);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const colors = theme.colors;
    
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-primary-light', colors.primaryLight);
    root.style.setProperty('--color-primary-dark', colors.primaryDark);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-secondary-light', colors.secondaryLight);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-accent-light', colors.accentLight);
    root.style.setProperty('--color-background', colors.background);
    root.style.setProperty('--color-background-light', colors.backgroundLight);
    root.style.setProperty('--color-background-dark', colors.backgroundDark);
    root.style.setProperty('--color-surface', colors.surface);
    root.style.setProperty('--color-surface-light', colors.surfaceLight);
    root.style.setProperty('--color-surface-dark', colors.surfaceDark);
    root.style.setProperty('--color-text', colors.text);
    root.style.setProperty('--color-text-muted', colors.textMuted);
    root.style.setProperty('--color-text-light', colors.textLight);
    root.style.setProperty('--color-border', colors.border);
    root.style.setProperty('--color-border-light', colors.borderLight);
    root.style.setProperty('--color-success', colors.success);
    root.style.setProperty('--color-warning', colors.warning);
    root.style.setProperty('--color-danger', colors.danger);
    root.style.setProperty('--color-info', colors.info);
    root.style.setProperty('--color-gold', colors.gold);
    root.style.setProperty('--color-gold-light', colors.goldLight);
    root.style.setProperty('--color-gold-dark', colors.goldDark);

    const gradients = theme.gradients;
    root.style.setProperty('--gradient-primary', gradients.primary);
    root.style.setProperty('--gradient-secondary', gradients.secondary);
    root.style.setProperty('--gradient-accent', gradients.accent);
    root.style.setProperty('--gradient-surface', gradients.surface);
    root.style.setProperty('--gradient-card', gradients.card);
    root.style.setProperty('--gradient-hero', gradients.hero);
    root.style.setProperty('--gradient-enemy', gradients.enemy);

    const shadows = theme.shadows;
    root.style.setProperty('--shadow-primary', shadows.primary);
    root.style.setProperty('--shadow-glow', shadows.glow);
    root.style.setProperty('--shadow-card', shadows.card);
    root.style.setProperty('--shadow-elevated', shadows.elevated);

    document.body.style.backgroundColor = colors.background;
    document.body.style.color = colors.text;
  }, [theme]);

  const themeIds = Object.keys(themes) as ThemeId[];

  return (
    <ThemeContext.Provider value={{ currentTheme, theme, setTheme, themeIds }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function useThemeColors(): ThemeColors['colors'] {
  const { theme } = useTheme();
  return theme.colors;
}

export function useThemeGradients(): ThemeColors['gradients'] {
  const { theme } = useTheme();
  return theme.gradients;
}

export function useThemeShadows(): ThemeColors['shadows'] {
  const { theme } = useTheme();
  return theme.shadows;
}
