import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface TransitionScreenProps {
  onComplete: () => void;
}

const EXIT_FADE_MS = 900;
const MIN_PLAY_MS = 5000;
const SAFETY_EXIT_MS = 10000;
const SKIP_ENABLE_MS = 600;

export function TransitionScreen({ onComplete }: TransitionScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const doneRef = useRef(false);
  const startedAtRef = useRef(0);
  const exitTimerRef = useRef<number | null>(null);
  const [opacity, setOpacity] = useState(0);
  const [overlay, setOverlay] = useState(0);
  const [videoFailed, setVideoFailed] = useState(false);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [skipEnabled, setSkipEnabled] = useState(false);
  const asset = useCallback((path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`, []);
  const videoSources = useMemo(
    () => [
      asset('assets/transition.mp4'),
      asset(encodeURI('素材/fbe7eb1e32979861693d5d7ff6742c3e.mp4')),
    ],
    [asset],
  );
  const videoSrc = videoSources[sourceIndex] ?? videoSources[0];

  const triggerExit = useCallback(() => {
    if (doneRef.current) return;

    const elapsed = Date.now() - startedAtRef.current;
    if (elapsed < MIN_PLAY_MS) {
      if (exitTimerRef.current) {
        window.clearTimeout(exitTimerRef.current);
      }
      exitTimerRef.current = window.setTimeout(() => {
        if (doneRef.current) return;
        doneRef.current = true;
        setOverlay(1);
        window.setTimeout(() => onComplete(), EXIT_FADE_MS);
      }, MIN_PLAY_MS - elapsed);
      return;
    }

    doneRef.current = true;
    setOverlay(1);
    window.setTimeout(() => onComplete(), EXIT_FADE_MS);
  }, [onComplete]);

  const tryNextSource = useCallback(() => {
    setSourceIndex((prev) => {
      const next = prev + 1;
      if (next < videoSources.length) {
        return next;
      }
      setVideoFailed(true);
      return prev;
    });
  }, [videoSources.length]);

  useEffect(() => {
    startedAtRef.current = Date.now();
    const t = window.setTimeout(() => setOpacity(1), 40);
    const skipTimer = window.setTimeout(() => setSkipEnabled(true), SKIP_ENABLE_MS);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(skipTimer);
      if (exitTimerRef.current) {
        window.clearTimeout(exitTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (!doneRef.current) triggerExit();
    }, SAFETY_EXIT_MS);
    return () => window.clearTimeout(t);
  }, [triggerExit]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || videoFailed) return;
    const p = v.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => tryNextSource());
    }
  }, [videoSrc, videoFailed, tryNextSource]);

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || doneRef.current) return;
    if (v.duration && v.currentTime >= v.duration - 1.1) {
      triggerExit();
    }
  };

  const handleVideoError = () => {
    if (doneRef.current) return;
    tryNextSource();
  };

  const handleSkip = useCallback((force = false) => {
    if (!force && !skipEnabled) return;
    triggerExit();
  }, [skipEnabled, triggerExit]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Esc' || e.code === 'Escape') { e.preventDefault(); handleSkip(true); }
    };
    window.addEventListener('keydown', onKey, true);
    document.addEventListener('keydown', onKey, true);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [handleSkip]);

  return (
    <div
      onClick={() => handleSkip()}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#000',
        opacity,
        transition: 'opacity 0.4s ease-out',
        cursor: 'pointer',
        overflow: 'hidden',
      }}
    >
      {!videoFailed ? (
        <video
          src={videoSrc}
          autoPlay
          muted
          playsInline
          loop
          preload="auto"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'fill',
            filter: 'blur(24px) brightness(0.42) saturate(1.35)',
            transform: 'scale(1.04)',
            pointerEvents: 'none',
          }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 30% 30%, rgba(170,35,28,0.28), transparent 45%), radial-gradient(circle at 78% 75%, rgba(230,110,62,0.22), transparent 45%), linear-gradient(120deg, #170807 0%, #3a0f0c 45%, #120505 100%)',
            pointerEvents: 'none',
          }}
        />
      )}

      {!videoFailed ? (
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          playsInline
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onEnded={triggerExit}
          onError={handleVideoError}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'auto',
            height: '100%',
            maxWidth: '100%',
            maxHeight: '100%',
            display: 'block',
            pointerEvents: 'none',
          }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(242,204,183,0.85)',
            letterSpacing: '0.2em',
            fontFamily: 'serif',
            fontSize: '14px',
            pointerEvents: 'none',
          }}
        >
          <div className="transition-fallback">
            <div className="fallback-gear fallback-gear-1" />
            <div className="fallback-gear fallback-gear-2" />
            <div className="fallback-gear fallback-gear-3" />
            <div className="fallback-particle fallback-particle-1" />
            <div className="fallback-particle fallback-particle-2" />
            <div className="fallback-particle fallback-particle-3" />
            <div className="fallback-particle fallback-particle-4" />
            <div className="fallback-particle fallback-particle-5" />
            <div className="fallback-ember fallback-ember-1" />
            <div className="fallback-ember fallback-ember-2" />
            <div className="fallback-ember fallback-ember-3" />
          </div>
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#000',
          opacity: overlay,
          transition: 'opacity 1s ease-in',
          pointerEvents: 'none',
        }}
      />

      <button
        type="button"
        onClick={() => handleSkip()}
        disabled={!skipEnabled}
        style={{
          position: 'absolute',
          bottom: '32px',
          right: '40px',
          color: skipEnabled ? 'rgba(212,197,169,0.75)' : 'rgba(212,197,169,0.35)',
          fontSize: '13px',
          letterSpacing: '2px',
          fontFamily: 'serif',
          cursor: skipEnabled ? 'pointer' : 'default',
          border: 'none',
          background: 'transparent',
          padding: '8px 16px',
          opacity: overlay > 0 ? 0 : 1,
          transition: 'opacity 0.3s, color 0.3s',
        }}
      >
        点击或 ESC 跳过
      </button>

      <style>{`
        @keyframes skip-blink {
          0%,100% { opacity: 0.3; }
          50% { opacity: 0.85; }
        }
        @keyframes gear-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes particle-rise {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-120px) scale(0.3); }
        }
        @keyframes ember-glow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
        .transition-fallback {
          position: absolute;
          inset: 0;
          overflow: hidden;
          background: radial-gradient(circle at 30% 30%, rgba(170,35,28,0.28), transparent 45%),
                      radial-gradient(circle at 78% 75%, rgba(230,110,62,0.22), transparent 45%),
                      linear-gradient(120deg, #170807 0%, #3a0f0c 45%, #120505 100%);
        }
        .fallback-gear {
          position: absolute;
          border-radius: 50%;
          border: 3px solid #d4a520;
          opacity: 0.5;
          animation: gear-rotate 4s linear infinite;
        }
        .fallback-gear-1 {
          width: 140px;
          height: 140px;
          top: -40px;
          left: -40px;
          animation-duration: 6s;
        }
        .fallback-gear-2 {
          width: 100px;
          height: 100px;
          bottom: 5%;
          right: -25px;
          animation-duration: 4s;
          animation-direction: reverse;
        }
        .fallback-gear-3 {
          width: 70px;
          height: 70px;
          top: 35%;
          left: 15%;
          animation-duration: 3s;
        }
        .fallback-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #E85D04;
          border-radius: 50%;
          box-shadow: 0 0 6px #E85D04;
        }
        .fallback-particle-1 { top: 75%; left: 20%; animation: particle-rise 2.5s ease-out infinite; }
        .fallback-particle-2 { top: 80%; left: 45%; animation: particle-rise 2s ease-out infinite 0.3s; }
        .fallback-particle-3 { top: 70%; left: 65%; animation: particle-rise 2.2s ease-out infinite 0.6s; }
        .fallback-particle-4 { top: 85%; left: 30%; animation: particle-rise 1.8s ease-out infinite 0.9s; }
        .fallback-particle-5 { top: 78%; left: 55%; animation: particle-rise 2.8s ease-out infinite 1.2s; }
        .fallback-ember {
          position: absolute;
          width: 8px;
          height: 8px;
          background: radial-gradient(circle, #E85D04, #8B2635);
          border-radius: 50%;
          box-shadow: 0 0 12px #E85D04, 0 0 24px rgba(232,93,4,0.5);
        }
        .fallback-ember-1 { top: 60%; left: 25%; animation: ember-glow 2s ease-in-out infinite; }
        .fallback-ember-2 { top: 45%; right: 30%; animation: ember-glow 1.5s ease-in-out infinite 0.5s; }
        .fallback-ember-3 { bottom: 35%; left: 40%; animation: ember-glow 2.5s ease-in-out infinite 1s; }
      `}</style>
    </div>
  );
}
