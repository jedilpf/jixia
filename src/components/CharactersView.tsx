import { useState } from 'react';
import { uiAudio } from '@/utils/audioManager';

const CHARACTERS = [
    {
        id: 'mozi',
        name: '墨翟',
        title: '兼爱非攻',
        school: '墨家 / 玄匠盟',
        quote: '天下皆白，唯我独黑。',
        desc: '墨家学派创始人，天下第一机关大师。主张"兼爱"、"非攻"，以精密的机关术闻名于世，建立墨家机关城对抗暴政。',
        playstyle: '特色：高护甲，构筑机关物进行防守反击。',
        avatar: '⚙️',
        color: '#d4a520'
    },
    {
        id: 'luban',
        name: '公输班',
        title: '霸道机关',
        school: '公输家 / 天工坊',
        quote: '机枢运转之理，即是毁灭之美。',
        desc: '公输家族的传奇宗师，墨翟的宿敌。信奉"霸道机关术"，制造了无数具有毁灭力量的战争机器。',
        playstyle: '特色：极致爆发，牺牲自身耐久换取高额伤害。',
        avatar: '🔥',
        color: '#c0520a'
    },
    {
        id: 'zhuangzi',
        name: '庄周',
        title: '逍遥游梦',
        school: '道家 / 归真观',
        quote: '昔者庄周梦为胡蝶，栩栩然胡蝶也。',
        desc: '道家学说代表人物，崇尚自然无为，神游物外。在稷下学宫中是一位避世修行的神秘存在，传说能以梦境影响现实。',
        playstyle: '特色：虚实转换，灵活抽牌，利用法术进行消耗。',
        avatar: '🦋',
        color: '#4a7c6f'
    },
    {
        id: 'hanfeizi',
        name: '韩非',
        title: '法网恢恢',
        school: '法家 / 衡戒廷',
        quote: '法不阿贵，绳不挠曲。',
        desc: '法家集大成者，主张以法治国。在辩斗中善于利用规则束缚对手，通过严密的算计逐步确立致胜的势。',
        playstyle: '特色：控制场面，限制敌方行动，累积资源压制。',
        avatar: '⚖️',
        color: '#6b4a99'
    },
    {
        id: 'kongqiu',
        name: '孔丘',
        title: '万世师表',
        school: '儒家 / 礼心殿',
        quote: '知其不可而为之。',
        desc: '儒家学说创始人，思想核心为"仁"与"礼"。周游列国，弟子三千，其学说与礼法构成稷下学宫的基石。',
        playstyle: '特色：增益同伴，依循礼法规章强化己方阵地。',
        avatar: '📜',
        color: '#5e8ca8'
    },
    {
        id: 'sunwu',
        name: '孙武',
        title: '兵法之神',
        school: '兵家 / 九阵堂',
        quote: '兵者，诡道也。',
        desc: '兵家至圣，著有《孙子兵法》。精通战阵布置与兵法谋略，善于在瞬息万变的战场中寻得敌方破绽，一击致命。',
        playstyle: '特色：战术多变，强调辩斗频率与攻势调度。',
        avatar: '⚔️',
        color: '#8b2e2e'
    },
    {
        id: 'zouyan',
        name: '邹衍',
        title: '五德终始',
        school: '阴阳家 / 两仪署',
        quote: '深观阴阳消息，而作怪迂之变。',
        desc: '阴阳家创始者，创立"五德终始说"。能敏锐洞察天地阴阳之气，并在战局中运用五行相生相克的力量。',
        playstyle: '特色：五行相生相克，强力元素法术爆发。',
        avatar: '☯️',
        color: '#1a4e63'
    },
    {
        id: 'huishi',
        name: '惠施',
        title: '历物之意',
        school: '名家 / 名相府',
        quote: '泛爱万物，天地一体也。',
        desc: '名家代表人物，极善逻辑与诡辩。提出著名的"历物十事"，其言论常常让对手在论道之中陷入认知混乱。',
        playstyle: '特色：打断节奏，反转敌方卡牌的基础效果。',
        avatar: '🗣️',
        color: '#3d6170'
    },
    {
        id: 'guiguzi',
        name: '鬼谷子',
        title: '纵横捭阖',
        school: '纵横家 / 游策阁',
        quote: '捭阖者，道之大化，说之变也。',
        desc: '纵横捭阖之术的创设者，常年隐居。精通奇门遁甲与揣摩人心，以言辞为利剑，以大势为棋盘拨弄风云。',
        playstyle: '特色：操控人心，弃牌战术，擅长借力打力。',
        avatar: '♟️',
        color: '#45595c'
    },
    {
        id: 'xuxing',
        name: '许行',
        title: '并耕而食',
        school: '农家 / 万农坊',
        quote: '贤者与民并耕而食，饔飧而治。',
        desc: '农家代表学者，主张君民同耕。虽然看似淳朴，但能与苍天厚土共鸣，借助自然万物之力获取无尽生机。',
        playstyle: '特色：资源成长，后期发力，生生不息的回复。',
        avatar: '🌾',
        color: '#8b8a36'
    },
    {
        id: 'gande',
        name: '甘德',
        title: '仰观群星',
        school: '占星家 / 司天台',
        quote: '星躔步度，皆有常轨。',
        desc: '占星家代表人物，精于观测星象。通过观星推演天下大势，擅长从牌库中寻找能够逆转战局的关键。',
        playstyle: '特色：观星、预示、牌序控制。',
        avatar: '✨',
        color: '#1e3a8a'
    },
    {
        id: 'lvbuwei',
        name: '吕不韦',
        title: '奇货可居',
        school: '杂家 / 兼采楼',
        quote: '兼儒墨，合名法，知国体之有此，见王治之无不备。',
        desc: '杂家集大成者，曾编撰《吕氏春秋》。擅长博采众长，将百家学说融为一炉，手段多变且资源丰厚。',
        playstyle: '特色：多类型联动、复制调度、资源置换。',
        avatar: '📜',
        color: '#b45309'
    },
    {
        id: 'bianque',
        name: '扁鹊',
        title: '起死回生',
        school: '医家 / 杏林馆',
        quote: '疾之居腠理也，汤熨之所及也。',
        desc: '医家传说的神医，望闻问切，医术通神。不但能治愈己方伤痛，亦能以毒攻毒、针砭时弊。',
        playstyle: '特色：问脉、祛毒、续命、稳态治疗。',
        avatar: '🌿',
        color: '#15803d'
    },
    {
        id: 'yuchu',
        name: '虞初',
        title: '稗官野史',
        school: '小说家 / 稗言社',
        quote: '街谈巷语，道听途说者之所造也。',
        desc: '小说家之祖，擅长收集民间街谈巷语。能以流言蜚语、离奇故事动摇敌方心智，引发不可预料的事件。',
        playstyle: '特色：传闻渲染、娱乐性随机事件。',
        avatar: '🎭',
        color: '#c026d3'
    },
    {
        id: 'qibo',
        name: '岐伯',
        title: '黄帝之师',
        school: '方技家 / 养真院',
        quote: '上古之人，其知道者，法于阴阳，和于术数。',
        desc: '方技家尊奉的祖师。专注个人内在的修行与固本培元，借由吐纳导引之术提升自身抗压与反击能力。',
        playstyle: '特色：导引轻身、服食避厄、单体修行。',
        avatar: '🏺',
        color: '#0f766e'
    },
    {
        id: 'jingfang',
        name: '京房',
        title: '阴阳卦气',
        school: '术数家 / 筹天阁',
        quote: '八卦分荡，六十四卦成，天地万物之理尽在其中。',
        desc: '术数大家，精通占星卜筮。以算筹定乾坤，其招数往往在数回合后爆发惊人威力，讲究宿命般的布局。',
        playstyle: '特色：卜筮筹算、延迟收益、宿命布局。',
        avatar: '🧮',
        color: '#334155'
    }
];
const SCHOOLS = ['全部', '儒家 / 礼心殿', '法家 / 衡戒廷', '道家 / 归真观', '兵家 / 九阵堂', '墨家 / 玄匠盟', '名家 / 名相府', '占星家 / 司天台', '纵横家 / 游策阁', '农家 / 万农坊', '杂家 / 兼采楼', '公输家 / 天工坊', '阴阳家 / 两仪署', '医家 / 杏林馆', '小说家 / 稗言社', '方技家 / 养真院', '术数家 / 筹天阁'];
// 立绘文件统一命名为 {id}.png，存放在 publicassets/chars/stand/ 目录
// luban 暂无立绘，自动降级显示背景图
const HAS_STAND = new Set(['mozi', 'kongqiu', 'hanfeizi', 'sunwu', 'zouyan', 'xuxing', 'guiguzi', 'huishi', 'zhuangzi']);

