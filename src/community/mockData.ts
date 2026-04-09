import type { CommunityPost } from './types';

const now = Date.now();
const day = 86400000;

export const SEED_POSTS: CommunityPost[] = [
  {
    id: 'seed-001',
    category: 'discussion',
    title: '墨家卡组构筑心得：明辩暗辩双线作战',
    summary: '分享一套以墨家为核心的卡组，明辩用立论压制，暗辩用策术反击，亲测58%胜率。',
    content: `大家好，我是墨家门徒·寒江雪。今天分享一套我用了两个月的墨家卡组。

**核心思路**
墨家的特点是"兼爱非攻"，擅长在明辩阶段积累优势，在暗辩阶段反击。

**明辩策略**
- 起手优先留《兼爱》这张核心卡
- 《非攻》用于克制敌方的玄章
- 保持手牌在4-6张，避免浪费

**暗辩策略**
- 关键时机是第3-4轮
- 利用《天志》获取额外行动力
- 配合《明鬼》打出一波爆发

**对阵各门派**
- 对儒家：前期抢节奏，后期拼资源
- 对法家：防好他们的控制牌
- 对道家：拼的是耐心

欢迎大家交流讨论！`,
    tags: ['论辩技巧', '卡组构筑', '门派攻略'],
    imageUrls: [],
    authorId: 'seed-user-001',
    authorName: '墨家门徒·寒江雪',
    authorFaction: '墨家',
    createdAt: now - 2 * day,
    updatedAt: now - 2 * day,
    publishedAt: now - 2 * day,
    status: 'approved',
    isPinned: true,
    isFeatured: true,
    likeCount: 128,
    commentCount: 45,
    favoriteCount: 67,
    viewCount: 2341,
  },
  {
    id: 'seed-002',
    category: 'battle_report',
    title: '史诗翻盘！0:3绝境逆转到决胜局',
    summary: '对战儒法双修对手，前三回合被打到绝境，凭借一张《庄周梦蝶》逆转全局，太刺激了。',
    content: `这是一场让我回味了好几天的对局。

**对手信息**
- 门派：儒法双修
- 特点：控制能力强，节奏慢但稳定

**开局**
对手先手，直接用儒家《仁政》压制我，连续两张控制牌让我前3回合几乎没有动作。比分0:3，眼看就要输了。

**转折点**
第4回合，我终于抽到了等了很久的《庄周梦蝶》！
这张卡的效果是：跳过本回合，获得接下来两个回合的额外行动力。

**逆袭**
第5回合，我连续打出三张策术牌，一波清场。
第6回合，再配合《逍遥游》锁定胜局。

**总结**
1. 永远不要放弃，即使0:3也有翻盘可能
2. 核心卡要耐心等待，不要乱交资源
3. 《庄周梦蝶》真是一张被低估的神卡`,
    tags: ['史诗翻盘', '精彩对决'],
    imageUrls: [],
    authorId: 'seed-user-002',
    authorName: '道家散修·云游子',
    authorFaction: '道家',
    createdAt: now - 1 * day,
    updatedAt: now - 1 * day,
    publishedAt: now - 1 * day,
    status: 'approved',
    isPinned: false,
    isFeatured: true,
    likeCount: 256,
    commentCount: 89,
    favoriteCount: 134,
    viewCount: 4521,
  },
  {
    id: 'seed-003',
    category: 'qa',
    title: '新手求助：论辩大会的匹配机制是什么？',
    summary: '刚玩一周，每次匹配到的对手都很强，想知道匹配是按什么规则来的？',
    content: `如题，我是刚入坑一周的新手玩家。

**我的情况**
- 等级：8级
- 主要玩墨家和儒家
- 胜率约35%

**问题**
1. 匹配是按等级匹配还是按胜率匹配？
2. 为什么我经常匹配到10级以上的对手？
3. 有没有什么快速提升胜率的方法？

**我的卡组**
主要是系统给的初始卡组，没有怎么调整过。

谢谢大家！`,
    tags: ['新手求助', '规则咨询'],
    imageUrls: [],
    authorId: 'seed-user-003',
    authorName: '稷下新学徒',
    createdAt: now - 3 * day,
    updatedAt: now - 3 * day,
    publishedAt: now - 3 * day,
    status: 'approved',
    isPinned: false,
    isFeatured: false,
    likeCount: 23,
    commentCount: 31,
    favoriteCount: 5,
    viewCount: 567,
    qaState: 'resolved',
    acceptedCommentId: 'seed-comment-003-1',
  },
  {
    id: 'seed-004',
    category: 'culture',
    title: '【诸子百家】从"兼爱非攻"看墨子的和平思想',
    summary: '结合游戏中的墨家设定，聊聊墨子"兼爱非攻"的真实内涵，以及在现代的意义。',
    content: `墨家是游戏中非常重要的一个门派，今天我想结合游戏设定，聊聊墨子的真实思想。

**什么是"兼爱"**
墨子认为，天下之乱起于不相爱。如果所有人都像爱自己一样爱别人，就不会有人受害。

在游戏中，墨家的"兼爱"体现在：
- 团队增益类卡牌
- 护盾类机制
- 分享行动力

**什么是"非攻"**
"非攻"不是反对一切战争，而是反对不义的侵略战争。墨子支持防御战争，反对进攻性战争。

游戏中的体现：
- 墨家擅长防守反击
- 《非攻》克制攻击类卡牌
- 墨家英雄多为辅助型

**现代意义**
墨子的思想在今天仍然有重要意义：
1. 兼爱 → 换位思考、互利共赢
2. 非攻 → 反对霸权主义
3. 尚贤 → 选贤任能

**结语**
很高兴看到游戏中有墨家这个门派，让年轻人能在游戏中了解诸子百家的思想。`,
    tags: ['诸子百家', '历史典故'],
    imageUrls: [],
    authorId: 'seed-user-004',
    authorName: '学宫教习·子修',
    createdAt: now - 5 * day,
    updatedAt: now - 5 * day,
    publishedAt: now - 5 * day,
    status: 'approved',
    isPinned: true,
    isFeatured: true,
    likeCount: 445,
    commentCount: 78,
    favoriteCount: 234,
    viewCount: 8902,
  },
  {
    id: 'seed-005',
    category: 'discussion',
    title: '法家最强卡组推荐：严刑峻法控制流',
    summary: '法家上分卡组分享，利用法家的控制能力压制对手，适合喜欢慢节奏控制的玩家。',
    content: `法家玩家看过来！这套卡组我打到了钻石段位。

**卡组核心**
法家的精髓在于"以刑去刑"，通过严厉的惩罚让对手寸步难行。

**关键卡牌**
1. 《商君书》- 核心过牌卡
2. 《刑鼎》- 关键控制
3. 《术治》- 防止对手反击
4. 《法治》- 稳定局势

**对阵技巧**
- 前期：积累资源，等待时机
- 中期：开始控制对手节奏
- 后期：一旦优势就快速结束

**克制方法**
- 墨家：通过护盾抵消控制
- 道家：快速过牌抢占先机`,
    tags: ['论辩技巧', '卡组构筑'],
    imageUrls: [],
    authorId: 'seed-user-005',
    authorName: '法家学子·卫鞅',
    authorFaction: '法家',
    createdAt: now - 6 * day,
    updatedAt: now - 6 * day,
    publishedAt: now - 6 * day,
    status: 'approved',
    isPinned: false,
    isFeatured: false,
    likeCount: 89,
    commentCount: 34,
    favoriteCount: 45,
    viewCount: 1234,
  },
  {
    id: 'seed-006',
    category: 'qa',
    title: '【已解决】道家应该先升哪些卡牌？',
    summary: '道家新手玩家，不知道哪些卡牌值得优先升级，求老玩家指导。',
    content: `我是道家新手，现在有500玉石，想问问：

1. 哪些道家卡牌是必升的？
2. 升级优先级是什么？
3. 有没有平民道家卡组推荐？

谢谢！

---

**已采纳回答**：

道家老玩家来答：

**必升卡牌（按优先级）**
1. 《庄周梦蝶》- T0卡，必升满
2. 《逍遥游》- T1，核心输出
3. 《齐物论》- T1，过牌神器

**平民卡组**
其实道家不太吃卡牌等级，关键是要会运营。开局不要急着打，用《齐物论》过牌找key牌。

**玉石建议**
先别急着抽卡，把这几张升满再用。`,
    tags: ['新手求助', '门派选择', '已解决'],
    imageUrls: [],
    authorId: 'seed-user-006',
    authorName: '道家新修',
    createdAt: now - 4 * day,
    updatedAt: now - 4 * day,
    publishedAt: now - 4 * day,
    status: 'approved',
    isPinned: false,
    isFeatured: false,
    likeCount: 45,
    commentCount: 22,
    favoriteCount: 12,
    viewCount: 789,
    qaState: 'resolved',
    acceptedCommentId: 'seed-comment-006-1',
  },
  {
    id: 'seed-007',
    category: 'battle_report',
    title: '对阵法家控制流的心得分享',
    summary: '被法家控制到心态崩溃后研究出的对策，亲测有效！',
    content: `最近被法家的控制流打到自闭，研究了一周终于找到对策。

**法家控制流特点**
- 起手两张控制牌
- 第3回合开始压制
- 让你全程没有游戏体验

**我的对策**
1. 第一回合不要留key牌，逼他先交控制
2. 手上留一张《清心》防精神控制
3. 第4回合是关键，反击窗口
4. 一旦反攻就一口气打到底

**推荐卡组调整**
- 带2张解控牌
- 增加过牌能力
- 提速，缩短对局时间

**心态**
遇到法家一定要稳住，他控制你2-3回合很正常，熬过去就是胜利。`,
    tags: ['战场趣闻', '门派攻略'],
    imageUrls: [],
    authorId: 'seed-user-007',
    authorName: '儒家学者·孟子',
    authorFaction: '儒家',
    createdAt: now - 12 * day,
    updatedAt: now - 12 * day,
    publishedAt: now - 12 * day,
    status: 'approved',
    isPinned: false,
    isFeatured: false,
    likeCount: 156,
    commentCount: 67,
    favoriteCount: 89,
    viewCount: 2345,
  },
  {
    id: 'seed-008',
    category: 'culture',
    title: '从"白马非马"看名家的论辩艺术',
    summary: '游戏中名家的卡牌设计很有意思，今天来讲讲公孙龙子"白马非马"的真实逻辑。',
    content: `名家的"白马非马"是诸子百家中最具哲学思辨的命题之一。

**命题原意**
公孙龙并非说"白马不是马"，而是在讨论概念与实体之间的关系。

"马"是形，"白"是色，形与色是不同的属性。

**游戏中的体现**
名家的论辩机制设计得很精妙：
- 擅长偷换论题
- 利用语言陷阱
- 关键判定时往往能反转

**历史上的影响**
这个命题对中国逻辑学发展有重要影响：
1. 开了中国形式逻辑的先河
2. 影响了后期佛教因明的传入
3. 成为诡辩术的代名词

**现代解读**
其实名家不是纯粹的诡辩，其中包含着对语言与实在关系的深刻思考。

如果你喜欢名家，不妨多读读《公孙龙子》。`,
    tags: ['诸子百家', '历史典故'],
    imageUrls: [],
    authorId: 'seed-user-008',
    authorName: '名家传人·公孙'
  ,
    createdAt: now - 8 * day,
    updatedAt: now - 8 * day,
    publishedAt: now - 8 * day,
    status: 'approved',
    isPinned: false,
    isFeatured: true,
    likeCount: 378,
    commentCount: 56,
    favoriteCount: 178,
    viewCount: 5678,
  },
  {
    id: 'seed-009',
    category: 'discussion',
    title: '【杂谈】你最喜欢哪个门派？原因是什么？',
    summary: '玩这个游戏已经三个月了，想听听大家最喜欢哪个门派，为什么？',
    content: `如题，我个人最喜欢墨家，因为：
1. 兼爱非攻的思想很酷
2. 卡牌设计很有特色
3. 操作空间大，不枯燥

大家来说说自己的心头好？`,
    tags: ['杂谈'],
    imageUrls: [],
    authorId: 'seed-user-009',
    authorName: '游学之士',
    createdAt: now - 7 * day,
    updatedAt: now - 7 * day,
    publishedAt: now - 7 * day,
    status: 'approved',
    isPinned: false,
    isFeatured: false,
    likeCount: 234,
    commentCount: 189,
    favoriteCount: 34,
    viewCount: 4567,
  },
  {
    id: 'seed-010',
    category: 'battle_report',
    title: '卡牌故事：一张《苏秦背剑》背后的纵横风云',
    summary: '这张卡背后是苏秦身挂六国相印的传奇故事，今天来聊聊这段历史。',
    content: `《苏秦背剑》是游戏中纵横家的代表卡牌，背后是一段波澜壮阔的历史。

**历史背景**
苏秦是战国时期著名的纵横家，曾说服六国联合抗秦，史称"合纵"。

**关键事件**
1. 苏秦初出茅庐，游说秦王不成，落魄回家
2. 闭门苦读《阴符》一年
3. 再次出山，先说燕文公，成功
4. 随后说服赵肃侯、韩宣王、魏哀王、楚威王、齐宣王
5. 身挂六国相印，一时风头无两

**游戏中的苏秦**
卡面设计用了苏秦背着剑（代表六国）的形象，非常有气势。

技能设计上体现了：
- 合纵连横的策略性
- 多国相助的buff
- 背水一战的决心

**个人感想**
每次打出这张卡，都会想起那段纵横捭阖的历史。游戏与历史的结合真的很棒。`,
    tags: ['卡牌故事', '历史典故'],
    imageUrls: [],
    authorId: 'seed-user-010',
    authorName: '纵横家·苏代',
    authorFaction: '纵横家',
    createdAt: now - 10 * day,
    updatedAt: now - 10 * day,
    publishedAt: now - 10 * day,
    status: 'approved',
    isPinned: false,
    isFeatured: true,
    likeCount: 567,
    commentCount: 123,
    favoriteCount: 345,
    viewCount: 9876,
  },
];

