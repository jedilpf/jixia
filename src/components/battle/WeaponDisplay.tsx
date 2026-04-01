import { WeaponInstance } from '@/types';

interface WeaponDisplayProps {
  weapon: WeaponInstance;
  scale: number;
  x: number;
  y: number;
}

export function WeaponDisplay({ weapon, scale, x, y }: WeaponDisplayProps) {
  return (
    <div
      className="absolute bg-amber-800/80 border-2 border-amber-500 rounded-lg flex flex-col items-center justify-center"
      style={{
        left: `${x * scale}px`,
        top: `${y * scale}px`,
        width: `${60 * scale}px`,
        height: `${80 * scale}px`,
      }}
    >
      <span className="text-amber-200 text-xs font-bold">{weapon.name}</span>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-yellow-400 text-sm font-bold">{weapon.atk}</span>
        <span className="text-white/40">/</span>
        <span className="text-gray-300 text-sm">{weapon.durability}</span>
      </div>
    </div>
  );
}

export default WeaponDisplay;
