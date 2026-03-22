import { PRE_BATTLE_BACKGROUND, PRE_BATTLE_COLORS } from '@/ui/screens/visualAssets';

interface LocalBattleSetupScreenProps {
  issueName: string;
  playerOptions: string[];
  enemyOptions: string[];
  onContinue: () => void;
  onBack: () => void;
}

export function LocalBattleSetupScreen({
  issueName,
  playerOptions,
  enemyOptions,
  onContinue,
  onBack,
}: LocalBattleSetupScreenProps) {
  return (
    <div
      className="relative flex h-full items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(122deg, rgba(10,7,4,0.86), rgba(34,18,8,0.8)), url(${PRE_BATTLE_BACKGROUND})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(188,109,49,0.17),transparent_40%)]" />
      <div
        className="relative w-[920px] rounded-2xl border p-6"
        style={{ borderColor: PRE_BATTLE_COLORS.border, background: PRE_BATTLE_COLORS.panel }}
      >
        <h2 className="text-2xl font-bold tracking-[0.06em]" style={{ color: PRE_BATTLE_COLORS.textMain }}>
          本地双人准备
        </h2>
        <p className="mt-2 text-sm" style={{ color: PRE_BATTLE_COLORS.textMuted }}>
          已进入本地双人局前流程：确认议题后，将依次进行玩家1与玩家2的门派选择。
        </p>

        <div
          className="mt-5 grid grid-cols-3 gap-4 rounded-xl border p-4 text-sm"
          style={{ borderColor: 'rgba(184,136,84,0.45)', background: PRE_BATTLE_COLORS.panelSoft }}
        >
          <div className="rounded-lg border p-3" style={{ borderColor: 'rgba(184,136,84,0.35)' }}>
            <div className="text-xs text-[#ad8f67]">中央议题</div>
            <div className="mt-1 text-base text-[#f3debc]">{issueName || '待生成'}</div>
          </div>
          <div className="rounded-lg border p-3" style={{ borderColor: 'rgba(184,136,84,0.35)' }}>
            <div className="text-xs text-[#ad8f67]">玩家1候选门派数</div>
            <div className="mt-1 text-base text-[#f3debc]">{playerOptions.length}</div>
          </div>
          <div className="rounded-lg border p-3" style={{ borderColor: 'rgba(184,136,84,0.35)' }}>
            <div className="text-xs text-[#ad8f67]">玩家2候选门派数</div>
            <div className="mt-1 text-base text-[#f3debc]">{enemyOptions.length}</div>
          </div>
        </div>

        <div className="mt-5 rounded-xl border p-4 text-sm text-[#ceb792]" style={{ borderColor: 'rgba(184,136,84,0.35)' }}>
          本局流程预览：
          <div className="mt-2">1. 玩家1选门派</div>
          <div>2. 交接遮罩页</div>
          <div>3. 玩家2选门派</div>
          <div>4. 双方确认后进入战斗</div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
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
            开始双人选门派
          </button>
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
            onClick={onBack}
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
}
