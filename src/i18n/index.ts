import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 翻译资源
const resources = {
  'zh-CN': {
    common: {
      loading: '正在加载...',
      confirm: '确认',
      cancel: '取消',
      close: '关闭',
      back: '返回',
      save: '保存',
      load: '读取',
      delete: '删除',
      error_boundary: {
        title: '发生错误',
        retry: '重试',
        back_to_menu: '返回主菜单',
      },
    },
    menu: {
      title: '谋天下：问道百家',
      start_game: '开始游戏',
      story: '争鸣史',
      collection: '卡牌收藏',
      characters: '名士录',
      settings: '设置',
      quit: '退出',
    },
    battle: {
      phase: {
        ming_bian: '明辩',
        an_mou: '暗谋',
        reveal: '揭示',
        resolve: '结算',
      },
      result: {
        victory: '胜利',
        defeat: '失败',
        draw: '平局',
      },
      card_types: {
        argument: '立论',
        evidence: '策术',
        counter: '反诘',
        trap: '玄章',
        guest: '门客',
      },
    },
    story: {
      chapter_labels: {
        prolog: '序章：入学',
        chapter_1: '第一章：百家初识',
        chapter_2: '第二章：论辩风云',
        chapter_3: '第三章：道术争锋',
        chapter_4: '第四章：纵横捭阖',
        chapter_5: '第五章：兼爱非攻',
        chapter_6: '第六章：法术之变',
        chapter_7: '第七章：阴阳玄妙',
        chapter_8: '第八章：终章',
      },
      stats: {
        fame: '声望',
        wisdom: '智慧',
        charm: '魅力',
        courage: '勇气',
        insight: '洞察',
      },
      factions: {
        confucian: '儒家',
        legalist: '法家',
        daoist: '道家',
        mohist: '墨家',
        strategist: '兵家',
        diplomatist: '纵横家',
        yin_yang: '阴阳家',
        eclectic: '杂家',
      },
    },
    settings: {
      title: '设置',
      audio: '音频',
      master_volume: '主音量',
      bgm_volume: '背景音乐',
      sfx_volume: '音效',
      display: '显示',
      brightness: '亮度',
      fullscreen: '全屏',
      language: '语言',
    },
  },
  'en-US': {
    common: {
      loading: 'Loading...',
      confirm: 'Confirm',
      cancel: 'Cancel',
      close: 'Close',
      back: 'Back',
      save: 'Save',
      load: 'Load',
      delete: 'Delete',
      error_boundary: {
        title: 'An Error Occurred',
        retry: 'Retry',
        back_to_menu: 'Back to Menu',
      },
    },
    menu: {
      title: 'Seeking the Way',
      start_game: 'Start Game',
      story: 'Story Mode',
      collection: 'Card Collection',
      characters: 'Characters',
      settings: 'Settings',
      quit: 'Quit',
    },
    battle: {
      phase: {
        ming_bian: 'Open Debate',
        an_mou: 'Hidden Strategy',
        reveal: 'Reveal',
        resolve: 'Resolution',
      },
      result: {
        victory: 'Victory',
        defeat: 'Defeat',
        draw: 'Draw',
      },
      card_types: {
        argument: 'Argument',
        evidence: 'Evidence',
        counter: 'Counter',
        trap: 'Trap',
        guest: 'Guest',
      },
    },
    story: {
      chapter_labels: {
        prolog: 'Prologue: Enrollment',
        chapter_1: 'Chapter 1: Introduction to the Hundred Schools',
        chapter_2: 'Chapter 2: Debate Storm',
        chapter_3: 'Chapter 3: Way vs Technique',
        chapter_4: 'Chapter 4: Diplomatic Arts',
        chapter_5: 'Chapter 5: Universal Love',
        chapter_6: 'Chapter 6: Law and Technique',
        chapter_7: 'Chapter 7: Yin and Yang',
        chapter_8: 'Chapter 8: Finale',
      },
      stats: {
        fame: 'Fame',
        wisdom: 'Wisdom',
        charm: 'Charisma',
        courage: 'Courage',
        insight: 'Insight',
      },
      factions: {
        confucian: 'Confucianism',
        legalist: 'Legalism',
        daoist: 'Daoism',
        mohist: 'Mohism',
        strategist: 'Strategism',
        diplomatist: 'Diplomatism',
        yin_yang: 'Yin-Yang',
        eclectic: 'Eclecticism',
      },
    },
    settings: {
      title: 'Settings',
      audio: 'Audio',
      master_volume: 'Master Volume',
      bgm_volume: 'BGM Volume',
      sfx_volume: 'SFX Volume',
      display: 'Display',
      brightness: 'Brightness',
      fullscreen: 'Fullscreen',
      language: 'Language',
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'zh-CN',
    supportedLngs: ['zh-CN', 'en-US'],
    ns: ['common', 'menu', 'battle', 'story', 'settings'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'jixia.mvp.language',
    },
  });

export default i18n;