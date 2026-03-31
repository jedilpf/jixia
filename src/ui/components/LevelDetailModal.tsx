import {
  getLevelRank,
  getLevelDetail,
  getLevelTitle,
  getLevelIcon,
  getLevelColor,
  getLevelDescription,
  getExpProgress,
  getLevelRankProgress,
  getNextRankInfo,
  LEVEL_RANKS,
} from '@/config/levelSystem';

interface LevelDetailModalProps {
  level: number;
  exp: number;
  playerStats: {
    winCount: number;
    totalGames: number;
    totalDamage: number;
    winStreak: number;
    collectedCards: number;
  };
  onClose: () => void;
}

export function LevelDetailModal({ level, exp, playerStats, onClose }: LevelDetailModalProps) {
  const rank = getLevelRank(level);
  const detail = getLevelDetail(level);
  const title = getLevelTitle(level);
  const icon = getLevelIcon(level);
  const color = getLevelColor(level);
  const description = getLevelDescription(level);
  const expProgress = getExpProgress(level, exp);
  const rankProgress = getLevelRankProgress(level);
  const nextRankInfo = getNextRankInfo(level);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div 
        className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ 
          background: 'linear-gradient(180deg, #1a1510 0%, #0d0b08 100%)',
          border: '1px solid rgba(92, 77, 58, 0.5)',
        }}
      >
        {/* 头部 - 当前等级展示 */}
        <div 
          className="relative p-6"
          style={{ 
            background: `linear-gradient(135deg, ${color}15, transparent)`,
            borderBottom: '1px solid rgba(92, 77, 58, 0.3)',
          }}
        >
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 border border-[#5c4d3a]/50 flex items-center justify-center text-[#8a7a6a] hover:text-[#c9b896] hover:bg-[#3d3225] transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-center gap-4">
            {/* 大图标 */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl border-2"
              style={{
                backgroundColor: `${color}20`,
                borderColor: color,
                boxShadow: `0 0 30px ${color}30`,
              }}
            >
              {icon}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold text-[#f5e6b8] font-serif">{title}</h2>
                <span 
                  className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{ backgroundColor: `${color}30`, color, border: `1px solid ${color}50` }}
                >
                  Lv.{level}
                </span>
              </div>
              <p className="text-sm text-[#a7c5ba] mb-3">{description}</p>
              
              {/* 经验进度条 */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-black/50 rounded-full overflow-hidden border border-[#3d3225]/50">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${expProgress.percentage}%`,
                      background: `linear-gradient(90deg, ${color}80, ${color})`,
                    }}
                  />
                </div>
                <span className="text-xs text-[#8a7a6a] tabular-nums">
                  {expProgress.current}/{expProgress.required} XP
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* 阶段进度 */}
          <div className="bg-[#1a1510]/50 rounded-xl p-4 border border-[#3d3225]/30">
            <h3 className="text-sm text-[#8a7a6a] uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
              当前阶段进度
            </h3>
            <div className="flex items-center gap-2">
              {Array.from({ length: rankProgress.total }).map((_, i) => (
                <div
                  key={i}
                  className="h-2 flex-1 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: i < rankProgress.current ? color : '#2a2318',
                    boxShadow: i < rankProgress.current ? `0 0 8px ${color}50` : 'none',
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-[#8a7a6a]">
              <span>{rank.title}</span>
              <span>{rankProgress.current}/{rankProgress.total} 级</span>
            </div>
          </div>

          {/* 下一目标 */}
          {nextRankInfo && (
            <div 
              className="rounded-xl p-4 border"
              style={{ 
                backgroundColor: `${color}08`, 
                borderColor: `${color}30`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#8a7a6a]">下一阶段</span>
                <span className="text-sm font-bold" style={{ color }}>
                  {nextRankInfo.title}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-[#8a7a6a]">
                <span>还需 {nextRankInfo.levelsRemaining} 级</span>
                <span>·</span>
                <span>需 {nextRankInfo.expRequired} 经验</span>
              </div>
            </div>
          )}

          {/* 当前能力 */}
          {detail.abilities.length > 0 && (
            <div>
              <h3 className="text-sm text-[#8a7a6a] uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9EAD8A]" />
                当前能力
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {detail.abilities.map((ability, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-[#1a1510]/50 border border-[#3d3225]/30 flex items-start gap-3"
                  >
                    <span className="text-lg">{ability.icon || '⚡'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-[#c9b896] font-medium">{ability.name}</div>
                      <div className="text-xs text-[#8a7a6a] leading-relaxed mt-0.5">{ability.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 升级条件 */}
          {detail.conditions.length > 0 && (
            <div>
              <h3 className="text-sm text-[#8a7a6a] uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d4a520]" />
                升级条件
              </h3>
              <div className="space-y-2">
                {detail.conditions.map((cond, i) => {
                  const current = playerStats
                    ? cond.type === 'win_games'
                      ? playerStats.winCount
                      : cond.type === 'play_games'
                      ? playerStats.totalGames
                      : cond.type === 'deal_damage'
                      ? playerStats.totalDamage
                      : cond.type === 'collect_cards'
                      ? playerStats.collectedCards
                      : 0
                    : cond.current || 0;
                  const progress = Math.min(current / cond.target, 1);
                  const completed = current >= cond.target;

                  return (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[#1a1510]/30 border border-[#3d3225]/20">
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center text-xs ${
                          completed 
                            ? 'bg-[#5a8a5a]/30 border border-[#5a8a5a]/50 text-[#5a8a5a]' 
                            : 'bg-[#2a2318] border border-[#3d3225] text-[#5c4d3a]'
                        }`}
                      >
                        {completed ? '✓' : ''}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm ${completed ? 'text-[#5a8a5a]' : 'text-[#a7c5ba]'}`}>
                            {cond.name}
                          </span>
                          <span className={`text-xs ${completed ? 'text-[#5a8a5a]' : 'text-[#8a7a6a]'}`}>
                            {current}/{cond.target}
                          </span>
                        </div>
                        <div className="h-1 bg-[#2a2318] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${progress * 100}%`,
                              backgroundColor: completed ? '#5a8a5a' : color,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 等级体系总览 */}
          <div className="pt-4 border-t border-[#3d3225]/30">
            <h3 className="text-sm text-[#8a7a6a] uppercase tracking-wider mb-3">等级体系</h3>
            <div className="flex items-center justify-between">
              {LEVEL_RANKS.map((r, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs border"
                    style={{
                      backgroundColor: level >= r.minLevel ? `${r.color}25` : '#1a1510',
                      borderColor: level >= r.minLevel ? `${r.color}60` : '#3d3225',
                      color: level >= r.minLevel ? r.color : '#5c4d3a',
                    }}
                  >
                    {r.icon}
                  </div>
                  <span 
                    className="text-[10px]"
                    style={{ color: level >= r.minLevel ? r.color : '#5c4d3a' }}
                  >
                    {r.title.slice(0, 2)}
                  </span>
                  {i < LEVEL_RANKS.length - 1 && (
                    <div className="absolute" style={{ marginLeft: '32px' }}>
                      <div
                        className="w-4 h-0.5"
                        style={{ backgroundColor: level > r.maxLevel ? '#5a8a5a' : '#3d3225' }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LevelDetailModal;
