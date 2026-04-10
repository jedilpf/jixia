interface CommunityEmptyStateProps {
  icon: string;
  title: string;
  message: string;
}

export function CommunityEmptyState({ icon, title, message }: CommunityEmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-[20px] px-6 py-16 text-center"
      style={{
        background:
          'linear-gradient(180deg, rgba(49, 20, 17, 0.92) 0%, rgba(24, 9, 11, 0.92) 100%)',
        border: '1px solid rgba(214, 151, 73, 0.16)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
      }}
    >
      <div
        className="mb-5 flex h-16 w-16 items-center justify-center rounded-full text-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(214,151,73,0.24) 0%, rgba(158,61,43,0.08) 72%)',
          border: '1px solid rgba(214, 151, 73, 0.18)',
        }}
      >
        {icon}
      </div>
      <p className="mb-2 text-lg font-serif tracking-wide text-[#f5e6b8]">{title}</p>
      <p className="max-w-md text-sm leading-7 text-[#d9c3a0]">{message}</p>
    </div>
  );
}
