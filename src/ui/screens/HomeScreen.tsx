import { useState } from 'react';
import { PRE_BATTLE_BACKGROUND, PRE_BATTLE_COLORS, asset } from '@/ui/screens/visualAssets';
import { LevelDetailModal } from '@/ui/components/LevelDetailModal';
import { PlayerLevelBadge } from '@/ui/components/PlayerLevelBadge';
import { PlayerStatsPanel } from '@/ui/components/PlayerStatsPanel';

interface HomeScreenProps {
  onStart: () => void;
  onStoryMode?: () => void;
  progress: {
    level: number;
    exp: number;
    winCount: number;
    totalGames: number;
    winStreak: number;
    totalDamage: number;
    collectedCards: number;
    totalCards: number;
    opportunity: number;
  };
}

export function HomeScreen({ onStart, onStoryMode, progress }: HomeScreenProps) {
  const [showLevelDetail, setShowLevelDetail] = useState(false);
  const [showStats, setShowStats] = useState(false);

  return (
    <div
      className="relative flex h-full items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(125deg, rgba(10,7,5,0.78), rgba(34,18,10,0.7)), url(${PRE_BATTLE_BACKGROUND})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(190,118,63,0.18),transparent_42%),radial-gradient(circle_at_78%_72%,rgba(140,78,42,0.2),transparent_42%)]" />

      <div className="absolute left-6 top-6 z-30 flex max-w-[460px] flex-col gap-3">
        <div
          className="rounded-xl border p-3"
          style={{ borderColor: 'rgba(184,136,84,0.45)', background: 'rgba(15,10,7,0.72)' }}
        >
          <div className="flex items-start justify-between gap-3">
            <PlayerLevelBadge
              compact
              level={progress.level}
              exp={progress.exp}
              playerStats={{
                winCount: progress.winCount,
                totalGames: progress.totalGames,
                totalDamage: progress.totalDamage,
                winStreak: progress.winStreak,
                collectedCards: progress.collectedCards,
              }}
            />
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-lg border px-3 py-1.5 text-xs transition"
                style={{ borderColor: '#7a5a34', color: '#f3debc', background: 'rgba(33,24,17,0.8)' }}
                onClick={() => setShowLevelDetail(true)}
              >
                等级详情
              </button>
              <button
                type="button"
                className="rounded-lg border px-3 py-1.5 text-xs transition"
                style={{ borderColor: '#7a5a34', color: '#f3debc', background: 'rgba(33,24,17,0.8)' }}
                onClick={() => setShowStats(true)}
              >
                我的战绩
              </button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div
              className="rounded border p-2"
              style={{ borderColor: 'rgba(184,136,84,0.35)', background: 'rgba(18,13,10,0.5)' }}
            >
              <div className="text-[#bca47f]">当前机遇</div>
              <div className="mt-1 text-lg font-semibold text-[#f3debc]">{progress.opportunity}</div>
            </div>
            <div
              className="rounded border p-2"
              style={{ borderColor: 'rgba(184,136,84,0.35)', background: 'rgba(18,13,10,0.5)' }}
            >
              <div className="text-[#bca47f]">大势转化规则</div>
              <div className="mt-1 text-sm font-semibold text-[#f3debc]">每 1 点大势 = 1 点机遇</div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="relative flex w-[880px] items-stretch gap-4 rounded-2xl border p-6"
        style={{ borderColor: PRE_BATTLE_COLORS.border, background: PRE_BATTLE_COLORS.panel }}
      >
        <div
          className="flex-1 rounded-xl border p-6"
          style={{ borderColor: 'rgba(184,136,84,0.45)', background: PRE_BATTLE_COLORS.panelSoft }}
        >
          <h1 className="text-4xl font-bold tracking-[0.08em]" style={{ color: PRE_BATTLE_COLORS.textMain }}>
            百家争鸣
          </h1>
          <p className="mt-3 text-sm" style={{ color: PRE_BATTLE_COLORS.textMuted }}>
            明辩暗辩 · 议题争夺 · 门派对战
          </p>
          <p className="mt-8 text-sm leading-7" style={{ color: '#d4bf99' }}>
            围绕中央议题，在主议与旁议中提交牌组组合。每 3 轮将触发一次议题引爆判定，争夺方向优势与大势胜机。
          </p>
          <button
            type="button"
            className="mt-10 rounded-lg border px-8 py-3 text-base font-semibold transition"
            style={{
              borderColor: '#b88a53',
              background: PRE_BATTLE_COLORS.button,
              color: '#f6e4c3',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = PRE_BATTLE_COLORS.buttonHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = PRE_BATTLE_COLORS.button;
            }}
            onClick={onStart}
          >
            开始对战
          </button>
          {onStoryMode && (
            <button
              type="button"
              className="mt-4 w-full rounded-lg border px-6 py-3 text-sm font-semibold transition"
              style={{
                borderColor: 'rgba(139,115,85,0.6)',
                background: 'rgba(26,26,46,0.8)',
                color: '#D4C5A9',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#E85D04';
                e.currentTarget.style.color = '#E85D04';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(139,115,85,0.6)';
                e.currentTarget.style.color = '#D4C5A9';
              }}
              onClick={onStoryMode}
            >
              📜 争鸣史
            </button>
          )}
        </div>

        <div
          className="relative w-[300px] overflow-hidden rounded-xl border"
          style={{ borderColor: 'rgba(184,136,84,0.45)' }}
        >
          <img src={asset('/assets/chars/stand/sunwu.png')} alt="门派立绘" className="h-full w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-3 text-xs" style={{ color: '#e6d0aa' }}>
            天下纷争，百家争鸣
          </div>
        </div>
      </div>

      {showLevelDetail ? (
        <LevelDetailModal
          level={progress.level}
          exp={progress.exp}
          playerStats={{
            winCount: progress.winCount,
            totalGames: progress.totalGames,
            totalDamage: progress.totalDamage,
            winStreak: progress.winStreak,
            collectedCards: progress.collectedCards,
          }}
          onClose={() => setShowLevelDetail(false)}
        />
      ) : null}

      {showStats ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <PlayerStatsPanel
            playerName="游学者"
            stats={{
              level: progress.level,
              exp: progress.exp,
              winCount: progress.winCount,
              totalGames: progress.totalGames,
              winStreak: progress.winStreak,
              totalDamage: progress.totalDamage,
              cardCollection: progress.collectedCards,
              totalCards: progress.totalCards,
            }}
            onClose={() => setShowStats(false)}
          />
        </div>
      ) : null}
    </div>
  );
}
