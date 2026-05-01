import { useState } from 'react';
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
  isLevelMaxed,
  LEVEL_RANKS,
} from '@/config/levelSystem';

interface PlayerLevelBadgeProps {
  level: number;
  exp: number;
  playerStats?: {
    winCount: number;
    totalGames: number;
    totalDamage: number;
    winStreak: number;
    collectedCards: number;
  };
  compact?: boolean;
}

export function PlayerLevelBadge({ level, exp, playerStats, compact = false }: PlayerLevelBadgeProps) {
  const [expanded, setExpanded] = useState(false);

  const rank = getLevelRank(level);
  const detail = getLevelDetail(level);
  const title = getLevelTitle(level);
  const icon = getLevelIcon(level);
  const color = getLevelColor(level);
  const description = getLevelDescription(level);
  const expProgress = getExpProgress(level, exp);
  const rankProgress = getLevelRankProgress(level);
  const nextRankInfo = getNextRankInfo(level);
  const maxed = isLevelMaxed(level);

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  if (compact) {
    return (
      <button
        onClick={handleToggle}
        className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-br from-[#1a1510] to-[#2a2318] border-2 transition-all duration-300 hover:scale-105 cursor-pointer shadow-[0_8px_20px_rgba(0,0,0,0.4)] group relative overflow-hidden"
        style={{ borderColor: `${color}80` }}
        title="查看等级详情"
      >
        {/* 极光/绸缎光泽效果 */}
        <div className="absolute inset-0 opacity-20 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        
        <span className="text-xl filter drop-shadow-md">{icon}</span>
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2">
            <span 
              className="text-xs font-black tracking-wider filter brightness-125" 
              style={{ color, textShadow: `0 0 8px ${color}40` }}
            >
              Lv.{level}
            </span>
            <span className="text-xs text-[#F5E6B8] font-bold tracking-tight">{title}</span>
          </div>
          <div className="text-[9px] font-medium tracking-widest text-[#F5E6B8]/70 uppercase">
            {rank.subtitle}
          </div>
        </div>
        <svg
          className={`w-3.5 h-3.5 text-[#F5E6B8]/40 transition-transform duration-300 group-hover:text-[#F5E6B8] ${expanded ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="group flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#1a1510] to-[#0d0b08] border transition-all duration-300 hover:from-[#1f1a12] hover:to-[#151210] cursor-pointer shadow-lg"
        style={{
          borderColor: `${color}60`,
          boxShadow: `0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 ${color}20`,
        }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold border-2 transition-all duration-300 group-hover:scale-105"
          style={{
            backgroundColor: `${color}15`,
            borderColor: color,
            boxShadow: `0 0 15px ${color}40`,
          }}
        >
          {icon}
        </div>

        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold" style={{ color }}>
              Lv.{level}
            </span>
            <span className="text-[#f5e6b8] font-serif text-sm tracking-wider">{title}</span>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${color}25`, color, border: `1px solid ${color}40` }}
            >
              {rank.subtitle}
            </span>
          </div>

          {!maxed && (
            <div className="flex items-center gap-2 w-48">
              <div className="flex-1 h-1.5 bg-black/50 rounded-full overflow-hidden border border-[#3d3225]/30">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${expProgress.percentage}%`,
                    background: `linear-gradient(90deg, ${color}80, ${color})`,
                    boxShadow: `0 0 8px ${color}60`,
                  }}
                />
              </div>
              <span className="text-[10px] text-[#8a7a6a] tabular-nums">
                {expProgress.current}/{expProgress.required}
              </span>
            </div>
          )}

          {maxed && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs px-2 py-0.5 rounded bg-[#d4a520]/20 text-[#d4a520] border border-[#d4a520]/40">
                满级
              </span>
              <span className="text-[10px] text-[#8a7a6a]">已达巅峰</span>
            </div>
          )}
        </div>

        <svg
          className={`w-5 h-5 text-[#8a7a6a] group-hover:text-[#c9b896] transition-all duration-300 ml-2 ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div
          className="absolute top-full left-0 mt-2 w-[420px] rounded-xl bg-gradient-to-b from-[#1a1510] via-[#151210] to-[#0d0b08] border border-[#5c4d3a]/50 shadow-2xl overflow-hidden z-50"
          style={{ animation: 'slideDown 0.3s ease-out' }}
        >
          <div className="p-4 border-b border-[#3d3225]/30" style={{ background: `linear-gradient(135deg, ${color}10, transparent)` }}>
            <div className="flex items-start gap-3">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl font-bold border-2"
                style={{
                  backgroundColor: `${color}15`,
                  borderColor: color,
                  boxShadow: `0 0 20px ${color}40`,
                }}
              >
                {icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-[#f5e6b8] font-serif" style={{ color }}>
                    {title}
                  </h3>
                  <span className="text-sm text-[#8a7a6a]">Lv.{level}</span>
                </div>
                <p className="text-sm text-[#a7c5ba] leading-relaxed">{description}</p>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#8a7a6a] uppercase tracking-wider">阶段进度</span>
                <span className="text-xs text-[#c9b896]">
                  {rank.title} · {rankProgress.current}/{rankProgress.total}
                </span>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: rankProgress.total }).map((_, i) => (
                  <div
                    key={i}
                    className="h-2 flex-1 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: i < rankProgress.current ? color : '#2a2318',
                      boxShadow: i < rankProgress.current ? `0 0 6px ${color}60` : 'none',
                    }}
                  />
                ))}
              </div>
            </div>

            {nextRankInfo && (
              <div
                className="p-3 rounded-lg border"
                style={{ backgroundColor: `${color}08`, borderColor: `${color}30` }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[#8a7a6a]">距离下一阶段</span>
                  <span className="text-xs font-bold" style={{ color }}>
                    {nextRankInfo.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[#8a7a6a]">
                  <span>还差 {nextRankInfo.levelsRemaining} 级</span>
                  <span>·</span>
                  <span>需 {nextRankInfo.expRequired} 经验</span>
                </div>
              </div>
            )}

            {detail.conditions.length > 0 && (
              <div>
                <h4 className="text-xs text-[#8a7a6a] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#d4a520]" />
                  升级条件
                </h4>
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
                      <div key={i} className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center text-[8px] ${
                            completed ? 'bg-[#5a8a5a]/30 border border-[#5a8a5a]/50' : 'bg-[#2a2318] border border-[#3d3225]'
                          }`}
                        >
                          {completed ? '✓' : ''}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs ${completed ? 'text-[#5a8a5a]' : 'text-[#a7c5ba]'}`}>
                              {cond.name}
                            </span>
                            <span className={`text-[10px] ${completed ? 'text-[#5a8a5a]' : 'text-[#8a7a6a]'}`}>
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

            {detail.abilities.length > 0 && (
              <div>
                <h4 className="text-xs text-[#8a7a6a] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#9EAD8A]" />
                  当前能力
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {detail.abilities.map((ability, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-lg bg-[#1a1510]/50 border border-[#3d3225]/30 flex items-start gap-2"
                    >
                      <span className="text-sm">{ability.icon || '⚡'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-[#c9b896] truncate">{ability.name}</div>
                        <div className="text-[10px] text-[#8a7a6a] leading-tight">{ability.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detail.rewards.length > 0 && (
              <div>
                <h4 className="text-xs text-[#8a7a6a] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#C9A063]" />
                  升级奖励
                </h4>
                <div className="flex flex-wrap gap-2">
                  {detail.rewards.map((reward, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#1a1510]/50 border border-[#3d3225]/30"
                    >
                      <span className="text-sm">{reward.icon || '🎁'}</span>
                      <span className="text-xs text-[#c9b896]">{reward.name}</span>
                      <span className="text-[10px] text-[#8a7a6a]">×{reward.value || 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="px-4 py-3 border-t border-[#3d3225]/30 bg-[#0d0b08]/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {LEVEL_RANKS.map((r, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center text-[10px] border"
                      style={{
                        backgroundColor: level >= r.minLevel ? `${r.color}25` : '#1a1510',
                        borderColor: level >= r.minLevel ? `${r.color}50` : '#3d3225',
                        color: level >= r.minLevel ? r.color : '#5c4d3a',
                      }}
                    >
                      {r.icon}
                    </div>
                    {i < LEVEL_RANKS.length - 1 && (
                      <div
                        className={`w-4 h-0.5 ${
                          level > r.maxLevel ? 'bg-[#5a8a5a]' : 'bg-[#3d3225]'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <span className="text-[10px] text-[#8a7a6a]">百家争鸣等级体系</span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default PlayerLevelBadge;
