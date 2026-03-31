import type { StoryNode } from '../types';

export const PROLOG_NODES: StoryNode[] = [
  // ====== 序章·梦境·入学前夜 ======
  {
    id: 'prolog_0_0',
    type: 'narration',
    content: `【序章·梦境】

夜深，客栈简陋，汝却辗转难寐。

窗外月色清冷，映照着那封泛黄的信函。
汝凝视良久，不知不觉间，困意袭来——

*恍惚间，汝发现自己立于一片茫茫云海之上。*
*脚下无根，身旁无物，唯风声呜咽。*

「来了。」

一道苍老之声自虚空中响起。

汝转身——

雾中隐约可见一道身影。
其衣灰麻，面容模糊，似有若无。
腰间只悬一酒葫芦，别无旁物。

「尔便是伯达之子乎？」

彼不待汝答，自顾自而言：

「有点意思。」

「汝可知，汝父所求何道？」

汝欲言，却发觉喉中无声。

老者轻笑：

「不急。路还长着。」

「吾有几句话，汝且记之——」

「入稷下，不可信第一家之言。」
「入稷下，不可信最后一家之言。」
「入稷下——」

*彼顿了顿。*

「要信自己。」

*汝欲追问，雾气却已涌来，将一切吞没——*

汝猛然惊醒。

窗外，东方已白。
稷下学宫新弟子报到之日，已至。`,
    background: 'cloud_dream',
    nextNode: 'prolog_0_1',
  },

  // ====== 序章·稷下城门外 ======
  {
    id: 'prolog_0_1',
    type: 'narration',
    content: `黎明天色，薄雾四合。

稷下城郭隐于轻纱之内，若隐若现。

远处晨钟乍响，声彻云霄，在城郭间回荡不绝。
城门方启，人流如涌——有早起的商贾，有述职的官吏，
而更多的是自四方跋涉而来的求道者。

稷下学宫之旗于晨风中猎猎翻卷。
旗上所绣，非一家一派之徽记，乃是两个古朴苍劲的大字——

「百家」

人潮之中，汝足步缓缓而前。
怀中那封泛黄的信函，被攥得愈紧。

此信，汝知之——
乃是改变命运之契机，亦是背负使命之始。`,
    background: 'city_gate',
    nextNode: 'prolog_0_2',
  },

  // ====== 序章·求学初衷选择 ======
  {
    id: 'prolog_0_2',
    type: 'choice',
    speaker: 'system',
    content: '请述说汝之求学初衷\n此抉择将影响汝之天赋属性，亦将决定部分对言之取向',
    choices: [
      {
        id: 'choice_courage',
        text: '💪 "吾欲学成，以报家国"',
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
        text: '📚 "天下知识如海，吾愿探其真理"',
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
        text: '🤝 "吾欲广交天下英杰，成一番大业"',
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
        text: '🔍 "吾只欲观世间运行之理"',
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
    content: `*汝将信函收入怀中，目光坚定，望向城门。*
*人潮缓缓前行，汝即将踏入稷下学宫之门。*

穿过学宫外门，汝步入一座宽敞殿宇。

殿内陈设简朴，长案依次而列。
案后各坐登记官一人，正为新生办理入学之事。

正中长案之后，一位身着素色袍服的登记官引起了汝之注意。
其身后高悬一匾，上书四个苍劲大字——

「有教无类」`,
    background: 'registration_hall',
    nextNode: 'prolog_0_3',
  },

  // ====== 序章·入学登记处 ======
  {
    id: 'prolog_0_3',
    type: 'dialogue',
    speaker: '登记官',
    emotion: 'normal',
    content: `「报上名来，何方人士，为何求学于稷下？」`,
    background: 'registration_hall',
    choices: [
      {
        id: 'reg_direct',
        text: '💬 直言："在下[姓名]，一介布衣。久闻稷下广纳百家的盛名，特来求学。不为扬名，只为明白一事——这天下，何为正道？"',
        effects: {
          stats: { courage: 3 },
          relationships: { registration_official: { affection: 3, trust: 5 } },
        },
        nextNode: 'prolog_0_3_direct',
      },
      {
        id: 'reg_graceful',
        text: '🤝 婉言："小生[姓名]，来自[地名]。家父生前常言，稷下学宫乃天下学子向往之地。吾虽不才，亦欲继承父志，来此求学问道。"',
        effects: {
          stats: { charm: 3 },
          relationships: { registration_official: { affection: 5, trust: 3 } },
        },
        nextNode: 'prolog_0_3_graceful',
      },
      {
        id: 'reg_questioning',
        text: '❓ 反问："敢问大人，何等之人方能入稷下学宫？是才高八斗者？心怀天下者？亦或……另有标准？"',
        effects: {
          stats: { wisdom: 3, insight: 2 },
          relationships: { registration_official: { affection: 5, trust: 5 } },
        },
        nextNode: 'prolog_0_3_questioning',
      },
      {
        id: 'reg_silent',
        text: '🤫 沉默：（不言一语，只默默呈上推荐信）',
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
    content: `*汝之声于殿中回荡，铿锵有力。*

登记官眉峰微挑，执笔之手为之一顿。

「好大的口气。」

彼翻开汝之推荐信，神色骤变。

*汝留意到——彼见信封上之印章时，眼角闪过一抹不易察觉之波动。*

「……原来如此。」

彼合上信封，复又抬首，目光中多了一丝审视。

「进去罢。里面自有人考验你。」

*彼指了指殿宇深处的一道侧门。*`,
    nextNode: 'prolog_0_4',
  },

  // ====== 婉言版后续 ======
  {
    id: 'prolog_0_3_graceful',
    type: 'dialogue',
    speaker: '登记官',
    emotion: 'normal',
    content: `*汝语调平和，举止有度。*

登记官颔首，神色为之缓和。

「家学渊源，甚好。」

彼于簿上写下数笔，随即将信封收入袖中。

「稷下学宫正需汝这般学子。」

*彼自案上取下一枚令牌，递于汝手。*

「此为临时通行令。新生请于东院集合，自有人引汝。」`,
    nextNode: 'prolog_0_4',
  },

  // ====== 反问版后续 ======
  {
    id: 'prolog_0_3_questioning',
    type: 'dialogue',
    speaker: '登记官',
    emotion: 'happy',
    content: `*汝之问令登记官搁下了笔。*

彼放下笔，认真打量汝片刻。

殿内倏然静谧，余者皆抬首望来。

「有点意思。」

彼嘴角微扬，眼中闪过一丝赞许。

「稷下学宫，最喜汝这般学生。」

*彼起身，向汝微微欠身——此乃少见之礼遇。*

「请进。里面有人在等汝。」`,
    nextNode: 'prolog_0_4',
  },

  // ====== 沉默版后续 ======
  {
    id: 'prolog_0_3_silent',
    type: 'dialogue',
    speaker: '登记官',
    emotion: 'surprised',
    content: `*汝不言，只将推荐信递了过去。*

登记官接过信封，细细审视。

其目光在信封印章上停留片刻，神色转而复杂。

殿内一时静寂。

良久，彼缓缓开口：

「……汝不必言，吾亦知之矣。」

*彼之声比方才低沉了几分。*

「彼临终前托人带来的信，吾等候送信之人已久。」

「不料——竟是汝。」

*彼起身，向汝颔首。*

「进去罢。有人将亲考汝。」`,
    nextNode: 'prolog_0_4',
  },

  // ====== 序章·拜见稷下宫主 ======
  {
    id: 'prolog_0_4',
    type: 'narration',
    content: `穿过长廊，汝来到学宫最深处的一座殿宇。

殿内光线昏暗，唯正中有一束光自穹顶洒下。

那束光，落在一位白发苍苍的老者身上。

彼端坐于案后，闭目凝神。未睁眼，却已给人一种不怒自威之压迫感。

稷下学宫之主——世人传说中的通儒。

四下寂然，唯殿外风声偶尔穿堂而过。

汝留意到，此殿名为——「问道堂」。`,
    background: 'wendao_hall',
    nextNode: 'prolog_0_4_dialogue',
  },

  {
    id: 'prolog_0_4_dialogue',
    type: 'dialogue',
    speaker: '稷下宫主',
    emotion: 'normal',
    content: `（缓缓睁眼，目光深邃如渊）

「汝来矣。」

彼之声苍老却有力，于空旷殿中回响。

「引汝前来之人……」

彼顿了顿。

「已不在人世矣。」`,
    background: 'wendao_hall',
    nextNode: 'prolog_0_4_2',
  },

  {
    id: 'prolog_0_4_2',
    type: 'dialogue',
    speaker: '稷下宫主',
    emotion: 'sad',
    content: `汝心猛地一沉。

那封信——那封汝一直珍藏的信——
竟是来自一位已故之人？

宫主自袖中取出一封泛黄的信函，正是汝手中那封之副本。

「此信，乃彼临终前托人转交于吾者。」

「彼云，汝乃其选中之人。」

「乃继承其道路之人。」`,
    nextNode: 'prolog_0_4_3',
  },

  {
    id: 'prolog_0_4_3',
    type: 'dialogue',
    speaker: '稷下宫主',
    emotion: 'sad',
    content: `「彼乃吾之弟子。」

「亦曾是彼时最有可能继承学宫之人。」

*宫主之声中带着一丝不易察觉之悲凉。*

「然彼选择离去，践行其道。」

「三年前……」

「彼于一场百家论辩中被人击败。」

「此后，彼再无一语。」

宫主抬首，首次直视汝之双眸。

「彼云——」

「『吾道，谬矣。』」`,
    nextNode: 'prolog_0_4_choice',
  },

  // ====== 🔴 关键抉择：得知死讯后的反应 ======
  {
    id: 'prolog_0_4_choice',
    type: 'choice',
    speaker: '稷下宫主',
    emotion: 'normal',
    content: `「而汝，乃其选中之继承者。」

「证其选择无误——」

「此乃汝来此之使命。」

*彼自袖中取出一枚令牌，递于汝面前。*

「然首先，汝须证明——汝配得上这封推荐信。」`,
    background: 'wendao_hall',
    choices: [
      {
        id: 'shock_sad',
        text: '😢 震惊悲恸："谁……是谁害了彼？"',
        effects: {
          stats: { courage: 2 },
          relationships: { school_master: { affection: 0, trust: -5 } },
          flags: { reaction_shock: true },
        },
        nextNode: 'prolog_0_4_shock',
      },
      {
        id: 'anger_question',
        text: '😤 怒而质问："请宫主示下真相！吾必为彼讨回公道！"',
        effects: {
          stats: { courage: 3 },
          relationships: { school_master: { affection: 3, trust: 3 } },
          flags: { reaction_anger: true },
        },
        nextNode: 'prolog_0_4_anger',
      },
      {
        id: 'calm_question',
        text: '🤔 冷静追问："……请问，彼可曾留下什么话？"',
        effects: {
          stats: { wisdom: 2 },
          relationships: { school_master: { affection: 5, trust: 5 } },
          flags: { reaction_calm: true },
        },
        nextNode: 'prolog_0_4_calm',
      },
      {
        id: 'silent_listen',
        text: '😶 沉默聆听：（压下心中波澜，静静等候宫主下文）',
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
    content: `*汝之声于殿中回荡，带着难以掩饰之悲恸。*

宫主望着汝，目光中闪过一丝失望。

「……汝之反应，彼不会如此。」

彼摇了摇头。

「然这亦说明——汝是真正在乎彼之人。」

「记住，非谁害了彼——乃是彼败于己之道。」

「今，汝还愿继续否？」`,
    nextNode: 'prolog_0_4_continue',
  },

  {
    id: 'prolog_0_4_anger',
    type: 'dialogue',
    speaker: '稷下宫主',
    emotion: 'happy',
    content: `*汝目中燃起怒火，声若洪钟。*

宫主微微颔首，眼中闪过一丝赞许。

「善。有决心，乃好事。」

「然吾须提醒汝——复仇之路，往往通向深渊。」

「汝之怒，宜用于证其选择无误，而非伤害无辜。」

「今，汝还愿继续否？」`,
    nextNode: 'prolog_0_4_continue',
  },

  {
    id: 'prolog_0_4_calm',
    type: 'dialogue',
    speaker: '稷下宫主',
    emotion: 'happy',
    content: `*汝压下心中波澜，声线平稳。*

宫主眼中闪过赞许。

「善。汝令吾想起彼年轻时之模样。」

「彼亦是如此，无论遇何事，皆能保持冷静。」

「彼留与吾之最后一句话，乃是——」

宫主顿了顿。

「『吾道，谬矣。然彼女之道……或是对的。』」

「今，汝还愿继续否？」`,
    nextNode: 'prolog_0_4_continue',
  },

  {
    id: 'prolog_0_4_silent',
    type: 'dialogue',
    speaker: '稷下宫主',
    emotion: 'happy',
    content: `*汝静静凝视宫主，不发一言。*

殿内一时静寂。

良久，宫主方开口：

「……汝令吾想起年轻时识得的一个人。」

「彼亦是如此，无论闻何事，皆能保持沉默。」

「此乃真正有大智慧之人。」

「今，汝还愿继续否？」`,
    nextNode: 'prolog_0_4_continue',
  },

  // ====== 继续剧情 ======
  {
    id: 'prolog_0_4_continue',
    type: 'dialogue',
    speaker: '稷下宫主',
    emotion: 'normal',
    content: `*彼自案上取出一枚令牌，递于汝手。*

「此为学宫通行令。自今日起，汝乃稷下学宫之记名弟子。」

「接下来，汝将入『心境幻境』。」

「此乃稷下学宫之入门考验。」

「汝将见三处幻境——墨家、法家、道家之困境。」

「汝之抉择，将定汝与各派之缘法。」`,
    nextNode: 'prolog_0_4_mind_test_intro',
  },

  {
    id: 'prolog_0_4_mind_test_intro',
    type: 'narration',
    content: `「汝须记住——」

*彼之声转而郑重。*

「世间无绝对正确答案，唯有所适之答案。」

「汝所选择见之景象，乃汝内心之投射。」

【系统提示】即将进入心境测试`,
    nextNode: 'prolog_0_mind_1',
  },

  // ====== 心境测试·墨家之影 ======
  {
    id: 'prolog_0_mind_1',
    type: 'narration',
    content: `【心境测试·第一幕】

虚空中，汝发现自己置身于一片燃烧之废墟。

此曾是一座村庄——或者说，曾经是。

火焰吞噬茅屋，浓烟蔽日。
哭喊声、惨叫声、兵刃相交声交织于耳。

汝见一群衣衫褴褛之平民正在逃窜。
他们扶老携幼，脸上写满恐惧与绝望。

*一道声音在汝耳畔响起：*

「此处乃三年前之边陲村落。战火蔓延，生灵涂炭。」`,
    background: 'burning_village',
    nextNode: 'prolog_0_mind_1_2',
  },

  {
    id: 'prolog_0_mind_1_2',
    type: 'dialogue',
    speaker: '墨家弟子',
    emotion: 'determined',
    content: `一位年轻人挡在逃难人群之最后。

彼身着墨色短衣，手持一柄短戈。
虽知实力悬殊，仍毅然挺身而立。

「汝等先走！吾来挡之！」

*追兵乃训练有素之士兵，人数众多。*
*这位墨家弟子之抵抗，注定徒劳。*

「哈哈哈！」追兵首领大笑，「一个墨家的书呆子，也敢挡路？」

「今日，便让汝知晓何为现实！」`,
    nextNode: 'prolog_0_mind_1_choice',
  },

  {
    id: 'prolog_0_mind_1_choice',
    type: 'choice',
    speaker: '追兵首领',
    emotion: 'angry',
    content: `「喂，汝！」

「闲杂人等速速让开！」

「此乃吾等与墨家之恩怨，与汝无关！」

*墨家弟子亦望见汝，眼中闪过一丝希望。*

「这位兄台……若汝愿意，请助这些无辜百姓……」`,
    background: 'burning_village',
    choices: [
      {
        id: 'mozi_help',
        text: '⚔️ 挺身而出："以多欺少，算什么英雄？有本事冲吾来！"',
        effects: {
          stats: { courage: 2 },
          relationships: { mozi_disciple: { affection: 20, trust: 10 } },
          flags: { mozi_path_open: true, helped_mozi: true },
        },
        nextNode: 'prolog_0_mind_1_help',
      },
      {
        id: 'mozi_mediate',
        text: '🗣️ 尝试调停："且慢！诸位可愿听吾一言？战祸所至，唯余苦痛，何不——"',
        effects: {
          stats: { charm: 2 },
          relationships: { mozi_disciple: { affection: 10, trust: 5 } },
          flags: { confucian_path_open: true, mozi_path_open: true },
        },
        nextNode: 'prolog_0_mind_1_mediate',
      },
      {
        id: 'mozi_observe',
        text: '🔍 静观其变，另寻他法',
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
    content: `*汝挺身立于墨家弟子身前，目光如炬。*

追兵首领冷笑：「又来一个送死的！」

汝与墨家弟子并肩而立，直面数倍之敌。

*一番激战过后……*

汝等成功拖住追兵，百姓得以逃脱。
然汝亦身负重伤。

墨家弟子扶着汝，眼中满是感激：

「多谢兄台！墨家必不忘汝之恩情！」`,
    nextNode: 'prolog_0_mind_2',
  },

  {
    id: 'prolog_0_mind_1_mediate',
    type: 'narration',
    content: `*汝挺身而出，欲以言语化干戈。*

「且慢！诸位……」

追兵首领不耐烦打断：「少废话！」

然汝之言仍令部分人犹豫。

趁追兵分神之际，墨家弟子引百姓自小路遁去。

待一切平息，追兵首领狠狠瞪汝一眼：

「算汝走运！」

*汝未获全胜，然人已得救。*`,
    nextNode: 'prolog_0_mind_2',
  },

  {
    id: 'prolog_0_mind_1_observe',
    type: 'narration',
    content: `*汝未冲动行事，而是静观四周。*

汝发现一条隐蔽小路，通往山林深处。

趁追兵注意力为墨家弟子所吸引，汝悄然引部分百姓自小路转移。

待追兵察觉时，多数百姓已消失在密林之中。

墨家弟子望汝撤离之处，微微颔首：

「好眼力……这位兄台，乃人才也。」`,
    nextNode: 'prolog_0_mind_2',
  },

  // ====== 心境测试·法家之影 ======
  {
    id: 'prolog_0_mind_2',
    type: 'narration',
    content: `【心境测试·第二幕】

虚空变换，场景转换。

汝发现自己站在一座公堂之上。

堂中央高悬一匾，上书「明镜高悬」四字。

一位身着黑色法袍之官员端坐于案后，面容冷峻，目光如电。

此乃法家之审判现场。

*一道声音在汝耳畔响起：*

「此乃法家之审判。汝将见证法家之『公正』。」`,
    background: 'courthouse',
    nextNode: 'prolog_0_mind_2_2',
  },

  {
    id: 'prolog_0_mind_2_2',
    type: 'dialogue',
    speaker: '法家官员',
    emotion: 'angry',
    content: `公堂中央跪着一人，乃窃贼。

彼蓬头垢面，瘦骨嶙峋。
衣衫满是补丁，沾满泥土。

「堂下何人？」法家官员冷声问道。

「小人……小人名阿福……」窃贼颤抖而答。

「所犯何事？」

「小人……小人偷了一枚……一枚馒头……」

*人群中传来议论纷纷。*

「才一枚馒头啊……」
「闻说是为救彼病重之老母……」
「唉，可怜人……」`,
    nextNode: 'prolog_0_mind_2_3',
  },

  {
    id: 'prolog_0_mind_2_3',
    type: 'dialogue',
    speaker: '法家官员',
    emotion: 'angry',
    content: `法家官员抬手，人群立时寂静。

「按律——」

彼之声冰冷，不带丝毫感情。

「窃盗者，当断其手。」

*阿福瘫软在地，面如死灰。*

「然念其初犯，减为鞭刑三十。」

「来人，行刑！」`,
    nextNode: 'prolog_0_mind_2_choice',
  },

  {
    id: 'prolog_0_mind_2_choice',
    type: 'choice',
    speaker: '法家官员',
    emotion: 'angry',
    content: `「行刑！」

*两名衙役上前，将阿福按倒在地。*
*另有一人执鞭在手，准备行刑。*

汝留意到——阿福目中无怨恨，唯有绝望。

还有……一丝解脱。

【汝之抉择将定汝与法家之缘法】`,
    background: 'courthouse',
    choices: [
      {
        id: 'legalist_support',
        text: '⚖️ 支持法家判决："法不可违！若今日破例，明日便有千人效仿！"',
        effects: {
          stats: { wisdom: 2 },
          relationships: { legalist_official: { affection: 20, trust: 10 } },
          flags: { legalist_path_open: true, supported_legalist: true },
        },
        nextNode: 'prolog_0_mind_2_support',
      },
      {
        id: 'legalist_plead',
        text: '🤝 为窃贼求情："律法之外，尚有人情！求大人予其一悔过之机！"',
        effects: {
          stats: { charm: 2 },
          relationships: { confucian_senior: { affection: 15, trust: 5 } },
          flags: { confucian_path_open: true },
        },
        nextNode: 'prolog_0_mind_2_plead',
      },
      {
        id: 'legalist_compromise',
        text: '💡 提出折中之策："大人，何不使其以劳役赎罪？既全法理，又显百家仁心！"',
        effects: {
          stats: { wisdom: 1, charm: 1 },
          relationships: { eclectic_master: { affection: 15, trust: 10 } },
          flags: { eclectic_path_open: true },
        },
        nextNode: 'prolog_0_mind_2_compromise',
      },
      {
        id: 'legalist_question',
        text: '❓ 质问律法本身："敢问大人——此律法乃谁人所定？为谁而立？"',
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
    content: `*汝挺身而出，声若洪钟。*

「法不可违！若今日破例，明日便有千人效仿！」

法家官员望了汝一眼，目中闪过赞许。

「善。」

彼转身下令：「行刑！」

鞭声呼啸而下，阿福痛苦呻吟。

*然汝未曾移开目光。*
*此乃法之代价。*`,
    nextNode: 'prolog_0_mind_3',
  },

  {
    id: 'prolog_0_mind_2_plead',
    type: 'narration',
    content: `*汝挺身而出，言辞恳切。*

「律法之外，尚有人情！求大人予其一悔过之机！」

法家官员冷冷望着汝。

「人情？」

「法者，天下之公器。岂可因私情而废公法？」

彼挥手：「行刑！」

*汝之求情未能改变结局。*
*然人群中有人向汝投来感激目光。*`,
    nextNode: 'prolog_0_mind_3',
  },

  {
    id: 'prolog_0_mind_2_compromise',
    type: 'narration',
    content: `*汝挺身而出，语调和而坚定。*

「大人，何不使其以劳役赎罪？」

「既全法理，又显百家仁心！」

法家官员沉默片刻。

「……劳役赎罪？」

彼若有所思，点了点头。

「倒也是个折中之法。」

「阿福，改为劳役一年。退堂！」`,
    nextNode: 'prolog_0_mind_3',
  },

  {
    id: 'prolog_0_mind_2_question',
    type: 'narration',
    content: `*汝开口，声于大堂中回荡。*

「敢问大人——」

「此律法乃谁人所定？为谁而立？」

法家官员目中闪过惊讶，旋即恢复冷漠。

「善问。」

「律法，由王者而定，为天下而立。」

「然汝之问，非此时所当问也。」

*彼挥手行刑，似不愿续此话题。*
*然汝留意到——彼目中有一丝……动摇？*`,
    nextNode: 'prolog_0_mind_3',
  },

  // ====== 心境测试·道家之影 ======
  {
    id: 'prolog_0_mind_3',
    type: 'narration',
    content: `【心境测试·第三幕】

虚空再次变换。

汝立于悬崖之畔。

眼前乃一片无垠云海。
云涛翻滚，如浪相叠。

远处，云海之下隐约可见一座小村落。
那乃是汝梦中无数次见及之处——

故乡。

*风自崖下吹来，带着云雾之润泽。*

*一道声音在汝耳畔响起：*

「此乃汝心中之故乡。那些汝以为早已忘却之简单快乐。」`,
    background: 'cliff_clouds',
    nextNode: 'prolog_0_mind_3_2',
  },

  {
    id: 'prolog_0_mind_3_2',
    type: 'dialogue',
    speaker: '祖父',
    emotion: 'happy',
    content: `「孩子。」

一道苍老之声自身后传来。

汝转身——

一位白发老者立于身后。
其容貌，竟与汝已故之祖父一般无二。

*汝心猛地一颤。*

*祖父……已谢世十年矣。*

「祖父……？」汝喃喃道。

老者微微一笑，目光中满是慈爱。

「孩子，汝这一生所求为何？」`,
    nextNode: 'prolog_0_mind_3_3',
  },

  {
    id: 'prolog_0_mind_3_3',
    type: 'dialogue',
    speaker: '祖父',
    emotion: 'happy',
    content: `「是权倾天下之荣耀？」

「是学贯百家之智慧？」

「还是……」

*彼指向云海下之故乡。*

「寻得归途？」

「那些简单快乐之日？」

【三幅画面于场景中浮现】

【画面一】权倾天下——华服高位，群臣朝拜
【画面二】学贯百家——著作等身，学子问道
【画面三】回归故乡——小院炊烟，祖父膝前`,
    nextNode: 'prolog_0_mind_3_choice',
  },

  {
    id: 'prolog_0_mind_3_choice',
    type: 'choice',
    speaker: '祖父',
    emotion: 'happy',
    content: `老者之声再度响起：

「汝之抉择为何？」`,
    background: 'cliff_clouds',
    choices: [
      {
        id: 'dao_power',
        text: '👑 "吾要权倾天下"——大丈夫生于乱世，当提三尺剑，立不世功！',
        effects: {
          stats: { fame: 5, courage: 2 },
          flags: { strategist_path_open: true, diplomat_path_open: true },
        },
        nextNode: 'prolog_0_mind_3_power',
      },
      {
        id: 'dao_wisdom',
        text: '📚 "吾要学贯百家，明白天下至理"——知识乃人类进步之阶梯！',
        effects: {
          stats: { wisdom: 5, insight: 2 },
          flags: { confucian_path_open: true, logician_path_open: true },
        },
        nextNode: 'prolog_0_mind_3_wisdom',
      },
      {
        id: 'dao_home',
        text: '🏠 "吾想归家"——那些简单快乐之日，才是吾所真正想要之。',
        effects: {
          stats: { charm: 3, wisdom: 2 },
          flags: { daoist_path_open: true },
        },
        nextNode: 'prolog_0_mind_3_home',
      },
      {
        id: 'dao_unknown',
        text: '🤔 "吾不知……"',
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
    content: `*汝之声于云海中回荡。*

「吾要权倾天下！」

「大丈夫生于乱世，当提三尺剑，立不世功！」

云海中，画面一转——汝见己身着华服，高坐于殿堂之上。
群臣跪拜，山呼万岁。

老者颔首。

「善。有志气。」

「然权力之路，荆棘遍布。汝可备矣？」`,
    nextNode: 'prolog_0_mind_complete',
  },

  {
    id: 'prolog_0_mind_3_wisdom',
    type: 'narration',
    content: `*汝之声坚定而清晰。*

「吾要学贯百家，明白天下至理！」

云海中，画面一转——汝见己立于学宫之巅，著作等身。
天下学子皆来求学，问道解惑。

老者微微一笑。

「求知若渴，善莫大焉。」

「然知识无涯，汝可备足以一生追寻否？」`,
    nextNode: 'prolog_0_mind_complete',
  },

  {
    id: 'prolog_0_mind_3_home',
    type: 'narration',
    content: `*汝之目光望向云海下之故乡。*

「吾想归家……」

「那些简单快乐之日，才是吾所真正想要之。」

云海中，画面一转——汝见己立于故乡小院之中。
祖父坐于树下，汝侍于侧，聆听彼讲故事。
炊烟袅袅，饭菜飘香。

老者轻叹。

「返璞归真，此亦道也。」

「然汝可确定，能放下一切否？」`,
    nextNode: 'prolog_0_mind_complete',
  },

  {
    id: 'prolog_0_mind_3_unknown',
    type: 'narration',
    content: `*汝沉默矣。*

「吾……吾不知。」

老者望着汝，目中闪过一丝欣慰。

「诚实。」

「不知，优于谬解自以为知。」

「汝很特别，年轻人。」

「于此之际，多数人必给出一答。」

「而汝，选择坦诚。」

*彼转身，向云海深处行去。*

「或许……此方为真正之始。」`,
    nextNode: 'prolog_0_mind_complete',
  },

  // ====== 心境测试结束 ======
  {
    id: 'prolog_0_mind_complete',
    type: 'narration',
    content: `*云海翻涌，将汝包裹。*

*光芒涌入，景象消散……*

汝重新立于问道堂中。

稷下宫主仍立于汝之前，目光深邃。

「汝归来矣。」

彼之声带着一丝不易察觉之满意。

「心境测试……汝通过矣。」

*彼转身，缓步归于案后。*

「自今起，汝乃稷下学宫之记名弟子。」

「三月之后，将有百家论辩大会。」

「于此之前——」

*彼自案上取下一卷竹简，递于汝手。*

「汝须选择欲深入研习之门派。」`,
    background: 'wendao_hall',
    nextNode: 'prolog_0_faction_choice',
  },

  // ====== 🔴 关键选择：门派选择 ======
  {
    id: 'prolog_0_faction_choice',
    type: 'choice',
    speaker: '稷下宫主',
    emotion: 'normal',
    content: `「当然，汝亦可选择不依附任何门派。」

「然如此之道，将更为艰难。」

「十六门派，各有所长。」

「儒家言仁义，法家讲严明，道家倡自然，墨家主兼爱……」

「选择汝最认同之道。」

「或者——」

*彼目光中闪过一丝深意。*

「汝可选择不选择。」

「成为『旁观者』。」`,
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
        text: '👁️ 暂不决定——先四处游观，观望全局（开启百家线条件）',
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
    content: `「选择之后，汝将正式成为该派弟子。」

「该派长老将负责汝之修行。」

「三年之后——」

*彼目光转而深邃。*

「汝将成为何等之人，取决于汝这三年之抉择。」

「去吧。」

「汝之故事，方才启幕。」

【序章·入学 完】

【章节评价】
├── 求学初衷：[依据抉择显示]
├── 对话风格：[依据抉择显示]
├── 关键抉择：[依据抉择显示]
├── 心境测试：[依据抉择显示]
└── 门派选择：[依据抉择显示]

【存档点】游戏已自动保存`,
    background: 'wendao_hall',
    nextNode: 'ch_moru_001_n001',
  },
];
