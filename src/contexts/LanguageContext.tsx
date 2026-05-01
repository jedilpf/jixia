/**
 * 语言上下文
 * 提供全局语言设置，供所有组件访问
 */

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export type Language = 'zh' | 'en' | 'ja';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LANGUAGE_STORAGE_KEY = 'jixia_language';
const DEFAULT_LANGUAGE: Language = 'zh';

const LanguageContext = createContext<LanguageContextValue>({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === 'zh' || stored === 'en' || stored === 'ja') {
      return stored as Language;
    }
    return DEFAULT_LANGUAGE;
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

/**
 * 获取语言按钮的显示标签（根据当前语言显示）
 */
export function getLanguageLabels(currentLang: Language): Record<Language, string> {
  const labels: Record<Language, Record<Language, string>> = {
    zh: { zh: '中文', en: '英语', ja: '日语' },
    en: { zh: 'Chinese', en: 'English', ja: 'Japanese' },
    ja: { zh: '中国語', en: '英語', ja: '日本語' },
  };
  return labels[currentLang];
}

/**
 * 判断是否显示英文辅助文本
 */
export function useShowEnglish(): boolean {
  const { language } = useLanguage();
  return language === 'en';
}

/**
 * 判断是否显示中文文本
 */
export function useShowChinese(): boolean {
  const { language } = useLanguage();
  return language === 'zh';
}

/**
 * 判断是否为日语模式
 */
export function useShowJapanese(): boolean {
  const { language } = useLanguage();
  return language === 'ja';
}

/**
 * 根据语言设置选择显示文本
 * 日语模式下 fallback 到英文
 */
export function useLocalizedText(zhText: string, enText: string, jaText?: string): string {
  const { language } = useLanguage();
  if (language === 'zh') return zhText;
  if (language === 'ja' && jaText) return jaText;
  return enText; // en 或 ja 无日语文本时 fallback 到英文
}