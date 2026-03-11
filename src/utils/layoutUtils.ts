import { BBox } from '@/types/layout';

// ==================== 类型定义 ====================

export interface RenderNode {
  id: string;
  bbox: BBox;
}

export interface RepeatLinearOptions {
  startX: number;
  startY: number;
  w: number;
  h: number;
  gapX?: number;
  gapY?: number;
  count: number;
  idPattern: string; // 如 "enemy-hand-{index}"
}

export interface RepeatCustomXOptions {
  xList: number[];
  y: number;
  w: number;
  h: number;
  idPattern: string;
}

export interface HandFanLayoutOptions {
  count: number;
  cardW: number;
  cardH: number;
  overlap: number; // 重叠像素，越大重叠越多
  centerX: number;
  y: number;
}

// ==================== 布局函数 ====================

/**
 * 线性重复布局
 * 在 X 或 Y 轴方向重复排列元素
 * 
 * @example
 * repeatLinear({
 *   startX: 100, startY: 200,
 *   w: 100, h: 120,
 *   gapX: 10, count: 7,
 *   idPattern: 'enemy-hand-{index}'
 * })
 */
export function repeatLinear(options: RepeatLinearOptions): RenderNode[] {
  const {
    startX,
    startY,
    w,
    h,
    gapX = 0,
    gapY = 0,
    count,
    idPattern,
  } = options;

  const nodes: RenderNode[] = [];

  for (let i = 0; i < count; i++) {
    const x = startX + i * (w + gapX);
    const y = startY + i * (h + gapY);
    const id = idPattern.replace('{index}', i.toString());

    nodes.push({
      id,
      bbox: {
        x: Math.round(x),
        y: Math.round(y),
        w: Math.round(w),
        h: Math.round(h),
      },
    });
  }

  return nodes;
}

/**
 * 自定义 X 坐标布局
 * 在指定的 X 坐标列表上排列元素
 * 
 * @example
 * repeatCustomX({
 *   xList: [100, 250, 400, 550],
 *   y: 300, w: 140, h: 160,
 *   idPattern: 'enemy-minion-{index}'
 * })
 */
export function repeatCustomX(options: RepeatCustomXOptions): RenderNode[] {
  const { xList, y, w, h, idPattern } = options;

  return xList.map((x, index) => {
    const id = idPattern.replace('{index}', index.toString());

    return {
      id,
      bbox: {
        x: Math.round(x),
        y: Math.round(y),
        w: Math.round(w),
        h: Math.round(h),
      },
    };
  });
}

/**
 * 手牌扇形布局
 * 手牌从中线向两侧展开，呈扇形排列
 * 
 * @example
 * handFanLayout({
 *   count: 10,
 *   cardW: 100,
 *   cardH: 120,
 *   overlap: 30,
 *   centerX: 960,
 *   y: 930
 * })
 */
export function handFanLayout(options: HandFanLayoutOptions): RenderNode[] {
  const { count, cardW, cardH, overlap, centerX, y } = options;

  if (count <= 0) return [];

  const nodes: RenderNode[] = [];

  // 计算每张牌实际占用的宽度（考虑重叠）
  const step = cardW - overlap;

  // 计算整体宽度
  const totalWidth = step * (count - 1) + cardW;

  // 起始 X 坐标（居中）
  const startX = centerX - totalWidth / 2;

  for (let i = 0; i < count; i++) {
    const x = startX + i * step;

    nodes.push({
      id: `hand-${i}`,
      bbox: {
        x: Math.round(x),
        y: Math.round(y),
        w: Math.round(cardW),
        h: Math.round(cardH),
      },
    });
  }

  return nodes;
}

/**
 * 手牌扇形布局（高级版）
 * 支持旋转角度，模拟真实手牌扇形
 */
export interface HandFanAdvancedOptions extends HandFanLayoutOptions {
  maxRotation?: number; // 最大旋转角度（度）
  yOffset?: number; // Y 轴偏移（营造弧形效果）
}

export function handFanLayoutAdvanced(
  options: HandFanAdvancedOptions
): Array<RenderNode & { rotation?: number }> {
  const {
    count,
    cardW,
    cardH,
    overlap,
    centerX,
    y,
    maxRotation = 15,
    yOffset = 10,
  } = options;

  if (count <= 0) return [];

  const nodes: Array<RenderNode & { rotation?: number }> = [];
  const step = cardW - overlap;
  const totalWidth = step * (count - 1) + cardW;
  const startX = centerX - totalWidth / 2;

  // 计算每张牌的旋转角度
  const midIndex = (count - 1) / 2;

  for (let i = 0; i < count; i++) {
    const x = startX + i * step;

    // 距离中心的偏移
    const offsetFromCenter = i - midIndex;

    // 旋转角度：中间 0°，两侧递增
    const rotation = offsetFromCenter * (maxRotation / midIndex);

    // Y 轴偏移：中间最低，两侧略高（弧形）
    const arcOffset = Math.abs(offsetFromCenter) * yOffset;

    nodes.push({
      id: `hand-${i}`,
      bbox: {
        x: Math.round(x),
        y: Math.round(y - arcOffset),
        w: Math.round(cardW),
        h: Math.round(cardH),
      },
      rotation: Math.round(rotation * 10) / 10, // 保留一位小数
    });
  }

  return nodes;
}

