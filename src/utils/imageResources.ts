/**
 * 图片资源管理器（修复版）
 * 统一管理图片路径，提供安全回退，避免资源缺失导致崩溃。
 */

export type ImageCategory = 'card' | 'character' | 'background' | 'ui' | 'effect';
export type ImageSize = 'thumb' | 'small' | 'medium' | 'large' | 'original';

export interface ImageConfig {
  path: string;
  category: ImageCategory;
  fallback?: string;
  sizes?: Partial<Record<ImageSize, string>>;
}

export interface ImageLoadOptions {
  priority?: 'high' | 'normal' | 'low';
  size?: ImageSize;
  retryCount?: number;
  timeout?: number;
}

export const DEFAULT_IMAGES = {
  cardBack: '/assets/card-back.png',
  cardFrame: '/assets/card-frame.png',
  characterDefault: '/assets/chars/kongqiu.png',
  backgroundDefault: '/assets/bg-main.png',
} as const;

export const CARD_ID_TO_IMAGE_MAP: Record<string, string> = {
  'left-001': 'guibian',
  'left-002': 'cifeng',
  'left-003': 'tongyi',
  'left-004': 'mingshi',
  'left-005': 'jimu',
  'left-006': 'juwentang',
  'center-001': 'libian',
  'center-002': 'youshuo',
  'center-003': 'lianheng',
  'center-004': 'mengshu',
  'center-005': 'zhange',
  'center-006': 'poji',
  'right-001': 'bingshu',
  'right-002': 'chengfang',
  'right-003': 'liannuju',
  'right-004': 'fengjun',
  'right-005': 'zhuduchao',
  'right-006': 'tianshe',
};

export function resolveAssetPath(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
}

export function getCardImagePath(cardId: string): string {
  const imageFile = CARD_ID_TO_IMAGE_MAP[cardId];
  if (!imageFile) {
    return resolveAssetPath(DEFAULT_IMAGES.cardBack);
  }
  return resolveAssetPath(`/assets/cards/${imageFile}.jpg`);
}

export function getCharacterImagePath(characterId: string, stand = false): string {
  const folder = stand ? 'stand/' : '';
  return resolveAssetPath(`/assets/chars/${folder}${characterId}.png`);
}

export function getBackgroundImagePath(fileName: string): string {
  return resolveAssetPath(`/assets/${fileName}`);
}

export async function preloadImages(paths: string[]): Promise<void> {
  await Promise.all(
    paths.map(
      (path) =>
        new Promise<void>((resolve) => {
          const image = new Image();
          image.onload = () => resolve();
          image.onerror = () => resolve();
          image.src = path;
        }),
    ),
  );
}
