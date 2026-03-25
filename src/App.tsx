import { useEffect } from 'react';
import { AppStoreProvider } from '@/app/store';
import { MvpFlowShell } from '@/ui/screens/MvpFlowShell';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { uiAudio } from '@/utils/audioManager';
import { getAudioAssetUrl } from '@/utils/assets';

const DEFAULT_SFX_VOLUME = 0.5;

function App() {
  useEffect(() => {
    const bootstrapAudio = () => {
      uiAudio.init();
      uiAudio.setVolume(DEFAULT_SFX_VOLUME);
      void uiAudio.loadCustomSound('card-hover', getAudioAssetUrl('卡牌声音.mp3'));
    };

    // Initialize once on mount, then retry on user gesture for autoplay-restricted runtimes.
    bootstrapAudio();
    window.addEventListener('pointerdown', bootstrapAudio);
    window.addEventListener('keydown', bootstrapAudio);

    return () => {
      window.removeEventListener('pointerdown', bootstrapAudio);
      window.removeEventListener('keydown', bootstrapAudio);
    };
  }, []);

  return (
    <ThemeProvider>
      <div className="relative h-dvh w-full overflow-hidden bg-[#0f0d0a] text-[#f0ddbb]">
        <AppStoreProvider>
          <MvpFlowShell />
        </AppStoreProvider>
      </div>
    </ThemeProvider>
  );
}

export default App;
