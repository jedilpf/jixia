/**
 * BattleFrameV2 - 百家争鸣战斗主界面
 * 
 * 三层架构设计：
 * 第一层：主战斗层（常驻显示）
 *   - 顶部状态栏
 *   - 中央主战斗区
 *   - 底部操作区
 * 
 * 第二层：信息面板层（按钮打开）
 *   - 图鉴面板
 *   - 状态面板
 *   - 日志抽屉
 * 
 * 第三层：轻社交层（轻量浮层）
 *   - 消息/表情浮层
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useDebateBattle } from '@/battleV2/useDebateBattle';
import { listAllDebateCardsForLibrary } from '@/battleV2/cards';
import { getTopicById } from '@/battleV2/topics';
import {
  ArenaId,
  SeatId,
} from '@/battleV2/types';

// 三层架构组件
import {
  TopStatusBar,
  BattleArena,
  BottomControls,
  CardLibraryPanel,
  StatusPanel,
  LogDrawer,
  ChatFloat,
  OperationHints,
  LogButton,
  ExitConfirmModal,
} from './battle';

// 所有可用卡牌（用于图鉴）
import { TEST_CARDS_V01 } from '@/battleV2/testCards';

// ═══════════════════════════════════════════════════════════════
// Props
// ═══════════════════════════════════════════════════════════════

interface BattleFrameV2Props {
  arenaId: ArenaId;
  forcedTopicId?: string;
  playerMainFaction?: string;
  enemyMainFaction?: string;
  onMenu?: () => void;
  onReselectArena?: () => void;
  onFinished?: (winnerId: string) => void;
}

// ═══════════════════════════════════════════════════════════════
// 主组件
// ═══════════════════════════════════════════════════════════════

export default function BattleFrameV2({
  arenaId,
  forcedTopicId,
  playerMainFaction,
  enemyMainFaction,
  onMenu,
  onReselectArena,
  onFinished,
}: BattleFrameV2Props) {
  // ═══════════════════════════════════════════════════════════
  // 战斗状态管理
  // ═══════════════════════════════════════════════════════════
  const { state, selectTopic, planCard, setTargetSeat, lockPublic, lockSecret } = useDebateBattle({
    arenaId,
    forcedTopicId,
    playerMainFaction,
    enemyMainFaction,
  });

  const { phase, player, logs } = state;
  const isFinished = phase === 'finished';

  // 战斗结束时调用 onFinished 回调
  useEffect(() => {
    if (isFinished && onFinished && state.winner) {
      onFinished(state.winner);
    }
  }, [isFinished, onFinished, state.winner]);

  const isTopicSelectionWindow =
    state.topicSelectionPending && state.round >= state.topicSelectionRound && state.phase === 'ming_bian';
  const topicOptions = useMemo(() => {
    return state.topicOptions
      .map((topicId) => getTopicById(topicId))
      .filter((topic): topic is NonNullable<ReturnType<typeof getTopicById>> => Boolean(topic));
  }, [state.topicOptions]);

  // ═══════════════════════════════════════════════════════════
  // 本地UI状态
  // ═══════════════════════════════════════════════════════════
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<'main' | 'secret' | null>(null);

  // 面板开关状态
  const [isCardLibraryOpen, setIsCardLibraryOpen] = useState(false);
  const [isStatusPanelOpen, setIsStatusPanelOpen] = useState(false);
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState(false);
  const [isChatFloatOpen, setIsChatFloatOpen] = useState(false);
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);

  // ═══════════════════════════════════════════════════════════
  // 卡牌选择处理
  // ═══════════════════════════════════════════════════════════
  const handleSelectCard = useCallback((cardId: string | null) => {
    if (isTopicSelectionWindow) return;
    setSelectedCardId(cardId);
    if (cardId) {
      // 自动判断是明论还是暗策
      const card = player.hand.find(c => c.id === cardId);
      if (card) {
        if (phase === 'ming_bian' && !player.plan.lockedPublic) {
          setSelectedAction('main');
        } else if (phase === 'an_mou' && !player.plan.lockedSecret) {
          setSelectedAction('secret');
        }
      }
    } else {
      setSelectedAction(null);
    }
  }, [isTopicSelectionWindow, phase, player.hand, player.plan.lockedPublic, player.plan.lockedSecret]);

  // ═══════════════════════════════════════════════════════════
  // 席位选择处理
  // ═══════════════════════════════════════════════════════════
  const handleSelectSeat = useCallback((seat: SeatId) => {
    if (isTopicSelectionWindow) return;
    if (!selectedCardId || !selectedAction) return;

    if (selectedAction === 'main') {
      setTargetSeat('main', seat);
    } else if (selectedAction === 'secret') {
      setTargetSeat('secret', seat);
    }
  }, [isTopicSelectionWindow, selectedCardId, selectedAction, setTargetSeat]);

  // ═══════════════════════════════════════════════════════════
  // 确认出牌
  // ═══════════════════════════════════════════════════════════
  const handleConfirm = useCallback(() => {
    if (isTopicSelectionWindow) return;
    if (!selectedCardId || !selectedAction) return;

    const slot: 'main' | 'secret' = selectedAction;
    planCard(slot, selectedCardId);

    // 清空选择
    setSelectedCardId(null);
    setSelectedAction(null);
  }, [isTopicSelectionWindow, selectedCardId, selectedAction, planCard]);

  // ═══════════════════════════════════════════════════════════
  // 取消选择
  // ═══════════════════════════════════════════════════════════
  const handleCancel = useCallback(() => {
    setSelectedCardId(null);
    setSelectedAction(null);
  }, []);

  // ═══════════════════════════════════════════════════════════
  // 结束回合
  // ═══════════════════════════════════════════════════════════
  const handleEndTurn = useCallback(() => {
    if (isTopicSelectionWindow) return;
    if (phase === 'ming_bian') {
      lockPublic();
    } else if (phase === 'an_mou') {
      lockSecret();
    }
  }, [isTopicSelectionWindow, phase, lockPublic, lockSecret]);

  const handleSelectTopic = useCallback(
    (topicId: string) => {
      selectTopic(topicId);
    },
    [selectTopic],
  );

  // ═══════════════════════════════════════════════════════════
  // 社交功能
  // ═══════════════════════════════════════════════════════════
  const handleSendMessage = useCallback((message: string) => {
    console.log('发送消息:', message);
    // TODO: 实现消息发送逻辑
  }, []);

  const handleSendEmoji = useCallback((emoji: string) => {
    console.log('发送表情:', emoji);
    // TODO: 实现表情发送逻辑
  }, []);

  // ═══════════════════════════════════════════════════════════
  // 退出确认处理
  // ═══════════════════════════════════════════════════════════
  const handleMenuClick = useCallback(() => {
    setIsExitConfirmOpen(true);
  }, []);

  const handleExitConfirm = useCallback(() => {
    setIsExitConfirmOpen(false);
    if (onMenu) {
      onMenu();
    }
  }, [onMenu]);

  const handleExitCancel = useCallback(() => {
    setIsExitConfirmOpen(false);
  }, []);

  // ═══════════════════════════════════════════════════════════
  // 图鉴数据
  // ═══════════════════════════════════════════════════════════
  const allCards = useMemo(() => {
    return listAllDebateCardsForLibrary() || TEST_CARDS_V01;
  }, []);

  // ═══════════════════════════════════════════════════════════
  // 渲染
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="w-full h-screen bg-gradient-to-b from-[#0d0b08] to-[#1a1510] flex flex-col overflow-hidden">
      {/* ═══════════════════════════════════════════════════════
          第一层：常驻主战斗层
         ═══════════════════════════════════════════════════════ */}

      {/* 顶部状态栏 */}
      <TopStatusBar
        state={state}
        onOpenCardLibrary={() => setIsCardLibraryOpen(true)}
        onOpenStatus={() => setIsStatusPanelOpen(true)}
        onOpenPlayerInfo={() => setIsStatusPanelOpen(true)}
        onOpenChat={() => setIsChatFloatOpen(true)}
        onMenu={handleMenuClick}
      />

      {/* 主内容区 */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* 左侧日志按钮 */}
        <LogButton
          onClick={() => setIsLogDrawerOpen(true)}
          unreadCount={logs.length}
        />

        {/* 中央战斗区 */}
        <div className="flex-1 flex flex-col min-w-0">
          <BattleArena
            state={state}
            onSelectSeat={handleSelectSeat}
          />
        </div>

        {/* 右侧操作提示区 */}
        <div className="hidden xl:flex shrink-0">
          <OperationHints
            state={state}
            selectedCardId={selectedCardId}
          />
        </div>
      </div>

      {/* 底部操作区 */}
      <BottomControls
        state={state}
        selectedCardId={selectedCardId}
        onSelectCard={handleSelectCard}
        onEndTurn={handleEndTurn}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      {/* ═══════════════════════════════════════════════════════
          第二层：信息面板层（弹层/抽屉）
         ═══════════════════════════════════════════════════════ */}

      {/* 图鉴面板 */}
      <CardLibraryPanel
        isOpen={isCardLibraryOpen}
        onClose={() => setIsCardLibraryOpen(false)}
        allCards={allCards}
      />

      {/* 状态面板 */}
      <StatusPanel
        isOpen={isStatusPanelOpen}
        onClose={() => setIsStatusPanelOpen(false)}
        state={state}
      />

      {/* 日志抽屉 */}
      <LogDrawer
        isOpen={isLogDrawerOpen}
        onClose={() => setIsLogDrawerOpen(false)}
        logs={logs}
      />

      {/* ═══════════════════════════════════════════════════════
          第三层：轻社交层（轻量浮层）
         ═══════════════════════════════════════════════════════ */}

      {/* 消息/表情浮层 */}
      <ChatFloat
        isOpen={isChatFloatOpen}
        onClose={() => setIsChatFloatOpen(false)}
        onSendMessage={handleSendMessage}
        onSendEmoji={handleSendEmoji}
      />

      {/* 退出确认对话框 */}
      <ExitConfirmModal
        isOpen={isExitConfirmOpen}
        onConfirm={handleExitConfirm}
        onCancel={handleExitCancel}
      />

      {isTopicSelectionWindow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl rounded-2xl border-2 border-[#c9952a] bg-gradient-to-b from-[#1a1510] to-[#0d0b08] p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold tracking-wide text-[#f0ddb1]">选择本局议题</h3>
                <p className="mt-1 text-sm text-[#b8a88a]">
                  第 {state.round} 回合触发。确定后继续明辩与暗策流程。
                </p>
              </div>
              <div className="rounded border border-[#8b6e44] bg-[#322717] px-3 py-1 text-sm text-[#ffd48a]">
                自动选择倒计时 {state.topicSelectionSecondsLeft ?? '--'}s
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {topicOptions.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => handleSelectTopic(topic.id)}
                  className="rounded-xl border border-[#5c4d3a] bg-[#1f1a12]/70 p-4 text-left transition hover:border-[#d4af65] hover:bg-[#2a2116]"
                >
                  <div className="text-base text-[#f7dfb0]">{topic.title}</div>
                  <p className="mt-2 text-xs leading-5 text-[#c6d3df]">{topic.summary ?? '无摘要'}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          战斗结束遮罩
         ═══════════════════════════════════════════════════════ */}
      {isFinished && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="p-8 rounded-2xl bg-gradient-to-b from-[#1a1510] to-[#0d0b08] border-2 border-[#c9952a] shadow-2xl text-center">
            <h2 className="text-3xl font-bold text-[#c9952a] mb-4">
              {state.winner === 'player' ? '胜利' : state.winner === 'enemy' ? '失败' : '平局'}
            </h2>
            <p className="text-[#c9b896] mb-6">
              {state.winner === 'player'
                ? '你赢得了这场辩论！'
                : state.winner === 'enemy'
                ? '对手技高一筹...'
                : '双方势均力敌'}
            </p>
            <div className="flex gap-4 justify-center">
              {onReselectArena && (
                <button
                  onClick={onReselectArena}
                  className="px-6 py-3 rounded-lg bg-[#2a2318] border border-[#5c4d3a] text-[#b8a88a] hover:bg-[#3d3225] transition-all"
                >
                  选择其他论场
                </button>
              )}
              {onMenu && (
                <button
                  onClick={onMenu}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#c9952a] to-[#b88520] text-white font-medium hover:from-[#d9a53a] hover:to-[#c89530] transition-all"
                >
                  返回主菜单
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
