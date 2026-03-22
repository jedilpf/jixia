import type { CardInstance } from '@/core/types';

interface LocalBattleActionBarProps {
  selectedCard: CardInstance | null;
  canSubmit: boolean;
  onPlayToMain: () => void;
  onPlayToSide: () => void;
  onResolveRound: () => void;
}

export function LocalBattleActionBar({
  selectedCard,
  canSubmit,
  onPlayToMain,
  onPlayToSide,
  onResolveRound,
}: LocalBattleActionBarProps) {
  return (
    <div className="mt-3 grid grid-cols-1 gap-2">
      <button
        type="button"
        className="rounded border border-[#8b6b3f] bg-[#3b2b16] px-3 py-2 text-sm disabled:opacity-40"
        disabled={!selectedCard || !canSubmit}
        onClick={onPlayToMain}
      >
        暗辩提交到主议
      </button>
      <button
        type="button"
        className="rounded border border-[#8b6b3f] bg-[#3b2b16] px-3 py-2 text-sm disabled:opacity-40"
        disabled={!selectedCard || !canSubmit}
        onClick={onPlayToSide}
      >
        暗辩提交到旁议
      </button>
      <button
        type="button"
        className="rounded border border-[#4f6c89] bg-[#1d2e40] px-3 py-2 text-sm"
        onClick={onResolveRound}
      >
        锁定并结算本轮
      </button>
    </div>
  );
}
