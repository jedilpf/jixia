import React from 'react';

interface CharStyle {
  fontSize: string;
  yOffset: number;
  xOffset: number;
  fontWeight: number;
  opacity: number;
  color?: string;
  strokeWidth?: number;
}

interface WillLayout {
  chars: string[];
  styles: CharStyle[];
}

/**
 * 生成仙气内发光效果 — 字中心亮、边缘柔化
 */
function getImmortalGlow(color: string): string {
  const shadows: string[] = [];
  // 核心强光 — 白色仙光
  shadows.push('0 0 6px rgba(255, 248, 220, 0.6)');
  shadows.push('0 0 12px rgba(232, 213, 163, 0.4)');
  shadows.push('0 0 20px rgba(212, 175, 101, 0.25)');
  // 外层柔光晕
  shadows.push('0 0 35px rgba(180, 160, 100, 0.12)');
  return shadows.join(', ');
}

/**
 * 生成云雾缭绕的 text-shadow（在飞白基础上增加仙气）
 */
function getImmortalTextShadow(strokeWidth: number = 1): string {
  const shadows: string[] = [];

  // 主阴影 - 营造立体感
  shadows.push('2px 3px 6px rgba(0,0,0,0.7)');

  // 飞白效果 - 多层偏移的淡金色阴影
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const dist = 1.5 + strokeWidth * 0.5;
    const x = Math.cos(angle) * dist;
    const y = Math.sin(angle) * dist;
    const opacity = 0.15 + (i % 2) * 0.1;
    shadows.push(`${x.toFixed(1)}px ${y.toFixed(1)}px 0px rgba(212, 175, 101, ${opacity})`);
  }

  // 边缘飞白
  shadows.push('-1px -1px 0px rgba(160, 140, 90, 0.3)');
  shadows.push('1px -1px 0px rgba(160, 140, 90, 0.2)');

  // 仙气光晕层
  shadows.push('0 0 8px rgba(255, 248, 220, 0.5)');
  shadows.push('0 0 16px rgba(232, 213, 163, 0.3)');
  shadows.push('0 0 30px rgba(180, 160, 100, 0.15)');

  return shadows.join(', ');
}

/**
 * 为每张卡牌预定义意志文字的排版样式
 * 毛泽东风格：写意、狂放、气势磅礴
 * 无单字旋转，整体有倾斜感
 */
