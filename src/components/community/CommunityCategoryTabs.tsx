import type { CommunityCategory } from '../../community/types';
import { COMMUNITY_CATEGORIES } from '../../community/types';

interface CommunityCategoryTabsProps {
  selected: CommunityCategory | 'all';
  onSelect: (category: CommunityCategory | 'all') => void;
}

export function CommunityCategoryTabs({ selected, onSelect }: CommunityCategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {COMMUNITY_CATEGORIES.map(cat => {
        const isActive = cat.id === selected;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id as CommunityCategory | 'all')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all"
            style={{
              background: isActive ? 'rgba(212, 165, 32, 0.2)' : 'rgba(16, 25, 46, 0.6)',
              border: `1px solid ${isActive ? 'rgba(212, 165, 32, 0.5)' : 'rgba(212, 165, 32, 0.2)'}`,
              color: isActive ? '#f5e6b8' : '#a7c5ba',
            }}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
