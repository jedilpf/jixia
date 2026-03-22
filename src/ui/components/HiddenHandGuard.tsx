interface HiddenHandGuardProps {
  message?: string;
}

export function HiddenHandGuard({
  message = '当前为交接或非可见状态，手牌已隐藏。',
}: HiddenHandGuardProps) {
  return (
    <div className="rounded-lg border border-[#5f523e] bg-[#16120d] p-4 text-sm text-[#c9b28d]">
      {message}
    </div>
  );
}
