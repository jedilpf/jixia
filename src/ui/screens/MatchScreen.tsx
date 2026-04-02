import { asset } from '@/ui/screens/visualAssets';

interface MatchScreenProps {
  onContinue: () => void;
}

export function MatchScreen({ onContinue }: MatchScreenProps) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#FDFBF7] text-[#1A1A1A]">
      {/* 矿物辉光背景 */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(58,95,65,0.05),transparent_45%),radial-gradient(circle_at_70%_70%,rgba(141,47,47,0.05),transparent_45%)]" />
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/handmade-paper.png")' }} />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-black tracking-[0.3em] text-[#1A1A1A]">辩帖传书</h2>
          <p className="mt-2 text-sm font-medium tracking-wide text-[#5C4033]/60">稷下学宫正在为您调停对手，请稍候…</p>
        </div>

        <div className="flex w-full max-w-4xl items-center justify-center gap-12">
          {/* 我方名士 */}
          <div className="group relative overflow-hidden rounded-2xl border-4 border-[#3A5F41] bg-white p-1 shadow-xl transition duration-500 hover:scale-105">
            <div className="overflow-hidden rounded-xl bg-[#F2ECD9]">
              <img src={asset('/assets/chars/stand/kongqiu.png')} alt="我方名士" className="h-64 w-48 object-cover opacity-90" />
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#3A5F41] px-4 py-1 text-xs font-bold text-white shadow-lg">
              我方
            </div>
          </div>

          {/* 匹配仪：太极流转感 */}
          <div className="relative flex h-32 w-32 items-center justify-center">
            <div className="absolute h-full w-full animate-spin rounded-full border-4 border-[#D4AF65]/20 border-t-[#3A5F41] border-r-[#8D2F2F]/40" />
            <div className="absolute h-[80%] w-[80%] animate-spin rounded-full border-4 border-[#D4AF65]/20 border-b-[#3A5F41]/60" style={{ animationDirection: 'reverse' }} />
            <span className="text-sm font-black tracking-widest text-[#3A5F41]">寻觅中</span>
          </div>

          {/* 对手名士 */}
          <div className="group relative overflow-hidden rounded-2xl border-4 border-[#8D2F2F] bg-white p-1 shadow-xl transition duration-500 hover:scale-105">
            <div className="overflow-hidden rounded-xl bg-[#F2ECD9]">
              <img src={asset('/assets/chars/stand/hanfeizi.png')} alt="对手名士" className="h-64 w-48 object-cover opacity-90" />
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#8D2F2F] px-4 py-1 text-xs font-bold text-white shadow-lg">
              对手
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="group mt-16 flex items-center gap-4 rounded-lg bg-[#1A1A1A] px-16 py-4 text-lg font-bold text-[#FDFBF7] transition-all hover:bg-[#3A5F41] active:scale-95 shadow-2xl"
        >
          赴约论战
          <span className="transition-transform group-hover:translate-x-2">→</span>
        </button>
      </div>
    </div>
  );
}
