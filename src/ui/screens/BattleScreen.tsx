import { useMemo, useState } from 'react';
import type { GameState, PlayerId } from '@/core/types';
import { getBattlePhaseLabel } from '@/core/phaseMachine';
import { CurrentPlayerBanner } from '@/ui/components/CurrentPlayerBanner';
import { HandBar } from '@/ui/components/HandBar';
import { HiddenHandGuard } from '@/ui/components/HiddenHandGuard';
import { IssueBar } from '@/ui/components/IssueBar';
import { LocalBattleActionBar } from '@/ui/components/LocalBattleActionBar';
import { SlotView } from '@/ui/components/SlotView';
import { TurnMaskOverlay } from '@/ui/components/TurnMaskOverlay';

interface BattleScreenProps {
  state: GameState;
  onPlayToMain: (cardUid: string) => void;
  onPlayToSide: (cardUid: string) => void;
  onResolveRound: () => void;
  onConfirmLocalHandover?: () => void;
}

export function BattleScreen({
  state,
  onPlayToMain,
  onPlayToSide,
  onResolveRound,
  onConfirmLocalHandover,
}: BattleScreenProps) {
  const [selectedCardUid, setSelectedCardUid] = useState<string | null>(null);
  const isLocalPvp = state.gameMode === 'local_pvp';

  const visiblePlayerId: PlayerId = isLocalPvp
    ? state.localBattleMeta.handVisibilityOwnerId ?? state.localBattleMeta.currentActingPlayerId
    : 'player';
  const opponentId: PlayerId = visiblePlayerId === 'player' ? 'enemy' : 'player';

  const me = state.players[visiblePlayerId];
  const enemy = state.players[opponentId];
  const selectedCard = useMemo(
    () => me.hand.find((card) => card.uid === selectedCardUid) ?? null,
    [me.hand, selectedCardUid],
  );

  const canSubmit =
    state.battle.phase === 'hidden_submit' &&
    state.activePlayerId === visiblePlayerId &&
    (!isLocalPvp || !state.localBattleMeta.pendingHandover);

  const canSeeHand =
    !isLocalPvp ||
    (state.localBattleMeta.handVisibilityOwnerId === visiblePlayerId &&
      !state.localBattleMeta.pendingHandover);

  const meLabel = isLocalPvp ? (visiblePlayerId === 'player' ? '玩家1' : '玩家2') : '我方';
  const enemyLabel = isLocalPvp ? (opponentId === 'player' ? '玩家1' : '玩家2') : '对手';
  const currentActingLabel = isLocalPvp
    ? state.activePlayerId === 'player'
      ? '玩家1'
      : '玩家2'
    : state.activePlayerId === 'player'
      ? '我方'
      : '对手';

  return (
    <div className="relative grid h-full grid-cols-[1.2fr_0.9fr] gap-3 bg-[#0f0d0a] p-3 text-[#f3debc]">
      <div className="space-y-3">
        {isLocalPvp ? <CurrentPlayerBanner playerLabel={meLabel} round={state.round} /> : null}
        <IssueBar issueState={state.issueState} />
        <div className="grid grid-cols-2 gap-3">
          <SlotView title={`${enemyLabel}主议`} cards={enemy.board.mainQueue} maxSlots={state.battle.maxCardsPerZone} />
          <SlotView title={`${enemyLabel}旁议`} cards={enemy.board.sideQueue} maxSlots={state.battle.maxCardsPerZone} />
          <SlotView title={`${meLabel}主议`} cards={me.board.mainQueue} maxSlots={state.battle.maxCardsPerZone} />
          <SlotView title={`${meLabel}旁议`} cards={me.board.sideQueue} maxSlots={state.battle.maxCardsPerZone} />
        </div>
        {canSeeHand ? (
          <HandBar cards={me.hand} selectedCardUid={selectedCardUid} onSelectCard={setSelectedCardUid} />
        ) : (
          <HiddenHandGuard />
        )}
      </div>
      <div className="rounded-lg border border-[#5f523e] bg-[#16120d] p-3">
        <div className="text-sm text-[#bfa680]">回合 {state.round}</div>
        <div className="mt-1 text-sm text-[#bfa680]">当前行动：{currentActingLabel}</div>
        <div className="mt-1 text-sm text-[#bfa680]">阶段：{getBattlePhaseLabel(state.battle.phase)}</div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded border border-[#5f523e] p-2">{meLabel}大势：{me.momentum}</div>
          <div className="rounded border border-[#5f523e] p-2">{enemyLabel}大势：{enemy.momentum}</div>
          <div className="rounded border border-[#5f523e] p-2">{meLabel}用度：{me.mana}/{me.maxMana}</div>
          <div className="rounded border border-[#5f523e] p-2">{enemyLabel}用度：{enemy.mana}/{enemy.maxMana}</div>
        </div>

        <LocalBattleActionBar
          selectedCard={selectedCard}
          canSubmit={canSubmit}
          onPlayToMain={() => selectedCard && onPlayToMain(selectedCard.uid)}
          onPlayToSide={() => selectedCard && onPlayToSide(selectedCard.uid)}
          onResolveRound={onResolveRound}
        />

        <div className="mt-4 max-h-[240px] overflow-auto rounded border border-[#5f523e] bg-[#12100d] p-2">
          <div className="mb-2 text-xs text-[#a88d66]">日志</div>
          <div className="space-y-1 text-xs text-[#c9b28d]">
            {state.battle.logs.slice(-15).map((line, index) => (
              <div key={`${line}_${index}`}>{line}</div>
            ))}
          </div>
        </div>
      </div>
      {isLocalPvp ? (
        <TurnMaskOverlay
          visible={state.localBattleMeta.pendingHandover}
          playerLabel={state.localBattleMeta.currentActingPlayerId === 'player' ? '玩家1' : '玩家2'}
          onConfirm={onConfirmLocalHandover ?? (() => {})}
        />
      ) : null}
    </div>
  );
}
