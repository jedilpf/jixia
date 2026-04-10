import { getCardTierLabel } from '@/battleV2/tierSystem';
import { CARDS, rarityColor, typeColor } from '@/data/cardsSource';
import { uiAudio } from '@/utils/audioManager';
import { getAssetUrl, getCardImageUrl } from '@/utils/assets';

interface CardGridProps {
  onBack: () => void;
  onSelectCard: (index: number) => void;
}

export function CardGrid({ onBack, onSelectCard }: CardGridProps) {
  return (
    <div className="w-full h-full min-h-screen flex flex-col items-center relative overflow-hidden select-none pb-8">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${getAssetUrl('assets/bookshelf-bg.png')})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      />
      <div className="absolute inset-0 z-0 bg-black/60" />
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#d4a520]/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[rgba(160,60,220,0.1)] rounded-full blur-[120px]" />
      </div>

      <div className="w-full flex items-center justify-between p-6 z-50">
        <button
          onClick={() => {
            uiAudio.playClick();
            onBack();
          }}
          onMouseEnter={() => uiAudio.playHover()}
          className="px-6 py-2 bg-black/40 border border-[#d4a520]/40 text-[#d4a520] hover:text-[#f5e6b8] hover:bg-black/60 rounded-full transition-all tracking-widest flex items-center gap-2"
        >
          <span>❮</span>
          返回主界面
        </button>
        <div className="text-2xl font-bold font-serif text-[#d4a520] tracking-widest drop-shadow-[0_0_8px_rgba(212,165,32,0.6)]">
          问道百家 · 卡牌图鉴
        </div>
        <div className="w-36 text-right text-[#d4a520]/60 font-serif">共 {CARDS.length} 卷</div>
      </div>

      <div className="w-[96%] mx-auto flex-1 custom-scrollbar px-[6%] z-10 pb-12" style={{ overflowY: 'auto' }}>
        {Array.from(new Set(CARDS.map((card) => card.faction))).map((faction) => {
          const factionCards = CARDS.filter((card) => card.faction === faction);
          return (
            <div key={faction} className="mb-10 w-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#d4a520]/30" />
                <h3 className="text-xl font-serif font-bold text-[#d4a520] tracking-[0.2em]">{faction}</h3>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#d4a520]/30" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {factionCards.map((card) => {
                  const globalIndex = CARDS.findIndex((entry) => entry.id === card.id);
                  const tierLabel = getCardTierLabel(card);

                  return (
                    <div
                      key={card.id}
                      className="rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.8)] cursor-pointer hover:scale-[1.03] transition-transform duration-300"
                    >
                      <div
                        onClick={() => {
                          uiAudio.playClick();
                          onSelectCard(globalIndex);
                        }}
                        onMouseEnter={() => uiAudio.playHover()}
                        className="relative aspect-[2/3] rounded-md overflow-hidden group flex flex-col bg-transparent border-0"
                      >
                        <div
                          className="absolute inset-[4%] bg-cover bg-center opacity-90 group-hover:opacity-100 z-0"
                          style={{ backgroundImage: `url(${getCardImageUrl(card.id, card.name)})` }}
                        />

                        <div
                          className="absolute inset-0 bg-no-repeat z-10 pointer-events-none drop-shadow-[0_0_4px_rgba(0,0,0,0.5)]"
                          style={{
                            backgroundImage: `url(${getAssetUrl('assets/card-frame.png')})`,
                            backgroundSize: '100% 100%',
                            backgroundPosition: 'center',
                          }}
                        />

                        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/70 to-transparent pointer-events-none z-20" />

                        <div className="absolute top-2.5 left-2.5 w-10 h-10 flex items-center justify-center shadow-md rounded-full z-30">
                          <img
                            src={getAssetUrl('assets/cost.png')}
                            alt="tier"
                            className="absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                          />
                          <span
                            className="relative z-10 text-[9px] font-bold text-[#f5e6b8] leading-tight tracking-[0.08em] text-center"
                            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
                          >
                            {tierLabel}
                          </span>
                        </div>

                        <div className="absolute bottom-[8px] left-[8px] right-[8px] p-2 pt-8 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col items-center pointer-events-none z-20">
                          <h4 className="text-[#f4e8cc] font-serif font-bold text-sm text-center drop-shadow-[0_0_4px_rgba(0,0,0,0.9)] truncate w-full tracking-wider">
                            {card.name}
                          </h4>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-[10px] scale-90 px-1 border border-[#d4a520]/60 text-[#f5e6b8] rounded-sm opacity-90">
                              {card.cost}费
                            </span>
                            <span
                              className="text-[10px] scale-90 px-1 border border-current rounded-sm opacity-90"
                              style={{ color: rarityColor[card.rarity] || '#aaa' }}
                            >
                              {card.rarity}
                            </span>
                            <span
                              className="text-[10px] scale-90 px-1 border border-current rounded-sm opacity-90"
                              style={{ color: typeColor[card.type] || '#aaa' }}
                            >
                              {card.type}
                            </span>
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
        .custom-scrollbar::-webkit-scrollbar {
          width: 22px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 10px;
          margin: 10px 0;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-image: url('assets/scrollbar-thumb.png');
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
        ::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
      `}</style>
    </div>
  );
}
