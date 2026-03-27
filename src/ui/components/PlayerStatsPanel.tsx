import React, { useMemo } from 'react';
import { getLevelTitle, getLevelIcon, getLevelColor } from '@/config/levelSystem';

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

interface PlayerStatsPanelProps {
  playerName: string;
  stats: PlayerStats;
  onClose?: () => void;
}

export const PlayerStatsPanel: React.FC<PlayerStatsPanelProps> = ({
  playerName,
  stats,
  onClose,
}) => {
  const levelColor = getLevelColor(stats.level);
  const levelTitle = getLevelTitle(stats.level);
  const levelIcon = getLevelIcon(stats.level);

  const winRate = useMemo(() => {
    if (stats.totalGames === 0) return 0;
    return Math.round((stats.winCount / stats.totalGames) * 100);
  }, [stats.winCount, stats.totalGames]);

  const statCards = useMemo(() => [
    {
      label: '本周战绩',
      value: `${stats.winCount}胜/${stats.totalGames - stats.winCount}负`,
      icon: '⚔️',
      color: '#5a8a5a',
    },
    {
      label: '胜率',
      value: `${winRate}%`,
      icon: '📊',
      color: winRate >= 60 ? '#5a8a5a' : winRate >= 40 ? '#C9A063' : '#c9725a',
    },
    {
      label: '连胜',
      value: `🔥${stats.winStreak}`,
      icon: stats.winStreak >= 3 ? '🔥' : '✨',
      color: stats.winStreak >= 5 ? '#c9952a' : stats.winStreak >= 3 ? '#C06F6F' : '#8a7a6a',
    },
    {
      label: '累计伤害',
      value: `${stats.totalDamage.toLocaleString()}`,
      icon: '💥',
      color: '#9C88A8',
    },
  ], [stats, winRate]);

  return (
    <div
      className="relative w-full max-w-md mx-auto rounded-2xl border overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(26,18,12,0.98) 0%, rgba(39,28,18,0.95) 100%)',
        borderColor: `${levelColor}40`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 24px ${levelColor}15`,
      }}
    >
      <div
        className="h-2"
        style={{
          background: `linear-gradient(90deg, ${levelColor}80, ${levelColor}40, transparent)`,
        }}
      />

      <div className="p-5">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl border-2"
              style={{
                background: `${levelColor}15`,
                borderColor: `${levelColor}60`,
                boxShadow: `0 0 16px ${levelColor}30`,
              }}
            >
              {levelIcon}
            </div>
            <div>
              <div className="text-lg font-bold text-[#c9b896]">{playerName}</div>
              <div
                className="flex items-center gap-2 mt-1 px-2 py-0.5 rounded text-sm"
                style={{
                  background: `${levelColor}20`,
                  color: levelColor,
                  border: `1px solid ${levelColor}40`,
                }}
              >
                <span>Lv.{stats.level}</span>
                <span className="text-[#8a7a6a]">·</span>
                <span>{levelTitle}</span>
              </div>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[#2a2318]/80 border border-[#5c4d3a]/50 flex items-center justify-center text-[#8a7a6a] hover:text-[#c9b896] hover:bg-[#3d3225] transition-all"
            >
              ✕
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="p-3 rounded-xl border"
              style={{
                background: `${stat.color}10`,
                borderColor: `${stat.color}30`,
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{stat.icon}</span>
                <span className="text-xs text-[#8a7a6a]">{stat.label}</span>
              </div>
              <div
                className="text-xl font-bold"
                style={{ color: stat.color }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div
            className="flex items-center justify-between p-3 rounded-xl border"
            style={{
              background: 'rgba(26,18,12,0.5)',
              borderColor: 'rgba(92,77,58,0.3)',
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">📚</span>
              <span className="text-sm text-[#c9b896]">卡牌收集</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-[#8a7a6a]">
                {stats.cardCollection}/{stats.totalCards}
              </div>
              <div
                className="w-24 h-2 rounded-full bg-[#1a1510] overflow-hidden"
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${stats.totalCards > 0 ? (stats.cardCollection / stats.totalCards) * 100 : 0}%`,
                    background: `linear-gradient(90deg, #9EAD8A, #C9A063)`,
                  }}
                />
              </div>
            </div>
          </div>

          <div
            className="flex items-center justify-between p-3 rounded-xl border"
            style={{
              background: 'rgba(26,18,12,0.5)',
              borderColor: 'rgba(92,77,58,0.3)',
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">📈</span>
              <span className="text-sm text-[#c9b896]">经验进度</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-[#8a7a6a]">
                {stats.exp}/{(stats.level + 1) * 100}
              </div>
              <div
                className="w-24 h-2 rounded-full bg-[#1a1510] overflow-hidden"
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (stats.exp / ((stats.level + 1) * 100)) * 100)}%`,
                    background: `linear-gradient(90deg, ${levelColor}80, ${levelColor})`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          className="mt-4 pt-4 border-t"
          style={{ borderColor: 'rgba(92,77,58,0.3)' }}
        >
          <div className="flex items-center justify-center gap-4">
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: `${levelColor}20`,
                color: levelColor,
                border: `1px solid ${levelColor}40`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${levelColor}30`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `${levelColor}20`;
              }}
            >
              查看详情
            </button>
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[#2a2318] text-[#c9b896] border border-[#5c4d3a]/50 hover:bg-[#3d3225] transition-all"
            >
              更换外观
            </button>
          </div>
        </div>
      </div>

      <div
        className="h-1"
        style={{
          background: `linear-gradient(90deg, transparent, ${levelColor}40, transparent)`,
        }}
      />
    </div>
  );
};

export default PlayerStatsPanel;
