// 稀有度颜色映射
export const rarityColor: Record<string, string> = {
    '常见': '#9ca3af',
    '稀有': '#60a5fa',
    '史诗': '#a855f7',
    '传说': '#f59e0b',
};

export type CanonicalCardType = '立论' | '策术' | '玄章' | '门客' | '反诘';
export type LegacyCardType = '技能' | '事件' | '场地' | '角色' | '装备' | '反制';
export type ShowcaseCardType = CanonicalCardType | LegacyCardType;

// 卡牌类型背景颜色（新旧类型兼容）
export const typeColor: Record<ShowcaseCardType, string> = {
    '技能': '#064e3b',
    '事件': '#7c3aed',
    '场地': '#1e3a5f',
    '装备': '#78350f',
    '角色': '#831843',
    '反制': '#4c1d95',
    '立论': '#064e3b',
    '策术': '#7c3aed',
    '玄章': '#1e3a5f',
    '门客': '#831843',
    '反诘': '#4c1d95',
};

export interface CardData {
    id: string;
    name: string;
    faction: string;
    type: ShowcaseCardType;
    rarity: string;
    background: string;
    skill: string;
    cost: number;
    attack?: number;
    hp?: number;
    shield?: number;
    imageUrl?: string;
}

export const CARDS: CardData[] = [
    // ====== 礼心殿 (原生系列) ======
    { id: 'wenyan', name: '温言立论', faction: '礼心殿', type: '立论', rarity: '常见', cost: 1, background: '言不急则理自明，笑里藏锋亦不伤人。青灯一盏，足压满堂躁气。', skill: '抽1；若你本回合已使用过本门派牌，改为抽2。', imageUrl: '/assets/cards/v2/wenyan.webp' },
    { id: 'zhuduchao', name: '竹牍抄录', faction: '礼心殿', type: '策术', rarity: '常见', cost: 2, background: '抄一段旧文，便得一线新路。字落竹纹，心亦随之安定。', skill: '从牌库检索1张【立论】牌加入手牌；然后弃1张牌。' },
    { id: 'jiangxi', name: '讲席清规', faction: '礼心殿', type: '玄章', rarity: '常见', cost: 2, shield: 3, background: '讲席之上，清规如绳；入其门者，先收浮躁。几行规约，胜过千句喝止。', skill: '你每回合第1次使用【立论】牌时，抽1；回合末若你本回合未使用牌，获得【护持3】。' },
    { id: 'sishi', name: '司史执笔', faction: '礼心殿', type: '门客', rarity: '稀有', cost: 3, attack: 2, hp: 4, background: '司史不争一时胜负，只记千年是非。笔落之处，便是人心的据证。', skill: '登场：抽1；选择1项：对敌方施加【怀疑+1（2回合）】；或令友方获得【护持4】。' },
    { id: 'libian', name: '礼辩同归', faction: '礼心殿', type: '策术', rarity: '史诗', cost: 4, shield: 2, background: '礼起则群心不乱，辩正则万事可行。揖让之间，锋芒尽收。', skill: '双方各抽1；本回合你造成的伤害+2，且你获得【护持2】。' },

    // ====== 衡戒廷 (原生系列) ======
    { id: 'tiequan', name: '铁券禁令', faction: '衡戒廷', type: '策术', rarity: '稀有', cost: 3, background: '铁券一下，百口噤声；禁令既出，寸步难行。法不待情，唯待执行。', skill: '敌方下回合不能抽牌；若其仍触发抽牌效果，则改为随机弃1张手牌。' },
    { id: 'duanjian', name: '断简成法', faction: '衡戒廷', type: '反诘', rarity: '常见', cost: 2, background: '纷简可断，法度不可断。刀不为杀，只为分明。', skill: '反制正在结算的1张牌；成功后使其操作者弃1张牌。' },
    { id: 'jianyin', name: '缄印封检', faction: '衡戒廷', type: '策术', rarity: '稀有', cost: 2, shield: 1, background: '一绳一泥，一印一验；密不可窥，制可长行。封缄之处，亦是信与戒。', skill: '装备给角色；该角色受到的首次伤害-2；装备者每回合第1次使用【反诘】后抽1。' },
    { id: 'juwentang', name: '鞫问堂', faction: '衡戒廷', type: '玄章', rarity: '常见', cost: 2, background: '鞫问之下，词难成网；灯火一照，心自见形。堂上无风，亦觉寒意。', skill: '每当敌方使用【立论】牌，其受到1点伤害；若其本回合已受伤，额外+1。' },
    { id: 'chilin', name: '一纸敕令', faction: '衡戒廷', type: '策术', rarity: '传说', cost: 6, background: '纸薄而令重，片言可动千军。敕下如雷，众心自齐。', skill: '选择1项：①摧毁所有敌方【策术】；②本回合敌方不能使用牌；③你抽3并获得【护持6】。' },

    // ====== 九阵堂 ======
    { id: 'jingqi', name: '旌旗换阵', faction: '九阵堂', type: '立论', rarity: '常见', cost: 2, background: '旗一翻，阵已换；敌未觉，我已先至。兵贵神速，亦贵其变。', skill: '获得【护持2】；本回合你造成的伤害+1；若你本回合首次造成伤害，额外抽1。' },
    { id: 'zhange', name: '战鼓催锋', faction: '九阵堂', type: '策术', rarity: '常见', cost: 2, background: '鼓三通，锋自锐；人未战，心先热。响处如雷，退者自惭。', skill: '本回合你造成的伤害+2；若你本回合首次造成伤害，抽1。' },
    { id: 'bingshu', name: '兵书残卷', faction: '九阵堂', type: '策术', rarity: '稀有', cost: 3, background: '兵书虽残，杀机仍在行间。翻一页，便多一条活路。', skill: '装备：每回合一次，你使用【事件】后抽1；若该事件造成伤害，额外获得【护持1】。' },
    { id: 'fengjun', name: '锋将·破军', faction: '九阵堂', type: '门客', rarity: '史诗', cost: 5, attack: 5, hp: 5, background: '破军之名，不在多言；一刃所向，阵自开。其势如风，入阵便止。', skill: '主动：对敌单体造成5点伤害；若其底蕴低于一半，再造成+2。被动：你击败目标时，获得【学识+1】并抽1。' },
    { id: 'poji', name: '破阵天雷', faction: '九阵堂', type: '策术', rarity: '传说', cost: 7, background: '天雷一落，阵法俱裂；尘沙未定，胜负已分。此一击，非人力可挡。', skill: '对所有敌方造成4点伤害；摧毁其全部护盾；若你本回合已使用过【技能】，额外造成+2。' },

    // ====== 名相府 ======
    { id: 'baima', name: '白马非马', faction: '名相府', type: '策术', rarity: '常见', cost: 2, background: '换一词，便换一界。言之所至，足以移人心上的城墙。', skill: '令敌方选择：弃2张牌；或令你抽2。' },
    { id: 'mingshi', name: '名实互诘', faction: '名相府', type: '反诘', rarity: '常见', cost: 1, background: '名若无实，言则成空。诘问之下，虚妄自碎。', skill: '反制正在结算的1张牌；成功后对其操作者施加【怀疑+1（2回合）】。' },
    { id: 'tongyi', name: '同异之辩', faction: '名相府', type: '立论', rarity: '常见', cost: 2, background: '同中见异，异中求同。辨到尽头，便是新路。', skill: '选择1项：①抽2然后弃1；②抽1并获得【护持3】。' },
    { id: 'cifeng', name: '辞锋术士', faction: '名相府', type: '门客', rarity: '稀有', cost: 3, attack: 2, hp: 3, background: '言为刃，辞为锋；未交手，先夺气。语不必大声，足以令对手失措。', skill: '登场：对敌单体造成2点伤害并施加【沉默（1回合）】；你每回合第1次使用【反制】后抽1。' },
    { id: 'guibian', name: '诡辩连环', faction: '名相府', type: '策术', rarity: '史诗', cost: 5, background: '环环相扣，理路如网；网一收，敌自乱。你越想挣脱，越陷得深。', skill: '连续进行3次：随机对1个敌方造成2点伤害；若目标已有负面状态，则改为3点伤害。' },

    // ====== 司天台 ======
    { id: 'xingpan', name: '星盘推演', faction: '司天台', type: '立论', rarity: '常见', cost: 1, background: '仰观星度，俯察人心。推一步，便少一步误算。', skill: '查看牌库顶3张，选择1张加入手牌，其余以任意顺序置回；若加入手牌的是【事件】，额外抽1。' },
    { id: 'liangyi', name: '两仪折冲', faction: '司天台', type: '立论', rarity: '稀有', cost: 4, background: '阴不独行，阳不独立；折冲之间，万事可转。善用两仪者，进退皆安。', skill: '选择1项：①为友方获得【护持6】；②对敌方造成6点伤害。若你本回合已使用过【技能】，两项皆生效（各减半）。' },
    { id: 'sichen', name: '司辰使', faction: '司天台', type: '门客', rarity: '稀有', cost: 3, attack: 1, hp: 4, background: '司辰执简，记日月之行；亦记人世之变。其言不多，却句句应时。', skill: '登场：获得【学识+1】；回合开始：若你有学识，抽1；当你失去学识时，回复2点底蕴。' },
    { id: 'nigua', name: '逆卦问凶', faction: '司天台', type: '策术', rarity: '常见', cost: 2, background: '逆卦一问，凶吉自显；既知其凶，便可避之。先避其锋，后取其隙。', skill: '令敌方下一次造成的伤害-3；并令其随机弃1张手牌。' },
    { id: 'tianxiang', name: '天象更迭', faction: '司天台', type: '玄章', rarity: '史诗', cost: 4, background: '天象一更，百端皆易；顺之者昌，逆之者劳。夜色轮转，局势亦轮转。', skill: '场地：每回合开始进行一次判定——若为"阴"，敌方受到2点伤害；若为"阳"，你获得【护持2】；你每回合第1次触发判定时，额外抽1。' },

    // ====== 游策阁 ======
    { id: 'hezong', name: '合纵之策', faction: '游策阁', type: '策术', rarity: '稀有', cost: 3, background: '合众之势，弱可抗强；一盟既定，海内皆动。言之所向，胜过刀兵。', skill: '从牌库检索至多2张不同类型的【游策阁】牌加入手牌；然后弃1张牌。' },
    { id: 'lianheng', name: '连横之契', faction: '游策阁', type: '策术', rarity: '常见', cost: 2, background: '一契在手，进退皆利。合则为盟，散则为路。', skill: '装备：你每回合第1次使用【事件】时抽1；若该事件为非本门派牌，额外获得【护持1】。' },
    { id: 'youshuo', name: '游说之辞', faction: '游策阁', type: '立论', rarity: '常见', cost: 1, background: '三寸舌，能折铁；半句好言，能换刀兵。笑里藏尺，步步皆算。', skill: '令敌方选择：为你回复3点底蕴；或弃2张牌。' },
    { id: 'mengshu', name: '盟书', faction: '游策阁', type: '策术', rarity: '常见', cost: 2, background: '盟书不在纸墨，而在众心。字可改，势不可轻。', skill: '双方各抽1；你获得【护持3】；若敌方抽到【装备】，则其本回合不能使用装备。' },
    { id: 'bafeng', name: '八面逢源', faction: '游策阁', type: '门客', rarity: '史诗', cost: 5, attack: 2, hp: 5, background: '笑不露锋，言不失度；四方皆盟，独行亦成。走到哪里，都能留下一条路。', skill: '登场：抽2；你每回合第1次使用不同门派的牌时获得【学识+1】；当学识达到2时，额外抽1。' },

    // ====== V9 华彩系列 (全量并轨) ======
    { id: 'rujia1', name: '宣仁立论', faction: '礼心殿', type: '立论', rarity: '常见', cost: 1, background: '仁者爱人，克己复礼。此鼎既出，天下气象归于秩序。', skill: '抽1；你本回合受到所有伤害减少1点。', imageUrl: '/assets/cards/v9/rujia1_xuanren_thesis_v9.png' },
    { id: 'rujia2', name: '思无邪', faction: '礼心殿', type: '策术', rarity: '稀有', cost: 2, background: '诗三百，一言以蔽之，曰思无邪。', skill: '净化一个负面状态；回复3点底蕴。', imageUrl: '/assets/cards/v9/rujia2_siwuxie_v9.png' },
    { id: 'rujia3', name: '中庸守道', faction: '礼心殿', type: '策术', rarity: '传奇', cost: 3, background: '不偏之谓中，不易之谓庸。执其两端，用其中于民。', skill: '底蕴上限+2；获得【护持5】。', imageUrl: '/assets/cards/v9/rujia3_zhongyong_v9.png' },
    { id: 'rujia4', name: '仁者无敌', faction: '礼心殿', type: '立论', rarity: '史诗', cost: 4, background: '仁不可夺，位不可撼。厚德载物，故能无敌于天下。', skill: '获得【护持8】；在本回合内，你每使用一张本门派牌，额外获得【护持2】。', imageUrl: '/assets/cards/v9/rujia4_5_6_refined_mineral_v9.png' },
    { id: 'rujia5', name: '克己复礼', faction: '礼心殿', type: '策术', rarity: '稀有', cost: 2, background: '非礼勿视，非礼勿听。内收其心，外全其礼。', skill: '反制正在结算的1张牌；使你下一次使用的立论降低1费。', imageUrl: '/assets/cards/v9/rujia4_5_6_refined_mineral_v9.png' },
    { id: 'rujia6', name: '大学之道', faction: '礼心殿', type: '玄章', rarity: '传说', cost: 5, background: '大学之道，在明明德，在亲民，在止于至善。', skill: '场地：你每回合第1次抽牌时，额外抽1；你每获得学识，回复2点底蕴。', imageUrl: '/assets/cards/v9/rujia4_5_6_refined_mineral_v9.png' },
    { id: 'rujia7', name: '浩然正气', faction: '礼心殿', type: '策术', rarity: '传说', cost: 6, background: '至大至刚，以直养而无害，则塞于天地之间。', skill: '在本回合内，你造成的伤害+5，且你的所有【立论】牌具备【穿透】效果。', imageUrl: '/assets/cards/v9/rujia7_8_9_refined_mineral_v9.png' },
    { id: 'rujia8', name: '温良恭俭让', faction: '礼心殿', type: '立论', rarity: '史诗', cost: 3, background: '夫子温良恭俭让以得之。和而不流，强哉矫。', skill: '选择2项：抽1；回复3点底蕴；获得【护持3】；净化1个负面状态。', imageUrl: '/assets/cards/v9/rujia7_8_9_refined_mineral_v9.png' },
    { id: 'rujia9', name: '修齐治平', faction: '礼心殿', type: '玄章', rarity: '传说', cost: 4, background: '修身齐家，治国平天下。层层递进，方为大才。', skill: '场地：战斗开始时你所有属性+1；你每回合结束时，若手牌不少于5张，获得【学识+1】。', imageUrl: '/assets/cards/v9/rujia7_8_9_refined_mineral_v9.png' },
    { id: 'rujia10', name: '至圣先师', faction: '礼心殿', type: '门客', rarity: '传说', cost: 8, attack: 6, hp: 10, background: '万世师表，木铎一心。其言既出，百家皆静。', skill: '登场：将敌方所有牌洗回其牌库；被动：该角色在场时，敌方每回合只能使用1张牌。', imageUrl: '/assets/cards/v9/rujia10_fajia4_5_mineral_v9.png' },

    { id: 'fajia1', name: '峻法立论', faction: '衡戒廷', type: '立论', rarity: '常见', cost: 1, background: '法不阿贵，绳不挠曲。唯有峻法，方能绝天下之乱。', skill: '对目标造成2点伤害；若目标有【怀疑】，额外抽1。', imageUrl: '/assets/cards/v9/fajia1_junfa_statute_v9.png' },
    { id: 'fajia2', name: '权柄之链', faction: '衡戒廷', type: '策术', rarity: '稀有', cost: 2, background: '权者，势也。锁链所及之处，皆为法之疆域。', skill: '指定一个单位，令其下回合无法使用【技能】。', imageUrl: '/assets/cards/v9/fajia2_quanbing_chains_v9.png' },
    { id: 'fajia3', name: '铁律门客', faction: '衡戒廷', type: '门客', rarity: '史诗', cost: 4, attack: 4, hp: 5, background: '法在人在，法亡人亡。铁骑甲卫，唯律命是从。', skill: '登场：对目标造成3点伤害；被动：该角色在场时，对手无法使用【反诘】。', imageUrl: '/assets/cards/v9/fajia3_tielu_guard_v9.png' },
    { id: 'fajia4', name: '严刑峻法', faction: '衡戒廷', type: '策术', rarity: '史诗', cost: 3, background: '罪无大小，皆以律定。雷霆之下，孰敢不从？', skill: '对敌方单体造成3点伤害；若其费用大于等于4，额外造成4点伤害。', imageUrl: '/assets/cards/v9/rujia10_fajia4_5_mineral_v9.png' },
    { id: 'fajia5', name: '驭下之术', faction: '衡戒廷', type: '策术', rarity: '传说', cost: 4, background: '两手抓利，两手抓害。臣如御马，全在衔勒之间。', skill: '控制敌方随机一名【门客】，直到其被击败或该回合结束。', imageUrl: '/assets/cards/v9/rujia10_fajia4_5_mineral_v9.png' },
    { id: 'fajia6', name: '秦律森严', faction: '衡戒廷', type: '玄章', rarity: '传说', cost: 5, background: '网疏而不漏，律严而不曲。人在网中，如在瓮中。', skill: '场地：敌方每使用一张牌，受到1点伤害且必须弃掉一张手牌（随机）。', imageUrl: '/assets/cards/v9/fajia6_7_8_mineral_v9.png' },
    { id: 'fajia7', name: '赏罚分明', faction: '衡戒廷', type: '立论', rarity: '史诗', cost: 3, background: '信赏必罚，则群臣不懈。定轻重之分，见君主之威。', skill: '抽2；若你上回合有牌被反制，下两回合造成的伤害加倍。', imageUrl: '/assets/cards/v9/fajia6_7_8_mineral_v9.png' },
    { id: 'fajia8', name: '以理服法', faction: '衡戒廷', type: '反诘', rarity: '稀有', cost: 2, background: '法即是理，辩即是刑。公义之下，不容巧言。', skill: '反制正在结算的1张牌；成功后吸收该牌的部分效果（抽牌或伤害）。', imageUrl: '/assets/cards/v9/fajia6_7_8_mineral_v9.png' },
    { id: 'fajia9', name: '万世法案', faction: '衡戒廷', type: '玄章', rarity: '传说', cost: 6, background: '法之大者，长治久安。一案之下，百世无忧。', skill: '场地：你受到的所有伤害减半（向上取整）；你的所有【反诘】牌费用减少1。', imageUrl: '/assets/cards/v9/fajia9_10_daojia1_mineral_v9.png' },
    { id: 'fajia10', name: '申韩宗师', faction: '衡戒廷', type: '门客', rarity: '传说', cost: 7, attack: 5, hp: 8, background: '刻薄寡恩，术法之巅。言出法随，莫敢不从。', skill: '登场：令对手所有手牌费用增加2点；被动：你每次造成伤害，对手减少1点底蕴上限。', imageUrl: '/assets/cards/v9/fajia9_10_daojia1_mineral_v9.png' },

    { id: 'guizhen6', name: '清虚静笃', faction: '归真观', type: '立论', rarity: '常见', cost: 1, background: '清虚者，道之本；静笃者，德之根。', skill: '回复2点底蕴；你本回合第1次受到伤害时，获得【护持2】。', imageUrl: '/assets/cards/v9/daojia6_7_8_refined_v9.png' },
    { id: 'guizhen7', name: '炼气储真', faction: '归真观', type: '门客', rarity: '稀有', cost: 4, attack: 3, hp: 5, background: '真气充盈，百病不侵。', skill: '被动：你每回合结束时若未受伤，回复1底蕴并获得【清明+1】。', imageUrl: '/assets/cards/v9/daojia6_7_8_refined_v9.png' },
    { id: 'guizhen8', name: '虚空契道', faction: '归真观', type: '策术', rarity: '稀有', cost: 3, background: '虚室生白，吉祥止止。', skill: '净化全部负面状态；回复4点底蕴。', imageUrl: '/assets/cards/v9/daojia6_7_8_refined_v9.png' },
    { id: 'guizhen9', name: '炉鼎炼气', faction: '归真观', type: '策术', rarity: '常见', cost: 2, shield: 2, background: '鼎炉相配，水火既济。', skill: '装备：你每打出【技能】牌后回复1点底蕴。', imageUrl: '/assets/cards/v9/daojia9_10_mingxiang6_refined_v9.png' },
    { id: 'guizhen10', name: '归一守中', faction: '归真观', type: '玄章', rarity: '史诗', cost: 4, background: '守中不偏，道自在。', skill: '场地：你每回合结束若未造成过伤害，获得【护持4】。', imageUrl: '/assets/cards/v9/daojia9_10_mingxiang6_refined_v9.png' },

    { id: 'mingxiang6', name: '辩名定义', faction: '名相府', type: '立论', rarity: '常见', cost: 1, background: '名实既定，言辞已立。', skill: '抽1；若你本回合已使用过【反制】，改为抽2。', imageUrl: '/assets/cards/v9/daojia9_10_mingxiang6_refined_v9.png' },
    { id: 'mingxiang7', name: '名家辩手', faction: '名相府', type: '门客', rarity: '稀有', cost: 3, attack: 2, hp: 3, background: '言语如剑，辞锋所指。', skill: '被动：你每使用1张【反制】，造成1点伤害。', imageUrl: '/assets/cards/v9/mingxiang7_8_9_refined_v9.png' },
    { id: 'mingxiang8', name: '悖论质疑', faction: '名相府', type: '反诘', rarity: '稀有', cost: 2, background: '一语戳破，万言皆空。', skill: '反制正在结算的1张牌；成功后令对手本回合费用+2。', imageUrl: '/assets/cards/v9/mingxiang7_8_9_refined_v9.png' },
    { id: 'mingxiang9', name: '概念穿透', faction: '名相府', type: '策术', rarity: '史诗', cost: 4, background: '一言穿透千层幕。', skill: '令对手手牌随机弃1张。', imageUrl: '/assets/cards/v9/mingxiang7_8_9_refined_v9.png' },
    { id: 'mingxiang10', name: '名相倒推', faction: '名相府', type: '玄章', rarity: '史诗', cost: 4, background: '正推得名，倒推得实。', skill: '场地：每当你使用【反制】成功，抽1。', imageUrl: '/assets/cards/v9/mingxiang10_wannong6_7_v9.png' },

    { id: 'liangyi6', name: '两仪和息', faction: '两仪署', type: '立论', rarity: '常见', cost: 1, background: '和合而生，乃为天地长久之道。', skill: '选2项：回复2点底蕴；造成2点伤害；抽1。', imageUrl: '/assets/cards/v9/liangyi6_hexie_v9_retry_1775045058485_1775045152262.png' },
    { id: 'liangyi7', name: '法象宗师', faction: '两仪署', type: '门客', rarity: '稀有', cost: 4, attack: 3, hp: 4, background: '挥手之间，局势翻转。', skill: '登场：选择阴或阳。', imageUrl: '/assets/cards/v9/liangyi7_faxiang_zongshi_v9_master_retry_1775045176575.png' },
    { id: 'liangyi8', name: '五行生杀', faction: '两仪署', type: '策术', rarity: '史诗', cost: 4, background: '五行之变，无一幸免。', skill: '对敌方造成3点伤害；回复3点底蕴。', imageUrl: '/assets/cards/v9/liangyi8_wuxing_shengsha_v9_cycle_retry_1775045196821.png' },
    { id: 'liangyi9', name: '两仪守中', faction: '两仪署', type: '策术', rarity: '常见', cost: 2, shield: 2, background: '护符双现，守其中道。', skill: '装备：你每回合开始选：获得【护持2】；或回复2点。', imageUrl: '/assets/cards/v9/liangyi9_liangyi_shouzhong_v9_shield_retry_1775045214416.png' },
    { id: 'liangyi10', name: '太极万象', faction: '两仪署', type: '玄章', rarity: '传说', cost: 5, background: '万象归一，一归于道。', skill: '场地：你每受到1点伤害，获得【护持0.5】。', imageUrl: '/assets/cards/v9/liangyi10_taiji_wanxiang_v9_ultimate_retry_1775045527402.png' },
];
