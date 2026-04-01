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
      className="relative flex h-full items-center justify-center overflow-hidden bg-black font-serif"
    >
      {/* 背景层：暗色绢本叠加 */}
      <div 
        className="absolute inset-0 opacity-40 bg-cover bg-center"
        style={{ backgroundImage: `url(${PRE_BATTLE_BACKGROUND})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]" />

      <div className="relative w-full max-w-6xl px-12">
        {/* 标题区：雅致居中 */}
        <div className="mb-16 text-center">
          <div className="inline-block border-y border-[#b88a53] px-12 py-2">
            <h2 className="text-4xl font-bold tracking-[0.5em] text-[#fdfaf2]">辩场选定</h2>
          </div>
          <p className="mt-4 text-[#bca47f] italic tracking-widest">中央议题既出，万法归宗，请择定本局论点。</p>
        </div>

        {/* 议题简牍流 */}
        <div className="flex justify-center gap-8">
          {topicIds.map((id, index) => {
            const topic = topicMap.get(id);
            return (
              <div
                key={id}
                className="group relative w-72 cursor-pointer transition-all duration-500 hover:-translate-y-4"
              >
                {/* 简牍卷轴背景 */}
                <div className="absolute inset-0 bg-[#fdfaf2] shadow-xl rotate-1 group-hover:rotate-0 transition-transform" />
                <div className="absolute inset-y-0 -left-1 w-2 bg-[#b88a53] shadow-sm" />
                
                <div className="relative p-6 h-[420px] flex flex-col border border-[#b88a5333]">
                  {/* 编号印记 */}
                  <div className="absolute top-4 right-4 text-3xl font-bold text-[#b88a5322] italic">
                    0{index + 1}
                  </div>
                  
                  <div className="mt-8">
                     <h3 className="text-2xl font-bold leading-relaxed text-[#1a1a1a] writing-vertical h-32 mb-6">
                       {topic?.name ?? id}
                     </h3>
                     <div className="h-[2px] w-12 bg-[#831843] mb-6" />
                     <p className="text-sm text-[#666] leading-relaxed mb-4">
                       {topic?.description}
                     </p>
                  </div>

                  <div className="mt-auto">
                    <div className="text-[10px] uppercase tracking-tighter text-[#999] mb-2">论辩余响 (Effect)</div>
                    <p className="text-xs italic text-[#b88a53] border-t border-[#eee] pt-2">
                      {topic?.effectText}
                    </p>
                  </div>
                </div>

                {/* 悬浮装饰：石青色流光 */}
                <div className="absolute -bottom-2 -right-2 h-12 w-12 opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="absolute bottom-0 right-0 h-10 w-10 border-b-2 border-r-2 border-[#1e3a5f]" />
                </div>
              </div>
            );
          })}
        </div>

        {/* 底部确认按钮 */}
        <div className="mt-16 text-center">
          <button
            onClick={onContinue}
            className="group relative px-16 py-4 overflow-hidden border border-[#b88a53] transition-all"
          >
            <div className="absolute inset-0 bg-[#b88a53] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative z-10 text-[#fdfaf2] group-hover:text-[#1a1a1a] text-lg font-bold tracking-[0.4em]">开启论战</span>
          </button>
        </div>
      </div>

      {/* 侧边装饰线条 */}
      <div className="absolute left-10 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#b88a5344] to-transparent" />
      <div className="absolute right-10 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#b88a5344] to-transparent" />
    </div>
  );
}
