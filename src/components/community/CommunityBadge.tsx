import { useContext } from 'react';
import { CommunityContext } from '../../hooks/useCommunityState';

export function CommunityBadge() {
  const { hasNewContent, hasDraft } = useContext(CommunityContext)!;

  const showBadge = hasNewContent || hasDraft;

  if (!showBadge) return null;

  return (
    <span
      className="absolute -top-1 -right-1 w-3 h-3 rounded-full border border-black"
      style={{
        background: hasDraft ? '#d4a520' : '#f97316',
        animation: 'badge-pulse 2s ease-in-out infinite',
      }}
    />
  );
}
