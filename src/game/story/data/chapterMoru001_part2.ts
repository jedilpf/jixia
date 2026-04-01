import type { StoryNode } from '../types';

export const CHAPTER_MORU_001_PART2_NODES: StoryNode[] = [
  // ====== Scene 1-2: 藏书阁探秘 ======
  {
    id: 'ch_moru_001_n011',
    type: 'narration',
    content: `【第一章下半·藏书阁探秘】

试辩结束后的黄昏，汝独自漫步于学宫之中。

夕阳西斜，将稷下学宫染上一层金红。
汝心中仍回味着白日论辩之得失，不觉间来到一处僻静之所——

藏书阁。

三层高楼，飞檐翘角，直刺苍穹。
阁门之上，高悬一匾，上书四个古朴大字——

「博闻强识」

阁内灯火初上，映照着层层叠叠的书架。
竹简、帛书、纸卷，卷帙浩繁，目不暇接。
空气中弥漫着陈年墨香与竹木清气。

管理藏书阁的老者正在打盹，汝遂悄然入内。`,
    background: 'library',
    nextNode: 'ch_moru_001_n012',
  },
  {
    id: 'ch_moru_001_n012',
    type: 'narration',
    content: `汝循着某条莫名的感应，来到一处偏僻角落。

此处书架积满灰尘，似是久无人动。
架上竹简排列杂乱，仿佛被人刻意掩藏。

汝随手抽出一卷，拂去尘土——
封皮上赫然写着两个字：

【观心】

汝心猛地一跳。

观心……此名似曾相识！
汝努力回想，蓦然记起——
父亲临终前，曾喃喃提及此名！`,
    background: 'library',
    nextNode: 'ch_moru_001_n013',
  },
  {
    id: 'ch_moru_001_n013',
    type: 'narration',
    content: `汝展开残卷，借着昏黄灯火细读。

其上文辞古奥，意味深长：

「观者，非视也，乃心照也。」
「视之所见者，表象也；心之所照者，本质也。」

「纵横者，以言成事；观道者，以心通天。」
「百家争鸣，各执一端；然天下大道，殊途同归……」

残卷至此，戛然而止。
汝发现——后半部分竟被人刻意撕去！`,
    background: 'library',
    nextNode: 'ch_moru_001_n014',
  },
  {
    id: 'ch_moru_001_n014',
    type: 'choice',
    speaker: '汝',
    emotion: 'thinking',
    content: `残卷在手，汝心中疑云重重。

此乃父亲遗物？为何会在此处？
又是何人所撕？

汝决意——`,
    background: 'library',
    choices: [
      {
        id: 'ch_moru_001_n014_c01',
        text: '将残卷藏于怀中，悄然离去',
        effects: {
          stats: { insight: 2 },
          flags: { found_guanxin_fragment: true },
          relationships: {},
        },
        nextNode: 'ch_moru_001_n015',
      },
      {
        id: 'ch_moru_001_n014_c02',
        text: '向藏书阁老者打听此书来历',
        effects: {
          stats: { wisdom: 1 },
          flags: { asked_library_oldman: true },
          relationships: { library_oldman: { affection: 5 } },
        },
        nextNode: 'ch_moru_001_n014a',
      },
      {
        id: 'ch_moru_001_n014_c03',
        text: '四处搜寻，看是否有其他残卷散落',
        effects: {
          stats: { insight: 1 },
          flags: { searched_library: true },
          relationships: {},
        },
        nextNode: 'ch_moru_001_n014b',
      },
    ],
  },
  {
    id: 'ch_moru_001_n014a',
    type: 'dialogue',
    speaker: '藏书阁老者',
    emotion: 'normal',
    content: `汝轻叩书案，将沉睡的老者唤醒。

老者揉揉惺忪睡眼，望了望汝手中残卷，神色微变。

「此书……」

彼沉吟片刻，压低声音：

「汝从何处得来？」

汝据实以告。

老者叹息：「此乃多年前一位学者所留。」
「彼时学宫正值多事之秋，此人被逐出学宫，其著作亦被封禁。」
「老朽不知汝与此人有何渊源，然汝须记住——」
「此事，切勿外传。」

汝追问：「此人是谁？」

老者摇头：「老朽只知其姓孟，其他……不可说也。」

汝心中大惊——孟姓！父亲！`,
    background: 'library',
    nextNode: 'ch_moru_001_n015',
  },
  {
    id: 'ch_moru_001_n014b',
    type: 'narration',
    content: `汝借着微弱灯光，四处搜寻。

于角落缝隙之中，汝又发现一卷残页——

【观心·附录】

「……孟伯达，齐国临淄人。」
「其学融汇百家，以'观'为核心。」
「主张不执一端，不偏一隅。」
「然其说太过惊世骇俗，为主流学派所不容……」

残页至此再次中断。

汝将残卷残页尽数收入怀中，悄然离去。
心中暗下决心：必查清父亲之死的真相！`,
    background: 'library',
    nextNode: 'ch_moru_001_n015',
  },
  {
    id: 'ch_moru_001_n015',
    type: 'narration',
    content: `夜色渐深，汝怀揣残卷，步出藏书阁。

明月当空，汝立于阁前石阶之上，思绪万千。

父亲……彼究竟是何等人？
其学、其道、其志……
汝知之甚少。

「……」

忽然，汝身后传来脚步声。

汝转身——

但见一道黑影倏忽闪过，消失在夜色之中。

似有人在暗中窥视？

汝心头一凛，加快脚步返回住所。`,
    background: 'library_night',
    nextNode: 'ch_moru_001_n016',
  },

  // ====== Scene 1-3: 食肆风云 ======
  {
    id: 'ch_moru_001_n016',
    type: 'narration',
    content: `【第一章下半·食肆风云】

翌日午后，汝于学宫食肆用膳。

食肆之内，学子云集，人声鼎沸。
各地学子汇聚于此，高谈阔论，臧否人物。

汝正欲取食，忽闻邻桌几人低声交谈——

「听说了吗？秦国使节不日便到学宫……」

「此次非为通好，乃是为『论战大会』而来。」

「秦王欲聘天下学者入秦，共论天下一统之道……」`,
    background: 'dining_hall',
    nextNode: 'ch_moru_001_n017',
  },
  {
    id: 'ch_moru_001_n017',
    type: 'narration',
    content: `汝竖耳细听，又闻：

「法家那边近来与秦使走得近……」

「韩非虽口吃，文章却写得极好。秦王爱才，彼或有意赴秦。」

「嘿嘿，各有各的路数罢……」

正此时——

一位青衫公子步入食肆。

其人身高七尺，面容俊朗，目光如电。
举止潇洒，气度不凡。

汝认出——此乃纵横家，苏秦！

据闻苏秦乃鬼谷子高足，习纵横之术，
曾以三寸不烂之舌，说动六国君主，
佩六国相印，显赫一时。`,
    background: 'dining_hall',
    nextNode: 'ch_moru_001_n018',
  },
  {
    id: 'ch_moru_001_n018',
    type: 'narration',
    content: `苏秦似有意无意，望了汝一眼。

那目光……
似在审视，又似在确认什么。

汝心中一动——彼认得汝？

抑或只是偶然一瞥？

正当汝思索之际，苏秦已移步他处，与旁人攀谈起来。

汝当如何？`,
    background: 'dining_hall',
    nextNode: 'ch_moru_001_n019',
  },
  {
    id: 'ch_moru_001_n019',
    type: 'choice',
    speaker: '汝',
    emotion: 'thinking',
    content: '汝决意——',
    background: 'dining_hall',
    choices: [
      {
        id: 'ch_moru_001_n019_c01',
        text: '主动上前攀谈，结识苏秦',
        effects: {
          stats: { charm: 2 },
          flags: { met_suqin: true },
          relationships: { strategist: { affection: 10 } },
        },
        nextNode: 'ch_moru_001_n020',
      },
      {
        id: 'ch_moru_001_n019_c02',
        text: '继续偷听，获取更多情报',
        effects: {
          stats: { insight: 1 },
          flags: { eavesdropped_more: true },
          relationships: {},
        },
        nextNode: 'ch_moru_001_n020a',
      },
      {
        id: 'ch_moru_001_n019_c03',
        text: '悄然离去，不引人注意',
        effects: {
          stats: { wisdom: 1 },
          flags: { left_quietly: true },
          relationships: {},
        },
        nextNode: 'ch_moru_001_n021',
      },
    ],
  },
  {
    id: 'ch_moru_001_n020',
    type: 'dialogue',
    speaker: '苏秦',
    emotion: 'happy',
    content: `汝整衣上前，拱手道：

「在下孟舆，齐国临淄人。久仰苏子大名，今日得见，三生有幸。」

苏秦回身，目光在汝面上停留片刻。

「孟舆？」

彼眉峰微挑，若有所思。

「临淄孟家……汝父可是孟伯达？」

汝大惊：「苏子识得家父？」

苏秦神色复杂，压低声音：

「今夜戌时，藏书阁后，假山之畔。
有要事相告。」

言罢，彼微微一笑，飘然而去。`,
    background: 'dining_hall',
    nextNode: 'ch_moru_001_n021',
  },
  {
    id: 'ch_moru_001_n020a',
    type: 'narration',
    content: `汝佯装取食，实则竖耳细听。

断断续续间，汝又听到诸多消息——

「听说墨家那边出了点事……」

「何事？」

「似是与法家起了冲突。有人贴出论榜，直指墨家兼爱之说乃虚言。」

「啧，墨法两家的梁子，由来已久……」

「不过这次好像闹得挺大，惊动了祭酒大人……」

汝心中暗记，看来学宫内部并不太平。

墨法之争，或有文章可做。`,
    background: 'dining_hall',
    nextNode: 'ch_moru_001_n021',
  },
  {
    id: 'ch_moru_001_n021',
    type: 'narration',
    content: `汝用过膳，步出食肆。

夕阳西斜，将学宫染成一片金红。

汝立于阶上，遥望四周——

学宫之大，百家之杂，
汝初来乍到，已觉暗流涌动。

藏书阁中父亲残卷，历历在目；
食肆之内秦国阴影，隐隐浮现；
墨法之争，烽烟将起……

汝当如何自处？`,
    background: 'academy_court_sunset',
    nextNode: 'ch_moru_001_n022',
  },

  // ====== Scene 1-4: 门派危机 ======
  {
    id: 'ch_moru_001_n022',
    type: 'narration',
    content: `【第一章下半·门派危机】

夜色深沉，汝于宿舍中难以入寐。

忽闻外面传来喧嚣之声——

「墨家弟子何在！」

「出来说话！」

汝推窗望去，但见一群外门弟子举着火把，围堵于墨家馆舍之前。

为首者高声叫嚷：

「墨家兼爱，实乃愚仁！」

「若天下皆兼爱，谁来征战四方、保家卫国？」

「墨家之论，不除，天下永无宁日！」`,
    background: 'mozi_dormitory',
    nextNode: 'ch_moru_001_n023',
  },
  {
    id: 'ch_moru_001_n023',
    type: 'dialogue',
    speaker: '禽滑厘',
    emotion: 'angry',
    content: `墨家馆舍之内，禽滑厘面色铁青，却强压怒火。

彼缓步而出，沉声道：

「诸位息怒。」

「墨家兼爱，非空谈也。兴天下之利，除万民之害——此吾等之志。」

「战争之祸，汝等岂能不知？战火纷飞，生灵涂炭，此非汝等所愿见也。」

为首的挑衅者冷笑道：

「哼，说得好听！」

「若无强兵悍将，如何保家卫国？」

「汝墨家只会空谈道德，遇到外敌入侵，如何抵挡？」

围观学子越来越多，议论纷纷。`,
    background: 'mozi_dormitory',
    nextNode: 'ch_moru_001_n024',
  },
  {
    id: 'ch_moru_001_n024',
    type: 'choice',
    speaker: '汝',
    emotion: 'thinking',
    content: `墨家危机当前，众目睽睽之下，汝——

作为新弟子的汝，被众人目光所聚。

禽滑厘亦望向了汝，目光中带着一丝期许。

汝当如何应对？`,
    background: 'mozi_dormitory',
    choices: [
      {
        id: 'ch_moru_001_n024_c01',
        text: '挺身而出，以墨家之道回应',
        effects: {
          stats: { courage: 2 },
          flags: { defended_mozi: true },
          relationships: { mozi: { affection: 15, trust: 10 } },
        },
        nextNode: 'ch_moru_001_n025',
      },
      {
        id: 'ch_moru_001_n024_c02',
        text: '巧妙化解，以第三方视角调停',
        effects: {
          stats: { wisdom: 2, charm: 1 },
          flags: { mediated_conflict: true },
          relationships: { mozi: { affection: 8 }, confucian: { affection: 5 } },
        },
        nextNode: 'ch_moru_001_n026',
      },
      {
        id: 'ch_moru_001_n024_c03',
        text: '冷眼旁观，静待事态发展',
        effects: {
          stats: { insight: 1 },
          flags: { stayed_neutral: true },
          relationships: {},
        },
        nextNode: 'ch_moru_001_n027',
      },
    ],
  },
  {
    id: 'ch_moru_001_n025',
    type: 'dialogue',
    speaker: '汝',
    emotion: 'determined',
    content: `汝拨开人群，朗声道：

「诸位且住！」

众人目光齐刷刷望向汝。

汝拱手道：

「在下孟舆，新入稷下。」

「方才听闻诸位高论，窃以为有所偏颇。」

「墨家兼爱，非无用也。汝等只知征战可以保家卫国——」

「然试问，若无兼爱之心，今日汝等为保家卫国而战，明日谁为保汝等而战？」

「兼爱者，非空谈也。兴利除害，使天下大同，此墨家之志也。」

「法家严刑峻法，诚可一时见效；然长久以往，人心不附，何以立足？」

汝顿了顿，目光扫过众人：

「百家之道，各有所长，亦各有所短。
非此即彼，诚非智者所为也。」`,
    background: 'mozi_dormitory',
    nextNode: 'ch_moru_001_n027',
  },
  {
    id: 'ch_moru_001_n026',
    type: 'dialogue',
    speaker: '汝',
    emotion: 'normal',
    content: `汝上前一步，拱手道：

「诸位息怒，容在下进一言。」

「在下新入稷下，人微言轻，然有一事不明——」

「敢问诸位，墨家、法家之争，争者为何？」

为首的挑衅者冷哼：「争的是天下大道！」

汝摇头：「非也。」

「依在下之见，诸位所争者，乃'如何济世'之法，而非'是否济世'之心。」

「墨家济世，法家亦济世，所不同者，方法而已。」

「既然皆为济世，何不各存己见，相互砥砺？」

「而非如此这般，互相攻讦，徒惹外人笑话。」

此言一出，围观者纷纷点头。`,
    background: 'mozi_dormitory',
    nextNode: 'ch_moru_001_n027',
  },
  {
    id: 'ch_moru_001_n027',
    type: 'narration',
    content: `正当众人议论纷纷之际——

一道苍老之声蓦然响起：

「夜深至此，诸位何为？」

众人回首，但见一位白发老者缓步而来。

荀况。

学宫祭酒，亲自现身！

「祭酒大人！」众人纷纷行礼。

荀况目光如炬，扫视一周，沉声道：

「墨法之争，老夫早有耳闻。」

「然学术之争，当以理服人，非以势压人。」

「今夜之事，到此为止。」

「明日老夫将召集各派长老，商议论战大会之事。」

「届时，汝等有何高见，尽可于堂上一抒己见。」

言罢，荀况转身欲去，忽又回首，目光落在汝身上：

「孟舆，你且留步。」`,
    background: 'mozi_dormitory',
    nextNode: 'ch_moru_001_n028',
  },
  {
    id: 'ch_moru_001_n028',
    type: 'dialogue',
    speaker: '荀况',
    emotion: 'thinking',
    content: `众人散去，夜色渐归寂静。

荀况立于汝前，目光深邃。

「汝便是孟伯达之子？」

汝心中一惊：「祭酒大人识得家父？」

荀况叹息：

「岂止识得。」

「伯达乃吾之弟子，亦是吾之挚友。」

「彼之学，老夫至今仍未参透。」

荀况负手而立，望向夜空：

「今夜之事，汝做得不错。」

「然学宫之内，暗流涌动。」

「汝初来乍到，当谨慎行事。」

「切记——」

彼转身，目光严肃：

「不可轻信于人。」

汝问：「包括祭酒大人否？」

荀况微微一笑：「……包括老夫。」`,
    background: 'academy_court_night',
    nextNode: 'ch_moru_001_n029',
  },

  // ====== Scene 1-5: 第一章高潮·指控 ======
  {
    id: 'ch_moru_001_n029',
    type: 'narration',
    content: `【第一章高潮·指控】

翌日清晨，沉沉钟声骤然响起——

铛——铛——铛——

九响！

此乃学宫紧急集会之钟！

汝匆匆赶往明德殿，但见殿内已人头攒动。

众弟子窃窃私语，气氛凝重。

殿上，荀况居中而坐，面色凝重。
左右两旁，分立儒、法、墨、道诸家代表。`,
    background: 'mingde_hall',
    nextNode: 'ch_moru_001_n030',
  },
  {
    id: 'ch_moru_001_n030',
    type: 'dialogue',
    speaker: '法家代表',
    emotion: 'angry',
    content: `殿内寂静无声。

忽见法家代表上前一步，高声道：

「吾要指控——墨家！」

满堂哗然！

「墨家主张『兼爱』『非攻』，实乃乱天下之道！」

「彼等反对一切战争，然天下纷乱，不杀何以平？」

「墨家之论，不除，天下永无宁日！」

墨家弟子禽滑厘面色铁青，正欲反驳——

法家代表抬手止之：

「汝等墨家，嘴上说得好听——『兴天下之利，除万民之害』！」

「然则如何解释——汝等墨家弟子阻止齐国伐燕？」

「若不伐燕，燕必报复！届时齐燕两国大战，死伤何止千万！」

「汝墨家，名为兼爱，实为误国！」`,
    background: 'mingde_hall',
    nextNode: 'ch_moru_001_n031',
  },
  {
    id: 'ch_moru_001_n031',
    type: 'dialogue',
    speaker: '禽滑厘',
    emotion: 'angry',
    content: `禽滑厘冷笑一声，针锋相对：

「法家之徒，只知杀伐！」

「汝等所谓『不杀何以平』，不过是以杀止杀的谬论！」

「汝等可曾想过，每一场战争，死伤者皆是无辜百姓？」

「兼爱非攻，非空谈也。吾等反对的，是不义之战！」

「齐伐燕之战，师出无名，百姓何辜？」

「吾墨家所为，乃是阻止不义之战，而非误国！」

两派针锋相对，殿内气氛愈发紧张。`,
    background: 'mingde_hall',
    nextNode: 'ch_moru_001_n032',
  },
  {
    id: 'ch_moru_001_n032',
    type: 'dialogue',
    speaker: '荀况',
    emotion: 'normal',
    content: `荀况抬手，殿内渐渐安静。

「诸生静声。」

彼缓缓开口：

「法家所控，墨家所辩，老夫已有了解。」

「此事牵涉甚广，非一时可决。」

「老夫决定——」

彼目光扫过众人：

「下月『百家论辩大会』上，就此辩题公辩之。」

「届时，各派可推举代表，是非曲直，当于天下学者面前论明。」

言罢，荀况的目光——

最后落在了汝身上。

那目光意味深长，似有深意。`,
    background: 'mingde_hall',
    nextNode: 'ch_moru_001_n033',
  },
  {
    id: 'ch_moru_001_n033',
    type: 'choice',
    speaker: '汝',
    emotion: 'thinking',
    content: `汝立于人群之中，感受着那道目光。

荀况似在询问汝——

汝，可愿参与此场论辩？

汝当如何回应？`,
    background: 'mingde_hall',
    choices: [
      {
        id: 'ch_moru_001_n033_c01',
        text: '主动请缨，愿为代表参与论辩',
        effects: {
          stats: { courage: 2 },
          flags: { volunteered_for_debate: true },
          relationships: { school_master: { trust: 5 } },
        },
        nextNode: 'ch_moru_001_n034',
      },
      {
        id: 'ch_moru_001_n033_c02',
        text: '请求旁观，以第三方身份观察局势',
        effects: {
          stats: { insight: 2 },
          flags: { requested_observer_role: true },
          relationships: {},
        },
        nextNode: 'ch_moru_001_n035',
      },
      {
        id: 'ch_moru_001_n033_c03',
        text: '保持沉默，静待事态发展',
        effects: {
          stats: { wisdom: 1 },
          flags: { stayed_silent: true },
          relationships: {},
        },
        nextNode: 'ch_moru_001_n036',
      },
    ],
  },
  {
    id: 'ch_moru_001_n034',
    type: 'dialogue',
    speaker: '荀况',
    emotion: 'happy',
    content: `汝上前一步，朗声道：

「祭酒大人，在下孟舆，愿毛遂自荐！」

「愿为代表，参与此场论辩！」

荀况目光中闪过一丝赞许。

「孟舆……」

「好！」

「汝既有此志，老夫准了。」

「论辩大会上，汝可代表——」

彼顿了顿：

「代表汝自己。」

「非墨家，非法家，非任何一门。」

「汝乃孟伯达之子，当以汝自己的方式，论汝自己的道。」`,
    background: 'mingde_hall',
    nextNode: 'ch_moru_001_n036',
  },
  {
    id: 'ch_moru_001_n035',
    type: 'dialogue',
    speaker: '荀况',
    emotion: 'thinking',
    content: `汝拱手道：

「在下初入稷下，人微言轻。」

「愿以旁观者身份，静观此场论辩，以增见识。」

荀况微微颔首：

「也好。」

「旁观者清，亦有所得。」

「汝可于一旁观摩，届时自会有所收获。」

彼目光深邃，似有深意。`,
    background: 'mingde_hall',
    nextNode: 'ch_moru_001_n036',
  },
  {
    id: 'ch_moru_001_n036',
    type: 'narration',
    content: `集会散后，汝随众人步出明德殿。

夕阳西斜，将学宫染成一片金红。

汝立于殿外石阶之上，思绪万千。

墨法之争，方兴未艾；
父亲之死，疑云重重；
论辩大会，一月之后……

汝当何去何从？`,
    background: 'mingde_hall_sunset',
    nextNode: 'ch_moru_001_n037',
  },

  // ====== Scene 1-6: 第一章结尾·暗流 ======
  {
    id: 'ch_moru_001_n037',
    type: 'narration',
    content: `【第一章结尾·暗流】

夜色渐深，汝于宿舍中独坐。

月光透过窗棂，洒在地上，映出斑驳光影。

汝取出怀中残卷，借月细读。

「观者，非视也，乃心照也……」

父亲之学，究竟为何？
父亲之死，是否真如表面那般简单？

正当汝沉思之际——

窗外，忽有一物飞入！

汝眼疾手快，一把接住——

乃是一枚竹简！`,
    background: 'dormitory_night',
    nextNode: 'ch_moru_001_n038',
  },
  {
    id: 'ch_moru_001_n038',
    type: 'narration',
    content: `汝展开竹简，只见其上寥寥数语：

「今夜戌时，藏书阁后，假山之畔。」

落款处，只有一字——

「苏」

苏秦！

汝蓦然想起——昨日食肆之中，苏秦确曾约汝今夜相见。

原来如此。

汝收好竹简，悄然出屋。

月色如水，汝穿行于学宫之中，往藏书阁后而去。`,
    background: 'academy_night',
    nextNode: 'ch_moru_001_n039',
  },
  {
    id: 'ch_moru_001_n039',
    type: 'dialogue',
    speaker: '苏秦',
    emotion: 'normal',
    content: `藏书阁后，假山之畔。

月光下，苏秦负手而立，青衫飘飘。

见汝到来，彼微微一笑：

「汝来了。」

汝拱手：「苏子约见，在下不敢不至。」

苏秦转身，目光深邃：

「汝可知，吾为何约汝？」

汝摇头：「不知。」

苏秦叹息：

「汝父孟伯达，乃吾师之旧交。」

「吾师……汝可知是谁？」

汝心中一动：「莫非是——鬼谷子？」

苏秦颔首：

「正是。」

「鬼谷子，吾之师；孟伯达，吾之师兄。」

「汝父与吾，乃同门之谊。」`,
    background: 'library_back_night',
    nextNode: 'ch_moru_001_n040',
  },
  {
    id: 'ch_moru_001_n040',
    type: 'dialogue',
    speaker: '苏秦',
    emotion: 'sad',
    content: `汝大惊：「苏子与家父，竟是同门？」

苏秦颔首，神色凝重：

「师兄当年之事，吾知之甚详。」

「彼之死……」

苏秦压低声音：

「非仅商贾纠纷那般简单。」

汝追问：「苏子何意？」

苏秦摇头：

「今夜不便多说。汝只需记住——」

「下月论辩大会，汝当有所表现。」

「届时——」

彼目光如电：

「自会有人寻汝。」

「师兄之死，汝父之志……」

「皆系于此。」`,
    background: 'library_back_night',
    nextNode: 'ch_moru_001_n041',
  },
  {
    id: 'ch_moru_001_n041',
    type: 'narration',
    content: `言罢，苏秦转身欲去。

汝急问：「苏子何往？」

苏秦回首，月光下其面容半明半暗：

「吾将周游六国，合纵抗秦。」

「此乃师门之命，亦吾之所愿。」

「汝若寻吾——」

彼微微一笑：

「鬼谷之谷，汝自会寻得。」

言罢，彼身形一晃，消失在夜色之中。

汝独立于月下，心中波涛汹涌。

父亲……同门……论辩大会……

一切的一切，似有一只无形之手在幕后操控。

而那只手……

究竟指向何方？`,
    background: 'library_back_night',
    nextNode: 'ch_moru_001_ending',
  },

  // ====== 第一章结尾 ======
  {
    id: 'ch_moru_001_ending',
    type: 'ending',
    speaker: '旁白',
    emotion: 'normal',
    content: `【第一章·百家争鸣 完】

月落乌啼，夜色深沉。

汝独自立于假山之畔，久久无言。

脑海中，父亲残卷的字句不断浮现——

「观者，非视也，乃心照也。」

「纵横者，以言成事；观道者，以心通天。」

「百家争鸣，各执一端；然天下大道，殊途同归……」

一个月后，论辩大会将至。

而在那之前——

汝还有太多事要做。

藏书阁中，继续搜寻父亲遗著；
学宫之内，应对墨法之争；
暗流涌动，探寻父亲死因……

汝之道，究竟在何方？

【第一章·百家争鸣 完】

【章节评价】
├── 试辩表现：[正向/稳态/降级]
├── 藏书阁发现：[是/否]
├── 墨家危机：[挺身/调停/旁观]
├── 祭酒交流：[主动请缨/旁观/沉默]
└── 苏秦结交：[是/否]

【悬念】
├── 父亲孟伯达之死的真相？
├── 苏秦所言"自会有人寻汝"指谁？
├── 鬼谷子究竟有何布局？
└── 论辩大会上，将发生什么？

【存档点】游戏已自动保存`,
    background: 'library_back_night',
    nextNode: 'ch_moru_002_n001',
  },
];
