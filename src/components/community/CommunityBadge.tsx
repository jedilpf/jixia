import { useContext } from 'react';
import { CommunityContext } from '../../hooks/useCommunityState';

export function CommunityBadge() {
  const { hasNewContent, hasDraft } = useContext(CommunityContext)!;

  const showBadge = hasNewContent || hasDraft;

  if (!showBadge) return null;

  return (
    <span
      className="absolute -top-1 -right-1 flex items-center justify-center"
      style={{
        animation: 'badge-pulse 2s ease-in-out infinite',
      }}
    >
        {/* 朱砂印效果 */}
        <span 
            className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(141,47,47,0.5)]" 
            style={{ 
                background: hasDraft ? '#d69849' : '#8D2F2F',
                border: '1px solid rgba(212,165,32,0.4)' 
            }} 
        />
        <span 
            className="absolute w-5 h-5 border border-[#8D2F2F]/20 rounded-full animate-ping" 
        />
    </span>
  );
}
