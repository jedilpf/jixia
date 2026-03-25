import { AppStoreProvider } from '@/app/store';
import { MvpFlowShell } from '@/ui/screens/MvpFlowShell';
import { ThemeProvider } from '@/contexts/ThemeContext';

function App() {
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
