export function DropZoneHighlight({
    isVisible,
    scale,
}: {
    isVisible: boolean;
    scale: number;
}) {
    if (!isVisible) return null;

    return (
        <div
            className="absolute pointer-events-none z-30 bg-green-500/10 border-2 border-green-500/30 rounded-lg"
            style={{
                left: `${100 * scale}px`,
                top: `${530 * scale}px`,
                width: `${1720 * scale}px`,
                height: `${200 * scale}px`,
            }}
        >
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-green-400/50 text-lg font-bold">拖拽到此处召唤随从</span>
            </div>
        </div>
    );
}
