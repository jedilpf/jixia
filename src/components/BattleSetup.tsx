import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cog, Play } from 'lucide-react';
import { ArenaId } from '@/battleV2/types';
import { uiAudio } from '@/utils/audioManager';

interface BattleSetupProps {
  selectedArenaId: ArenaId;
  onSelectArena: (arenaId: ArenaId) => void;
  onStartBattle: () => void;
  onBackMenu: () => void;
}

// 论场数据 - 与现有系统兼容的ID
interface ArenaData {
  id: ArenaId;
  name: string;
  description: string;
  passive: string;
  bias: string;
  skill: string;
  color: string;
  border: string;
  borderLight: string;
  bg: string;
  glow: string;
}

const ARENAS: ArenaData[] = [
  {
    id: 'jixia',
    name: '稷下学宫',
    description: '标准环境，适合新手',
    passive: '被动：公议初启：双方开局获得 1 护印',
    bias: '偏向：立言有据：首次立论且未着书时，获得 1 立立',
    skill: '技能：公议（一次）：第一张反诘费用 -1',
    color: 'text-jixia-gold',
    border: 'border-jixia-gold',
    borderLight: 'border-jixia-gold/30',
    bg: 'bg-jixia-gold',
    glow: 'rgba(212, 160, 23, 0.5)'
  },
  {
    id: 'huode',
    name: '火德论坛',
    description: '进攻环境，强调打穿一路',
    passive: '被动：烈辩先声：前席争鸣辩锋 +1',
    bias: '偏向：穿席余烬：击破前席且有溢出时，额外造成 1 心证伤害',
    skill: '技能：焚势（一次）：指定一路本回合不能被护印完全吸收',
    color: 'text-jixia-orange',
    border: 'border-jixia-orange',
    borderLight: 'border-jixia-orange/30',
    bg: 'bg-jixia-orange',
    glow: 'rgba(255, 102, 0, 0.5)'
  },
  {
    id: 'cangshu',
    name: '藏书秘阁',
    description: '着书成长，后期兑现',
    passive: '被动：秘阁藏卷：首次着书额外获得 1 护印',
    bias: '偏向：文脉深藏：第 2 次着书起，每次着书回复 1 心证',
    skill: '技能：校书（一次）：立即着书，再抽 1 弃 1',
    color: 'text-jixia-jade',
    border: 'border-jixia-jade',
    borderLight: 'border-jixia-jade/30',
    bg: 'bg-jixia-jade',
    glow: 'rgba(74, 222, 128, 0.5)'
  },
  {
    id: 'guanxing',
    name: '玄机观星台',
    description: '信息差与暗策环境',
    passive: '被动：星轨照影：暗策锁定后可见对手暗策牌类',
    bias: '偏向：天机偏衡：每回合首次打出暗策时，获得 1 护印',
    skill: '技能：窥衡（一次）：查看对手本回合暗策并强化反诘',
    color: 'text-jixia-star',
    border: 'border-jixia-star',
    borderLight: 'border-jixia-star/30',
    bg: 'bg-jixia-star',
    glow: 'rgba(77, 171, 255, 0.5)'
  }
];

// 显式class映射，防止Tailwind裁剪
const BORDER_COLOR_MAP: Record<ArenaId, string> = {
  jixia: 'border-jixia-gold',
  huode: 'border-jixia-orange',
  cangshu: 'border-jixia-jade',
  guanxing: 'border-jixia-star',
};

const BORDER_LIGHT_MAP: Record<ArenaId, string> = {
  jixia: 'border-l-jixia-gold/30',
  huode: 'border-l-jixia-orange/30',
  cangshu: 'border-l-jixia-jade/30',
  guanxing: 'border-l-jixia-star/30',
};

const TEXT_COLOR_MAP: Record<ArenaId, string> = {
  jixia: 'text-jixia-gold',
  huode: 'text-jixia-orange',
  cangshu: 'text-jixia-jade',
  guanxing: 'text-jixia-star',
};

const BG_COLOR_MAP: Record<ArenaId, string> = {
  jixia: 'bg-jixia-gold',
  huode: 'bg-jixia-orange',
  cangshu: 'bg-jixia-jade',
  guanxing: 'bg-jixia-star',
};

// 齿轮装饰组件
const GearDecoration = ({ className, size = 100 }: { className?: string, size?: number }) => (
  <motion.div
    className={`text-jixia-bronze opacity-20 pointer-events-none ${className}`}
    animate={{ rotate: 360 }}
    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
  >
    <Cog size={size} />
  </motion.div>
);

// 底部火焰组件
const Flame = ({ style }: { style: React.CSSProperties }) => (
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

// 幕布覆盖层
const CurtainOverlay = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <div className="absolute inset-0 flex justify-between">
        {/* 左侧幕布 */}
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
          {/* 金色刺绣边缘 */}
          <div className="absolute inset-y-0 right-0 w-3 bg-gradient-to-b from-jixia-gold via-jixia-bronze to-jixia-gold shadow-[0_0_15px_rgba(212,160,23,0.5)]" />
          <div className="absolute inset-y-0 right-3 w-px bg-jixia-gold/30" />
        </motion.div>

        {/* 右侧幕布 */}
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
          {/* 金色刺绣边缘 */}
          <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-b from-jixia-gold via-jixia-bronze to-jixia-gold shadow-[0_0_15px_rgba(212,160,23,0.5)]" />
          <div className="absolute inset-y-0 left-3 w-px bg-jixia-gold/30" />
        </motion.div>
      </div>

      {/* 青铜挂钩/流苏 */}
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
        {/* 金色流苏 */}
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
        {/* 金色流苏 */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-16 bg-gradient-to-b from-jixia-gold via-jixia-red to-transparent opacity-80 rounded-full blur-[1px]" />
      </motion.div>
    </div>
  );
};

