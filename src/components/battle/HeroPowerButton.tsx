interface HeroPowerButtonProps {
  heroPower: { name: string; cost: number; usedThisTurn: boolean };
  canUse: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  scale: number;
  x: number;
  y: number;
}

export function HeroPowerButton({
  heroPower,
  canUse,
  isSelected = false,
  onClick,
  scale,
  x,
  y,
}: HeroPowerButtonProps) {
  return (
    <div
      className={`absolute flex flex-col items-center justify-center cursor-pointer transition-all ${
        heroPower.usedThisTurn
          ? 'bg-gray-800/60 border-gray-600 opacity-50'
          : canUse
          ? 'bg-purple-800/80 border-purple-400 hover:bg-purple-700/80'
          : 'bg-gray-800/60 border-gray-600'
      } border-2 rounded-lg ${isSelected ? 'ring-2 ring-yellow-400' : ''}`}
      style={{
        left: `${x * scale}px`,
        top: `${y * scale}px`,
        width: `${70 * scale}px`,
        height: `${70 * scale}px`,
      }}
      onClick={onClick}
    >
      <div className="text-purple-300 text-xs font-bold text-center">{heroPower.name}</div>
      <div className={`text-sm font-bold mt-1 ${canUse ? 'text-yellow-400' : 'text-gray-400'}`}>
        {heroPower.cost}法力
      </div>
      {heroPower.usedThisTurn && <div className="text-gray-400 text-xs mt-1">已使用</div>}
    </div>
  );
}

export default HeroPowerButton;
