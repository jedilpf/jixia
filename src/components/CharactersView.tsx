import { useState } from 'react';
import { uiAudio } from '@/utils/audioManager';
import { useLanguage } from '@/contexts/LanguageContext';

// 门派名称翻译
const SCHOOL_NAMES: Record<string, { zh: string; en: string }> = {
  '全部': { zh: '全部', en: 'All' },
  '礼心殿': { zh: '礼心殿', en: 'Ritual Temple' },
  '衡戒廷': { zh: '衡戒廷', en: 'Judgment Court' },
  '归真观': { zh: '归真观', en: 'Truth Pavilion' },
  '九阵堂': { zh: '九阵堂', en: 'Nine Arrays Hall' },
  '玄匠盟': { zh: '玄匠盟', en: 'Mechanist Guild' },
  '名相府': { zh: '名相府', en: 'Name Manor' },
  '司天台': { zh: '司天台', en: 'Sky Observatory' },
  '游策阁': { zh: '游策阁', en: 'Strategy Pavilion' },
  '万农坊': { zh: '万农坊', en: 'Thousand Farmers' },
  '兼采楼': { zh: '兼采楼', en: 'Mixed Lore Hall' },
  '天工坊': { zh: '天工坊', en: 'Heavenly Works' },
  '两仪署': { zh: '两仪署', en: 'Dual Bureau' },
  '杏林馆': { zh: '杏林馆', en: 'Apricot Grove' },
  '稗言社': { zh: '稗言社', en: 'Tales Society' },
  '养真院': { zh: '养真院', en: 'Truth Cultivation' },
  '筹天阁': { zh: '筹天阁', en: 'Heaven\'s Calculation' },
};

