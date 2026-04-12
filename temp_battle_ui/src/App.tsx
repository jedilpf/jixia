/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Flag, FileText, Cog, Shield, Zap, Sword, Info, ChevronLeft, Play } from 'lucide-react';

// --- Types ---
interface ArenaData {
  id: string;
  name: string;
  description: string;
  passive: string;
  bias: string;
  skill: string;
  tag?: string;
  color: string;
  border: string;
  bg: string;
  glow: string;
}

interface CardData {
  id: number;
  name: string;
  cost: number;
  power: number;
  description: string;
  type: 'attack' | 'defense' | 'strategy';
}

// --- Mock Data ---
const ARENAS: ArenaData[] = [
  {
    id: 'jixia',
    name: '稷下学宫',
    description: '标准环境，适合新手',
    passive: '被动：公议初启：双方开局获得 1 护印',
    bias: '偏向：立言有据：首次立论且未着书时，获得 1 立立',
    skill: '技能：公议（一次）：第一张反诘费用 -1（待实装按钮）',
    color: 'text-jixia-gold',
    border: 'border-jixia-gold',
    bg: 'bg-jixia-gold',
    glow: 'rgba(212, 160, 23, 0.5)'
  },
  {
    id: 'huode',
    name: '火德论坛',
    description: '进攻环境，强调打穿一路',
    passive: '被动：烈辩先声：前席争鸣辩锋 +1',
    bias: '偏向：穿席余烬：击破前席且有溢出时，额外造成 1 心证伤害',
    skill: '技能：焚势（一次）：指定一路本回合不能被护印完全吸收（待实装按钮）',
    color: 'text-jixia-orange',
    border: 'border-jixia-orange',
    bg: 'bg-jixia-orange',
    glow: 'rgba(255, 102, 0, 0.5)'
  },
  {
    id: 'cangshu',
    name: '藏书秘阁',
    description: '着书成长，后期兑现',
    passive: '被动：秘阁藏卷：首次着书额外获得 1 护印',
    bias: '偏向：文脉深藏：第 2 次着书起，每次着书回复 1 心证',
    skill: '技能：校书（一次）：立即着书，再抽 1 弃 1（待实装按钮）',
    color: 'text-jixia-jade',
    border: 'border-jixia-jade',
    bg: 'bg-jixia-jade',
    glow: 'rgba(74, 222, 128, 0.5)'
  },
  {
    id: 'xuanji',
    name: '玄机观星台',
    description: '信息差与暗策环境',
    passive: '被动：星轨照影：暗策锁定后可见对手暗策牌类',
    bias: '偏向：天机偏衡：每回合首次打出暗策时，获得 1 护印',
    skill: '技能：窥衡（一次）：查看对手本回合暗策并强化反诘（待实装按钮）',
    tag: '已选择',
    color: 'text-jixia-star',
    border: 'border-jixia-star',
    bg: 'bg-jixia-star',
    glow: 'rgba(77, 171, 255, 0.5)'
  }
];

const INITIAL_HAND: CardData[] = [
  { id: 1, name: '墨守成规', cost: 2, power: 5, description: '获得5点护甲，并反弹1点伤害。', type: 'defense' },
  { id: 2, name: '兼爱非攻', cost: 3, power: 0, description: '本回合双方无法造成伤害。', type: 'strategy' },
  { id: 3, name: '机关连弩', cost: 4, power: 8, description: '造成8点伤害，若击破护甲则再抽一张牌。', type: 'attack' },
  { id: 4, name: '非命论', cost: 1, power: 3, description: '对敌方造成3点伤害，并降低其1点能量。', type: 'attack' },
  { id: 5, name: '尚贤之道', cost: 2, power: 0, description: '下回合开始时多抽两张牌。', type: 'strategy' },
];

// --- Sub-components ---

