import { useMemo, useState } from 'react';
import type { GameState } from '@/core/types';
import { getBattlePhaseLabel } from '@/core/phaseMachine';
import { HandBar } from '@/ui/components/HandBar';
import { IssueBar } from '@/ui/components/IssueBar';
import { SlotView } from '@/ui/components/SlotView';

interface BattleScreenProps {
  state: GameState;
  onPlayToMain: (cardUid: string) => void;
  onPlayToSide: (cardUid: string) => void;
  onResolveRound: () => void;
}

export function BattleScreen({ state, onPlayToMain, onPlayToSide, onResolveRound }: BattleScreenProps) {
  const [selectedCardUid, setSelectedCardUid] = useState<string | null>(null);
  const me = state.players.player;
  const enemy = state.players.enemy;
  const selectedCard = useMemo(
    () => me.hand.find((card) => card.uid === selectedCardUid) ?? null,
    [me.hand, selectedCardUid],
  );

  const canSubmit = state.battle.phase === 'hidden_submit' && state.activePlayerId === 'player';

  return (
    <div className="grid h-full grid-cols-[1.2fr_0.9fr] gap-3 bg-[#1b0c0a] p-3 text-[#f8e6be]">
      <div className="space-y-3">
        <IssueBar issueState={state.issueState} />
        <div className="grid grid-cols-2 gap-3">
          <SlotView title="对手主议" cards={enemy.board.mainQueue} maxSlots={state.battle.maxCardsPerZone} />
          <SlotView title="对手旁议" cards={enemy.board.sideQueue} maxSlots={state.battle.maxCardsPerZone} />
          <SlotView title="我方主议" cards={me.board.mainQueue} maxSlots={state.battle.maxCardsPerZone} />
          <SlotView title="我方旁议" cards={me.board.sideQueue} maxSlots={state.battle.maxCardsPerZone} />
        </div>
        <HandBar cards={me.hand} selectedCardUid={selectedCardUid} onSelectCard={setSelectedCardUid} />
      </div>
      <div className="rounded-lg border border-[#8a5a34] bg-[#2b120e] p-3">
        <div className="text-sm text-[#d1b185]">回合 {state.round}</div>
        <div className="mt-1 text-sm text-[#d1b185]">当前行动：{state.activePlayerId === 'player' ? '我方' : '对手'}</div>
        <div className="mt-1 text-sm text-[#d1b185]">阶段：{getBattlePhaseLabel(state.battle.phase)}</div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded border border-[#8a5a34] p-2">我方大势：{me.momentum}</div>
          <div className="rounded border border-[#8a5a34] p-2">对手大势：{enemy.momentum}</div>
          <div className="rounded border border-[#8a5a34] p-2">我方用度：{me.mana}/{me.maxMana}</div>
          <div className="rounded border border-[#8a5a34] p-2">对手用度：{enemy.mana}/{enemy.maxMana}</div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2">
          <button
            type="button"
            className="rounded border border-[#d29648] bg-[#7a2f1d] px-3 py-2 text-sm disabled:opacity-40"
            disabled={!selectedCard || !canSubmit}
            onClick={() => selectedCard && onPlayToMain(selectedCard.uid)}
          >
            暗辩提交到主议
          </button>
          <button
            type="button"
            className="rounded border border-[#d29648] bg-[#7a2f1d] px-3 py-2 text-sm disabled:opacity-40"
            disabled={!selectedCard || !canSubmit}
            onClick={() => selectedCard && onPlayToSide(selectedCard.uid)}
          >
            暗辩提交到旁议
          </button>
          <button
            type="button"
            className="rounded border border-[#d29648] bg-[#4b1d18] px-3 py-2 text-sm"
            onClick={onResolveRound}
          >
            锁定并结算本轮
          </button>
        </div>

        <div className="mt-4 max-h-[240px] overflow-auto rounded border border-[#8a5a34] bg-[#160a08] p-2">
          <div className="mb-2 text-xs text-[#d1b185]">日志</div>
          <div className="space-y-1 text-xs text-[#f0d6ab]">
            {state.battle.logs.slice(-15).map((line, index) => (
              <div key={`${line}_${index}`}>{line}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