export function CharactersView({ onBack }: { onBack: () => void }) {
    const [activeSchool, setActiveSchool] = useState('全部');
    const [schoolsExpanded, setSchoolsExpanded] = useState(false);
    const [selectedCharId, setSelectedCharId] = useState(CHARACTERS[0].id);
    const [bgLoaded, setBgLoaded] = useState(false);
    const [standError, setStandError] = useState(false);

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
        <div className="w-full h-screen overflow-hidden flex relative select-none text-[#f5e6b8]">
            {/* ── 全屏沉浸背景 ── */}
            <div className="absolute inset-0 z-0">
                {/* 背景原图：轻微模糊，保留氛围感 */}
                <img
                    key={`bg-${selectedChar.id}`}
                    src={bgImgSrc}
                    alt=""
                    className="w-full h-full object-cover object-center transition-opacity duration-700"
                    style={{ opacity: bgLoaded ? 1 : 0.6 }}
                    onLoad={() => setBgLoaded(true)}
                />
                {/* 色彩兜底 */}
                <div
                    className="absolute inset-0 transition-colors duration-1000"
                    style={{ backgroundColor: selectedChar.color + '22' }}
                />
                {/* 轻度模糊叠加 - 只模糊不完全遮蔽 */}
                <div
                    className="absolute inset-0"
                    style={{
                        backdropFilter: 'blur(4px)',
                        backgroundColor: 'rgba(26, 10, 10, 0.65)',
                    }}
                />
                {/* 左侧导航遮罩 */}
                <div className="absolute inset-y-0 left-0 w-[32%] bg-[#1a0a0a]/70" />
            </div>

            {/* ── 左侧：百家名录 ── */}
            <div className="relative z-20 w-[30%] h-full bg-gradient-to-r from-black/80 via-black/60 to-transparent flex flex-col border-r border-[#d4a520]/20 shadow-[4px_0_24px_rgba(0,0,0,0.6)]">
                {/* 顶部标题区修饰 */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#1a1107]/90 to-transparent pointer-events-none" />

                <div className="pt-24 pb-6 px-8 flex-shrink-0 relative z-10">
                    <div className="flex justify-between items-end mb-6 relative">
                        {/* 标题前缀小印章装饰 */}
                        <div className="absolute -left-4 top-2 w-2 h-8 bg-[#8b2e2e] opacity-80" />
                        <h2 className="text-[#f5e6b8] text-4xl font-serif tracking-[0.2em] font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">诸子百家</h2>
                        <button
                            onClick={() => { uiAudio.playClick(); setSchoolsExpanded(!schoolsExpanded); }}
                            onMouseEnter={() => uiAudio.playHover()}
                            className="text-[#d4a520] hover:text-[#f5e6b8] text-xs font-serif tracking-widest px-3 py-1.5 rounded-sm bg-[#1a1107]/60 border border-[#d4a520]/20 hover:border-[#d4a520]/60 hover:bg-[#d4a520]/10 transition-all mb-1 shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                        >
                            {schoolsExpanded ? '收起名录 ∧' : '展卷 ∨'}
                        </button>
                    </div>
                    <div className={`flex flex-wrap gap-2.5 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${schoolsExpanded ? 'max-h-[600px] opacity-100' : 'max-h-[82px] opacity-90'}`}>
                        {SCHOOLS.map(school => {
                            const isSelected = activeSchool === school;
                            return (
                                <button
                                    key={school}
                                    onClick={() => { uiAudio.playClick(); setActiveSchool(school); }}
                                    onMouseEnter={() => uiAudio.playHover()}
                                    className={`relative px-4 py-2 text-sm font-serif tracking-widest transition-all duration-300 overflow-hidden group ${isSelected
                                        ? 'text-[#1a1107] font-bold shadow-[0_2px_10px_rgba(212,165,32,0.4)]'
                                        : 'text-[#d4a520]/80 hover:text-[#f5e6b8]'
                                        }`}
                                >
                                    {/* 背景竹简材质模拟 */}
                                    <div className={`absolute inset-0 transition-opacity duration-300 ${isSelected ? 'bg-gradient-to-b from-[#f5e6b8] to-[#d4a520] opacity-100' : 'bg-[#1a1107]/60 border border-[#d4a520]/20 group-hover:bg-[#d4a520]/20'}`} />
                                    {/* 选中时的两侧细纹 */}
                                    {isSelected && (
                                        <>
                                            <div className="absolute top-1 bottom-1 left-1 w-px bg-black/20" />
                                            <div className="absolute top-1 bottom-1 right-1 w-px bg-black/20" />
                                        </>
                                    )}
                                    <span className="relative z-10">{school.split(' / ')[0]}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 复杂古典回字纹/云纹分割带 */}
                <div className="relative mx-4 mt-3 mb-2 h-4 flex items-center justify-center shrink-0 opacity-80" style={{ pointerEvents: 'none' }}>
                    {/* 上下金线 */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4a520]/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4a520]/60 to-transparent" />

                    {/* SVG 传统回字纹 repeating pattern */}
                    <div className="w-full h-full opacity-60" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2,2 L14,2 L14,14 L2,14 Z M4,4 L12,4 L12,12 L4,12 Z' fill='none' stroke='%238b2e2e' stroke-width='0.5'/%3E%3Cpath d='M8,0 L8,16 M0,8 L16,8' stroke='%23d4a520' stroke-width='0.5' stroke-dasharray='1,2'/%3E%3C/svg%3E")`,
                        backgroundSize: '16px 16px',
                        backgroundRepeat: 'repeat-x',
                        backgroundPosition: 'center',
                        maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
                    }} />
                </div>

                <div className="flex-1 overflow-y-auto px-6 pb-12 pt-4 custom-scrollbar relative z-10 w-full">
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
                                    {/* 底部竹简纹理底板 */}
                                    <div className={`absolute inset-0 border-y transition-all duration-500 rounded-r-3xl ${isActive
                                        ? 'bg-gradient-to-r from-[rgba(212,165,32,0.15)] to-transparent border-[#d4a520]/40'
                                        : 'bg-gradient-to-r from-black/40 to-transparent border-transparent group-hover:border-[#d4a520]/10'
                                        }`} />

                                    {/* 右侧花纹封边 (仅激活时显示) */}
                                    <div className={`absolute right-1 top-1 bottom-1 w-6 transition-all duration-700 z-30 flex flex-col items-center justify-between py-1 pointer-events-none ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                                        }`}>
                                        <div className="w-1.5 h-1.5 rotate-45 border border-[#d4a520] bg-[#8b2e2e] shadow-[0_0_6px_#8b2e2e]" />
                                        <div className="flex-1 w-[2px] bg-gradient-to-b from-transparent via-[#8b2e2e]/80 to-transparent my-1" />
                                        <div className="w-1.5 h-1.5 rotate-45 border border-[#d4a520] bg-[#8b2e2e] shadow-[0_0_6px_#8b2e2e]" />
                                    </div>

                                    {/* 选中指示器：左侧朱砂竖线 */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-500 ${isActive ? 'bg-[#8b2e2e] shadow-[0_0_12px_#8b2e2e]' : 'bg-transparent'
                                        }`} />

                                    {/* 头像圆圈（玉佩/铜镜感） */}
                                    <div className={`relative w-14 h-14 rounded-full flex items-center justify-center text-2xl mr-4 flex-shrink-0 transition-all duration-500 z-10 ${isActive
                                        ? 'bg-[#1a1107] border border-[#d4a520] shadow-[0_0_15px_rgba(212,165,32,0.4)]'
                                        : 'bg-black/60 border border-[#d4a520]/20 group-hover:border-[#d4a520]/50'
                                        }`}>
                                        <span className="relative z-10 transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{char.avatar}</span>
                                        {/* 内圈细线 */}
                                        <div className="absolute inset-[3px] rounded-full border border-[rgba(212,165,32,0.1)] pointer-events-none" />
                                    </div>

                                    <div className="relative z-10 flex-1">
                                        <div className={`text-2xl font-serif tracking-[0.15em] mb-1 transition-colors duration-300 ${isActive ? 'text-[#f5e6b8] font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' : 'text-[#d4a520]/80 group-hover:text-[#f5e6b8]'
                                            }`}>
                                            {char.name}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] px-1.5 py-0.5 border rounded-sm font-serif tracking-widest ${isActive ? 'text-[#d4a520] border-[#d4a520]/40 bg-[#d4a520]/10' : 'text-[#8B7355]/60 border-[#8B7355]/20'
                                                }`}>
                                                {char.school.split(' / ')[1] || char.school}
                                            </span>
                                            <span className="text-xs text-[rgba(212,165,32,0.5)] font-serif tracking-wider">
                                                · {char.title}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 右侧渐变遮罩虚化 */}
                                    <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#1a0a0a] to-transparent pointer-events-none z-20" />
                                </button>
                            );
                        })}
                        {filteredChars.length === 0 && (
                            <div className="text-center text-[rgba(212,165,32,0.4)] py-12 font-serif text-lg tracking-widest">
                                此学派暂无收录人物
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── 右侧：展示区 ── */}
            <div className="relative z-10 flex-1 h-full flex items-center">
                {/* 立绘展示框 */}
                <div className="relative ml-12 flex-shrink-0 flex flex-col items-center" style={{ width: 380 }}>
                    {/* 外层机械边框 */}
                    <div className="relative w-full">
                        {/* 四角装饰 */}
                        <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-[#d4a520] pointer-events-none z-20" />
                        <div className="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-[#d4a520] pointer-events-none z-20" />
                        <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-[#d4a520] pointer-events-none z-20" />
                        <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-[#d4a520] pointer-events-none z-20" />
                        <div className="absolute -inset-1 border border-[rgba(212,165,32,0.3)] pointer-events-none z-20" />

                        {/* 立绘图片 - 固定尺寸容器 */}
                        <div className="w-full overflow-hidden relative group" style={{ height: 520 }}>
                            {standImgSrc && !standError ? (
                                <img
                                    key={`stand-${selectedChar.id}`}
                                    src={standImgSrc}
                                    alt={selectedChar.name}
                                    className="w-full h-full object-contain object-bottom transition-all duration-700 group-hover:scale-105 block"
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
                    <div className="mt-4 px-10 py-2 border border-[#d4a520] bg-[rgba(26,10,10,0.85)] shadow-[0_4px_20px_rgba(0,0,0,0.7)]">
                        <div className="text-[#f5e6b8] font-serif text-lg tracking-[0.4em] text-center whitespace-nowrap">
                            {selectedChar.title}
                        </div>
                    </div>
                </div>

                {/* 档案文字区 */}
                <div className="flex-1 px-12 py-8 flex flex-col justify-center max-w-lg">
                    {/* 姓名与标题 */}
                    <div className="mb-8 border-b border-[rgba(212,165,32,0.25)] pb-6 relative">
                        <h1 className="text-[90px] leading-none font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#f5e6b8] to-[#d4a520] tracking-widest drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                            {selectedChar.name}
                        </h1>
                        <div className="mt-2 text-sm text-[rgba(167,197,186,0.6)] font-serif tracking-[0.3em]">
                            {selectedChar.school}
                        </div>
                        <div className="absolute -bottom-[2px] left-0 w-24 h-[3px] bg-[#d4a520] shadow-[0_0_12px_#d4a520]" />
                    </div>

                    {/* 引言 */}
                    <div className="relative mb-8">
                        <div className="absolute -left-8 -top-8 text-[120px] leading-none text-[#d4a520]/10 font-serif select-none pointer-events-none">"</div>
                        <p className="text-[#f5e6b8] text-2xl font-serif italic tracking-widest leading-relaxed relative z-10 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                            {selectedChar.quote}
                        </p>
                    </div>

                    {/* 生平 */}
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-2 h-2 rotate-45 bg-[#d4a520]" />
                            <h3 className="text-[#d4a520] text-base tracking-[0.3em] font-serif">生平列传</h3>
                            <div className="flex-1 h-px bg-gradient-to-r from-[rgba(212,165,32,0.3)] to-transparent" />
                        </div>
                        <p className="text-[#a7c5ba] leading-[2] text-base font-serif text-justify drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                            {selectedChar.desc}
                        </p>
                    </div>

                    {/* 战斗风格 */}
                    <div className="bg-black/40 backdrop-blur-md border border-[rgba(139,69,19,0.3)] p-5 rounded-lg relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#8b2e2e] shadow-[0_0_15px_#8b2e2e]" />
                        <h3 className="text-[#d4a520] text-xs tracking-[0.25em] mb-2 font-serif uppercase opacity-70">辩斗风格 · Combat Style</h3>
                        <p className="text-[#f5e6b8] text-base font-serif tracking-wide leading-relaxed">
                            {selectedChar.playstyle}
                        </p>
                    </div>
                </div>
            </div>

            {/* 返回按钮 */}
            <button
                onClick={() => { uiAudio.playClick(); onBack(); }}
                onMouseEnter={() => uiAudio.playHover()}
                className="absolute top-6 left-6 z-50 flex items-center gap-3 text-[#d4a520] hover:text-[#f5e6b8] transition-colors group"
            >
                <div className="w-10 h-10 rounded-full border border-[rgba(212,165,32,0.5)] flex items-center justify-center group-hover:bg-[rgba(212,165,32,0.1)] transition-colors">
                    <span className="text-xl transform -translate-x-0.5">❮</span>
                </div>
                <span className="font-serif tracking-widest text-lg drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">归曲</span>
            </button>

            <style>{`
        /* 全新仿古书简挂轴样式的定制滚动条 */
        .custom-scrollbar::-webkit-scrollbar { 
            width: 8px; 
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(26, 10, 10, 0.4);
            border-left: 1px solid rgba(212, 165, 32, 0.15);
            border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
            background: linear-gradient(to bottom, #8b5a2b, #d4a520, #8b5a2b); 
            border: 1px solid #1a1107;
            border-radius: 4px; 
            box-shadow: inset 0 0 2px rgba(255,255,255,0.4);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
            background: linear-gradient(to bottom, #a06b35, #f5e6b8, #a06b35); 
        }
      `}</style>
        </div>
    );
}
