import { PRE_BATTLE_BACKGROUND, PRE_BATTLE_COLORS, asset } from '@/ui/screens/visualAssets';

interface HomeScreenProps {
  onStart: () => void;
}

export function HomeScreen({ onStart }: HomeScreenProps) {
  return (
    <div
      className="relative flex h-full items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(125deg, rgba(10,7,5,0.78), rgba(34,18,10,0.7)), url(${PRE_BATTLE_BACKGROUND})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(190,118,63,0.18),transparent_42%),radial-gradient(circle_at_78%_72%,rgba(140,78,42,0.2),transparent_42%)]" />
      <div className="relative flex w-[880px] items-stretch gap-4 rounded-2xl border p-6"
        style={{ borderColor: PRE_BATTLE_COLORS.border, background: PRE_BATTLE_COLORS.panel }}>
        <div className="flex-1 rounded-xl border p-6" style={{ borderColor: 'rgba(184,136,84,0.45)', background: PRE_BATTLE_COLORS.panelSoft }}>
          <h1 className="text-4xl font-bold tracking-[0.08em]" style={{ color: PRE_BATTLE_COLORS.textMain }}>百家争鸣</h1>
          <p className="mt-3 text-sm" style={{ color: PRE_BATTLE_COLORS.textMuted }}>明辩暗辩 · 议题争夺 · 门派对战</p>
          <p className="mt-8 text-sm leading-7" style={{ color: '#d4bf99' }}>
            围绕中央议题，在主议与旁议中提交牌组组合。每 3 轮将触发一次议题引爆判定，
            争夺方向优势与大势胜机。
          </p>
          <button
            type="button"
            className="mt-10 rounded-lg border px-8 py-3 text-base font-semibold transition"
            style={{
              borderColor: '#b88a53',
              background: PRE_BATTLE_COLORS.button,
              color: '#f6e4c3',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = PRE_BATTLE_COLORS.buttonHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = PRE_BATTLE_COLORS.button;
            }}
            onClick={onStart}
          >
            开始对战
          </button>
        </div>

        <div className="relative w-[300px] overflow-hidden rounded-xl border" style={{ borderColor: 'rgba(184,136,84,0.45)' }}>
          <img
            src={asset('/assets/chars/stand/sunwu.png')}
            alt="门派立绘"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-3 text-xs" style={{ color: '#e6d0aa' }}>
            天下纷争，百家争鸣
          </div>
        </div>
      </div>
    </div>
  );
}
