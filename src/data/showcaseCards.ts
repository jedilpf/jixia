// 稀有度颜色映射
export const rarityColor: Record<string, string> = {
    '常见': '#9ca3af',
    '稀有': '#60a5fa',
    '史诗': '#a855f7',
    '传说': '#f59e0b',
};

// 卡牌类型背景颜色（统一映射）
export const typeColor: Record<string, string> = {
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
    type: string;
    rarity: string;
    background: string;
    skill: string;
    cost: number;
    attack?: number;
    hp?: number;
    shield?: number;
}

export const CARDS: CardData[] = [
    // ====== 礼心殿 ======
    { id: 'wenyan', name: '温言立论', faction: '礼心殿', type: '技能', rarity: '常见', cost: 1, background: '言不急则理自明，笑里藏锋亦不伤人。青灯一盏，足压满堂躁气。', skill: '抽1；若你本回合已使用过本门派牌，改为抽2。' },
    { id: 'zhuduchao', name: '竹牍抄录', faction: '礼心殿', type: '事件', rarity: '常见', cost: 2, background: '抄一段旧文，便得一线新路。字落竹纹，心亦随之安定。', skill: '从牌库检索1张【技能】牌加入手牌；然后弃1张牌。' },
    { id: 'jiangxi', name: '讲席清规', faction: '礼心殿', type: '场地', rarity: '常见', cost: 2, shield: 3, background: '讲席之上，清规如绳；入其门者，先收浮躁。几行规约，胜过千句喝止。', skill: '你每回合第1次使用【技能】牌时，抽1；回合末若你本回合未使用牌，获得【护持3】。' },
    { id: 'sishi', name: '司史执笔', faction: '礼心殿', type: '角色', rarity: '稀有', cost: 3, attack: 2, hp: 4, background: '司史不争一时胜负，只记千年是非。笔落之处，便是人心的据证。', skill: '登场：抽1；选择1项：对敌方施加【怀疑+1（2回合）】；或令友方获得【护持4】。' },
    { id: 'libian', name: '礼辩同归', faction: '礼心殿', type: '事件', rarity: '史诗', cost: 4, shield: 2, background: '礼起则群心不乱，辩正则万事可行。揖让之间，锋芒尽收。', skill: '双方各抽1；本回合你造成的伤害+2，且你获得【护持2】。' },

    // ====== 衡戒廷 ======
    { id: 'tiequan', name: '铁券禁令', faction: '衡戒廷', type: '策术', rarity: '稀有', cost: 3, background: '铁券一下，百口噤声；禁令既出，寸步难行。法不待情，唯待执行。', skill: '敌方下回合不能抽牌；若其仍触发抽牌效果，则改为随机弃1张手牌。' },
    { id: 'duanjian', name: '断简成法', faction: '衡戒廷', type: '反诘', rarity: '常见', cost: 2, background: '纷简可断，法度不可断。刀不为杀，只为分明。', skill: '反制正在结算的1张牌；成功后使其操作者弃1张牌。' },
    { id: 'jianyin', name: '缄印封检', faction: '衡戒廷', type: '策术', rarity: '稀有', cost: 2, shield: 1, background: '一绳一泥，一印一验；密不可窥，制可长行。封缄之处，亦是信与戒。', skill: '装备给角色；该角色受到的首次伤害-2；装备者每回合第1次使用【反诘】后抽1。' },
    { id: 'juwentang', name: '鞫问堂', faction: '衡戒廷', type: '玄章', rarity: '常见', cost: 2, background: '鞫问之下，词难成网；灯火一照，心自见形。堂上无风，亦觉寒意。', skill: '每当敌方使用【立论】牌，其受到1点伤害；若其本回合已受伤，额外+1。' },
    { id: 'chilin', name: '一纸敕令', faction: '衡戒廷', type: '策术', rarity: '传说', cost: 6, background: '纸薄而令重，片言可动千军。敕下如雷，众心自齐。', skill: '选择1项：①摧毁所有敌方【策术】；②本回合敌方不能使用牌；③你抽3并获得【护持6】。' },

    // ====== 归真观 ======
    { id: 'yunxiu', name: '云岫观想', faction: '归真观', type: '立论', rarity: '常见', cost: 1, background: '闭目观云岫，开眼见本心。心静一分，尘念便退一寸。', skill: '回复3点底蕴；若你本回合未受伤，额外抽1。' },
    { id: 'baoyi', name: '抱一守玄', faction: '归真观', type: '门客', rarity: '史诗', cost: 5, attack: 2, hp: 6, background: '抱一以守玄，言少而道长。行在尘世，心在太清。', skill: '被动：你每回合第1次使用【立论】牌时，获得【清明+1】；当清明达到3时，抽2并移除自身全部负面状态。' },
    { id: 'dansha', name: '丹砂小炉', faction: '归真观', type: '策术', rarity: '常见', cost: 2, shield: 1, background: '丹砂入炉，火候在心。炉不大，却能温养一身气息。', skill: '装备：回合开始时获得【护持1】；你每回合第1次使用【立论】后回复1点底蕴。' },
    { id: 'taiqing', name: '太清符箓', faction: '归真观', type: '策术', rarity: '稀有', cost: 3, background: '一符镇百怪，清风过尘嚣。朱砂落处，杂念自散。', skill: '净化己方全部负面状态；并令敌方随机1名角色获得【沉默（1回合）】。' },
    { id: 'hebu', name: '鹤步凌虚', faction: '归真观', type: '立论', rarity: '史诗', cost: 3, background: '鹤行无声，步落虚空；身在尘中，心已出尘。一步跨去，万劫不侵。', skill: '闪避敌方下一次攻击；回复2点底蕴；若你本回合未受伤，获得【清明+1】并抽1。' },

    // ====== 玄匠盟 ======
    { id: 'liannuju', name: '连弩匣', faction: '玄匠盟', type: '策术', rarity: '常见', cost: 2, attack: 1, background: '匣开则弦鸣，连发不息。工匠不言勇，只把机关做到极致。', skill: '装备：你的攻击+1；你每回合第1次造成伤害时，额外造成1点伤害。' },
    { id: 'jimu', name: '机关木鸢', faction: '玄匠盟', type: '策术', rarity: '常见', cost: 2, background: '木鸢虽小，眼可千里。飞在高处，方知城内真假。', skill: '查看敌方随机1张手牌；本回合你对其造成的伤害+1。' },
    { id: 'chengfang', name: '城防尺牍', faction: '玄匠盟', type: '策术', rarity: '常见', cost: 2, shield: 4, background: '尺牍绘城防，方寸定攻守。线条虽细，却能挡万矢。', skill: '获得【壁垒】直到回合结束（吸收4点伤害）；若你已有玄章，改为吸收6点伤害。' },
    { id: 'jianshi', name: '兼济匠师', faction: '玄匠盟', type: '门客', rarity: '稀有', cost: 4, attack: 2, hp: 4, background: '工以济世，不争虚名。手上有茧，心里有城。', skill: '登场：从牌库检索1张【策术】加入手牌；你接下来2回合内打出的策术牌费用-1。' },
    { id: 'qianji', name: '千机壁垒', faction: '玄匠盟', type: '玄章', rarity: '史诗', cost: 4, shield: 2, background: '千机并起，壁垒如山；攻者失势，守者得时。守到恰处，便是反击之始。', skill: '玄章：你打出的【策术】进入场上时，令其持有者获得【护持2】；敌方每回合第1次对你造成的伤害-2。' },

    // ====== 九阵堂 ======
    { id: 'jingqi', name: '旌旗换阵', faction: '九阵堂', type: '立论', rarity: '常见', cost: 2, background: '旗一翻，阵已换；敌未觉，我已先至。兵贵神速，亦贵其变。', skill: '获得【护持2】；本回合你造成的伤害+1；若你本回合首次造成伤害，额外抽1。' },
    { id: 'zhange', name: '战鼓催锋', faction: '九阵堂', type: '策术', rarity: '常见', cost: 2, background: '鼓三通，锋自锐；人未战，心先热。响处如雷，退者自惭。', skill: '本回合你造成的伤害+2；若你本回合首次造成伤害，抽1。' },
    { id: 'bingshu', name: '兵书残卷', faction: '九阵堂', type: '策术', rarity: '稀有', cost: 3, background: '兵书虽残，杀机仍在行间。翻一页，便多一条活路。', skill: '装备：每回合一次，你使用【策术】后抽1；若该策术造成伤害，额外获得【护持1】。' },
    { id: 'longxiang', name: '龙骧将军', faction: '九阵堂', type: '门客', rarity: '史诗', cost: 5, attack: 4, hp: 5, background: '龙骧之势，势不可挡。将军拔剑，三军效命。', skill: '登场：造成3点伤害；只要该角色在场，你每回合首次造成的伤害+2。' },
    { id: 'balizhen', name: '八里连营', faction: '九阵堂', type: '玄章', rarity: '史诗', cost: 4, shield: 2, background: '营垒相连，互为犄角。牵一发而动全身，稳如泰山。', skill: '玄章：你每回合结束获得【护持2】；你每回合第1次受到的伤害由护持抵扣，且不触发受伤效果。' },

    // ====== 天工坊 (V9) ======
    { id: 'tiangong1', name: '墨家扣机', faction: '天工坊', type: '立论', rarity: '常见', cost: 1, background: '指端发，三矢丛射。机括之妙，在于一念之间定胜负。', skill: '造成2点伤害；若你有【策术】牌，额外获得【护持2】。' },
    { id: 'tiangong2', name: '云梯凌虚', faction: '天工坊', type: '策术', rarity: '常见', cost: 2, background: '梯长云合，直取坚城。于虚空之中求立足，方显墨家之志。', skill: '策术：你使用【门客】牌后抽1。' },
    { id: 'tiangong3', name: '枢机错落', faction: '天工坊', type: '策术', rarity: '稀有', cost: 2, background: '轮转不息，枢机互锁。动一子而局全局，此乃造化之数。', skill: '从弃牌堆将1张随机【策术】加入手牌；本回合该策术费用-1。' },
    { id: 'tiangong4', name: '木鸢之羽', faction: '天工坊', type: '门客', rarity: '常见', cost: 1, attack: 1, hp: 1, background: '三日不落，凭风而翔。虽是木羽，亦有破空之势。', skill: '被动：该门客在场时，你每回合第1次抽到的非门客牌费用-1。' },
    { id: 'tiangong5', name: '震岳石弩', faction: '天工坊', type: '策术', rarity: '传说', cost: 4, background: '弩张如月，石落如雷。即便高山大川，亦在这一射之中。', skill: '回合末对敌方造成1点伤害；若你已有3张策术，改为造成3点。' },
    { id: 'tiangong6', name: '甲兵连动', faction: '天工坊', type: '立论', rarity: '常见', cost: 1, background: '一轴引百轮，全局之动，皆收束于纤毫之机。', skill: '造成2点伤害；若你本回合已使用过策术牌，改为造成3点且抽1。' },
    { id: 'tiangong7', name: '霹雳惊雷', faction: '天工坊', type: '门客', rarity: '传说', cost: 6, attack: 8, hp: 3, background: '铁室藏火，石弹摧云。震天动地之处，诸邪自溃。', skill: '登场：对所有敌方造成5点伤害；每回合自动对随机敌方造成2点伤害，但不能主动攻击。' },
    { id: 'tiangong8', name: '机动甲卫', faction: '天工坊', type: '策术', rarity: '稀有', cost: 3, shield: 3, background: '以铜为肤，以簧为心。不知疲累，亦无惧生死之辩。', skill: '策术：你受到的伤害-2；每回合你使用策术后，获得【护持1】（最多叠3层）。' },
    { id: 'tiangong9', name: '铁骑横戈', faction: '天工坊', type: '立论', rarity: '史诗', cost: 5, background: '铁蹄踏处，戈矛所向。排山倒海之势，非坚城可挡。', skill: '对所有敌方角色各造成3点伤害；若其中有护盾，穿透1点护盾再造成3点伤害。' },
    { id: 'tiangong10', name: '墨匠圣坊', faction: '天工坊', type: '玄章', rarity: '史诗', cost: 4, background: '熔炉昼夜，百炼生锈。天下之奇器，皆出此庄严之门。', skill: '玄章：每回合开始将1张随机策术加入手牌（费用-1）；你手牌中每有2张策术，对敌方造成1点伤害。' },

    // ====== 两仪署 (V9) ======
    { id: 'liangyi1', name: '阴阳化宇', faction: '两仪署', type: '立论', rarity: '常见', cost: 1, background: '混沌初分，乾坤始定位。化宇之处，万物皆有其序。', skill: '进行1次判定：阳→抽2；阴→造成2点伤害。' },
    { id: 'liangyi2', name: '五德流变', faction: '两仪署', type: '策术', rarity: '史诗', cost: 4, background: '水德润下，火德炎上；五行流转，天命不常。', skill: '连续进行3次判定：阳多于阴时，造成5点伤害；阴多于阳时，获得【护持5】。' },
    { id: 'liangyi3', name: '坎离折冲', faction: '两仪署', type: '反诘', rarity: '稀有', cost: 2, background: '水火不容，亦能相生。虽处绝地，亦有回旋之机。', skill: '反诘1张非门客牌；成功后进行1次判定，若为阳，返还1费。' },
    { id: 'liangyi4', name: '两仪法象', faction: '两仪署', type: '玄章', rarity: '史诗', cost: 3, background: '法象自然，两仪生辉。此地之内，道法自然。', skill: '玄章：你造成的判定结果可以重来1次（每回合限1次）。' },
    { id: 'liangyi5', name: '太极圆融', faction: '两仪署', type: '门客', rarity: '传说', cost: 5, attack: 3, hp: 5, background: '圆融无碍，太极独尊。身处其中，方知天地之大。', skill: '被动：当你触发阳判定时，攻击+1；当你触发阴判定时，回复2底蕴。' },
    { id: 'liangyi6', name: '两仪和息', faction: '两仪署', type: '立论', rarity: '常见', cost: 1, background: '一刚一柔，一进一退。和合而生，乃为天地长久之道。', skill: '选2项：回复2点底蕴；造成2点伤害；抽1；获得【护持2】。' },
    { id: 'liangyi7', name: '法象宗师', faction: '两仪署', type: '门客', rarity: '稀有', cost: 4, attack: 3, hp: 4, background: '身处三界外，心在两仪中。挥手之间，局势翻转。', skill: '登场：选择阴或阳——阴：对敌造成5点伤害；阳：回复5点底蕴。被动：每回合交替触发两项效果。' },
    { id: 'liangyi8', name: '五行生杀', faction: '两仪署', type: '策术', rarity: '史诗', cost: 4, background: '生者为养，杀者为戒。五行之变，无一幸免，无一不生。', skill: '对敌方造成3点伤害；回复3点底蕴；摧毁1件敌方策术；净化1个负面状态；抽1。' },
    { id: 'liangyi9', name: '两仪守中', faction: '两仪署', type: '策术', rarity: '常见', cost: 2, shield: 2, background: '护符双现，守其中道。一念清净，则百邪不侵。', skill: '策术：你每回合开始选：获得【护持2】；或回复2点底蕴；两次选择必须不同。' },
    { id: 'liangyi10', name: '太极万象', faction: '两仪署', type: '玄章', rarity: '传说', cost: 5, background: '万象归一，一归于道。图一展，则天下气运皆在此。', skill: '玄章：你每受到1点伤害，获得【护持0.5】（每2点累积为1护持）；你每回复1点底蕴，额外造成0.5点伤害（同上取整）。' },

    // ====== 通用卡项 ======
    { id: 'xinglvxuezi', name: '负笈儒龙', faction: '通用', type: '门客', rarity: '常见', cost: 1, attack: 1, hp: 2, background: '千里负笈，游学四方。稷下之下，谁非英雄。', skill: '无效果。' },
    { id: 'xiangyishuli', name: '乡议书吏', faction: '通用', type: '门客', rarity: '常见', cost: 2, attack: 2, hp: 2, background: '乡议微言，执笔存真。', skill: '若置于旁议，进场时抽1张牌，然后弃1张牌。' },
    { id: 'gongyishouxi', name: '公辩守席', faction: '通用', type: '门客', rarity: '常见', cost: 2, attack: 2, hp: 2, background: '守席不争锋，重在定其序。', skill: '若置于主议，本回合 +1 辩锋。' },
];
