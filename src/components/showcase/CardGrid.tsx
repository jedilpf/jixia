import { useMemo, useState } from 'react';
import { ACTIVE_CARDS, CARDS, getCardImageUrl, rarityColor, typeColor, type CardData } from '@/data/cardsSource';
import { uiAudio } from '@/utils/audioManager';
import { getAssetUrl } from '@/utils/assets';

interface CardGridProps {
    onBack: () => void;
    onSelectCard: (index: number) => void;
}

type VisibilityFilter = 'all' | 'active' | 'locked';
type CatalogCard = CardData & { catalogOrder: number; displayFaction: string };

const STATUS_LABEL: Record<CardData['status'], string> = {
    active: '已开放',
    planned: '未开放',
    draft: '策划中',
    rework: '重做中',
    archived: '归档',
};

const FACTION_DISPLAY_MAP: Record<string, string> = {
    礼心殿: '儒家',
    玄匠盟: '墨家',
};

const FACTION_ORDER: string[] = [
    '儒家',
    '墨家',
    '衡戒廷',
    '归真观',
    '九阵堂',
    '名相府',
    '司天台',
    '游策阁',
    '万农坊',
    '兼采楼',
    '天工坊',
    '两仪署',
    '杏林馆',
    '稗言社',
    '养真院',
    '筹天阁',
    '通用',
];

function toDisplayFaction(rawFaction: string): string {
    return FACTION_DISPLAY_MAP[rawFaction] ?? rawFaction;
}

function lockLabel(status: CardData['status']): string {
    return STATUS_LABEL[status] ?? '未开放';
}

function matchVisibility(card: CardData, filter: VisibilityFilter): boolean {
    if (filter === 'active') return card.status === 'active';
    if (filter === 'locked') return card.status !== 'active';
    return true;
}

function orderFactions(factions: string[]): string[] {
    const rank = new Map<string, number>(FACTION_ORDER.map((name, index) => [name, index]));
    return [...factions].sort((a, b) => {
        const ai = rank.has(a) ? rank.get(a)! : Number.MAX_SAFE_INTEGER;
        const bi = rank.has(b) ? rank.get(b)! : Number.MAX_SAFE_INTEGER;
        if (ai !== bi) return ai - bi;
        return a.localeCompare(b);
    });
}

