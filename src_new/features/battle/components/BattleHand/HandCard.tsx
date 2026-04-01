import React, { useRef, useEffect, useState } from 'react';
import type { Card } from '../../../../types/domain';

interface HandPose {
  x: number;
  y: number;
  rotation: number;
  zIndex: number;
}

interface HandCardProps {
  card: Card;
  index: number;
  pose: HandPose;
  isSelected: boolean;
  isPlayable: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  onDragEnd: (dropped: boolean) => void;
}

/**
 * HandCard - 手牌组件
 * 
 * 职责：
 * - 渲染单张手牌
 * - 处理点击、双击、拖拽
 * - 显示可打出状态
 * - 文本自适应：字体缩放 + 垂直滚动
 */
export const HandCard: React.FC<HandCardProps> = ({
  card,
  index,
  pose,
  isSelected,
  isPlayable,
  onClick,
  onDoubleClick,
  onDragEnd,
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
  
  // 文本容器引用
  const textContainerRef = useRef<HTMLDivElement>(null);
  const textContentRef = useRef<HTMLDivElement>(null);
  
  // 动态字体大小状态
  const [fontSize, setFontSize] = useState(10);
  const [needsScroll, setNeedsScroll] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // 计算自适应字体大小
  useEffect(() => {
    const calculateFontSize = () => {
      if (!textContainerRef.current || !textContentRef.current) return;
      
      const container = textContainerRef.current;
      const content = textContentRef.current;
      const text = card.skillDesc || card.background || '';
      
      if (!text) {
        setFontSize(10);
        setNeedsScroll(false);
        return;
      }

      const containerHeight = container.clientHeight;
      const containerWidth = container.clientWidth - 16; // 减去padding
      
      // 最小和最大字体大小
      const minFontSize = 7;
      const maxFontSize = 10;
      
      let currentSize = maxFontSize;
      let needsScrolling = false;
      
      // 使用临时元素测量文本高度
      const tempElement = document.createElement('div');
      tempElement.style.position = 'absolute';
      tempElement.style.visibility = 'hidden';
      tempElement.style.width = `${containerWidth}px`;
      tempElement.style.lineHeight = '1.4';
      tempElement.style.fontFamily = 'inherit';
      tempElement.textContent = text;
      document.body.appendChild(tempElement);
      
      // 二分查找合适的字体大小
      let low = minFontSize;
      let high = maxFontSize;
      
      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        tempElement.style.fontSize = `${mid}px`;
        const textHeight = tempElement.scrollHeight;
        
        if (textHeight <= containerHeight) {
          currentSize = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }
      
      // 检查是否需要滚动
      tempElement.style.fontSize = `${currentSize}px`;
      const finalHeight = tempElement.scrollHeight;
      needsScrolling = finalHeight > containerHeight;
      
      document.body.removeChild(tempElement);
      
      setFontSize(currentSize);
      setNeedsScroll(needsScrolling);
    };

    calculateFontSize();
    
    // 窗口大小改变时重新计算
    window.addEventListener('resize', calculateFontSize);
    return () => window.removeEventListener('resize', calculateFontSize);
  }, [card.skillDesc, card.background]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragOffset({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const deltaY = dragOffset.y - e.clientY;
    const dropped = deltaY > 100;
    onDragEnd(dropped);
  };

  // 根据卡牌类型获取颜色
  const getCardColor = (type: string) => {
    const colors: Record<string, string> = {
      character: '#8B4513',
      skill: '#4169E1',
      event: '#228B22',
      field: '#9932CC',
      gear: '#FF8C00',
      counter: '#DC143C',
    };
    return colors[type] || '#666';
  };

  const textContent = card.skillDesc || card.background || '';

  return (
    <div
      className={`hand-card ${isSelected ? 'selected' : ''} ${isPlayable ? 'playable' : ''}`}
      style={{
        position: 'absolute',
        left: pose.x - 60,
        top: pose.y - 80,
        width: 120,
        height: 160,
        transform: `rotate(${pose.rotation}deg) ${isDragging ? 'scale(1.1)' : ''}`,
        zIndex: isDragging ? 1000 : isHovered ? 50 : pose.zIndex,
        cursor: isDragging ? 'grabbing' : 'grab',
        pointerEvents: 'auto',
        transition: isDragging ? 'none' : 'all 0.2s ease',
      }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={(e) => {
        handleMouseUp(e);
        setIsHovered(false);
      }}
      onMouseEnter={() => setIsHovered(true)}
    >
      {/* 卡牌背景 */}
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#1a1a2e',
          border: `3px solid ${isPlayable ? '#4a90d9' : getCardColor(card.type)}`,
          borderRadius: 12,
          boxShadow: isSelected 
            ? '0 0 20px rgba(74, 144, 217, 0.8)' 
            : '0 4px 12px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* 费用 */}
        <div
          style={{
            position: 'absolute',
            top: 4,
            left: 4,
            width: 28,
            height: 28,
            backgroundColor: '#4a90d9',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: 16,
            color: '#fff',
            border: '2px solid #fff',
            flexShrink: 0,
          }}
        >
          {card.cost}
        </div>

        {/* 名称 - 保持固定高度 */}
        <div
          style={{
            padding: '8px 4px 4px 36px',
            fontSize: 13,
            fontWeight: 'bold',
            color: '#fff',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flexShrink: 0,
            height: 28,
            lineHeight: '16px',
          }}
        >
          {card.name}
        </div>

        {/* 类型标签 - 保持固定高度 */}
        <div
          style={{
            padding: '2px 8px',
            fontSize: 10,
            color: getCardColor(card.type),
            textAlign: 'center',
            borderTop: `1px solid ${getCardColor(card.type)}`,
            borderBottom: `1px solid ${getCardColor(card.type)}`,
            margin: '0 8px',
            flexShrink: 0,
            height: 20,
            lineHeight: '16px',
          }}
        >
          {getCardTypeLabel(card.type)}
        </div>

        {/* 描述区域 - 自适应字体 + 滚动 */}
        <div
          ref={textContainerRef}
          style={{
            flex: 1,
            padding: '8px',
            margin: '4px 0',
            overflow: needsScroll && isHovered ? 'auto' : 'hidden',
            position: 'relative',
            minHeight: 0, // 重要：允许flex子项收缩
          }}
        >
          <div
            ref={textContentRef}
            style={{
              fontSize: `${fontSize}px`,
              color: '#ccc',
              lineHeight: '1.4',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              textAlign: 'left',
            }}
          >
            {textContent}
          </div>
          
          {/* 滚动提示指示器 */}
          {needsScroll && !isHovered && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 12,
                background: 'linear-gradient(transparent, rgba(26, 26, 46, 0.8))',
                pointerEvents: 'none',
              }}
            />
          )}
        </div>

        {/* 学派 - 保持固定高度 */}
        <div
          style={{
            padding: '4px 8px',
            fontSize: 9,
            color: '#d4af37',
            textAlign: 'center',
            borderTop: '1px solid rgba(212, 175, 55, 0.3)',
            flexShrink: 0,
            height: 20,
            lineHeight: '12px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {card.faction}
        </div>
      </div>
    </div>
  );
};

function getCardTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    character: '名士',
    skill: '锦囊',
    event: '事件',
    field: '场地',
    gear: '装备',
    counter: '反制',
  };
  return labels[type] || type;
}

export default HandCard;
