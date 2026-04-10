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
  gongyishouxi: 'png',
  anqianzhijian: 'png',
  liangduanhengliang: 'png',
  gengxierlun: 'png',
  shoushuchengwen: 'png',
  bozaquwu: 'png',
  pangzhengboyin: 'png',
  gonglunchengshi: 'png',
  shouchengzhiyi: 'png',
  jiantingzeming: 'png',
  ...buildSequentialImageExtMap('tiangong', 1, 10),
  ...buildSequentialImageExtMap('liangyi', 1, 10),
  ...buildSequentialImageExtMap('xinglin', 1, 10),
  ...buildSequentialImageExtMap('baiyan', 1, 10),
  ...buildSequentialImageExtMap('yangzhen', 1, 10),
  ...buildSequentialImageExtMap('choutian', 1, 10),
  ...buildSequentialImageExtMap('jiuzhen', 1, 10),
  ...buildSequentialImageExtMap('lixindian', 1, 10),
  ...buildSequentialImageExtMap('hengjieting', 1, 10),
  ...buildSequentialImageExtMap('guizhen', 1, 10),
  ...buildSequentialImageExtMap('youce', 1, 10),
  ...buildSequentialImageExtMap('wannong', 1, 10),
  ...buildSequentialImageExtMap('mingxiang', 1, 10),
  chilin: 'png',
  bingshu: 'png',
  jingqi: 'png',
  poji: 'png',
  baijia: 'png',
  mengshu: 'png',
  hezong: 'png',
  sitian6: 'png',
  sitian9: 'png',
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
  木鸢之御: 'tiangong4',
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
  // 杏林馆
  青囊解厄: 'xinglin1',
  鸩毒反噬: 'xinglin2',
  望闻问切: 'xinglin3',
  杏林医官: 'xinglin4',
  九针百草索: 'xinglin5',
  施针问诊: 'xinglin6',
  神农传人: 'xinglin7',
  本草秘方: 'xinglin8',
  百草精华: 'xinglin9',
  杏林春暖: 'xinglin10',
  // 养真院
  漱津调气: 'yangzhen1',
  守真餐风: 'yangzhen2',
  轻身飞举: 'yangzhen3',
  洗髓炼师: 'yangzhen4',
  养真丹炉: 'yangzhen5',
  养生固本: 'yangzhen6',
  真人修士: 'yangzhen7',
  节欲保元: 'yangzhen8',
  玉液金丹: 'yangzhen9',
  修真祖庭: 'yangzhen10',
  // 稗言社
  里巷微言: 'baiyan1',
  市虎三传: 'baiyan2',
  道听途说: 'baiyan3',
  说书稗官: 'baiyan4',
  舆论漩涡: 'baiyan5',
  匿名投书: 'baiyan6',
  说书老翁: 'baiyan7',
  谶语迷惑: 'baiyan8',
  谣言载体: 'baiyan9',
  流言狂飙: 'baiyan10',
  // 筹天阁
  蓍草筮吉: 'choutian1',
  六爻飞星: 'choutian2',
  步斗量天: 'choutian3',
  筹演术师: 'choutian4',
  命数轮盘: 'choutian5',
  推演布局: 'choutian6',
  筹算宗师: 'choutian7',
  死局重排: 'choutian8',
  推演图表: 'choutian9',
  天罗地网: 'choutian10',
  // 礼心殿（二期）
  礼辩成风: 'lixindian6',
  明堂议事: 'lixindian7',
  六礼备至: 'lixindian8',
  仪队总规: 'lixindian9',
  礼义廉耻: 'lixindian10',
  // 衡戒廷（二期）
  规典立则: 'hengjieting6',
  廷尉执法: 'hengjieting7',
  词讼禁止: 'hengjieting8',
  罪状核查: 'hengjieting9',
  刑狱制衡: 'hengjieting10',
  // 归真观（二期）
  清虚静笃: 'guizhen6',
  炼气储真: 'guizhen7',
  虚空契道: 'guizhen8',
  炉鼎炼气: 'guizhen9',
  归一守中: 'guizhen10',
  // 玄匠盟（二期）
  奇械造化: 'xuanjang6',
  大匠造物: 'xuanjang7',
  铸甲精钢: 'xuanjang8',
  轮轴连动: 'xuanjang9',
  机关总成: 'xuanjang10',
  // 九阵堂（二期）
  破釜沉舟: 'jiuzhen6',
  先锋悍将: 'jiuzhen7',
  三才合围: 'jiuzhen8',
  将帅之盾: 'jiuzhen9',
  八卦阵图: 'jiuzhen10',
  // 名相府（二期）
  辩名定义: 'mingxiang6',
  名家辩手: 'mingxiang7',
  名实相悖: 'mingxiang8',
  名实洞穿: 'mingxiang9',
  名相倒推: 'mingxiang10',
  // 司天台（二期）
  观天象变: 'sitian6',
  太史占星: 'sitian7',
  天运推定: 'sitian8',
  天文仪器: 'sitian9',
  七政运转: 'sitian10',
  // 游策阁（二期）
  凤鸣朝阳: 'youce6',
  说客名士: 'youce7',
  反间之计: 'youce8',
  游说之器: 'youce9',
  纵横天下: 'youce10',
  // 万农坊（二期）
  丰收积粮: 'wannong6',
  田间老农: 'wannong7',
  仓廪丰实: 'wannong8',
  农具改良: 'wannong9',
  五亩之宅: 'wannong10',
  // 兼采楼（补全+二期）
  百家争鸣: 'jianai2',
  融通百技: 'jianai3',
  学贯通匠: 'jianai4',
  综合推论: 'jianai5',
  博闻强记: 'jianai6',
  // 天工坊（二期）
  甲兵连动: 'tiangong6',
  霹雳惊雷: 'tiangong7',
  机动甲卫: 'tiangong8',
  铁骑横戈: 'tiangong9',
  墨匠圣坊: 'tiangong10',
  // 两仪署（一期补充）
  一纸敕令: 'chilin',
  星盘推演: 'xingpan',
  两仪折冲: 'liangyi',
  旁通: 'pangtong',
  兼采其长: 'jianai',
  // 通用
  行旅学子: 'xinglvxuezi',
  乡议书吏: 'xiangyishuli',
  公议守席: 'gongyishouxi',
  案前执简: 'anqianzhijian',
  两端衡量: 'liangduanhengliang',
  更席而论: 'gengxierlun',
  收束成文: 'shoushuchengwen',
  驳杂去芜: 'bozaquwu',
  旁征博引: 'pangzhengboyin',
  公论成势: 'gonglunchengshi',
  守成之议: 'shouchengzhiyi',
  兼听则明: 'jiantingzeming',
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
