import { LayoutSpec } from '@/types/layout';

// ==================== 联合类型定义 ====================

// 布局模块类型
export type LayoutModule =
  | 'hero'
  | 'skill'
  | 'weapon'
  | 'hand'
  | 'minion'
  | 'mana'
  | 'deck'
  | 'end-turn';

// 布局实例类型
export type LayoutInstance =
  | 'enemy-hero'
  | 'enemy-skill'
  | 'enemy-weapon'
  | 'enemy-hand'
  | 'enemy-minion'
  | 'enemy-mana'
  | 'enemy-deck'
  | 'player-hero'
  | 'player-skill'
  | 'player-weapon'
  | 'player-hand'
  | 'player-minion'
  | 'player-mana'
  | 'player-deck'
  | 'end-turn';

// ==================== 接口定义 ====================

// 画布尺寸
export interface Canvas {
  w: number;
  h: number;
}

// 安全区域
export interface SafeStage {
  x: number;
  y: number;
  w: number;
  h: number;
}

// 模块配置
export interface ModuleConfig {
  id: LayoutModule;
  name: string;
  description?: string;
}

// 组件配置
export interface ComponentConfig {
  id: string;
  module: LayoutModule;
  defaultW: number;
  defaultH: number;
}

// 实例配置
export interface InstanceConfig {
  id: LayoutInstance;
  component: string;
  module: LayoutModule;
}

// 布局项（展开前）
export interface LayoutItem {
  id: LayoutInstance | string;
  x: number | string;  // 支持表达式如 "center"
  y: number | string;
  w: number;
  h: number;
  label?: string;
  color?: string;
}

// 渲染节点（展开后）
export interface RenderNode {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  color: string;
}

// 完整布局配置
export interface LayoutConfig {
  version: string;
  canvas: Canvas;
  safe_stage: SafeStage;
  center_x: number;
  modules: ModuleConfig[];
  components: ComponentConfig[];
  instances: InstanceConfig[];
  layouts: LayoutItem[];
}

// ==================== 常量定义 ====================

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;
const CENTER_X = 960;

// ==================== expandLayouts 函数 ====================

/**
 * 展开布局，将所有相对位置转换为绝对像素坐标
 * @param layouts 布局项数组
 * @returns 展开后的渲染节点数组
 */
export function expandLayouts(layouts: LayoutItem[]): RenderNode[] {
  return layouts.map(item => {
    let x: number;
    let y: number;

    // 处理 x 坐标
    if (typeof item.x === 'string') {
      if (item.x === 'center') {
        x = CENTER_X - item.w / 2;
      } else if (item.x.startsWith('center+')) {
        const offset = parseInt(item.x.replace('center+', ''), 10);
        x = CENTER_X + offset;
      } else if (item.x.startsWith('center-')) {
        const offset = parseInt(item.x.replace('center-', ''), 10);
        x = CENTER_X - offset;
      } else {
        x = parseInt(item.x, 10) || 0;
      }
    } else {
      x = item.x;
    }

    // 处理 y 坐标
    if (typeof item.y === 'string') {
      y = parseInt(item.y, 10) || 0;
    } else {
      y = item.y;
    }

    return {
      id: item.id,
      x: Math.round(x),
      y: Math.round(y),
      w: Math.round(item.w),
      h: Math.round(item.h),
      label: item.label || item.id,
      color: item.color || '#e94560',
    };
  });
}

// ==================== LAYOUT 配置 ====================
// 按照参考图框架：稷下青铜机关城主题布局