export function BattleSetup(props: BattleSetupProps) {
  const { selectedArenaId, onSelectArena, onStartBattle, onBackMenu } = props;
  const [flames, setFlames] = useState<{ id: number, style: React.CSSProperties }[]>([]);

  // 生成火焰效果
  useEffect(() => {
    const newFlames = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      style: {
        left: `${i * 3.3}%`,
        animationDelay: `${Math.random()}s`,
      }
    }));
    setFlames(newFlames);
  }, []);

  const selectedArena = ARENAS.find(a => a.id === selectedArenaId);

  const handleArenaSelect = (arenaId: ArenaId) => {
    uiAudio.playClick();
    onSelectArena(arenaId);
  };

  const handleStart = () => {
    uiAudio.playClick();
    onStartBattle();
  };

  const handleBack = () => {
    uiAudio.playClick();
    onBackMenu();
  };

  return (
    <div className="relative w-full h-screen bg-jixia-bg text-jixia-bamboo p-12 flex flex-col overflow-hidden silk-texture">
      <CurtainOverlay />
      
      {/* 背景图案 */}
      <div className="absolute inset-0 mural-overlay pointer-events-none" />
      <div className="absolute inset-0 taotie-pattern opacity-10 pointer-events-none" />
      <GearDecoration className="absolute -top-20 -left-20 gear-faded" size={300} />
      <GearDecoration className="absolute -bottom-20 -right-20 gear-faded" size={400} />

      {/* 头部 */}
      <header className="flex justify-between items-start mb-12 relative z-10">
        <div className="flex items-center gap-4">
          <div className="seal-style text-lg">论场</div>
          <div>
            <h1 className="text-4xl font-bold text-jixia-gold mb-2 tracking-widest font-serif">选择论场</h1>
            <p className="text-jixia-bamboo/60 font-serif italic">不同论场有不同被动与机制偏向，开局前可自由切换。</p>
          </div>
        </div>
        <button 
          onClick={handleBack}
          className="royal-silk-button transition-all hover:scale-105 active:scale-95 font-serif"
        >
          返回菜单
        </button>
      </header>

      {/* 论场选择网格 */}
      <div className="grid grid-cols-2 gap-6 flex-1 max-w-6xl mx-auto w-full relative z-10">
        {ARENAS.map((arena) => {
          const isSelected = selectedArenaId === arena.id;
          return (
            <motion.div
              key={arena.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleArenaSelect(arena.id)}
              className={`relative p-8 rounded-xl border-2 cursor-pointer transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                isSelected 
                ? `fancy-cloud-border ${BORDER_COLOR_MAP[arena.id]} bg-black/40` 
                : 'border-jixia-bronze/20 bg-black/20 hover:border-jixia-bronze/40'
              }`}
              style={isSelected ? { boxShadow: `0 0 30px ${arena.glow}` } : {}}
            >
              <div className="absolute inset-0 bamboo-slip opacity-10 pointer-events-none" />
              <div className="absolute -right-4 -top-4 taotie-pattern w-32 h-32 opacity-20 rotate-12" />
              
              <div className="relative z-10">
                <h2 className={`text-2xl font-bold mb-4 font-serif ${TEXT_COLOR_MAP[arena.id]}`}>{arena.name}</h2>
                <p className="text-sm text-jixia-bamboo/80 mb-6 font-serif">{arena.description}</p>
                
                <div className="space-y-2 text-sm font-serif">
                  <p className={`opacity-70 border-l-2 pl-3 ${BORDER_LIGHT_MAP[arena.id]}`}>{arena.passive}</p>
                  <p className={`opacity-70 border-l-2 pl-3 ${BORDER_LIGHT_MAP[arena.id]}`}>{arena.bias}</p>
                  <p className={`opacity-70 border-l-2 pl-3 ${BORDER_LIGHT_MAP[arena.id]}`}>{arena.skill}</p>
                </div>
              </div>

              {isSelected && (
                <div className={`absolute top-8 right-8 seal-style text-xs ${BG_COLOR_MAP[arena.id]} text-jixia-ink`}>
                  已选择
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* 底部按钮 */}
      <footer className="mt-12 flex justify-end relative z-10">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStart}
          className={`px-10 py-3 rounded-lg bronze-gradient font-bold flex items-center gap-4 furnace-glow border-2 ${
            selectedArenaId ? BORDER_COLOR_MAP[selectedArenaId] : 'border-jixia-gold'
          }`}
          style={{ boxShadow: `0 0 25px ${selectedArena?.glow || 'rgba(212, 160, 23, 0.5)'}` }}
        >
          <div className={`seal-style text-sm ${selectedArenaId ? BG_COLOR_MAP[selectedArenaId] : 'bg-jixia-gold'} text-jixia-ink border-jixia-ink`}>启</div>
          <span className="tracking-widest font-serif">开始对局</span>
          <Play size={20} fill="currentColor" />
        </motion.button>
      </footer>

      {/* 底部火焰效果 */}
      <div className="absolute bottom-0 left-0 w-full flex justify-around pointer-events-none">
        {flames.map((flame) => (
          <Flame key={flame.id} style={flame.style} />
        ))}
      </div>
    </div>
  );
}
