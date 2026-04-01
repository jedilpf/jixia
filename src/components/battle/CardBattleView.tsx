// CardBattleView.tsx - 卡牌战斗视图组件
// 将卡牌战斗系统与UI紧密结合

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CharacterCard, GearCard } from '@/types';
import { useCardBattleSystem, BattleUnit } from './CardBattleSystem';

// ==================== 主组件 ====================

interface CardBattleViewProps {
  onExit: () => void;
}

export function CardBattleView({ onExit }: CardBattleViewProps) {
  const {
    battle,
    selectCard,
    selectUnit,
    playCard,
    unitAttack,
    heroAttack,
    endTurn,
    restart,
  } = useCardBattleSystem();

  const [hoveredCard, setHoveredCard] = useState<Card | null>(null);

  const handleCardClick = (card: Card) => {
    if (battle.phase !== 'player-turn') return;
    selectCard(card);
  };

  const handleBoardPositionClick = (row: 'front' | 'back', col: number) => {
    if (battle.phase !== 'player-turn') return;

    const unit = battle.player.board[row][col];

    if (battle.selectedCard) {
      if (battle.selectedCard.type === 'character') {
        playCard(battle.selectedCard, { row, col });
        selectCard(null);
      }
      return;
    }

    if (unit) {
      selectUnit(unit);
    }
  };

  const handleEnemyUnitClick = (unit: BattleUnit) => {
    if (battle.phase !== 'player-turn') return;

    if (battle.selectedUnit) {
      unitAttack(battle.selectedUnit, unit);
      selectUnit(null);
    }
  };

  const handleEnemyHeroClick = () => {
    if (battle.phase !== 'player-turn') return;

    if (battle.selectedUnit) {
      unitAttack(battle.selectedUnit, 'hero');
      selectUnit(null);
    }
  };

  const handleHeroAttack = () => {
    heroAttack();
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-3xl" />
      </div>

      {/* 顶部信息栏 */}
      <BattleTopBar turn={battle.turn} phase={battle.phase} onExit={onExit} />

      {/* 敌方区域 */}
      <div className="absolute top-20 left-0 right-0 flex justify-center">
        <div className="flex items-center gap-8">
          {/* 敌方英雄 */}
          <div onClick={handleEnemyHeroClick} className="cursor-pointer">
            <HeroPortrait
              hero={battle.enemy.hero}
              isPlayer={false}
              isTargetable={battle.selectedUnit !== null}
            />
          </div>

          {/* 敌方战场 */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              {battle.enemy.board.back.map((unit, col) => (
                <BoardSlot
                  key={`enemy-back-${col}`}
                  unit={unit}
                  isEnemy={true}
                  onClick={() => unit && handleEnemyUnitClick(unit)}
                />
              ))}
            </div>
            <div className="flex gap-2">
              {battle.enemy.board.front.map((unit, col) => (
                <BoardSlot
                  key={`enemy-front-${col}`}
                  unit={unit}
                  isEnemy={true}
                  onClick={() => unit && handleEnemyUnitClick(unit)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 中央战斗日志 */}
      <BattleLog logs={battle.gameLog} />

      {/* 玩家区域 */}
      <div className="absolute bottom-40 left-0 right-0 flex justify-center">
        <div className="flex items-center gap-8">
          {/* 玩家战场 */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              {battle.player.board.front.map((unit, col) => (
                <BoardSlot
                  key={`player-front-${col}`}
                  unit={unit}
                  isEnemy={false}
                  isSelected={battle.selectedUnit?.id === unit?.id}
                  onClick={() => handleBoardPositionClick('front', col)}
                />
              ))}
            </div>
            <div className="flex gap-2">
              {battle.player.board.back.map((unit, col) => (
                <BoardSlot
                  key={`player-back-${col}`}
                  unit={unit}
                  isEnemy={false}
                  isSelected={battle.selectedUnit?.id === unit?.id}
                  onClick={() => handleBoardPositionClick('back', col)}
                />
              ))}
            </div>
          </div>

          {/* 玩家英雄 */}
          <div onClick={handleHeroAttack} className="cursor-pointer">
            <HeroPortrait
              hero={battle.player.hero}
              isPlayer={true}
              canAttack={battle.player.hero.weapon !== null && !battle.player.hero.hasAttacked}
            />
          </div>
        </div>
      </div>

      {/* 手牌区域 */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="flex items-end gap-2">
          {battle.player.hand.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`cursor-pointer transition-transform ${
                battle.selectedCard?.id === card.id ? 'transform -translate-y-8' : ''
              } ${card.cost > battle.player.hero.mana ? 'opacity-50' : ''}`}
              onClick={() => handleCardClick(card)}
              onMouseEnter={() => setHoveredCard(card)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <CompactCard card={card} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* 结束回合按钮 */}
      {battle.phase === 'player-turn' && (
        <button
          onClick={endTurn}
          className="absolute right-8 top-1/2 transform -translate-y-1/2 bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-all"
        >
          结束回合
        </button>
      )}

      {/* 游戏结束界面 */}
      {battle.winner && (
        <GameOverOverlay winner={battle.winner} onRestart={restart} onExit={onExit} />
      )}

      {/* 卡牌详情悬浮窗 */}
      {hoveredCard && (
        <CardDetailTooltip card={hoveredCard} />
      )}
    </div>
  );
}

// ==================== 子组件 ====================

function BattleTopBar({ turn, phase, onExit }: { turn: number; phase: string; onExit: () => void }) {
  return (
    <div className="absolute top-0 left-0 right-0 h-16 bg-black/60 backdrop-blur-md flex items-center justify-between px-8">
      <div className="flex items-center gap-4">
        <span className="text-yellow-400 font-bold text-xl">回合 {turn}</span>
        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
          phase === 'player-turn' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {phase === 'player-turn' ? '你的回合' : '敌方回合'}
        </span>
      </div>
      <button
        onClick={onExit}
        className="text-gray-400 hover:text-white transition-colors"
      >
        退出战斗
      </button>
    </div>
  );
}

function HeroPortrait({ 
  hero, 
  isPlayer, 
  canAttack = false,
  isTargetable = false 
}: { 
  hero: { hp: number; maxHp: number; armor: number; mana: number; maxMana: number; weapon: any };
  isPlayer: boolean;
  canAttack?: boolean;
  isTargetable?: boolean;
}) {
  return (
    <motion.div
      className={`relative w-32 h-40 rounded-xl border-4 ${
        isPlayer 
          ? 'bg-gradient-to-b from-blue-600 to-blue-800 border-blue-400' 
          : 'bg-gradient-to-b from-red-600 to-red-800 border-red-400'
      } ${canAttack ? 'ring-4 ring-yellow-400 animate-pulse' : ''} ${isTargetable ? 'ring-4 ring-red-400' : ''}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* 英雄图标 */}
      <div className="absolute inset-0 flex items-center justify-center text-6xl">
        {isPlayer ? '🧙‍♂️' : '👹'}
      </div>

      {/* 血量 */}
      <div className="absolute bottom-2 left-2 right-2">
        <div className="bg-gray-800 rounded-full h-4 overflow-hidden">
          <div 
            className={`h-full ${hero.hp > 15 ? 'bg-green-500' : hero.hp > 8 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${(hero.hp / hero.maxHp) * 100}%` }}
          />
        </div>
        <div className="text-center text-white text-sm font-bold mt-1">
          {hero.hp}/{hero.maxHp} HP
        </div>
      </div>

      {/* 法力（仅玩家） */}
      {isPlayer && (
        <div className="absolute top-2 right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
          {hero.mana}/{hero.maxMana}
        </div>
      )}

      {/* 护甲 */}
      {hero.armor > 0 && (
        <div className="absolute top-2 left-2 w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white font-bold">
          {hero.armor}
        </div>
      )}

      {/* 武器 */}
      {hero.weapon && (
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-yellow-600 text-white text-xs px-2 py-1 rounded-full">
          ⚔️ {hero.weapon.atk}
        </div>
      )}
    </motion.div>
  );
}

function BoardSlot({ 
  unit, 
  isEnemy, 
  isSelected = false,
  onClick 
}: { 
  unit: BattleUnit | null; 
  isEnemy: boolean;
  isSelected?: boolean;
  onClick: () => void;
}) {
  if (!unit) {
    return (
      <div 
        onClick={onClick}
        className="w-24 h-32 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
      />
    );
  }

  return (
    <motion.div
      onClick={onClick}
      className={`relative w-24 h-32 rounded-lg border-2 cursor-pointer ${
        isEnemy 
          ? 'bg-gradient-to-b from-red-700 to-red-900 border-red-500' 
          : 'bg-gradient-to-b from-blue-700 to-blue-900 border-blue-500'
      } ${isSelected ? 'ring-4 ring-yellow-400' : ''} ${unit.hasAttacked ? 'opacity-70' : ''}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* 单位名称 */}
      <div className="absolute top-1 left-1 right-1 text-center text-white text-xs font-bold truncate">
        {unit.name}
      </div>

      {/* 攻击力 */}
      <div className="absolute bottom-1 left-1 w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold">
        {unit.atk}
      </div>

      {/* 生命值 */}
      <div className={`absolute bottom-1 right-1 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
        unit.hp < unit.maxHp / 2 ? 'bg-red-600' : 'bg-green-600'
      }`}>
        {unit.hp}
      </div>

      {/* 状态指示 */}
      {unit.hasAttacked && (
        <div className="absolute top-1 right-1 text-xs text-gray-400">已攻击</div>
      )}
      {unit.isExhausted && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <span className="text-white text-xs">疲劳</span>
        </div>
      )}
    </motion.div>
  );
}

function CompactCard({ card }: { card: Card }) {
  return (
    <div className="w-20 h-28 bg-gradient-to-b from-gray-700 to-gray-900 rounded-lg border-2 border-gray-500 p-1">
      {/* 费用 */}
      <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
        {card.cost}
      </div>

      {/* 名称 */}
      <div className="text-white text-xs font-bold text-center truncate mt-4">
        {card.name}
      </div>

      {/* 类型图标 */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-2xl">
        {card.type === 'character' && '👤'}
        {(card.type === 'skill' || card.type === 'event') && '✨'}
        {card.type === 'gear' && '⚔️'}
      </div>
    </div>
  );
}

function BattleLog({ logs }: { logs: string[] }) {
  return (
    <div className="absolute top-1/2 left-8 transform -translate-y-1/2 w-64 max-h-64 overflow-hidden">
      <div className="bg-black/60 backdrop-blur-md rounded-lg p-4">
        <h3 className="text-yellow-400 font-bold mb-2">战斗日志</h3>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {logs.slice(0, 10).map((log, index) => (
            <div key={index} className="text-gray-300 text-sm">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CardDetailTooltip({ card }: { card: Card }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-48 left-1/2 transform -translate-x-1/2 bg-gray-800 border-2 border-yellow-500 rounded-lg p-4 w-64 z-50"
    >
      <h3 className="text-yellow-400 font-bold text-lg mb-2">{card.name}</h3>
      <div className="text-gray-300 text-sm mb-2">
        {card.type === 'character' && (
          <>
            <p>攻击: {(card as CharacterCard).atk}</p>
            <p>生命: {(card as CharacterCard).hp}</p>
          </>
        )}
        {card.type === 'gear' && (
          <p>攻击: {(card as GearCard).atk}</p>
        )}
      </div>
      <p className="text-gray-400 text-sm">{card.skillDesc}</p>
    </motion.div>
  );
}

function GameOverOverlay({ 
  winner, 
  onRestart, 
  onExit 
}: { 
  winner: 'player' | 'enemy';
  onRestart: () => void;
  onExit: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-black/80 flex items-center justify-center z-50"
    >
      <div className="bg-gray-800 border-4 border-yellow-500 rounded-2xl p-8 text-center">
        <h2 className={`text-4xl font-bold mb-4 ${winner === 'player' ? 'text-green-400' : 'text-red-400'}`}>
          {winner === 'player' ? '🎉 胜利！' : '💀 失败'}
        </h2>
        <div className="space-x-4">
          <button
            onClick={onRestart}
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg"
          >
            再来一局
          </button>
          <button
            onClick={onExit}
            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg"
          >
            返回菜单
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default CardBattleView;