const CHARACTERS = [
    {
        id: 'mozi',
        name: '墨翟',
        nameEn: 'Mozi',
        title: '兼爱非攻',
        titleEn: 'Universal Love',
        school: '玄匠盟',
        schoolEn: 'Mechanist Guild',
        quote: '天下皆白，唯我独黑。',
        quoteEn: 'The world is white; only I remain black.',
        desc: '墨家学派创始人，天下第一机关大师。主张"兼爱"、"非攻"，以精密的机关术闻名于世，建立墨家机关城对抗暴政。',
        descEn: 'Founder of the Mohist school, the greatest mechanist in the world. Advocates "universal love" and "non-aggression", renowned for intricate mechanisms.',
        playstyle: '特色：高护甲，构筑机关物进行防守反击。',
        playstyleEn: 'High armor, constructs mechanisms for defensive counterattacks.',
        avatar: '⚙️',
        color: '#D4AF65'
    },
    {
        id: 'luban',
        name: '公输班',
        nameEn: 'Gongshu Ban',
        title: '霸道机关',
        titleEn: 'Dominion Mechanism',
        school: '天工坊',
        schoolEn: 'Heavenly Works',
        quote: '机枢运转之理，即是毁灭之美。',
        quoteEn: 'The principle of mechanism is the beauty of destruction.',
        desc: '公输家族的传奇宗师，墨翟的宿敌。信奉"霸道机关术"，制造了无数具有毁灭力量的战争机器。',
        descEn: 'Legendary master of the Gongshu clan, arch-rival of Mozi. Creator of countless war machines.',
        playstyle: '特色：极致爆发，牺牲自身耐久换取高额伤害。',
        playstyleEn: 'Extreme burst, sacrifices durability for massive damage.',
        avatar: '🔥',
        color: '#c0520a'
    },
    {
        id: 'zhuangzi',
        name: '庄周',
        nameEn: 'Zhuangzi',
        title: '逍遥游梦',
        titleEn: 'Free Spirit Dreamer',
        school: '归真观',
        schoolEn: 'Truth Pavilion',
        quote: '昔者庄周梦为胡蝶，栩栩然胡蝶也。',
        quoteEn: 'Once I dreamt I was a butterfly, fluttering freely.',
        desc: '道家学说代表人物，崇尚自然无为，神游物外。在稷下学宫中是一位避世修行的神秘存在，传说能以梦境影响现实。',
        descEn: 'Representative of Daoism, advocates naturalness and non-action. A mysterious recluse who shapes reality through dreams.',
        playstyle: '特色：虚实转换，灵活抽牌，利用法术进行消耗。',
        playstyleEn: 'Shifts between reality and illusion, flexible draws, spell-based attrition.',
        avatar: '🦋',
        color: '#4a7c6f'
    },
    {
        id: 'hanfeizi',
        name: '韩非',
        nameEn: 'Han Feizi',
        title: '法网恢恢',
        titleEn: 'Law\'s Eternal Net',
        school: '衡戒廷',
        schoolEn: 'Judgment Court',
        quote: '法不阿贵，绳不挠曲。',
        quoteEn: 'Law favors no noble; the measuring line bends not.',
        desc: '法家集大成者，主张以法治国。在辩斗中善于利用规则束缚对手，通过严密的算计逐步确立致胜的势。',
        descEn: 'Great synthesizer of Legalism, advocates rule by law. Binds opponents with rules, winning through meticulous calculation.',
        playstyle: '特色：控制场面，限制敌方行动，累积资源压制。',
        playstyleEn: 'Board control, restricts enemy actions, accumulates resources.',
        avatar: '⚖️',
        color: '#6b4a99'
    },
    {
        id: 'kongqiu',
        name: '孔丘',
        nameEn: 'Confucius',
        title: '万世师表',
        titleEn: 'Teacher of Ages',
        school: '礼心殿',
        schoolEn: 'Ritual Temple',
        quote: '知其不可而为之。',
        quoteEn: 'Do what you know cannot be done.',
        desc: '儒家学说创始人，思想核心为"仁"与"礼"。周游列国，弟子三千，其学说与礼法构成稷下学宫的基石。',
        descEn: 'Founder of Confucianism, centered on "benevolence" and "ritual". Wandered the kingdoms with 3000 disciples.',
        playstyle: '特色：增益同伴，依循礼法规章强化己方阵地。',
        playstyleEn: 'Buffs allies, strengthens position through ritual protocols.',
        avatar: '📜',
        color: '#5e8ca8'
    },
    {
        id: 'sunwu',
        name: '孙武',
        nameEn: 'Sun Wu',
        title: '兵法之神',
        titleEn: 'God of Strategy',
        school: '九阵堂',
        schoolEn: 'Nine Arrays Hall',
        quote: '兵者，诡道也。',
        quoteEn: 'War is the art of deception.',
        desc: '兵家至圣，著有《孙子兵法》。精通战阵布置与兵法谋略，善于在瞬息万变的战场中寻得敌方破绽，一击致命。',
        descEn: 'Supreme strategist, author of "Art of War". Master of formations and tactics for decisive strikes.',
        playstyle: '特色：战术多变，强调辩斗频率与攻势调度。',
        playstyleEn: 'Versatile tactics, emphasizes debate tempo and attack coordination.',
        avatar: '⚔️',
        color: '#831843'
    },
    {
        id: 'zouyan',
        name: '邹衍',
        nameEn: 'Zou Yan',
        title: '五德终始',
        titleEn: 'Five Virtues Cycle',
        school: '两仪署',
        schoolEn: 'Dual Bureau',
        quote: '深观阴阳消息，而作怪迂之变。',
        quoteEn: 'Observe the waxing and waning of yin-yang, create wondrous transformations.',
        desc: '阴阳家创始者，创立"五德终始说"。能敏锐洞察天地阴阳之气，并在战局中运用五行相生相克的力量。',
        descEn: 'Founder of Yin-Yang school, created the "Five Virtues Cycle". Uses five elements\' mutual generation and destruction.',
        playstyle: '特色：五行相生相克，强力元素法术爆发。',
        playstyleEn: 'Five elements synergy/dissolution, powerful elemental bursts.',
        avatar: '☯️',
        color: '#1a4e63'
    },
    {
        id: 'huishi',
        name: '惠施',
        nameEn: 'Hui Shi',
        title: '历物之意',
        titleEn: 'Ten Paradoxes',
        school: '名相府',
        schoolEn: 'Name Manor',
        quote: '泛爱万物，天地一体也。',
        quoteEn: 'Love all things universally; heaven and earth are one.',
        desc: '名家代表人物，极善逻辑与诡辩。提出著名的"历物十事"，其言论常常让对手在论道之中陷入认知混乱。',
        descEn: 'Representative Logician, master of logic and sophistry. Proposed the famous "Ten Paradoxes".',
        playstyle: '特色：打断节奏，反转敌方卡牌的基础效果。',
        playstyleEn: 'Disrupts tempo, reverses enemy card effects.',
        avatar: '🗣️',
        color: '#3d6170'
    },
    {
        id: 'guiguzi',
        name: '鬼谷子',
        nameEn: 'Guiguzi',
        title: '纵横捭阖',
        titleEn: 'Vertical & Horizontal',
        school: '游策阁',
        schoolEn: 'Strategy Pavilion',
        quote: '捭阖者，道之大化，说之变也。',
        quoteEn: 'Opening and closing are the great transformations of the Way.',
        desc: '纵横捭阖之术的创设者，常年隐居。精通奇门遁甲与揣摩人心，以言辞为利剑，以大势为棋盘拨弄风云。',
        descEn: 'Creator of diplomatic arts, a hidden master. Wields words as swords, plays the world as chess.',
        playstyle: '特色：操控人心，弃牌战术，擅长借力打力。',
        playstyleEn: 'Manipulates minds, discard tactics, leverages enemy strength.',
        avatar: '♟️',
        color: '#45595c'
    },
    {
        id: 'xuxing',
        name: '许行',
        nameEn: 'Xu Xing',
        title: '并耕而食',
        titleEn: 'Farming Together',
        school: '万农坊',
        schoolEn: 'Thousand Farmers',
        quote: '贤者与民并耕而食，饔飧而治。',
        quoteEn: 'The wise farm with the people, cook and govern together.',
        desc: '农家代表学者，主张君民同耕。虽然看似淳朴，但能与苍天厚土共鸣，借助自然万物之力获取无尽生机。',
        descEn: 'Agrarian scholar, advocates rulers farming with people. Resonates with nature for endless vitality.',
        playstyle: '特色：资源成长，后期发力，生生不息的回复。',
        playstyleEn: 'Resource growth, late-game power, endless recovery.',
        avatar: '🌾',
        color: '#8b8a36'
    },
    {
        id: 'gande',
        name: '甘德',
        nameEn: 'Gan De',
        title: '仰观群星',
        titleEn: 'Stargazer',
        school: '司天台',
        schoolEn: 'Sky Observatory',
        quote: '星躔步度，皆有常轨。',
        quoteEn: 'Star paths and steps all follow constant orbits.',
        desc: '占星家代表人物，精于观测星象。通过观星推演天下大势，擅长从牌库中寻找能够逆转战局的关键。',
        descEn: 'Master astrologer, skilled in stargazing. Finds key cards to turn battles through prediction.',
        playstyle: '特色：观星、预示、牌序控制。',
        playstyleEn: 'Star-gazing, prediction, deck order control.',
        avatar: '✨',
        color: '#1e3a8a'
    },
    {
        id: 'lvbuwei',
        name: '吕不韦',
        nameEn: 'Lü Buwei',
        title: '奇货可居',
        titleEn: 'Rare Goods Hoard',
        school: '兼采楼',
        schoolEn: 'Mixed Lore Hall',
        quote: '兼儒墨，合名法，知国体之有此，见王治之无不备。',
        quoteEn: 'Combine all schools, know the state\'s structure, see the king\'s rule complete.',
        desc: '杂家集大成者，曾编撰《吕氏春秋》。擅长博采众长，将百家学说融为一炉，手段多变且资源丰厚。',
        descEn: 'Great synthesizer of Eclectic school, compiled "Spring and Autumn of Lü". Blends all schools, versatile methods.',
        playstyle: '特色：多类型联动、复制调度、资源置换。',
        playstyleEn: 'Multi-type synergy, copy/schedule effects, resource exchange.',
        avatar: '📜',
        color: '#b45309'
    },
    {
        id: 'bianque',
        name: '扁鹊',
        nameEn: 'Bian Que',
        title: '起死回生',
        titleEn: 'Resurrection',
        school: '杏林馆',
        schoolEn: 'Apricot Grove',
        quote: '疾之居腠理也，汤熨之所及也。',
        quoteEn: 'When illness resides in the skin, hot water can reach it.',
        desc: '医家传说的神医，望闻问切，医术通神。不但能治愈己方伤痛，亦能以毒攻毒、针砭时弊。',
        descEn: 'Legendary divine healer, master of diagnosis. Cures allies\' wounds, uses poison against poison.',
        playstyle: '特色：问脉、祛毒、续命、稳态治疗。',
        playstyleEn: 'Diagnosis, detox, revival, stable healing.',
        avatar: '🌿',
        color: '#15803d'
    },
    {
        id: 'yuchu',
        name: '虞初',
        nameEn: 'Yu Chu',
        title: '稗官野史',
        titleEn: 'Tales & Legends',
        school: '稗言社',
        schoolEn: 'Tales Society',
        quote: '街谈巷语，道听途说者之所造也。',
        quoteEn: 'Street gossip and hearsay are what novelists create.',
        desc: '小说家之祖，擅长收集民间街谈巷语。能以流言蜚语、离奇故事动摇敌方心智，引发不可预料的事件。',
        descEn: 'Founder of novelist school, collects folk tales. Uses rumors and bizarre stories to shake enemy minds.',
        playstyle: '特色：传闻渲染、娱乐性随机事件。',
        playstyleEn: 'Rumor spreading, entertaining random events.',
        avatar: '🎭',
        color: '#c026d3'
    },
    {
        id: 'qibo',
        name: '岐伯',
        nameEn: 'Qi Bo',
        title: '黄帝之师',
        titleEn: 'Yellow Emperor\'s Teacher',
        school: '养真院',
        schoolEn: 'Truth Cultivation',
        quote: '上古之人，其知道者，法于阴阳，和于术数。',
        quoteEn: 'Ancient people who knew the Way followed yin-yang, harmonized with numbers.',
        desc: '方技家尊奉的祖师。专注个人内在的修行与固本培元，借由吐纳导引之术提升自身抗压与反击能力。',
        descEn: 'Ancestral master of Technique school. Uses breathing arts to enhance resilience and counter.',
        playstyle: '特色：导引轻身、服食避厄、单体修行。',
        playstyleEn: 'Guided movement, herbal protection, solo cultivation.',
        avatar: '🏺',
        color: '#0f766e'
    },
    {
        id: 'jingfang',
        name: '京房',
        nameEn: 'Jing Fang',
        title: '阴阳卦气',
        titleEn: 'Yin-Yang Divination',
        school: '筹天阁',
        schoolEn: 'Heaven\'s Calculation',
        quote: '八卦分荡，六十四卦成，天地万物之理尽在其中。',
        quoteEn: 'Eight trigrams diverge, sixty-four hexagrams form; all principles lie within.',
        desc: '术数大家，精通占星卜筮。以算筹定乾坤，其招数往往在数回合后爆发惊人威力，讲究宿命般的布局。',
        descEn: 'Master numerologist, skilled in divination. Uses calculation rods, effects burst after rounds.',
        playstyle: '特色：卜筮筹算、延迟收益、宿命布局。',
        playstyleEn: 'Divination calculation, delayed payoff, fated planning.',
        avatar: '🧮',
        color: '#334155'
    }
];

