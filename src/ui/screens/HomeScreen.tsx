import { useState } from 'react';
import { asset } from '@/ui/screens/visualAssets';
import { LevelDetailModal } from '@/ui/components/LevelDetailModal';
import { PlayerLevelBadge } from '@/ui/components/PlayerLevelBadge';
import { PlayerStatsPanelV2 } from '@/ui/components/PlayerStatsPanelV2';
import { RedDot } from '@/ui/components/RedDot';

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
    <div className="relative flex h-full items-center justify-center overflow-hidden bg-[#FDFBF7] text-[#1A1A1A]">
      {/* 矿物辉光背景与绢帛纹理 */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,rgba(58,95,65,0.06),transparent_40%),radial-gradient(circle_at_85%_75%,rgba(141,47,47,0.06),transparent_40%)]" />
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/handmade-paper.png")' }} />

      {/* 左上角：学说造诣（原等级信息） */}
      <div className="absolute left-10 top-10 z-30 flex flex-col gap-4">
        <div className="rounded-2xl border-2 border-[#B8A48D]/30 bg-white/60 p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between gap-6 pb-4 border-b border-[#B8A48D]/20">
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
            <div className="flex flex-col gap-2">
              <button
                type="button"
                className="whitespace-nowrap px-4 py-1.5 text-xs font-bold text-[#3A5F41] border border-[#3A5F41]/30 rounded-md bg-[#EBF5EE] hover:bg-[#3A5F41] hover:text-white transition-all"
                onClick={() => setShowLevelDetail(true)}
              >
                学说造诣
              </button>
              <button
                type="button"
                className="whitespace-nowrap px-4 py-1.5 text-xs font-bold text-[#8D2F2F] border border-[#8D2F2F]/30 rounded-md bg-[#F5E6E6] hover:bg-[#8D2F2F] hover:text-white transition-all"
                onClick={() => setShowStats(true)}
              >
                名士战绩
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="p-3 bg-[#FDFBF7] border border-[#B8A48D]/20 rounded-lg">
              <div className="text-[10px] uppercase tracking-widest text-[#5C4033]/50">Current Opportunity</div>
              <div className="mt-1 text-2xl font-black text-[#1A1A1A]">{progress.opportunity}</div>
            </div>
            <div className="p-3 bg-[#FDFBF7] border border-[#B8A48D]/20 rounded-lg">
              <div className="text-[10px] uppercase tracking-widest text-[#5C4033]/50">World Sentiment</div>
              <div className="mt-1 text-sm font-bold text-[#3A5F41]">大势一引·机遇即呈</div>
            </div>
          </div>
        </div>
      </div>

      {/* 中心内容区：漆艺中轴布局 */}
      <div className="relative z-10 flex w-full max-w-6xl items-stretch gap-8 px-10">
        <div className="flex-1 flex flex-col justify-center">
          <div className="mb-4 flex items-center gap-4">
            <div className="h-0.5 w-12 bg-[#3A5F41]" />
            <span className="text-sm font-black tracking-[0.3em] text-[#3A5F41] uppercase">Asking the Tao</span>
          </div>
          
          <h1 className="text-7xl font-black tracking-[0.1em] text-[#1A1A1A] leading-tight">
            问道<span className="text-[#3A5F41]">百家</span>
          </h1>
          
          <div className="mt-8 flex flex-col gap-6 max-w-lg">
            <p className="text-lg leading-relaxed text-[#5C4033] font-medium opacity-80">
              围席而坐，笔墨齐发。于主议旁辩之间，夺天下大势。
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <button
                onClick={onStart}
                className="group flex flex-col items-center justify-center h-32 rounded-2xl bg-[#1A1A1A] text-white transition-all hover:bg-[#3A5F41] shadow-2xl hover:-translate-y-2"
              >
                <span className="text-2xl font-black tracking-widest">入局争鸣</span>
                <span className="mt-2 text-[10px] opacity-40 uppercase tracking-tighter">Enter the Contention</span>
              </button>
              
              {onStoryMode && (
                <button
                  onClick={onStoryMode}
                  className="group relative flex flex-col items-center justify-center h-32 rounded-2xl bg-white border-2 border-[#1A1A1A]/10 transition-all hover:border-[#8D2F2F]/40 hover:bg-[#F5E6E6]/30 hover:-translate-y-2"
                >
                  <span className="text-2xl font-black tracking-widest text-[#1A1A1A]">争鸣史</span>
                  <span className="mt-2 text-[10px] text-[#5C4033]/50 uppercase tracking-tighter">Story Chronicles</span>
                  <RedDot className="absolute right-4 top-4" pulse />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 侧边名士鉴赏 */}
        <div className="relative w-[400px] overflow-hidden rounded-[2.5rem] border-8 border-white bg-[#FDFBF7] shadow-[0_45px_70px_rgba(0,0,0,0.15)] transition-transform duration-700 hover:scale-[1.02]">
          <img 
            src={asset('/assets/chars/stand/sunwu.png')} 
            alt="兵家名士·孙武" 
            className="h-full w-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/60 via-transparent to-transparent" />
          <div className="absolute bottom-10 left-10 text-white">
            <div className="text-xs font-bold tracking-[0.3em] opacity-80 uppercase">Faction Master</div>
            <div className="text-3xl font-black tracking-widest mt-1">兵家 · 孙武</div>
          </div>
        </div>
      </div>

      {/* 背景装饰：流云与印章 */}
      <div className="absolute bottom-10 right-10 flex items-center gap-6 opacity-30">
        <div className="text-right">
          <div className="text-[10px] font-bold tracking-[0.2em]">Alpha Version 1.0.0</div>
          <div className="text-[9px] tracking-widest uppercase">Jixia Academy · 2026</div>
        </div>
        <div className="w-12 h-12 border-2 border-[#8D2F2F] rounded-md flex items-center justify-center">
          <span className="text-[#8D2F2F] font-black text-xl">稷</span>
        </div>
      </div>

      {/* 弹窗逻辑保持不变 */}
      {showLevelDetail && (
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
      )}

      {showStats && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-md animate-fade-in">
          <PlayerStatsPanelV2
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
      )}
    </div>
  );
}
