import { ISSUES } from '@/data/game/issues';
import { PRE_BATTLE_BACKGROUND } from '@/ui/screens/visualAssets';

interface TopicScreenV2Props {
  topicIds: string[];
  onContinue: () => void;
}

/**
 * TopicScreenV2 - 2.0 雅化议题选择屏
 * 视觉方案：开卷简牍、石青矿彩、名士对垒前奏
 */
export function TopicScreenV2({ topicIds, onContinue }: TopicScreenV2Props) {
  const topicMap = new Map(ISSUES.map((item) => [item.id, item]));

  return (
    <div
      className="relative flex h-full items-center justify-center overflow-hidden bg-[#0a0503] font-serif"
    >
      {/* 背景层：暗色绢本叠加 */}
      <div 
        className="absolute inset-0 opacity-40 bg-cover bg-center"
        style={{ backgroundImage: `url(${PRE_BATTLE_BACKGROUND})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0503] via-transparent to-[#0a0503]" />

      <div className="relative w-full max-w-6xl px-12">
        {/* 标题区：雅致居中 */}
        <div className="mb-16 text-center">
          <div className="inline-block border-y border-[#D4AF65] px-16 py-3">
            <h2 className="text-5xl font-bold tracking-[0.6em] text-[#f6e4c3] drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">辩场选定</h2>
          </div>
          <p className="mt-6 text-[#D4AF65]/80 italic tracking-[0.3em] font-medium">中央议题既出，万法归宗，请择定本局论点。</p>
        </div>

        {/* 议题简牍流 */}
        <div className="flex justify-center gap-12">
          {topicIds.map((id, index) => {
            const topic = topicMap.get(id);
            return (
              <div
                key={id}
                className="group relative w-80 cursor-pointer transition-all duration-700 hover:-translate-y-6"
              >
                {/* 简牍卷轴背景 */}
                <div className="absolute inset-0 bg-[#f6e4c3] shadow-2xl rotate-1 group-hover:rotate-0 transition-transform duration-700" />
                <div className="absolute inset-y-0 -left-1 w-2.5 bg-[#D4AF65] shadow-md" />
                
                <div className="relative p-8 h-[460px] flex flex-col border border-[#D4AF65]/20 overflow-hidden">
                  {/* 编号印记 */}
                  <div className="absolute top-6 right-6 text-4xl font-black text-[#D4AF65]/10 italic">
                    0{index + 1}
                  </div>
                  
                  <div className="mt-6">
                     <h3 className="text-3xl font-bold leading-relaxed text-[#0a0503] writing-vertical h-40 mb-8 tracking-widest">
                       {topic?.name ?? id}
                     </h3>
                     <div className="h-[3px] w-14 bg-[#831843] mb-8 shadow-[0_0_8px_#831843]" />
                     <p className="text-sm text-[#222] leading-relaxed mb-6 font-medium text-justify">
                       {topic?.description}
                     </p>
                  </div>

                  <div className="mt-auto">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-[#777] mb-3 font-bold border-b border-black/5 pb-1">论辩余响 (Effect)</div>
                    <p className="text-xs italic text-[#D4AF65] font-semibold leading-relaxed">
                      {topic?.effectText}
                    </p>
                  </div>

                  {/* 墨迹装饰 */}
                  <div className="absolute bottom-0 right-0 w-32 h-32 opacity-[0.03] pointer-events-none translate-x-12 translate-y-12">
                    <svg viewBox="0 0 100 100" fill="currentColor"><path d="M50 0 C70 0 100 30 100 50 C100 70 70 100 50 100 C30 100 0 70 0 50 C0 30 30 0 50 0" /></svg>
                  </div>
                </div>

                {/* 悬浮装饰：石青色流光 */}
                <div className="absolute -bottom-3 -right-3 h-16 w-16 opacity-0 group-hover:opacity-100 transition-all duration-700">
                   <div className="absolute bottom-0 right-0 h-12 w-12 border-b-4 border-r-4 border-[#1e3a5f] shadow-[0_0_15px_#1e3a5f]" />
                </div>
              </div>
            );
          })}
        </div>

        {/* 底部确认按钮 */}
        <div className="mt-20 text-center">
          <button
            onClick={onContinue}
            className="group relative px-20 py-5 overflow-hidden border-2 border-[#D4AF65] transition-all duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
          >
            <div className="absolute inset-0 bg-[#D4AF65] translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <span className="relative z-10 text-[#f6e4c3] group-hover:text-[#0a0503] text-xl font-black tracking-[0.8em] transition-colors duration-500">承运</span>
          </button>
        </div>
      </div>

      {/* 侧边装饰线条 */}
      <div className="absolute left-14 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#D4AF65]/30 to-transparent" />
      <div className="absolute right-14 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#D4AF65]/30 to-transparent" />
    </div>
  );
}