export function CardGrid({ onBack, onSelectCard }: CardGridProps) {
    const catalogCards = useMemo<CatalogCard[]>(
        () => CARDS
            .filter((card) => card.status !== 'archived')
            .map((card, index) => ({
                ...card,
                catalogOrder: index,
                displayFaction: toDisplayFaction(card.faction),
            })),
        []
    );

    const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('active');
    const [factionFilter, setFactionFilter] = useState('全部');

    const availableFactions = useMemo(
        () => orderFactions(Array.from(new Set(catalogCards.map((card) => card.displayFaction)))),
        [catalogCards]
    );

    const factionOptions = useMemo(
        () => ['全部', ...availableFactions],
        [availableFactions]
    );

    const visibleCards = useMemo(
        () => catalogCards
            .filter((card) => matchVisibility(card, visibilityFilter))
            .filter((card) => factionFilter === '全部' ? true : card.displayFaction === factionFilter),
        [catalogCards, visibilityFilter, factionFilter]
    );

    const visibleFactions = useMemo(
        () => orderFactions(Array.from(new Set(visibleCards.map((card) => card.displayFaction)))),
        [visibleCards]
    );

    const bookshelfBg = getAssetUrl('assets/bookshelf-bg.png');
    const cardFrame = getAssetUrl('assets/card-frame.png');
    const costIcon = getAssetUrl('assets/cost.png');
    const scrollbarThumb = getAssetUrl('assets/scrollbar-thumb.png');

    return (
        <div className="w-full h-full min-h-screen flex flex-col items-center relative overflow-hidden select-none pb-8">
            <div className="absolute inset-0 z-0" style={{ backgroundImage: `url(${bookshelfBg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }} />
            <div className="absolute inset-0 z-0 bg-black/60" />
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#d4a520]/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[rgba(160,60,220,0.1)] rounded-full blur-[120px]" />
            </div>

            <div className="w-full flex items-center justify-between p-6 z-50">
                <button
                    onClick={() => { uiAudio.playClick(); onBack(); }}
                    onMouseEnter={() => uiAudio.playHover()}
                    className="px-6 py-2 bg-black/40 border border-[#d4a520]/40 text-[#d4a520] hover:text-[#f5e6b8] hover:bg-black/60 rounded-full transition-all tracking-widest flex items-center gap-2"
                >
                    <span>❮</span>返回主界面
                </button>
                <div className="text-2xl font-bold font-serif text-[#d4a520] tracking-widest drop-shadow-[0_0_8px_rgba(212,165,32,0.6)]">
                    问道百家 · 卡牌图鉴
                </div>
                <div className="w-52 text-right text-[#d4a520]/70 font-serif text-sm">
                    已开放 {ACTIVE_CARDS.length} / 总计 {catalogCards.length}
                </div>
            </div>

            <div className="w-[96%] px-[6%] z-20 flex flex-wrap items-center gap-3 pb-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setVisibilityFilter('all')}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-all ${visibilityFilter === 'all' ? 'bg-[#d4a520] text-[#1a1107] border-[#f5e6b8]' : 'bg-black/40 text-[#d4a520] border-[#d4a520]/40 hover:bg-black/60'}`}
                    >
                        全部
                    </button>
                    <button
                        onClick={() => setVisibilityFilter('active')}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-all ${visibilityFilter === 'active' ? 'bg-[#d4a520] text-[#1a1107] border-[#f5e6b8]' : 'bg-black/40 text-[#d4a520] border-[#d4a520]/40 hover:bg-black/60'}`}
                    >
                        当前可玩
                    </button>
                    <button
                        onClick={() => setVisibilityFilter('locked')}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-all ${visibilityFilter === 'locked' ? 'bg-[#d4a520] text-[#1a1107] border-[#f5e6b8]' : 'bg-black/40 text-[#d4a520] border-[#d4a520]/40 hover:bg-black/60'}`}
                    >
                        未开放
                    </button>
                </div>

                <div className="ml-auto flex items-center gap-2">
                    <span className="text-[#d4a520]/80 text-sm">门派：</span>
                    <select
                        value={factionFilter}
                        onChange={(e) => setFactionFilter(e.target.value)}
                        className="bg-black/50 border border-[#d4a520]/40 text-[#f5e6b8] rounded px-3 py-1.5 text-sm"
                    >
                        {factionOptions.map((faction) => (
                            <option key={faction} value={faction}>{faction}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="w-[96%] mx-auto flex-1 custom-scrollbar px-[6%] z-10 pb-12" style={{ overflowY: 'overlay' as any }}>
                {visibleFactions.length === 0 ? (
                    <div className="text-center text-[#f5e6b8]/80 py-16">当前筛选下没有卡牌</div>
                ) : (
                    visibleFactions.map((faction) => {
                        const factionCards = visibleCards
                            .filter((card) => card.displayFaction === faction)
                            .sort((a, b) => a.catalogOrder - b.catalogOrder);

                        return (
                            <div key={faction} className="mb-10 w-full">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#d4a520]/30" />
                                    <h3 className="text-xl font-serif font-bold text-[#d4a520] tracking-[0.2em]">{faction}</h3>
                                    <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#d4a520]/30" />
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                                    {factionCards.map((card) => {
                                        const isActive = card.status === 'active';
                                        const activeIndex = ACTIVE_CARDS.findIndex((item) => item.id === card.id);
                                        const canOpen = isActive && activeIndex >= 0;

                                        return (
                                            <div key={card.id} className={`rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.8)] transition-transform duration-300 ${canOpen ? 'cursor-pointer hover:scale-[1.03]' : 'cursor-not-allowed'}`}>
                                                <div
                                                    onClick={() => {
                                                        if (!canOpen) return;
                                                        uiAudio.playClick();
                                                        onSelectCard(activeIndex);
                                                    }}
                                                    onMouseEnter={() => {
                                                        if (canOpen) uiAudio.playHover();
                                                    }}
                                                    className="relative aspect-[2/3] rounded-md overflow-hidden group flex flex-col bg-transparent border-0"
                                                >
                                                    <div
                                                        className="absolute inset-[4%] bg-cover bg-center z-0 transition-all"
                                                        style={{
                                                            backgroundImage: `url(${getCardImageUrl(card.id, card.name)})`,
                                                            opacity: canOpen ? 0.95 : 0.55,
                                                            filter: canOpen ? 'none' : 'grayscale(1)',
                                                        }}
                                                    />

                                                    <div
                                                        className="absolute inset-0 bg-no-repeat z-10 pointer-events-none drop-shadow-[0_0_4px_rgba(0,0,0,0.5)]"
                                                        style={{ backgroundImage: `url(${cardFrame})`, backgroundSize: '100% 100%', backgroundPosition: 'center' }}
                                                    />

                                                    <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/70 to-transparent pointer-events-none z-20" />

                                                    <div className="absolute top-3 left-3 w-7 h-7 flex items-center justify-center shadow-md rounded-full z-30">
                                                        <img src={costIcon} alt="cost" className="absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
                                                        <span className="relative z-10 text-[13px] font-bold text-[#f5e6b8] leading-none mb-0.5" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>{card.cost}</span>
                                                    </div>

                                                    <div className="absolute bottom-[8px] left-[8px] right-[8px] p-2 pt-8 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col items-center pointer-events-none z-20">
                                                        <h4 className="text-[#f4e8cc] font-serif font-bold text-sm text-center drop-shadow-[0_0_4px_rgba(0,0,0,0.9)] truncate w-full tracking-wider">{card.name}</h4>
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <span className="text-[10px] scale-90 px-1 border border-current rounded-sm opacity-90" style={{ color: rarityColor[card.rarity] || '#aaa' }}>{card.rarity}</span>
                                                            <span className="text-[10px] scale-90 px-1 border border-current rounded-sm opacity-90" style={{ color: typeColor[card.type] || '#aaa' }}>{card.type}</span>
                                                        </div>
                                                    </div>

                                                    {!canOpen && (
                                                        <div className="absolute inset-0 z-40 bg-black/55 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                                                            <span className="px-3 py-1.5 rounded-full border border-[#d4a520]/60 bg-black/60 text-[#f5e6b8] text-xs tracking-widest">
                                                                {lockLabel(card.status)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <style>{`
        .custom-scrollbar::-webkit-scrollbar {
            width: 22px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
            border-radius: 10px;
            margin: 10px 0;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background-image: url('${scrollbarThumb}');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            border-radius: 11px;
            box-shadow: none;
            min-height: 100px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            filter: brightness(1.4) contrast(1.2) drop-shadow(0 0 5px rgba(212,165,32,0.5));
            cursor: pointer;
        }
        ::-webkit-scrollbar { width: 0px; background: transparent; }
      `}</style>
        </div>
    );
}
