// I18nService - 国际化服务
// 提供多语言支持、语言切换、翻译管理等功能

export type Language = "zh-CN" | "zh-TW" | "en-US" | "ja-JP" | "ko-KR";

export interface TranslationDict {
  [key: string]: string | TranslationDict;
}

export interface I18nConfig {
  defaultLanguage: Language;
  fallbackLanguage: Language;
  supportedLanguages: Language[];
  storageKey: string;
}

export const DEFAULT_I18N_CONFIG: I18nConfig = {
  defaultLanguage: "zh-CN",
  fallbackLanguage: "zh-CN",
  supportedLanguages: ["zh-CN", "zh-TW", "en-US", "ja-JP", "ko-KR"],
  storageKey: "jixia_language",
};

export const TRANSLATIONS: Record<Language, TranslationDict> = {
  "zh-CN": {
    common: {
      confirm: "确认",
      cancel: "取消",
      close: "关闭",
      save: "保存",
      delete: "删除",
      edit: "编辑",
      create: "创建",
      search: "搜索",
      loading: "加载中...",
      error: "错误",
      success: "成功",
      warning: "警告",
      info: "提示",
    },
    battle: {
      title: "战斗",
      start: "开始战斗",
      end: "结束战斗",
      victory: "胜利！",
      defeat: "失败...",
      draw: "平局",
      turn: "第 {turn} 回合",
      yourTurn: "你的回合",
      enemyTurn: "敌方回合",
      mana: "法力",
      health: "生命值",
      attack: "攻击力",
      defense: "防御力",
      playCard: "打出卡牌",
      useSkill: "使用技能",
      endTurn: "结束回合",
      surrender: "投降",
    },
    card: {
      title: "卡牌",
      cost: "费用",
      type: "类型",
      rarity: "稀有度",
      description: "描述",
      attack: "攻击",
      health: "生命",
      effect: "效果",
      spell: "法术",
      minion: "随从",
      weapon: "武器",
      common: "普通",
      rare: "稀有",
      epic: "史诗",
      legendary: "传说",
    },
    deck: {
      title: "卡组",
      create: "创建卡组",
      edit: "编辑卡组",
      delete: "删除卡组",
      import: "导入卡组",
      export: "导出卡组",
      cards: "卡牌",
      count: "数量",
      limit: "上限",
      hero: "英雄",
    },
    shop: {
      title: "商店",
      buy: "购买",
      sell: "出售",
      currency: "货币",
      gold: "金币",
      gem: "宝石",
      dust: "奥术之尘",
      pack: "卡包",
      cosmetic: "外观",
    },
    settings: {
      title: "设置",
      language: "语言",
      sound: "音效",
      music: "音乐",
      graphics: "画质",
      account: "账户",
      privacy: "隐私",
      about: "关于",
    },
  },
  "zh-TW": {
    common: {
      confirm: "確認",
      cancel: "取消",
      close: "關閉",
      save: "儲存",
      delete: "刪除",
      edit: "編輯",
      create: "創建",
      search: "搜尋",
      loading: "載入中...",
      error: "錯誤",
      success: "成功",
      warning: "警告",
      info: "提示",
    },
    battle: {
      title: "戰鬥",
      start: "開始戰鬥",
      end: "結束戰鬥",
      victory: "勝利！",
      defeat: "失敗...",
      draw: "平局",
      turn: "第 {turn} 回合",
      yourTurn: "你的回合",
      enemyTurn: "敵方回合",
      mana: "法力",
      health: "生命值",
      attack: "攻擊力",
      defense: "防禦力",
      playCard: "打出卡牌",
      useSkill: "使用技能",
      endTurn: "結束回合",
      surrender: "投降",
    },
    card: {
      title: "卡牌",
      cost: "費用",
      type: "類型",
      rarity: "稀有度",
      description: "描述",
      attack: "攻擊",
      health: "生命",
      effect: "效果",
      spell: "法術",
      minion: "隨從",
      weapon: "武器",
      common: "普通",
      rare: "稀有",
      epic: "史詩",
      legendary: "傳說",
    },
    deck: {
      title: "卡組",
      create: "創建卡組",
      edit: "編輯卡組",
      delete: "刪除卡組",
      import: "導入卡組",
      export: "導出卡組",
      cards: "卡牌",
      count: "數量",
      limit: "上限",
      hero: "英雄",
    },
    shop: {
      title: "商店",
      buy: "購買",
      sell: "出售",
      currency: "貨幣",
      gold: "金幣",
      gem: "寶石",
      dust: "奧術之塵",
      pack: "卡包",
      cosmetic: "外觀",
    },
    settings: {
      title: "設置",
      language: "語言",
      sound: "音效",
      music: "音樂",
      graphics: "畫質",
      account: "賬戶",
      privacy: "隱私",
      about: "關於",
    },
  },
  "en-US": {
    common: {
      confirm: "Confirm",
      cancel: "Cancel",
      close: "Close",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      create: "Create",
      search: "Search",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      warning: "Warning",
      info: "Info",
    },
    battle: {
      title: "Battle",
      start: "Start Battle",
      end: "End Battle",
      victory: "Victory!",
      defeat: "Defeat...",
      draw: "Draw",
      turn: "Turn {turn}",
      yourTurn: "Your Turn",
      enemyTurn: "Enemy Turn",
      mana: "Mana",
      health: "Health",
      attack: "Attack",
      defense: "Defense",
      playCard: "Play Card",
      useSkill: "Use Skill",
      endTurn: "End Turn",
      surrender: "Surrender",
    },
    card: {
      title: "Card",
      cost: "Cost",
      type: "Type",
      rarity: "Rarity",
      description: "Description",
      attack: "Attack",
      health: "Health",
      effect: "Effect",
      spell: "Spell",
      minion: "Minion",
      weapon: "Weapon",
      common: "Common",
      rare: "Rare",
      epic: "Epic",
      legendary: "Legendary",
    },
    deck: {
      title: "Deck",
      create: "Create Deck",
      edit: "Edit Deck",
      delete: "Delete Deck",
      import: "Import Deck",
      export: "Export Deck",
      cards: "Cards",
      count: "Count",
      limit: "Limit",
      hero: "Hero",
    },
    shop: {
      title: "Shop",
      buy: "Buy",
      sell: "Sell",
      currency: "Currency",
      gold: "Gold",
      gem: "Gem",
      dust: "Arcane Dust",
      pack: "Card Pack",
      cosmetic: "Cosmetic",
    },
    settings: {
      title: "Settings",
      language: "Language",
      sound: "Sound",
      music: "Music",
      graphics: "Graphics",
      account: "Account",
      privacy: "Privacy",
      about: "About",
    },
  },
  "ja-JP": {
    common: {
      confirm: "確認",
      cancel: "キャンセル",
      close: "閉じる",
      save: "保存",
      delete: "削除",
      edit: "編集",
      create: "作成",
      search: "検索",
      loading: "読み込み中...",
      error: "エラー",
      success: "成功",
      warning: "警告",
      info: "情報",
    },
    battle: {
      title: "バトル",
      start: "バトル開始",
      end: "バトル終了",
      victory: "勝利！",
      defeat: "敗北...",
      draw: "引き分け",
      turn: "ターン {turn}",
      yourTurn: "あなたのターン",
      enemyTurn: "敵のターン",
      mana: "マナ",
      health: "体力",
      attack: "攻撃力",
      defense: "防御力",
      playCard: "カードを出す",
      useSkill: "スキルを使う",
      endTurn: "ターン終了",
      surrender: "降参",
    },
    card: {
      title: "カード",
      cost: "コスト",
      type: "タイプ",
      rarity: "レアリティ",
      description: "説明",
      attack: "攻撃",
      health: "体力",
      effect: "効果",
      spell: "スペル",
      minion: "ミニオン",
      weapon: "武器",
      common: "コモン",
      rare: "レア",
      epic: "エピック",
      legendary: "レジェンド",
    },
    deck: {
      title: "デッキ",
      create: "デッキ作成",
      edit: "デッキ編集",
      delete: "デッキ削除",
      import: "デッキインポート",
      export: "デッキエクスポート",
      cards: "カード",
      count: "枚数",
      limit: "上限",
      hero: "ヒーロー",
    },
    shop: {
      title: "ショップ",
      buy: "購入",
      sell: "売却",
      currency: "通貨",
      gold: "ゴールド",
      gem: "ジェム",
      dust: "アーケインダスト",
      pack: "カードパック",
      cosmetic: "外見",
    },
    settings: {
      title: "設定",
      language: "言語",
      sound: "効果音",
      music: "音楽",
      graphics: "画質",
      account: "アカウント",
      privacy: "プライバシー",
      about: "について",
    },
  },
  "ko-KR": {
    common: {
      confirm: "확인",
      cancel: "취소",
      close: "닫기",
      save: "저장",
      delete: "삭제",
      edit: "편집",
      create: "생성",
      search: "검색",
      loading: "로딩 중...",
      error: "오류",
      success: "성공",
      warning: "경고",
      info: "정보",
    },
    battle: {
      title: "전투",
      start: "전투 시작",
      end: "전투 종료",
      victory: "승리!",
      defeat: "패배...",
      draw: "무승부",
      turn: "턴 {turn}",
      yourTurn: "당신의 턴",
      enemyTurn: "적의 턴",
      mana: "마나",
      health: "체력",
      attack: "공격력",
      defense: "방어력",
      playCard: "카드 사용",
      useSkill: "스킬 사용",
      endTurn: "턴 종료",
      surrender: "항복",
    },
    card: {
      title: "카드",
      cost: "비용",
      type: "유형",
      rarity: "희귀도",
      description: "설명",
      attack: "공격",
      health: "체력",
      effect: "효과",
      spell: "주문",
      minion: "하수인",
      weapon: "무기",
      common: "일반",
      rare: "희귀",
      epic: "영웅",
      legendary: "전설",
    },
    deck: {
      title: "덱",
      create: "덱 생성",
      edit: "덱 편집",
      delete: "덱 삭제",
      import: "덱 가져오기",
      export: "덱 내보내기",
      cards: "카드",
      count: "수량",
      limit: "제한",
      hero: "영웅",
    },
    shop: {
      title: "상점",
      buy: "구매",
      sell: "판매",
      currency: "화폐",
      gold: "골드",
      gem: "보석",
      dust: "신비한 가루",
      pack: "카드 팩",
      cosmetic: "외형",
    },
    settings: {
      title: "설정",
      language: "언어",
      sound: "효과음",
      music: "음악",
      graphics: "그래픽",
      account: "계정",
      privacy: "개인정보",
      about: "정보",
    },
  },
};

