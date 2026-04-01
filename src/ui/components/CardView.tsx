import type { CardInstance } from '@/core/types';

interface CardViewProps {
  card: CardInstance;
  selected?: boolean;
  onClick?: () => void;
}

export function CardView({ card, selected = false, onClick }: CardViewProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-32 rounded-lg border p-2 text-left transition ${
        selected ? 'border-[#d4a520] bg-[#2a2015]' : 'border-[#6b5a40] bg-[#1c1711]'
      }`}
    >
      <div className="text-sm font-semibold text-[#f7ddb0]">{card.name}</div>
      <div className="mt-1 text-xs text-[#bca381]">费用 {card.cost}</div>
      <div className="mt-1 flex justify-between text-xs text-[#d9c2a0]">
        <span>攻 {card.attack}</span>
        <span>血 {card.health}</span>
      </div>
    </button>
  );
}

