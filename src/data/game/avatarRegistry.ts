/**
 * 稷下名士影谱 (Avatar Registry) - 后端数据层
 * 
 * 职责：
 * 1. 集中管理所有可用的头像资产。
 * 2. 处理头像的解锁逻辑与分类。
 * 3. 供前端 UI（如个人面板、论战界面）调用的数据源。
 */

export interface AvatarInfo {
  id: string;
  name: string;
  category: 'scholar' | 'monument' | 'faction' | 'special';
  assetPath: string; // 头像小图路径
  fullPath: string;  // 对应的人物立绘路径（可选）
  unlockDesc: string;
  isUnlocked: boolean;
  factionId?: string;
}

/**
 * 核心数据表
 */
export const AVATAR_DATABASE: AvatarInfo[] = [
  {
    id: 'mozi_default',
    name: '墨翟',
    category: 'scholar',
    assetPath: '/assets/chars/avatars/mozi.png',
    fullPath: '/assets/chars/stand/mozi.png',
    unlockDesc: '初始获得',
    isUnlocked: true,
    factionId: 'mohist',
  },
  {
    id: 'hanfeizi_default',
    name: '韩非',
    category: 'scholar',
    assetPath: '/assets/chars/avatars/hanfeizi.png',
    fullPath: '/assets/chars/stand/hanfeizi.png',
    unlockDesc: '初始获得',
    isUnlocked: true,
    factionId: 'legalist',
  },
  {
    id: 'zhuangzi_default',
    name: '庄周',
    category: 'scholar',
    assetPath: '/assets/chars/avatars/zhuangzi.png',
    fullPath: '/assets/chars/stand/zhuangzi.png',
    unlockDesc: '初始获得',
    isUnlocked: true,
    factionId: 'daoist',
  },
  {
    id: 'kongqiu_default',
    name: '孔丘',
    category: 'scholar',
    assetPath: '/assets/chars/avatars/kongqiu.png',
    fullPath: '/assets/chars/stand/kongqiu.png',
    unlockDesc: '初始获得',
    isUnlocked: true,
    factionId: 'confucian',
  },
  // 等级专属：虚拟人物
  {
    id: 'rank_scholar_lv30',
    name: '论道秀才',
    category: 'scholar',
    assetPath: '/assets/chars/avatars/scholar_lv30.png',
    fullPath: '/assets/chars/stand/scholar_lv30.png',
    unlockDesc: '达到等级 30 解锁',
    isUnlocked: false,
  },
  {
    id: 'rank_grandmaster_lv50',
    name: '稷下宗师',
    category: 'special',
    assetPath: '/assets/chars/avatars/grandmaster_lv50.png',
    fullPath: '/assets/chars/stand/grandmaster_lv50.png',
    unlockDesc: '达到等级 50 解锁',
    isUnlocked: false,
  },
  // 扩展：势力徽记
  {
    id: 'faction_mohist',
    name: '墨家印记',
    category: 'faction',
    assetPath: '/assets/factions/mohist_logo.png',
    fullPath: '/assets/factions/mohist_logo.png', // 势力徽记无立绘，使用同一图标
    unlockDesc: '墨家声望达到【推崇】',
    isUnlocked: true,
    factionId: 'mohist',
  },
  {
    id: 'faction_legalist',
    name: '法家印记',
    category: 'faction',
    assetPath: '/assets/factions/legalist_logo.png',
    fullPath: '/assets/factions/legalist_logo.png', // 势力徽记无立绘，使用同一图标
    unlockDesc: '法家声望达到【推崇】',
    isUnlocked: true,
    factionId: 'legalist',
  }
];

/**
 * 头像后端服务逻辑 (Mocking local state/persistence)
 */
export class AvatarBackend {
  private static SELECTED_KEY = 'jixia_selected_avatar_id';

  /**
   * 获取所有头像
   */
  static listAll() {
    return AVATAR_DATABASE;
  }

  /**
   * 获取当前选中的头像 ID
   */
  static getSelectedId(): string {
    return localStorage.getItem(this.SELECTED_KEY) || 'mozi_default';
  }

  /**
   * 选中头像
   */
  static select(id: string) {
    const avatar = AVATAR_DATABASE.find(a => a.id === id);
    if (avatar && avatar.isUnlocked) {
      localStorage.setItem(this.SELECTED_KEY, id);
      return true;
    }
    return false;
  }

  /**
   * 获取当前选中头像的详细信息
   */
  static getSelectedInfo(): AvatarInfo {
    const id = this.getSelectedId();
    return AVATAR_DATABASE.find(a => a.id === id) || AVATAR_DATABASE[0];
  }

  /**
   * 检查是否已解锁
   */
  static isUnlocked(id: string) {
    return AVATAR_DATABASE.find(a => a.id === id)?.isUnlocked || false;
  }
}
