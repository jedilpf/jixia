import { useEffect, useRef, useState } from 'react';
import { BattleFrameV2 } from '@/components/BattleFrameV2';
import { BattleSetup } from '@/components/BattleSetup';
import { MainMenu, AppSettings, BrightnessOverlay } from '@/components/MainMenu';
import { TransitionScreen } from '@/components/TransitionScreen';
import { CharactersView } from '@/components/CharactersView';
import { CardShowcase } from '@/components/CardShowcase';
import { ArenaId } from '@/battleV2/types';
import { uiAudio } from '@/utils/audioManager';
import { ThemeProvider } from '@/contexts/ThemeContext';

type GameScreen = 'menu' | 'transition' | 'battle_setup' | 'battle' | 'collection' | 'characters';

function App() {
  const [hasStarted, setHasStarted] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [screen, setScreen] = useState<GameScreen>('menu');
  const [battleFadeIn, setBattleFadeIn] = useState(false);
  const [selectedArenaId, setSelectedArenaId] = useState<ArenaId>('jixia');
  const [battleSessionKey, setBattleSessionKey] = useState(1);

  const audioHallRef = useRef<HTMLAudioElement | null>(null);
  const audioBattleRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioHallRef.current = new Audio('assets/bgm-hall.mp3');
    audioHallRef.current.loop = true;

    audioBattleRef.current = new Audio('assets/bgm-battle.mp3');
    audioBattleRef.current.loop = true;

    return () => {
      audioHallRef.current?.pause();
      audioBattleRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (!audioHallRef.current || !audioBattleRef.current) return;
    if (!hasStarted && !isFadingOut) return;

    uiAudio.loadCustomSound('card-hover', '/assets/卡牌声音.mp3');

    if (screen === 'menu' || screen === 'characters' || screen === 'collection' || screen === 'battle_setup') {
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
  }, [screen, hasStarted, isFadingOut]);

  const [settings, setSettings] = useState<AppSettings>({
    masterVolume: 0.8,
    bgmVolume: 0.8,
    sfxVolume: 0.5,
    brightness: 1,
    fullscreen: false,
  });

  const handleSettingsChange = (next: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...next }));
  };

  useEffect(() => {
    if (settings.fullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((error) => console.log('Fullscreen failed', error));
    } else if (!settings.fullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    uiAudio.init();
    uiAudio.loadCustomSound('card-hover', '/assets/卡牌声音.mp3');
  }, [settings.fullscreen]);

  useEffect(() => {
    const bgmVolume = settings.masterVolume * settings.bgmVolume;
    const sfxVolume = settings.masterVolume * settings.sfxVolume;

    if (audioHallRef.current) audioHallRef.current.volume = bgmVolume;
    if (audioBattleRef.current) audioBattleRef.current.volume = bgmVolume;
    uiAudio.setVolume(sfxVolume);
  }, [settings.masterVolume, settings.bgmVolume, settings.sfxVolume]);

  const handleStartGame = () => setScreen('transition');

  const handleTransitionComplete = () => {
    setScreen('battle_setup');
  };

  const handleStartBattle = () => {
    setBattleFadeIn(true);
    setBattleSessionKey((k) => k + 1);
    setScreen('battle');
    setTimeout(() => setBattleFadeIn(false), 50);
  };

  const handleCollection = () => setScreen('collection');
  const handleCharacters = () => setScreen('characters');

  const handleBackToMenu = () => {
    setBattleFadeIn(false);
    setScreen('menu');
  };

  const handleReselectArena = () => {
    setBattleFadeIn(false);
    setScreen('battle_setup');
  };

  if (!hasStarted) {
    return (
      <div
        className={`fixed inset-0 z-[9999] flex cursor-pointer select-none flex-col items-center justify-center bg-black text-[#d4a520] transition-opacity duration-1000 ease-in-out ${
          isFadingOut ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
        onClick={() => {
          if (isFadingOut) return;
          setIsFadingOut(true);
          setTimeout(() => setHasStarted(true), 1000);
        }}
      >
        <div className="mb-8 animate-pulse font-serif text-4xl tracking-[0.3em] drop-shadow-[0_0_20px_rgba(212,165,32,0.8)]">
          谋天下：问道百家
        </div>
        <div className="rounded border border-[#d4a520]/50 bg-[#d4a520]/5 px-10 py-4 text-xl font-light tracking-[0.5em] opacity-90 transition-colors hover:bg-[#d4a520]/10">
          点击进入游戏
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="relative h-dvh w-full select-none overflow-hidden bg-theme-background text-theme-text">
        <BrightnessOverlay brightness={settings.brightness} />

      {screen === 'menu' ? (
        <MainMenu
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onStartGame={handleStartGame}
          onCollection={handleCollection}
          onCharacters={handleCharacters}
        />
      ) : null}

      {screen === 'transition' ? <TransitionScreen onComplete={handleTransitionComplete} /> : null}

      {screen === 'battle_setup' ? (
        <BattleSetup
          selectedArenaId={selectedArenaId}
          onSelectArena={setSelectedArenaId}
          onStartBattle={handleStartBattle}
          onBackMenu={handleBackToMenu}
        />
      ) : null}

      {screen === 'battle' ? (
        <div className="relative h-full w-full">
          <BattleFrameV2
            key={battleSessionKey}
            arenaId={selectedArenaId}
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
      ) : null}

      {screen === 'collection' ? <CardShowcase onBack={handleBackToMenu} /> : null}

      {screen === 'characters' ? <CharactersView onBack={handleBackToMenu} /> : null}
      </div>
    </ThemeProvider>
  );
}

export default App;
