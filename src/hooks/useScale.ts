import { useState, useCallback, useEffect } from 'react';

interface ScaleInfo {
  scale: number;
  containerWidth: number;
  containerHeight: number;
  offsetX: number;
  offsetY: number;
}

export function useScale(canvasWidth: number, canvasHeight: number) {
  const [scaleInfo, setScaleInfo] = useState<ScaleInfo>({
    scale: 1,
    containerWidth: canvasWidth,
    containerHeight: canvasHeight,
    offsetX: 0,
    offsetY: 0,
  });

  const calculateScale = useCallback(() => {
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const designW = canvasWidth;
    const designH = canvasHeight;
    const scale = Math.min(viewportW / designW, viewportH / designH);
    const containerWidth = designW * scale;
    const containerHeight = designH * scale;
    const offsetX = (viewportW - containerWidth) / 2;
    const offsetY = (viewportH - containerHeight) / 2;

    setScaleInfo({ scale, containerWidth, containerHeight, offsetX, offsetY });
  }, [canvasWidth, canvasHeight]);

  useEffect(() => {
    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [calculateScale]);

  const screenToCanvas = useCallback(
    (clientX: number, clientY: number) => ({
      x: (clientX - scaleInfo.offsetX) / scaleInfo.scale,
      y: (clientY - scaleInfo.offsetY) / scaleInfo.scale,
    }),
    [scaleInfo]
  );

  const canvasToScreen = useCallback(
    (x: number, y: number) => ({
      x: x * scaleInfo.scale + scaleInfo.offsetX,
      y: y * scaleInfo.scale + scaleInfo.offsetY,
    }),
    [scaleInfo]
  );

  return {
    scaleInfo,
    screenToCanvas,
    canvasToScreen,
  };
}