const SCHOOLS = ['全部', '礼心殿', '衡戒廷', '归真观', '九阵堂', '玄匠盟', '名相府', '司天台', '游策阁', '万农坊', '兼采楼', '天工坊', '两仪署', '杏林馆', '稗言社', '养真院', '筹天阁'];

const HAS_STAND = new Set(['mozi', 'kongqiu', 'hanfeizi', 'sunwu', 'zouyan', 'xuxing', 'guiguzi', 'huishi', 'zhuangzi', 'lvbuwei', 'luban', 'gande', 'bianque', 'yuchu', 'qibo', 'jingfang']);

export function CharactersView({ onBack }: { onBack: () => void }) {
    const { language } = useLanguage();
    const [activeSchool, setActiveSchool] = useState('全部');
    const [schoolsExpanded, setSchoolsExpanded] = useState(false);
    const [selectedCharId, setSelectedCharId] = useState(CHARACTERS[0].id);
    const [bgLoaded, setBgLoaded] = useState(false);
    const [standError, setStandError] = useState(false);

    // 获取本地化文本
    const t = (zh: string, en: string) => language === 'zh' ? zh : en;
    const getSchoolName = (school: string) => SCHOOL_NAMES[school]?.[language === 'zh' ? 'zh' : 'en'] || school;
    const getCharName = (char: typeof CHARACTERS[0]) => language === 'zh' ? char.name : char.nameEn;
    const getCharTitle = (char: typeof CHARACTERS[0]) => language === 'zh' ? char.title : char.titleEn;
    const getCharSchool = (char: typeof CHARACTERS[0]) => language === 'zh' ? char.school : char.schoolEn;
    const getCharDesc = (char: typeof CHARACTERS[0]) => language === 'zh' ? char.desc : char.descEn;
    const getCharQuote = (char: typeof CHARACTERS[0]) => language === 'zh' ? char.quote : char.quoteEn;
    const getCharPlaystyle = (char: typeof CHARACTERS[0]) => language === 'zh' ? char.playstyle : char.playstyleEn;

    const filteredChars = activeSchool === '全部'
        ? CHARACTERS
        : CHARACTERS.filter(c => c.school === activeSchool);

    const selectedChar = CHARACTERS.find(c => c.id === selectedCharId) || CHARACTERS[0];
    const bgImgSrc = `assets/chars/${selectedChar.id}.png`;
    const standImgSrc = HAS_STAND.has(selectedChar.id)
        ? `assets/chars/stand/${selectedChar.id}.png`
        : null;

    const handleCharSelect = (id: string) => {
        setSelectedCharId(id);
        setBgLoaded(false);
        setStandError(false);
    };

    return (
        <div className="w-full h-screen overflow-hidden flex relative select-none text-[#f6e4c3]">
            {/* 全屏沉浸背景 */}
            <div className="absolute inset-0 z-0">
                <img
                    key={`bg-${selectedChar.id}`}
                    src={bgImgSrc}
                    alt=""
                    className="w-full h-full object-cover object-center transition-opacity duration-700"
                    style={{ opacity: bgLoaded ? 1 : 0.6 }}
                    onLoad={() => setBgLoaded(true)}
                />
                <div
                    className="absolute inset-0 transition-colors duration-1000"
                    style={{ backgroundColor: selectedChar.color + '22' }}
                />
                <div
                    className="absolute inset-0"
                    style={{
                        backdropFilter: 'blur(4px)',
                        backgroundColor: 'rgba(26, 10, 10, 0.65)',
                    }}
                />
                <div className="absolute inset-y-0 left-0 w-[28%] bg-[#0a0503]/70" />
            </div>

            {/* 左侧：百家名录 */}
            <div className="relative z-20 w-[28%] h-full bg-gradient-to-r from-black/80 via-black/60 to-transparent flex flex-col border-r border-[#D4AF65]/20 shadow-[4px_0_24px_rgba(0,0,0,0.6)]">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#0a0e14]/90 to-transparent pointer-events-none" />

                <div className="pt-16 pb-4 px-6 flex-shrink-0 relative z-10">
                    <div className="flex justify-between items-end mb-6 relative">
                        <div className="absolute -left-4 top-2 w-2 h-8 bg-[#831843] opacity-80" />
                        <div>
                            <h2 className="text-[#f6e4c3] text-3xl font-serif tracking-[0.2em] font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{t('名士风采', 'Elite Characters')}</h2>
                            <span className="text-[10px] text-[#e7e1f0]/50 uppercase tracking-[0.15em] mt-1 block">{t('名士风采', 'Elite Characters')}</span>
                        </div>
                        <button
                            onClick={() => { uiAudio.playClick(); setSchoolsExpanded(!schoolsExpanded); }}
                            onMouseEnter={() => uiAudio.playHover()}
                            className="text-[#D4AF65] hover:text-[#f6e4c3] text-xs font-serif tracking-widest px-3 py-1.5 rounded-sm bg-[#0a0e14]/60 border border-[#D4AF65]/20 hover:border-[#D4AF65]/60 hover:bg-[#D4AF65]/10 transition-all mb-1 shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                        >
                            {schoolsExpanded ? t('收起名录', 'Collapse') + ' ∧' : t('展卷', 'Expand') + ' ∨'}
                        </button>
                    </div>
                    <div className={`flex flex-wrap gap-2.5 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${schoolsExpanded ? 'max-h-[600px] opacity-100' : 'max-h-[82px] opacity-90'}`}>
                        {SCHOOLS.map(school => {
                            const isSelected = activeSchool === school;
                            const schoolDisplay = getSchoolName(school);
                            return (
                                <button
                                    key={school}
                                    onClick={() => {
                                        uiAudio.playClick();
                                        setActiveSchool(school);
                                        if (school !== '全部') {
                                            const firstChar = CHARACTERS.find(c => c.school === school);
                                            if (firstChar) handleCharSelect(firstChar.id);
                                        }
                                    }}
                                    onMouseEnter={() => uiAudio.playHover()}
                                    className={`relative px-4 py-2 text-sm font-serif tracking-widest transition-all duration-300 overflow-hidden group ${isSelected
                                        ? 'text-[#0a0e14] font-bold shadow-[0_2px_10px_rgba(212,165,32,0.4)]'
                                        : 'text-[#D4AF65]/80 hover:text-[#f6e4c3]'
                                        }`}
                                >
                                    <div className={`absolute inset-0 transition-opacity duration-300 ${isSelected ? 'bg-gradient-to-b from-[#f6e4c3] to-[#D4AF65] opacity-100' : 'bg-[#0a0e14]/60 border border-[#D4AF65]/20 group-hover:bg-[#D4AF65]/20'}`} />
                                    {isSelected && (
                                        <>
                                            <div className="absolute top-1 bottom-1 left-1 w-px bg-black/20" />
                                            <div className="absolute top-1 bottom-1 right-1 w-px bg-black/20" />
                                        </>
                                    )}
                                    <span className="relative z-10">{schoolDisplay}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="relative mx-4 mt-3 mb-2 h-4 flex items-center justify-center shrink-0 opacity-80" style={{ pointerEvents: 'none' }}>
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF65]/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF65]/60 to-transparent" />
                    <div className="w-full h-full opacity-60" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2,2 L14,2 L14,14 L2,14 Z M4,4 L12,4 L12,12 L4,12 Z' fill='none' stroke='%238b2e2e' stroke-width='0.5'/%3E%3Cpath d='M8,0 L8,16 M0,8 L16,8' stroke='%23d4a520' stroke-width='0.5' stroke-dasharray='1,2'/%3E%3C/svg%3E")`,
                        backgroundSize: '16px 16px',
                        backgroundRepeat: 'repeat-x',
                        backgroundPosition: 'center',
                        maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
                    }} />
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-8 pt-3 custom-scrollbar relative z-10 w-full">
                    <div className="flex flex-col gap-4 relative">
                        {filteredChars.map(char => {
                            const isActive = char.id === selectedCharId;
                            return (
                                <button
                                    key={char.id}
                                    onClick={() => { uiAudio.playClick(); handleCharSelect(char.id); }}
                                    onMouseEnter={() => uiAudio.playHover()}
                                    className={`relative w-full text-left transition-all duration-500 flex items-center p-3 group overflow-hidden ${isActive
                                        ? 'translate-x-4'
                                        : 'hover:translate-x-2'
                                        }`}
                                >
                                    <div className={`absolute inset-0 border-y transition-all duration-500 rounded-r-3xl ${isActive
                                        ? 'bg-gradient-to-r from-[rgba(212,165,32,0.15)] to-transparent border-[#D4AF65]/40'
                                        : 'bg-gradient-to-r from-black/40 to-transparent border-transparent group-hover:border-[#D4AF65]/10'
                                        }`} />

                                    <div className={`absolute right-1 top-1 bottom-1 w-6 transition-all duration-700 z-30 flex flex-col items-center justify-between py-1 pointer-events-none ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                                        }`}>
                                        <div className="w-1.5 h-1.5 rotate-45 border border-[#D4AF65] bg-[#831843] shadow-[0_0_6px_#831843]" />
                                        <div className="flex-1 w-[2px] bg-gradient-to-b from-transparent via-[#831843]/80 to-transparent my-1" />
                                        <div className="w-1.5 h-1.5 rotate-45 border border-[#D4AF65] bg-[#831843] shadow-[0_0_6px_#831843]" />
                                    </div>

                                    <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-500 ${isActive ? 'bg-[#831843] shadow-[0_0_12px_#831843]' : 'bg-transparent'
                                        }`} />

                                    <div className={`relative w-12 h-12 rounded-full flex items-center justify-center text-xl mr-3 flex-shrink-0 transition-all duration-500 z-10 ${isActive
                                        ? 'bg-[#0a0e14] border border-[#D4AF65] shadow-[0_0_15px_rgba(212,165,32,0.4)]'
                                        : 'bg-black/60 border border-[#D4AF65]/20 group-hover:border-[#D4AF65]/50'
                                        }`}>
                                        <span className="relative z-10 transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{char.avatar}</span>
                                        <div className="absolute inset-[3px] rounded-full border border-[rgba(212,165,32,0.1)] pointer-events-none" />
                                    </div>

                                    <div className="relative z-10 flex-1">
                                        <div className={`text-xl font-serif tracking-[0.15em] mb-1 transition-colors duration-300 ${isActive ? 'text-[#f6e4c3] font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' : 'text-[#D4AF65]/80 group-hover:text-[#f6e4c3]'
                                            }`}>
                                            {getCharName(char)}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] px-1.5 py-0.5 border rounded-sm font-serif tracking-widest ${isActive ? 'text-[#D4AF65] border-[#D4AF65]/40 bg-[#D4AF65]/10' : 'text-[#8B7355]/60 border-[#8B7355]/20'
                                                }`}>
                                                {getCharSchool(char)}
                                            </span>
                                            <span className="text-xs text-[rgba(212,165,32,0.5)] font-serif tracking-wider">
                                                · {getCharTitle(char)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#0a0503] to-transparent pointer-events-none z-20" />
                                </button>
                            );
                        })}
                        {filteredChars.length === 0 && (
                            <div className="text-center text-[rgba(212,165,32,0.4)] py-12 font-serif text-lg tracking-widest">
                                {t('此学派暂无收录人物', 'No characters in this school')}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 右侧：展示区 */}
            <div className="relative z-10 flex-1 h-full flex items-center pl-4">
                {/* 立绘展示框 */}
                <div className="relative ml-8 flex-shrink-0 flex flex-col items-center" style={{ width: 320 }}>
                    <div className="relative w-full">
                        <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-[#D4AF65] pointer-events-none z-20" />
                        <div className="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-[#D4AF65] pointer-events-none z-20" />
                        <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-[#D4AF65] pointer-events-none z-20" />
                        <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-[#D4AF65] pointer-events-none z-20" />
                        <div className="absolute -inset-1 border border-[rgba(212,165,32,0.3)] pointer-events-none z-20" />

                        <div className="w-full overflow-hidden relative group" style={{ height: 420 }}>
                            {standImgSrc && !standError ? (
                                <img
                                    key={`stand-${selectedChar.id}`}
                                    src={standImgSrc}
                                    alt={selectedChar.name}
                                    className={`w-full h-full object-contain object-bottom transition-all duration-700 block ${
                                        ['luban', 'gande', 'bianque', 'yuchu', 'qibo', 'jingfang'].includes(selectedChar.id)
                                            ? 'origin-bottom scale-[1.35] group-hover:scale-[1.42]'
                                            : selectedChar.id === 'zouyan'
                                            ? 'origin-bottom scale-[1.15] group-hover:scale-[1.22]'
                                            : 'group-hover:scale-105'
                                    }`}
                                    onError={() => setStandError(true)}
                                />
                            ) : (
                                <img
                                    key={`fallback-${selectedChar.id}`}
                                    src={bgImgSrc}
                                    alt={selectedChar.name}
                                    className="w-full h-full object-contain object-center transition-all duration-700 group-hover:scale-105 block"
                                />
                            )}
                        </div>
                    </div>

                    {/* 铭牌底座 */}
                    <div className="mt-4 px-10 py-2 border border-[#D4AF65] bg-[rgba(26,10,10,0.85)] shadow-[0_4px_20px_rgba(0,0,0,0.7)]">
                        <div className="text-[#f6e4c3] font-serif text-lg tracking-[0.4em] text-center whitespace-nowrap">
                            {getCharTitle(selectedChar)}
                        </div>
                    </div>
                </div>

                {/* 档案文字区 */}
                <div className="flex-1 px-8 py-6 flex flex-col justify-center max-w-md">
                    {/* 姓名与标题 */}
                    <div className="mb-6 border-b border-[rgba(212,165,32,0.25)] pb-4 relative">
                        <h1 className="text-[56px] leading-none font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#f6e4c3] to-[#D4AF65] tracking-widest drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                            {getCharName(selectedChar)}
                        </h1>
                        <div className="mt-2 flex items-center gap-3">
                            <span className="text-sm text-[rgba(167,197,186,0.6)] font-serif tracking-[0.3em]">
                                {getCharSchool(selectedChar)}
                            </span>
                        </div>
                        <div className="absolute -bottom-[2px] left-0 w-24 h-[3px] bg-[#D4AF65] shadow-[0_0_12px_#D4AF65]" />
                    </div>

                    {/* 引言 */}
                    <div className="relative mb-8">
                        <div className="absolute -left-8 -top-8 text-[120px] leading-none text-[#D4AF65]/10 font-serif select-none pointer-events-none">"</div>
                        <p className="text-[#f6e4c3] text-xl font-serif italic tracking-widest leading-relaxed relative z-10 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                            {getCharQuote(selectedChar)}
                        </p>
                    </div>

                    {/* 生平 */}
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-2 h-2 rotate-45 bg-[#D4AF65]" />
                            <h3 className="text-[#D4AF65] text-base tracking-[0.3em] font-serif">
                                {t('生平列传', 'Biography')}
                            </h3>
                            <div className="flex-1 h-px bg-gradient-to-r from-[rgba(212,165,32,0.3)] to-transparent" />
                        </div>
                        <p className="text-[#e7e1f0] leading-[2] text-base font-serif text-justify drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                            {getCharDesc(selectedChar)}
                        </p>
                    </div>

                    {/* 战斗风格 */}
                    <div className="bg-black/40 backdrop-blur-md border border-[rgba(139,69,19,0.3)] p-5 rounded-lg relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#831843] shadow-[0_0_15px_#831843]" />
                        <h3 className="text-[#D4AF65] text-xs tracking-[0.25em] mb-2 font-serif uppercase opacity-70">
                            {t('辩斗风格', 'Combat Style')}
                        </h3>
                        <p className="text-[#f6e4c3] text-base font-serif tracking-wide leading-relaxed">
                            {getCharPlaystyle(selectedChar)}
                        </p>
                    </div>
                </div>
            </div>

            {/* 返回按钮 */}
            <button
                onClick={() => { uiAudio.playClick(); onBack(); }}
                onMouseEnter={() => uiAudio.playHover()}
                className="absolute top-6 left-6 z-50 flex items-center gap-3 text-[#D4AF65] hover:text-[#f6e4c3] transition-colors group"
            >
                <div className="w-10 h-10 rounded-full border border-[rgba(212,165,32,0.5)] flex items-center justify-center group-hover:bg-[rgba(212,165,32,0.1)] transition-colors">
                    <span className="text-xl transform -translate-x-0.5">❮</span>
                </div>
                <div>
                    <span className="font-serif tracking-widest text-lg drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{t('归曲', 'Return')}</span>
                    <span className="text-[10px] text-[#e7e1f0]/40 block tracking-widest uppercase">{language === 'zh' ? 'Return' : '返回'}</span>
                </div>
            </button>

            <style>{`
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(26, 10, 10, 0.4);
            border-left: 1px solid rgba(212, 165, 32, 0.15);
            border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #8b5a2b, #D4AF65, #8b5a2b);
            border: 1px solid #0a0e14;
            border-radius: 4px;
            box-shadow: inset 0 0 2px rgba(255,255,255,0.4);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #a06b35, #f6e4c3, #a06b35);
        }
      `}</style>
        </div>
    );
}