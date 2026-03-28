import type { StoryNode } from '../types';

export const PROLOG_NODES: StoryNode[] = [
  // ====== 序章·稷下城门外 ======
  {
    id: 'prolog_0_1',
    type: 'narration',
    content: `清晨。

薄雾如轻纱般笼罩着稷下城。

远处，晨钟声悠悠传来，回荡在城郭之间。
城门刚刚开启，人流如织——有赶早市的商人，有进京述职的官员，
更多的是从四面八方涌来的求学者。

稷下学宫的旗帜在晨风中猎猎作响。
那面旗帜上绣着的不是某个学派的标志，而是两个古朴的大字——

"百家"

你的脚步在长队中缓缓前行。
手中那封泛黄的信函，被你攥得紧紧的。
这是你改变命运的机会。`,
    background: 'city_gate',
    nextNode: 'prolog_0_2',
  },

  // ====== 序章·求学初衷选择 ======
  {
    id: 'prolog_0_2',
    type: 'choice',
    speaker: 'system',
    content: '请选择你的求学初衷\n这个选择将影响你的初始属性和部分对话选项',
    choices: [
      {
        id: 'choice_courage',
        text: '💪 "我想学成本事，报效家国"',
        icon: '💪',
        effects: {
          stats: { courage: 2, charm: 1 },
          flags: { initial_path: 'soldier' },
          path: 'soldier',
        },
        nextNode: 'prolog_0_3a',
      },
      {
        id: 'choice_wisdom',
        text: '📚 "天下知识浩如烟海，我渴望探究真理"',
        icon: '📚',
        effects: {
          stats: { wisdom: 2, insight: 1 },
          flags: { initial_path: 'scholar' },
          path: 'scholar',
        },
        nextNode: 'prolog_0_3a',
      },
      {
        id: 'choice_charm',
        text: '🤝 "我想结交天下英杰，干一番大事业"',
        icon: '🤝',
        effects: {
          stats: { charm: 2, courage: 1 },
          flags: { initial_path: 'diplomat' },
          path: 'diplomat',
        },
        nextNode: 'prolog_0_3a',
      },
      {
        id: 'choice_insight',
        text: '🔍 "我只想看看这世间的运行之道"',
        icon: '🔍',
        effects: {
          stats: { insight: 2, wisdom: 1 },
          flags: { initial_path: 'observer' },
          path: 'observer',
        },
        nextNode: 'prolog_0_3a',
      },
    ],
  },

  // ====== 入学登记处前导 ======
  {
    id: 'prolog_0_3a',
    type: 'narration',
    content: `*你将信函收入怀中，目光坚定地望着城门。*
*队伍缓缓移动，你即将迈入稷下学宫的大门。*

穿过稷下学宫的外门，你来到一座宽敞的大殿。

殿内陈设简朴，几张长案依次排开。
每张案后都坐着一位登记官，正在为新生办理入学手续。

正中的长案后，一位身着素色长袍的登记官引起了你的注意。
他身后悬挂着一块匾额，上书四个苍劲大字——

"有教无类"`,
    background: 'registration_hall',
    nextNode: 'prolog_0_3',
  },

  // ====== 序章·入学登记处 ======
  {
    id: 'prolog_0_3',
    type: 'dialogue',
    speaker: '登记官',
    emotion: 'normal',
    content: `"报上名来，何方人士，为何求学于稷下？"`,
    background: 'registration_hall',
    choices: [
      {
        id: 'reg_direct',
        text: '💬 直言："在下[姓名]，一介布衣。久闻稷下学宫广纳百家的盛名，特来求学。我不为扬名，只为明白一件事——这天下，何为正道？"',
        effects: {
          stats: { courage: 3 },
          relationships: { registration_official: { affection: 3, trust: 5 } },
        },
        nextNode: 'prolog_0_3_direct',
      },
      {
        id: 'reg_graceful',
        text: '🤝 婉言："小生[姓名]，来自[地名]。家父生前常说，稷下学宫是天下学子向往之地。我虽不才，却也想继承父志，来此求学问道。"',
        effects: {
          stats: { charm: 3 },
          relationships: { registration_official: { affection: 5, trust: 3 } },
        },
        nextNode: 'prolog_0_3_graceful',
      },
      {
        id: 'reg_questioning',
        text: '❓ 反问："敢问大人，您觉得什么样的人适合进入稷下学宫？是才高八斗者？还是心怀天下者？亦或是……另有标准？"',
        effects: {
          stats: { wisdom: 3, insight: 2 },
          relationships: { registration_official: { affection: 5, trust: 5 } },
        },
        nextNode: 'prolog_0_3_questioning',
      },
      {
        id: 'reg_silent',
        text: '🤫 沉默：（默默递上推荐信，不发一言）',
        effects: {
          stats: { insight: 3, wisdom: 2 },
          relationships: { registration_official: { affection: 5, trust: 8 } },
        },
        nextNode: 'prolog_0_3_silent',
      },
    ],
  },

  // ====== 直言版后续 ======
  {
    id: 'prolog_0_3_direct',
    type: 'dialogue',
    speaker: '登记官',
    emotion: 'normal',
    content: `*你的声音在大殿中回荡，铿锵有力。*

登记官眉毛微微一挑，手中的笔停顿了片刻。

"好大的口气。"

他翻开你递来的推荐信，神色微变。

*你注意到他看到信封上的印章时，眼角闪过一丝不易察觉的波动。*

"……原来如此。"

他合上信封，重新抬起头，目光中多了一丝审视。

"进去吧。里面会有人考验你。"

*他指了指大殿深处的一道侧门。*`,
    nextNode: 'prolog_0_4',
  },

  // ====== 婉言版后续 ======
  {
    id: 'prolog_0_3_graceful',
    type: 'dialogue',
    speaker: '登记官',
    emotion: 'normal',
    content: `*你的语调平和，举止得体。*

登记官点了点头，神色缓和了些许。

"家学渊源，不错。"

他在簿子上写下几笔，然后将信封收入袖中。

"稷下学宫正需要你这样的学子。"

*他从案上取下一枚令牌，递给你。*

"这是临时通行令。新生请在东院集合，会有人引导你。"`,
    nextNode: 'prolog_0_4',
  },

  // ====== 反问版后续 ======
  {
    id: 'prolog_0_3_questioning',
    type: 'dialogue',
    speaker: '登记官',
    emotion: 'happy',
    content: `*你的问题让登记官停下了笔。*

他放下笔，认真打量了你片刻。

大殿内安静了一瞬，其他登记官也抬起头看向你。

"有意思。"

他嘴角微微上扬，眼中闪过一丝赞许。

"稷下学宫最喜欢你这样的学生。"

*他站起身来，向你微微欠身——这是少见的礼遇。*

"请进。里面有人在等你。"`,
    nextNode: 'prolog_0_4',
  },

  // ====== 沉默版后续 ======
  {
    id: 'prolog_0_3_silent',
    type: 'dialogue',
    speaker: '登记官',
    emotion: 'surprised',
    content: `*你没有说话，只是将推荐信递了过去。*

登记官接过信封，仔细查看。

他的目光在信封上的印章停留了片刻，神色变得复杂。

大殿内一时安静无声。

良久，他缓缓开口：

"……你不必说，我也知道了。"

*他的声音比之前低沉了几分。*

"他临终前托人带来的信，我一直等着送信的人。"

"没想到，是你。"

*他站起身，向你微微颔首。*

"进去吧。有人会亲自考你。"`,
    nextNode: 'prolog_0_4',
  },

  // ====== 序章·拜见稷下宫主 ======
  {
    id: 'prolog_0_4',
    type: 'narration',
    content: `穿过长廊，你来到学宫最深处的一座大殿。

殿内光线昏暗，唯有正中位置有一束光从穹顶洒下。

那束光落在一位白发苍苍的老者身上。

他端坐在案后，闭目养神。虽未睁眼，却给人一种不怒自威的压迫感。

稷下学宫之主——传说中的通儒。

四周寂静无声，只有殿外的风声偶尔吹入。

你注意到，这座大殿名为"问道堂"。`,
    background: 'wendao_hall',
    nextNode: 'prolog_0_4_dialogue',
  },

  {
    id: 'prolog_0_4_dialogue',
    type: 'dialogue',
    speaker: '稷下宫主',
    emotion: 'normal',
    content: `（缓缓睁开眼睛，目光深邃如渊）

"你来了。"

他的声音苍老却有力，在空旷的大殿中回响。

"推荐你前来的人……"

他顿了顿。

"已经不在了。"`,
    background: 'wendao_hall',
    nextNode: 'prolog_0_4_2',
  },

  {
    id: 'prolog_0_4_2',
    type: 'dialogue',
    speaker: '稷下宫主',
    emotion: 'sad',
    content: `你的心猛地一沉。

那封信——那封你一直珍藏的信——
竟然是来自一个已经不在人世的人？

宫主从袖中取出一封泛黄的信函，正是你手中那封的副本。

"这封信，是他临终前托人转交的。"

"他说，你是他选中的人。"

"是继承他道路的人。"`,
    nextNode: 'prolog_0_4_3',
  },

  {
    id: 'prolog_0_4_3',
    type: 'dialogue',
    speaker: '稷下宫主',
    emotion: 'sad',
    content: `"他是我的学生。"

"也是当年最有可能继承学宫的人。"

*宫主的声音中带着一丝难以察觉的悲凉。*

"但他选择了离开，去践行他的道。"

"三年前……"

"他在一场百家论辩中被人击败。"

"那之后，他再也没有说过一句话。"

宫主抬起头，第一次直视你的双眼。

"他说——"

"他的道，是错的。"`,
    nextNode: 'prolog_0_4_choice',
  },

  // ====== 🔴 关键抉择：得知死讯后的反应 ======
  {
    id: 'prolog_0_4_choice',
    type: 'choice',
    speaker: '稷下宫主',
    emotion: 'normal',
    content: `"而你，是他选中的继承者。"

"证明他的选择没有错——"

"这是你来到这里的使命。"

*他从袖中取出一枚令牌，递到你面前。*

"但首先，你必须证明自己配得上这封推荐信。"`,
    background: 'wendao_hall',
    choices: [
      {
        id: 'shock_sad',
        text: '😢 震惊悲伤："谁……是谁害了他？"',
        effects: {
          stats: { courage: 2 },
          relationships: { school_master: { affection: 0, trust: -5 } },
          flags: { reaction_shock: true },
        },
        nextNode: 'prolog_0_4_shock',
      },
      {
        id: 'anger_question',
        text: '😤 愤怒质问："请宫主告知真相！我必为他讨回公道！"',
        effects: {
          stats: { courage: 3 },
          relationships: { school_master: { affection: 3, trust: 3 } },
          flags: { reaction_anger: true },
        },
        nextNode: 'prolog_0_4_anger',
      },
      {
        id: 'calm_question',
        text: '🤔 冷静追问："……请问，他可曾留下什么话？"',
        effects: {
          stats: { wisdom: 2 },
          relationships: { school_master: { affection: 5, trust: 5 } },
          flags: { reaction_calm: true },
        },
        nextNode: 'prolog_0_4_calm',
      },
      {
        id: 'silent_listen',
        text: '😶 沉默聆听：（压下心中波澜，静静等待宫主下文）',
        effects: {
          stats: { insight: 2 },
          relationships: { school_master: { affection: 8, trust: 8 } },
          flags: { reaction_silent: true },
        },
        nextNode: 'prolog_0_4_silent',
      },
    ],
  },

  {
    id: 'prolog_0_4_shock',
    type: 'dialogue',
    speaker: '稷下宫主',
    emotion: 'normal',
    content: `*你的声音在大殿中回荡，带着难以掩饰的悲伤。*

宫主看着你，目光中闪过一丝失望。

"……你的反应，他不会这样。"

他摇了摇头。

"但这也说明，你是真的在乎。"

"记住，不是谁害了他——是他败给了自己的道。"

"现在，你还愿意继续吗？"`,
    nextNode: 'prolog_0_4_continue',
  },

  {
    id: 'prolog_0_4_anger',
    type: 'dialogue',
    speaker: '稷下宫主',
    emotion: 'happy',
    content: `*你的眼中燃起怒火，声音铿锵有力。*

宫主微微点头，眼中闪过一丝赞许。

"好。有决心是好事。"

"但我要提醒你——复仇之路，往往通向深渊。"

"你的愤怒，应该用来证明他的选择没有错，而不是用来伤害无辜。"

"现在，你还愿意继续吗？"`,
    nextNode: 'prolog_0_4_continue',
  },

  {
    id: 'prolog_0_4_calm',
    type: 'dialogue',
    speaker: '稷下宫主',
    emotion: 'happy',
    content: `*你压下心中波澜，声音平稳。*

宫主眼中闪过一丝赞许。

"好。你让我想起了年轻时的他。"

"他也是这样，无论发生什么，都能保持冷静。"

"他留下的最后一句话是——"

宫主顿了顿。

"'我的道是错的。但她的道……或许是对的。'"

"现在，你还愿意继续吗？"`,
    nextNode: 'prolog_0_4_continue',
  },

  {
    id: 'prolog_0_4_silent',
    type: 'dialogue',
    speaker: '稷下宫主',
    emotion: 'happy',
    content: `*你静静地看着宫主，没有说话。*

大殿内一时寂静无声。

良久，宫主开口：

"……你很像我年轻时候认识一个人。"

"他也是这样，无论听到什么，都能保持沉默。"

"那是真正有大智慧的人。"

"现在，你还愿意继续吗？"`,
    nextNode: 'prolog_0_4_continue',
  },

  // ====== 继续剧情 ======
  {
    id: 'prolog_0_4_continue',
    type: 'dialogue',
    speaker: '稷下宫主',
    emotion: 'normal',
    content: `*他从案上取出一枚令牌，递到你面前。*

"这是学宫通行令。从今天起，你就是稷下学宫的记名弟子。"

"接下来，你将进入'心境幻境'。"

"这是稷下学宫的入门考验。"

"你会看到三个场景——墨家、法家、道家的困境。"

"你的选择，将决定你与各派的缘分。"`,
    nextNode: 'prolog_0_4_mind_test_intro',
  },

  {
    id: 'prolog_0_4_mind_test_intro',
    type: 'narration',
    content: `"记住——"

*他的声音变得郑重。*

"没有绝对正确的答案，只有适合你的答案。"

"你选择看到的，就是你内心的投射。"

【系统提示】即将进入心境测试`,
    nextNode: 'prolog_0_mind_1',
  },

  // ====== 心境测试·墨家之影 ======
  {
    id: 'prolog_0_mind_1',
    type: 'narration',
    content: `【心境测试·第一幕】

虚空之中，你发现自己置身于一片燃烧的废墟。

这是一座村庄——或者说，曾经是。

火焰吞噬了茅屋，浓烟遮蔽了天空。
哭喊声、惨叫声、兵刃相交的声音交织在一起。

你看到一群衣衫褴褛的平民正在逃亡。
他们扶老携幼，脸上满是恐惧和绝望。

*一个声音在你耳边响起：*

"这是三年前的边境村庄。战火蔓延之处，生灵涂炭。"`,
    background: 'burning_village',
    nextNode: 'prolog_0_mind_1_2',
  },

  {
    id: 'prolog_0_mind_1_2',
    type: 'dialogue',
    speaker: '墨家弟子',
    emotion: 'determined',
    content: `一位年轻人挡在逃亡队伍的最后。

他身着墨色短衣，手持一柄短戈。
虽然实力有限，却毅然决然地站在追兵面前。

"你们先走！我来挡住他们！"

*追兵是训练有素的士兵，人数众多。*
*这位墨家弟子的抵抗，注定是徒劳的。*

"哈哈哈！"追兵首领大笑，"一个墨家的书呆子，也敢挡路？"

"今天，就让你知道什么叫现实！"`,
    nextNode: 'prolog_0_mind_1_choice',
  },

  {
    id: 'prolog_0_mind_1_choice',
    type: 'choice',
    speaker: '追兵首领',
    emotion: 'angry',
    content: `"喂，你！"

"闲杂人等，给老子让开！"

"这是我们与墨家的恩怨，与你无关！"

*墨家弟子也看到了你，眼中闪过一丝希望。*

"这位兄台……如果你愿意，请帮帮这些无辜的百姓……"`,
    background: 'burning_village',
    choices: [
      {
        id: 'mozi_help',
        text: '⚔️ 站出来帮助墨家弟子："你们以多欺少，算什么英雄？有本事冲我来！"',
        effects: {
          stats: { courage: 2 },
          relationships: { mozi_disciple: { affection: 20, trust: 10 } },
          flags: { mozi_path_open: true, helped_mozi: true },
        },
        nextNode: 'prolog_0_mind_1_help',
      },
      {
        id: 'mozi_mediate',
        text: '🗣️ 尝试调停："且慢！诸位可愿听我一言？战争只会带来更多痛苦，何不——"',
        effects: {
          stats: { charm: 2 },
          relationships: { mozi_disciple: { affection: 10, trust: 5 } },
          flags: { confucian_path_open: true, mozi_path_open: true },
        },
        nextNode: 'prolog_0_mind_1_mediate',
      },
      {
        id: 'mozi_observe',
        text: '🔍 观察局势，寻找其他解决办法',
        effects: {
          stats: { insight: 2 },
          relationships: { mozi_disciple: { affection: 5, trust: 5 } },
          flags: { daoist_path_open: true, mozi_path_open: true },
        },
        nextNode: 'prolog_0_mind_1_observe',
      },
      {
        id: 'mozi_avoid',
        text: '🚶 避开冲突，另寻他路',
        effects: {
          stats: {},
          flags: { mozi_path_avoided: true },
        },
        nextNode: 'prolog_0_mind_2',
      },
    ],
  },

  {
    id: 'prolog_0_mind_1_help',
    type: 'narration',
    content: `*你挡在墨家弟子身前，目光如炬。*

追兵首领冷笑一声："又来了一个送死的！"

你与墨家弟子并肩而立，面对数倍于己的敌人。

*一番激战后……*

你们成功拖住了追兵，让百姓得以逃脱。
但你也因此身负重伤。

墨家弟子扶着你，眼中满是感激：

"多谢兄台！墨家不会忘记你的恩情！"`,
    nextNode: 'prolog_0_mind_2',
  },

  {
    id: 'prolog_0_mind_1_mediate',
    type: 'narration',
    content: `*你站出来，试图用言语化解冲突。*

"且慢！诸位……"

追兵首领不耐烦地打断你："少废话！"

但你的话语还是让一些人犹豫了。

趁着追兵分神的瞬间，墨家弟子带着百姓从小路逃离。

当一切平息，追兵首领狠狠地瞪了你一眼：

"算你走运！"

*你没有赢得胜利，但你救了人。*`,
    nextNode: 'prolog_0_mind_2',
  },

  {
    id: 'prolog_0_mind_1_observe',
    type: 'narration',
    content: `*你没有冲动行事，而是观察周围环境。*

你发现了一条隐蔽的小路，通向山林深处。

趁着追兵的注意力被墨家弟子吸引，你悄悄引导一部分百姓从小路转移。

当追兵发现时，大部分百姓已经消失在密林中。

墨家弟子望着你撤离的方向，微微点头：

"好眼力……这位兄台，是个人才。"`,
    nextNode: 'prolog_0_mind_2',
  },

  // ====== 心境测试·法家之影 ======
  {
    id: 'prolog_0_mind_2',
    type: 'narration',
    content: `【心境测试·第二幕】

虚空变换，场景转换。

你发现自己站在一座公堂之上。

堂中央立着一块匾额，上书"明镜高悬"四字。

一位身着黑色法袍的官员端坐于案后，面容冷峻，目光如电。

这是法家的审判现场。

*一个声音在你耳边响起：*

"这是法家的审判。你将见证法家的'公正'。"`,
    background: 'courthouse',
    nextNode: 'prolog_0_mind_2_2',
  },

  {
    id: 'prolog_0_mind_2_2',
    type: 'dialogue',
    speaker: '法家官员',
    emotion: 'angry',
    content: `公堂中央跪着一个小偷。

他蓬头垢面，瘦骨嶙峋。
身上的衣服满是补丁，沾满了泥土。

"堂下何人？"法家官员冷声问道。

"小人……小人名叫阿福……"小偷颤抖着回答。

"所犯何事？"

"小人……小人偷了一块……一块馒头……"

*人群中传来议论声。*

"才一块馒头啊……"
"听说他是为了救他生病的母亲……"
"唉，怪可怜的……"`,
    nextNode: 'prolog_0_mind_2_3',
  },

  {
    id: 'prolog_0_mind_2_3',
    type: 'dialogue',
    speaker: '法家官员',
    emotion: 'angry',
    content: `法家官员抬起手，人群立刻安静。

"按律——"

他的声音冰冷，不带一丝感情。

"偷盗者，当断其手。"

*阿福瘫软在地，面如死灰。*

"但念其初犯，减为鞭刑三十。"

"来人，行刑！"`,
    nextNode: 'prolog_0_mind_2_choice',
  },

  {
    id: 'prolog_0_mind_2_choice',
    type: 'choice',
    speaker: '法家官员',
    emotion: 'angry',
    content: `"行刑！"

*两个衙役上前，将阿福按倒在地。*
*另一个人手持鞭子，准备行刑。*

你注意到阿福的眼中没有怨恨，只有绝望。

还有……一丝解脱。

【你的选择将决定你与法家的缘分】`,
    background: 'courthouse',
    choices: [
      {
        id: 'legalist_support',
        text: '⚖️ 支持法家判决："法不可违！若今天破例，明日便有千人效仿！"',
        effects: {
          stats: { wisdom: 2 },
          relationships: { legalist_official: { affection: 20, trust: 10 } },
          flags: { legalist_path_open: true, supported_legalist: true },
        },
        nextNode: 'prolog_0_mind_2_support',
      },
      {
        id: 'legalist_plead',
        text: '🤝 为小偷求情："律法之外，还有人情！求大人给他一个改过的机会！"',
        effects: {
          stats: { charm: 2 },
          relationships: { confucian_senior: { affection: 15, trust: 5 } },
          flags: { confucian_path_open: true },
        },
        nextNode: 'prolog_0_mind_2_plead',
      },
      {
        id: 'legalist_compromise',
        text: '💡 提出折中方案："大人，何不让他以劳役抵罪？既全了法理，又显我百家仁心！"',
        effects: {
          stats: { wisdom: 1, charm: 1 },
          relationships: { eclectic_master: { affection: 15, trust: 10 } },
          flags: { eclectic_path_open: true },
        },
        nextNode: 'prolog_0_mind_2_compromise',
      },
      {
        id: 'legalist_question',
        text: '❓ 质疑法律本身："请问大人——这律法是谁定的？为谁而立？"',
        effects: {
          stats: { insight: 2, wisdom: 1 },
          relationships: { logician_master: { affection: 20, trust: 5 } },
          flags: { logician_path_open: true },
        },
        nextNode: 'prolog_0_mind_2_question',
      },
    ],
  },

  {
    id: 'prolog_0_mind_2_support',
    type: 'narration',
    content: `*你站出来，声音洪亮。*

"法不可违！若今天破例，明日便有千人效仿！"

法家官员看了你一眼，眼中闪过一丝赞许。

"说得好。"

他转身继续下令："行刑！"

鞭子呼啸而下，阿福痛苦地呻吟。

*但你没有移开视线。*
*这是法的代价。*`,
    nextNode: 'prolog_0_mind_3',
  },

  {
    id: 'prolog_0_mind_2_plead',
    type: 'narration',
    content: `*你站出来，声音恳切。*

"律法之外，还有人情！求大人给他一个改过的机会！"

法家官员冷冷地看着你。

"人情？"

"法者，天下之公器。岂可因私情而废公法？"

他挥手："行刑！"

*你的求情没有改变任何事。*
*但人群中有人向你投来感激的目光。*`,
    nextNode: 'prolog_0_mind_3',
  },

  {
    id: 'prolog_0_mind_2_compromise',
    type: 'narration',
    content: `*你站出来，声音平和但坚定。*

"大人，何不让他以劳役抵罪？"

"既全了法理，又显我百家仁心！"

法家官员沉默片刻。

"……劳役抵罪？"

他若有所思地点了点头。

"倒是个折中的办法。"

"阿福，改为劳役一年。退堂！"`,
    nextNode: 'prolog_0_mind_3',
  },

  {
    id: 'prolog_0_mind_2_question',
    type: 'narration',
    content: `*你开口，声音在大堂中回荡。*

"请问大人——"

"这律法是谁定的？为谁而立？"

法家官员眼中闪过一丝惊讶，随即恢复冷漠。

"好问题。"

"律法，由王者定，为天下而立。"

"但你的问题，不是现在该问的。"

*他挥手行刑，似乎不想继续这个话题。*
*但你注意到，他的眼中有一丝……动摇？*`,
    nextNode: 'prolog_0_mind_3',
  },

  // ====== 心境测试·道家之影 ======
  {
    id: 'prolog_0_mind_3',
    type: 'narration',
    content: `【心境测试·第三幕】

虚空再次变换。

你站在悬崖边。

面前是一片无边无际的云海。
云海翻涌，如浪如涛。

远处，云海之下隐约可见一座小村庄。
那是你梦中无数次看到的地方——

故乡。

*风从悬崖下吹来，带着云雾的湿润。*

*一个声音在你耳边响起：*

"这是你心中的故乡。那些你以为已经忘记的简单快乐。"`,
    background: 'cliff_clouds',
    nextNode: 'prolog_0_mind_3_2',
  },

  {
    id: 'prolog_0_mind_3_2',
    type: 'dialogue',
    speaker: '祖父',
    emotion: 'happy',
    content: `"孩子。"

一道苍老的声音从身后传来。

你转过身——

一位白发老者站在你身后。
他的模样，竟与你过世的祖父一模一样。

*你的心猛地一颤。*

*祖父……已经去世十年了。*

"祖父……？"你喃喃道。

老者微微一笑，目光中满是慈爱。

"孩子，你这一生追求的是什么？"`,
    nextNode: 'prolog_0_mind_3_3',
  },

  {
    id: 'prolog_0_mind_3_3',
    type: 'dialogue',
    speaker: '祖父',
    emotion: 'happy',
    content: `"是权倾天下的荣耀？"

"是学贯百家的智慧？"

"还是……"

*他指向云海下的故乡。*

"找到回家的路？"

"那些简单快乐的日子？"

【场景中浮现三幅画面】

【画面一】权倾天下——华服高位，群臣跪拜
【画面二】学贯百家——著作等身，学子求学
【画面三】回归故乡——小院炊烟，祖父膝前`,
    nextNode: 'prolog_0_mind_3_choice',
  },

  {
    id: 'prolog_0_mind_3_choice',
    type: 'choice',
    speaker: '祖父',
    emotion: 'happy',
    content: `老者的声音再次响起：

"你的选择是什么？"`,
    background: 'cliff_clouds',
    choices: [
      {
        id: 'dao_power',
        text: '👑 "我要权倾天下"——大丈夫生于乱世，当提三尺剑，立不世功！',
        effects: {
          stats: { fame: 5, courage: 2 },
          flags: { strategist_path_open: true, diplomat_path_open: true },
        },
        nextNode: 'prolog_0_mind_3_power',
      },
      {
        id: 'dao_wisdom',
        text: '📚 "我要学贯百家，明白天下至理"——知识是人类进步的阶梯！',
        effects: {
          stats: { wisdom: 5, insight: 2 },
          flags: { confucian_path_open: true, logician_path_open: true },
        },
        nextNode: 'prolog_0_mind_3_wisdom',
      },
      {
        id: 'dao_home',
        text: '🏠 "我想回家"——那些简单快乐的日子，才是我最想要的。',
        effects: {
          stats: { charm: 3, wisdom: 2 },
          flags: { daoist_path_open: true },
        },
        nextNode: 'prolog_0_mind_3_home',
      },
      {
        id: 'dao_unknown',
        text: '🤔 "我不知道……"',
        effects: {
          stats: { insight: 5, wisdom: 3 },
          flags: { universal_path_open: true },
        },
        nextNode: 'prolog_0_mind_3_unknown',
      },
    ],
  },

  {
    id: 'prolog_0_mind_3_power',
    type: 'narration',
    content: `*你的声音在云海中回荡。*

"我要权倾天下！"

"大丈夫生于乱世，当提三尺剑，立不世功！"

云海中，画面一闪——你看到自己身着华服，坐于高位之上。
群臣跪拜，山呼万岁。

老者点点头。

"好。有志气。"

"但权力之路，充满荆棘。你准备好了吗？"`,
    nextNode: 'prolog_0_mind_complete',
  },

  {
    id: 'prolog_0_mind_3_wisdom',
    type: 'narration',
    content: `*你的声音坚定而清晰。*

"我要学贯百家，明白天下至理！"

云海中，画面一闪——你看到自己立于学宫之巅，著作等身。
天下学子皆来求学，问道解惑。

老者微微一笑。

"求知若渴，这是好事。"

"但知识无边，你准备好穷尽一生去追寻了吗？"`,
    nextNode: 'prolog_0_mind_complete',
  },

  {
    id: 'prolog_0_mind_3_home',
    type: 'narration',
    content: `*你的目光望向云海下的故乡。*

"我想回家……"

"那些简单快乐的日子，才是我最想要的。"

云海中，画面一闪——你看到自己在故乡的小院中。
祖父坐在树下，你在旁边听他讲故事。
炊烟袅袅，饭菜飘香。

老者轻叹。

"返璞归真，这也是道。"

"但你确定，能放下一切吗？"`,
    nextNode: 'prolog_0_mind_complete',
  },

  {
    id: 'prolog_0_mind_3_unknown',
    type: 'narration',
    content: `*你沉默了。*

"我……我不知道。"

老者看着你，眼中闪过一丝欣慰。

"诚实。"

"不知道，比错误地以为自己知道要好。"

"你很特别，年轻人。"

"大多数人，在这一刻都会给出一个答案。"

"而你，选择了坦诚。"

*他转身，向云海深处走去。*

"或许……这才是真正的开始。"`,
    nextNode: 'prolog_0_mind_complete',
  },

  // ====== 心境测试结束 ======
  {
    id: 'prolog_0_mind_complete',
    type: 'narration',
    content: `*云海翻涌，将你包裹。*

*光芒涌入，场景消散……*

你重新站在了问道堂中。

稷下宫主依然站在你面前，目光深邃。

"你回来了。"

他的声音中带着一丝难以察觉的满意。

"心境测试……你通过了。"

*他转身，缓步走回案后。*

"从现在起，你就是稷下学宫的记名弟子。"

"三个月后，将有一场百家论辩大会。"

"在那之前——"

*他从案上取出一卷竹简，递给你。*

"你必须选择自己想要深入学习的门派。"`,
    background: 'wendao_hall',
    nextNode: 'prolog_0_faction_choice',
  },

  // ====== 🔴 关键选择：门派选择 ======
  {
    id: 'prolog_0_faction_choice',
    type: 'choice',
    speaker: '稷下宫主',
    emotion: 'normal',
    content: `"当然，你也可以选择不依附任何门派。"

"但那样的路，会更加艰难。"

"十六门派，各有所长。"

"儒家仁义，法家严明，道家自然，墨家兼爱……"

"选择你最认同的道。"

"或者——"

*他的目光中闪过一丝深意。*

"你可以选择不选择。"

"成为'旁观者'。"`,
    background: 'wendao_hall',
    choices: [
      {
        id: 'choose_mozi',
        text: '🏛️ 墨家——兼爱与非攻之道（公输盘）',
        effects: {
          flags: { chosen_faction: 'mozi', chapter_1_path: 'mozi' },
          path: 'mozi',
        },
        nextNode: 'prolog_0_end',
      },
      {
        id: 'choose_confucian',
        text: '📜 儒家——仁义与秩序之道（颜如玉）',
        effects: {
          flags: { chosen_faction: 'confucian', chapter_1_path: 'confucian' },
          path: 'confucian',
        },
        nextNode: 'prolog_0_end',
      },
      {
        id: 'choose_legalist',
        text: '⚖️ 法家——法治与秩序之道（商鞅式）',
        effects: {
          flags: { chosen_faction: 'legalist', chapter_1_path: 'legalist' },
          path: 'legalist',
        },
        nextNode: 'prolog_0_end',
      },
      {
        id: 'choose_daoist',
        text: '☯️ 道家——无为与自然之道（庄周梦）',
        effects: {
          flags: { chosen_faction: 'daoist', chapter_1_path: 'daoist' },
          path: 'daoist',
        },
        nextNode: 'prolog_0_end',
      },
      {
        id: 'choose_observe',
        text: '👁️ 暂不决定——先四处看看，观望全局（开启百家线条件）',
        effects: {
          flags: { chosen_faction: 'none', chapter_1_path: 'universal' },
          path: 'universal',
        },
        nextNode: 'prolog_0_end',
      },
    ],
  },

  // ====== 序章结束 ======
  {
    id: 'prolog_0_end',
    type: 'ending',
    speaker: '稷下宫主',
    emotion: 'normal',
    content: `"选择之后，你将正式成为该派的弟子。"

"该派的长老会负责你的修行。"

"三年之后——"

*他的目光变得深邃。*

"你将成为什么样的人，取决于你这三年的选择。"

"去吧。"

"你的故事，才刚刚开始。"

【序章·入学 完成】

【章节评价】
├── 求学初衷：[根据选择显示]
├── 对话风格：[根据选择显示]
├── 关键抉择：[根据选择显示]
├── 心境测试：[根据选择显示]
└── 门派选择：[根据选择显示]

【存档点】游戏已自动保存`,
    background: 'wendao_hall',
    nextNode: 'ch_moru_001_n001',
  },
];
