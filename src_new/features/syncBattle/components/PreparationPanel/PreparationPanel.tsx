import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { Card } from '../../../../types/domain';

interface PreparationPanelProps {
  deck: Card[];
  timeRemaining: number;
  onDeckReorder: (newOrder: number[]) => void;
  onPresetSelect: (cardIndex: number, slot: number) => void;
  onReady: () => void;
  isReady: boolean;
}

/**
 * PreparationPanel - 准备阶段面板
 * 
 * 职责：
 * - 显示当前卡组
 * - 支持拖拽排序
 * - 预设卡牌选择
 * - 准备就绪确认
 */
export const PreparationPanel: React.FC<PreparationPanelProps> = ({
  deck,
  timeRemaining,
  onDeckReorder,
  onPresetSelect,
  onReady,
  isReady,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    // 重新排序
    const newOrder = [...Array(deck.length).keys()];
    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(index, 0, removed);

    onDeckReorder(newOrder);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const formatTime = (ms: number): string => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}秒`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      style={styles.container}
    >
      {/* 标题和时间 */}
      <div style={styles.header}>
        <h2 style={styles.title}>准备阶段</h2>
        <div style={styles.timer}>剩余时间: {formatTime(timeRemaining)}</div>
      </div>

      {/* 说明文字 */}
      <div style={styles.instructions}>
        <p>• 拖拽卡牌调整卡组顺序</p>
        <p>• 点击下方槽位预设本回合要使用的卡牌</p>
        <p>• 确认准备后等待对手就绪</p>
      </div>

      {/* 预设槽位 */}
      <div style={styles.presetSection}>
        <h3 style={styles.sectionTitle}>本回合预设 (最多3张)</h3>
        <div style={styles.presetSlots}>
          {[0, 1, 2].map((slot) => (
            <div
              key={slot}
              style={{
                ...styles.presetSlot,
                borderColor: selectedPreset === slot ? '#d4af37' : '#444',
              }}
              onClick={() => setSelectedPreset(slot)}
            >
              <span style={styles.slotNumber}>{slot + 1}</span>
              <span style={styles.slotHint}>点击选择卡牌</span>
            </div>
          ))}
        </div>
      </div>

      {/* 卡组列表 */}
      <div style={styles.deckSection}>
        <h3 style={styles.sectionTitle}>卡组排序</h3>
        <div style={styles.deckList}>
          {deck.map((card, index) => (
            <div
              key={`${card.id}_${index}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              style={{
                ...styles.deckCard,
                opacity: draggedIndex === index ? 0.5 : 1,
                transform: draggedIndex === index ? 'scale(1.05)' : 'scale(1)',
              }}
              onClick={() => {
                if (selectedPreset !== null) {
                  onPresetSelect(index, selectedPreset);
                }
              }}
            >
              <div style={styles.cardCost}>{card.cost}</div>
              <div style={styles.cardName}>{card.name}</div>
              <div style={styles.cardType}>{getCardTypeLabel(card.type)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 准备按钮 */}
      <button
        onClick={onReady}
        disabled={isReady}
        style={{
          ...styles.readyButton,
          backgroundColor: isReady ? '#228B22' : '#d4af37',
          cursor: isReady ? 'default' : 'pointer',
        }}
      >
        {isReady ? '已准备就绪' : '确认准备'}
      </button>
    </motion.div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    maxWidth: 900,
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 16,
    border: '2px solid #d4af37',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#d4af37',
    margin: 0,
  },
  timer: {
    fontSize: 18,
    color: '#4a90d9',
    fontFamily: 'monospace',
  },
  instructions: {
    fontSize: 14,
    color: '#888',
    lineHeight: 1.8,
  },
  presetSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ccc',
    margin: 0,
  },
  presetSlots: {
    display: 'flex',
    gap: 16,
    justifyContent: 'center',
  },
  presetSlot: {
    width: 100,
    height: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '2px dashed #444',
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  slotNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
  },
  slotHint: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  deckSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  deckList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    maxHeight: 300,
    overflowY: 'auto',
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
  },
  deckCard: {
    width: 120,
    padding: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    cursor: 'grab',
    transition: 'all 0.2s ease',
    userSelect: 'none',
  },
  cardCost: {
    width: 24,
    height: 24,
    backgroundColor: '#4a90d9',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cardType: {
    fontSize: 10,
    color: '#888',
  },
  readyButton: {
    padding: '16px 48px',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    border: 'none',
    borderRadius: 8,
    alignSelf: 'center',
    transition: 'all 0.2s ease',
  },
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

export default PreparationPanel;
