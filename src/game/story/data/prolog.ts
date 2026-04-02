import type { StoryNode } from '../types';

export const PROLOG_NODES: StoryNode[] = [
  // ====== 序章·梦境·入学前夜 ======
  {
    id: 'prolog_0_0',
    type: 'narration',
    content: `【序章·梦境】

夜色如墨，月华似霜。

汝枕戈待旦，辗转于简陋客栈之中，彻夜难眠。

案上烛火摇曳，将那封泛黄信函映得忽明忽暗。
信笺已然陈旧，边角微卷，墨迹淡褪。
唯有那枚朱红印章，依旧鲜艳如血——

那是父亲至交之印，亦是汝此生最大之谜。

父亲临终那夜，气息如游丝。

彼紧握汝手，浑浊双眸中闪过一丝光亮：

「若遇困厄……持此信……入稷下……」

汝泣问：「稷下何如？父亲何以知之？」

彼嘴唇翕动，却再无声息。

数载已逝，汝仍不知父亲缘何言及稷下，亦不知其口中「困厄」所指为何。

唯知今日——新生入学之日，已然来临。

困意渐袭，汝不知不觉阖上双眼……

*——恍惚间，天旋地转。*

*再睁眼时，汝已立于茫茫云海之上。*

脚下无根，身外无物，唯有穹穹苍冥，浩浩虚空。

风声呜咽，似泣似诉，自四面八方涌来。

汝心惶然——此何处？此何时？

蓦然——

一道苍老之声自九霄之外传来，如洪钟大吕，震彻心魂：

「有朋自远方来，不亦乐乎……」

「却不知——」

「来者是否为友？」

汝循声望去——

但见云海深处，一叶扁舟飘然而至。

舟首立一老者，衣袍古旧，面容清癯。

其须发皆白，然目光如电，仿佛洞穿千古。

腰间悬一酒葫芦，随风轻晃，叮咚作响。

老者打量汝片刻，忽而朗声大笑：

「妙哉，妙哉！」

「孟家骨血，终于来了！」

汝大惊：「汝识家父？」

老者笑而不答，只自顾自而言：

「汝可知，汝父当年于此地，亦曾见吾？」

「彼时彼刻，恰如此时此刻！」

汝欲追问，老者却抬手止之：

「莫急，莫急。天机不可泄露，汝且记吾数言——」

「入稷下，勿信第一家之言。」

「入稷下，勿信最后一家之言。」

「入稷下——」

*语未竟，风云骤变！*

*漫天云雾翻涌而至，将老者身影吞没大半。*

汝大惊，急声呼喊：「前辈何往？」

老者声音自雾中传来，渐渐飘渺：

「要信……自己……」

「汝父未竟之业……」

「皆在……观……」

*一声惊雷，炸响天际！*

*汝猛然惊醒——*

窗外，东方已白。

汝冷汗涔涔，心跳如鼓。

梦中一切，历历在目，清晰得不似梦境。

那老者……究竟何许人也？
父亲与其有何渊源？
「观」字所指，又是为何？

汝深吸一口气，将信函郑重收入怀中。

稷下学宫，汝来了。

无论前路如何迷雾重重，汝定要——

求一个明白。`,
    background: 'cloud_dream',
    image: '/assets/story/v9/prolog_dream.png',
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
        effects: {
          stats: { courage: 2, charm: 1 },
          flags: { initial_path: 'soldier' },
          path: 'soldier',
          hint: '心怀家国者，必勇毅过人',
        },
        nextNode: 'prolog_0_3a',
      },
      {
        id: 'choice_wisdom',
        text: '📚 "天下知识如海，吾愿探其真理"',
        effects: {
          stats: { wisdom: 2, insight: 1 },
          flags: { initial_path: 'scholar' },
          path: 'scholar',
          hint: '书山有径，唯智者登临',
        },
        nextNode: 'prolog_0_3a',
      },
      {
        id: 'choice_charm',
        text: '🤝 "吾欲广交天下英杰，成一番大业"',
        effects: {
          stats: { charm: 2, courage: 1 },
          flags: { initial_path: 'diplomat' },
          path: 'diplomat',
          hint: '君子和而不同，交游广阔',
        },
        nextNode: 'prolog_0_3a',
      },
      {
        id: 'choice_insight',
        text: '🔍 "吾只欲观世间运行之理"',
        effects: {
          stats: { insight: 2, wisdom: 1 },
          flags: { initial_path: 'observer' },
          path: 'observer',
          hint: '静观默察，洞悉万物律动',
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
          hint: '此言掷地有声，显现不凡气魄',
        },
        nextNode: 'prolog_0_3_direct',
      },
      {
        id: 'reg_graceful',
        text: '🤝 婉言："小生[姓名]，来自[地名]。家父生前常言，稷下学宫乃天下学子向往之地。吾虽不才，亦欲继承父志，来此求学问道。"',
        effects: {
          stats: { charm: 3 },
          relationships: { registration_official: { affection: 5, trust: 3 } },
          hint: '谦卑有度，深得礼教精髓',
        },
        nextNode: 'prolog_0_3_graceful',
      },
      {
        id: 'reg_questioning',
        text: '❓ 反问："敢问大人，何等之人方能入稷下学宫？是才高八斗者？心怀天下者？亦或……另有标准？"',
        effects: {
          stats: { wisdom: 3, insight: 2 },
          relationships: { registration_official: { affection: 5, trust: 5 } },
          hint: '机敏多思，令官吏侧目',
        },
        nextNode: 'prolog_0_3_questioning',
      },
      {
        id: 'reg_silent',
        text: '🤫 沉默：（不言一语，只默默呈上推荐信）',
        effects: {
          stats: { insight: 3, wisdom: 2 },
          relationships: { registration_official: { affection: 5, trust: 8 } },
          hint: '大音希声，莫测高深',
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

汝留意到，此殿名为——「问道堂」`,
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

「三年前……制一场百家论辩中被人击败。」

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
          hint: '悲悯之心，虽善感然易乱于情',
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
          hint: '怒发冲冠，剑指真相',
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
          hint: '泰山崩于前而色不变，显露大儒之姿',
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
          hint: '深沉莫测，令长者高看一眼',
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
    nextNode: 'prolog_0_mind_2', // 简化版路径
  },

  {
    id: 'prolog_0_mind_2',
    type: 'ending',
    content: `【序章·完】

心境之试，方才开启。
百家争鸣，道阻且跻。

稷下之门已开，汝之故事，始于足下。`,
    nextNode: 'prolog_0_0',
  }
];
