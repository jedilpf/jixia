import { PRE_BATTLE_BACKGROUND, PRE_BATTLE_COLORS, asset } from '@/ui/screens/visualAssets';

interface MatchScreenProps {
  onContinue: () => void;
}

export function MatchScreen({ onContinue }: MatchScreenProps) {
  return (
    <div
      className="relative flex h-full items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(120deg, rgba(9,6,4,0.84), rgba(29,18,12,0.76)), url(${PRE_BATTLE_BACKGROUND})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_22%,rgba(194,120,58,0.18),transparent_42%)]" />

      <div
        className="relative w-[760px] rounded-2xl border p-6 text-center"
        style={{ borderColor: PRE_BATTLE_COLORS.border, background: PRE_BATTLE_COLORS.panel }}
      >
        <div className="text-2xl font-semibold tracking-[0.1em]" style={{ color: PRE_BATTLE_COLORS.textMain }}>正在匹配对手</div>
        <div className="mt-2 text-sm" style={{ color: PRE_BATTLE_COLORS.textMuted }}>稷下学宫已发出辩帖，请稍候…</div>

        <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-6">
          <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'rgba(184,136,84,0.45)' }}>
            <img src={asset('/assets/chars/stand/kongqiu.png')} alt="我方" className="h-52 w-full object-cover" />
          </div>

          <div className="relative flex h-24 w-24 items-center justify-center rounded-full border" style={{ borderColor: '#a97a47', background: 'rgba(20,14,9,0.86)' }}>
            <div className="absolute h-16 w-16 animate-spin rounded-full border-2 border-[#c99657] border-t-transparent" />
            <span className="text-xs tracking-[0.2em]" style={{ color: '#e8d1ad' }}>匹配中</span>
          </div>

          <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'rgba(184,136,84,0.45)' }}>
            <img src={asset('/assets/chars/stand/hanfeizi.png')} alt="对手" className="h-52 w-full object-cover" />
          </div>
        </div>

        <button
          type="button"
          className="mt-7 rounded-lg border px-6 py-2 text-sm transition"
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
