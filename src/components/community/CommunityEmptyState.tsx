import React from 'react';

interface CommunityEmptyStateProps {
  icon: React.ReactNode;
  title: string;
  message: string;
}

export function CommunityEmptyState({ icon, title, message }: CommunityEmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-3xl px-6 py-20 text-center"
      style={{
        background: 'rgba(10, 5, 3, 0.4)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(212, 175, 101, 0.1)',
      }}
    >
      <div
        className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(212, 175, 101, 0.2)',
          boxShadow: '0 0 30px rgba(212, 175, 101, 0.05)',
        }}
      >
        {icon}
      </div>
      <p className="mb-3 text-2xl font-serif tracking-[0.2em] text-[#f6e4c3] uppercase">{title}</p>
      <p className="max-w-md text-[13px] leading-relaxed text-[#f6e4c3]/30 font-serif">{message}</p>
    </div>
  );
}
