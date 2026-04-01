export type ThemeId = 'ancient-gold' | 'ink-wash' | 'jade-emerald';

export interface ThemeColors {
  id: ThemeId;
  name: string;
  nameZh: string;
  description: string;
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    secondaryLight: string;
    accent: string;
    accentLight: string;
    background: string;
    backgroundLight: string;
    backgroundDark: string;
    surface: string;
    surfaceLight: string;
    surfaceDark: string;
    text: string;
    textMuted: string;
    textLight: string;
    border: string;
    borderLight: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
    gold: string;
    goldLight: string;
    goldDark: string;
  };
  gradients: {
    primary: string;
    secondary: string;
    accent: string;
    surface: string;
    card: string;
    hero: string;
    enemy: string;
  };
  shadows: {
    primary: string;
    glow: string;
    card: string;
    elevated: string;
  };
}

export const themes: Record<ThemeId, ThemeColors> = {
  'ancient-gold': {
    id: 'ancient-gold',
    name: 'Ancient Gold',
    nameZh: '古韵金辉',
    description: '古典中国风，以金色为主调，搭配深褐色背景，营造庄重典雅的氛围',
    colors: {
      primary: '#d4a520',
      primaryLight: '#f5e6b8',
      primaryDark: '#8b6914',
      secondary: '#4a7c6f',
      secondaryLight: '#6ba396',
      accent: '#8b2e2e',
      accentLight: '#b84848',
      background: '#0f0f1a',
      backgroundLight: '#1a1a2e',
      backgroundDark: '#080810',
      surface: '#10192e',
      surfaceLight: '#1a2840',
      surfaceDark: '#0a1020',
      text: '#f5e6b8',
      textMuted: '#a7c5ba',
      textLight: '#ffffff',
      border: 'rgba(212, 165, 32, 0.4)',
      borderLight: 'rgba(212, 165, 32, 0.6)',
      success: '#2d5a3d',
      warning: '#8b6914',
      danger: '#8b2e2e',
      info: '#2d4a5a',
      gold: '#d4a520',
      goldLight: '#f5e6b8',
      goldDark: '#8b6914',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #d4a520 0%, #8b6914 100%)',
      secondary: 'linear-gradient(135deg, #4a7c6f 0%, #2d4a44 100%)',
      accent: 'linear-gradient(135deg, #8b2e2e 0%, #5a1e1e 100%)',
      surface: 'linear-gradient(180deg, #10192e 0%, #0a1020 100%)',
      card: 'linear-gradient(180deg, #1a1107 0%, #0d0a04 100%)',
      hero: 'linear-gradient(180deg, #1a3a5c 0%, #0d1f30 100%)',
      enemy: 'linear-gradient(180deg, #5c1a1a 0%, #300d0d 100%)',
    },
    shadows: {
      primary: '0 0 20px rgba(212, 165, 32, 0.3)',
      glow: '0 0 30px rgba(212, 165, 32, 0.5)',
      card: '0 4px 20px rgba(0, 0, 0, 0.5)',
      elevated: '0 8px 40px rgba(0, 0, 0, 0.6)',
    },
  },
  'ink-wash': {
    id: 'ink-wash',
    name: 'Ink Wash',
    nameZh: '水墨丹青',
    description: '水墨画风格，以黑白灰为主调，点缀朱砂红，展现文人雅士的清雅意境',
    colors: {
      primary: '#4a4a4a',
      primaryLight: '#7a7a7a',
      primaryDark: '#2a2a2a',
      secondary: '#6b8e7a',
      secondaryLight: '#8fb09a',
      accent: '#c23a3a',
      accentLight: '#e05a5a',
      background: '#0a0a0a',
      backgroundLight: '#151515',
      backgroundDark: '#050505',
      surface: '#1a1a1a',
      surfaceLight: '#252525',
      surfaceDark: '#101010',
      text: '#e8e8e8',
      textMuted: '#9a9a9a',
      textLight: '#ffffff',
      border: 'rgba(255, 255, 255, 0.15)',
      borderLight: 'rgba(255, 255, 255, 0.25)',
      success: '#4a7a5a',
      warning: '#8a7a3a',
      danger: '#c23a3a',
      info: '#3a5a7a',
      gold: '#b8a060',
      goldLight: '#d4c090',
      goldDark: '#8a7040',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #4a4a4a 0%, #2a2a2a 100%)',
      secondary: 'linear-gradient(135deg, #6b8e7a 0%, #4a6a5a 100%)',
      accent: 'linear-gradient(135deg, #c23a3a 0%, #8a2a2a 100%)',
      surface: 'linear-gradient(180deg, #1a1a1a 0%, #101010 100%)',
      card: 'linear-gradient(180deg, #202020 0%, #151515 100%)',
      hero: 'linear-gradient(180deg, #2a3a4a 0%, #1a2530 100%)',
      enemy: 'linear-gradient(180deg, #4a2a2a 0%, #2a1515 100%)',
    },
    shadows: {
      primary: '0 0 20px rgba(255, 255, 255, 0.1)',
      glow: '0 0 30px rgba(255, 255, 255, 0.15)',
      card: '0 4px 20px rgba(0, 0, 0, 0.8)',
      elevated: '0 8px 40px rgba(0, 0, 0, 0.9)',
    },
  },
  'jade-emerald': {
    id: 'jade-emerald',
    name: 'Jade Emerald',
    nameZh: '碧玉青瓷',
    description: '青瓷玉器风格，以青绿色为主调，搭配象牙白，呈现温润如玉的质感',
    colors: {
      primary: '#4a8b7a',
      primaryLight: '#6ab89a',
      primaryDark: '#2d5a4a',
      secondary: '#8b9a6a',
      secondaryLight: '#aaba8a',
      accent: '#c47840',
      accentLight: '#da9a60',
      background: '#0a1210',
      backgroundLight: '#12201a',
      backgroundDark: '#060a08',
      surface: '#142420',
      surfaceLight: '#1e3630',
      surfaceDark: '#0c1814',
      text: '#e8f0ea',
      textMuted: '#a0b8a8',
      textLight: '#ffffff',
      border: 'rgba(74, 139, 122, 0.4)',
      borderLight: 'rgba(74, 139, 122, 0.6)',
      success: '#3a7a5a',
      warning: '#a08040',
      danger: '#a04040',
      info: '#407080',
      gold: '#c4a060',
      goldLight: '#dab880',
      goldDark: '#907040',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #4a8b7a 0%, #2d5a4a 100%)',
      secondary: 'linear-gradient(135deg, #8b9a6a 0%, #5a6a4a 100%)',
      accent: 'linear-gradient(135deg, #c47840 0%, #8a5030 100%)',
      surface: 'linear-gradient(180deg, #142420 0%, #0c1814 100%)',
      card: 'linear-gradient(180deg, #1a2a24 0%, #101a14 100%)',
      hero: 'linear-gradient(180deg, #2a4a4a 0%, #1a2a2a 100%)',
      enemy: 'linear-gradient(180deg, #4a2a2a 0%, #2a1a1a 100%)',
    },
    shadows: {
      primary: '0 0 20px rgba(74, 139, 122, 0.3)',
      glow: '0 0 30px rgba(74, 139, 122, 0.5)',
      card: '0 4px 20px rgba(0, 0, 0, 0.5)',
      elevated: '0 8px 40px rgba(0, 0, 0, 0.6)',
    },
  },
};

export const defaultTheme: ThemeId = 'ancient-gold';

export function getTheme(id: ThemeId): ThemeColors {
  return themes[id] || themes[defaultTheme];
}

export function getThemeColors(id: ThemeId): ThemeColors['colors'] {
  return getTheme(id).colors;
}

export function getThemeGradients(id: ThemeId): ThemeColors['gradients'] {
  return getTheme(id).gradients;
}

export function getThemeShadows(id: ThemeId): ThemeColors['shadows'] {
  return getTheme(id).shadows;
}
