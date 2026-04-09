function buildSequentialImageExtMap(
  prefix: string,
  start: number,
  end: number,
  ext: 'png' | 'jpg' = 'png'
): Record<string, 'png' | 'jpg'> {
  return Object.fromEntries(
    Array.from({ length: end - start + 1 }, (_, index) => [`${prefix}${start + index}`, ext])
  );
}

// 2026-04-09 牌库恢复后，图鉴重新回到 170 原始卡 / 169 图鉴卡基线。
// 历史资产核对显示：这批卡里有大量物理文件实际是 .png，而旧 helper 只覆盖了少量扩展名映射，
// 结果图鉴仍按 .jpg 去找，导致“明明画好了但显示不出来/显示成保底图”。
// 这里按现存历史资产库存补齐扩展名偏好，优先命中单卡原画。
const CARD_IMAGE_EXT_OVERRIDES: Record<string, 'png' | 'jpg'> = {
  xingpan: 'png',
  liangyi: 'png',
  pangtong: 'png',
  jianai: 'png',
  mingxiang10: 'png',
  xinglvxuezi: 'png',
  xiangyishuli: 'png',
  ...buildSequentialImageExtMap('tiangong', 1, 10),
  ...buildSequentialImageExtMap('liangyi', 1, 10),
  ...buildSequentialImageExtMap('xinglin', 1, 10),
  ...buildSequentialImageExtMap('baiyan', 1, 10),
  ...buildSequentialImageExtMap('yangzhen', 1, 10),
  ...buildSequentialImageExtMap('choutian', 1, 10),
  ...buildSequentialImageExtMap('lixindian', 6, 10),
  ...buildSequentialImageExtMap('hengjieting', 6, 10),
  ...buildSequentialImageExtMap('guizhen', 6, 10),
  ...buildSequentialImageExtMap('youce', 6, 10),
  ...buildSequentialImageExtMap('wannong', 6, 10),
  ...buildSequentialImageExtMap('jianai', 2, 6),
  ...buildSequentialImageExtMap('rujia', 1, 5),
  ...buildSequentialImageExtMap('fajia', 1, 5),
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
  // V9 映射补全
  墨家扣机: 'tiangong1',
  云梯凌虚: 'tiangong2',
  枢机错落: 'tiangong3',
  木鸢之羽: 'tiangong4',
  震岳石弩: 'tiangong5',
  阴阳化宇: 'liangyi1',
  五德流变: 'liangyi2',
  坎离折冲: 'liangyi3',
  两仪法象: 'liangyi4',
  太极圆融: 'liangyi5',
  两仪和息: 'liangyi6',
  法象宗师: 'liangyi7',
  五行生杀: 'liangyi8',
  两仪守中: 'liangyi9',
  太极万象: 'liangyi10',
};

export function getAssetUrl(assetPath: string): string {
  const normalized = assetPath.replace(/^\/+/, '');
  const baseUrl = import.meta.env?.BASE_URL ?? '/';
  return `${baseUrl}${normalized}`;
}

export function asset(assetPath: string): string {
  return getAssetUrl(assetPath);
}

export function getAudioAssetUrl(fileName: string): string {
  const normalized = fileName.replace(/^\/+/, '');
  const assetPath = normalized.startsWith('assets/') ? normalized : `assets/${normalized}`;
  return getAssetUrl(assetPath);
}

export function getCharacterImageUrl(characterId: string, stand = false): string {
  const folder = stand ? 'stand/' : '';
  return getAssetUrl(`assets/chars/${folder}${characterId}.png`);
}

function unwrapCardId(cardId: string): string {
  const deckMatch = /^deck_\d+_(.+)$/.exec(cardId);
  if (deckMatch?.[1]) {
    return deckMatch[1];
  }

  const battleMatch = /^[a-z0-9]+-(?:c|f)\d+-(.+)$/i.exec(cardId);
  if (battleMatch?.[1]) {
    return battleMatch[1];
  }

  return cardId;
}

function resolveCardImageId(cardId: string, cardName?: string): string | null {
  const canonicalId = unwrapCardId(cardId);

  if (BS01_ID_TO_LEGACY_IMAGE_ID[canonicalId]) {
    return BS01_ID_TO_LEGACY_IMAGE_ID[canonicalId];
  }

  const legacyShowcaseMatch = /^LEG-SC-(.+)$/i.exec(canonicalId);
  if (legacyShowcaseMatch?.[1]) {
    return legacyShowcaseMatch[1].toLowerCase();
  }

  if (cardName && CARD_NAME_TO_IMAGE_ID[cardName]) {
    return CARD_NAME_TO_IMAGE_ID[cardName];
  }

  // 旧图 id 本身（如 wenyan / xingpan）直接兼容。
  if (/^[a-z0-9_-]+$/i.test(canonicalId)) {
    return canonicalId.toLowerCase();
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