export const LAYOUT: LayoutConfig = {
  version: "BATTLE_LAYOUT_V2_JIXIA",

  canvas: {
    w: CANVAS_WIDTH,
    h: CANVAS_HEIGHT
  },

  safe_stage: {
    x: 40,
    y: 30,
    w: 1840,
    h: 1020
  },

  center_x: CENTER_X,

  modules: [
    { id: 'hero', name: '英雄', description: '英雄角色区域' },
    { id: 'skill', name: '技能', description: '英雄技能按钮' },
    { id: 'weapon', name: '武器', description: '装备武器区域' },
    { id: 'hand', name: '手牌', description: '手牌区域' },
    { id: 'minion', name: '随从', description: '战场随从区域' },
    { id: 'mana', name: '法力', description: '法力水晶显示' },
    { id: 'deck', name: '牌库', description: '牌库区域' },
    { id: 'end-turn', name: '结束回合', description: '结束回合按钮' }
  ],

  components: [
    { id: 'hero-card', module: 'hero', defaultW: 200, defaultH: 260 },
    { id: 'skill-button', module: 'skill', defaultW: 70, defaultH: 70 },
    { id: 'weapon-slot', module: 'weapon', defaultW: 70, defaultH: 70 },
    { id: 'hand-card', module: 'hand', defaultW: 140, defaultH: 196 },
    { id: 'minion-card', module: 'minion', defaultW: 168, defaultH: 210 },
    { id: 'mana-crystal', module: 'mana', defaultW: 35, defaultH: 35 },
    { id: 'deck-pile', module: 'deck', defaultW: 120, defaultH: 168 },
    { id: 'end-turn-button', module: 'end-turn', defaultW: 110, defaultH: 80 }
  ],

  instances: [
    { id: 'enemy-hero', component: 'hero-card', module: 'hero' },
    { id: 'enemy-skill', component: 'skill-button', module: 'skill' },
    { id: 'enemy-weapon', component: 'weapon-slot', module: 'weapon' },
    { id: 'enemy-hand', component: 'hand-card', module: 'hand' },
    { id: 'enemy-minion', component: 'minion-card', module: 'minion' },
    { id: 'enemy-mana', component: 'mana-crystal', module: 'mana' },
    { id: 'enemy-deck', component: 'deck-pile', module: 'deck' },
    { id: 'player-hero', component: 'hero-card', module: 'hero' },
    { id: 'player-skill', component: 'skill-button', module: 'skill' },
    { id: 'player-weapon', component: 'weapon-slot', module: 'weapon' },
    { id: 'player-hand', component: 'hand-card', module: 'hand' },
    { id: 'player-minion', component: 'minion-card', module: 'minion' },
    { id: 'player-mana', component: 'mana-crystal', module: 'mana' },
    { id: 'player-deck', component: 'deck-pile', module: 'deck' },
    { id: 'end-turn', component: 'end-turn-button', module: 'end-turn' }
  ],

  layouts: [
    // ========== 敌方区域 ==========

    // 敌方英雄 - 居中
    { id: 'enemy-hero', x: 'center', y: 20, w: 200, h: 260, label: '敌方英雄', color: '#8b4513' },
    // 敌方牌库 - 右上角
    { id: 'enemy-deck', x: 1720, y: 60, w: 120, h: 168, label: '敌方牌库', color: '#5d4037' },
    // 敌方简牍区 - 右侧上方
    { id: 'enemy-book', x: 1720, y: 260, w: 120, h: 168, label: '敌方简牍', color: '#805a46' },

    // 敌方出世席(后排) Y=150
    { id: 'enemy-back-0', x: 688, y: 150, w: 168, h: 210, label: '敌后1', color: '#a1887f' },
    { id: 'enemy-back-1', x: 876, y: 150, w: 168, h: 210, label: '敌后2', color: '#a1887f' },
    { id: 'enemy-back-2', x: 1064, y: 150, w: 168, h: 210, label: '敌后3', color: '#a1887f' },

    // 敌方入世席(前排) Y=380
    { id: 'enemy-front-0', x: 688, y: 380, w: 168, h: 210, label: '敌前1', color: '#a1887f' },
    { id: 'enemy-front-1', x: 876, y: 380, w: 168, h: 210, label: '敌前2', color: '#a1887f' },
    { id: 'enemy-front-2', x: 1064, y: 380, w: 168, h: 210, label: '敌前3', color: '#a1887f' },

    // 敌方综合控制台 - 敌方英雄右侧
    { id: 'enemy-console', x: 1240, y: 20, w: 360, h: 130, label: '敌方控制台', color: '#8B7355' },

    // ========== 我方区域 ==========

    // 我方入世席(前排) Y=610
    { id: 'player-front-0', x: 688, y: 610, w: 168, h: 210, label: '我前1', color: '#8d6e63' },
    { id: 'player-front-1', x: 876, y: 610, w: 168, h: 210, label: '我前2', color: '#8d6e63' },
    { id: 'player-front-2', x: 1064, y: 610, w: 168, h: 210, label: '我前3', color: '#8d6e63' },

    // 我方出世席(后排) Y=840
    { id: 'player-back-0', x: 688, y: 840, w: 168, h: 210, label: '我后1', color: '#8d6e63' },
    { id: 'player-back-1', x: 876, y: 840, w: 168, h: 210, label: '我后2', color: '#8d6e63' },
    { id: 'player-back-2', x: 1064, y: 840, w: 168, h: 210, label: '我后3', color: '#8d6e63' },

    // 我方英雄 - 左下角
    { id: 'player-hero', x: 80, y: 750, w: 200, h: 260, label: '我方英雄', color: '#d4a574' },

    // 综合控制台 - 英雄右侧
    { id: 'player-console', x: 300, y: 800, w: 360, h: 130, label: '控制台', color: '#8B7355' },

    // 我方牌库 - 右下角
    { id: 'player-deck', x: 1700, y: 840, w: 120, h: 168, label: '我方牌库', color: '#4e342e' },

    // 我方简牍区 - 右侧下方
    { id: 'player-book', x: 1700, y: 640, w: 120, h: 168, label: '我方简牍', color: '#a0522d' },

    // 法力水晶
    { id: 'player-mana', x: 300, y: 940, w: 120, h: 40, label: '我方法力', color: '#5c6bc0' },

    // 结束回合按钮 - 右侧中部
    { id: 'end-turn', x: 1780, y: 500, w: 110, h: 80, label: '结束回合', color: '#ff8f00' }
  ]
};

// ==================== 兼容导出 ====================

// 兼容旧版 LayoutSpec 格式
export const layoutSpec: LayoutSpec = {
  canvasWidth: LAYOUT.canvas.w,
  canvasHeight: LAYOUT.canvas.h,
  layouts: expandLayouts(LAYOUT.layouts).map(node => ({
    id: node.id,
    x: node.x,
    y: node.y,
    width: node.w,
    height: node.h,
    label: node.label,
    color: node.color,
  })),
};

// 导出展开后的布局节点
export const expandedLayouts: RenderNode[] = expandLayouts(LAYOUT.layouts);

// 默认导出
export default LAYOUT;
