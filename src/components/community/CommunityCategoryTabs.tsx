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

export function CommunityCategoryTabs({
  selected,
  onSelect,
}: CommunityCategoryTabsProps) {
  return (
    <div className="flex items-center justify-center gap-4 px-6 overflow-x-auto no-scrollbar">
      {COMMUNITY_CATEGORIES.map((category) => {
        const isActive = selected === category.id;

        return (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className="group relative flex flex-col items-center gap-2 px-6 py-2 transition-all"
          >
            <div
              className={`flex items-center gap-2 text-sm font-serif transition-all ${
                isActive
                  ? 'text-[#D4AF65] scale-110'
                  : 'text-[#f6e4c3]/40 group-hover:text-[#f6e4c3]/60'
              }`}
            >
              <CategoryIcon id={category.id} color="currentColor" />
              <span className="tracking-[0.2em]">{category.label}</span>
            </div>

            {/* 激活指示器 - 金丝墨迹 */}
            {isActive && (
              <div className="absolute -bottom-1 w-full h-0.5 bg-gradient-to-r from-transparent via-[#D4AF65] to-transparent shadow-[0_0_10px_rgba(212,175,101,0.5)]" />
            )}
          </button>
        );
      })}
    </div>
  );
}
