import React, { useMemo } from 'react';
import { AvatarBackend } from '@/data/game/avatarRegistry';

interface PlayerStats {
  level: number;
  exp: number;
  winCount: number;
  totalGames: number;
  winStreak: number;
  totalDamage: number;
  cardCollection: number;
  totalCards: number;
}

interface PlayerStatsPanelV2Props {
  playerName: string;
  stats: PlayerStats;
  onClose?: () => void;
}

/**
 * PlayerStatsPanelV2 - 稷下 2.0 名士战绩简牍
 * 逻辑：对接 BattleV2 术语，视觉采用 V9 矿物华彩。
 */
export const PlayerStatsPanelV2: React.FC<PlayerStatsPanelV2Props> = ({
  playerName,
  stats,
  onClose,
}) => {
  const winRate = useMemo(() => {
    if (stats.totalGames === 0) return 0;
    return Math.round((stats.winCount / stats.totalGames) * 100);
  }, [stats.winCount, stats.totalGames]);

  // 对接 V2 术语映射
  const yahuraStats = useMemo(() => [
    { label: '历战捷报', value: `${stats.winCount}捷 / ${stats.totalGames}役`, color: '#b88a53' },
    { label: '运筹胜算', value: `${winRate}%`, color: winRate >= 60 ? '#5e8f7e' : '#bca47f' },
    { label: '连捷气势', value: `破竹 ×${stats.winStreak}`, color: '#831843' },
    { label: '辩辞总量', value: `${(stats.totalDamage / 100).toFixed(1)}k`, color: '#1e3a5f' },
  ], [stats, winRate]);

  return (
    <div className="relative w-full max-w-sm overflow-hidden bg-[#fdfaf2] shadow-2xl border-2 border-[#b88a5366]">
      {/* 顶部饰边 */}
      <div className="h-6 bg-[#1a1a1a] flex items-center justify-center">
        <div className="w-1/3 h-[1px] bg-[#b88a5366] shrink-0" />
        <span className="text-[10px] text-[#b88a53] mx-2 tracking-[0.5em] font-bold">名士简牍</span>
        <div className="w-1/3 h-[1px] bg-[#b88a5366] shrink-0" />
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-8 border-b border-[#b88a5333] pb-4">
          <div className="flex items-center gap-4">
             {/* 极简水墨感头像占位 */}
             <div className="w-14 h-14 bg-[#1a1a1a] rounded-sm relative overflow-hidden flex items-center justify-center">
                {AvatarBackend.getSelectedInfo() ? (
                  <img 
                    src={AvatarBackend.getSelectedInfo().assetPath} 
                    alt="avatar" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-[#fdfaf2] text-2xl font-serif">{playerName.charAt(0)}</span>
                )}
                {/* 如果图片加载失败显示文字 */}
                <span className="absolute text-[#fdfaf2] text-2xl font-serif pointer-events-none mix-blend-difference opacity-20">
                  {playerName.charAt(0)}
                </span>
                <div className="absolute inset-0 border-2 border-[#b88a5344] m-1" />
             </div>
             <div>
               <h2 className="text-xl font-bold text-[#1a1a1a] tracking-wider">{playerName}</h2>
               <div className="text-[10px] text-[#844b25] flex items-center gap-2 mt-1">
                 <span className="px-1 border border-[#844b25]">Lv.{stats.level}</span>
                 <span className="tracking-widest">稷下访客</span>
               </div>
             </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-[#999] hover:text-[#1a1a1a] text-xl">
              {"\u2715"}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-6 mb-8">
          {yahuraStats.map((s, i) => (
            <div key={i} className="flex flex-col pl-3" style={{ borderLeftWidth: '2px', borderLeftColor: s.color }}>
              <span className="text-[10px] text-[#999] tracking-widest mb-1">{s.label}</span>
              <span className="text-xl font-medium text-[#333] tabular-nums">{s.value}</span>
            </div>
          ))}
        </div>

        {/* 阅历进度 */}
        <div className="space-y-4 pt-4 border-t border-[#eee]">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-[#bca47f]">
                <span>学宫阅历</span>
                <span>{stats.exp} / {(stats.level + 1) * 100}</span>
              </div>
              <div className="h-1.5 w-full bg-[#eee] overflow-hidden">
                <div 
                   className="h-full bg-[#1e3a5f] transition-all duration-1000" 
                   style={{ width: `${(stats.exp / ((stats.level + 1) * 100)) * 100}%` }} 
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-[#bca47f]">
                <span>言词典藏</span>
                <span>{stats.cardCollection} / {stats.totalCards}</span>
              </div>
              <div className="h-1.5 w-full bg-[#eee] overflow-hidden">
                <div 
                   className="h-full bg-[#831843] transition-all duration-1000" 
                   style={{ width: `${(stats.cardCollection / stats.totalCards) * 100}%` }} 
                />
              </div>
            </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button className="flex-1 bg-[#1a1a1a] text-[#fdfaf2] py-2 text-xs font-bold tracking-[0.2em] border border-transparent hover:bg-white hover:text-black hover:border-black transition-all">
            易装
          </button>
          <button className="flex-1 bg-white text-[#1a1a1a] py-2 text-xs font-bold tracking-[0.2em] border border-black hover:bg-black hover:text-white transition-all">
            博引详情
          </button>
        </div>
      </div>
      
      {/* 底部纹理饰边 */}
      <div className="h-1 opacity-50" style={{ background: 'repeating-linear-gradient(45deg, #b88a53, #b88a53 2px, transparent 2px, transparent 4px)' }} />
    </div>
  );
};
