import type { CardInstance } from '@/core/types';
import { CardView } from '@/ui/components/CardView';

interface HandBarProps {
  cards: CardInstance[];
  selectedCardUid?: string | null;
  onSelectCard?: (cardUid: string) => void;
}

export function HandBar({ cards, selectedCardUid = null, onSelectCard }: HandBarProps) {
  return (
    <div className="rounded-lg border border-[#5f523e] bg-[#16120d] p-3">
      <div className="mb-2 text-sm font-semibold text-[#f1d7a8]">手牌</div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {cards.map((card) => (
          <CardView
            key={card.uid}
            card={card}
            selected={selectedCardUid === card.uid}
            onClick={onSelectCard ? () => onSelectCard(card.uid) : undefined}
          />
        ))}
        {cards.length === 0 ? <div className="text-xs text-[#8f7a5c]">暂无手牌</div> : null}
      </div>
    </div>
  );
}