const WILL_LAYOUTS: Record<string, WillLayout> = {
  // ====== 礼心殿 ======
  'wenyan': {
    chars: ['礼', '之', '用', '，', '和', '为', '贵', '。'],
    styles: [
      { fontSize: '1.7em', yOffset: -8, xOffset: -2, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.2 },
      { fontSize: '0.8em', yOffset: 4, xOffset: 3, fontWeight: 700, opacity: 0.75, color: '#b8a880' },
      { fontSize: '1.4em', yOffset: -4, xOffset: 0, fontWeight: 800, opacity: 0.95, color: '#d4c4a0', strokeWidth: 0.8 },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
      { fontSize: '1.6em', yOffset: -6, xOffset: -3, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '0.85em', yOffset: 3, xOffset: 3, fontWeight: 700, opacity: 0.8, color: '#b8a880' },
      { fontSize: '1.5em', yOffset: -5, xOffset: 0, fontWeight: 800, opacity: 0.95, color: '#d4c4a0', strokeWidth: 0.9 },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
    ],
  },
  'zhuduchao': {
    chars: ['温', '故', '知', '新', '，', '可', '以', '为', '师', '。'],
    styles: [
      { fontSize: '1.6em', yOffset: -7, xOffset: -2, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.1 },
      { fontSize: '1.0em', yOffset: 0, xOffset: 3, fontWeight: 800, opacity: 0.9, color: '#d4c4a0' },
      { fontSize: '0.8em', yOffset: 5, xOffset: 0, fontWeight: 700, opacity: 0.75, color: '#b8a880' },
      { fontSize: '1.5em', yOffset: -5, xOffset: -3, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
      { fontSize: '1.3em', yOffset: -3, xOffset: 0, fontWeight: 800, opacity: 0.9, color: '#d4c4a0', strokeWidth: 0.8 },
      { fontSize: '0.75em', yOffset: 5, xOffset: 3, fontWeight: 700, opacity: 0.75, color: '#b8a880' },
      { fontSize: '1.1em', yOffset: -1, xOffset: 0, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '1.4em', yOffset: -5, xOffset: -3, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 0.9 },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
    ],
  },
  'jiangxi': {
    chars: ['不', '以', '规', '矩', '，', '不', '能', '成', '方', '圆', '。'],
    styles: [
      { fontSize: '1.5em', yOffset: -7, xOffset: -2, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '0.8em', yOffset: 4, xOffset: 3, fontWeight: 700, opacity: 0.75, color: '#b8a880' },
      { fontSize: '1.4em', yOffset: -4, xOffset: 0, fontWeight: 800, opacity: 0.95, color: '#d4c4a0', strokeWidth: 0.9 },
      { fontSize: '1.0em', yOffset: 1, xOffset: -3, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
      { fontSize: '1.3em', yOffset: -4, xOffset: 0, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 0.9 },
      { fontSize: '0.85em', yOffset: 4, xOffset: 3, fontWeight: 700, opacity: 0.8, color: '#b8a880' },
      { fontSize: '1.5em', yOffset: -6, xOffset: 0, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.1 },
      { fontSize: '0.95em', yOffset: 0, xOffset: -3, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '1.3em', yOffset: -3, xOffset: 0, fontWeight: 800, opacity: 0.9, color: '#d4c4a0', strokeWidth: 0.8 },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
    ],
  },
  'sishi': {
    chars: ['书', '法', '不', '隐', '，', '善', '恶', '必', '书', '。'],
    styles: [
      { fontSize: '1.6em', yOffset: -7, xOffset: -2, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.1 },
      { fontSize: '1.2em', yOffset: -2, xOffset: 3, fontWeight: 800, opacity: 0.9, color: '#d4c4a0' },
      { fontSize: '0.85em', yOffset: 4, xOffset: 0, fontWeight: 700, opacity: 0.8, color: '#b8a880' },
      { fontSize: '1.4em', yOffset: -5, xOffset: -3, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
      { fontSize: '1.5em', yOffset: -5, xOffset: 0, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '0.95em', yOffset: 2, xOffset: 3, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '1.3em', yOffset: -4, xOffset: 0, fontWeight: 800, opacity: 0.9, color: '#d4c4a0', strokeWidth: 0.9 },
      { fontSize: '1.1em', yOffset: 0, xOffset: -3, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
    ],
  },
  'libian': {
    chars: ['和', '而', '不', '同', '，', '天', '下', '大', '同', '。'],
    styles: [
      { fontSize: '1.6em', yOffset: -7, xOffset: -2, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.1 },
      { fontSize: '0.8em', yOffset: 4, xOffset: 3, fontWeight: 700, opacity: 0.75, color: '#b8a880' },
      { fontSize: '1.1em', yOffset: -1, xOffset: 0, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '1.5em', yOffset: -5, xOffset: -3, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
      { fontSize: '1.4em', yOffset: -4, xOffset: 0, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 0.9 },
      { fontSize: '0.85em', yOffset: 4, xOffset: 3, fontWeight: 700, opacity: 0.8, color: '#b8a880' },
      { fontSize: '1.3em', yOffset: -5, xOffset: 0, fontWeight: 800, opacity: 0.95, color: '#d4c4a0', strokeWidth: 0.9 },
      { fontSize: '0.95em', yOffset: 1, xOffset: -3, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
    ],
  },
  // ====== 衡戒廷 ======
  'tiequan': {
    chars: ['刑', '过', '不', '避', '大', '臣', '，', '赏', '善', '不', '遗', '匹', '夫', '。'],
    styles: [
      { fontSize: '1.6em', yOffset: -7, xOffset: -2, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.1 },
      { fontSize: '0.9em', yOffset: 3, xOffset: 3, fontWeight: 700, opacity: 0.8, color: '#b8a880' },
      { fontSize: '1.1em', yOffset: -1, xOffset: 0, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '1.4em', yOffset: -5, xOffset: -3, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '0.95em', yOffset: 0, xOffset: 0, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '1.2em', yOffset: -3, xOffset: 3, fontWeight: 800, opacity: 0.9, color: '#d4c4a0' },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
      { fontSize: '1.5em', yOffset: -5, xOffset: 0, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '0.8em', yOffset: 4, xOffset: 3, fontWeight: 700, opacity: 0.75, color: '#b8a880' },
      { fontSize: '0.95em', yOffset: 0, xOffset: 0, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '1.1em', yOffset: -2, xOffset: -3, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '0.85em', yOffset: 3, xOffset: 0, fontWeight: 700, opacity: 0.8, color: '#b8a880' },
      { fontSize: '1.4em', yOffset: -5, xOffset: 3, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
    ],
  },
  'duanjian': {
    chars: ['法', '不', '阿', '贵', '，', '绳', '不', '挠', '曲', '。'],
    styles: [
      { fontSize: '1.6em', yOffset: -7, xOffset: -2, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.1 },
      { fontSize: '0.85em', yOffset: 4, xOffset: 3, fontWeight: 700, opacity: 0.8, color: '#b8a880' },
      { fontSize: '1.2em', yOffset: -2, xOffset: 0, fontWeight: 800, opacity: 0.9, color: '#d4c4a0' },
      { fontSize: '1.4em', yOffset: -5, xOffset: -3, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
      { fontSize: '1.5em', yOffset: -5, xOffset: 0, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '0.8em', yOffset: 4, xOffset: 3, fontWeight: 700, opacity: 0.75, color: '#b8a880' },
      { fontSize: '1.1em', yOffset: -1, xOffset: 0, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '1.3em', yOffset: -4, xOffset: -3, fontWeight: 800, opacity: 0.9, color: '#d4c4a0', strokeWidth: 0.9 },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
    ],
  },
  'jianyin': {
    chars: ['令', '必', '行', '，', '禁', '必', '止', '。'],
    styles: [
      { fontSize: '1.6em', yOffset: -7, xOffset: -2, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.1 },
      { fontSize: '0.95em', yOffset: 0, xOffset: 3, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '1.4em', yOffset: -5, xOffset: 0, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
      { fontSize: '1.5em', yOffset: -5, xOffset: -3, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '0.85em', yOffset: 3, xOffset: 0, fontWeight: 700, opacity: 0.8, color: '#b8a880' },
      { fontSize: '1.3em', yOffset: -4, xOffset: 3, fontWeight: 800, opacity: 0.9, color: '#d4c4a0', strokeWidth: 0.9 },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
    ],
  },
  'juwentang': {
    chars: ['严', '刑', '峻', '法', '，', '以', '破', '奸', '轨', '。'],
    styles: [
      { fontSize: '1.5em', yOffset: -7, xOffset: -2, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '1.2em', yOffset: -3, xOffset: 3, fontWeight: 800, opacity: 0.9, color: '#d4c4a0' },
      { fontSize: '0.95em', yOffset: 2, xOffset: 0, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '1.6em', yOffset: -5, xOffset: -3, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.1 },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
      { fontSize: '0.8em', yOffset: 4, xOffset: 0, fontWeight: 700, opacity: 0.75, color: '#b8a880' },
      { fontSize: '1.4em', yOffset: -5, xOffset: 3, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '1.1em', yOffset: -1, xOffset: 0, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '1.3em', yOffset: -4, xOffset: -3, fontWeight: 800, opacity: 0.9, color: '#d4c4a0', strokeWidth: 0.9 },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
    ],
  },
  'chilin': {
    chars: ['事', '在', '四', '方', '，', '要', '在', '中', '央', '。'],
    styles: [
      { fontSize: '1.4em', yOffset: -6, xOffset: -2, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 0.9 },
      { fontSize: '0.85em', yOffset: 3, xOffset: 3, fontWeight: 700, opacity: 0.8, color: '#b8a880' },
      { fontSize: '1.3em', yOffset: -3, xOffset: 0, fontWeight: 800, opacity: 0.9, color: '#d4c4a0', strokeWidth: 0.8 },
      { fontSize: '1.5em', yOffset: -5, xOffset: -3, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
      { fontSize: '1.1em', yOffset: -1, xOffset: 0, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '0.8em', yOffset: 4, xOffset: 3, fontWeight: 700, opacity: 0.75, color: '#b8a880' },
      { fontSize: '1.6em', yOffset: -6, xOffset: 0, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.1 },
      { fontSize: '0.95em', yOffset: 0, xOffset: -3, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
    ],
  },
  // ====== 归真观 ======
  'yunxiu': {
    chars: ['致', '虚', '极', '，', '守', '静', '笃', '。'],
    styles: [
      { fontSize: '1.5em', yOffset: -7, xOffset: -2, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '1.2em', yOffset: -2, xOffset: 3, fontWeight: 800, opacity: 0.9, color: '#d4c4a0' },
      { fontSize: '1.6em', yOffset: -5, xOffset: 0, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.1 },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
      { fontSize: '1.4em', yOffset: -5, xOffset: -3, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '0.95em', yOffset: 2, xOffset: 0, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '1.5em', yOffset: -5, xOffset: 3, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
    ],
  },
  'baoyi': {
    chars: ['道', '生', '一', '，', '一', '生', '二', '。'],
    styles: [
      { fontSize: '1.7em', yOffset: -8, xOffset: -2, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.2 },
      { fontSize: '0.85em', yOffset: 4, xOffset: 3, fontWeight: 700, opacity: 0.8, color: '#b8a880' },
      { fontSize: '1.4em', yOffset: -3, xOffset: 0, fontWeight: 800, opacity: 0.95, color: '#d4c4a0', strokeWidth: 0.9 },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
      { fontSize: '1.3em', yOffset: -5, xOffset: -3, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 0.9 },
      { fontSize: '0.8em', yOffset: 3, xOffset: 0, fontWeight: 700, opacity: 0.75, color: '#b8a880' },
      { fontSize: '1.5em', yOffset: -5, xOffset: 3, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
    ],
  },
  'dansha': {
    chars: ['炉', '火', '纯', '青', '，', '丹', '成', '九', '转', '。'],
    styles: [
      { fontSize: '1.5em', yOffset: -7, xOffset: -2, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '1.1em', yOffset: -1, xOffset: 3, fontWeight: 800, opacity: 0.9, color: '#d4c4a0' },
      { fontSize: '1.4em', yOffset: -4, xOffset: 0, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 0.9 },
      { fontSize: '0.95em', yOffset: 2, xOffset: -3, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
      { fontSize: '1.6em', yOffset: -5, xOffset: 0, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.1 },
      { fontSize: '0.85em', yOffset: 4, xOffset: 3, fontWeight: 700, opacity: 0.8, color: '#b8a880' },
      { fontSize: '1.3em', yOffset: -3, xOffset: 0, fontWeight: 800, opacity: 0.9, color: '#d4c4a0', strokeWidth: 0.9 },
      { fontSize: '1.1em', yOffset: 0, xOffset: -3, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
    ],
  },
  'taiqing': {
    chars: ['符', '箓', '所', '至', '，', '万', '邪', '辟', '易', '。'],
    styles: [
      { fontSize: '1.5em', yOffset: -7, xOffset: -2, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '1.2em', yOffset: -2, xOffset: 3, fontWeight: 800, opacity: 0.9, color: '#d4c4a0' },
      { fontSize: '0.85em', yOffset: 4, xOffset: 0, fontWeight: 700, opacity: 0.8, color: '#b8a880' },
      { fontSize: '1.4em', yOffset: -5, xOffset: -3, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
      { fontSize: '1.6em', yOffset: -5, xOffset: 0, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.1 },
      { fontSize: '0.95em', yOffset: 2, xOffset: 3, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '1.3em', yOffset: -4, xOffset: 0, fontWeight: 800, opacity: 0.9, color: '#d4c4a0', strokeWidth: 0.9 },
      { fontSize: '1.1em', yOffset: 0, xOffset: -3, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
    ],
  },
  'hebu': {
    chars: ['鹤', '鸣', '于', '九', '皋', '，', '声', '闻', '于', '天', '。'],
    styles: [
      { fontSize: '1.6em', yOffset: -7, xOffset: -2, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.1 },
      { fontSize: '0.95em', yOffset: 0, xOffset: 3, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '0.8em', yOffset: 4, xOffset: 0, fontWeight: 700, opacity: 0.75, color: '#b8a880' },
      { fontSize: '1.4em', yOffset: -5, xOffset: -3, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '1.1em', yOffset: -1, xOffset: 0, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
      { fontSize: '1.3em', yOffset: -4, xOffset: 0, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 0.9 },
      { fontSize: '0.85em', yOffset: 3, xOffset: 3, fontWeight: 700, opacity: 0.8, color: '#b8a880' },
      { fontSize: '0.95em', yOffset: 0, xOffset: 0, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '1.5em', yOffset: -5, xOffset: -3, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
    ],
  },
  // ====== 玄匠盟 ======
  'liannuju': {
    chars: ['巧', '夺', '天', '工', '，', '连', '发', '不', '息', '。'],
    styles: [
      { fontSize: '1.5em', yOffset: -7, xOffset: -2, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '1.1em', yOffset: -1, xOffset: 3, fontWeight: 800, opacity: 0.9, color: '#d4c4a0' },
      { fontSize: '1.4em', yOffset: -4, xOffset: 0, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 0.9 },
      { fontSize: '0.95em', yOffset: 2, xOffset: -3, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
      { fontSize: '1.3em', yOffset: -4, xOffset: 0, fontWeight: 800, opacity: 0.9, color: '#d4c4a0', strokeWidth: 0.8 },
      { fontSize: '0.85em', yOffset: 4, xOffset: 3, fontWeight: 700, opacity: 0.8, color: '#b8a880' },
      { fontSize: '1.1em', yOffset: -1, xOffset: 0, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '1.4em', yOffset: -5, xOffset: -3, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
    ],
  },
  'jimu': {
    chars: ['木', '鸢', '飞', '天', '，', '洞', '察', '千', '里', '。'],
    styles: [
      { fontSize: '1.6em', yOffset: -7, xOffset: -2, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.1 },
      { fontSize: '1.2em', yOffset: -2, xOffset: 3, fontWeight: 800, opacity: 0.9, color: '#d4c4a0' },
      { fontSize: '1.4em', yOffset: -4, xOffset: 0, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '0.95em', yOffset: 2, xOffset: -3, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
      { fontSize: '1.5em', yOffset: -5, xOffset: 0, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '0.85em', yOffset: 4, xOffset: 3, fontWeight: 700, opacity: 0.8, color: '#b8a880' },
      { fontSize: '1.3em', yOffset: -3, xOffset: 0, fontWeight: 800, opacity: 0.9, color: '#d4c4a0', strokeWidth: 0.9 },
      { fontSize: '1.1em', yOffset: 0, xOffset: -3, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
    ],
  },
  'chengfang': {
    chars: ['尺', '牍', '绘', '城', '，', '方', '寸', '定', '攻', '守', '。'],
    styles: [
      { fontSize: '1.5em', yOffset: -7, xOffset: -2, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '1.1em', yOffset: -1, xOffset: 3, fontWeight: 800, opacity: 0.9, color: '#d4c4a0' },
      { fontSize: '1.2em', yOffset: -3, xOffset: 0, fontWeight: 800, opacity: 0.9, color: '#d4c4a0' },
      { fontSize: '1.4em', yOffset: -5, xOffset: -3, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
      { fontSize: '0.95em', yOffset: 2, xOffset: 0, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '0.8em', yOffset: 4, xOffset: 3, fontWeight: 700, opacity: 0.75, color: '#b8a880' },
      { fontSize: '1.4em', yOffset: -5, xOffset: 0, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '1.1em', yOffset: -1, xOffset: -3, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '1.3em', yOffset: -3, xOffset: 0, fontWeight: 800, opacity: 0.9, color: '#d4c4a0', strokeWidth: 0.9 },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
    ],
  },
  'jianshi': {
    chars: ['工', '以', '济', '世', '，', '手', '上', '有', '茧', '。'],
    styles: [
      { fontSize: '1.6em', yOffset: -7, xOffset: -2, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.1 },
      { fontSize: '0.85em', yOffset: 3, xOffset: 3, fontWeight: 700, opacity: 0.8, color: '#b8a880' },
      { fontSize: '1.4em', yOffset: -5, xOffset: 0, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '1.1em', yOffset: -1, xOffset: -3, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
      { fontSize: '1.3em', yOffset: -4, xOffset: 0, fontWeight: 800, opacity: 0.9, color: '#d4c4a0', strokeWidth: 0.9 },
      { fontSize: '0.8em', yOffset: 4, xOffset: 3, fontWeight: 700, opacity: 0.75, color: '#b8a880' },
      { fontSize: '0.95em', yOffset: 0, xOffset: 0, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '1.5em', yOffset: -5, xOffset: -3, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
    ],
  },
  'qianji': {
    chars: ['千', '机', '并', '起', '，', '壁', '垒', '如', '山', '。'],
    styles: [
      { fontSize: '1.6em', yOffset: -7, xOffset: -2, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.1 },
      { fontSize: '1.1em', yOffset: -1, xOffset: 3, fontWeight: 800, opacity: 0.9, color: '#d4c4a0' },
      { fontSize: '1.2em', yOffset: -3, xOffset: 0, fontWeight: 800, opacity: 0.9, color: '#d4c4a0' },
      { fontSize: '1.4em', yOffset: -5, xOffset: -3, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
      { fontSize: '1.5em', yOffset: -5, xOffset: 0, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '0.85em', yOffset: 4, xOffset: 3, fontWeight: 700, opacity: 0.8, color: '#b8a880' },
      { fontSize: '1.1em', yOffset: -1, xOffset: 0, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '1.3em', yOffset: -4, xOffset: -3, fontWeight: 800, opacity: 0.9, color: '#d4c4a0', strokeWidth: 0.9 },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
    ],
  },
  // ====== 九阵堂 ======
  'jingqi': {
    chars: ['旗', '一', '翻', '，', '阵', '已', '换', '；', '敌', '未', '觉', '，', '我', '已', '先', '至', '。'],
    styles: [
      { fontSize: '1.5em', yOffset: -7, xOffset: -2, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '0.95em', yOffset: 0, xOffset: 3, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '1.4em', yOffset: -5, xOffset: 0, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
      { fontSize: '1.3em', yOffset: -4, xOffset: -3, fontWeight: 800, opacity: 0.9, color: '#d4c4a0', strokeWidth: 0.9 },
      { fontSize: '0.8em', yOffset: 4, xOffset: 0, fontWeight: 700, opacity: 0.75, color: '#b8a880' },
      { fontSize: '1.1em', yOffset: -1, xOffset: 3, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
      { fontSize: '1.4em', yOffset: -5, xOffset: 0, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '0.85em', yOffset: 3, xOffset: 3, fontWeight: 700, opacity: 0.8, color: '#b8a880' },
      { fontSize: '1.2em', yOffset: -3, xOffset: 0, fontWeight: 800, opacity: 0.9, color: '#d4c4a0' },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
      { fontSize: '1.1em', yOffset: -1, xOffset: -3, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '0.8em', yOffset: 4, xOffset: 0, fontWeight: 700, opacity: 0.75, color: '#b8a880' },
      { fontSize: '1.5em', yOffset: -5, xOffset: 3, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '0.95em', yOffset: 0, xOffset: 0, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
    ],
  },
  'zhange': {
    chars: ['鼓', '三', '通', '，', '锋', '自', '锐', '；', '人', '未', '战', '，', '心', '先', '热', '。'],
    styles: [
      { fontSize: '1.6em', yOffset: -7, xOffset: -2, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.1 },
      { fontSize: '1.1em', yOffset: -1, xOffset: 3, fontWeight: 800, opacity: 0.9, color: '#d4c4a0' },
      { fontSize: '1.4em', yOffset: -5, xOffset: 0, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
      { fontSize: '1.5em', yOffset: -5, xOffset: -3, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '0.85em', yOffset: 3, xOffset: 0, fontWeight: 700, opacity: 0.8, color: '#b8a880' },
      { fontSize: '1.3em', yOffset: -4, xOffset: 3, fontWeight: 800, opacity: 0.9, color: '#d4c4a0', strokeWidth: 0.9 },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
      { fontSize: '0.95em', yOffset: 0, xOffset: 0, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '0.8em', yOffset: 4, xOffset: 3, fontWeight: 700, opacity: 0.75, color: '#b8a880' },
      { fontSize: '1.4em', yOffset: -5, xOffset: 0, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
      { fontSize: '1.1em', yOffset: -1, xOffset: -3, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '0.85em', yOffset: 3, xOffset: 0, fontWeight: 700, opacity: 0.8, color: '#b8a880' },
      { fontSize: '1.5em', yOffset: -5, xOffset: 3, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
    ],
  },
  'bingshu': {
    chars: ['兵', '书', '虽', '残', '，', '杀', '机', '仍', '在', '行', '间', '。'],
    styles: [
      { fontSize: '1.6em', yOffset: -7, xOffset: -2, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.1 },
      { fontSize: '1.2em', yOffset: -2, xOffset: 3, fontWeight: 800, opacity: 0.9, color: '#d4c4a0' },
      { fontSize: '0.85em', yOffset: 4, xOffset: 0, fontWeight: 700, opacity: 0.8, color: '#b8a880' },
      { fontSize: '1.4em', yOffset: -5, xOffset: -3, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
      { fontSize: '1.5em', yOffset: -5, xOffset: 0, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '0.95em', yOffset: 2, xOffset: 3, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '0.8em', yOffset: 0, xOffset: 0, fontWeight: 700, opacity: 0.75, color: '#b8a880' },
      { fontSize: '1.1em', yOffset: -3, xOffset: -3, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '1.3em', yOffset: -4, xOffset: 0, fontWeight: 800, opacity: 0.9, color: '#d4c4a0', strokeWidth: 0.9 },
      { fontSize: '0.95em', yOffset: 0, xOffset: 3, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
    ],
  },
  'fengjun': {
    chars: ['破', '军', '之', '名', '，', '不', '在', '多', '言', '；', '一', '刃', '所', '向', '，', '阵', '自', '开', '。'],
    styles: [
      { fontSize: '1.6em', yOffset: -7, xOffset: -2, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.1 },
      { fontSize: '1.4em', yOffset: -4, xOffset: 3, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '0.8em', yOffset: 4, xOffset: 0, fontWeight: 700, opacity: 0.75, color: '#b8a880' },
      { fontSize: '1.2em', yOffset: -3, xOffset: -3, fontWeight: 800, opacity: 0.9, color: '#d4c4a0' },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
      { fontSize: '0.95em', yOffset: 0, xOffset: 0, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '0.85em', yOffset: 3, xOffset: 3, fontWeight: 700, opacity: 0.8, color: '#b8a880' },
      { fontSize: '1.4em', yOffset: -5, xOffset: 0, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '1.1em', yOffset: -1, xOffset: -3, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
      { fontSize: '0.95em', yOffset: 1, xOffset: 0, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '1.3em', yOffset: -4, xOffset: 3, fontWeight: 800, opacity: 0.9, color: '#d4c4a0', strokeWidth: 0.9 },
      { fontSize: '0.85em', yOffset: 3, xOffset: 0, fontWeight: 700, opacity: 0.8, color: '#b8a880' },
      { fontSize: '1.1em', yOffset: -1, xOffset: -3, fontWeight: 800, opacity: 0.85, color: '#d4c4a0' },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
      { fontSize: '1.5em', yOffset: -5, xOffset: 0, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 },
      { fontSize: '0.8em', yOffset: 3, xOffset: 3, fontWeight: 700, opacity: 0.75, color: '#b8a880' },
      { fontSize: '1.3em', yOffset: -3, xOffset: 0, fontWeight: 800, opacity: 0.9, color: '#d4c4a0', strokeWidth: 0.9 },
      { fontSize: '0.6em', yOffset: 8, xOffset: 0, fontWeight: 400, opacity: 0.5, color: '#9a8a60' },
    ],
  },
};

interface ArtisticWillTextProps {
  text: string;
  cardId?: string;
  className?: string;
}

/**
 * 生成毛泽东风格的飞白效果阴影
 */
function getMaoTextShadow(strokeWidth: number = 1): string {
  const shadows: string[] = [];
  
  // 主阴影 - 营造立体感
  shadows.push('2px 3px 6px rgba(0,0,0,0.7)');
  
  // 飞白效果 - 多层偏移的淡色阴影
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const dist = 1.5 + strokeWidth * 0.5;
    const x = Math.cos(angle) * dist;
    const y = Math.sin(angle) * dist;
    const opacity = 0.15 + (i % 2) * 0.1;
    shadows.push(`${x.toFixed(1)}px ${y.toFixed(1)}px 0px rgba(212, 175, 101, ${opacity})`);
  }
  
  // 边缘飞白
  shadows.push('-1px -1px 0px rgba(160, 140, 90, 0.3)');
  shadows.push('1px -1px 0px rgba(160, 140, 90, 0.2)');
  
  return shadows.join(', ');
}

/**
 * 获取毛笔字体栈
 */
function getBrushFontFamily(): string {
  return '"STXingkai", "Xingkai SC", "华文行楷", "方正行楷", "KaiTi", "楷体", "STKaiti", serif';
}

/**
 * 艺术化意志文字组件 - 毛泽东写意风格
 */
export function ArtisticWillText({ text, cardId, className = '' }: ArtisticWillTextProps) {
  const punctuations = ['，', '。', '；', '：', '、', '！', '？', '…', '—', '；', '“', '”', '‘', '’', '（', '）', '《', '》'];

  const renderContent = () => {
    // 如果有预定义的布局，使用它
    if (cardId && WILL_LAYOUTS[cardId]) {
      const layout = WILL_LAYOUTS[cardId];
      return layout.chars.map((char, index) => {
        const style = layout.styles[index];
        if (!style) return <span key={index}>{char}</span>;

        const isPunctuation = punctuations.includes(char);

        return (
          <span
            key={index}
            className="inline-block select-none"
            style={{
              fontSize: style.fontSize,
              transform: `translate(${style.xOffset}px, ${style.yOffset}px)`,
              opacity: style.opacity,
              fontWeight: style.fontWeight,
              color: style.color || '#e8d5a3',
              textShadow: isPunctuation ? '1px 2px 3px rgba(0,0,0,0.5)' : getImmortalTextShadow(style.strokeWidth || 1),
              lineHeight: '1.6',
              letterSpacing: '0.08em',
              WebkitTextStroke: style.strokeWidth && !isPunctuation ? `${style.strokeWidth * 0.3}px rgba(180, 160, 100, 0.2)` : 'none',
              fontStyle: 'italic',
            }}
          >
            {char}
          </span>
        );
      });
    }

    // 没有预定义布局时，使用基于规则的动态排版
    const units: string[] = [];
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (punctuations.includes(char)) {
        if (units.length > 0) {
          units[units.length - 1] += char;
        } else {
          units.push(char);
        }
      } else {
        units.push(char);
      }
    }

    const getDefaultStyle = (index: number, total: number): CharStyle => {
      const isFirst = index === 0;
      const isLast = index === total - 1;
      const isQuarter = index === Math.floor(total / 4);
      const isThreeQuarter = index === Math.floor(total * 3 / 4);
      const isMiddle = index === Math.floor(total / 2);

      if (isFirst || isLast) {
        return { fontSize: '1.5em', yOffset: -6, xOffset: -1, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.1 };
      }
      if (isQuarter || isThreeQuarter) {
        return { fontSize: '1.3em', yOffset: -3, xOffset: 0, fontWeight: 800, opacity: 0.95, color: '#d4c4a0', strokeWidth: 0.9 };
      }
      if (isMiddle) {
        return { fontSize: '1.4em', yOffset: -5, xOffset: 1, fontWeight: 900, opacity: 1, color: '#e8d5a3', strokeWidth: 1.0 };
      }
      if (index % 3 === 0) {
        return { fontSize: '1.15em', yOffset: -2, xOffset: 0, fontWeight: 800, opacity: 0.9, color: '#d4c4a0' };
      }
      if (index % 3 === 1) {
        return { fontSize: '0.85em', yOffset: 3, xOffset: 2, fontWeight: 700, opacity: 0.8, color: '#b8a880' };
      }
      return { fontSize: '1.0em', yOffset: 0, xOffset: 0, fontWeight: 800, opacity: 0.9, color: '#d4c4a0' };
    };

    return units.map((unit, index) => {
      const style = getDefaultStyle(index, units.length);
      const isPunctuation = punctuations.includes(unit);

      return (
        <span
          key={index}
          className="inline-block select-none"
          style={{
            fontSize: style.fontSize,
            transform: `translate(${style.xOffset}px, ${style.yOffset}px)`,
            opacity: style.opacity,
            fontWeight: style.fontWeight,
            color: style.color || '#e8d5a3',
            textShadow: isPunctuation ? '1px 2px 3px rgba(0,0,0,0.5)' : getImmortalTextShadow(style.strokeWidth || 1),
            lineHeight: '1.6',
            letterSpacing: '0.08em',
            WebkitTextStroke: style.strokeWidth && !isPunctuation ? `${style.strokeWidth * 0.3}px rgba(180, 160, 100, 0.2)` : 'none',
            fontStyle: 'italic',
          }}
        >
          {unit}
        </span>
      );
    });
  };

  return (
    <div className="relative inline-block">
      {/* 云雾背景层 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 40% at 30% 50%, rgba(212, 196, 160, 0.12) 0%, transparent 70%),
            radial-gradient(ellipse 50% 50% at 70% 40%, rgba(180, 168, 128, 0.08) 0%, transparent 60%),
            radial-gradient(ellipse 40% 60% at 50% 70%, rgba(232, 213, 163, 0.06) 0%, transparent 50%)
          `,
          filter: 'blur(8px)',
          animation: 'mistDrift 12s ease-in-out infinite',
        }}
      />
      {/* 第二层云雾 — 反向漂移 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 50% 30% at 60% 60%, rgba(212, 196, 160, 0.08) 0%, transparent 60%),
            radial-gradient(ellipse 45% 45% at 25% 35%, rgba(232, 213, 163, 0.06) 0%, transparent 55%)
          `,
          filter: 'blur(12px)',
          animation: 'mistDriftReverse 15s ease-in-out infinite',
        }}
      />
      {/* 文字层 */}
      <div
        className={`flex flex-wrap justify-center items-baseline gap-x-1 gap-y-2 relative z-10 ${className}`}
        style={{
          fontFamily: getBrushFontFamily(),
          transform: 'skewX(-2deg)',
        }}
      >
        {renderContent()}
      </div>
      {/* CSS 动画定义 */}
      <style>{`
        @keyframes mistDrift {
          0%, 100% { transform: translateX(0) translateY(0); opacity: 0.7; }
          25% { transform: translateX(8px) translateY(-4px); opacity: 1; }
          50% { transform: translateX(-4px) translateY(6px); opacity: 0.8; }
          75% { transform: translateX(6px) translateY(2px); opacity: 0.9; }
        }
        @keyframes mistDriftReverse {
          0%, 100% { transform: translateX(0) translateY(0); opacity: 0.6; }
          33% { transform: translateX(-6px) translateY(4px); opacity: 0.9; }
          66% { transform: translateX(4px) translateY(-6px); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
