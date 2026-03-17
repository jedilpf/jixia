interface DeckPileProps {
  count: number;
  isEnemy: boolean;
  scale: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export function DeckPile({ count, isEnemy, scale, x, y, w, h }: DeckPileProps) {
  return (
    <div
      className={`absolute rounded-lg flex flex-col items-center justify-center border-2 ${
        isEnemy
          ? 'bg-red-900/60 border-red-700'
          : 'bg-amber-900/60 border-amber-700'
      }`}
      style={{
        left: `${x * scale}px`,
        top: `${y * scale}px`,
        width: `${w * scale}px`,
        height: `${h * scale}px`,
      }}
    >
      <span className={`text-2xl ${isEnemy ? 'text-red-400' : 'text-amber-400'}`}>🂠</span>
      <span className={`text-lg font-bold mt-1 ${isEnemy ? 'text-red-300' : 'text-amber-300'}`}>
        {count}
      </span>
    </div>
  );
}

export default DeckPile;
