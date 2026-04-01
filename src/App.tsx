import { useEffect, useRef, useState } from 'react';
import BattleFrameV2 from '@/components/BattleFrameV2';
import { BattleSetup } from '@/components/BattleSetup';
import { MainMenu, AppSettings, BrightnessOverlay } from '@/components/MainMenu';
import { TransitionScreen } from '@/components/TransitionScreen';
import { CharactersView } from '@/components/CharactersView';
import { CardShowcase } from '@/components/CardShowcase';
import { PreBattleFlow, PreBattleResult } from '@/components/PreBattleFlow';
import { GameErrorBoundary } from '@/components/GameErrorBoundary';
import { StoryScreen } from '@/ui/screens/StoryScreen';
import { ArenaId } from '@/battleV2/types';
import { uiAudio } from '@/utils/audioManager';
import { ThemeProvider } from '@/contexts/ThemeContext';

/**
 * App - 谋天下：问道百家 主入口
 *
 * 默认入口：旧初始界面主流程（主菜单链路）
 */

type LegacyScreen =
  | 'menu'
  | 'transition'
  | 'battle_setup'
  | 'pre_battle'
  | 'battle'
  | 'story'
  | 'collection'
  | 'characters';

const DEFAULT_SETTINGS: AppSettings = {
  masterVolume: 0.8,
  bgmVolume: 0.8,
  sfxVolume: 0.5,
  brightness: 1,
  fullscreen: false,
};

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
      console.error('[window:error]', event.message, event.error);
    };
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('[window:unhandledrejection]', event.reason);
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
      <AppMainContent
        settings={settings}
        onSettingsChange={(next) => setSettings((prev) => ({ ...prev, ...next }))}
        isElectronRuntime={isElectronRuntime}
      />
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
  const audioHallRef = useRef<HTMLAudioElement | null>(null);
  const audioBattleRef = useRef<HTMLAudioElement | null>(null);
  const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;

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

    // 映射 BGM 到当前屏幕
    if (
      screen === 'menu' ||
      screen === 'story' ||
      screen === 'characters' ||
      screen === 'collection' ||
      screen === 'battle_setup' ||
      screen === 'pre_battle'
    ) {
      audioBattleRef.current.pause();
      audioBattleRef.current.currentTime = 0;
      audioHallRef.current.play().catch(console.warn);
      return;
    }

    if (screen === 'transition') {
      audioHallRef.current.pause();
      return;
    }

    if (screen === 'battle') {
      audioHallRef.current.pause();
      audioHallRef.current.currentTime = 0;
      audioBattleRef.current.play().catch(console.warn);
    }
  }, [screen, isElectronRuntime]);

  const handleStartGame = () => setScreen('transition');

  const handleTransitionComplete = () => {
    setScreen('battle_setup');
  };

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

  const handleBackToMenu = () => {
    setBattleFadeIn(false);
    setPreBattleResult(null);
    setScreen('menu');
  };

  const handleReselectArena = () => {
    setBattleFadeIn(false);
    setPreBattleResult(null);
    setScreen('battle_setup');
  };

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

      {screen === 'transition' ? (
        <GameErrorBoundary
          key={`transition-${screenRecoveryKey}`}
          screenName="transition"
          onBackToMenu={handleBackToMenu}
          onRetry={retryCurrentScreen}
        >
          <TransitionScreen onComplete={handleTransitionComplete} />
        </GameErrorBoundary>
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
    </div>
  );
}

export default App;
