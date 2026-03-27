import { CARDS, rarityColor, typeColor } from '@/data/showcaseCards';
import { uiAudio } from '@/utils/audioManager';

interface CardGridProps {
    onBack: () => void;
    onSelectCard: (index: number) => void;
}

// 使用 .png 格式的卡牌ID列表
const PNG_CARDS = ['xingpan', 'liangyi'];

// 获取卡牌图片URL，自动处理不同格式
function getCardImageUrl(cardId: string): string {
    const ext = PNG_CARDS.includes(cardId) ? 'png' : 'jpg';
    return `assets/cards/${cardId}.${ext}`;
}

export function CardGrid({ onBack, onSelectCard }: CardGridProps) {
    return (
        <div className="w-full h-full min-h-screen flex flex-col items-center relative overflow-hidden select-none pb-8">
            {/* 书架背景 */}
            <div className="absolute inset-0 z-0" style={{ backgroundImage: `url(assets/bookshelf-bg.png)`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }} />
            {/* 暗色蒙版确保卡牌可读 */}
            <div className="absolute inset-0 z-0 bg-black/60" />
            {/* 背景氛围光 */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#d4a520]/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[rgba(160,60,220,0.1)] rounded-full blur-[120px]" />
            </div>

            {/* 顶部导航 */}
            <div className="w-full flex items-center justify-between p-6 z-50">
                <button
                    onClick={() => { uiAudio.playClick(); onBack(); }}
                    onMouseEnter={() => uiAudio.playHover()}
                    className="px-6 py-2 bg-black/40 border border-[#d4a520]/40 text-[#d4a520] hover:text-[#f5e6b8] hover:bg-black/60 rounded-full transition-all tracking-widest flex items-center gap-2">
                    <span>❮</span>返回主界面
                </button>
                <div className="text-2xl font-bold font-serif text-[#d4a520] tracking-widest drop-shadow-[0_0_8px_rgba(212,165,32,0.6)]">
                    问道百家 · 卡牌图鉴
                </div>
                <div className="w-36 text-right text-[#d4a520]/60 font-serif">
                    共 {CARDS.length} 卷
                </div>
            </div>

            {/* 列表滚动容器 - 按门派分类 */}
            <div className="w-[96%] mx-auto flex-1 custom-scrollbar px-[6%] z-10 pb-12" style={{ overflowY: 'overlay' as any }}>
                {Array.from(new Set(CARDS.map(c => c.faction))).map(faction => {
                    const factionCards = CARDS.filter(c => c.faction === faction);
                    return (
                        <div key={faction} className="mb-10 w-full">
                            {/* 分类标题 */}
                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#d4a520]/30" />
                                <h3 className="text-xl font-serif font-bold text-[#d4a520] tracking-[0.2em]">{faction}</h3>
                                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#d4a520]/30" />
                            </div>

                            {/* 该标签下的卡牌网格 */}
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                                {factionCards.map(c => {
                                    // 找到卡牌在全局 CARDS 数组中的绝对索引，传给 detail view 使用
                                    const globalIndex = CARDS.findIndex(card => card.id === c.id);
                                    return (
                                        <div key={c.id} className="rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.8)] cursor-pointer hover:scale-[1.03] transition-transform duration-300">
                                            <div
                                                onClick={() => { uiAudio.playClick(); onSelectCard(globalIndex); }}
                                                onMouseEnter={() => uiAudio.playHover()}
                                                className="relative aspect-[2/3] rounded-md overflow-hidden group flex flex-col bg-transparent border-0"
                                            >
                                                {/* 背景原画 */}
                                                <div
                                                    className="absolute inset-[4%] bg-cover bg-center opacity-90 group-hover:opacity-100 z-0"
                                                    style={{ backgroundImage: `url(${getCardImageUrl(c.id)})` }}
                                                />

                                                {/* 边框贴图叠加层 */}
                                                <div
                                                    className="absolute inset-0 bg-no-repeat z-10 pointer-events-none drop-shadow-[0_0_4px_rgba(0,0,0,0.5)]"
                                                    style={{ backgroundImage: `url(assets/card-frame.png)`, backgroundSize: '100% 100%', backgroundPosition: 'center' }}
                                                />

                                                {/* 顶部渐变遮罩 (放在原画之上，边框之下或者边框之上视设计而定，这里放在边框之上使文字清晰) */}
                                                <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/70 to-transparent pointer-events-none z-20" />

                                                {/* 费用小图标角标 */}
                                                <div className="absolute top-3 left-3 w-7 h-7 flex items-center justify-center shadow-md rounded-full z-30">
                                                    <img src="assets/cost.png" alt="cost" className="absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
                                                    <span className="relative z-10 text-[13px] font-bold text-[#f5e6b8] leading-none mb-0.5" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>{c.cost}</span>
                                                </div>

                                                {/* 底部文字区域 */}
                                                <div className="absolute bottom-[8px] left-[8px] right-[8px] p-2 pt-8 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col items-center pointer-events-none z-20">
                                                    <h4 className="text-[#f4e8cc] font-serif font-bold text-sm text-center drop-shadow-[0_0_4px_rgba(0,0,0,0.9)] truncate w-full tracking-wider">{c.name}</h4>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <span className="text-[10px] scale-90 px-1 border border-current rounded-sm opacity-90" style={{ color: rarityColor[c.rarity] || '#aaa' }}>{c.rarity}</span>
                                                        <span className="text-[10px] scale-90 px-1 border border-current rounded-sm opacity-90" style={{ color: typeColor[c.type] || '#aaa' }}>{c.type}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            <style>{`
        /* 针对 .custom-scrollbar 容器的自定义滚动条 */
        .custom-scrollbar::-webkit-scrollbar { 
            width: 22px; 
        }
        .custom-scrollbar::-webkit-scrollbar-track { 
            background: transparent; 
            border-radius: 10px;
            margin: 10px 0;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
            /* 使用贴图滑块 - 移除底色 */
            background-image: url('assets/scrollbar-thumb.png');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            
            border-radius: 11px;
            /* 移除可能产生颜色的阴影 */
            box-shadow: none;
            min-height: 100px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
            filter: brightness(1.4) contrast(1.2) drop-shadow(0 0 5px rgba(212,165,32,0.5));
            cursor: pointer;
        }

        /* 隐藏原生滚动条 */
        ::-webkit-scrollbar { width: 0px; background: transparent; }
      `}</style>
        </div>
    );
}
