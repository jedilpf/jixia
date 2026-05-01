// 稀有度颜色映射
export const rarityColor: Record<string, string> = {
    '常见': '#9ca3af',
    '稀有': '#60a5fa',
    '史诗': '#a855f7',
    '传说': '#f59e0b',
};

export type ActiveCardType = '\u7acb\u8bba' | '\u7b56\u672f';
export type LegacyCardType = '\u6280\u80fd' | '\u4e8b\u4ef6' | '\u573a\u5730' | '\u89d2\u8272' | '\u88c5\u5907' | '\u53cd\u5236';
export type RetiredCanonicalCardType = '\u7384\u7ae0' | '\u95e8\u5ba2' | '\u53cd\u8bd8';
export type RawShowcaseCardType = ActiveCardType | RetiredCanonicalCardType | LegacyCardType;
export type ShowcaseCardType = ActiveCardType;

const RAW_TYPE_TO_ACTIVE: Record<RawShowcaseCardType, ActiveCardType> = {
    '\u7acb\u8bba': '\u7acb\u8bba',
    '\u7b56\u672f': '\u7b56\u672f',
    '\u7384\u7ae0': '\u7b56\u672f',
    '\u95e8\u5ba2': '\u7acb\u8bba',
    '\u53cd\u8bd8': '\u7b56\u672f',
    '\u6280\u80fd': '\u7acb\u8bba',
    '\u4e8b\u4ef6': '\u7b56\u672f',
    '\u573a\u5730': '\u7b56\u672f',
    '\u89d2\u8272': '\u7acb\u8bba',
    '\u88c5\u5907': '\u7b56\u672f',
    '\u53cd\u5236': '\u7b56\u672f',
};

const RAW_TYPE_COLOR: Record<RawShowcaseCardType, string> = {
    '\u6280\u80fd': '#064e3b',
    '\u4e8b\u4ef6': '#7c3aed',
    '\u573a\u5730': '#1e3a5f',
    '\u88c5\u5907': '#78350f',
    '\u89d2\u8272': '#831843',
    '\u53cd\u5236': '#4c1d95',
    '\u7acb\u8bba': '#064e3b',
    '\u7b56\u672f': '#7c3aed',
    '\u7384\u7ae0': '#1e3a5f',
    '\u95e8\u5ba2': '#831843',
    '\u53cd\u8bd8': '#4c1d95',
};

// Expose two visible card types only.
export const typeColor: Record<ShowcaseCardType, string> = {
    '\u7acb\u8bba': RAW_TYPE_COLOR['\u7acb\u8bba'],
    '\u7b56\u672f': RAW_TYPE_COLOR['\u7b56\u672f'],
};

export interface CardData {
    id: string;
    name: string;
    faction: string;
    type: ActiveCardType;
    rarity: string;
    background: string;
    skill: string;
    ruleText: string;
    rule: CardRule;
    cost: number;
    attack?: number;
    hp?: number;
    shield?: number;
}

export type RuleOpCode = 'summon' | 'damage' | 'draw' | 'heal' | 'discard' | 'shield' | 'counter' | 'silence' | 'cost' | 'unknown';
export type RuleTarget = 'self' | 'enemy' | 'both' | 'any' | 'none';

export interface CardRuleOp {
    code: RuleOpCode;
    target: RuleTarget;
    value: number;
    attack?: number;
    hp?: number;
}

export interface CardRule {
    version: 'v1';
    ops: CardRuleOp[];
    source: 'normalized';
}

interface RawCardData extends Omit<CardData, 'type' | 'ruleText' | 'rule'> {
    type: RawShowcaseCardType;
}

const CN_DIGITS: Record<string, number> = {
    '零': 0, '〇': 0,
    '一': 1, '壹': 1,
    '二': 2, '贰': 2, '两': 2, '俩': 2,
    '三': 3, '叁': 3,
    '四': 4, '肆': 4,
    '五': 5, '伍': 5,
    '六': 6, '陆': 6,
    '七': 7, '柒': 7,
    '八': 8, '捌': 8,
    '九': 9, '玖': 9,
};

const CN_UNITS: Record<string, number> = {
    '十': 10, '拾': 10,
    '百': 100, '佰': 100,
    '千': 1000, '仟': 1000,
};

const NUMBER_TOKEN_RE = /[零〇一二两俩三四五六七八九十百千壹贰叁肆伍陆柒捌玖拾佰仟\d.]+/g;

function parseNumberToken(rawToken: string): number {
    const token = rawToken.trim();
    if (!token) return 0;

    if (/^\d+(\.\d+)?$/.test(token)) {
        return Math.max(0, Math.round(Number(token)));
    }

    let total = 0;
    let current = 0;
    let hasKnownChar = false;

    for (const ch of token) {
        if (ch in CN_DIGITS) {
            current = CN_DIGITS[ch];
            hasKnownChar = true;
            continue;
        }
        if (ch in CN_UNITS) {
            const unit = CN_UNITS[ch];
            hasKnownChar = true;
            if (current === 0) {
                current = 1;
            }
            total += current * unit;
            current = 0;
            continue;
        }
        if (/\d/.test(ch)) {
            current = current * 10 + Number(ch);
            hasKnownChar = true;
        }
    }

    if (!hasKnownChar) return 0;
    return Math.max(0, total + current);
}

