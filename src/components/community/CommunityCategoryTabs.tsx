import type { CommunityCategory } from '../../community/types';
import { COMMUNITY_CATEGORIES } from '../../community/types';

interface CommunityCategoryTabsProps {
  selected: CommunityCategory | 'all';
  onSelect: (category: CommunityCategory | 'all') => void;
}

export function CommunityCategoryTabs({ selected, onSelect }: CommunityCategoryTabsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* 竹简片分隔装饰 */}
      <div className="h-6 w-px opacity-40" style={{ background: 'rgba(139, 90, 43, 0.5)' }} />

      {COMMUNITY_CATEGORIES.map((cat, index) => {
        const isActive = cat.id === selected;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id as CommunityCategory | 'all')}
            className="relative flex items-center gap-1.5 px-3 py-1.5 text-sm font-serif transition-all duration-200"
            style={{
              background: isActive
                ? 'linear-gradient(180deg, rgba(139, 90, 43, 0.35), rgba(100, 60, 30, 0.25))'
                : 'rgba(28, 12, 10, 0.5)',
              border: isActive
                ? '1px solid rgba(212, 165, 32, 0.5)'
                : '1px solid rgba(139, 90, 43, 0.2)',
              color: isActive ? '#d4a520' : '#b89372',
              borderRadius: '2px',
              boxShadow: isActive
                ? '0 2px 0 rgba(139, 90, 43, 0.35), inset 0 1px 0 rgba(212,165,32,0.1)'
                : '0 1px 0 rgba(139, 90, 43, 0.2)',
            }}
          >
            {/* 竹简纹理竖线 */}
            <div
              className="absolute left-0 top-1 bottom-1 w-px opacity-30"
              style={{ background: 'rgba(139, 90, 43, 0.5)' }}
            />

            <span className="text-sm leading-none">{cat.icon}</span>
            <span className="tracking-wider">{cat.label}</span>

            {/* 竹简纹理右线 */}
            <div
              className="absolute right-0 top-1 bottom-1 w-px opacity-30"
              style={{ background: 'rgba(139, 90, 43, 0.5)' }}
            />
          </button>
        );
      })}
    </div>
  );
}
