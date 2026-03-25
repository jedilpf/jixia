const CARD_IMAGE_EXT_OVERRIDES: Record<string, 'png' | 'jpg'> = {
  xingpan: 'png',
  liangyi: 'png',
};

// BS01 主线卡在迁移前使用过旧图 id；这里保留兼容映射，避免迁移期卡图“看起来丢失”。
const BS01_ID_TO_LEGACY_IMAGE_ID: Record<string, string> = {
  'BS01-RU-002': 'wenyan',
  'BS01-RU-003': 'zhuduchao',
  'BS01-RU-004': 'jiangxi',
  'BS01-RU-005': 'sishi',
  'BS01-RU-006': 'libian',
  'BS01-MO-002': 'liannuju',
  'BS01-MO-003': 'jimu',
  'BS01-MO-004': 'chengfang',
  'BS01-MO-005': 'jianshi',
  'BS01-MO-006': 'qianji',
};

const CARD_NAME_TO_IMAGE_ID: Record<string, string> = {
  温言立论: 'wenyan',
  竹牍抄录: 'zhuduchao',
  讲席清规: 'jiangxi',
  司史执笔: 'sishi',
  礼辩同归: 'libian',
  连弩匣: 'liannuju',
  机关木鸢: 'jimu',
  城防尺牍: 'chengfang',
  兼济匠师: 'jianshi',
  千机壁垒: 'qianji',
};

export function getAssetUrl(assetPath: string): string {
  const normalized = assetPath.replace(/^\/+/, '');
  return `${import.meta.env.BASE_URL}${normalized}`;
}

function resolveCardImageId(cardId: string, cardName?: string): string | null {
  if (BS01_ID_TO_LEGACY_IMAGE_ID[cardId]) {
    return BS01_ID_TO_LEGACY_IMAGE_ID[cardId];
  }

  const legacyShowcaseMatch = /^LEG-SC-(.+)$/i.exec(cardId);
  if (legacyShowcaseMatch?.[1]) {
    return legacyShowcaseMatch[1].toLowerCase();
  }

  if (cardName && CARD_NAME_TO_IMAGE_ID[cardName]) {
    return CARD_NAME_TO_IMAGE_ID[cardName];
  }

  // 旧图 id 本身（如 wenyan / xingpan）直接兼容。
  if (/^[a-z0-9_-]+$/i.test(cardId)) {
    return cardId.toLowerCase();
  }

  return null;
}

export function getCardImageUrl(cardId: string, cardName?: string): string {
  const imageId = resolveCardImageId(cardId, cardName);
  if (!imageId) {
    return getAssetUrl('assets/card-back.png');
  }
  const ext = CARD_IMAGE_EXT_OVERRIDES[imageId] ?? 'jpg';
  return getAssetUrl(`assets/cards/${imageId}.${ext}`);
}
