import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GameState } from '@/core/types';

interface BattleSettlementSummary {
  settlementKey: string;
  playerMomentum: number;
  opportunityGain: number;
  expGain: number;
  goldGain: number;
  won: boolean;
}

interface ResultScreenV2Props {
  state: GameState;
  progress: {
    level: number;
    exp: number;
    opportunity: number;
    winCount: number;
    totalGames: number;
  };
  settlement: BattleSettlementSummary | null;
  onRestart: () => void;
}

/**
 * ResultScreenV2 - 稷下 2.0 雅化结算定谳页
 * 视觉风格：V9 绢本矿物、书帖排版、朱砂印鉴 + 转场动画背景
 */
export function ResultScreenV2({ state, progress, settlement, onRestart }: ResultScreenV2Props) {
  const isWon = state.winnerId === 'player';
  const isDraw = state.winnerId === 'draw';
  
  const mainTitle = isWon ? '论定' : isDraw ? '平局' : '道阻';
  const subTitle = isWon ? '辞锋既出，万法咸听' : isDraw ? '博观约取，厚积薄发' : '言逊一筹，闭关思省';
  
  const primaryColor = isWon ? '#1e3a5f' : isDraw ? '#5e8f7e' : '#831843'; // 石青 / 石绿 / 朱砂
  const winRate = progress.totalGames > 0 ? Math.round((progress.winCount / progress.totalGames) * 100) : 0;

  // 转场动画背景元素
  const asset = useCallback((path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`, []);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const [sourceIndex, setSourceIndex] = useState(0);
  const videoSources = useMemo(
    () => [
      asset('assets/transition.mp4'),
      asset(encodeURI('素材/fbe7eb1e32979861693d5d7ff6742c3e.mp4')),
    ],
    [asset],
  );
  const videoSrc = videoSources[sourceIndex] ?? videoSources[0];

  const tryNextSource = useCallback(() => {
    setSourceIndex((prev) => {
      const next = prev + 1;
      if (next < videoSources.length) {
        return next;
      }
      setVideoFailed(true);
      return prev;
    });
  }, [videoSources.length]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || videoFailed) return;
    const p = v.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => tryNextSource());
    }
  }, [videoSrc, videoFailed, tryNextSource]);

  const handleVideoError = () => {
    tryNextSource();
  };

  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden bg-[#0a0503] font-serif">
      {/* ═══════════════════════════════════════════════════════════════
          转场动画背景层 (从TransitionScreen整合)
         ═══════════════════════════════════════════════════════════════ */}
      {!videoFailed ? (
        <video
          src={videoSrc}
          autoPlay
          muted
          playsInline
          loop
          preload="auto"
          ref={videoRef}
          onError={handleVideoError}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'fill',
            filter: 'blur(24px) brightness(0.35) saturate(1.35)',
            transform: 'scale(1.04)',
            pointerEvents: 'none',
            zIndex: 0,
            opacity: 0.6,
          }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 30% 30%, rgba(30, 58, 95, 0.2), transparent 45%), radial-gradient(circle at 78% 75%, rgba(131, 24, 67, 0.15), transparent 45%), linear-gradient(120deg, #0a0503 0%, #1a2840 45%, #0a0503 100%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}

      {/* 齿轮装饰层 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
        <Gear size={140} x="-40px" y="-40px" speed={6} opacity={0.15} />
        <Gear size={100} x="calc(100% - 75px)" y="calc(100% - 105px)" speed={-4} opacity={0.12} />
        <Gear size={70} x="15%" y="35%" speed={3} opacity={0.1} />
      </div>

      {/* 火星粒子效果 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
        {[...Array(5)].map((_, i) => (
          <EmberParticle key={i} index={i} />
        ))}
      </div>

      {/* 背景晕染遮罩 */}
      <div className="absolute inset-0 opacity-40" style={{ 
        background: `radial-gradient(circle at center, ${primaryColor}44 0%, transparent 70%)`,
        mixBlendMode: 'screen',
        zIndex: 2,
      }} />

      {/* 主体卷轴结构 */}
      <div className="relative w-[720px] transform animate-in fade-in zoom-in duration-700" style={{ zIndex: 10 }}>
        {/* 顶部装裱线 */}
        <div className="h-2 w-full rounded-t-sm" style={{ background: `linear-gradient(90deg, transparent, #D4AF65, transparent)` }} />
        
        <div className="relative border-x border-[#D4AF65]/30 bg-[#f6e4c3]/95 px-12 py-16 shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* 绢纸纹理叠加 */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }} />

          {/* 胜负大印 */}
          <div className="absolute right-12 top-12 flex h-24 w-24 items-center justify-center transform rotate-12 opacity-90 hover:rotate-6 transition-transform">
             <div className="relative border-4 border-[#831843] px-3 py-1 text-3xl font-bold text-[#831843] before:content-[''] before:absolute before:-inset-2 before:border before:border-[#83184333]">
               {isWon ? '胜' : isDraw ? '平' : '败'}
               <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-[#831843]" />
             </div>
          </div>

          {/* 标题区 */}
          <div className="mb-12 pl-6" style={{ borderLeftWidth: '5px', borderLeftColor: primaryColor }}>
            <h1 className="text-6xl font-bold tracking-[0.25em] text-[#0a0503]">{mainTitle}</h1>
            <p className="mt-4 text-lg italic text-[#555] tracking-widest">{subTitle}</p>
          </div>

          {/* 数据对垒 */}
          <div className="grid grid-cols-2 gap-12 mb-12">
            <div className="space-y-4">
              <div className="text-xs tracking-widest text-[#888] uppercase font-bold">我方大势</div>
              <div className="text-5xl font-light text-[#0a0503] tabular-nums">{state.players.player.momentum}</div>
              <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#1e3a5f]" style={{ width: `${Math.min(100, state.players.player.momentum)}%` }} />
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-xs tracking-widest text-[#888] uppercase font-bold">对手大势</div>
              <div className="text-5xl font-light text-[#0a0503] tabular-nums">{state.players.enemy.momentum}</div>
              <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#831843]" style={{ width: `${Math.min(100, state.players.enemy.momentum)}%` }} />
              </div>
            </div>
          </div>

          {/* 奖励结算 - 名帖风格 */}
          <div className="relative rounded-sm border border-[#D4AF65]/30 bg-[#e7e1f0]/40 p-8 backdrop-blur-sm">
            <div className="absolute -top-3 left-6 bg-[#f6e4c3] px-3 text-xs font-bold tracking-[0.2em] text-[#D4AF65] uppercase">战后定谳</div>
            {settlement ? (
              <div className="grid grid-cols-1 gap-6 text-[#222]">
                <div className="flex items-center justify-between border-b border-dashed border-[#D4AF65]/40 pb-2">
                  <span className="text-sm font-bold">机缘转化</span>
                  <span className="font-serif italic text-xl text-[#1e3a5f]">+{settlement.opportunityGain} <span className="text-xs not-italic text-[#666]">机缘</span></span>
                </div>
                <div className="flex items-center justify-between border-b border-dashed border-[#D4AF65]/40 pb-2">
                  <span className="text-sm font-bold">学宫阅历</span>
                  <span className="font-serif italic text-xl text-[#064e3b]">+{settlement.expGain} <span className="text-xs not-italic text-[#666]">阅历</span></span>
                </div>
                <div className="flex items-center justify-between border-b border-dashed border-[#D4AF65]/40 pb-2">
                  <span className="text-sm font-bold">泉货进账</span>
                  <span className="font-serif italic text-xl text-[#831843]">+{settlement.goldGain} <span className="text-xs not-italic text-[#666]">泉货</span></span>
                </div>
              </div>
            ) : (
              <p className="text-center text-sm italic text-[#666] py-4">是局战果已入档，无新阅历产生。</p>
            )}
          </div>

          {/* 统计底栏 */}
          <div className="mt-12 flex justify-between items-end border-t border-black/10 pt-8">
            <div className="flex gap-8 text-[11px] tracking-[0.2em] text-[#777] uppercase font-bold">
              <div>等级: <span className="text-[#0a0503]">Lv.{progress.level}</span></div>
              <div>总胜率: <span className="text-[#0a0503]">{winRate}%</span></div>
              <div>机缘存续: <span className="text-[#0a0503]">{progress.opportunity}</span></div>
            </div>
            
            <button
              onClick={onRestart}
              className="group relative px-12 py-3.5 overflow-hidden transition-all duration-500 shadow-xl"
              style={{ background: '#0a0503' }}
            >
              <div className="absolute inset-0 bg-[#D4AF65] translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <span className="relative z-10 text-[#f6e4c3] group-hover:text-[#0a0503] transition-colors duration-500 tracking-[0.5em] font-black text-lg">定谳</span>
            </button>
          </div>
        </div>
        
        {/* 底部装裱线 */}
        <div className="h-2 w-full rounded-b-sm" style={{ background: `linear-gradient(90deg, transparent, #D4AF65, transparent)` }} />
      </div>

      {/* 动画样式 */}
      <style>{`
        @keyframes gear-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes ember-float {
          0%, 100% { opacity: 0.3; transform: translateY(0) scale(1); }
          50% { opacity: 0.8; transform: translateY(-20px) scale(1.2); }
        }
        @keyframes particle-rise {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-120px) scale(0.3); }
        }
      `}</style>
    </div>
  );
}

// 齿轮装饰组件
function Gear({ size, x, y, speed, opacity }: { size: number; x: string; y: string; speed: number; opacity: number }) {
  const [rotation, setRotation] = useState(0);
  
  useEffect(() => {
    let raf: number;
    let last = Date.now();
    const tick = () => {
      const now = Date.now();
      setRotation(r => r + speed * (now - last) / 1000);
      last = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speed]);

  const teeth = 12;
  const outerR = size / 2;
  const innerR = outerR * 0.68;
  const toothH = outerR * 0.22;

  const points = [];
  for (let i = 0; i < teeth; i++) {
    const angle = (i / teeth) * Math.PI * 2;
    const nextAngle = ((i + 0.4) / teeth) * Math.PI * 2;
    const nextAngle2 = ((i + 0.6) / teeth) * Math.PI * 2;
    const endAngle = ((i + 1) / teeth) * Math.PI * 2;
    points.push(
      `${(Math.cos(angle) * innerR + outerR).toFixed(2)},${(Math.sin(angle) * innerR + outerR).toFixed(2)}`,
      `${(Math.cos(nextAngle) * (outerR + toothH) + outerR).toFixed(2)},${(Math.sin(nextAngle) * (outerR + toothH) + outerR).toFixed(2)}`,
      `${(Math.cos(nextAngle2) * (outerR + toothH) + outerR).toFixed(2)},${(Math.sin(nextAngle2) * (outerR + toothH) + outerR).toFixed(2)}`,
      `${(Math.cos(endAngle) * innerR + outerR).toFixed(2)},${(Math.sin(endAngle) * innerR + outerR).toFixed(2)}`,
    );
  }

  return (
    <svg 
      width={size} 
      height={size} 
      style={{ 
        position: 'absolute', 
        left: x, 
        top: y, 
        opacity, 
        transform: `rotate(${rotation}deg)`, 
        transformOrigin: `${outerR}px ${outerR}px`, 
        pointerEvents: 'none' 
      }}
    >
      <polygon points={points.join(' ')} fill="none" stroke="#D4AF65" strokeWidth="1.5" />
      <circle cx={outerR} cy={outerR} r={outerR * 0.28} fill="none" stroke="#D4AF65" strokeWidth="1.5" />
    </svg>
  );
}

// 火星粒子组件
function EmberParticle({ index }: { index: number }) {
  const style = useMemo(() => ({
    left: `${20 + index * 15}%`,
    top: `${60 + (index % 3) * 10}%`,
    animationDelay: `${index * 0.3}s`,
    animationDuration: `${2 + index * 0.5}s`,
    width: `${4 + (index % 3)}px`,
    height: `${4 + (index % 3)}px`,
  }), [index]);
  
  return (
    <div 
      className="absolute rounded-full" 
      style={{
        ...style,
        background: 'radial-gradient(circle, #E85D04, #831843)', // 朱砂色渐变
        boxShadow: '0 0 12px #E85D04, 0 0 24px rgba(232,93,4,0.5)',
        animation: 'ember-float 2s ease-in-out infinite',
      }} 
    />
  );
}
