interface TurnMaskOverlayProps {
  visible: boolean;
  playerLabel: string;
  onConfirm: () => void;
}

export function TurnMaskOverlay({ visible, playerLabel, onConfirm }: TurnMaskOverlayProps) {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 p-6">
      <div className="w-[560px] rounded-xl border border-[#5f523e] bg-[#16120d] p-6 text-center text-[#f3debc]">
        <h3 className="text-xl font-bold">{playerLabel}回合交接</h3>
        <p className="mt-3 text-sm text-[#ceb792]">请将设备交给{playerLabel}，非当前玩家请勿查看屏幕内容。</p>
        <button
          type="button"
          className="mt-5 rounded border border-[#b88a53] bg-[#3b2b16] px-6 py-2 text-sm font-semibold"
          onClick={onConfirm}
        >
          开始本回合
        </button>
      </div>
    </div>
  );
}
