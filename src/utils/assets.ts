export function buildSequentialImageExtMap(
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
  'anqianzhijian': 'png',
  'baiyan1': 'png',
  'baiyan10': 'png',
  'baiyan2': 'png',
  'baiyan3': 'png',
  'baiyan4': 'png',
  'baiyan5': 'png',
  'baiyan6': 'png',
  'baiyan7': 'png',
  'baiyan8': 'png',
  'baiyan9': 'png',
  'bingshu': 'png',
  'bozaquwu': 'png',
  'card-frame': 'png',
  'chilin': 'png',
  'choutian1': 'png',
  'choutian10': 'png',
  'choutian2': 'png',
  'choutian3': 'png',
  'choutian4': 'png',
  'choutian5': 'png',
  'choutian6': 'png',
  'choutian7': 'png',
  'choutian8': 'png',
  'choutian9': 'png',
  'confucian': 'png',
  'daoist': 'png',
  'fajia1': 'png',
  'fajia2': 'png',
  'fajia3': 'png',
  'gengxierlun': 'png',
  'gonglunchengshi': 'png',
  'gongyishouxi': 'png',
  'guizhen10': 'png',
  'guizhen6': 'png',
  'guizhen7': 'png',
  'guizhen8': 'png',
  'guizhen9': 'png',
  'hengjieting10': 'png',
  'hengjieting6': 'png',
  'hengjieting7': 'png',
  'hengjieting8': 'png',
  'hengjieting9': 'png',
  'jianai': 'png',
  'jianai2': 'png',
  'jianai3': 'png',
  'jianai4': 'png',
  'jianai5': 'png',
  'jianai6': 'png',
  'jiantingzeming': 'png',
  'jingqi': 'png',
  'jiuzhen8': 'png',
  'legalist': 'png',
  'liangduanhengliang': 'png',
  'liangyi': 'png',
  'liangyi1': 'png',
  'liangyi10': 'png',
  'liangyi2': 'png',
  'liangyi3': 'png',
  'liangyi4': 'png',
  'liangyi5': 'png',
  'liangyi6': 'png',
  'liangyi7': 'png',
  'liangyi8': 'png',
  'liangyi9': 'png',
  'lixindian10': 'png',
  'lixindian6': 'png',
  'lixindian7': 'png',
  'lixindian8': 'png',
  'lixindian9': 'png',
  'mingxiang10': 'png',
  'mingxiang8': 'png',
  'mingxiang9': 'png',
  'mohist': 'png',
  'pangtong': 'png',
  'pangzhengboyin': 'png',
  'poji': 'png',
  'rujia1': 'png',
  'rujia2': 'png',
  'rujia3': 'png',
  'shouchengzhiyi': 'png',
  'shoushuchengwen': 'png',
  'sitian6': 'png',
  'sitian9': 'png',
  'strategist': 'png',
  'tiangong1': 'png',
  'tiangong10': 'png',
  'tiangong2': 'png',
  'tiangong3': 'png',
  'tiangong4': 'png',
  'tiangong5': 'png',
  'tiangong6': 'png',
  'tiangong7': 'png',
  'tiangong8': 'png',
  'tiangong9': 'png',
  'wannong10': 'png',
  'wannong6': 'png',
  'wannong7': 'png',
  'wannong8': 'png',
  'wannong9': 'png',
  'xiangyishuli': 'png',
  'xinglin1': 'png',
  'xinglin10': 'png',
  'xinglin2': 'png',
  'xinglin3': 'png',
  'xinglin4': 'png',
  'xinglin5': 'png',
  'xinglin6': 'png',
  'xinglin7': 'png',
  'xinglin8': 'png',
  'xinglin9': 'png',
  'xinglvxuezi': 'png',
  'xingpan': 'png',
  'yangzhen1': 'png',
  'yangzhen10': 'png',
  'yangzhen2': 'png',
  'yangzhen3': 'png',
  'yangzhen4': 'png',
  'yangzhen5': 'png',
  'yangzhen6': 'png',
  'yangzhen7': 'png',
  'yangzhen8': 'png',
  'yangzhen9': 'png',
  'youce10': 'jpg',
  'youce6': 'png',
  'youce7': 'jpg',
  'youce8': 'png',
  'youce9': 'png',
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
  '温言立论': 'wenyan',
  '竹牍抄录': 'zhuduchao',
  '讲席清规': 'jiangxi',
  '司史执笔': 'sishi',
  '礼辩同归': 'libian',
  '铁券禁令': 'tiequan',
  '断简成法': 'duanjian',
  '缄印封检': 'jianyin',
  '鞫问堂': 'juwentang',
  '一纸敕令': 'chilin',
  '云岫观想': 'yunxiu',
  '抱一守玄': 'baoyi',
  '丹砂小炉': 'dansha',
  '太清符箓': 'taiqing',
  '鹤步凌虚': 'hebu',
  '连弩匣': 'liannuju',
  '机关木鸢': 'jimu',
  '城防尺牍': 'chengfang',
  '兼济匠师': 'jianshi',
  '千机壁垒': 'qianji',
  '旌旗换阵': 'jingqi',
  '战鼓催锋': 'zhange',
  '兵书残卷': 'bingshu',
  '锋将·破军': 'fengjun',
  '破阵天雷': 'poji',
  '白马非马': 'baima',
  '名实互诘': 'mingshi',
  '同异之辩': 'tongyi',
  '辞锋术士': 'cifeng',
  '诡辩连环': 'guibian',
  '星盘推演': 'xingpan',
  '两仪折冲': 'liangyi',
  '司辰使': 'sichen',
  '逆卦问凶': 'nigua',
  '天象更迭': 'tianxiang',
  '合纵之策': 'hezong',
  '连横之契': 'lianheng',
  '游说之辞': 'youshuo',
  '盟书': 'mengshu',
  '八面逢源': 'bafeng',
  '春耕起垄': 'chunggeng',
  '灌渠引水': 'guanqu',
  '谷仓封藏': 'gucang',
  '田社长者': 'tianshe',
  '五谷丰登': 'wugu',
  '百家残页': 'baijia',
  '旁通': 'pangtong',
  '兼采其长': 'jianai',
  '墨家扣机': 'tiangong1',
  '云梯凌虚': 'tiangong2',
  '枢机错落': 'tiangong3',
  '木鸢之御': 'tiangong4',
  '震岳石弩': 'tiangong5',
  '阴阳化宇': 'liangyi1',
  '五德流变': 'liangyi2',
  '坎离折冲': 'liangyi3',
  '两仪法象': 'liangyi4',
  '太极圆融': 'liangyi5',
  '青囊解厄': 'xinglin1',
  '鸩毒反噬': 'xinglin2',
  '望闻问切': 'xinglin3',
  '杏林医官': 'xinglin4',
  '九针百草索': 'xinglin5',
  '里巷微言': 'baiyan1',
  '市虎三传': 'baiyan2',
  '道听途说': 'baiyan3',
  '说书稗官': 'baiyan4',
  '舆论漩涡': 'baiyan5',
  '漱津调气': 'yangzhen1',
  '守真餐风': 'yangzhen2',
  '轻身飞举': 'yangzhen3',
  '洗髓炼师': 'yangzhen4',
  '养真丹炉': 'yangzhen5',
  '蓍草筮吉': 'choutian1',
  '六爻飞星': 'choutian2',
  '步斗量天': 'choutian3',
  '筹演术师': 'choutian4',
  '命数轮盘': 'choutian5',
  '礼辩成风': 'lixindian6',
  '明堂议事': 'lixindian7',
  '六礼备至': 'lixindian8',
  '仪队总规': 'lixindian9',
  '礼义廉耻': 'lixindian10',
  '规典立则': 'hengjieting6',
  '廷尉执法': 'hengjieting7',
  '词讼禁止': 'hengjieting8',
  '罪状核查': 'hengjieting9',
  '刑狱制衡': 'hengjieting10',
  '清虚静笃': 'guizhen6',
  '炼气储真': 'guizhen7',
  '虚空契道': 'guizhen8',
  '炉鼎炼气': 'guizhen9',
  '归一守中': 'guizhen10',
  '奇械造化': 'xuanjang6',
  '大匠造物': 'xuanjang7',
  '铸甲精钢': 'xuanjang8',
  '轮轴连动': 'xuanjang9',
  '机关总成': 'xuanjang10',
  '破釜沉舟': 'jiuzhen6',
  '先锋悍将': 'jiuzhen7',
  '三才合围': 'jiuzhen8',
  '将帅之盾': 'jiuzhen9',
  '八卦阵图': 'jiuzhen10',
  '辩名定义': 'mingxiang6',
  '名家辩手': 'mingxiang7',
  '名实相悖': 'mingxiang8',
  '名实洞穿': 'mingxiang9',
  '名相倒推': 'mingxiang10',
  '观天象变': 'sitian6',
  '太史占星': 'sitian7',
  '天运推定': 'sitian8',
  '天文仪器': 'sitian9',
  '七政运转': 'sitian10',
  '凤鸣朝阳': 'youce6',
  '说客名士': 'youce7',
  '反间之计': 'youce8',
  '游说之器': 'youce9',
  '纵横天下': 'youce10',
  '丰收积粮': 'wannong6',
  '田间老农': 'wannong7',
  '仓廪丰实': 'wannong8',
  '农具改良': 'wannong9',
  '五亩之宅': 'wannong10',
  '百家争鸣': 'jianai2',
  '融通百技': 'jianai3',
  '学贯通匠': 'jianai4',
  '综合推论': 'jianai5',
  '博闻强记': 'jianai6',
  '甲兵连动': 'tiangong6',
  '霹雳惊雷': 'tiangong7',
  '机动甲卫': 'tiangong8',
  '铁骑横戈': 'tiangong9',
  '墨匠圣坊': 'tiangong10',
  '两仪和息': 'liangyi6',
  '法象宗师': 'liangyi7',
  '五行生杀': 'liangyi8',
  '两仪守中': 'liangyi9',
  '太极万象': 'liangyi10',
  '施针问诊': 'xinglin6',
  '神农传人': 'xinglin7',
  '本草秘方': 'xinglin8',
  '百草精华': 'xinglin9',
  '杏林春暖': 'xinglin10',
  '匿名投书': 'baiyan6',
  '说书老翁': 'baiyan7',
  '谶语迷惑': 'baiyan8',
  '谣言载体': 'baiyan9',
  '流言狂飙': 'baiyan10',
  '养生固本': 'yangzhen6',
  '真人修士': 'yangzhen7',
  '节欲保元': 'yangzhen8',
  '玉液金丹': 'yangzhen9',
  '修真祖庭': 'yangzhen10',
  '推演布局': 'choutian6',
  '筹算宗师': 'choutian7',
  '死局重排': 'choutian8',
  '推演图表': 'choutian9',
  '天罗地网': 'choutian10',
  '行旅学子': 'xinglvxuezi',
  '乡议书吏': 'xiangyishuli',
  '公议守席': 'gongyishouxi',
  '案前执简': 'anqianzhijian',
  '两端衡量': 'liangduanhengliang',
  '更席而论': 'gengxierlun',
  '收束成文': 'shoushuchengwen',
  '驳杂去芜': 'bozaquwu',
  '旁征博引': 'pangzhengboyin',
  '公论成势': 'gonglunchengshi',
  '守成之议': 'shouchengzhiyi',
  '兼听则明': 'jiantingzeming',
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