export const SEED_COMMENTS: Record<string, import('./types').CommunityComment[]> = {
  'seed-003': [
    {
      id: 'seed-comment-003-1',
      postId: 'seed-003',
      parentId: null,
      authorId: 'seed-user-010',
      authorName: '纵横家·苏代',
      content: `匹配主要看等级和段位，新手期会有保护但不是无限的。建议：
1. 先把基础卡组练熟
2. 不要急着上分，先打匹配熟悉对手
3. 等级高了匹配会更平衡`,
      createdAt: now - 3 * day + 3600000,
      updatedAt: now - 3 * day + 3600000,
      status: 'normal',
      likeCount: 34,
    },
  ],
  'seed-006': [
    {
      id: 'seed-comment-006-1',
      postId: 'seed-006',
      parentId: null,
      authorId: 'seed-user-002',
      authorName: '道家散修·云游子',
      content: `道家老玩家来答：

**必升卡牌（按优先级）**
1. 《庄周梦蝶》- T0卡，必升满
2. 《逍遥游》- T1，核心输出
3. 《齐物论》- T1，过牌神器

**玉石建议**
先别急着抽卡，把这几张升满再用。`,
      createdAt: now - 4 * day + 7200000,
      updatedAt: now - 4 * day + 7200000,
      status: 'normal',
      likeCount: 45,
    },
  ],
};
