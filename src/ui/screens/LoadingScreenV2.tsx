import { FACTIONS } from '@/data/game/factions';
import { PERSONAGES } from '@/data/game/characters';
import { PRE_BATTLE_BACKGROUND } from '@/ui/screens/visualAssets';

interface LoadingScreenV2Props {
  playerFactionId: string | null;
  enemyFactionId: string | null;
  issueIds: string[];
  onContinue: () => void;
}

/**
 * LoadingScreenV2 - 2.0 雅化加载对垒屏
 * 视觉方案：名士对峙、格言明志、阴阳博弈流
 */
export function LoadingScreenV2({
  playerFactionId,
  enemyFactionId,
  issueIds,
  onContinue,
}: LoadingScreenV2Props) {
  const factionMap = new Map(FACTIONS.map((f) => [f.id, f]));
  const personageMap = new Map(PERSONAGES.map((p) => [p.factionId, p]));
  
  const playerPerson = personageMap.get(playerFactionId ?? '');
  const enemyPerson = personageMap.get(enemyFactionId ?? '');

  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden bg-[#0a0a0a] font-serif transition-opacity duration-1000">
      {/* 背景：极简绢纹 */}
      <div 
        className="absolute inset-0 opacity-20 bg-cover bg-center"
        style={{ backgroundImage: `url(${PRE_BATTLE_BACKGROUND})` }}
      />
      
      {/* 动态对峙隔离带 (代填加载进度) */}
      <div className="absolute inset-y-0 left-1/2 w-[2px] bg-gradient-to-b from-transparent via-[#b88a5366] to-transparent" />

      <div className="relative w-full max-w-7xl px-20 flex items-center justify-between">
        
        {/* 我方阵位 */}
        <div className="flex flex-col items-center gap-12 group">
           <div className="text-[12px] tracking-[0.8em] text-[#bca47f] mb-4 opacity-70">我方立场</div>
           <div className="relative">
              <div className="w-80 h-[500px] bg-[#1a1a1a] rounded-sm transform -skew-x-2 border border-[#b88a5344] overflow-hidden">
                <img 
                  src={playerPerson?.portrait ?? '/assets/card-back.png'} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100 opacity-80"
                  alt="Player Legend" 
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-[#fdfaf2] p-4 shadow-xl border border-[#b88a5333] max-w-xs">
                <div className="text-[10px] text-[#b88a53] mb-1 font-bold">〔 {factionMap.get(playerFactionId ?? '')?.name} 〕</div>
                <div className="text-xl font-bold text-[#1a1a1a] mb-2">{playerPerson?.name}</div>
                <div className="text-[11px] text-[#666] italic leading-relaxed">"{playerPerson?.motto}"</div>
              </div>
           </div>
        </div>

        {/* 中央议题预览 (漂浮组件) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
            <div className="w-48 h-48 rounded-full border-2 border-[#b88a53] flex items-center justify-center bg-black/80 backdrop-blur-md shadow-[0_0_50px_rgba(184,138,83,0.3)]">
               <div className="px-6 text-center">
                 <div className="text-[9px] text-[#b88a53] uppercase mb-1 tracking-widest leading-none">争鸣焦点</div>
                 <div className="h-[1px] w-8 bg-[#831843] mx-auto mb-2" />
                 <div className="text-sm font-bold text-[#fdfaf2] leading-snug">
                   {issueIds[0] ? (issueIds[0].length > 10 ? issueIds[0].substring(0,8)+'...' : issueIds[0]) : '未定议题'}
                 </div>
               </div>
            </div>
            {/* 动态加载文字 */}
            <div className="mt-8 text-[11px] tracking-[0.6em] text-[#b88a53] animate-pulse">
               推演中 ...
            </div>
        </div>

        {/* 敌方阵位 */}
        <div className="flex flex-col items-center gap-12 group">
           <div className="text-[12px] tracking-[0.8em] text-[#bca47f] mb-4 opacity-70">敌方立场</div>
           <div className="relative">
              <div className="w-80 h-[500px] bg-[#1a1a1a] rounded-sm transform skew-x-2 border border-[#83184344] overflow-hidden">
                 <img 
                  src={enemyPerson?.portrait ?? '/assets/card-back.png'} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100 opacity-80"
                  alt="Enemy Legend" 
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-[#fdfaf2] p-4 shadow-xl border border-[#83184333] max-w-xs text-right">
                <div className="text-[10px] text-[#831843] mb-1 font-bold">〔 {factionMap.get(enemyFactionId ?? '')?.name} 〕</div>
                <div className="text-xl font-bold text-[#1a1a1a] mb-2">{enemyPerson?.name}</div>
                <div className="text-[11px] text-[#666] italic leading-relaxed">"{enemyPerson?.motto}"</div>
              </div>
           </div>
        </div>

      </div>

      {/* 底部功能条：开合效果感 */}
      <div className="absolute bottom-12 left-0 right-0 px-20 flex justify-center">
         <button
            onClick={onContinue}
            className="group relative px-24 py-5 bg-[#1a1a1a] text-[#fdfaf2] overflow-hidden transition-all duration-500 hover:tracking-[0.8em]"
         >
            <div className="absolute inset-x-0 top-0 h-[1px] bg-[#b88a53] scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            <div className="absolute inset-x-0 bottom-0 h-[1px] bg-[#b88a53] scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            <span className="text-sm font-bold tracking-[0.5em]">入席开论</span>
         </button>
      </div>

    </div>
  );
}
