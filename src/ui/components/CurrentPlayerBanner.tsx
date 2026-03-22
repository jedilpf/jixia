interface CurrentPlayerBannerProps {
  playerLabel: string;
  round: number;
}

export function CurrentPlayerBanner({ playerLabel, round }: CurrentPlayerBannerProps) {
  return (
    <div className="mb-3 rounded-lg border border-[#5f523e] bg-[#16120d] px-3 py-2 text-sm text-[#f1d7a8]">
      第 {round} 回合 · 当前操作者：{playerLabel}
    </div>
  );
}
