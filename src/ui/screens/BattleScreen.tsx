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
    <div className="grid h-full grid-cols-[1.2fr_0.9fr] gap-3 bg-[#0f0d0a] p-3 text-[#f3debc]">
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
      <div className="rounded-lg border border-[#5f523e] bg-[#16120d] p-3">
        <div className="text-sm text-[#bfa680]">回合 {state.round}</div>
        <div className="mt-1 text-sm text-[#bfa680]">当前行动：{state.activePlayerId === 'player' ? '我方' : '对手'}</div>
        <div className="mt-1 text-sm text-[#bfa680]">阶段：{getBattlePhaseLabel(state.battle.phase)}</div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded border border-[#5f523e] p-2">我方大势：{me.momentum}</div>
          <div className="rounded border border-[#5f523e] p-2">对手大势：{enemy.momentum}</div>
          <div className="rounded border border-[#5f523e] p-2">我方用度：{me.mana}/{me.maxMana}</div>
          <div className="rounded border border-[#5f523e] p-2">对手用度：{enemy.mana}/{enemy.maxMana}</div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2">
          <button
            type="button"
            className="rounded border border-[#8b6b3f] bg-[#3b2b16] px-3 py-2 text-sm disabled:opacity-40"
            disabled={!selectedCard || !canSubmit}
            onClick={() => selectedCard && onPlayToMain(selectedCard.uid)}
          >
            暗辩提交到主议
          </button>
          <button
            type="button"
            className="rounded border border-[#8b6b3f] bg-[#3b2b16] px-3 py-2 text-sm disabled:opacity-40"
            disabled={!selectedCard || !canSubmit}
            onClick={() => selectedCard && onPlayToSide(selectedCard.uid)}
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

        <div className="mt-4 max-h-[240px] overflow-auto rounded border border-[#5f523e] bg-[#12100d] p-2">
          <div className="mb-2 text-xs text-[#a88d66]">日志</div>
          <div className="space-y-1 text-xs text-[#c9b28d]">
            {state.battle.logs.slice(-15).map((line, index) => (
              <div key={`${line}_${index}`}>{line}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
