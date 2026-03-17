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

  const handleSkip = useCallback(() => {
    if (!skipEnabled) return;
    triggerExit();
  }, [skipEnabled, triggerExit]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleSkip();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleSkip]);

  return (
    <div
      onClick={handleSkip}
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
          muted
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
          场景切换中...
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

      <div
        style={{
          position: 'absolute',
          bottom: '32px',
          right: '40px',
          color: 'rgba(212,197,169,0.55)',
          fontSize: '13px',
          letterSpacing: '2px',
          fontFamily: 'serif',
          pointerEvents: 'none',
          animation: 'skip-blink 2s ease-in-out infinite',
          opacity: overlay > 0 || !skipEnabled ? 0 : 1,
          transition: 'opacity 0.3s',
        }}
      >
        点击或 ESC 跳过
      </div>

      <style>{`
        @keyframes skip-blink {
          0%,100% { opacity: 0.3; }
          50% { opacity: 0.85; }
        }
      `}</style>
    </div>
  );
}