// ==================== 辅助函数 ====================

/**
 * 计算居中起始位置
 * 用于将一组元素在指定容器内居中排列
 */
export function calcCenteredStart(
  itemSize: number,
  gap: number,
  count: number,
  containerCenter: number
): number {
  const totalWidth = count * itemSize + (count - 1) * gap;
  return containerCenter - totalWidth / 2;
}

/**
 * 网格布局
 * 简单的行列网格
 */
export function gridLayout(options: {
  startX: number;
  startY: number;
  w: number;
  h: number;
  gapX: number;
  gapY: number;
  cols: number;
  rows: number;
  idPattern: string;
}): RenderNode[] {
  const { startX, startY, w, h, gapX, gapY, cols, rows, idPattern } = options;

  const nodes: RenderNode[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const index = row * cols + col;
      const x = startX + col * (w + gapX);
      const y = startY + row * (h + gapY);
      const id = idPattern
        .replace('{row}', row.toString())
        .replace('{col}', col.toString())
        .replace('{index}', index.toString());

      nodes.push({
        id,
        bbox: {
          x: Math.round(x),
          y: Math.round(y),
          w: Math.round(w),
          h: Math.round(h),
        },
      });
    }
  }

  return nodes;
}

// ==================== 单元测试思路 ====================

/**
 * 测试策略：
 * 
 * 1. repeatLinear
 *    - 正常情况：count=5, gapX=10，验证每个节点的 x 坐标递增 (w+gapX)
 *    - 边界情况：count=0，返回空数组
 *    - 边界情况：count=1，返回单个节点
 *    - 验证 id 生成：idPattern 中的 {index} 被正确替换
 *    - 验证整数：所有坐标和尺寸都是整数
 * 
 * 2. repeatCustomX
 *    - 正常情况：xList=[100, 250, 400]，验证每个节点使用指定的 x 坐标
 *    - 边界情况：空 xList，返回空数组
 *    - 验证 id 生成：索引正确对应
 * 
 * 3. handFanLayout
 *    - 正常情况：count=7, centerX=960，验证整体居中
 *      - 第一个节点的 x = centerX - totalWidth/2
 *      - 最后一个节点的 x = centerX + totalWidth/2 - cardW
 *    - 边界情况：count=0，返回空数组
 *    - 边界情况：count=1，节点正好在 centerX - cardW/2
 *    - 验证 overlap：相邻两张牌的 x 差值 = cardW - overlap
 *    - 验证整数：所有坐标都是整数
 * 
 * 4. handFanLayoutAdvanced
 *    - 验证 rotation：中间牌 rotation=0，两侧对称
 *    - 验证 yOffset：中间牌 y 最小，两侧 y 递增
 * 
 * 5. calcCenteredStart
 *    - 验证计算：itemSize=100, gap=10, count=3, containerCenter=500
 *      - totalWidth = 3*100 + 2*10 = 320
 *      - start = 500 - 160 = 340
 * 
 * 6. gridLayout
 *    - 正常情况：2x3 网格，验证行列坐标正确
 *    - 验证 id 生成：{row}, {col}, {index} 都被正确替换
 * 
 * 测试示例（伪代码）：
 * 
 * describe('repeatLinear', () => {
 *   it('应该生成水平排列的节点', () => {
 *     const nodes = repeatLinear({
 *       startX: 100, startY: 200,
 *       w: 50, h: 60, gapX: 10,
 *       count: 3, idPattern: 'item-{index}'
 *     });
 *     expect(nodes).toHaveLength(3);
 *     expect(nodes[0].bbox.x).toBe(100);
 *     expect(nodes[1].bbox.x).toBe(160); // 100 + 50 + 10
 *     expect(nodes[2].bbox.x).toBe(220);
 *     expect(nodes[0].id).toBe('item-0');
 *   });
 * });
 */

// 默认导出
export default {
  repeatLinear,
  repeatCustomX,
  handFanLayout,
  handFanLayoutAdvanced,
  calcCenteredStart,
  gridLayout,
};
