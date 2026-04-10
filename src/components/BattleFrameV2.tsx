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

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useDebateBattle } from '@/battleV2/useDebateBattle';
import { listAllDebateCardsForLibrary } from '@/battleV2/cards';
import { getTopicById } from '@/battleV2/topics';
import { usePlayerLevelState } from '@/game/hooks/usePlayerLevelSystem';
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

interface ChatMessage {
  id: string;
  sender: 'player' | 'enemy' | 'system';
  content: string;
  type: 'emoji' | 'text';
  timestamp: number;
}

function pickRandom<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)] ?? list[0];
}

function makeChatId(): string {
  return `chat_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

function createChatReply(playerMessage: string, emoji?: string): { content: string; type: 'emoji' | 'text' } {
  const emojiReplies = ['👍', '👌', '😄', '😏', '👏', '🎯', '⚡'];
  const neutralReplies = ['收到。', '这步有意思。', '继续。', '我看到了。', '你很有想法。'];
  const pressureReplies = ['差一点。', '这回合要紧了。', '你想抢节奏？', '我会回应。'];

  if (emoji) {
    return { content: pickRandom(emojiReplies), type: 'emoji' };
  }

  const lower = playerMessage.toLowerCase();
  if (lower.includes('厉害') || lower.includes('精彩') || lower.includes('nice')) {
    return { content: pickRandom(['彼此彼此。', '你也很强。', '继续来。']), type: 'text' };
  }
  if (lower.includes('好险') || lower.includes('危险')) {
    return { content: pickRandom(pressureReplies), type: 'text' };
  }
  return { content: pickRandom(neutralReplies), type: 'text' };
}

// 所有可用卡牌（用于图鉴）

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
  onFinished?: (winnerId: string | null) => void;
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
  const playerLevelState = usePlayerLevelState();
  const currentPlayerLevel = Math.max(1, playerLevelState.level || 1);

  // ═══════════════════════════════════════════════════════════
  // 战斗状态管理
  // ═══════════════════════════════════════════════════════════
  const { state, selectTopic, planCard, setTargetSeat, lockPublic, lockSecret } = useDebateBattle({
    arenaId,
    forcedTopicId,
    playerMainFaction,
    enemyMainFaction,
    playerLevel: currentPlayerLevel,
    enemyLevel: currentPlayerLevel,
  });

  const { phase, player, logs, winner } = state;

  useEffect(() => {
    if (phase === 'finished' && onFinished) {
      onFinished(winner);
    }
  }, [phase, winner, onFinished]);
  const isFinished = phase === 'finished';
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
  // 社交功能 - 聊天消息状态
  // ═══════════════════════════════════════════════════════════
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const aiResponseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setChatMessages([
      {
        id: makeChatId(),
        sender: 'enemy' as const,
        content: '准备好了就开始吧。',
        type: 'text' as const,
        timestamp: Date.now(),
      },
    ]);
    return () => {
      if (aiResponseTimerRef.current) {
        clearTimeout(aiResponseTimerRef.current);
      }
    };
  }, []);

  const triggerAIResponse = useCallback((playerMessage: string, emoji?: string) => {
    if (aiResponseTimerRef.current) {
      clearTimeout(aiResponseTimerRef.current);
    }

    aiResponseTimerRef.current = setTimeout(() => {
      const response = createChatReply(playerMessage, emoji);
      setChatMessages((prev) => {
        const next = [
          ...prev,
          {
            id: makeChatId(),
            sender: 'enemy' as const,
            content: response.content,
            type: response.type as ChatMessage['type'],
            timestamp: Date.now(),
          },
        ];
        return next.slice(-50);
      });
    }, 800 + Math.random() * 1200);
  }, []);

  const handleSendMessage = useCallback((message: string) => {
    setChatMessages((prev) => {
      const next = [
        ...prev,
        {
          id: makeChatId(),
          sender: 'player' as const,
          content: message,
          type: 'text' as const,
          timestamp: Date.now(),
        },
      ];
      return next.slice(-50);
    });
    triggerAIResponse(message);
  }, [triggerAIResponse]);

  const handleSendEmoji = useCallback((emoji: string) => {
    setChatMessages((prev) => {
      const next = [
        ...prev,
        {
          id: makeChatId(),
          sender: 'player' as const,
          content: emoji,
          type: 'emoji' as const,
          timestamp: Date.now(),
        },
      ];
      return next.slice(-50);
    });
    triggerAIResponse('', emoji);
  }, [triggerAIResponse]);

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
  const allCards = useMemo(() => listAllDebateCardsForLibrary(), []);

  // ═══════════════════════════════════════════════════════════
  // 渲染
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="w-full h-screen bg-[#1b0c0a] flex flex-col overflow-hidden relative selection:bg-[#d29648] selection:text-[#f8e6be]">
      {/* 全局场景层：远古气象与内发光 */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-[0.05]" />
        {/* 四周内发光：聚焦论战中央 */}
        <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(26,26,26,0.1)]" />
      </div>

      {/* 顶部状态栏 (与下方有木质隔断) */}
      <TopStatusBar
        state={state}
        onOpenCardLibrary={() => setIsCardLibraryOpen(true)}
        onOpenStatus={() => setIsStatusPanelOpen(true)}
        onOpenPlayerInfo={() => setIsStatusPanelOpen(true)}
        onOpenChat={() => setIsChatFloatOpen(true)}
        onMenu={handleMenuClick}
      />

      {/* 结构性隔断：乌金木条线 */}
      <div className="h-2 w-full bg-[#7d3d23] relative z-20 shadow-md" />

      {/* 主内容区 */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative z-10 bg-gradient-to-b from-[#1b0c0a] to-[#2b100c]/20">
        {/* 左侧实录按钮：像卷轴边缘的标签 */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-40">
           <LogButton
             onClick={() => setIsLogDrawerOpen(true)}
             unreadCount={logs.length}
           />
        </div>

        {/* 中央战斗区 */}
        <div className="flex-1 flex flex-col min-w-0">
          <BattleArena
            state={state}
            onSelectSeat={handleSelectSeat}
          />
        </div>

        {/* 右侧操作提示区：悬浮丝帛感 */}
        <div className="hidden xl:flex shrink-0 border-l-2 border-[#d29648]/10 shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
          <OperationHints
            state={state}
            selectedCardId={selectedCardId}
          />
        </div>
      </div>

      {/* 结构性隔断：乌金木条线 (衔接底部案头) */}
      <div className="h-1.5 w-full bg-[#7d3d23] relative z-20" />

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

      <CardLibraryPanel
        isOpen={isCardLibraryOpen}
        onClose={() => setIsCardLibraryOpen(false)}
        allCards={allCards}
        currentPlayerLevel={currentPlayerLevel}
      />

      <StatusPanel
        isOpen={isStatusPanelOpen}
        onClose={() => setIsStatusPanelOpen(false)}
        state={state}
      />

      <LogDrawer
        isOpen={isLogDrawerOpen}
        onClose={() => setIsLogDrawerOpen(false)}
        logs={logs}
      />

      <ChatFloat
        isOpen={isChatFloatOpen}
        onClose={() => setIsChatFloatOpen(false)}
        onSendMessage={handleSendMessage}
        onSendEmoji={handleSendEmoji}
        messages={chatMessages}
      />

      <ExitConfirmModal
        isOpen={isExitConfirmOpen}
        onConfirm={handleExitConfirm}
        onCancel={handleExitCancel}
      />

      {/* 议题选择弹窗 (雅化版) */}
      {isTopicSelectionWindow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2a0e0a]/86 backdrop-blur-md p-4">
          <div className="w-full max-w-5xl rounded-[2.5rem] border-4 border-[#d29648]/20 bg-[#1b0c0a] p-8 md:p-12 shadow-[0_50px_100px_rgba(40,10,8,0.45)] relative overflow-hidden">
            {/* 矿物辉光背景 */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#d29648]/14 blur-[100px]" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#7d3d23]/14 blur-[100px]" />
            </div>

            <div className="mb-10 flex items-end justify-between relative z-10 border-b-2 border-[#d29648]/10 pb-6">
              <div>
                <h3 className="text-3xl font-black tracking-tight text-[#f8e6be] uppercase">议题待定</h3>
                <p className="mt-2 text-sm font-bold text-[#d1b185]/55 uppercase tracking-widest">
                  ROUND {state.round} · TOPIC SELECTION
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-[#d1b185]/55 mb-1">REMAINING TIME</span>
                <div className="rounded-full bg-[#2a0e0a] px-5 py-2 text-xl font-black italic tabular-nums text-[#f8e6be] shadow-lg">
                   {state.topicSelectionSecondsLeft ?? '--'}s
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 relative z-10">
              {topicOptions.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => handleSelectTopic(topic.id)}
                  className="group rounded-[1.5rem] border-2 border-[#d29648]/10 bg-[#1b0c0a] p-8 text-left transition-all hover:border-[#f0c36e] hover:bg-[#341410] hover:shadow-2xl hover:-translate-y-2 relative"
                >
                  <div className="absolute top-4 right-4 w-6 h-6 rounded-full border border-[#d29648]/20 flex items-center justify-center text-[10px] font-black text-[#f8e6be]/20 group-hover:text-[#f8e6be] transition-colors">
                    帖
                  </div>
                  <div className="text-xl font-black text-[#f8e6be] group-hover:text-[#f0c36e] transition-colors">{topic.title}</div>
                  <p className="mt-4 text-xs font-medium leading-6 text-[#d1b185]/60 line-clamp-4">{topic.summary ?? '圣哲遗训，明辨自得。'}</p>
                  
                  <div className="mt-8 pt-4 border-t border-[#d29648]/10 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#f0c36e] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="text-[10px] font-black text-[#f8e6be]/0 group-hover:text-[#f8e6be] transition-all uppercase tracking-widest">择此议题</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          战斗结束遮罩 (雅化版)
         ═══════════════════════════════════════════════════════ */}
      {isFinished && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#1b0c0a] p-4">
          <div className="w-full max-w-2xl text-center">
            {/* 结语标题 */}
            <div className="mb-4">
              <span className="text-[10px] font-black text-[#d1b185]/55 uppercase tracking-[0.4em]">Battle Outcome</span>
            </div>
            
            <h2 className={`text-7xl md:text-9xl font-black italic mb-8 tracking-tighter ${
              state.winner === 'player' ? 'text-[#f0c36e]' : state.winner === 'enemy' ? 'text-[#d46b42]' : 'text-[#f8e6be]'
            }`}>
              {state.winner === 'player' ? '胜天半子' : state.winner === 'enemy' ? '惜败一筹' : '旗鼓相当'}
            </h2>

            <div className="max-w-md mx-auto mb-16">
              <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#d29648]/12 to-transparent mb-4" />
              <p className="text-base font-medium text-[#d1b185]/60 italic serif">
                {state.winner === 'player'
                  ? '“学宫策辩，君子之风。阁下言辞犀利，见识卓绝，此番论战当推首功。”'
                  : state.winner === 'enemy'
                  ? '“胜败兵家常事，策论亦有穷时。阁下虽锋芒稍挫，他日卷土重来未可知也。”'
                  : '“论道至此，双方见解不分轩轾，各领风骚。此乃稷下之幸，百家之福。”'}
              </p>
              <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#d29648]/12 to-transparent mt-4" />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {onReselectArena && (
                <button
                  onClick={onReselectArena}
                  className="w-48 py-4 rounded-xl bg-[#f8e6be] border-2 border-[#d29648]/20 text-[#1b0c0a] font-black text-xs hover:bg-[#2a0e0a] hover:text-[#f8e6be] transition-all shadow-sm active:scale-95 uppercase tracking-widest"
                >
                  易地再战
                </button>
              )}
              {onMenu && (
                <button
                  onClick={onMenu}
                  className="w-48 py-4 rounded-xl bg-[#7d3d23] text-[#f8e6be] font-black text-xs hover:shadow-2xl transition-all active:scale-95 uppercase tracking-widest shadow-xl"
                >
                  撤离讲坛
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
