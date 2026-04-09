/**
 * AI行动预览组件
 *
 * 功能：
 * 1. "敌方思考中..."动画
 * 2. 低难度模式下的AI意图提示
 * 3. AI出牌回放功能
 * 4. AI决策可视化
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DebateBattleState, DebateCard } from '@/battleV2/types';

interface AIActionPreviewProps {
  state: DebateBattleState;
  isVisible: boolean;
  difficultyMode: 'normal' | 'novice';
}

// AI意图类型
type AIIntentType =
  | 'planning_attack'    // 准备进攻
  | 'planning_defense'   // 准备防守
  | 'planning_combo'     // 准备连击
  | 'planning_resource'  // 积攒资源
  | 'waiting'            // 等待观察
  | 'analyzing';         // 分析局势

interface AIIntent {
  type: AIIntentType;
  confidence: number;    // 置信度 0-1
  description: string;
  suggestedCards: string[];  // 可能出的牌
}

// AI意图推断（基于敌方手牌和局势）
function inferAIIntent(state: DebateBattleState): AIIntent {
  const { enemy, player, phase } = state;
  const enemyHand = enemy.hand;
  const playerDaShi = player.resources.daShi;
  const enemyDaShi = enemy.resources.daShi;

  // 分析敌方手牌构成
  const attackCards = enemyHand.filter(c => c.effectKind === 'damage');
  const defenseCards = enemyHand.filter(c => c.effectKind === 'shield');
  const drawCards = enemyHand.filter(c => c.effectKind === 'draw');

  // 判断意图
  if (phase === 'ming_bian') {
    // 明辩阶段：优先高费牌或攻击牌
    if (attackCards.length >= 2 && enemy.resources.lingShi >= 3) {
      return {
        type: 'planning_attack',
        confidence: 0.75,
        description: '敌方可能准备强力攻势',
        suggestedCards: attackCards.slice(0, 2).map(c => c.name),
      };
    }
    if (defenseCards.length > 0 && playerDaShi > enemyDaShi) {
      return {
        type: 'planning_defense',
        confidence: 0.6,
        description: '敌方可能采取防守策略',
        suggestedCards: defenseCards.slice(0, 1).map(c => c.name),
      };
    }
    if (drawCards.length > 0 && enemyHand.length <= 4) {
      return {
        type: 'planning_resource',
        confidence: 0.5,
        description: '敌方可能在积攒资源',
        suggestedCards: [],
      };
    }
  }

  if (phase === 'an_mou') {
    // 暗谋阶段：更隐蔽
    if (enemy.plan.lockedPublic) {
      const mainCard = enemy.hand.find(c => c.id === enemy.plan.mainCardId);
      if (mainCard && mainCard.effectKind === 'damage') {
        return {
          type: 'planning_combo',
          confidence: 0.65,
          description: '敌方可能在策划连续攻击',
          suggestedCards: [mainCard.name],
        };
      }
    }
    return {
      type: 'analyzing',
      confidence: 0.4,
      description: '敌方正在暗中布局',
      suggestedCards: [],
    };
  }

  return {
    type: 'waiting',
    confidence: 0.3,
    description: '敌方在观察局势',
    suggestedCards: [],
  };
}

// 思考动画组件
function ThinkingIndicator() {
  const dots = ['', '.', '..', '...'];
  const [dotIndex, setDotIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDotIndex(i => (i + 1) % dots.length);
    }, 500);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-2 px-4 py-2 rounded-lg"
      style={{
        background: 'rgba(139,92,246,0.15)',
        border: '1px solid rgba(139,92,246,0.3)',
      }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-5 h-5 rounded-full border-2 border-t-transparent"
        style={{ borderColor: '#8b5cf6', borderTopColor: 'transparent' }}
      />
      <span className="text-sm" style={{ color: '#8b5cf6' }}>
        敌方思考中{dots[dotIndex]}
      </span>
    </motion.div>
  );
}

// AI意图提示组件
function IntentHint({ intent, showDetails }: { intent: AIIntent; showDetails: boolean }) {
  const intentColors: Record<AIIntentType, string> = {
    planning_attack: '#ff4444',
    planning_defense: '#4488ff',
    planning_combo: '#ffaa00',
    planning_resource: '#5ac972',
    waiting: '#888888',
    analyzing: '#8b5cf6',
  };

  const intentIcons: Record<AIIntentType, string> = {
    planning_attack: '⚔️',
    planning_defense: '🛡️',
    planning_combo: '⚡',
    planning_resource: '📦',
    waiting: '👁️',
    analyzing: '🔮',
  };

  const color = intentColors[intent.type];
  const icon = intentIcons[intent.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-3 rounded-lg"
      style={{
        background: `${color}15`,
        border: `1px solid ${color}40`,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-medium" style={{ color }}>
          {intent.description}
        </span>
        {showDetails && (
          <span
            className="text-xs px-2 py-0.5 rounded"
            style={{
              background: `${color}20`,
              color,
            }}
          >
            置信度 {Math.round(intent.confidence * 100)}%
          </span>
        )}
      </div>

      {showDetails && intent.suggestedCards.length > 0 && (
        <div className="mt-2 text-xs" style={{ color: '#a7c5ba' }}>
          <span className="opacity-60">可能出牌：</span>
          <span className="ml-1">{intent.suggestedCards.join('、')}</span>
        </div>
      )}
    </motion.div>
  );
}

// AI出牌回放组件
interface AIPlayReplayProps {
  card: DebateCard | null;
  action: 'play' | 'discard' | 'draw' | null;
  onComplete: () => void;
}

export function AIPlayReplay({ card, action, onComplete }: AIPlayReplayProps) {
  useEffect(() => {
    if (card && action) {
      const timer = setTimeout(onComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [card, action, onComplete]);

  if (!card || !action) return null;

  const actionText = {
    play: '出牌',
    discard: '弃牌',
    draw: '抽牌',
  }[action];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed top-1/3 left-1/2 -translate-x-1/2 z-[100] p-4 rounded-xl"
      style={{
        background: 'linear-gradient(to bottom, rgba(26,21,16,0.98), rgba(13,11,8,0.98))',
        border: '2px solid rgba(201,149,42,0.5)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
      }}
    >
      <div className="text-center">
        <div className="text-sm mb-2" style={{ color: '#a7c5ba' }}>
          敌方{actionText}
        </div>
        <motion.div
          initial={{ rotateY: 180 }}
          animate={{ rotateY: 0 }}
          transition={{ duration: 0.6 }}
          className="w-24 h-32 rounded-lg flex items-center justify-center"
          style={{
            background: 'rgba(201,149,42,0.2)',
            border: '2px solid rgba(201,149,42,0.5)',
          }}
        >
          <div className="text-center p-2">
            <div className="text-xs" style={{ color: '#d4a520' }}>{card.type}</div>
            <div className="text-sm font-bold mt-1" style={{ color: '#f5e6b8' }}>{card.name}</div>
            <div className="text-xs mt-1" style={{ color: '#a7c5ba' }}>费用: {card.cost}</div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// 主组件
export function AIActionPreview({
  state,
  isVisible,
  difficultyMode,
}: AIActionPreviewProps) {
  const [showIntent, setShowIntent] = useState(false);

  // 计算AI意图
  const aiIntent = useMemo(() => inferAIIntent(state), [state]);

  // 是否显示详细信息（仅低难度）
  const showDetails = difficultyMode === 'novice';

  // 是否正在思考
  const isThinking =
    (state.phase === 'ming_bian' && !state.enemy.plan.lockedPublic) ||
    (state.phase === 'an_mou' && !state.enemy.plan.lockedSecret);

  // 延迟显示意图（模拟AI思考时间）
  useEffect(() => {
    if (isThinking && isVisible) {
      const timer = setTimeout(() => {
        setShowIntent(true);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setShowIntent(false);
    }
  }, [isThinking, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 right-4 z-[50] w-64">
      <AnimatePresence mode="wait">
        {isThinking && (
          <motion.div
            key="thinking"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-2"
          >
            <ThinkingIndicator />

            {/* 仅低难度显示意图提示 */}
            {showIntent && showDetails && (
              <IntentHint intent={aiIntent} showDetails={showDetails} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// AI决策可视化组件（战斗结束后查看）
interface AIDecisionLogProps {
  decisions: Array<{
    round: number;
    phase: string;
    action: string;
    reasoning?: string;
  }>;
  isOpen: boolean;
  onClose: () => void;
}

export function AIDecisionLog({ decisions, isOpen, onClose }: AIDecisionLogProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[2000] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.8)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="w-full max-w-lg max-h-[80vh] overflow-hidden rounded-xl"
        style={{
          background: 'linear-gradient(to bottom, rgba(26,21,16,0.98), rgba(13,11,8,0.98))',
          border: '2px solid rgba(201,149,42,0.5)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <header className="p-4 border-b border-[rgba(201,149,42,0.2)]">
          <h3 className="text-lg font-serif font-bold" style={{ color: '#d4a520' }}>
            AI决策记录
          </h3>
          <p className="text-xs mt-1" style={{ color: '#a7c5ba' }}>
            查看敌方在本局中的决策过程
          </p>
        </header>

        <main className="p-4 max-h-96 overflow-y-auto space-y-3">
          {decisions.map((decision, index) => (
            <div
              key={index}
              className="p-3 rounded-lg"
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(139,115,85,0.2)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs" style={{ color: '#888' }}>
                  第{decision.round}回合 · {decision.phase}
                </span>
              </div>
              <div className="text-sm" style={{ color: '#f5e6b8' }}>
                {decision.action}
              </div>
              {decision.reasoning && (
                <div className="text-xs mt-1" style={{ color: '#a7c5ba' }}>
                  原因：{decision.reasoning}
                </div>
              )}
            </div>
          ))}
        </main>

        <footer className="p-4 border-t border-[rgba(201,149,42,0.2)]">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-lg text-sm"
            style={{
              background: 'rgba(201,149,42,0.2)',
              border: '1px solid rgba(201,149,42,0.4)',
              color: '#d4a520',
            }}
          >
            关闭
          </button>
        </footer>
      </motion.div>
    </motion.div>
  );
}