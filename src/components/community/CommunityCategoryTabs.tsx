import type { CommunityCategory } from '../../community/types';
import { COMMUNITY_CATEGORIES } from '../../community/types';
import { 
  IconBambooSlips, 
  IconTalk, 
  IconCrossSwords, 
  IconSeek, 
  IconChronicle 
} from '@/components/common/JixiaIcons';

interface CommunityCategoryTabsProps {
  selected: CommunityCategory | 'all';
  onSelect: (category: CommunityCategory | 'all') => void;
}

function CategoryIcon({ id, color }: { id: string; color: string }) {
    switch(id) {
        case 'all': return <IconBambooSlips size={16} color={color} />;
        case 'discussion': return <IconTalk size={16} color={color} />;
        case 'battle_report': return <IconCrossSwords size={16} color={color} />;
        case 'qa': return <IconSeek size={16} color={color} />;
        case 'culture': return <IconChronicle size={16} color={color} />;
        default: return null;
    }
}

export function CommunityCategoryTabs({ selected, onSelect }: CommunityCategoryTabsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* 竹简片分隔装饰 */}
      <div className="h-6 w-px opacity-40" style={{ background: 'rgba(139, 90, 43, 0.5)' }} />

      {COMMUNITY_CATEGORIES.map((cat) => {
        const isActive = cat.id === selected;
        const iconColor = isActive ? '#d4a520' : '#b89372';
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
              color: iconColor,
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

            <CategoryIcon id={cat.id} color={iconColor} />
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
