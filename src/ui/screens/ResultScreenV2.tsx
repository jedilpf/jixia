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
 * 视觉风格：V9 绢本矿物、书帖排版、朱砂印鉴
 */
export function ResultScreenV2({ state, progress, settlement, onRestart }: ResultScreenV2Props) {
  const isWon = state.winnerId === 'player';
  const isDraw = state.winnerId === 'draw';
  
  const mainTitle = isWon ? '论定' : isDraw ? '平局' : '道阻';
  const subTitle = isWon ? '辞锋既出，万法咸听' : isDraw ? '博观约取，厚积薄发' : '言逊一筹，闭关思省';
  
  const primaryColor = isWon ? '#1e3a5f' : isDraw ? '#5e8f7e' : '#831843'; // 石青 / 石绿 / 朱砂
  const winRate = progress.totalGames > 0 ? Math.round((progress.winCount / progress.totalGames) * 100) : 0;

  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden bg-[#0a0a0a] font-serif">
      {/* 背景晕染遮罩 */}
      <div className="absolute inset-0 opacity-30" style={{ 
        background: `radial-gradient(circle at center, ${primaryColor}44 0%, transparent 70%)`,
        mixBlendMode: 'screen'
      }} />

      {/* 主体卷轴结构 */}
      <div className="relative w-[720px] transform animate-in fade-in zoom-in duration-700">
        {/* 顶部装裱线 */}
        <div className="h-2 w-full rounded-t-sm" style={{ background: `linear-gradient(90deg, transparent, #b88a53, transparent)` }} />
        
        <div className="relative border-x border-[#b88a5366] bg-[#fdfaf2] px-12 py-16 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/* 绢纸纹理叠加 - 使用内联SVG避免外链依赖 */}
          <div className="pointer-events-none absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }} />

          {/* 胜负大印 */}
          <div className="absolute right-12 top-12 flex h-24 w-24 items-center justify-center transform rotate-12 opacity-85 hover:rotate-6 transition-transform">
             <div className="relative border-4 border-[#831843] px-3 py-1 text-3xl font-bold text-[#831843] before:content-[''] before:absolute before:-inset-2 before:border before:border-[#83184333]">
               {isWon ? '胜' : isDraw ? '平' : '败'}
               <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-[#831843]" />
             </div>
          </div>

          {/* 标题区 */}
          <div className="mb-12 pl-6" style={{ borderLeftWidth: '4px', borderLeftColor: primaryColor }}>
            <h1 className="text-6xl font-bold tracking-[0.2em] text-[#1a1a1a]">{mainTitle}</h1>
            <p className="mt-4 text-lg italic text-[#666]">{subTitle}</p>
          </div>

          {/* 数据对垒 */}
          <div className="grid grid-cols-2 gap-12 mb-12">
            <div className="space-y-4">
              <div className="text-xs tracking-widest text-[#999] uppercase">我方大势</div>
              <div className="text-4xl font-light text-[#333] tabular-nums">{state.players.player.momentum}</div>
              <div className="h-1 w-full bg-[#eee]"><div className="h-full bg-[#1e3a5f]" style={{ width: `${Math.min(100, state.players.player.momentum)}%` }} /></div>
            </div>
            <div className="space-y-4">
              <div className="text-xs tracking-widest text-[#999] uppercase">对手大势</div>
              <div className="text-4xl font-light text-[#333] tabular-nums">{state.players.enemy.momentum}</div>
              <div className="h-1 w-full bg-[#eee]"><div className="h-full bg-[#831843]" style={{ width: `${Math.min(100, state.players.enemy.momentum)}%` }} /></div>
            </div>
          </div>

          {/* 奖励结算 - 名帖风格 */}
          <div className="relative rounded-sm border border-[#b88a5344] bg-[#f6f2e9] p-8">
            <div className="absolute -top-3 left-6 bg-[#fdfaf2] px-3 text-xs font-bold tracking-tighter text-[#b88a53]">战后定谳</div>
            {settlement ? (
              <div className="grid grid-cols-1 gap-6 text-[#444]">
                <div className="flex items-center justify-between border-b border-dashed border-[#b88a5366] pb-2">
                  <span className="text-sm">机缘转化</span>
                  <span className="font-serif italic text-lg">+{settlement.opportunityGain} <span className="text-xs not-italic text-[#999]">机缘</span></span>
                </div>
                <div className="flex items-center justify-between border-b border-dashed border-[#b88a5366] pb-2">
                  <span className="text-sm">学宫阅历</span>
                  <span className="font-serif italic text-lg">+{settlement.expGain} <span className="text-xs not-italic text-[#999]">阅历</span></span>
                </div>
                <div className="flex items-center justify-between border-b border-dashed border-[#b88a5366] pb-2">
                  <span className="text-sm">泉货进账</span>
                  <span className="font-serif italic text-lg">+{settlement.goldGain} <span className="text-xs not-italic text-[#999]">泉货</span></span>
                </div>
              </div>
            ) : (
              <p className="text-center text-sm italic text-[#999]">是局战果已入档，无新阅历产生。</p>
            )}
          </div>

          {/* 统计底栏 */}
          <div className="mt-12 flex justify-between items-end border-t border-[#eee] pt-8">
            <div className="flex gap-8 text-[11px] tracking-widest text-[#999] uppercase">
              <div>等级: Lv.{progress.level}</div>
              <div>总胜率: {winRate}%</div>
              <div>机缘存续: {progress.opportunity}</div>
            </div>
            
            <button
              onClick={onRestart}
              className="group relative px-10 py-3 overflow-hidden transition-all duration-300"
              style={{ background: '#1a1a1a' }}
            >
              <div className="absolute inset-0 bg-[#b88a53] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative z-10 text-white group-hover:text-black transition-colors duration-300 tracking-[0.3em] font-bold">同归</span>
            </button>
          </div>
        </div>
        
        {/* 底部装裱线 */}
        <div className="h-2 w-full rounded-b-sm" style={{ background: `linear-gradient(90deg, transparent, #b88a53, transparent)` }} />
      </div>
    </div>
  );
}
