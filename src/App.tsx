import { useEffect, useRef, useState } from 'react';
import { AppSettings, BrightnessOverlay } from '@/components/MainMenu';
import { AppStoreProvider, useAppStore } from '@/app/store';
import { MvpFlowShell } from '@/ui/screens/MvpFlowShell';
import { uiAudio } from '@/utils/audioManager';
import { ThemeProvider } from '@/contexts/ThemeContext';

/**
 * App - 谋天下：问道百家 主入口
 * 
 * 经过 Phase 1 改造，移除了多引擎并存的路由逻辑。
 * 统一采用 MvpFlowShell 作为主流程容器。
 */

function App() {
  const isElectronRuntime =
    typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes(' electron/');
  
  const [hasStarted, setHasStarted] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [settings] = useState<AppSettings>({
    masterVolume: 0.8,
    bgmVolume: 0.8,
    sfxVolume: 0.5,
    brightness: 1,
    fullscreen: false,
  });



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

  const handleEnterFromSplash = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    // 开始运行 BGM
    setTimeout(() => setHasStarted(true), 1000);
  };

  if (!hasStarted) {
    return (
      <div
        className={`fixed inset-0 z-[9999] flex cursor-pointer select-none flex-col items-center justify-center bg-black text-[#d4a520] transition-opacity duration-1000 ease-in-out ${
          isFadingOut ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
        onClick={handleEnterFromSplash}
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
      <AppStoreProvider>
        <AppMainContent 
          settings={settings} 
          isElectronRuntime={isElectronRuntime}
        />
      </AppStoreProvider>
    </ThemeProvider>
  );
}

function AppMainContent({ 
  settings, 
  isElectronRuntime 
}: { 
  settings: AppSettings; 
  isElectronRuntime: boolean;
}) {
  const { state } = useAppStore();
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

    const screen = state.screen;

    // 映射 BGM 到当前屏幕
    if (
      screen === 'home' ||
      screen === 'match' ||
      screen === 'topic_preview' ||
      screen === 'faction_pick'
    ) {
      audioBattleRef.current.pause();
      audioBattleRef.current.currentTime = 0;
      audioHallRef.current.play().catch(console.warn);
      return;
    }

    if (screen === 'loading') {
      audioHallRef.current.pause();
      return;
    }

    if (screen === 'battle') {
      audioHallRef.current.pause();
      audioHallRef.current.currentTime = 0;
      audioBattleRef.current.play().catch(console.warn);
    }
  }, [state.screen, isElectronRuntime]);

  return (
    <div className="relative h-dvh w-full select-none overflow-hidden bg-[#0f0d0a] text-[#f0ddbb]">
      <BrightnessOverlay brightness={settings.brightness} />
      <MvpFlowShell />
    </div>
  );
}

export default App;
