/**
 * 弃牌阶段辅助组件
 *
 * 提供：
 * 1. 智能推荐弃牌组合
 * 2. 一键弃牌功能
 * 3. 弃牌确认动画
 */

import { useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DebateCard } from '@/battleV2/types';

interface DiscardRecommendationProps {
  hand: DebateCard[];
  needDiscard: number;
  selectedCardIds: string[];
  onCardSelect: (cardId: string) => void;
  onConfirm: () => void;
  onAutoDiscard: (cardIds: string[]) => void;
  secondsLeft: number;
}

// 卡牌价值评估（用于推荐弃牌）
function evaluateCardDiscardValue(card: DebateCard): number {
  // 保留价值高的卡牌，弃牌价值低的
  let value = 0;

  // 效果类型权重
  const typeWeights: Record<string, number> = {
    '立论': 15,  // 主战牌，保留
    '反诘': 12,  // 反制牌，重要
    '策术': 8,   // 辅助牌
    '门客': 10,  // 单位牌
    '玄章': 6,   // 场地牌
  };

  value += typeWeights[card.type] || 5;

  // 费效比
  if (card.effectValue > 0 && card.cost > 0) {
    value += (card.effectValue / card.cost) * 5;
  }

  // 门客属性
  if (card.power && card.hp) {
    value += (card.power + card.hp) / 2;
  }

  // 高费牌更值得保留
  value += card.cost * 0.5;

  return value;
}

/**
 * 获取推荐的弃牌组合
 */
export function getRecommendedDiscardCards(hand: DebateCard[], count: number): string[] {
  if (count <= 0 || hand.length === 0) return [];

  // 计算每张卡的保留价值
  const scoredCards = hand.map(card => ({
    card,
    value: evaluateCardDiscardValue(card),
  }));

  // 按价值升序排序（低价值在前，优先弃掉）
  scoredCards.sort((a, b) => a.value - b.value);

  // 返回最低价值的N张卡
  return scoredCards.slice(0, count).map(s => s.card.id);
}

const V9_COLORS = {
  paper: '#FDFBF7',
  ink: '#1A1A1A',
  gold: '#D4AF65',
  jade: '#3A5F41',
  crimson: '#8D2F2F',
};