export function normalizeRuleText(raw: string): string {
    const normalizedNumbers = raw.replace(NUMBER_TOKEN_RE, (token) => String(parseNumberToken(token)));
    const cleaned = normalizedNumbers
        .replace(/[【】]/g, '')
        .replace(/[①②③④⑤⑥⑦⑧⑨]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const clauses = cleaned
        .split(/[；。]/)
        .map((part) => part.trim())
        .filter(Boolean);

    const effectiveClauses = clauses.filter((clause) =>
        /(抽|弃|造成|回复|获得|护持|沉默|反制|费用|本回合|下回合|结算)/.test(clause),
    );

    const selected = (effectiveClauses.length > 0 ? effectiveClauses : clauses).slice(0, 3);
    return selected.join('；');
}

function appendOp(ops: CardRuleOp[], op: CardRuleOp): void {
    if (!Number.isFinite(op.value) || op.value <= 0) return;
    ops.push(op);
}

function inferStatValue(value: number | undefined, fallback: number): number {
    if (typeof value === 'number' && value > 0) return Math.round(value);
    return Math.max(1, Math.round(fallback));
}

function buildStructuredRule(rawCard: RawCardData, activeType: ActiveCardType): { ruleText: string; rule: CardRule } {
    const normalized = normalizeRuleText(rawCard.skill);
    const ops: CardRuleOp[] = [];

    if (activeType === '立论') {
        const attack = inferStatValue(rawCard.attack, Math.min(6, rawCard.cost));
        const hp = inferStatValue(rawCard.hp, Math.min(8, rawCard.cost + 1));
        appendOp(ops, {
            code: 'summon',
            target: 'self',
            value: 1,
            attack,
            hp,
        });
    }

    const hasEnemyHint = /(敌方|对手|敌军|其操作者)/.test(normalized);
    const drawMatches = normalized.match(/抽(\d+)/g) ?? [];
    const healMatches = normalized.match(/回复(\d+)/g) ?? [];
    const damageMatches = normalized.match(/造成(\d+)点伤害/g) ?? [];
    const discardMatches = normalized.match(/弃(\d+)张牌/g) ?? [];
    const shieldMatches = normalized.match(/护持(\d+)/g) ?? [];
    const costMatches = normalized.match(/费用[^\d-+]*([+-]?\d+)/g) ?? [];

    for (const entry of drawMatches) {
        const value = parseNumberToken(entry.replace(/[^\d.]/g, ''));
        appendOp(ops, { code: 'draw', target: 'self', value });
    }
    for (const entry of healMatches) {
        const value = parseNumberToken(entry.replace(/[^\d.]/g, ''));
        appendOp(ops, { code: 'heal', target: 'self', value });
    }
    for (const entry of damageMatches) {
        const value = parseNumberToken(entry.replace(/[^\d.]/g, ''));
        appendOp(ops, { code: 'damage', target: hasEnemyHint ? 'enemy' : 'any', value });
    }
    for (const entry of discardMatches) {
        const value = parseNumberToken(entry.replace(/[^\d.]/g, ''));
        appendOp(ops, { code: 'discard', target: hasEnemyHint ? 'enemy' : 'self', value });
    }
    for (const entry of shieldMatches) {
        const value = parseNumberToken(entry.replace(/[^\d.]/g, ''));
        appendOp(ops, { code: 'shield', target: 'self', value });
    }
    for (const entry of costMatches) {
        const value = parseNumberToken(entry.replace(/[^\d.]/g, ''));
        appendOp(ops, { code: 'cost', target: hasEnemyHint ? 'enemy' : 'self', value });
    }

    if (/(反制)/.test(normalized)) {
        appendOp(ops, { code: 'counter', target: 'enemy', value: 1 });
    }
    if (/(沉默)/.test(normalized)) {
        appendOp(ops, { code: 'silence', target: hasEnemyHint ? 'enemy' : 'any', value: 1 });
    }

    const fallbackRuleText = activeType === '立论'
        ? `入场：辩锋${inferStatValue(rawCard.attack, Math.min(6, rawCard.cost))}，学识${inferStatValue(rawCard.hp, Math.min(8, rawCard.cost + 1))}`
        : (rawCard.shield ? `获得护持${Math.round(rawCard.shield)}` : `本回合按费用${rawCard.cost}结算`);

    return {
        ruleText: normalized || fallbackRuleText,
        rule: {
            version: 'v1',
            ops: ops.length > 0 ? ops : [{ code: 'unknown', target: 'none', value: 1 }],
            source: 'normalized',
        },
    };
}

const RAW_CARDS: RawCardData[] = [
    // ====== 礼心殿 ======
    { id: 'wenyan', name: '温言立论', faction: '礼心殿', type: '立论', rarity: '常见', cost: 1, attack: 1, hp: 2, background: '礼之用，和为贵。', skill: '抽两张牌；若本回合已使用过礼心殿的牌，则改为抽三张。' },
    { id: 'zhuduchao', name: '竹牍抄录', faction: '礼心殿', type: '策术', rarity: '常见', cost: 2, background: '温故知新，可以为师。', skill: '从牌库中检索一张礼心殿的牌加入手牌，然后弃置一张牌。' },
    { id: 'jiangxi', name: '讲席清规', faction: '礼心殿', type: '策术', rarity: '常见', cost: 2, shield: 3, background: '不以规矩，不能成方圆。', skill: '每回合首次使用立论时抽一张牌；回合结束时若本回合未使用过牌，则获得三点护体。' },
    { id: 'sishi', name: '司史执笔', faction: '礼心殿', type: '立论', rarity: '稀有', cost: 3, attack: 2, hp: 4, background: '书法不隐，善恶必书。', skill: '登场时抽一张牌；选择一项：使敌方陷入迷惑状态两回合，或使友方获得四点护体。' },
    { id: 'libian', name: '礼辩同归', faction: '礼心殿', type: '策术', rarity: '史诗', cost: 4, shield: 2, background: '和而不同，天下大同。', skill: '双方各抽两张牌；本回合你对敌方造成的伤害增加两点，并获得两点护体。' },
    // ====== 衡戒廷 ======
    { id: 'tiequan', name: '铁券禁令', faction: '衡戒廷', type: '策术', rarity: '稀有', cost: 3, background: '刑过不避大臣，赏善不遗匹夫。', skill: '敌方下回合禁止抽牌；若强制抽牌则改为弃置一张牌。' },
    { id: 'duanjian', name: '断简成法', faction: '衡戒廷', type: '立论', rarity: '常见', cost: 2, attack: 2, hp: 2, background: '法不阿贵，绳不挠曲。', skill: '反制敌方一张策术；成功则敌方弃置一张牌。' },
    { id: 'jianyin', name: '缄印封检', faction: '衡戒廷', type: '立论', rarity: '稀有', cost: 2, attack: 2, hp: 3, background: '令必行，禁必止。', skill: '装备：首次受到的伤害减少两点；每回合首次反制后抽一张牌。' },
    { id: 'juwentang', name: '鞫问堂', faction: '衡戒廷', type: '立论', rarity: '常见', cost: 2, attack: 2, hp: 2, background: '严刑峻法，以破奸轨。', skill: '敌方使用立论时受到一点伤害；本回合已受伤则额外增加一点。' },
    { id: 'chilin', name: '一纸敕令', faction: '衡戒廷', type: '策术', rarity: '传说', cost: 6, background: '事在四方，要在中央。', skill: '选择一项：摧毁敌方所有策术；或本回合敌方禁止出牌；或抽三张牌并获得六点护体。' },
    // ====== 归真观 ======
    { id: 'yunxiu', name: '云岫观想', faction: '归真观', type: '立论', rarity: '常见', cost: 1, attack: 1, hp: 2, background: '致虚极，守静笃。', skill: '回复三点势；若本回合未受伤，额外抽一张牌。' },
    { id: 'baoyi', name: '抱一守玄', faction: '归真观', type: '立论', rarity: '史诗', cost: 5, attack: 2, hp: 6, background: '道生一，一生二。', skill: '被动：每回合首次使用立论，下回合伤害增加一点；累积三次后抽两张牌并移除所有负面状态。' },
    { id: 'dansha', name: '丹砂小炉', faction: '归真观', type: '策术', rarity: '常见', cost: 2, shield: 1, background: '炉火纯青，丹成九转。', skill: '装备：回合开始时获得一点护体；每回合首次使用立论后回复一点势。' },
    { id: 'taiqing', name: '太清符箓', faction: '归真观', type: '策术', rarity: '稀有', cost: 3, background: '符箓所至，万邪辟易。', skill: '移除己方所有负面状态；令敌方随机一人禁言一回合。' },
    { id: 'hebu', name: '鹤步凌虚', faction: '归真观', type: '立论', rarity: '史诗', cost: 3, attack: 3, hp: 5, background: '鹤鸣于九皋，声闻于天。', skill: '闪避敌方下次攻击；回复两点势；若本回合未受伤，下回合伤害增加一点并抽一张牌。' },
    // ====== 玄匠盟 ======
    { id: 'liannuju', name: '连弩匣', faction: '玄匠盟', type: '策术', rarity: '常见', cost: 2, background: '巧夺天工，连发不息。', skill: '装备：辩锋增加一点；每回合首次造成伤害额外增加一点。' },
    { id: 'jimu', name: '机关木鸢', faction: '玄匠盟', type: '立论', rarity: '常见', cost: 2, attack: 2, hp: 2, background: '木鸢飞天，洞察千里。', skill: '查看敌方随机一张手牌；本回合对其造成的伤害增加一点。' },
    { id: 'chengfang', name: '城防尺牍', faction: '玄匠盟', type: '立论', rarity: '常见', cost: 2, attack: 1, hp: 5, background: '尺牍绘城，方寸定攻守。', skill: '获得四点护体；若场上有场地，改为获得六点护体。' },
    { id: 'jianshi', name: '兼济匠师', faction: '玄匠盟', type: '立论', rarity: '稀有', cost: 4, attack: 2, hp: 4, background: '工以济世，手上有茧。', skill: '登场：从牌库寻找一张策术加入手牌；接下来两回合策术的势消耗减少一点。' },
    { id: 'qianji', name: '千机壁垒', faction: '玄匠盟', type: '策术', rarity: '史诗', cost: 4, shield: 2, background: '千机并起，壁垒如山。', skill: '场地：打出策术时获得两点护体；敌方每回合首次造成的伤害减少两点。' },
    // ====== 九阵堂 ======
    { id: 'jingqi', name: '旌旗换阵', faction: '九阵堂', type: '立论', rarity: '常见', cost: 2, attack: 2, hp: 3, background: '旗一翻，阵已换；敌未觉，我已先至。兵贵神速，亦贵其变。', skill: '获得两点护体；本回合对敌方造成的伤害增加一点；若本回合首次造成伤害，额外抽一张牌。' },
    { id: 'zhange', name: '战鼓催锋', faction: '九阵堂', type: '策术', rarity: '常见', cost: 2, background: '鼓三通，锋自锐；人未战，心先热。响处如雷，退者自惭。', skill: '本回合对敌方造成的伤害增加两点；若本回合首次造成伤害，抽一张牌。' },
    { id: 'bingshu', name: '兵书残卷', faction: '九阵堂', type: '策术', rarity: '稀有', cost: 3, background: '兵书虽残，杀机仍在行间。翻一页，便多一条活路。', skill: '装备：每回合一次，使用策术后抽一张牌；若该策术造成伤害，额外获得一点护体。' },
    { id: 'fengjun', name: '锋将·破军', faction: '九阵堂', type: '立论', rarity: '史诗', cost: 5, attack: 5, hp: 5, background: '破军之名，不在多言；一刃所向，阵自开。其势如风，入阵便止。', skill: '主动：对敌方单体造成五点伤害；若其势低于半数，再造成两点伤害。被动：你击败目标时，学识增加一点并抽一张牌。' },
    { id: 'poji', name: '破阵天雷', faction: '九阵堂', type: '策术', rarity: '传说', cost: 7, background: '天雷一落，阵法俱裂；尘沙未定，胜负已分。此一击，非人力可挡。', skill: '对所有敌方造成四点伤害；摧毁其全部护体；若本回合已使用过立论，额外造成两点伤害。' },
    // ====== 名相府 ======
    { id: 'baima', name: '白马非马', faction: '名相府', type: '策术', rarity: '常见', cost: 2, background: '换一词，便换一界。言之所至，足以移人心上的城墙。', skill: '令敌方选择：弃置两张牌；或令你抽两张牌。' },
    { id: 'mingshi', name: '名实互诘', faction: '名相府', type: '策术', rarity: '常见', cost: 1, background: '名若无实，言则成空。诘问之下，虚妄自碎。', skill: '反制正在结算的一张牌；成功后对其操作者施加惑（两回合）。' },
    { id: 'tongyi', name: '同异之辩', faction: '名相府', type: '立论', rarity: '常见', cost: 2, attack: 2, hp: 3, background: '同中见异，异中求同。辨到尽头，便是新路。', skill: '选择一项：抽两张牌然后弃置一张；或抽一张牌并获得三点护体。' },
    { id: 'cifeng', name: '辞锋术士', faction: '名相府', type: '立论', rarity: '稀有', cost: 3, attack: 2, hp: 3, background: '言为刃，辞为锋；未交手，先夺气。语不必大声，足以令对手失措。', skill: '登场：对敌方单体造成两点伤害并施加禁言（一回合）；每回合首次反制后抽一张牌。' },
    { id: 'guibian', name: '诡辩连环', faction: '名相府', type: '策术', rarity: '史诗', cost: 5, background: '环环相扣，理路如网；网一收，敌自乱。你越想挣脱，越陷得深。', skill: '连续进行三次：随机对一个敌方造成两点伤害；若目标已有负面状态，则改为三点伤害。' },
    // ====== 司天台 ======
    { id: 'xingpan', name: '星盘推演', faction: '司天台', type: '立论', rarity: '常见', cost: 1, attack: 1, hp: 2, background: '仰观星度，俯察人心。推一步，便少一步误算。', skill: '查看牌库顶三张，选择一张加入手牌，其余以任意顺序置回；若加入手牌的是策术，额外抽一张牌。' },
    { id: 'liangyi', name: '两仪折冲', faction: '司天台', type: '立论', rarity: '稀有', cost: 4, attack: 3, hp: 5, background: '阴不独行，阳不独立；折冲之间，万事可转。善用两仪者，进退皆安。', skill: '选择一项：为友方获得六点护体；或对敌方造成六点伤害。若本回合已使用过立论，两项皆生效（各减半）。' },
    { id: 'sichen', name: '司辰使', faction: '司天台', type: '立论', rarity: '稀有', cost: 3, attack: 1, hp: 4, background: '司辰执简，记日月之行；亦记人世之变。其言不多，却句句应时。', skill: '登场：学识增加一点；回合开始：若有学识，抽一张牌；当失去学识时，回复两点势。' },
    { id: 'nigua', name: '逆卦问凶', faction: '司天台', type: '策术', rarity: '常见', cost: 2, background: '逆卦一问，凶吉自显；既知其凶，便可避之。先避其锋，后取其隙。', skill: '令敌方下一次造成的伤害减少三点；并令其随机弃置一张手牌。' },
    { id: 'tianxiang', name: '天象更迭', faction: '司天台', type: '策术', rarity: '史诗', cost: 4, background: '天象一更，百端皆易；顺之者昌，逆之者劳。夜色轮转，局势亦轮转。', skill: '场地：每回合开始进行一次判定——若为"阴"，敌方受到两点伤害；若为"阳"，你获得两点护体；每回合首次触发判定时，额外抽一张牌。' },
    // ====== 游策阁 ======
    { id: 'hezong', name: '合纵之策', faction: '游策阁', type: '策术', rarity: '稀有', cost: 3, background: '合众之势，弱可抗强；一盟既定，海内皆动。言之所向，胜过刀兵。', skill: '从牌库检索至多两张不同类型的游策阁牌加入手牌；然后弃置一张牌。' },
    { id: 'lianheng', name: '连横之契', faction: '游策阁', type: '策术', rarity: '常见', cost: 2, background: '一契在手，进退皆利。合则为盟，散则为路。', skill: '装备：每回合首次使用策术时抽一张牌；若该策术为非本门派牌，额外获得一点护体。' },
    { id: 'youshuo', name: '游说之辞', faction: '游策阁', type: '立论', rarity: '常见', cost: 1, attack: 1, hp: 2, background: '三寸舌，能折铁；半句好言，能换刀兵。笑里藏尺，步步皆算。', skill: '令敌方选择：为你回复三点势；或弃置两张牌。' },
    { id: 'mengshu', name: '盟书', faction: '游策阁', type: '策术', rarity: '常见', cost: 2, background: '盟书不在纸墨，而在众心。字可改，势不可轻。', skill: '双方各抽一张牌；你获得三点护体；若敌方抽到策术（装备），则其本回合不能使用装备。' },
    { id: 'bafeng', name: '八面逢源', faction: '游策阁', type: '立论', rarity: '史诗', cost: 5, attack: 2, hp: 5, background: '笑不露锋，言不失度；四方皆盟，独行亦成。走到哪里，都能留下一条路。', skill: '登场：抽两张牌；每回合首次使用不同门派的牌时学识增加一点；当学识达到二时，额外抽一张牌。' },
    // ====== 万农坊 ======
    { id: 'chunggeng', name: '春耕起垄', faction: '万农坊', type: '策术', rarity: '常见', cost: 2, shield: 4, background: '铁犁入土，万物有序；一季辛劳，换一岁安稳。泥土不语，却最可靠。', skill: '获得四点护体；回合末若本回合未造成伤害，回复两点势。' },
    { id: 'guanqu', name: '灌渠引水', faction: '万农坊', type: '立论', rarity: '常见', cost: 1, attack: 1, hp: 2, background: '引一渠清水，便救一野干旱。水到之处，心便松一分。', skill: '抽一张牌；选择一名角色回复三点；若场上有场地，额外回复两点。' },
    { id: 'gucang', name: '谷仓封藏', faction: '万农坊', type: '策术', rarity: '常见', cost: 3, background: '谷入仓，心不慌；仓门一闭，便是冬年的底气。守住仓，也守住人心。', skill: '场地：每回合一次，回合结束时若本回合抽过牌，则再抽一张牌；当势低于半数时，获得六点护体并摧毁此场地。' },
    { id: 'tianshe', name: '田社长者', faction: '万农坊', type: '立论', rarity: '稀有', cost: 3, attack: 0, hp: 6, background: '不善言兵，但知养人；社中一呼，百家皆应。手里一把谷，心里一盏灯。', skill: '登场：回复四点并抽一张牌；友方每当回复势，额外获得一点护体（每回合限两次）。' },
    { id: 'wugu', name: '五谷丰登', faction: '万农坊', type: '策术', rarity: '史诗', cost: 5, background: '五谷既丰，万民可安；一城烟火，胜千军铁骑。丰年之喜，不需喧哗。', skill: '抽三张牌；回复六点；并使下回合开始时学识增加一点。' },
    // ====== 兼采楼 ======
    { id: 'baijia', name: '百家残页', faction: '兼采楼', type: '策术', rarity: '常见', cost: 2, background: '残页虽缺，仍有半句可用；拾起一片，便多一门。博杂不乱，贵在取舍。', skill: '装备：每回合首次使用不同类型的牌时抽一张牌；若该牌为非本门派，额外获得一点护体。' },
    { id: 'pangtong', name: '旁通', faction: '兼采楼', type: '立论', rarity: '常见', cost: 2, attack: 2, hp: 3, background: '旁通其理，不泥一门；借一缕风，便成一阵势。走偏门，亦可到正途。', skill: '重复你上一张立论的效果（数值减一，至少为一）；然后弃置一张牌。' },
    { id: 'jianai', name: '兼采其长', faction: '兼采楼', type: '策术', rarity: '稀有', cost: 4, background: '取其长，避其短；百家不相害，方成一体。能兼者强，能择者更强。', skill: '从下列选项中选两项：抽两张牌；获得四点护体；对敌方单体造成四点伤害；净化一个负面状态。' },
    // ====== 天工坊 ======
    { id: 'tiangong1', name: '墨家扣机', faction: '天工坊', type: '策术', rarity: '常见', cost: 2, background: '转轮三周，矢发不绝。机关之巧，胜过筋骨。', skill: '多次激发：连续造成两次一点伤害。' },
    { id: 'tiangong2', name: '云梯凌虚', faction: '天工坊', type: '策术', rarity: '稀有', cost: 3, shield: 2, background: '梯高过城，无处可避。俯瞰大地，唯见众心所向。', skill: '装备给角色：该角色攻击时无视掩护，直接贯穿至主将。' },
    { id: 'tiangong3', name: '枢机错落', faction: '天工坊', type: '策术', rarity: '史诗', cost: 4, background: '机扣相连，一动百动。万雷齐发，亦在呼吸之间。', skill: '每打出一张策术（装备），对所有敌方造成一点伤害。' },
    { id: 'tiangong4', name: '木鸢之御', faction: '天工坊', type: '立论', rarity: '传说', cost: 5, attack: 4, hp: 4, background: '木作飞禽，巡视天际。飞于高处，方知世间虚实。', skill: '登场：将牌库中两张策术（装备）置入手牌，其势消耗减半。' },
    { id: 'tiangong5', name: '震岳石弩', faction: '天工坊', type: '立论', rarity: '稀有', cost: 6, attack: 6, hp: 8, background: '石出如雷，山河震颤。凡重器者，必先定其形、后发其威。', skill: '对一列所有单位造成五点伤害，并摧毁该列的护栏与势。' },

    // ====== 两仪署 ======
    { id: 'liangyi1', name: '阴阳化宇', faction: '两仪署', type: '立论', rarity: '常见', cost: 2, attack: 2, hp: 3, background: '万物起于虚，归于无。阴阳之变，尽在方寸之间。', skill: '选择一项：对一个单位造成三点伤害，或为你回复三点势。' },
    { id: 'liangyi2', name: '五德流变', faction: '两仪署', type: '策术', rarity: '稀有', cost: 3, background: '金木水火土，流转不停。顺其自然，乃见道之妙。', skill: '你的下一次伤害翻倍，或下一次治疗翻倍。' },
    { id: 'liangyi3', name: '坎离折冲', faction: '两仪署', type: '策术', rarity: '史诗', cost: 3, background: '水润下而火炎上，阴阳相济，方能成周行之势。', skill: '对目标造成两点伤害，并为你自身回复两点势。' },
    { id: 'liangyi4', name: '两仪法象', faction: '两仪署', type: '立论', rarity: '稀有', cost: 4, attack: 3, hp: 5, background: '通晓阴阳，明断生死。方士眼中，人间皆为法阵。', skill: '登场：若上回合受过伤害，对敌方主将造成三点伤害。' },
    { id: 'liangyi5', name: '太极圆融', faction: '两仪署', type: '策术', rarity: '传说', cost: 5, background: '太极生两仪，循环往复。生灭之间，自有平衡。', skill: '每当有角色受伤，另一名随机角色回复等量势。' },

    // ====== 杏林馆 ======
    { id: 'xinglin1', name: '青囊解厄', faction: '杏林馆', type: '立论', rarity: '常见', cost: 1, attack: 1, hp: 2, background: '医者载青囊，行于乱世。针落之处，死生亦可易位。', skill: '为你或一名角色回复四点势。' },
    { id: 'xinglin2', name: '鸩毒反噬', faction: '杏林馆', type: '策术', rarity: '稀有', cost: 2, background: '毒者，药之偏也。以狂毒伏恶疾，乃兵行险着。', skill: '牺牲友方角色三点势，对敌方主将造成四点伤害。' },
    { id: 'xinglin3', name: '望闻问切', faction: '杏林馆', type: '立论', rarity: '常见', cost: 1, attack: 1, hp: 2, background: '观色听声，病症了然。知其里，则其表自明。', skill: '查看敌方手牌，本回合下一次受到的伤害减少两点。' },
    { id: 'xinglin4', name: '杏林医官', faction: '杏林馆', type: '立论', rarity: '史诗', cost: 4, attack: 2, hp: 6, background: '仁心存于方寸，妙术传于九针。', skill: '被动：每回合结束时，为所有友方回复一点势。' },
    { id: 'xinglin5', name: '九针百草索', faction: '杏林馆', type: '策术', rarity: '传说', cost: 3, shield: 2, background: '九针通脉，百药续命。生机之重，在此一索。', skill: '每当回复势，抽一张牌；装备者免疫所有负面状态。' },

    // ====== 稗言社 ======
    { id: 'baiyan1', name: '里巷微言', faction: '稗言社', type: '策术', rarity: '常见', cost: 1, background: '流言起于巷弄，无孔不入。风吹草动，皆成兵剑。', skill: '随机在一个友方与敌方角色之间交换一点辩锋。' },
    { id: 'baiyan2', name: '市虎三传', faction: '稗言社', type: '策术', rarity: '稀有', cost: 3, background: '传一为妄，传二为疑，传三则凿凿。言辞足以杀人。', skill: '选择一个敌方，对其施加惑（随之失去准确目标）。' },
    { id: 'baiyan3', name: '道听途说', faction: '稗言社', type: '立论', rarity: '常见', cost: 1, attack: 1, hp: 2, background: '真假莫辨，名实两分。听者不察，则受其愚。', skill: '抽两张牌，然后随机弃置一张。' },
    { id: 'baiyan4', name: '说书稗官', faction: '稗言社', type: '立论', rarity: '史诗', cost: 3, attack: 2, hp: 3, background: '评书一响，听众皆迷。真作假时假亦真。', skill: '登场：将一张随机的策术或立论牌加入你的手牌。' },
    { id: 'baiyan5', name: '舆论漩涡', faction: '稗言社', type: '玄章', rarity: '传说', cost: 4, background: '一传十，十传百。漩涡一起，无人能脱其身。', skill: '在每回合结束时，随机触发一次场上某个角色的技能。' },

    // ====== 养真院 ======
    { id: 'yangzhen1', name: '漱津调气', faction: '养真院', type: '立论', rarity: '常见', cost: 2, attack: 2, hp: 3, background: '吸清吐浊，气机周行。养其真气，则万邪不干。', skill: '获得清静（受到伤害减少），增加自身两点势。' },
    { id: 'yangzhen2', name: '守真餐风', faction: '养真院', type: '策术', rarity: '稀有', cost: 3, background: '不食人间烟火，自得长生。一念清净，万缘放下。', skill: '下回合不获得随机牌，但减少受到的所有伤害三点。' },
    { id: 'yangzhen3', name: '轻身飞举', faction: '养真院', type: '策术', rarity: '常见', cost: 2, shield: 1, background: '身轻如燕，不受制于地。心在云外，足不履尘。', skill: '装备给角色：该角色免疫下一次受到的伤害，且获得轻盈（闪避伤害）。' },
    { id: 'yangzhen4', name: '洗髓炼师', faction: '养真院', type: '立论', rarity: '史诗', cost: 4, attack: 3, hp: 5, background: '丹成之日，脱胎换骨。以此凡躯，通达造化。', skill: '当你使用策术提升自己属性时，效果额外增加一点。' },
    { id: 'yangzhen5', name: '养真丹炉', faction: '养真院', type: '策术', rarity: '传说', cost: 5, background: '炉火纯青，真金不散。磨而不磷，涅而不缁。', skill: '每累积失去五点势，便将一张强化效果牌加入手牌。' },

    // ====== 筹天阁 ======
    { id: 'choutian1', name: '蓍草筮吉', faction: '筹天阁', type: '立论', rarity: '常见', cost: 1, attack: 1, hp: 2, background: '神蓍一掷，定休咎，明进退。', skill: '预测你下一张抽到的牌，如符合，使其花费-1。' },
    { id: 'choutian2', name: '六爻飞星', faction: '筹天阁', type: '策术', rarity: '稀有', cost: 2, background: '飞星入命，祸福难知。天意如刀，避之则吉。', skill: '指定一个格子，两回合后若有单位，受四点伤害。' },
    { id: 'choutian3', name: '步斗量天', faction: '筹天阁', type: '策术', rarity: '常见', cost: 3, background: '履星步斗，莫知其踪。先觉其势，方可脱难。', skill: '每回合可以选择一次，移动一名友方角色的位置。' },
    { id: 'choutian4', name: '筹演术师', faction: '筹天阁', type: '立论', rarity: '史诗', cost: 4, attack: 1, hp: 4, background: '算尽天下，唯漏寸心。', skill: '登场：查看牌库顶三张牌，并将它们以任意顺序放回。' },
    { id: 'choutian5', name: '命数轮盘', faction: '筹天阁', type: '策术', rarity: '传说', cost: 5, background: '命运推演，不可逆反。势之所向，万物随变。', skill: '三回合后的回合末，秒杀当前场上势最低的角色。' },

    // ====== 礼心殿（二期）======
    { id: 'lixindian6', name: '礼辩成风', faction: '礼心殿', type: '立论', rarity: '常见', cost: 1, attack: 1, hp: 2, background: '一席礼语，压得满堂气焰全消。言之有序，胜过千言。', skill: '抽两张牌；本回合造成的伤害增加一点。' },
    { id: 'lixindian7', name: '明堂议事', faction: '礼心殿', type: '立论', rarity: '稀有', cost: 3, attack: 1, hp: 4, background: '明堂一开，诸事皆归礼序。中和之气，至刚至柔。', skill: '登场：每回合首次使用立论时抽一张牌；双方造成的伤害各减少一点（每回合）。' },
    { id: 'lixindian8', name: '六礼备至', faction: '礼心殿', type: '策术', rarity: '常见', cost: 2, background: '冠婚丧祭乡相见，六礼周全则天下安。', skill: '获得三点护体；本回合第一次受到伤害时，额外抽一张牌。' },
    { id: 'lixindian9', name: '仪队总规', faction: '礼心殿', type: '策术', rarity: '稀有', cost: 2, shield: 2, background: '仪仗列队，气象庄严；规矩既立，百事顺遂。', skill: '装备：每打出一张立论后，获得一点护体。' },
    { id: 'lixindian10', name: '礼义廉耻', faction: '礼心殿', type: '策术', rarity: '传说', cost: 3, background: '四维不张，国乃灭亡。一言驳斥，胜过刀兵。', skill: '反制正在结算的一张牌；成功后净化全部负面状态，并令对手获得惑（两回合）。' },

    // ====== 衡戒廷（二期）======
    { id: 'hengjieting6', name: '规典立则', faction: '衡戒廷', type: '立论', rarity: '常见', cost: 1, attack: 1, hp: 2, background: '法典一立，天下皆知规矩。无规矩则不成方圆。', skill: '抽一张牌；若本回合已反制过牌，改为抽两张牌且获得两点护体。' },
    { id: 'hengjieting7', name: '廷尉执法', faction: '衡戒廷', type: '立论', rarity: '史诗', cost: 5, attack: 3, hp: 5, background: '廷尉执法，公正严明。铁腕从不因情而曲。', skill: '登场：令敌方所有角色获得禁言（一回合）；每回合使用反制后，该角色攻击增加一点。' },
    { id: 'hengjieting8', name: '词讼禁止', faction: '衡戒廷', type: '策术', rarity: '常见', cost: 1, background: '讼不当庭，则止于门；止于门，则止于根。', skill: '反制正在结算的一张牌；成功后令对手本回合不能再使用同类型的牌。' },
    { id: 'hengjieting9', name: '罪状核查', faction: '衡戒廷', type: '策术', rarity: '稀有', cost: 2, background: '千条罪状，一状入实则全盘松动。', skill: '查看对手手牌；若其有三张以上，令其随机弃置一张并对其造成两点伤害。' },
    { id: 'hengjieting10', name: '刑狱制衡', faction: '衡戒廷', type: '策术', rarity: '史诗', cost: 4, background: '刑狱之制，非为惩一人，乃为安天下。', skill: '场地：每当对手打出牌，有三成概率令其获得失序；每回合首次被打出牌伤害时，抽一张牌。' },

    // ====== 归真观（二期）======
    { id: 'guizhen6', name: '清虚静笃', faction: '归真观', type: '立论', rarity: '常见', cost: 1, attack: 1, hp: 2, background: '清虚者，道之本；静笃者，德之根。一心归真，万虑皆散。', skill: '回复两点势；本回合第一次受到伤害时，获得两点护体。' },
    { id: 'guizhen7', name: '炼气储真', faction: '归真观', type: '立论', rarity: '稀有', cost: 4, attack: 3, hp: 5, background: '真气充盈，百病不侵；内力深厚，外物难损。', skill: '被动：每回合结束时若未受伤，回复一点势并获得正义；正义达到五时，清除所有负面状态。' },
    { id: 'guizhen8', name: '虚空契道', faction: '归真观', type: '策术', rarity: '稀有', cost: 3, background: '虚室生白，吉祥止止。空处生明，无为而成。', skill: '净化全部负面状态；回复四点势；若本回合未使用过牌，改为回复七点。' },
    { id: 'guizhen9', name: '炉鼎炼气', faction: '归真观', type: '策术', rarity: '常见', cost: 2, shield: 2, background: '鼎炉相配，水火既济；炼气自成，进退皆宜。', skill: '装备：每打出立论后回复一点势；若该立论净化过负面，额外回复一点。' },
    { id: 'guizhen10', name: '归一守中', faction: '归真观', type: '策术', rarity: '传说', cost: 4, background: '天下万物归于一，一归于无；守中不偏，道自在。', skill: '场地：每回合结束若未造成过伤害，获得四点护体；每回合第一次回复势，额外回复一点。' },

    // ====== 玄匠盟（二期）======
    { id: 'xuanjang6', name: '奇械造化', faction: '玄匠盟', type: '立论', rarity: '常见', cost: 1, attack: 1, hp: 2, background: '妙手偶得，奇机自出。工匠之道，在于化腐朽为神奇。', skill: '从牌库检索一张策术（装备）牌加入手牌；若手牌中有装备，抽一张牌。' },
    { id: 'xuanjang7', name: '大匠造物', faction: '玄匠盟', type: '立论', rarity: '史诗', cost: 5, attack: 2, hp: 4, background: '大匠不示人以璞，示人以器。器成，则天下皆知其能。', skill: '登场：将一张策术（装备）牌直接装备上；被动：每打出装备牌，造成两点伤害。' },
    { id: 'xuanjang8', name: '铸甲精钢', faction: '玄匠盟', type: '策术', rarity: '稀有', cost: 3, shield: 3, background: '精钢百炼，甲胄如山；虽千军万马，亦难寸进。', skill: '装备：受到的伤害减少两点；若本次受到的伤害来自策术，改为减少三点。' },
    { id: 'xuanjang9', name: '轮轴连动', faction: '玄匠盟', type: '策术', rarity: '常见', cost: 2, background: '一轴连百轮，一动百动。机关之妙，在此一环。', skill: '若场上有装备，连锁触发其效果一次；获得两点护体。' },
    { id: 'xuanjang10', name: '机关总成', faction: '玄匠盟', type: '策术', rarity: '传说', cost: 5, background: '千机合而为一，方成大器。一动，天下皆动。', skill: '场地：每打出装备牌，令敌方随机一名角色受到一点伤害；有三件及以上装备时，每回合额外造成两点伤害。' },

    // ====== 九阵堂（二期）======
    { id: 'jiuzhen6', name: '破釜沉舟', faction: '九阵堂', type: '立论', rarity: '稀有', cost: 2, attack: 2, hp: 4, background: '釜破舟沉，退路已绝；唯有奋进，方可生还。', skill: '弃置一张手牌；本回合造成的伤害增加四点，但不能获得护体直到回合结束。' },
    { id: 'jiuzhen7', name: '先锋悍将', faction: '九阵堂', type: '立论', rarity: '史诗', cost: 4, attack: 5, hp: 3, background: '先锋者，冲锋于前，不知退却。其势如虎，不可当也。', skill: '登场：对敌方单体造成四点伤害；若其势已低于最大值半数，再造成两点。被动：击杀后立即再行动一次。' },
    { id: 'jiuzhen8', name: '三才合围', faction: '九阵堂', type: '策术', rarity: '稀有', cost: 3, background: '天时地利人和，三者合则围困难解。', skill: '对敌方所有目标各造成两点伤害；若其中单个目标已受本回合伤害，对该目标改为三点。' },
    { id: 'jiuzhen9', name: '将帅之盾', faction: '九阵堂', type: '策术', rarity: '常见', cost: 2, shield: 2, background: '将帅在后，盾在前。将不死，阵不溃。', skill: '装备：每回合首次受到伤害时减少两点；每回合首次造成伤害时，获得一点护体。' },
    { id: 'jiuzhen10', name: '八卦阵图', faction: '九阵堂', type: '策术', rarity: '传说', cost: 5, background: '八门休生伤杜景死惊开，乾坤玄机，困敌无路。', skill: '场地：敌方每回合第一次使用牌后，令其获得失序；每回合第一次造成伤害，该伤害增加两点。' },

    // ====== 名相府（二期）======
    { id: 'mingxiang6', name: '辩名定义', faction: '名相府', type: '立论', rarity: '常见', cost: 1, attack: 1, hp: 2, background: '名实既定，言辞已立；先定其名，则争议自消。', skill: '抽一张牌；若本回合已使用过反制，改为抽两张牌且令对手弃置一张牌。' },
    { id: 'mingxiang7', name: '名家辩手', faction: '名相府', type: '立论', rarity: '稀有', cost: 3, attack: 2, hp: 3, background: '言语如剑，辞锋所指，天下皆知其锐。', skill: '被动：每使用一张反制，造成一点伤害；回合末若使用过两张反制，额外抽一张牌。' },
    { id: 'mingxiang8', name: '名实相悖', faction: '名相府', type: '策术', rarity: '稀有', cost: 2, background: '言之悖论，自陷于囹；一语戳破，万言皆空。', skill: '反制正在结算的一张牌；成功后令对手本回合费用增加两点（使用牌更贵）。' },
    { id: 'mingxiang9', name: '名实洞穿', faction: '名相府', type: '策术', rarity: '史诗', cost: 4, background: '一言穿透千层幕，概念既清，论争自息。', skill: '令对手手牌随机弃置一张；若其被弃牌为立论，额外对敌方主将造成三点伤害。' },
    { id: 'mingxiang10', name: '名相倒推', faction: '名相府', type: '策术', rarity: '传说', cost: 4, background: '正推得名，倒推得实；名相倒立，天下皆知其妙。', skill: '场地：每当使用反制成功，抽一张牌；每回合第一次使用立论或反制，费用减少一点。' },

    // ====== 司天台（二期）======
    { id: 'sitian6', name: '观天象变', faction: '司天台', type: '立论', rarity: '常见', cost: 1, attack: 1, hp: 2, background: '仰观俯察，顺势而为；天象既变，人事随变。', skill: '进行一次判定：阳则抽两张牌；阴则获得三点护体。' },
    { id: 'sitian7', name: '太史占星', faction: '司天台', type: '立论', rarity: '稀有', cost: 4, attack: 1, hp: 5, background: '太史执简，观星测变；其预言，无不应验。', skill: '登场：查看牌库顶四张，选一张加入手牌；被动：每触发一次判定，抽一张牌（每回合限一次）。' },
    { id: 'sitian8', name: '天运推定', faction: '司天台', type: '策术', rarity: '史诗', cost: 4, background: '天运一定，万事随之；推定其运，则胜负先知。', skill: '连续进行三次判定：每次阳则造成两点伤害；每次阴则回复两点势。' },
    { id: 'sitian9', name: '天文仪器', faction: '司天台', type: '策术', rarity: '常见', cost: 2, background: '浑天仪、地动仪、漏刻……精准推算，早知天机。', skill: '装备：触发判定时可选择重来一次（每回合限一次）；每回合首次判定后抽一张牌。' },
    { id: 'sitian10', name: '七政运转', faction: '司天台', type: '策术', rarity: '传说', cost: 6, background: '日月金木水火土，七政运转不停歇；顺之者昌，逆之者亡。', skill: '场地：每回合开始进行两次判定，每次阳则对敌造成两点伤害，每次阴则回复两点势；判定结果不可被改变。' },

    // ====== 游策阁（二期）======
    { id: 'youce6', name: '凤鸣朝阳', faction: '游策阁', type: '立论', rarity: '稀有', cost: 2, attack: 2, hp: 4, background: '凤鸣一声，四方皆知其至；游说天下，不动刀兵。', skill: '令对手选择：弃置三张牌；或令你抽三张牌；或令你获得五点护体。' },
    { id: 'youce7', name: '说客名士', faction: '游策阁', type: '立论', rarity: '史诗', cost: 5, attack: 1, hp: 5, background: '一言之力，胜千军万马；说客名士，以言为剑。', skill: '登场：令对手弃置两张牌并抽两张牌（你选对手弃的牌）；被动：每使用一张策术，令对手弃置一张牌。' },
    { id: 'youce8', name: '反间之计', faction: '游策阁', type: '策术', rarity: '稀有', cost: 3, background: '离间敌心，祸乱其营；内乱已生，外患不用。', skill: '令对手下回合使用的第一张牌效果翻倍，但伤害反弹于对手自身。' },
    { id: 'youce9', name: '游说之器', faction: '游策阁', type: '策术', rarity: '常见', cost: 2, background: '言辞为器，游说为道；器精则言锐，道通则事成。', skill: '装备：每打出策术牌，可选令对手弃置一张牌或你抽一张牌（二选一）。' },
    { id: 'youce10', name: '纵横天下', faction: '游策阁', type: '策术', rarity: '传说', cost: 5, background: '纵横捭阖，天下皆在掌中；合则利，分则害。', skill: '场地：双方每打出两张牌，你抽一张牌；每回合使用不同门派的牌，额外抽一张牌（每回合限一次）。' },

    // ====== 万农坊（二期）======
    { id: 'wannong6', name: '丰收积粮', faction: '万农坊', type: '立论', rarity: '常见', cost: 1, attack: 1, hp: 2, background: '积粮千仓，战时方不慌张；丰年不忘荒年备。', skill: '回复三点势；若势已满，改为获得三点护体。' },
    { id: 'wannong7', name: '田间老农', faction: '万农坊', type: '立论', rarity: '稀有', cost: 3, attack: 0, hp: 7, background: '老农一生，勤勉持重；不言胜利，只知耕作。', skill: '被动：每回合结束若势未满，回复两点；若势为最大值，抽一张牌。' },
    { id: 'wannong8', name: '仓廪丰实', faction: '万农坊', type: '策术', rarity: '史诗', cost: 4, background: '仓廪实则知礼节，衣食足则知荣辱。粮草充足，则战心坚固。', skill: '回复八点势；若本回合未造成过伤害，额外获得五点护体。' },
    { id: 'wannong9', name: '农具改良', faction: '万农坊', type: '策术', rarity: '常见', cost: 2, shield: 1, background: '铁犁胜木耒，改良之功，往往胜过增兵。', skill: '装备：回合开始回复一点势；每回合第一次回复势，额外回复一点。' },
    { id: 'wannong10', name: '五亩之宅', faction: '万农坊', type: '策术', rarity: '传说', cost: 4, background: '五亩之宅，树之以桑；鸡豚狗彘，无失其时——民足则国强。', skill: '场地：每回合结束获得两点护体；若本回合势回复过，改为获得四点护体。' },

    // ====== 兼采楼（补全+二期）======
    { id: 'jianai2', name: '百家争鸣', faction: '兼采楼', type: '策术', rarity: '传说', cost: 5, background: '百家并立，各鸣其是；争鸣之中，真理得见。', skill: '场地：每打出一张其他门派的牌，获得该门派的一个随机效果（小型版）。' },
    { id: 'jianai3', name: '融通百技', faction: '兼采楼', type: '立论', rarity: '史诗', cost: 5, attack: 2, hp: 5, background: '博采众长，融通百技；不执一门，而精于一门。', skill: '登场：从牌库检索三张不同类型的牌，选一张加入手牌；被动：每使用不同类型的牌，学识增加一点；学识每达二，抽一张牌。' },
    { id: 'jianai4', name: '学贯通匠', faction: '兼采楼', type: '立论', rarity: '稀有', cost: 2, attack: 2, hp: 4, background: '学贯百家，通于一匠；博而不杂，精而不偏。', skill: '查看牌库顶五张，选两张加入手牌，其余置回；若这两张类型不同，获得两点护体。' },
    { id: 'jianai5', name: '综合推论', faction: '兼采楼', type: '策术', rarity: '史诗', cost: 4, background: '综百家之说而推之，一论既出，诸说为注。', skill: '选择以下全部或部分（每项需弃置一张手牌）：抽两张牌；获得四点护体；对敌方单体造成四点伤害；净化一个负面状态。' },
    { id: 'jianai6', name: '博闻强记', faction: '兼采楼', type: '策术', rarity: '稀有', cost: 3, background: '博闻可知天下事，强记可定千古功。', skill: '装备：手牌中每有一种不同类型的牌，获得一点护体（每回合结算）；手牌上限增加两点。' },

    // ====== 天工坊（二期）======
    { id: 'tiangong6', name: '甲兵连动', faction: '天工坊', type: '立论', rarity: '常见', cost: 1, attack: 1, hp: 2, background: '一轴引百轮，全局之动，皆收束于纤毫之机。', skill: '造成两点伤害；若本回合已使用过装备牌，改为造成三点且抽一张牌。' },
    { id: 'tiangong7', name: '霹雳惊雷', faction: '天工坊', type: '立论', rarity: '传说', cost: 6, attack: 8, hp: 3, background: '铁室藏火，石弹摧云。震天动地之处，诸邪自溃。', skill: '登场：对所有敌方造成五点伤害；每回合自动对随机敌方造成两点伤害，但不能主动攻击。' },
    { id: 'tiangong8', name: '机动甲卫', faction: '天工坊', type: '策术', rarity: '稀有', cost: 3, shield: 3, background: '以铜为肤，以簧为心。不知疲累，亦无惧生死之辩。', skill: '装备：受到的伤害减少两点；每回合使用装备牌后，获得一点护体（最多叠三层）。' },
    { id: 'tiangong9', name: '铁骑横戈', faction: '天工坊', type: '策术', rarity: '史诗', cost: 5, background: '铁蹄踏处，戈矛所向。排山倒海之势，非坚城可挡。', skill: '对所有敌方角色各造成三点伤害；若其中有护体，穿透一点护体再造成三点伤害。' },
    { id: 'tiangong10', name: '墨匠圣坊', faction: '天工坊', type: '策术', rarity: '史诗', cost: 4, background: '熔炉昼夜，百炼生锈。天下之奇器，皆出此庄严之门。', skill: '场地：每回合开始将一张随机装备牌加入手牌（费用减一）；手牌中每有两张装备，对敌方造成一点伤害。' },

    // ====== 两仪署（二期）======
    { id: 'liangyi6', name: '两仪和息', faction: '两仪署', type: '立论', rarity: '常见', cost: 1, attack: 1, hp: 2, background: '一刚一柔，一进一退。和合而生，乃为天地长久之道。', skill: '选两项：回复两点势；造成两点伤害；抽一张牌；获得两点护体。' },
    { id: 'liangyi7', name: '法象宗师', faction: '两仪署', type: '立论', rarity: '稀有', cost: 4, attack: 3, hp: 4, background: '身处三界外，心在两仪中。挥手之间，局势翻转。', skill: '登场：选择阴或阳——阴：对敌造成五点伤害；阳：回复五点势。被动：每回合交替触发两项效果。' },
    { id: 'liangyi8', name: '五行生杀', faction: '两仪署', type: '策术', rarity: '史诗', cost: 4, background: '生者为养，杀者为戒。五行之变，无一幸免，无一不生。', skill: '对敌方造成三点伤害；回复三点势；摧毁一件敌方装备；净化一个负面状态；抽一张牌。' },
    { id: 'liangyi9', name: '两仪守中', faction: '两仪署', type: '策术', rarity: '常见', cost: 2, shield: 2, background: '护符双现，守其中道。一念清净，则百邪不侵。', skill: '装备：每回合开始选择：获得两点护体；或回复两点势；两次选择必须不同。' },
    { id: 'liangyi10', name: '太极万象', faction: '两仪署', type: '策术', rarity: '传说', cost: 5, background: '万象归一，一归于道。图一展，则天下气运皆在此。', skill: '场地：每受到两点伤害，获得一点护体；每回复两点势，额外造成一点伤害。' },

    // ====== 杏林馆（二期）======
    { id: 'xinglin6', name: '施针问诊', faction: '杏林馆', type: '立论', rarity: '常见', cost: 1, attack: 1, hp: 2, background: '施针定穴，问诊察色；医者仁心，在此一刺。', skill: '回复三点势；若本回合已回复过势，改为回复五点。' },
    { id: 'xinglin7', name: '神农传人', faction: '杏林馆', type: '立论', rarity: '史诗', cost: 5, attack: 1, hp: 8, background: '神农尝百草，传人续悬壶；医术高绝，救死扶伤。', skill: '被动：每回合结束时，回复两点势；若势低于最大值半数，改为回复四点。' },
    { id: 'xinglin8', name: '本草秘方', faction: '杏林馆', type: '策术', rarity: '稀有', cost: 2, shield: 2, background: '秘方守密不轻传，一旦传出，病可立愈。', skill: '装备：每打出一张立论，回复一点势；每回合回复势时，若已连续回复三回合，额外抽一张牌。' },
    { id: 'xinglin9', name: '百草精华', faction: '杏林馆', type: '策术', rarity: '史诗', cost: 4, background: '百草萃取，精华为丸；一丸入口，沉疴立起。', skill: '回复十点势；净化全部负面状态；若本回合未受伤，额外获得四点护体。' },
    { id: 'xinglin10', name: '杏林春暖', faction: '杏林馆', type: '策术', rarity: '传说', cost: 5, background: '杏林春暖，万民归心；仁术感天地，医德动鬼神。', skill: '场地：每回合开始回复两点势；每当回复势，有半数概率额外回复一点；势上限增加五点。' },

    // ====== 稗言社（二期）======
    { id: 'baiyan6', name: '匿名投书', faction: '稗言社', type: '立论', rarity: '常见', cost: 1, attack: 1, hp: 2, background: '匿名一封，满城风雨；不知来者，皆疑其是。', skill: '查看对手手牌一张；若该牌费用大于等于三，令其本回合不能使用该牌。' },
    { id: 'baiyan7', name: '说书老翁', faction: '稗言社', type: '立论', rarity: '史诗', cost: 4, attack: 1, hp: 5, background: '一叶障目，不见泰山；说书老翁，巧言令色，扰人心智。', skill: '被动：每回合使用一张牌，有二成五概率令对手随机弃置一张手牌；每回合最多触发两次。' },
    { id: 'baiyan8', name: '谶语迷惑', faction: '稗言社', type: '策术', rarity: '稀有', cost: 3, background: '谶语一出，人人自危；真真假假，无从分辨。', skill: '令对手手牌随机洗回牌库，再抽等量——对手不知新手牌内容（视觉效果）；令对手获得惑（两回合）。' },
    { id: 'baiyan9', name: '谣言载体', faction: '稗言社', type: '策术', rarity: '稀有', cost: 2, background: '谣言如病毒，载体不灭则病不止。', skill: '装备：每回合开始，对手随机一张手牌获得幻象，使用时效果减半；每回合触发一次。' },
    { id: 'baiyan10', name: '流言狂飙', faction: '稗言社', type: '策术', rarity: '传说', cost: 5, background: '舆论一起，如漩涡吞人；身陷其中，无路可逃。', skill: '场地：对手每使用一张牌，有四成概率令对手弃置一张手牌；对手手牌每次低于三张时，令其获得失序。' },

    // ====== 养真院（二期）======
    { id: 'yangzhen6', name: '养生固本', faction: '养真院', type: '立论', rarity: '常见', cost: 1, attack: 1, hp: 2, background: '固其根本，则枝叶自茂；养其真气，则百病不侵。', skill: '回复两点势；获得两点护体；若本回合未使用过其他牌，两项效果各增加一点。' },
    { id: 'yangzhen7', name: '真人修士', faction: '养真院', type: '立论', rarity: '史诗', cost: 5, attack: 2, hp: 6, background: '真人者，不逆寡，不雄成；登高不栗，入水不濡，入火不热。', skill: '被动：每回合末若比回合初势更多，获得三点护体；每积累五点护体转化为一点势。' },
    { id: 'yangzhen8', name: '节欲保元', faction: '养真院', type: '策术', rarity: '稀有', cost: 2, background: '节欲则元气固，元气固则百病消；一念清净，万缘放下。', skill: '净化全部负面状态；回复四点势；本回合下一次受伤减少三点。' },
    { id: 'yangzhen9', name: '玉液金丹', faction: '养真院', type: '策术', rarity: '稀有', cost: 3, shield: 2, background: '玉液滋养，金丹续命；一服入口，枯木逢春。', skill: '装备：每回合开始回复一点势；若本回合末比回合初多回复了三点以上势，额外抽一张牌。' },
    { id: 'yangzhen10', name: '修真祖庭', faction: '养真院', type: '策术', rarity: '传说', cost: 5, background: '祖庭在此，真道在此；修真者归于此，方知天地大道。', skill: '场地：每回合开始获得两点护体并回复一点势；每积累回复十点势，获得一次额外行动（可使用一张牌）。' },

    // ====== 筹天阁（二期）======
    { id: 'choutian6', name: '推演布局', faction: '筹天阁', type: '立论', rarity: '常见', cost: 1, attack: 1, hp: 2, background: '推演一步，便知千步；布局在先，则胜利在握。', skill: '查看牌库顶两张，选一张加入手牌，另一张放于牌库底；若选择的牌费用小于等于二，抽一张牌。' },
    { id: 'choutian7', name: '筹算宗师', faction: '筹天阁', type: '立论', rarity: '史诗', cost: 5, attack: 2, hp: 4, background: '宗师一算，胜负已定；其推演精准，如神明降世。', skill: '登场：查看对手全部手牌，选其中两张并令其弃置；被动：对牌库顶的预知永久增加两张。' },
    { id: 'choutian8', name: '死局重排', faction: '筹天阁', type: '策术', rarity: '稀有', cost: 3, background: '看似死局，却可重排；一子落处，柳暗花明。', skill: '将你的弃牌堆洗回牌库；抽三张牌；令对手将手牌随机置入其牌库（对手重抽等量）。' },
    { id: 'choutian9', name: '推演图表', faction: '筹天阁', type: '策术', rarity: '稀有', cost: 2, background: '图表在手，预知先行；算无遗策，方可决胜千里。', skill: '装备：每回合抽牌时，可看到抽到的牌再决定要不要（弃掉则对手不知）；每次弃掉抽到的牌，对手受一点伤害。' },
    { id: 'choutian10', name: '天罗地网', faction: '筹天阁', type: '策术', rarity: '传说', cost: 6, background: '天罗地网，无处可逃；算尽天下，唯漏一心。', skill: '场地：每预测一张对手将使用的牌类型（每回合开始时选择），若猜中，对手该牌效果减半；猜中三次后，对手的一张牌被永久封闭直到对局结束。' },

    // ====== 通用（四门派文档并入）======
    { id: 'xinglvxuezi', name: '行旅学子', faction: '通用', type: '立论', rarity: '常见', cost: 1, attack: 1, hp: 2, background: '行旅四方，兼听并记，所学皆可为用。', skill: '无效果。' },
    { id: 'xiangyishuli', name: '乡议书吏', faction: '通用', type: '立论', rarity: '常见', cost: 2, attack: 2, hp: 2, background: '乡议之间，执笔成文，守拙而不失衡。', skill: '若置于旁议，进场时抽一张牌，然后弃置一张牌。' },
    { id: 'gongyishouxi', name: '公议守席', faction: '通用', type: '立论', rarity: '常见', cost: 2, attack: 2, hp: 2, background: '守席不争先，重在稳其位、定其论。', skill: '若置于主议，本回合辩锋增加一点。' },
    { id: 'anqianzhijian', name: '案前执简', faction: '通用', type: '立论', rarity: '常见', cost: 3, attack: 3, hp: 2, background: '案前执简，词章有据，进退有度。', skill: '无效果。' },
    { id: 'liangduanhengliang', name: '两端衡量', faction: '通用', type: '策术', rarity: '常见', cost: 1, background: '衡量两端，求其可行，先定轻重后决胜负。', skill: '一张己方立论本回合辩锋增加一点。' },
    { id: 'gengxierlun', name: '更席而论', faction: '通用', type: '策术', rarity: '常见', cost: 1, background: '更席不改旨，换位只为取势。', skill: '将一张己方立论移到另一个议位。' },
    { id: 'shoushuchengwen', name: '收束成文', faction: '通用', type: '策术', rarity: '常见', cost: 2, background: '论至要处，当收其锋，成其章。', skill: '抽两张牌，然后弃置一张牌。' },
    { id: 'bozaquwu', name: '驳杂去芜', faction: '通用', type: '策术', rarity: '常见', cost: 2, background: '去其芜杂，留其主干，方能见真义。', skill: '一张敌方立论本回合辩锋减少一点。' },
    { id: 'pangzhengboyin', name: '旁征博引', faction: '通用', type: '策术', rarity: '稀有', cost: 3, background: '博引旁征，证据自成链，辩势随之而起。', skill: '一张己方立论本回合辩锋增加一点、学识增加一点。' },
    { id: 'gonglunchengshi', name: '公论成势', faction: '通用', type: '策术', rarity: '稀有', cost: 4, background: '公论既成，势不可逆；守其主议，便可再进一步。', skill: '若本回合赢得主议，且该主议上的己方立论本回合未发生移动，额外增加一点大势。每回合最多使用一张。' },
    { id: 'shouchengzhiyi', name: '守成之议', faction: '通用', type: '立论', rarity: '常见', cost: 3, attack: 2, hp: 3, background: '守成之议，贵在稳心稳局，不求一时锋芒。', skill: '进场时，若置于主议，学识增加一点。' },
    { id: 'jiantingzeming', name: '兼听则明', faction: '通用', type: '策术', rarity: '稀有', cost: 4, background: '兼听可明，偏听则暗；先广闻，后定断。', skill: '抽两张牌；然后一张己方立论学识增加一点。' },
];

export const CARDS: CardData[] = RAW_CARDS.map((card) => {
    const activeType = RAW_TYPE_TO_ACTIVE[card.type];
    const normalized = buildStructuredRule(card, activeType);
    return {
        ...card,
        type: activeType,
        ruleText: normalized.ruleText,
        rule: normalized.rule,
    };
});
