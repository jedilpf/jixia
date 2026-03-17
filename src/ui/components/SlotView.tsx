import type { CardInstance } from '@/core/types';
import { CardView } from '@/ui/components/CardView';

interface SlotViewProps {
  title: string;
  cards: CardInstance[];
  maxSlots?: number;
}

export function SlotView({ title, cards, maxSlots = 3 }: SlotViewProps) {
  const placeholders = Math.max(0, maxSlots - cards.length);

  return (
    <div className="rounded-lg border border-[#5f523e] bg-[#16120d] p-2">
      <div className="mb-2 flex items-center justify-between text-xs tracking-wide text-[#cbb28b]">
        <span>{title}</span>
        <span>{cards.length}/{maxSlots}</span>
      </div>
      <div className="flex min-h-[128px] gap-2 overflow-x-auto pb-1">
        {cards.map((card) => (
          <CardView key={card.uid} card={card} />
        ))}
        {Array.from({ length: placeholders }).map((_, index) => (
          <div
            key={`placeholder_${index}`}
            className="flex h-[116px] w-32 shrink-0 items-center justify-center rounded border border-dashed border-[#5f523e] text-xs text-[#8f7a5c]"
          >
            空位
          </div>
        ))}
      </div>
    </div>
  );
}
