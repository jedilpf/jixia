/**
 * 手牌扇形布局计算
 * 
 * 优化后的手牌布局算法
 */

export interface HandPose {
  x: number;
  y: number;
  rotation: number;
  zIndex: number;
}

export interface HandLayoutOptions {
  count: number;
  centerX: number;
  baseY: number;
  hoveredIndex?: number | null;
  maxAngle?: number;
  cardWidth?: number;
  overlap?: number;
}

/**
 * 计算手牌扇形布局
 * 
 * 使用圆弧布局，中间牌在上层
 */
export function computeHandFan(options: HandLayoutOptions): HandPose[] {
  const {
    count,
    centerX,
    baseY,
    hoveredIndex = null,
    maxAngle = 30, // 最大展开角度
    cardWidth = 120,
    overlap = 0.6, // 重叠比例
  } = options;

  if (count === 0) return [];
  if (count === 1) {
    return [{ x: centerX, y: baseY, rotation: 0, zIndex: 10 }];
  }

  const poses: HandPose[] = [];
  
  // 计算总宽度和角度
  const effectiveWidth = cardWidth * (1 - overlap);
  const totalWidth = (count - 1) * effectiveWidth;
  const startX = centerX - totalWidth / 2;
  
  // 计算角度步进
  const angleStep = count > 1 ? (maxAngle * 2) / (count - 1) : 0;
  const startAngle = -maxAngle;

  for (let i = 0; i < count; i++) {
    const x = startX + i * effectiveWidth;
    
    // 计算旋转角度 (中间牌不旋转)
    const rotation = startAngle + i * angleStep;
    
    // 计算Y偏移 (形成弧形)
    const normalizedIndex = (i - (count - 1) / 2) / ((count - 1) / 2);
    const yOffset = Math.abs(normalizedIndex) * 20; // 两边牌稍微向下
    
    // z-index: 中间牌在上层
    const zIndex = 10 - Math.abs(i - (count - 1) / 2);
    
    // 悬浮效果
    let finalY = baseY + yOffset;
    if (hoveredIndex === i) {
      finalY -= 30; // 悬浮时向上移动
    }

    poses.push({
      x,
      y: finalY,
      rotation,
      zIndex: hoveredIndex === i ? 100 : zIndex,
    });
  }

  return poses;
}

/**
 * 计算紧凑布局 (手牌很多时使用)
 */
export function computeCompactHandLayout(options: HandLayoutOptions): HandPose[] {
  const {
    count,
    centerX,
    baseY,
    hoveredIndex = null,
    cardWidth = 120,
    maxVisibleWidth = 800, // 最大显示宽度
  } = options;

  if (count === 0) return [];

  const poses: HandPose[] = [];
  
  // 计算实际需要的重叠程度
  const totalCardWidth = count * cardWidth;
  const overlap = totalCardWidth > maxVisibleWidth
    ? (totalCardWidth - maxVisibleWidth) / (count - 1)
    : 0;
  
  const effectiveWidth = cardWidth - overlap;
  const totalWidth = (count - 1) * effectiveWidth;
  const startX = centerX - totalWidth / 2;

  for (let i = 0; i < count; i++) {
    const x = startX + i * effectiveWidth;
    
    // 紧凑布局减少旋转
    const rotation = 0;
    
    // z-index: 后面的牌在上层，悬浮的牌最上层
    const zIndex = hoveredIndex === i ? 100 : i;
    
    // 悬浮效果
    let finalY = baseY;
    if (hoveredIndex === i) {
      finalY -= 40;
    }

    poses.push({
      x,
      y: finalY,
      rotation,
      zIndex,
    });
  }

  return poses;
}

/**
 * 根据手牌数量自动选择布局算法
 */
export function computeHandLayout(options: HandLayoutOptions): HandPose[] {
  const { count } = options;
  
  // 手牌少于8张使用扇形布局，否则使用紧凑布局
  if (count <= 8) {
    return computeHandFan(options);
  } else {
    return computeCompactHandLayout(options);
  }
}