type I18nEventCallback = (language: Language) => void;

export class I18nService {
  private config: I18nConfig;
  private currentLanguage: Language;
  private listeners: Set<I18nEventCallback> = new Set();

  constructor(config: Partial<I18nConfig> = {}) {
    this.config = { ...DEFAULT_I18N_CONFIG, ...config };
    this.currentLanguage = this.loadLanguage();
  }

  private loadLanguage(): Language {
    if (typeof window === "undefined") return this.config.defaultLanguage;
    const saved = localStorage.getItem(this.config.storageKey) as Language;
    if (saved && this.config.supportedLanguages.includes(saved)) {
      return saved;
    }
    return this.detectLanguage();
  }

  private detectLanguage(): Language {
    if (typeof navigator === "undefined") return this.config.defaultLanguage;
    const browserLang = navigator.language as Language;
    if (this.config.supportedLanguages.includes(browserLang)) {
      return browserLang;
    }
    if (browserLang.startsWith("zh")) {
      return browserLang.includes("TW") || browserLang.includes("HK")
        ? "zh-TW"
        : "zh-CN";
    }
    if (browserLang.startsWith("en")) return "en-US";
    if (browserLang.startsWith("ja")) return "ja-JP";
    if (browserLang.startsWith("ko")) return "ko-KR";
    return this.config.defaultLanguage;
  }

