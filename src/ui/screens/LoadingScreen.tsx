import { FACTIONS } from '@/data/game/factions';
import { ISSUES } from '@/data/game/issues';
import {
  PRE_BATTLE_BACKGROUND,
  PRE_BATTLE_COLORS,
  getFactionPortrait,
  getIssueArt,
} from '@/ui/screens/visualAssets';

interface LoadingScreenProps {
  playerFactionId: string | null;
  enemyFactionId: string | null;
  issueIds: string[];
  onContinue: () => void;
}

export function LoadingScreen({
  playerFactionId,
  enemyFactionId,
  issueIds,
  onContinue,
}: LoadingScreenProps) {
  const factionMap = new Map(FACTIONS.map((f) => [f.id, f]));
  const issueMap = new Map(ISSUES.map((i) => [i.id, i]));
  const currentIssueId = issueIds[0] ?? '';
  const currentIssue = issueMap.get(currentIssueId);

  return (
    <div
      className="relative flex h-full items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(120deg, rgba(9,6,4,0.9), rgba(31,18,11,0.82)), url(${PRE_BATTLE_BACKGROUND})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(210,150,72,0.18),transparent_44%)]" />

      <div
        className="relative w-[980px] rounded-2xl border-2 border-battle-border p-6"
        style={{ background: PRE_BATTLE_COLORS.panel }}
      >
        <h2 className="text-2xl font-semibold tracking-[0.06em]" style={{ color: PRE_BATTLE_COLORS.textMain }}>战前整备</h2>
        <p className="mt-2 text-sm" style={{ color: PRE_BATTLE_COLORS.textMuted }}>门派立场已确认，中央议题即将进入争夺</p>

        <div className="mt-5 grid grid-cols-[1fr_280px_1fr] gap-4">
          <div className="overflow-hidden rounded-xl border-2 border-battle-border-light" style={{ background: PRE_BATTLE_COLORS.panelSoft }}>
            <img src={getFactionPortrait(playerFactionId)} alt="我方门派" className="h-52 w-full object-cover" />
            <div className="p-3">
              <div className="text-xs" style={{ color: '#d1b185' }}>我方门派</div>
              <div className="mt-1 text-lg" style={{ color: '#f8e6be' }}>{factionMap.get(playerFactionId ?? '')?.name ?? '未选择'}</div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border-2 border-battle-border-light" style={{ background: PRE_BATTLE_COLORS.panelSoft }}>
            <img src={getIssueArt(currentIssueId)} alt="中央议题" className="h-32 w-full object-cover" />
            <div className="p-3">
              <div className="text-xs" style={{ color: '#d1b185' }}>中央议题</div>
              <div className="mt-1 text-sm leading-6" style={{ color: '#f8e6be' }}>{(currentIssue?.name ?? currentIssueId) || '待定'}</div>
              <div className="mt-1 text-xs" style={{ color: '#d1b185' }}>{currentIssue?.seedPrompt ?? ''}</div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border-2 border-battle-border-light" style={{ background: PRE_BATTLE_COLORS.panelSoft }}>
            <img src={getFactionPortrait(enemyFactionId)} alt="对手门派" className="h-52 w-full object-cover" />
            <div className="p-3">
              <div className="text-xs" style={{ color: '#d1b185' }}>对手门派</div>
              <div className="mt-1 text-lg" style={{ color: '#f8e6be' }}>{factionMap.get(enemyFactionId ?? '')?.name ?? '未选择'}</div>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-lg border-2 border-battle-border p-3" style={{ background: 'rgba(40,16,11,0.66)' }}>
          <div className="mb-2 text-xs" style={{ color: '#d1b185' }}>战前推进</div>
          <div className="h-2 overflow-hidden rounded bg-[#2a120d]">
            <div className="h-full animate-pulse rounded bg-[#d46b42]" style={{ width: '70%' }} />
          </div>
        </div>

        <button
          type="button"
          className="mt-5 rounded-lg border-2 border-battle-gold px-6 py-2 text-sm font-semibold transition"
          style={{ background: PRE_BATTLE_COLORS.button, color: '#f6e4c3' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = PRE_BATTLE_COLORS.buttonHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = PRE_BATTLE_COLORS.button;
          }}
          onClick={onContinue}
        >
          进入战斗
        </button>
      </div>
    </div>
  );
}
