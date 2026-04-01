import { useMemo, useState } from 'react';
import { FACTIONS } from '@/data/game/factions';
import { PRE_BATTLE_BACKGROUND, PRE_BATTLE_COLORS, getFactionPortrait } from '@/ui/screens/visualAssets';

interface FactionPickScreenProps {
  options: string[];
  lockedFactionId: string | null;
  onConfirm: (factionId: string) => void;
}

export function FactionPickScreen({ options, lockedFactionId, onConfirm }: FactionPickScreenProps) {
  const [selected, setSelected] = useState<string | null>(lockedFactionId);
  const factionMap = useMemo(() => new Map(FACTIONS.map((f) => [f.id, f])), []);

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
        className="relative w-[980px] rounded-2xl border p-6"
        style={{ borderColor: PRE_BATTLE_COLORS.border, background: PRE_BATTLE_COLORS.panel }}
      >
        <h2 className="text-2xl font-bold tracking-[0.06em]" style={{ color: PRE_BATTLE_COLORS.textMain }}>门派抉择</h2>
        <p className="mt-2 text-sm" style={{ color: PRE_BATTLE_COLORS.textMuted }}>从本局可选门派中确认你的论道阵营</p>

        <div className="mt-5 grid grid-cols-2 gap-4">
          {options.map((id) => {
            const faction = factionMap.get(id);
            const active = selected === id;
            const factionColor = faction?.color ?? '#B58A52';
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelected(id)}
                className="overflow-hidden rounded-xl border text-left transition"
                style={{
                  borderColor: active ? '#d4a520' : 'rgba(184,136,84,0.45)',
                  background: active ? 'rgba(55,38,23,0.92)' : PRE_BATTLE_COLORS.panelSoft,
                  boxShadow: active ? '0 0 0 1px rgba(212,165,32,0.25), 0 10px 26px rgba(0,0,0,0.34)' : 'none',
                }}
              >
                <div className="grid grid-cols-[150px_1fr]">
                  <div className="relative h-[150px] overflow-hidden border-r" style={{ borderColor: 'rgba(184,136,84,0.3)' }}>
                    <img src={getFactionPortrait(id)} alt={faction?.name ?? id} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                  </div>
                  <div className="p-4">
                    <div className="text-lg font-semibold" style={{ color: '#f3debc' }}>{faction?.name ?? id}</div>
                    <div className="mt-2 text-sm" style={{ color: '#c9b28d' }}>{faction?.style ?? '未知流派'}</div>
                    <div className="mt-4 inline-block rounded px-2 py-1 text-xs" style={{ background: `${factionColor}22`, color: factionColor, border: `1px solid ${factionColor}66` }}>
                      门派气质
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between rounded-xl border px-4 py-3" style={{ borderColor: 'rgba(184,136,84,0.4)', background: 'rgba(18,13,9,0.64)' }}>
          <div className="text-sm" style={{ color: '#ceb792' }}>
            当前选择：{selected ? factionMap.get(selected)?.name ?? selected : '未选择'}
          </div>
          <button
            type="button"
            disabled={!selected}
            onClick={() => selected && onConfirm(selected)}
            className="rounded-lg border px-6 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45"
            style={{ borderColor: '#b88a53', background: PRE_BATTLE_COLORS.button, color: '#f6e4c3' }}
            onMouseEnter={(e) => {
              if (selected) e.currentTarget.style.background = PRE_BATTLE_COLORS.buttonHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = PRE_BATTLE_COLORS.button;
            }}
          >
            确认门派
          </button>
        </div>
      </div>
    </div>
  );
}