  private saveLanguage(): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.config.storageKey, this.currentLanguage);
  }

  getLanguage(): Language {
    return this.currentLanguage;
  }

  setLanguage(language: Language): boolean {
    if (!this.config.supportedLanguages.includes(language)) {
      return false;
    }
    if (this.currentLanguage === language) return true;
    this.currentLanguage = language;
    this.saveLanguage();
    this.notifyListeners();
    return true;
  }

  getSupportedLanguages(): Language[] {
    return [...this.config.supportedLanguages];
  }

  t(key: string, params?: Record<string, string | number>): string {
    const translation = this.getTranslation(key);
    if (!params) return translation;
    return this.interpolate(translation, params);
  }

  private getTranslation(key: string): string {
    const keys = key.split(".");
    let current: TranslationDict | string | undefined =
      TRANSLATIONS[this.currentLanguage];

    for (const k of keys) {
      if (typeof current !== "object" || current === null) {
        return this.getFallbackTranslation(key);
      }
      current = current[k];
    }

    if (typeof current === "string") {
      return current;
    }

    return this.getFallbackTranslation(key);
  }

  private getFallbackTranslation(key: string): string {
    if (this.currentLanguage === this.config.fallbackLanguage) {
      return key;
    }

    const keys = key.split(".");
    let current: TranslationDict | string | undefined =
      TRANSLATIONS[this.config.fallbackLanguage];

    for (const k of keys) {
      if (typeof current !== "object" || current === null) {
        return key;
      }
      current = current[k];
    }

    return typeof current === "string" ? current : key;
  }

  private interpolate(
    template: string,
    params: Record<string, string | number>
  ): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      const value = params[key];
      return value !== undefined ? String(value) : match;
    });
  }

  onLanguageChange(callback: I18nEventCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach((callback) => callback(this.currentLanguage));
  }

  formatNumber(num: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.currentLanguage, options).format(num);
  }

  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.currentLanguage, options).format(date);
  }

  formatRelativeTime(
    value: number,
    unit: Intl.RelativeTimeFormatUnit
  ): string {
    const formatter = new Intl.RelativeTimeFormat(this.currentLanguage, {
      numeric: "auto",
    });
    return formatter.format(value, unit);
  }

  getTextDirection(): "ltr" | "rtl" {
    const rtlLanguages = ["ar", "he", "fa", "ur"];
    const lang = this.currentLanguage.split("-")[0];
    return rtlLanguages.includes(lang) ? "rtl" : "ltr";
  }
}

export const i18nService = new I18nService();
