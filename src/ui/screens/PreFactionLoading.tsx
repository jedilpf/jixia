import { useEffect, useState } from 'react';
import { PRE_BATTLE_COLORS } from '@/ui/screens/visualAssets';

interface PreFactionLoadingProps {
  onComplete: () => void;
  minDisplayMs?: number;
}

export function PreFactionLoading({ onComplete, minDisplayMs = 2000 }: PreFactionLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / minDisplayMs) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(onComplete, 600);
        }, 200);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [minDisplayMs, onComplete]);

  return (
    <div
      className="relative flex h-full items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(122deg, rgba(31,10,8,0.88), rgba(62,18,12,0.82)), url(${'/assets/bg-prebattle.jpg'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.6s ease-in-out',
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(210,150,72,0.18),transparent_40%)]" />

      <div
        className="relative w-[600px] rounded-2xl border-2 border-battle-border p-8 text-center"
        style={{ background: PRE_BATTLE_COLORS.panel }}
      >
        <div className="mb-6">
          <div
            className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-battle-border"
            style={{
              background: 'linear-gradient(135deg, rgba(181,140,84,0.15), rgba(139,115,85,0.08))',
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              className="animate-spin"
              style={{ animationDuration: '3s' }}
            >
              <path
                d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                stroke="#f0c36e"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold tracking-[0.06em]" style={{ color: PRE_BATTLE_COLORS.textMain }}>
            门派抉择
          </h2>
          <p className="mt-2 text-sm" style={{ color: PRE_BATTLE_COLORS.textMuted }}>
            正在加载门派信息，请稍候...
          </p>
        </div>

        <div
          className="mb-4 overflow-hidden rounded-lg border border-battle-border p-1"
          style={{ background: 'rgba(18,13,8,0.62)' }}
        >
          <div className="mb-2 flex justify-between px-1 text-xs" style={{ color: '#ad8f67' }}>
            <span>加载进度</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded bg-[#24170f]">
            <div
              className="h-full rounded transition-all duration-100"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #7a2f1d, #f0c36e 50%, #f8e6be)',
                boxShadow: '0 0 10px rgba(212,165,32,0.5)',
              }}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-8">
          <div className="text-center">
            <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full border border-battle-border-light">
              <span className="text-lg" style={{ color: '#f0c36e' }}>1</span>
            </div>
            <span className="text-xs" style={{ color: '#ad8f67' }}>选择门派</span>
          </div>
          <div className="mt-5 h-0.5 w-8 bg-[rgba(184,136,84,0.3)]" />
          <div className="text-center">
            <div
              className="mb-1 flex h-10 w-10 items-center justify-center rounded-full border"
              style={{ borderColor: progress > 33 ? 'rgba(212,165,32,0.6)' : 'rgba(184,136,84,0.4)' }}
            >
              <span
                className="text-lg"
                style={{ color: progress > 33 ? '#f0c36e' : '#b18e65' }}
              >
                2
              </span>
            </div>
            <span className="text-xs" style={{ color: progress > 33 ? '#f0c36e' : '#b18e65' }}>
              战前整备
            </span>
          </div>
          <div className="mt-5 h-0.5 w-8 bg-[rgba(184,136,84,0.3)]" />
          <div className="text-center">
            <div
              className="mb-1 flex h-10 w-10 items-center justify-center rounded-full border"
              style={{ borderColor: progress > 66 ? 'rgba(212,165,32,0.6)' : 'rgba(184,136,84,0.4)' }}
            >
              <span
                className="text-lg"
                style={{ color: progress > 66 ? '#f0c36e' : '#b18e65' }}
              >
                3
              </span>
            </div>
            <span className="text-xs" style={{ color: progress > 66 ? '#f0c36e' : '#b18e65' }}>
              进入战斗
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
