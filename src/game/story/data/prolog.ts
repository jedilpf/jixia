import type { StoryNode } from '../types';

export const PROLOG_NODES: StoryNode[] = [
  // ====== 序章·入学前夜 ======
  {
    id: 'prolog_0_0',
    type: 'narration',
    content: `【序章】

夜深。
客栈烛火将熄，汝辗转难眠。

案上那封信函，边角微卷，墨迹淡褪。
唯有一枚朱红印章，鲜艳如血。
那是父亲临终紧握之物——亦是汝此生最大之谜。

彼于弥留之际只说了一句：
「若遇困厄……入稷下……寻观……」

「观」是何人？稷下是何处？困厄又所指何事？
彼未及解释，便已气绝。

今日，入学之期。
汝怀揣信函，踏入稷下。

梦中恍惚，见一老者立于云海。
彼见汝，大笑：「孟家骨血，终于来了！」
汝欲追问其与父亲之渊源。
彼却只留下三言：
「入稷下——勿信第一家之言。」
「勿信最后一家之言。」
「要信……自己。」

雷声惊醒，天已大白。
汝不知此梦是真或幻。
唯知一件事——父亲之死，必有隐情。`,
    background: 'cloud_dream',
    nextNode: 'prolog_0_1',
  },

  // ====== 序章·稷下城门 ======
  {
    id: 'prolog_0_1',
    type: 'narration',
    content: `晨钟乍响，城门方启。
人潮如涌，皆自四方跋涉而来。

稷下学宫之旗猎猎翻卷。
旗上二字——「百家」。

汝步入城中，直奔登记处。
怀中信函被攥得愈紧。
此信，乃是汝唯一的凭据。`,
    background: 'city_gate',
    nextNode: 'prolog_0_3',
  },

  // ====== 序章·入学登记 ======
  {
    id: 'prolog_0_3',
    type: 'narration',
    content: `穿过学宫外门，汝步入登记殿宇。
正中案后，一素袍官员抬首望汝。
其身后高悬一匾——「有教无类」。
`,
    background: 'registration_hall',
    nextNode: 'prolog_0_3_dialogue',
  },

  {
    id: 'prolog_0_3_dialogue',
    type: 'dialogue',
    speaker: '登记官',
    emotion: 'normal',
    content: `「报上名来。」`,
    background: 'registration_hall',
    choices: [
      {
        id: 'reg_direct',
        text: '💬 「在下孟舆。久闻稷下之名，特来求学。」',
        effects: { stats: { courage: 2 } },
        nextNode: 'prolog_0_3_result',
      },
      {
        id: 'reg_silent',
        text: '🤫 （默默呈上推荐信）',
        effects: { stats: { insight: 2 } },
        nextNode: 'prolog_0_3_result',
      },
    ],
  },

  {
    id: 'prolog_0_3_result',
    type: 'narration',
    content: `登记官接过信函。
目光落于印章——神色骤变。
「……原来如此。进去罢，有人等汝。」`,
    background: 'registration_hall',
    nextNode: 'prolog_0_4',
  },

  // ====== 序章·拜见稷下宫主 ======
  {
    id: 'prolog_0_4',
    type: 'narration',
    content: `穿过长廊，汝来到问道堂。
殿内昏暗，唯穹顶一束光落于一老者。
彼闭目端坐，不怒自威。
稷下宫主。`,
    background: 'wendao_hall',
    nextNode: 'prolog_0_4_dialogue',
  },

  {
    id: 'prolog_0_4_dialogue',
    type: 'dialogue',
    speaker: '稷下宫主',
    emotion: 'normal',
    content: `（缓缓睁眼）
「汝来矣。
「引汝前来之人……已不在人世。」`,
    background: 'wendao_hall',
    nextNode: 'prolog_0_4_2',
  },

  {
    id: 'prolog_0_4_2',
    type: 'dialogue',
    speaker: '稷下宫主',
    emotion: 'sad',
    content: `汝心一沉。
那封信——竟是来自已故之人？

宫主取出泛黄信函。
「此信乃彼临终所托。
「彼云，汝乃其选中之人。」`,
    background: 'wendao_hall',
    nextNode: 'prolog_0_4_3',
  },

  {
    id: 'prolog_0_4_3',
    type: 'dialogue',
    speaker: '稷下宫主',
    emotion: 'sad',
    content: `「彼乃吾之弟子。
「三年前，彼于百家论辩中败北。
「此后再无一语。
宫主直视汝眸。
「彼云——『吾道，谬矣。』」`,
    background: 'wendao_hall',
    nextNode: 'prolog_0_4_choice',
  },

  // ====== 🔴 关键抉择 ======
  {
    id: 'prolog_0_4_choice',
    type: 'choice',
    speaker: '稷下宫主',
    emotion: 'normal',
    content: `「而汝，乃其继承者。
「证其选择无误——此乃汝之使命。
彼递出一枚令牌。
「然首先，汝须证明——汝配得上此信。」`,
    background: 'wendao_hall',
    choices: [
      {
        id: 'accept_mission',
        text: '✊ 「吾必查明真相。」',
        effects: { stats: { courage: 2 } },
        nextNode: 'prolog_0_4_continue',
      },
      {
        id: 'silent_accept',
        text: '😶 （默默接过令牌）',
        effects: { stats: { insight: 2 } },
        nextNode: 'prolog_0_4_continue',
      },
    ],
  },

  // ====== 继续剧情 ======
  {
    id: 'prolog_0_4_continue',
    type: 'dialogue',
    speaker: '稷下宫主',
    emotion: 'normal',
    content: `「善。
彼递来通行令。
「自今日起，汝乃稷下记名弟子。
「接下来，入『心境幻境』——入门考验。
「汝将见三处幻境：墨家、法家、道家之困境。」`,
    background: 'wendao_hall',
    nextNode: 'prolog_0_4_mind_test_intro',
  },

  {
    id: 'prolog_0_4_mind_test_intro',
    type: 'narration',
    content: `「世间无绝对正确答案，唯有所适之答案。
【系统提示】即将进入心境测试`,
    nextNode: 'prolog_0_mind_1',
  },

  // ====== 心境测试·墨家之影 ======
  {
    id: 'prolog_0_mind_1',
    type: 'narration',
    content: `【心境测试·第一幕】
虚空中，汝置身于一片燃烧之废墟。
此曾是一座村庄。
火焰吞噬茅屋，浓烟蔽日。哭喊声、惨叫声交织于耳。
汝见一群衣衫褴褛之平民正在逃窜。

一道声音在汝耳畔响起：
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
彼身着墨色短衣，手持一柄短戈。虽知实力悬殊，仍毅然挺身而立。
「汝等先走！吾来挡之！」

追兵首领大笑：「一个墨家的书呆子，也敢挡路？」`,
    nextNode: 'prolog_0_mind_1_choice',
  },

  {
    id: 'prolog_0_mind_1_choice',
    type: 'choice',
    speaker: '追兵首领',
    emotion: 'angry',
    content: `「喂，汝！闲杂人等速速让开！
墨家弟子望见汝，眼中闪过一丝希望。
「这位兄台……若汝愿意，请助这些无辜百姓……」`,
    background: 'burning_village',
    choices: [
      {
        id: 'mozi_help',
        text: '⚔️ 挺身而出：「以多欺少，算什么英雄？有本事冲吾来！」',
        effects: {
          stats: { courage: 2 },
          flags: { mozi_path_open: true, helped_mozi: true },
        },
        nextNode: 'prolog_0_mind_1_help',
      },
      {
        id: 'mozi_observe',
        text: '🔍 静观其变，另寻他路',
        effects: {
          stats: { insight: 2 },
          flags: { daoist_path_open: true, mozi_path_open: true },
        },
        nextNode: 'prolog_0_mind_1_observe',
      },
      {
        id: 'mozi_avoid',
        text: '🚶 避开冲突',
        effects: { flags: { mozi_path_avoided: true } },
        nextNode: 'prolog_0_mind_2',
      },
    ],
  },

  {
    id: 'prolog_0_mind_1_help',
    type: 'narration',
    content: `汝挺身立于墨家弟子身前。
一番激战过后——汝等成功拖住追兵，百姓得以逃脱。
然汝亦身负重伤。
墨家弟子扶着汝：「多谢兄台！墨家必不忘汝之恩情！」`,
    nextNode: 'prolog_0_mind_2',
  },

  {
    id: 'prolog_0_mind_1_observe',
    type: 'narration',
    content: `汝静观四周，发现一条隐蔽小路。
趁追兵注意力为墨家弟子所吸引，汝悄然引部分百姓自小路转移。
墨家弟子望汝撤离之处，微微颔首：「好眼力……这位兄台，乃人才也。」`,
    nextNode: 'prolog_0_mind_2',
  },

  // ====== 心境测试·法家之影 ======
  {
    id: 'prolog_0_mind_2',
    type: 'narration',
    content: `【心境测试·第二幕】
虚空变换，场景转换。
汝立于一座公堂之上。
堂中央高悬一匾——「明镜高悬」。
一位身着黑色法袍之官员端坐于案后，面容冷峻。
此乃法家之审判现场。`,
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
「堂下何人？」法家官员冷声问道。
「小人……名阿福……」窃贼颤抖而答。
「所犯何事？」
「小人……偷了一枚馒头……」`,
    nextNode: 'prolog_0_mind_2_3',
  },

  {
    id: 'prolog_0_mind_2_3',
    type: 'dialogue',
    speaker: '法家官员',
    emotion: 'angry',
    content: `法家官员抬手，人群立时寂静。
「按律——窃盗者，当断其手。
阿福瘫软在地，面如死灰。
「然念其初犯，减为鞭刑三十。来人，行刑！」`,
    nextNode: 'prolog_0_mind_2_choice',
  },

  {
    id: 'prolog_0_mind_2_choice',
    type: 'choice',
    speaker: '法家官员',
    emotion: 'angry',
    content: `「行刑！」
两名衙役上前，将阿福按倒在地。
汝留意到——阿福目中无怨恨，唯有绝望。`,
    background: 'courthouse',
    choices: [
      {
        id: 'legalist_support',
        text: '⚖️ 「法不可违！若今日破例，明日便有千人效仿！」',
        effects: {
          stats: { wisdom: 2 },
          flags: { legalist_path_open: true, supported_legalist: true },
        },
        nextNode: 'prolog_0_mind_2_support',
      },
      {
        id: 'legalist_plead',
        text: '🤝 「律法之外，尚有人情！求大人予其一悔过之机。」',
        effects: {
          stats: { charm: 2 },
          flags: { confucian_path_open: true },
        },
        nextNode: 'prolog_0_mind_2_plead',
      },
      {
        id: 'legalist_question',
        text: '💡 「敢问大人——此律法乃谁人所定？为谁而立？」',
        effects: {
          stats: { insight: 2, wisdom: 1 },
          flags: { logician_path_open: true },
        },
        nextNode: 'prolog_0_mind_2_question',
      },
    ],
  },

  {
    id: 'prolog_0_mind_2_support',
    type: 'narration',
    content: `汝挺身而出，声若洪钟。
「法不可违！若今日破例，明日便有千人效仿！」
法家官员目中闪过赞许：「善。」
鞭声呼啸而下，阿福痛苦呻吟。
此乃法之代价。`,
    nextNode: 'prolog_0_mind_3',
  },

  {
    id: 'prolog_0_mind_2_plead',
    type: 'narration',
    content: `汝挺身而出，言辞恳切。
「律法之外，尚有人情！」
法家官员冷冷望着汝：「法者，天下之公器。岂可因私情而废公法？」
彼挥手：「行刑！」
然人群中有人向汝投来感激目光。`,
    nextNode: 'prolog_0_mind_3',
  },

  {
    id: 'prolog_0_mind_2_question',
    type: 'narration',
    content: `汝开口，声于大堂中回荡。
「敢问大人——此律法乃谁人所定？为谁而立？」
法家官员目中闪过惊讶，旋即恢复冷漠。
「善问。然汝之问，非此时所当问也。」
彼挥手行刑。然汝留意到——彼目中有一丝动摇。`,
    nextNode: 'prolog_0_mind_3',
  },

  // ====== 心境测试·道家之影 ======
  {
    id: 'prolog_0_mind_3',
    type: 'narration',
    content: `【心境测试·第三幕】
虚空再次变换。
汝立于悬崖之畔。
眼前乃一片无垠云海。云涛翻滚，如浪相叠。
远处，云海之下隐约可见一座小村落——故乡。`,
    background: 'cliff_clouds',
    nextNode: 'prolog_0_mind_3_2',
  },

  {
    id: 'prolog_0_mind_3_2',
    type: 'dialogue',
    speaker: '祖父',
    emotion: 'happy',
    content: `「孩子。」一道苍老之声自身后传来。
汝转身——一位白发老者立于身后。
其容貌，竟与汝已故之祖父一般无二。
汝心猛地一颤。

「祖父……？」汝喃喃道。
老者微微一笑：「孩子，汝这一生所求为何？」`,
    nextNode: 'prolog_0_mind_3_choice',
  },

  {
    id: 'prolog_0_mind_3_choice',
    type: 'choice',
    speaker: '祖父',
    emotion: 'happy',
    content: `「是权倾天下之荣耀？
「是学贯百家之智慧？
「还是……寻得归途？`,
    background: 'cliff_clouds',
    choices: [
      {
        id: 'dao_power',
        text: '👑 「吾要权倾天下！」',
        effects: {
          stats: { fame: 5, courage: 2 },
          flags: { strategist_path_open: true },
        },
        nextNode: 'prolog_0_mind_3_power',
      },
      {
        id: 'dao_wisdom',
        text: '📚 「吾要学贯百家，明白天下至理！」',
        effects: {
          stats: { wisdom: 5, insight: 2 },
          flags: { confucian_path_open: true },
        },
        nextNode: 'prolog_0_mind_3_wisdom',
      },
      {
        id: 'dao_unknown',
        text: '🤔 「吾不知……」',
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
    content: `汝之声于云海中回荡。
「吾要权倾天下！」
云海中，画面一转——汝见己身着华服，高坐于殿堂之上。群臣跪拜，山呼万岁。
老者颔首：「善。有志气。然权力之路，荆棘遍布。汝可备矣？」`,
    nextNode: 'prolog_0_mind_complete',
  },

  {
    id: 'prolog_0_mind_3_wisdom',
    type: 'narration',
    content: `汝之声坚定而清晰。
「吾要学贯百家，明白天下至理！」
云海中，画面一转——汝见己立于学宫之巅，著作等身。天下学子皆来求学。
老者微微一笑：「求知若渴，善莫大焉。然知识无涯，汝可备足以一生追寻否？」`,
    nextNode: 'prolog_0_mind_complete',
  },

  {
    id: 'prolog_0_mind_3_unknown',
    type: 'narration',
    content: `汝沉默矣。
「吾……吾不知。」
老者目中闪过一丝欣慰：「诚实。不知，优于谬解自以为知。」
彼转身，向云海深处行去：「或许……此方为真正之始。」`,
    nextNode: 'prolog_0_mind_complete',
  },

  // ====== 心境测试结束 ======
  {
    id: 'prolog_0_mind_complete',
    type: 'narration',
    content: `云海翻涌，将汝包裹。
光芒涌入，景象消散……

汝重新立于问道堂中。
稷下宫主目光深邃：「汝归来矣。心境测试……汝通过矣。」

「自今起，汝乃稷下学宫之记名弟子。
「三月之后，将有百家论辩大会。
「于此之前——汝须选择欲深入研习之门派。」`,
    background: 'wendao_hall',
    nextNode: 'prolog_0_faction_choice',
  },

  // ====== 🔴 关键选择：门派选择 ======
  {
    id: 'prolog_0_faction_choice',
    type: 'choice',
    speaker: '稷下宫主',
    emotion: 'normal',
    content: `「十六门派，各有所长。
「儒家言仁义，法家讲严明，道家倡自然，墨家主兼爱……
「选择汝最认同之道。
「或者——汝可选择不选择。成为『旁观者』。」`,
    background: 'wendao_hall',
    choices: [
      {
        id: 'choose_mozi',
        text: '🏛 墨家——兼爱与非攻之道',
        effects: { flags: { chosen_faction: 'mozi', chapter_1_path: 'mozi' }, path: 'mozi' },
        nextNode: 'prolog_0_end',
      },
      {
        id: 'choose_confucian',
        text: '📜 儒家——仁义与秩序之道',
        effects: { flags: { chosen_faction: 'confucian', chapter_1_path: 'confucian' }, path: 'confucian' },
        nextNode: 'prolog_0_end',
      },
      {
        id: 'choose_legalist',
        text: '⚖️ 法家——法治与秩序之道',
        effects: { flags: { chosen_faction: 'legalist', chapter_1_path: 'legalist' }, path: 'legalist' },
        nextNode: 'prolog_0_end',
      },
      {
        id: 'choose_daoist',
        text: '☯️ 道家——无为与自然之道',
        effects: { flags: { chosen_faction: 'daoist', chapter_1_path: 'daoist' }, path: 'daoist' },
        nextNode: 'prolog_0_end',
      },
      {
        id: 'choose_observe',
        text: '👁 暂不决定——观望全局（开启百家线）',
        effects: { flags: { chosen_faction: 'none', chapter_1_path: 'universal' }, path: 'universal' },
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
    content: `「选择之后，汝将正式成为该派弟子。
「三年之后——汝将成为何等之人，取决于汝这三年之抉择。」
彼目光深邃：「去吧。汝之故事，方才启幕。」

【序章·入学·完】
【存档点】游戏已自动保存`,
    background: 'wendao_hall',
    nextNode: 'ch_moru_001_n001',
  },
];