const Ember = ({ style }: { style: React.CSSProperties, key?: React.Key }) => (
  <motion.div
    className="absolute w-1 h-1 bg-jixia-orange rounded-full blur-[1px]"
    style={style}
    animate={{
      y: [0, -100],
      x: [0, Math.random() * 40 - 20],
      opacity: [0, 0.8, 0],
      scale: [1, 1.5, 0.5],
    }}
    transition={{
      duration: 2 + Math.random() * 2,
      repeat: Infinity,
      ease: "easeOut",
    }}
  />
);

const GearDecoration = ({ className, size = 100 }: { className?: string, size?: number }) => (
  <motion.div
    className={`text-jixia-bronze opacity-20 pointer-events-none ${className}`}
    animate={{ rotate: 360 }}
    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
  >
    <Cog size={size} />
  </motion.div>
);

const Flame = ({ style }: { style: React.CSSProperties, key?: React.Key }) => (
  <motion.div
    className="bottom-flame"
    style={{ ...style, transformOrigin: "bottom center", x: "-50%" }}
    animate={{
      y: [0, -20, -10, 0],
      x: ["-50%", "-45%", "-55%", "-50%"],
      scaleX: [1, 1.8, 2.2, 1.5, 1],
      scaleY: [1, 1.2, 1.1, 1.3, 1],
      opacity: [0.2, 0.4, 0.3, 0.4, 0.2],
      filter: ["blur(25px)", "blur(30px)", "blur(25px)"],
    }}
    transition={{
      duration: 4 + Math.random() * 2,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

const BattleCard = ({ card, isSelected, onClick }: { card: CardData, isSelected: boolean, onClick: () => void, key?: React.Key }) => {
  return (
    <motion.div
      layout
      whileHover={{ scale: 1.05, y: -20 }}
      whileTap={{ scale: 0.95 }}
      animate={isSelected ? {
        y: [-40, -50, -40],
        scale: [1, 1.02, 1],
        boxShadow: [
          "0 0 20px rgba(212, 160, 23, 0.5)",
          "0 0 40px rgba(212, 160, 23, 0.9)",
          "0 0 20px rgba(212, 160, 23, 0.5)"
        ]
      } : { y: 0, scale: 1, boxShadow: "none" }}
      transition={isSelected ? {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      } : { duration: 0.3 }}
      onClick={onClick}
      className={`relative w-40 h-60 cursor-pointer rounded-lg overflow-hidden bronze-border transition-all duration-300 ${
        isSelected ? 'fancy-cloud-border ring-2 ring-jixia-gold/50' : ''
      }`}
    >
      <div className="absolute inset-0 bamboo-slip opacity-90" />
      <div className="absolute inset-0 taotie-pattern pointer-events-none" />
      <div className="relative h-full flex flex-col p-3 text-jixia-ink">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-bold px-1.5 py-0.5 bg-jixia-red text-jixia-bamboo rounded shadow-sm">
            {card.cost}
          </span>
          <div className="text-jixia-red">
            {card.type === 'attack' && <Sword size={16} />}
            {card.type === 'defense' && <Shield size={16} />}
            {card.type === 'strategy' && <Info size={16} />}
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <h3 className="text-lg font-bold mb-1 border-b border-jixia-red/30 w-full pb-1 font-serif">
            {card.name}
          </h3>
          <p className="text-[10px] leading-tight opacity-90 mt-2 font-serif font-medium">
            {card.description}
          </p>
        </div>
        <div className="mt-auto flex justify-center">
          <div className="w-8 h-8 rounded-full bg-jixia-red flex items-center justify-center text-jixia-bamboo font-bold text-sm shadow-inner">
            {card.power}
          </div>
        </div>
      </div>
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-jixia-gold" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-jixia-gold" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-jixia-gold" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-jixia-gold" />
    </motion.div>
  );
};

const CurtainOverlay = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <div className="absolute inset-0 flex justify-between">
        {/* Left Curtain */}
        <motion.div 
          animate={{ 
            x: [0, 1, -1, 0.5, -0.5, 0],
            rotate: [0, 0.1, -0.1, 0.05, -0.05, 0]
          }}
          transition={{ 
            duration: 0.5, 
            repeat: Infinity, 
            repeatType: "mirror",
            ease: "linear"
          }}
          className="relative w-[12%] h-full bg-gradient-to-r from-jixia-red via-jixia-red to-jixia-gold silk-texture"
          style={{ 
            clipPath: 'path("M 0 0 C 180 0 60 540 180 1080 L 0 1080 Z")',
            boxShadow: 'inset -15px 0 40px rgba(0,0,0,0.7), 10px 0 20px rgba(212, 160, 23, 0.2)'
          }}
        >
          <div className="absolute inset-0 curtain-fold opacity-40 mix-blend-overlay" />
          <div className="absolute inset-0 taotie-pattern opacity-20 mix-blend-multiply" />
          {/* Gold Embroidery Edge */}
          <div className="absolute inset-y-0 right-0 w-3 bg-gradient-to-b from-jixia-gold via-jixia-bronze to-jixia-gold shadow-[0_0_15px_rgba(212,160,23,0.5)]" />
          <div className="absolute inset-y-0 right-3 w-px bg-jixia-gold/30" />
        </motion.div>

        {/* Right Curtain */}
        <motion.div 
          animate={{ 
            x: [0, -1, 1, -0.5, 0.5, 0],
            rotate: [0, -0.1, 0.1, -0.05, 0.05, 0]
          }}
          transition={{ 
            duration: 0.5, 
            repeat: Infinity, 
            repeatType: "mirror",
            ease: "linear"
          }}
          className="relative w-[12%] h-full bg-gradient-to-l from-jixia-red via-jixia-red to-jixia-gold silk-texture"
          style={{ 
            clipPath: 'path("M 220 0 C 40 0 160 540 40 1080 L 220 1080 Z")',
            boxShadow: 'inset 15px 0 40px rgba(0,0,0,0.7), -10px 0 20px rgba(212, 160, 23, 0.2)'
          }}
        >
          <div className="absolute inset-0 curtain-fold opacity-40 mix-blend-overlay" />
          <div className="absolute inset-0 taotie-pattern opacity-20 mix-blend-multiply" />
          {/* Gold Embroidery Edge */}
          <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-b from-jixia-gold via-jixia-bronze to-jixia-gold shadow-[0_0_15px_rgba(212,160,23,0.5)]" />
          <div className="absolute inset-y-0 left-3 w-px bg-jixia-gold/30" />
        </motion.div>
      </div>

      {/* Bronze Hooks/Tassels at the "pinch" point */}
      <motion.div 
        animate={{ 
          scale: [1, 1.02, 1],
          y: ["-50%", "-49%", "-50%"],
          rotate: [0, 1, -1, 0]
        }}
        transition={{ duration: 0.3, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 left-[7%] -translate-y-1/2 w-14 h-14 rounded-full bronze-border bg-gradient-to-br from-jixia-bronze to-jixia-black flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.8)] z-[101]"
      >
        <div className="w-10 h-10 rounded-full border-2 border-jixia-gold/50 flex items-center justify-center bg-black/20">
          <Cog size={24} className="text-jixia-gold animate-spin-slow" />
        </div>
        {/* Gold Tassel */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-16 bg-gradient-to-b from-jixia-gold via-jixia-red to-transparent opacity-80 rounded-full blur-[1px]" />
      </motion.div>

      <motion.div 
        animate={{ 
          scale: [1, 1.02, 1],
          y: ["-50%", "-49%", "-50%"],
          rotate: [0, -1, 1, 0]
        }}
        transition={{ duration: 0.3, repeat: Infinity, ease: "linear", delay: 0.1 }}
        className="absolute top-1/2 right-[7%] -translate-y-1/2 w-14 h-14 rounded-full bronze-border bg-gradient-to-br from-jixia-bronze to-jixia-black flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.8)] z-[101]"
      >
        <div className="w-10 h-10 rounded-full border-2 border-jixia-gold/50 flex items-center justify-center bg-black/20">
          <Cog size={24} className="text-jixia-gold animate-spin-slow" />
        </div>
        {/* Gold Tassel */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-16 bg-gradient-to-b from-jixia-gold via-jixia-red to-transparent opacity-80 rounded-full blur-[1px]" />
      </motion.div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [gameState, setGameState] = useState<'selection' | 'battle'>('selection');
  const [selectedArenaId, setSelectedArenaId] = useState<string>('xuanji');
  
  // Battle State
  const [hand, setHand] = useState<CardData[]>(INITIAL_HAND);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [mana, setMana] = useState(5);
  const [maxMana, setMaxMana] = useState(10);
  const [turn, setTurn] = useState(1);
  const [isEnemyTurn, setIsEnemyTurn] = useState(false);
  const [embers, setEmbers] = useState<{ id: number, style: React.CSSProperties }[]>([]);

  useEffect(() => {
    const newEmbers = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      style: {
        left: `${Math.random() * 100}%`,
        bottom: `${Math.random() * 20}%`,
        animationDelay: `${Math.random() * 2}s`,
      }
    }));
    setEmbers(newEmbers);
  }, []);

  const handleEndTurn = () => {
    if (isEnemyTurn) return;
    setIsEnemyTurn(true);
    setTimeout(() => {
      setIsEnemyTurn(false);
      setTurn(prev => prev + 1);
      setMana(prev => Math.min(maxMana, prev + 3));
    }, 2000);
  };

  const selectedArena = ARENAS.find(a => a.id === selectedArenaId);

  if (gameState === 'selection') {
    return (
      <div className="relative w-full h-screen bg-jixia-bg text-jixia-bamboo p-12 flex flex-col overflow-hidden silk-texture">
        <CurtainOverlay />
        {/* Background Patterns */}
        <div className="absolute inset-0 mural-overlay pointer-events-none" />
        <div className="absolute inset-0 taotie-pattern opacity-10 pointer-events-none" />
        <GearDecoration className="absolute -top-20 -left-20 gear-faded" size={300} />
        <GearDecoration className="absolute -bottom-20 -right-20 gear-faded" size={400} />

        <header className="flex justify-between items-start mb-12 relative z-10">
          <div className="flex items-center gap-4">
            <div className="seal-style text-lg">论场</div>
            <div>
              <h1 className="text-4xl font-bold text-jixia-gold mb-2 tracking-widest font-serif">选择论场</h1>
              <p className="text-jixia-bamboo/60 font-serif italic">不同论场有不同被动与机制偏向，开局前可自由切换。</p>
            </div>
          </div>
          <button className="royal-silk-button transition-all hover:scale-105 active:scale-95 font-serif">
            返回菜单
          </button>
        </header>

        <div className="grid grid-cols-2 gap-6 flex-1 max-w-6xl mx-auto w-full relative z-10">
          {ARENAS.map((arena) => (
            <motion.div
              key={arena.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedArenaId(arena.id)}
              className={`relative p-8 rounded-xl border-2 cursor-pointer transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                selectedArenaId === arena.id 
                ? `fancy-cloud-border ${arena.border} bg-black/40` 
                : 'border-jixia-bronze/20 bg-black/20 hover:border-jixia-bronze/40'
              }`}
              style={selectedArenaId === arena.id ? { boxShadow: `0 0 30px ${arena.glow}` } : {}}
            >
              <div className="absolute inset-0 bamboo-slip opacity-10 pointer-events-none" />
              <div className="absolute -right-4 -top-4 taotie-pattern w-32 h-32 opacity-20 rotate-12" />
              
              <div className="relative z-10">
                <h2 className={`text-2xl font-bold mb-4 font-serif ${arena.color}`}>{arena.name}</h2>
                <p className="text-sm text-jixia-bamboo/80 mb-6 font-serif">{arena.description}</p>
                
                <div className="space-y-2 text-sm font-serif">
                  <p className={`opacity-70 border-l-2 ${arena.border}/30 pl-3`}>{arena.passive}</p>
                  <p className={`opacity-70 border-l-2 ${arena.border}/30 pl-3`}>{arena.bias}</p>
                  <p className={`opacity-70 border-l-2 ${arena.border}/30 pl-3`}>{arena.skill}</p>
                </div>
              </div>

              {selectedArenaId === arena.id && (
                <div className={`absolute top-8 right-8 seal-style text-xs ${arena.bg} text-jixia-ink`}>
                  已选择
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <footer className="mt-12 flex justify-end relative z-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setGameState('battle')}
            className={`px-10 py-3 rounded-lg bronze-gradient ${selectedArena?.color} font-bold flex items-center gap-4 furnace-glow border-2 ${selectedArena?.border}/30`}
            style={{ boxShadow: `0 0 25px ${selectedArena?.glow}` }}
          >
            <div className={`seal-style text-sm ${selectedArena?.bg} text-jixia-ink border-jixia-ink`}>启</div>
            <span className="tracking-widest font-serif">开始对局</span>
            <Play size={20} fill="currentColor" />
          </motion.button>
        </footer>

        {/* Bottom Flames */}
        <div className="absolute bottom-0 left-0 w-full flex justify-around pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => (
            <Flame key={i} style={{ left: `${i * 3.3}%`, animationDelay: `${Math.random()}s` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-jixia-bg overflow-hidden flex flex-col font-serif silk-texture">
      <CurtainOverlay />
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 mural-overlay" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-black opacity-60" />
        <div className="absolute inset-0 taotie-pattern opacity-5" />
        <GearDecoration className="absolute -top-10 -left-10 gear-faded" size={200} />
        <GearDecoration className="absolute -bottom-10 -right-10 gear-faded" size={250} />
        <GearDecoration className="absolute top-1/2 -right-20 gear-faded" size={150} />
        
        {embers.map(ember => (
          <Ember key={ember.id} style={ember.style} />
        ))}
      </div>

      {/* Bottom Flames */}
      <div className="absolute bottom-0 left-0 w-full flex justify-around pointer-events-none z-0">
        {Array.from({ length: 40 }).map((_, i) => (
          <Flame key={i} style={{ left: `${i * 2.5}%`, animationDelay: `${Math.random()}s` }} />
        ))}
      </div>

      {/* Top Bar: Turn Indicator */}
      <div className="relative z-10 h-16 flex items-center justify-between px-8 border-b border-jixia-bronze bg-black/40 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setGameState('selection')}
            className="p-2 rounded-full hover:bg-jixia-bronze/20 transition-colors text-jixia-bronze"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="seal-style text-xs">辩</div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-jixia-patina font-bold">{selectedArena?.name}</span>
              <span className="text-xl font-bold text-jixia-gold">第 {turn} 回合</span>
            </div>
          </div>
          <div className="h-8 w-px bg-jixia-bronze mx-2" />
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isEnemyTurn ? 'bg-jixia-red animate-pulse' : 'bg-jixia-patina'}`} />
            <span className="text-sm font-medium">{isEnemyTurn ? '对手辩驳中...' : '己方陈述中'}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-jixia-bronze/20 transition-colors text-jixia-bronze">
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Main Arena */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-8">
        {/* Enemy Area */}
        <div className="w-full flex justify-center mb-12">
          <div className="flex items-center gap-6">
            <div className="seal-style text-lg h-fit">公输</div>
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative w-48 h-48 rounded-full bronze-border flex items-center justify-center bg-jixia-red/10 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-jixia-red/20 to-transparent" />
              <div className="absolute inset-0 taotie-pattern opacity-20" />
              <div className="text-center relative z-10">
                <div className="text-jixia-red mb-1"><Zap size={32} className="mx-auto" /></div>
                <div className="text-2xl font-bold text-jixia-bamboo">公输盘</div>
                <div className="text-xs text-jixia-red font-bold">HP: 85/100</div>
              </div>
              <motion.div 
                className="absolute -z-10 text-jixia-red/10"
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Cog size={180} />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Battle Slots */}
        <div className="flex gap-6 mb-12">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-32 h-44 rounded-lg border-2 border-jixia-bronze/30 flex items-center justify-center bg-black/40 relative overflow-hidden">
              <div className="absolute inset-0 taotie-pattern opacity-10" />
              <span className="text-jixia-bronze/20 font-bold text-2xl relative z-10">{i}</span>
            </div>
          ))}
        </div>

        {/* Player Stats */}
        <div className="w-full flex justify-center mt-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-8 bg-black/60 px-8 py-4 rounded-xl bronze-border"
          >
            <div className="seal-style text-sm">墨子</div>
            <div className="text-center">
              <div className="text-xs text-jixia-patina font-bold uppercase">生命值</div>
              <div className="text-2xl font-bold text-jixia-bamboo">92 / 100</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="flex gap-1 mb-1">
                {Array.from({ length: maxMana }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-2 h-6 rounded-sm transition-all duration-500 ${
                      i < mana ? 'bg-jixia-gold furnace-glow' : 'bg-jixia-bronze/20'
                    }`} 
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-jixia-gold" />
                <span className="text-sm font-bold text-jixia-gold">能量: {mana} / {maxMana}</span>
              </div>
            </div>

            <div className="text-center">
              <div className="text-xs text-jixia-patina font-bold uppercase">护甲</div>
              <div className="text-2xl font-bold text-jixia-patina">12</div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Bottom Area: Hand and Controls */}
      <div className="relative z-10 h-80 flex items-end justify-between px-12 pb-8 bg-gradient-to-t from-black/80 to-transparent">
        <div className="mb-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-jixia-red to-transparent border border-jixia-red/50 text-jixia-bamboo text-sm font-bold font-serif"
          >
            <Flag size={16} />
            投降
          </motion.button>
        </div>

        <div className="flex -space-x-8 hover:space-x-2 transition-all duration-500">
          <AnimatePresence>
            {hand.map(card => (
              <BattleCard 
                key={card.id} 
                card={card} 
                isSelected={selectedCardId === card.id}
                onClick={() => setSelectedCardId(selectedCardId === card.id ? null : card.id)}
              />
            ))}
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-4 items-center mb-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="relative p-3 rounded-full bronze-border bg-jixia-bg text-jixia-bronze"
          >
            <FileText size={24} />
            <div className="absolute top-0 right-0 seal-style text-[8px] p-1 min-w-0 w-4 h-4 flex items-center justify-center">书</div>
          </motion.button>

          <motion.button
            disabled={isEnemyTurn}
            onClick={handleEndTurn}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className={`relative group flex flex-col items-center justify-center w-28 h-28 rounded-full bronze-border bronze-gradient transition-all duration-500 ${
              isEnemyTurn ? 'grayscale opacity-50' : 'furnace-glow'
            }`}
          >
            <motion.div
              animate={!isEnemyTurn ? { rotate: 360 } : {}}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="text-jixia-bg"
            >
              <Cog size={40} />
            </motion.div>
            <span className="text-jixia-bg font-black text-lg mt-1 tracking-widest font-serif">鸣金</span>
            {!isEnemyTurn && (
              <motion.div
                animate={{ scale: [1, 1.2], opacity: [0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 rounded-full border-2 border-jixia-gold"
              />
            )}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isEnemyTurn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center backdrop-blur-sm"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="text-jixia-gold mb-4 inline-block"
              >
                <Cog size={80} />
              </motion.div>
              <h2 className="text-4xl font-black text-jixia-gold tracking-widest">对手回合</h2>
              <p className="text-jixia-bamboo mt-2 opacity-60">机关运转中...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
