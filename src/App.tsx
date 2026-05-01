import { useCallback, useEffect, useRef, useState } from 'react';
import BattleFrameV2 from '@/components/BattleFrameV2';
import { BattleSetup } from '@/components/BattleSetup';
import { MainMenu, AppSettings, BrightnessOverlay } from '@/components/MainMenu';
import { CharactersView } from '@/components/CharactersView';
import { CardShowcase } from '@/components/CardShowcase';
import { PreBattleFlow, PreBattleResult } from '@/components/PreBattleFlow';
import { GameErrorBoundary } from '@/components/GameErrorBoundary';
import { StoryScreen } from '@/ui/screens/StoryScreen';
import { ResultScreenV2 } from '@/ui/screens/ResultScreenV2';
import { ArenaId } from '@/battleV2/types';
import type { GameState } from '@/core/types';
import { uiAudio } from '@/utils/audioManager';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { CommunityProvider } from '@/hooks/useCommunityState';
import { AppStoreProvider } from '@/app/store';
import { LanguageProvider } from '@/contexts/LanguageContext';

/**
 * App - 谋天下：问道百家 主入口
 *
 * 默认入口：旧初始界面主流程（主菜单链路）
 */

type LegacyScreen =
  | 'menu'
  | 'battle_setup'
  | 'pre_battle'
  | 'battle'
  | 'settlement'
  | 'characters'
  | 'story'
  | 'collection';

const DEFAULT_SETTINGS: AppSettings = {
  masterVolume: 0.8,
  bgmVolume: 0.8,
  sfxVolume: 0.5,
  brightness: 1,
  fullscreen: false,
  language: 'zh',
};

const HALL_BGM_SCREENS: ReadonlyArray<LegacyScreen> = [
  'menu',
  'story',
  'characters',
  'collection',
  'battle_setup',
  'pre_battle',
  'settlement',
];

const MENU_RETURN_COVER_MS = 180;
const MENU_RETURN_REVEAL_MS = 260;

