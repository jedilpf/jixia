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
  // ====== 新增10篇种子帖子 ======
  {
    id: 'seed-011',
    category: 'discussion',
    title: '儒家新手入门指南：从零到精通',
    summary: '儒家是新手最容易上手的门派，这篇帖子带你全面了解儒家的玩法。',
    content: `很多新手玩家问我儒家怎么玩，今天写一篇完整的入门指南。

**儒家特点**
儒家强调"仁义礼智信"，在游戏中表现为：
- 稳定的资源获取
- 较强的防守能力
- 后期爆发力

**新手推荐卡组**
- 《仁政》- 核心卡，每回合稳定收益
- 《礼乐》- 防守必备
- 《中庸》- 后期关键卡

**常见误区**
1. 不要过度追求前期压制
2. 资源要留到关键时刻
3. 不要忽视防守

**进阶技巧**
- 学会计算对手的资源
- 掌握节奏切换时机
- 熟悉各门派的对阵特点`,
    tags: ['门派攻略', '论辩技巧'],
    imageUrls: [],
    authorId: 'seed-user-011',
    authorName: '儒学大师·仲尼',
    authorFaction: '儒家',
    createdAt: now - 9 * day,
    updatedAt: now - 9 * day,
    publishedAt: now - 9 * day,
    status: 'approved',
    isPinned: false,
    isFeatured: false,
    likeCount: 78,
    commentCount: 45,
    favoriteCount: 56,
    viewCount: 1890,
  },
  {
    id: 'seed-012',
    category: 'qa',
    title: '【已解决】如何获得更多玉石？',
    summary: '新手玩家想知道除了日常任务，还有什么方法能获得玉石。',
    content: `玩了一周，感觉玉石获取太慢了，请教各位大佬：

1. 日常任务给的是固定的吗？
2. 有没有其他获取途径？
3. 首充值得买吗？

---
**已采纳回答**：

玉石获取途径：
1. 每日任务：约100玉石
2. 论辩大会：每次胜利30-50玉石
3. 成就系统：一次性奖励，累计可达2000玉石
4. 周活动：每周额外200玉石
5. 首充：性价比最高，建议购买`,
    tags: ['新手求助', '已解决'],
    imageUrls: [],
    authorId: 'seed-user-012',
    authorName: '稷下新人',
    createdAt: now - 11 * day,
    updatedAt: now - 11 * day,
    publishedAt: now - 11 * day,
    status: 'approved',
    isPinned: false,
    isFeatured: false,
    likeCount: 34,
    commentCount: 28,
    favoriteCount: 12,
    viewCount: 567,
    qaState: 'resolved',
    acceptedCommentId: 'seed-comment-012-1',
  },
  {
    id: 'seed-013',
    category: 'culture',
    title: '【成语故事】五十步笑百步的由来',
    summary: '这张卡牌背后是孟子与梁惠王的对话，体现了孟子对治国理念的见解。',
    content: `《五十步笑百步》是儒家一张很有意思的卡牌。

**典故出处**
出自《孟子·梁惠王上》："五十步笑百步，则何如？"

孟子对梁惠王说：士兵逃跑，跑了五十步的嘲笑跑了一百步的，有什么区别呢？

**深层含义**
孟子用这个比喻说明：梁惠王虽然比邻国君主做得好一些，但本质上仍然没有真正实行仁政。

**游戏中的设计**
- 卡牌效果：嘲讽对手的同时自己受小损
- 体现"知耻"的儒家思想
- 鼓励玩家反思自身不足

**现代启示**
五十步笑百步的典故告诉我们：
1. 不要只看别人的缺点
2. 自己做得再好也要保持谦逊
3. 真正的进步是永无止境的`,
    tags: ['成语故事', '历史典故'],
    imageUrls: [],
    authorId: 'seed-user-013',
    authorName: '典故讲述者',
    createdAt: now - 14 * day,
    updatedAt: now - 14 * day,
    publishedAt: now - 14 * day,
    status: 'approved',
    isPinned: false,
    isFeatured: true,
    likeCount: 234,
    commentCount: 45,
    favoriteCount: 123,
    viewCount: 4567,
  },
  {
    id: 'seed-014',
    category: 'battle_report',
    title: '精彩对决：道家vs法家巅峰对决',
    summary: '一场道士与法家高手的对决，节奏与控制的完美博弈。',
    content: `这是一场黄金段位的精彩对局。

**对手信息**
- 道家高手：《逍遥游》流
- 我：法家控制流

**对决过程**
第1回合：我先用《刑鼎》限制他的行动
第2回合：他打出《齐物论》疯狂过牌
第3回合：我继续控制，他开始积累资源
第4回合：关键时刻！他打出《庄周梦蝶》
第5回合：他爆发输出，我的控制链断了
第6回合：我试图稳住局势
第7回合：他一鼓作气拿下胜利

**复盘总结**
1. 道家的爆发能力很强，不能拖太久
2. 控制流要把握好窗口期
3. 《庄周梦蝶》是真正的翻盘神器`,
    tags: ['精彩对决', '战场趣闻'],
    imageUrls: [],
    authorId: 'seed-user-014',
    authorName: '法家执法者',
    authorFaction: '法家',
    createdAt: now - 3 * day,
    updatedAt: now - 3 * day,
    publishedAt: now - 3 * day,
    status: 'approved',
    isPinned: false,
    isFeatured: false,
    likeCount: 89,
    commentCount: 34,
    favoriteCount: 23,
    viewCount: 1234,
  },
  {
    id: 'seed-015',
    category: 'discussion',
    title: '论辩大会段位系统详解',
    summary: '详细解释论辩大会的段位机制，帮助你更好地规划上分路线。',
    content: `很多玩家对段位系统不太了解，我来详细解释一下。

**段位划分**
- 铜牌：新手入门（0-500分）
- 银牌：初级玩家（500-1000分）
- 黄金：中级玩家（1000-1500分）
- 钻石：高级玩家（1500-2000分）
- 大师：顶尖高手（2000+分）

**积分规则**
- 胜利：+15分（连胜有额外加成）
- 失败：-10分（败场保护机制）
- 每赛季重置部分积分

**上分技巧**
1. 选择适合自己的门派
2. 熟悉常见对手的套路
3. 保持稳定的心态
4. 不要盲目追求连胜

**奖励机制**
- 段位奖励：每段位玉石奖励
- 赛季奖励：顶尖玩家专属头像`,
    tags: ['论辩技巧', '规则咨询'],
    imageUrls: [],
    authorId: 'seed-user-015',
    authorName: '论辩导师',
    createdAt: now - 5 * day,
    updatedAt: now - 5 * day,
    publishedAt: now - 5 * day,
    status: 'approved',
    isPinned: false,
    isFeatured: false,
    likeCount: 156,
    commentCount: 67,
    favoriteCount: 89,
    viewCount: 2345,
  },
  {
    id: 'seed-016',
    category: 'culture',
    title: '【传统节日】中秋与思乡情怀',
    summary: '中秋节将至，聊聊游戏中与中秋相关的卡牌设计和历史典故。',
    content: `中秋节是中国最重要的传统节日之一。

**历史渊源**
中秋节起源于古代秋祀，至唐代正式成为节日。苏轼的《水调歌头》是中秋诗词的巅峰之作。

**游戏中的中秋元素**
虽然没有专门的中秋活动，但一些卡牌体现了思乡情怀：
- 《归乡》- 道家卡牌，体现游子思乡
- 《月下独酌》- 儒家卡牌，文人雅趣

**传统习俗**
1. 赏月：月圆人团圆
2. 吃月饼：象征团圆
3. 玩花灯：孩童乐趣

**文化意义**
中秋节承载着中国人对团圆的向往，体现了儒家"家国一体"的思想。

祝各位玩家中秋快乐！`,
    tags: ['传统节日', '历史典故'],
    imageUrls: [],
    authorId: 'seed-user-016',
    authorName: '文化研究者',
    createdAt: now - 15 * day,
    updatedAt: now - 15 * day,
    publishedAt: now - 15 * day,
    status: 'approved',
    isPinned: false,
    isFeatured: false,
    likeCount: 67,
    commentCount: 23,
    favoriteCount: 45,
    viewCount: 890,
  },
  {
    id: 'seed-017',
    category: 'qa',
    title: '规则咨询：反诘牌的作用是什么？',
    summary: '新玩家不太理解反诘牌的具体效果，求老玩家解答。',
    content: `刚玩几天，看到有"反诘"类型的卡牌，不太明白它的作用：

1. 反诘牌和其他类型有什么不同？
2. 应该在什么时候使用？
3. 有哪些值得推荐的反诘牌？

求大佬解惑！`,
    tags: ['规则咨询', '新手求助'],
    imageUrls: [],
    authorId: 'seed-user-017',
    authorName: '求知学徒',
    createdAt: now - 6 * day,
    updatedAt: now - 6 * day,
    publishedAt: now - 6 * day,
    status: 'approved',
    isPinned: false,
    isFeatured: false,
    likeCount: 45,
    commentCount: 56,
    favoriteCount: 12,
    viewCount: 678,
    qaState: 'answered',
  },
  {
    id: 'seed-018',
    category: 'battle_report',
    title: '史诗翻盘：儒家后手逆袭道家',
    summary: '面对道家的强势压制，儒家后手玩家如何找到机会逆转局势。',
    content: `这是一场让我印象深刻的对局。

**对手分析**
道家玩家，擅长速攻流，前期攻势凶猛。

**开局困境**
- 第1回合：他打出《逍遥游》，快速积累
- 第2回合：我被压制，只能防守
- 第3回合：他继续施压，我岌岌可危

**转折点**
第4回合，我终于攒够了资源，打出《礼乐》稳住阵脚。
他见势头不对，提前打出《庄周梦蝶》...

**逆袭**
关键是我手上还有一张《中庸》！
等他爆发完，我用《中庸》完成反打。

**心得**
1. 前期稳住就是胜利
2. 不要被对手节奏带跑
3. 关键牌要留到关键时刻`,
    tags: ['史诗翻盘', '精彩对决'],
    imageUrls: [],
    authorId: 'seed-user-018',
    authorName: '儒学传人',
    authorFaction: '儒家',
    createdAt: now - 8 * day,
    updatedAt: now - 8 * day,
    publishedAt: now - 8 * day,
    status: 'approved',
    isPinned: false,
    isFeatured: false,
    likeCount: 178,
    commentCount: 45,
    favoriteCount: 67,
    viewCount: 2345,
  },
  {
    id: 'seed-019',
    category: 'discussion',
    title: '纵横家卡组构筑分享：合纵连横',
    summary: '纵横家是策略性最强的门派，分享一套我的上分卡组。',
    content: `纵横家玩家集合！这套卡组我打到黄金段位。

**门派特点**
纵横家擅长"合纵连横"：
- 多方向进攻
- 灵活切换策略
- 信息控制能力强

**核心卡牌**
1. 《苏秦背剑》- 主力输出
2. 《张仪舌》- 关键控制
3. 《合纵》- 团队增益
4. 《连横》- 快速突破

**构筑思路**
前期用控制稳住，中期开始多线进攻，后期一波带走。

**对阵要点**
- 对儒家：打破他的节奏
- 对法家：防控制，快速决策
- 对道家：比他更灵活

**总结**
纵横家需要大局观，适合喜欢策略的玩家。`,
    tags: ['卡组构筑', '门派攻略'],
    imageUrls: [],
    authorId: 'seed-user-019',
    authorName: '纵横策士',
    authorFaction: '纵横家',
    createdAt: now - 7 * day,
    updatedAt: now - 7 * day,
    publishedAt: now - 7 * day,
    status: 'approved',
    isPinned: false,
    isFeatured: false,
    likeCount: 89,
    commentCount: 34,
    favoriteCount: 45,
    viewCount: 1234,
  },
  {
    id: 'seed-020',
    category: 'culture',
    title: '【诸子百家】兵家的"知己知彼"思想',
    summary: '游戏中兵家的设计体现了孙子兵法的核心思想，今天来深入探讨。',
    content: `兵家是游戏中比较有特色的门派，其设计基于孙子兵法。

**核心思想**
"知己知彼，百战不殆"是孙子兵法的精髓。

在游戏中体现为：
- 信息获取能力强
- 能分析对手手牌
- 预判对手行动

**代表卡牌**
- 《孙子兵法》- 信息获取
- 《知己知彼》- 预判关键牌
- 《兵贵神速》- 快速出击

**历史背景**
孙武（孙子）是春秋时期军事家，著有《孙子兵法》，至今仍被世界各国军事学院研读。

**现代应用**
"知己知彼"的思想不仅适用于战争，也适用于：
- 商业竞争
- 谈判交涉
- 日常决策

兵家玩家要学会分析局势，而不是盲目进攻。`,
    tags: ['诸子百家', '历史典故'],
    imageUrls: [],
    authorId: 'seed-user-020',
    authorName: '兵法研习者',
    authorFaction: '兵家',
    createdAt: now - 13 * day,
    updatedAt: now - 13 * day,
    publishedAt: now - 13 * day,
    status: 'approved',
    isPinned: false,
    isFeatured: true,
    likeCount: 345,
    commentCount: 67,
    favoriteCount: 178,
    viewCount: 5678,
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
  // ====== 新增帖子评论 ======
  'seed-012': [
    {
      id: 'seed-comment-012-1',
      postId: 'seed-012',
      parentId: null,
      authorId: 'seed-user-015',
      authorName: '论辩导师',
      content: `玉石获取途径：
1. 每日任务：约100玉石
2. 论辩大会：每次胜利30-50玉石
3. 成就系统：一次性奖励，累计可达2000玉石
4. 周活动：每周额外200玉石
5. 首充：性价比最高，建议购买

另外，不要把玉石都用来抽卡，升级关键卡牌更重要！`,
      createdAt: now - 11 * day + 3600000,
      updatedAt: now - 11 * day + 3600000,
      status: 'normal',
      likeCount: 45,
    },
    {
      id: 'seed-comment-012-2',
      postId: 'seed-012',
      parentId: 'seed-comment-012-1',
      authorId: 'seed-user-012',
      authorName: '稷下新人',
      content: '谢谢大佬！这下清楚了，我先去完成成就任务。',
      createdAt: now - 11 * day + 7200000,
      updatedAt: now - 11 * day + 7200000,
      status: 'normal',
      likeCount: 12,
    },
  ],
  'seed-017': [
    {
      id: 'seed-comment-017-1',
      postId: 'seed-017',
      parentId: null,
      authorId: 'seed-user-005',
      authorName: '法家学子·卫鞅',
      content: `反诘牌是游戏中非常重要的类型！

**什么是反诘牌**
反诘牌相当于"反击卡"，用于反制对手的行动。

**使用时机**
- 对手打出关键牌时
- 预判对手要做什么时
- 需要打断对手节奏时

**推荐反诘牌**
1. 《断简成法》- 法家，反制成功后让对手弃牌
2. 《白马非马》- 名家，偷换论题
3. 《清议》- 儒家，稳定防守反击`,
      createdAt: now - 6 * day + 3600000,
      updatedAt: now - 6 * day + 3600000,
      status: 'normal',
      likeCount: 56,
    },
    {
      id: 'seed-comment-017-2',
      postId: 'seed-017',
      parentId: null,
      authorId: 'seed-user-002',
      authorName: '道家散修·云游子',
      content: `简单来说，反诘就是"你打一张，我挡一张"。

道家的《逍遥游》虽然不是反诘牌，但配合反诘牌使用效果很好。

建议新手先练一两张基础反诘牌，熟悉后再扩展。`,
      createdAt: now - 6 * day + 7200000,
      updatedAt: now - 6 * day + 7200000,
      status: 'normal',
      likeCount: 34,
    },
  ],
  'seed-019': [
    {
      id: 'seed-comment-019-1',
      postId: 'seed-019',
      parentId: null,
      authorId: 'seed-user-010',
      authorName: '纵横家·苏代',
      content: `纵横家玩家顶一下！这套卡组思路很好。

不过我觉得可以再加一张《张仪舌》，控制能力更强。

另外合纵连横要灵活切换，不要死守一个方向。`,
      createdAt: now - 7 * day + 3600000,
      updatedAt: now - 7 * day + 3600000,
      status: 'normal',
      likeCount: 23,
    },
  ],
};