export function DiscardRecommendationPanel({
  hand,
  needDiscard,
  selectedCardIds,
  onCardSelect,
  onConfirm,
  onAutoDiscard,
  secondsLeft,
}: DiscardRecommendationProps) {
  // 智能推荐的弃牌ID列表
  const recommendedIds = useMemo(() => {
    return getRecommendedDiscardCards(hand, needDiscard);
  }, [hand, needDiscard]);

  // 一键弃牌
  const handleQuickDiscard = useCallback(() => {
    onAutoDiscard(recommendedIds);
  }, [recommendedIds, onAutoDiscard]);

  // 检查选择数量
  const selectedCount = selectedCardIds.length;
  const isValidSelection = selectedCount === needDiscard;
  const isOverSelection = selectedCount > needDiscard;

  // 时间紧迫警告
  const isUrgent = secondsLeft <= 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-0 left-0 right-0 z-50 p-4"
      style={{
        background: 'linear-gradient(to top, rgba(16, 25, 46, 0.98), rgba(16, 25, 46, 0.9))',
        borderTop: '1px solid rgba(212, 165, 32, 0.3)',
      }}
    >
      {/* 标题区 */}
      <div className="flex items-center justify-between mb-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <span
            className="text-lg font-serif font-bold"
            style={{ color: V9_COLORS.gold }}
          >
            弃牌阶段
          </span>
          <span
            className="text-sm"
            style={{ color: '#a7c5ba' }}
          >
            请选择 {needDiscard} 张卡牌弃置
          </span>
        </div>

        {/* 倒计时 */}
        <div
          className="px-3 py-1 rounded-lg text-sm font-mono"
          style={{
            background: isUrgent ? 'rgba(141, 47, 47, 0.3)' : 'rgba(212, 165, 32, 0.1)',
            border: `1px solid ${isUrgent ? V9_COLORS.crimson : V9_COLORS.gold}40`,
            color: isUrgent ? '#ff6666' : V9_COLORS.gold,
          }}
        >
          {secondsLeft}s
        </div>
      </div>

      {/* 手牌展示 */}
      <div className="flex gap-3 overflow-x-auto pb-2 mb-4 max-w-4xl mx-auto scrollbar-thin">
        {hand.map((card) => {
          const isSelected = selectedCardIds.includes(card.id);
          const isRecommended = recommendedIds.includes(card.id);
          const cardValue = evaluateCardDiscardValue(card);

          return (
            <motion.button
              key={card.id}
              onClick={() => onCardSelect(card.id)}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex-shrink-0 w-24 rounded-lg overflow-hidden"
              style={{
                background: isSelected
                  ? 'rgba(212, 165, 32, 0.2)'
                  : 'rgba(0, 0, 0, 0.4)',
                border: `2px solid ${
                  isSelected
                    ? V9_COLORS.gold
                    : isRecommended
                    ? 'rgba(90, 201, 114, 0.5)'
                    : 'rgba(139, 115, 85, 0.3)'
                }`,
                boxShadow: isSelected
                  ? '0 0 15px rgba(212, 165, 32, 0.3)'
                  : 'none',
              }}
            >
              {/* 推荐标记 */}
              {isRecommended && !isSelected && (
                <div
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                  style={{
                    background: '#5ac972',
                    color: '#0a0f18',
                  }}
                >
                  ✓
                </div>
              )}

              {/* 卡牌信息 */}
              <div className="p-2">
                <div
                  className="text-xs font-serif truncate mb-1"
                  style={{ color: '#f5e6b8' }}
                >
                  {card.name}
                </div>
                <div
                  className="text-xs"
                  style={{ color: '#a7c5ba' }}
                >
                  费用: {card.cost}
                </div>
                <div
                  className="text-xs"
                  style={{ color: '#888' }}
                >
                  价值: {Math.round(cardValue)}
                </div>
              </div>

              {/* 选中数量 */}
              {isSelected && (
                <div
                  className="absolute top-1 left-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: V9_COLORS.gold,
                    color: '#0a0f18',
                  }}
                >
                  {selectedCardIds.indexOf(card.id) + 1}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-4 justify-center max-w-4xl mx-auto">
        {/* 一键弃牌 */}
        <motion.button
          onClick={handleQuickDiscard}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-2.5 rounded-lg text-sm font-serif"
          style={{
            background: 'rgba(90, 201, 114, 0.15)',
            border: '1px solid rgba(90, 201, 114, 0.4)',
            color: '#5ac972',
          }}
        >
          💡 一键弃牌（推荐）
        </motion.button>

        {/* 确认弃牌 */}
        <motion.button
          onClick={onConfirm}
          whileHover={{ scale: isValidSelection ? 1.02 : 1 }}
          whileTap={{ scale: isValidSelection ? 0.98 : 1 }}
          disabled={!isValidSelection}
          className="px-6 py-2.5 rounded-lg text-sm font-serif transition-all"
          style={{
            background: isValidSelection
              ? 'rgba(212, 165, 32, 0.2)'
              : 'rgba(100, 100, 100, 0.2)',
            border: `1px solid ${isValidSelection ? V9_COLORS.gold : 'rgba(100, 100, 100, 0.3)'}`,
            color: isValidSelection ? V9_COLORS.gold : '#666',
            cursor: isValidSelection ? 'pointer' : 'not-allowed',
          }}
        >
          确认弃牌 ({selectedCount}/{needDiscard})
        </motion.button>
      </div>

      {/* 状态提示 */}
      <AnimatePresence>
        {isOverSelection && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center mt-2 text-sm"
            style={{ color: V9_COLORS.crimson }}
          >
            ⚠️ 选择数量超出，请取消部分选择
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * 弃牌确认动画组件
 */
export function DiscardConfirmAnimation({
  cards,
  onComplete,
}: {
  cards: DebateCard[];
  onComplete: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.8)' }}
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="mb-4"
          style={{ color: V9_COLORS.gold }}
        >
          <span className="text-2xl font-serif">弃牌完成</span>
        </motion.div>

        <div className="flex gap-4 justify-center flex-wrap max-w-lg">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 50, rotateY: 180 }}
              animate={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              onAnimationComplete={index === cards.length - 1 ? onComplete : undefined}
              className="w-20 p-2 rounded-lg text-center"
              style={{
                background: 'rgba(16, 25, 46, 0.8)',
                border: '1px solid rgba(212, 165, 32, 0.3)',
              }}
            >
              <div className="text-xs truncate" style={{ color: '#f5e6b8' }}>
                {card.name}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}