function App() {
  const isElectronRuntime =
    typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes(' electron/');

  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;

  useEffect(() => {
    if (isElectronRuntime) return;
    if (settings.fullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((error) => console.log('Fullscreen failed', error));
    } else if (!settings.fullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    uiAudio.init();
    uiAudio.loadCustomSound('card-hover', asset('assets/卡牌声音.mp3'));
  }, [settings.fullscreen, isElectronRuntime]);

  useEffect(() => {
    const handleWindowError = (event: ErrorEvent) => {
      console.error('window_error', event.message, event.error);
    };
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('window_unhandledrejection', event.reason);
    };
    window.addEventListener('error', handleWindowError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('error', handleWindowError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppStoreProvider>
          <CommunityProvider>
            <AppMainContent
              settings={settings}
              onSettingsChange={(next) => setSettings((prev) => ({ ...prev, ...next }))}
              isElectronRuntime={isElectronRuntime}
            />
          </CommunityProvider>
        </AppStoreProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

function AppMainContent({
  settings,
  onSettingsChange,
  isElectronRuntime,
}: {
  settings: AppSettings;
  onSettingsChange: (next: Partial<AppSettings>) => void;
  isElectronRuntime: boolean;
}) {
  const [screen, setScreen] = useState<LegacyScreen>('menu');
  const [battleFadeIn, setBattleFadeIn] = useState(false);
  const [selectedArenaId, setSelectedArenaId] = useState<ArenaId>('jixia');
  const [battleSessionKey, setBattleSessionKey] = useState(1);
  const [preBattleResult, setPreBattleResult] = useState<PreBattleResult | null>(null);
  const [screenRecoveryKey, setScreenRecoveryKey] = useState(0);
  const [menuReturnPhase, setMenuReturnPhase] = useState<'hidden' | 'cover' | 'reveal'>('hidden');
  // 结算界面状态
  const [settlementState, setSettlementState] = useState<{
    gameState: GameState;
    progress: {
      level: number;
      exp: number;
      opportunity: number;
      winCount: number;
      totalGames: number;
    };
    settlement: {
      settlementKey: string;
      playerMomentum: number;
      opportunityGain: number;
      expGain: number;
      goldGain: number;
      won: boolean;
    } | null;
  } | null>(null);
  const audioHallRef = useRef<HTMLAudioElement | null>(null);
  const audioBattleRef = useRef<HTMLAudioElement | null>(null);
  const menuReturnTimersRef = useRef<number[]>([]);
  const menuReturnBusyRef = useRef(false);
  const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;

  const clearMenuReturnTimers = useCallback(() => {
    for (const timer of menuReturnTimersRef.current) {
      window.clearTimeout(timer);
    }
    menuReturnTimersRef.current = [];
  }, []);

  useEffect(() => {
    if (isElectronRuntime) return;
    audioHallRef.current = new Audio(asset('assets/bgm-hall.mp3'));
    audioHallRef.current.loop = true;
    audioBattleRef.current = new Audio(asset('assets/bgm-battle.mp3'));
    audioBattleRef.current.loop = true;

    return () => {
      audioHallRef.current?.pause();
      audioBattleRef.current?.pause();
    };
  }, [isElectronRuntime]);

  useEffect(() => {
    return () => {
      clearMenuReturnTimers();
    };
  }, [clearMenuReturnTimers]);

  useEffect(() => {
    if (isElectronRuntime) return;
    const bgmVolume = settings.masterVolume * settings.bgmVolume;
    const sfxVolume = settings.masterVolume * settings.sfxVolume;

    if (audioHallRef.current) audioHallRef.current.volume = bgmVolume;
    if (audioBattleRef.current) audioBattleRef.current.volume = bgmVolume;
    uiAudio.setVolume(sfxVolume);
  }, [settings.masterVolume, settings.bgmVolume, settings.sfxVolume, isElectronRuntime]);

  useEffect(() => {
    if (isElectronRuntime) return;
    if (!audioHallRef.current || !audioBattleRef.current) return;

    // 主链路大厅/菜单相关屏幕统一走 Hall BGM，避免入口扩展时漏配。
    if (HALL_BGM_SCREENS.includes(screen)) {
      audioBattleRef.current.pause();
      audioBattleRef.current.currentTime = 0;
      audioHallRef.current.play().catch(console.warn);
      return;
    }

    if (screen === 'battle') {
      audioHallRef.current.pause();
      audioHallRef.current.currentTime = 0;
      audioBattleRef.current.play().catch(console.warn);
    }
  }, [screen, isElectronRuntime]);

  const handleStartGame = () => setScreen('battle_setup');

  const handleStartBattle = () => {
    setPreBattleResult(null);
    setBattleFadeIn(false);
    setScreen('pre_battle');
  };

  const handlePreBattleComplete = (result: PreBattleResult) => {
    setPreBattleResult(result);
    setBattleFadeIn(true);
    setBattleSessionKey((key) => key + 1);
    setScreen('battle');
    setTimeout(() => setBattleFadeIn(false), 50);
  };

  const runReturnToMenuTransition = useCallback((beforeSwitch?: () => void) => {
    if (menuReturnBusyRef.current) return;
    menuReturnBusyRef.current = true;
    clearMenuReturnTimers();
    setMenuReturnPhase('cover');

    const switchTimer = window.setTimeout(() => {
      beforeSwitch?.();
      setScreen('menu');
      setMenuReturnPhase('reveal');

      const finishTimer = window.setTimeout(() => {
        setMenuReturnPhase('hidden');
        menuReturnBusyRef.current = false;
      }, MENU_RETURN_REVEAL_MS);

      menuReturnTimersRef.current.push(finishTimer);
    }, MENU_RETURN_COVER_MS);

    menuReturnTimersRef.current.push(switchTimer);
  }, [clearMenuReturnTimers]);

  const handleBackToMenu = useCallback(() => {
    runReturnToMenuTransition(() => {
      setBattleFadeIn(false);
      setPreBattleResult(null);
    });
  }, [runReturnToMenuTransition]);

  const handleReselectArena = () => {
    setBattleFadeIn(false);
    setPreBattleResult(null);
    setScreen('battle_setup');
  };

  // 战斗结束，显示结算界面
  const handleBattleEnd = useCallback((result: {
    gameState: GameState;
    progress: {
      level: number;
      exp: number;
      opportunity: number;
      winCount: number;
      totalGames: number;
    };
    settlement: {
      settlementKey: string;
      playerMomentum: number;
      opportunityGain: number;
      expGain: number;
      goldGain: number;
      won: boolean;
    } | null;
  }) => {
    setSettlementState(result);
    setScreen('settlement');
  }, []);

  // 结算界面返回主页
  const handleSettlementRestart = useCallback(() => {
    setSettlementState(null);
    setBattleFadeIn(false);
    setPreBattleResult(null);
    setBattleSessionKey((key) => key + 1);
    setScreen('menu');
  }, []);

  const retryCurrentScreen = () => {
    setScreenRecoveryKey((key) => key + 1);
  };

  return (
    <div className="relative h-dvh w-full select-none overflow-hidden bg-theme-background text-theme-text">
      <BrightnessOverlay brightness={settings.brightness} />

      {screen === 'menu' ? (
        <MainMenu
          settings={settings}
          onSettingsChange={onSettingsChange}
          onStartGame={handleStartGame}
           onStory={() => setScreen('story')}
           onCollection={() => setScreen('collection')}
           onCharacters={() => setScreen('characters')}
         />
      ) : null}

      {screen === 'battle_setup' ? (
        <GameErrorBoundary
          key={`battle-setup-${screenRecoveryKey}`}
          screenName="battle_setup"
          onBackToMenu={handleBackToMenu}
          onRetry={retryCurrentScreen}
        >
          <BattleSetup
            selectedArenaId={selectedArenaId}
            onSelectArena={setSelectedArenaId}
            onStartBattle={handleStartBattle}
            onBackMenu={handleBackToMenu}
          />
        </GameErrorBoundary>
      ) : null}

      {screen === 'pre_battle' ? (
        <GameErrorBoundary
          key={`pre-battle-${screenRecoveryKey}`}
          screenName="pre_battle"
          onBackToMenu={handleBackToMenu}
          onRetry={retryCurrentScreen}
        >
          <PreBattleFlow
            arenaId={selectedArenaId}
            onCancel={handleReselectArena}
            onComplete={handlePreBattleComplete}
          />
        </GameErrorBoundary>
      ) : null}

      {screen === 'battle' ? (
        <GameErrorBoundary
          key={`battle-${battleSessionKey}-${screenRecoveryKey}`}
          screenName="battle"
          onBackToMenu={handleBackToMenu}
          onRetry={retryCurrentScreen}
        >
          <div className="relative h-full w-full">
            <BattleFrameV2
              key={battleSessionKey}
              arenaId={selectedArenaId}
              forcedTopicId={preBattleResult?.topicId}
              playerMainFaction={preBattleResult?.playerFaction}
              enemyMainFaction={preBattleResult?.enemyFaction}
              onMenu={handleBackToMenu}
              onReselectArena={handleReselectArena}
              onFinished={(winnerId) => {
                // 模拟结算数据，实际应从战斗系统获取
                handleBattleEnd({
                  gameState: {
                    winnerId: winnerId as 'player' | 'enemy' | 'draw',
                    players: {
                      player: { momentum: 85 },
                      enemy: { momentum: 42 },
                    },
                  } as GameState,
                  progress: {
                    level: 12,
                    exp: 2450,
                    opportunity: 3,
                    winCount: winnerId === 'player' ? 15 : 14,
                    totalGames: 20,
                  },
                  settlement: winnerId === 'player' ? {
                    settlementKey: `battle-${Date.now()}`,
                    playerMomentum: 85,
                    opportunityGain: 1,
                    expGain: 120,
                    goldGain: 50,
                    won: true,
                  } : null,
                });
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background: '#000',
                opacity: battleFadeIn ? 1 : 0,
                transition: battleFadeIn ? 'none' : 'opacity 0.8s ease-out',
                zIndex: 100,
              }}
            />
          </div>
        </GameErrorBoundary>
      ) : null}

      {screen === 'settlement' && settlementState ? (
        <GameErrorBoundary
          key={`settlement-${screenRecoveryKey}`}
          screenName="settlement"
          onBackToMenu={handleBackToMenu}
          onRetry={retryCurrentScreen}
        >
          <ResultScreenV2
            state={settlementState.gameState}
            progress={settlementState.progress}
            settlement={settlementState.settlement}
            onRestart={handleSettlementRestart}
          />
        </GameErrorBoundary>
      ) : null}

      {screen === 'story' ? (
        <GameErrorBoundary
          key={`story-${screenRecoveryKey}`}
          screenName="story"
          onBackToMenu={handleBackToMenu}
          onRetry={retryCurrentScreen}
        >
          <StoryScreen onBack={handleBackToMenu} />
        </GameErrorBoundary>
      ) : null}

      {screen === 'collection' ? <CardShowcase onBack={handleBackToMenu} /> : null}
      {screen === 'characters' ? <CharactersView onBack={handleBackToMenu} /> : null}

      {menuReturnPhase !== 'hidden' ? (
        <div
          className="pointer-events-none absolute inset-0 z-[120]"
          style={{
            background:
              'radial-gradient(circle at center, rgba(212,165,32,0.12) 0%, rgba(18,12,6,0.78) 42%, rgba(0,0,0,0.92) 100%)',
            opacity: menuReturnPhase === 'cover' ? 1 : 0,
            transition: `opacity ${menuReturnPhase === 'cover' ? MENU_RETURN_COVER_MS : MENU_RETURN_REVEAL_MS}ms ease`,
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(74,124,111,0.08) 0%, transparent 30%, transparent 70%, rgba(212,165,32,0.08) 100%)',
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

export default App;
