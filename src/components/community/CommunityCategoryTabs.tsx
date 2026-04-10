import type { CommunityCategory } from '../../community/types';
import { COMMUNITY_CATEGORIES } from '../../community/types';

interface CommunityCategoryTabsProps {
  selected: CommunityCategory | 'all';
  onSelect: (category: CommunityCategory | 'all') => void;
}

export function CommunityCategoryTabs({ selected, onSelect }: CommunityCategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {COMMUNITY_CATEGORIES.map((cat) => {
        const isActive = cat.id === selected;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id as CommunityCategory | 'all')}
            className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm transition-all duration-200"
            style={{
              background: isActive
                ? 'linear-gradient(180deg, rgba(176, 83, 39, 0.34), rgba(214, 151, 73, 0.12))'
                : 'linear-gradient(180deg, rgba(46, 17, 15, 0.88), rgba(24, 9, 11, 0.88))',
              border: `1px solid ${isActive ? 'rgba(214, 151, 73, 0.42)' : 'rgba(214, 151, 73, 0.14)'}`,
              color: isActive ? '#f5e6b8' : '#d9c3a0',
              boxShadow: isActive ? '0 10px 22px rgba(122,42,28,0.2)' : 'none',
            }}
          >
            <span className="text-base leading-none">{cat.icon}</span>
            <span className="font-medium tracking-wide">{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
