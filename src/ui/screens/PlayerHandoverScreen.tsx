import { PRE_BATTLE_BACKGROUND, PRE_BATTLE_COLORS } from '@/ui/screens/visualAssets';

interface PlayerHandoverScreenProps {
  fromPlayerLabel: string;
  toPlayerLabel: string;
  onContinue: () => void;
}

export function PlayerHandoverScreen({
  fromPlayerLabel,
  toPlayerLabel,
  onContinue,
}: PlayerHandoverScreenProps) {
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
        className="relative w-[760px] rounded-2xl border p-6"
        style={{ borderColor: PRE_BATTLE_COLORS.border, background: PRE_BATTLE_COLORS.panel }}
      >
        <h2 className="text-2xl font-bold tracking-[0.08em]" style={{ color: PRE_BATTLE_COLORS.textMain }}>
          设备交接
        </h2>
        <p className="mt-3 text-sm leading-7" style={{ color: '#d4bf99' }}>
          {fromPlayerLabel}已完成操作。请将设备交给{toPlayerLabel}，非当前玩家请勿查看手牌与选择内容。
        </p>
        <div
          className="mt-5 rounded-xl border px-4 py-3 text-sm"
          style={{ borderColor: 'rgba(184,136,84,0.4)', background: 'rgba(18,13,9,0.64)', color: '#ceb792' }}
        >
          当前即将进入：{toPlayerLabel}操作阶段
        </div>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            className="rounded-lg border px-6 py-2 text-sm font-semibold transition"
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
    </div>
  );
}
