import { ISSUES } from '@/data/game/issues';
import { PRE_BATTLE_BACKGROUND, PRE_BATTLE_COLORS, getIssueArt } from '@/ui/screens/visualAssets';

interface TopicScreenProps {
  topicIds: string[];
  onContinue: () => void;
}

export function TopicScreen({ topicIds, onContinue }: TopicScreenProps) {
  const topicMap = new Map(ISSUES.map((item) => [item.id, item]));

  return (
    <div
      className="relative flex h-full items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(118deg, rgba(11,8,5,0.84), rgba(33,18,9,0.78)), url(${PRE_BATTLE_BACKGROUND})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(187,112,52,0.18),transparent_42%)]" />

      <div
        className="relative w-[920px] rounded-2xl border p-6"
        style={{ borderColor: PRE_BATTLE_COLORS.border, background: PRE_BATTLE_COLORS.panel }}
      >
        <h2 className="text-2xl font-bold tracking-[0.06em]" style={{ color: PRE_BATTLE_COLORS.textMain }}>选择论场</h2>
        <p className="mt-2 text-sm" style={{ color: PRE_BATTLE_COLORS.textMuted }}>中央议题种子已生成，确认后进入门派抉择</p>

        <div className={`mt-5 grid gap-4 ${topicIds.length > 1 ? 'grid-cols-3' : 'grid-cols-1'}`}>
          {topicIds.map((id) => {
            const topic = topicMap.get(id);
            return (
              <div
                key={id}
                className="relative overflow-hidden rounded-xl border"
                style={{ borderColor: 'rgba(184,136,84,0.5)', background: PRE_BATTLE_COLORS.panelSoft }}
              >
                <img src={getIssueArt(id)} alt={topic?.name ?? id} className="h-32 w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
                <div className="relative p-3">
                  <div className="text-base font-semibold" style={{ color: '#f3debc' }}>{topic?.name ?? id}</div>
                  <div className="mt-2 text-xs leading-6" style={{ color: '#ccb28b' }}>{topic?.description ?? '无描述'}</div>
                  <div className="mt-2 text-xs" style={{ color: '#a88b63' }}>{topic?.seedPrompt ?? ''}</div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          className="mt-6 rounded-lg border px-7 py-2 text-sm transition"
          style={{ borderColor: '#b88a53', background: PRE_BATTLE_COLORS.button, color: '#f6e4c3' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = PRE_BATTLE_COLORS.buttonHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = PRE_BATTLE_COLORS.button;
          }}
          onClick={onContinue}
        >
          继续
        </button>
      </div>
    </div>
  );
}
