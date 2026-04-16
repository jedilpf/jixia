// EnhancedCardBattleView.tsx - 增强版卡牌战斗视图
// 包含拖拽功能、金币系统、回合时间控制UI

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/types';
import { useEnhancedCardBattle, BattleUnit } from './EnhancedCardBattle';
import { PixiBattleStage } from './pixi/PixiBattleStage';

// ==================== 主组件 ====================

type DropTarget = { type: 'board'; row: 'front' | 'back'; col: number } | { type: 'slot'; name: string };

export function EnhancedCardBattleView({ battle, endTurn, restart, onExit }: any) {
  const {
    selectCard,
    selectUnit,
    startDrag,
    updateDrag,
    endDrag,
    unitAttack,
    heroAttack,
  } = useEnhancedCardBattle();

  const [hoveredCard, setHoveredCard] = useState<Card | null>(null);
  const [draggingCard, setDraggingCard] = useState<Card | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const actionSlotRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // 处理拖拽开始
  const handleDragStart = (card: Card, e: React.MouseEvent | React.TouchEvent) => {
    if (battle.phase !== 'player-turn') return;

    setDraggingCard(card);
    selectCard(card);

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setDragPosition({ x: clientX, y: clientY });
    startDrag(card, clientX, clientY);
  };

  // 处理拖拽移动
  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!draggingCard) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setDragPosition({ x: clientX, y: clientY });
    updateDrag(clientX, clientY);

    let target: DropTarget | null = null;

    // 非门客牌的拖拽，检测 Action Slots
    if (draggingCard.type !== 'character') {
      for (const [name, el] of Object.entries(actionSlotRefs.current)) {
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
          target = { type: 'slot', name };
          break;
        }
      }
    }

    // 门客牌的拖拽，或者没有匹配到槽位，检测 Battlefield
    if (!target && draggingCard.type === 'character' && boardRef.current) {
      const boardRect = boardRef.current.getBoundingClientRect();
      const relativeX = clientX - boardRect.left;
      const relativeY = clientY - boardRect.top;

      const colWidth = boardRect.width / 3;
      const rowHeight = boardRect.height / 2;

      const col = Math.floor(relativeX / colWidth);
      const row = Math.floor(relativeY / rowHeight);

      if (col >= 0 && col < 3 && row >= 0 && row < 2) {
        target = { type: 'board', row: row === 0 ? 'front' : 'back', col };
      }
    }

    setDropTarget(target);
  };

  // 处理拖拽结束
  const handleDragEnd = () => {
    if (draggingCard && dropTarget) {
      endDrag(dropTarget);
    } else {
      endDrag(undefined);
    }
    setDraggingCard(null);
    setDropTarget(null);
    selectCard(null);
  };

  // 处理战场位置点击
  const handleBoardPositionClick = (row: 'front' | 'back', col: number) => {
    if (battle.phase !== 'player-turn') return;

    const unit = battle.player.board[row][col];

    if (unit) {
      selectUnit(unit);
      return;
    }
  };

  // 处理敌方单位点击（攻击目标）
  const handleEnemyUnitClick = (unit: BattleUnit) => {
    if (battle.phase !== 'player-turn') return;

    if (battle.selectedUnit) {
      unitAttack(battle.selectedUnit, unit);
      selectUnit(null);
    }
  };

  // 处理敌方英雄点击（攻击英雄）
  const handleEnemyHeroClick = () => {
    if (battle.phase !== 'player-turn') return;

    if (battle.selectedUnit) {
      unitAttack(battle.selectedUnit, 'hero');
      selectUnit(null);
    }
  };

  return (
    <div
      className="relative w-full h-screen bg-[#ece6d9] overflow-hidden select-none font-serif text-[#3e342b]"
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
    >
      {/* Background texture from the UI Blueprint (simplified using CSS) */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-700 via-[#ece6d9] to-gray-900 pointer-events-none" />

      {/* PixiJS Rendering Layer */}
      <PixiBattleStage
        width={window.innerWidth}
        height={window.innerHeight}
        battle={battle}
        dropTargetPos={dropTarget?.type === 'board' ? { row: dropTarget.row, col: dropTarget.col } : null}
      />

      {/* Top Bar / Status */}
      <BattleTopBar turn={battle.turn} phase={battle.phase} turnStage={battle.turnStage} onExit={onExit} />

      {/* LEFT AREA: Player Avatars & Resources */}
      <div className="absolute top-24 left-8 w-64 z-20">
        <HeroProfile hero={battle.enemy.hero} name="名实 (敌方)" isPlayer={false} onClick={handleEnemyHeroClick} />
      </div>
      <div className="absolute bottom-48 left-8 w-64 z-20">
        <HeroProfile hero={battle.player.hero} name="玩家 A" isPlayer={true} onClick={heroAttack} />
      </div>

      {/* RIGHT AREA: Environment Info & Timer */}
      <div className="absolute top-24 right-8 w-72 z-20">
        <EnvironmentCard />
      </div>
      <div className="absolute bottom-48 right-16 z-20">
        <TurnTimer timeRemaining={battle.timeRemaining} turnStage={battle.turnStage} />
      </div>

      {/* Battle Log (Moved to bottom left corner) */}
      <div className="absolute bottom-4 left-8 z-20">
        <BattleLog logs={battle.gameLog} />
      </div>

      {/* CENTER TOP: Enemy Action Slots (Locks) */}
      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-[420px] flex justify-between z-20">
        <ActionSlot name="主论" type="mainPlay" isEnemy={true} />
        <ActionSlot name="应对" type="response" isEnemy={true} />
        <ActionSlot name="暗策" type="hidden" isEnemy={true} />
        <ActionSlot name="着书" type="writeBook" isEnemy={true} />
      </div>

      {/* CENTER MIDDLE: DOM Hitboxes for the Board */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
        {/* Enemy Board Hitboxes */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            {battle.enemy.board.back.map((unit: any, col: number) => (
              <BoardSlot key={`eb-${col}`} onClick={() => unit && handleEnemyUnitClick(unit)} />
            ))}
          </div>
          <div className="flex gap-2">
            {battle.enemy.board.front.map((unit: any, col: number) => (
              <BoardSlot key={`ef-${col}`} onClick={() => unit && handleEnemyUnitClick(unit)} />
            ))}
          </div>
        </div>

        {/* divider line -> 32px height to match Pixi offset (16px spacing top/bottom) */}
        <div className="h-8 w-[304px] flex justify-between items-center px-6 font-bold text-[#8c7b65] border-y border-[#b5a68b] my-4 shadow-sm relative bg-[#dcd0bf]/30">
          <span className="text-sm">主议</span>
          <span className="text-sm">旁议</span>
        </div>

        {/* Player Board Hitboxes */}
        <div ref={boardRef} className="flex flex-col gap-2">
          <div className="flex gap-2">
            {battle.player.board.front.map((_: any, col: number) => (
              <BoardSlot
                key={`pf-${col}`}
                isTarget={dropTarget?.type === 'board' && dropTarget?.row === 'front' && dropTarget?.col === col}
                onClick={() => handleBoardPositionClick('front', col)}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {battle.player.board.back.map((_: any, col: number) => (
              <BoardSlot
                key={`pb-${col}`}
                isTarget={dropTarget?.type === 'board' && dropTarget?.row === 'back' && dropTarget?.col === col}
                onClick={() => handleBoardPositionClick('back', col)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CENTER BOTTOM: Player Action Slots */}
      <div className="absolute bottom-40 left-1/2 transform -translate-x-1/2 flex gap-4 w-[420px] justify-between z-20">
        <ActionSlot name="主论" card={battle.player.actionSlots.mainPlay} innerRef={(el: any) => actionSlotRefs.current['mainPlay'] = el} isTarget={dropTarget?.type === 'slot' && dropTarget.name === 'mainPlay'} />
        <ActionSlot name="应对" card={battle.player.actionSlots.response} innerRef={(el: any) => actionSlotRefs.current['response'] = el} isTarget={dropTarget?.type === 'slot' && dropTarget.name === 'response'} />
        <ActionSlot name="暗策" card={battle.player.actionSlots.hidden} innerRef={(el: any) => actionSlotRefs.current['hidden'] = el} isTarget={dropTarget?.type === 'slot' && dropTarget.name === 'hidden'} />
        <ActionSlot name="着书" card={battle.player.actionSlots.writeBook} innerRef={(el: any) => actionSlotRefs.current['writeBook'] = el} isTarget={dropTarget?.type === 'slot' && dropTarget.name === 'writeBook'} />
      </div>

      {/* BOTTOM: Hand Cards */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30">
        <div className="flex items-end gap-2">
          {battle.player.hand.map((card: Card, index: number) => (
            <motion.div
              key={card.id}
              initial={{ y: 100, opacity: 0 }}
              animate={{
                y: battle.selectedCard?.id === card.id ? -20 : 0,
                opacity: 1,
                scale: draggingCard?.id === card.id ? 1.1 : 1,
              }}
              transition={{ delay: index * 0.05 }}
              className={`cursor-pointer transition-all ${card.cost > battle.player.hero.mana ? 'opacity-50' : ''
                } ${draggingCard?.id === card.id ? 'z-50' : ''}`}
              onMouseDown={(e) => handleDragStart(card, e)}
              onTouchStart={(e) => handleDragStart(card, e)}
              onMouseEnter={() => setHoveredCard(card)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <CompactCard card={card} isDragging={draggingCard?.id === card.id} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* 拖拽中的卡牌 */}
      {draggingCard && (
        <motion.div
          className="fixed pointer-events-none z-50"
          style={{
            left: dragPosition.x - 40,
            top: dragPosition.y - 56,
          }}
          initial={{ scale: 1 }}
          animate={{ scale: 1.2 }}
        >
          <CompactCard card={draggingCard} isDragging={true} />
        </motion.div>
      )}

      {/* 结束回合按钮 (TODO: 替换为动画自动切换) */}
      {battle.phase === 'player-turn' && (
        <button
          onClick={endTurn}
          className="absolute right-8 top-1/2 transform -translate-y-1/2 bg-[#8c7b65] hover:bg-[#7a6a55] text-white font-bold py-4 px-6 rounded-lg shadow-lg border-2 border-[#b5a68b] transition-all z-40"
        >
          结束排兵
        </button>
      )}

      {/* 游戏结束界面 */}
      {battle.winner && (
        <GameOverOverlay
          winner={battle.winner}
          gold={0}
          onRestart={restart}
          onExit={onExit}
        />
      )}

      {/* 卡牌详情悬浮窗 */}
      {hoveredCard && !draggingCard && (
        <CardDetailTooltip card={hoveredCard} />
      )}
    </div>
  );
}

// ==================== 子组件 ====================

function BattleTopBar({ turn, phase, turnStage, onExit }: any) {
  return (
    <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between px-8 z-40">
      <div className="flex items-center gap-4">
        <span className="text-[#dcd0bf] font-bold text-xl">第 {turn} 局</span>
        <span className={`px-3 py-1 rounded-full text-sm font-bold ${phase === 'player-turn' ? 'bg-[#5a6b5d] text-white' : 'bg-[#7a4b4b] text-white'}`}>
          {phase === 'player-turn' ? '你的回合' : '敌方回合'}
        </span>
        <div className="text-[#a53c27]">
          {turnStage === 'open' && '明辩阶段 (公开)'}
          {turnStage === 'hidden' && '暗谋阶段 (隐藏)'}
          {turnStage === 'reveal' && '揭示阶段'}
          {turnStage === 'resolve' && '结算阶段'}
        </div>
      </div>
      <button onClick={onExit} className="text-[#b5a68b] hover:text-white transition-colors">退出</button>
    </div>
  );
}

function EnvironmentCard() {
  return (
    <div className="bg-[#ece6d9] border-2 border-[#b5a68b] p-4 flex flex-col shadow-md rounded-sm">
      <h3 className="text-lg font-bold text-center border-b border-[#b5a68b] pb-2 mb-2 text-[#3e342b]">稷下学宫</h3>
      <ul className="text-xs space-y-2 text-[#5a4f40] leading-tight mt-2">
        <li><strong className="text-black">公议初启：</strong>开局获得1护印</li>
        <li><strong className="text-black">立言有据：</strong>打出立论获1证立</li>
        <li><strong className="text-black">公议(论场技)：</strong>反诘减费</li>
      </ul>
    </div>
  );
}

function HeroProfile({ hero, name, onClick }: any) {
  return (
    <div className="bg-[#ece6d9] border-2 border-[#b5a68b] p-4 flex flex-col relative shadow-md rounded-sm cursor-pointer" onClick={onClick}>
      {/* Avatar */}
      <div className="w-24 h-24 rounded-full border-4 border-[#b5a68b] overflow-hidden mb-4 mx-auto bg-gray-300 relative">
        <img src={`https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${name}&backgroundColor=dcd0bf`} alt="Hero" className="w-full h-full object-cover" />
      </div>

      <h2 className="text-center text-xl font-bold mb-4 text-[#3e342b]">{name}</h2>

      <div className="flex justify-around items-center bg-[#dcd0bf]/50 p-2 rounded border border-[#b5a68b]/50">
        <div className="flex flex-col items-center gap-1" title="心证 (生命)">
          <span className="text-lg">❤️</span><span className="font-bold text-red-700">{hero.hp}</span>
        </div>
        <div className="flex flex-col items-center gap-1" title="护印 (护盾)">
          <span className="text-lg">🛡️</span><span className="font-bold text-gray-700">{hero.armor}</span>
        </div>
        <div className="flex flex-col items-center gap-1" title="灵势 (费用)">
          <span className="text-lg">🔵</span><span className="font-bold text-blue-700">{hero.mana}/{hero.maxMana}</span>
        </div>
        <div className="flex flex-col items-center gap-1" title="文脉 (成长)">
          <span className="text-lg">📜</span><span className="font-bold text-yellow-700">{hero.ramp}</span>
        </div>
        {hero.disorder > 0 && (
          <div className="flex flex-col items-center gap-1" title="失序 (负面)">
            <span className="text-lg">⚠️</span><span className="font-bold text-purple-700">{hero.disorder}</span>
          </div>
        )}
        {hero.proof > 0 && (
          <div className="flex flex-col items-center gap-1" title="证立 (反诘辅助)">
            <span className="text-lg">⚖️</span><span className="font-bold text-green-700">{hero.proof}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ActionSlot({ name, card, isEnemy, innerRef, isTarget }: any) {
  return (
    <div ref={innerRef} className={`relative w-24 h-32 border-2 ${isTarget ? 'border-yellow-400 bg-yellow-400/20 shadow-[0_0_15px_rgba(250,204,21,0.5)]' : 'border-[#b5a68b] bg-[#dcd0bf]/40'} border-dashed rounded flex flex-col items-center justify-center transition-all`}>
      {isEnemy ? (
        <span className="text-2xl opacity-50">🔒</span>
      ) : card ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <CompactCard card={card} isDragging={false} />
        </div>
      ) : (
        <span className="text-lg font-bold text-[#8c7b65] opacity-60 pointer-events-none select-none">{name}</span>
      )}
    </div>
  );
}

function BoardSlot({ isTarget, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className={`w-24 h-32 cursor-pointer z-20 ${isTarget ? 'border-2 border-yellow-400 bg-yellow-400/20' : ''}`}
    />
  );
}

function TurnTimer({ timeRemaining, turnStage }: any) {
  // SVG Timer Circle (like the UI Blueprint)
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = (timeRemaining / 20) * circumference;

  return (
    <div className="relative w-32 h-32 flex items-center justify-center bg-[#ece6d9] rounded-full border-4 border-[#b5a68b] shadow-md">
      <svg className="absolute inset-0 w-full h-full transform -rotate-90">
        <circle cx="60" cy="60" r="40" className="stroke-[#dcd0bf] fill-none" strokeWidth="6" />
        <circle
          cx="60" cy="60" r="40"
          className={`fill-none transition-all duration-1000 ${turnStage === 'open' ? 'stroke-[#8c7b65]' : 'stroke-purple-800'}`}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
        />
      </svg>
      <div className="text-center font-bold text-[#3e342b] z-10 flex flex-col items-center mt-2">
        <span className="text-4xl leading-none">{timeRemaining}</span>
        <span className="text-xs">秒</span>
      </div>
    </div>
  );
}

function CompactCard({ card, isDragging = false }: { card: Card; isDragging?: boolean }) {
  return (
    <div className={`relative w-20 h-28 bg-[#ece6d9] rounded-sm border-2 p-1 transition-all ${isDragging ? 'border-yellow-600 shadow-2xl scale-110' : 'border-[#b5a68b] shadow-sm'}`}>
      <div className="absolute -top-3 -left-3 w-8 h-8 bg-[#8c7b65] rounded-full flex items-center justify-center text-[#ece6d9] text-sm font-bold border-2 border-[#b5a68b] shadow-md z-10">
        {card.cost}
      </div>

      <div className="text-[#3e342b] text-xs font-bold text-center mt-3 h-8 break-words overflow-hidden leading-tight pb-1 border-b border-[#b5a68b]/30">
        {card.name}
      </div>

      <div className="text-[9px] text-[#5a4f40] mt-1 p-1 bg-[#dcd0bf]/40 h-[46px] overflow-hidden leading-tight">
        {card.skillDesc}
      </div>

      <div className="absolute bottom-1 right-1 text-xs opacity-50">
        {card.type === 'character' && '👤'}
        {(card.type === 'skill' || card.type === 'event') && '✨'}
        {card.type === 'gear' && '⚔️'}
      </div>
    </div>
  );
}

function BattleLog({ logs }: { logs: string[] }) {
  return (
    <div className="w-56 h-40 overflow-hidden bg-[#ece6d9]/90 border-2 border-[#b5a68b] rounded-sm shadow-md flex flex-col pointer-events-auto">
      <div className="bg-[#b5a68b] text-[#ece6d9] text-xs font-bold py-1 px-2 text-center shadow-sm">
        对局纪要
      </div>
      <div className="space-y-1 overflow-y-auto p-2 flex-1">
        {logs.slice(0, 10).map((log, index) => (
          <div key={index} className="text-[#5a4f40] text-xs pb-1 border-b border-[#b5a68b]/20 last:border-0 leading-tight">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}

function CardDetailTooltip({ card }: { card: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-40 left-1/2 transform -translate-x-1/2 bg-[#ece6d9] border-2 border-[#b5a68b] shadow-xl p-4 w-72 z-50 rounded-sm pointer-events-none"
    >
      <h3 className="text-[#3e342b] font-bold text-lg mb-2 border-b border-[#b5a68b] pb-1">{card.name}</h3>
      <p className="text-[#5a4f40] text-sm leading-relaxed">{card.skillDesc}</p>
      {card.type === 'character' && (
        <div className="flex gap-4 mt-3 text-sm font-bold">
          <span className="text-red-700">⚔️ {card.atk}</span>
          <span className="text-green-700">❤️ {card.hp}</span>
        </div>
      )}
    </motion.div>
  );
}

function GameOverOverlay({ winner, onRestart, onExit }: any) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm"
    >
      <div className="bg-[#ece6d9] border-4 border-[#b5a68b] rounded-sm p-8 text-center shadow-2xl max-w-sm w-full">
        <h2 className={`text-4xl font-bold mb-6 ${winner === 'player' ? 'text-[#8c7b65]' : 'text-red-800'}`}>
          {winner === 'player' ? '游说成功' : '论辩落败'}
        </h2>
        <div className="space-x-4">
          <button
            onClick={onRestart}
            className="bg-[#8c7b65] hover:bg-[#7a6a55] text-white font-bold py-3 px-6 rounded-sm transition-colors border-2 border-[#5a4f40]"
          >
            再论一局
          </button>
          <button
            onClick={onExit}
            className="bg-transparent hover:bg-black/5 text-[#5a4f40] font-bold py-3 px-6 rounded-sm transition-colors border-2 border-[#b5a68b]"
          >
            全身而退
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default EnhancedCardBattleView;
