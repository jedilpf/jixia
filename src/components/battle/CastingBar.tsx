export function CastingBar({
    card,
    target,
    onConfirm,
    onCancel,
    scale,
}: {
    card: { name: string; cost: number; type: string } | null;
    target: string | null;
    onConfirm: () => void;
    onCancel: () => void;
    scale: number;
}) {
    if (!card) return null;

    const isWeapon = card.type === 'weapon';
    const barWidth = 400;
    const barHeight = 60;

    return (
        <div
            className="absolute z-50 flex items-center justify-center"
            style={{
                left: `${(960 - barWidth / 2) * scale}px`,
                top: `${500 * scale}px`,
                width: `${barWidth * scale}px`,
                height: `${barHeight * scale}px`,
            }}
        >
            <div
                className={`w-full h-full rounded-lg border-2 flex items-center px-4 shadow-lg ${isWeapon
                    ? 'bg-amber-900/90 border-amber-500'
                    : 'bg-blue-900/90 border-blue-500'
                    }`}
            >
                {/* 费用水晶 */}
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg mr-3">
                    {card.cost}
                </div>

                {/* 卡牌信息 */}
                <div className="flex-1">
                    <div className={`font-bold ${isWeapon ? 'text-amber-200' : 'text-blue-200'}`}>
                        {card.name}
                    </div>
                    <div className="text-white/70 text-sm">
                        {target ? `目标: ${target}` : '请选择目标'}
                    </div>
                </div>

                {/* 按钮 */}
                <div className="flex gap-2">
                    <button
                        onClick={onCancel}
                        className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-sm font-bold transition-colors"
                    >
                        取消
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={!target}
                        className={`px-3 py-1 rounded text-sm font-bold transition-colors ${target
                            ? 'bg-green-600 hover:bg-green-500 text-white'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        确认
                    </button>
                </div>
            </div>
        </div>
    );
}
