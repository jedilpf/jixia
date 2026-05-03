import type { CommunityPost } from '../../community/types';
import { COMMUNITY_CATEGORIES } from '../../community/types';
import { 
  IconTalk, 
  IconCrossSwords, 
  IconSeek, 
  IconChronicle 
} from '@/components/common/JixiaIcons';

interface CommunityPostCardProps {
  post: CommunityPost;
  isLiked: boolean;
  isFavorited: boolean;
  onClick: () => void;
  onLike: () => void;
  onFavorite: () => void;
}

function CategoryIcon({ id, color }: { id: string; color: string }) {
    switch(id) {
        case 'discussion': return <IconTalk size={12} color={color} />;
        case 'battle_report': return <IconCrossSwords size={12} color={color} />;
        case 'qa': return <IconSeek size={12} color={color} />;
        case 'culture': return <IconChronicle size={12} color={color} />;
        default: return null;
    }
}

function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minute = 60_000;
  const hour = 3_600_000;
  const day = 86_400_000;

  // 古风时间格式
  if (diff < minute) return '方才';
  if (diff < hour) return `${Math.floor(diff / minute)}刻前`;
  if (diff < day) {
    const hours = Math.floor(diff / hour);
    if (hours < 3) return '今晨';
    if (hours < 6) return '午后';
    return `${hours}时前`;
  }
  if (diff < day * 7) return `${Math.floor(diff / day)}日前`;

  const date = new Date(timestamp);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function getCategoryInfo(categoryId: string) {
  return COMMUNITY_CATEGORIES.find((c) => c.id === categoryId) || COMMUNITY_CATEGORIES[0];
}

export function CommunityPostCard({
  post,
  isLiked,
  isFavorited,
  onClick,
  onLike,
  onFavorite,
}: CommunityPostCardProps) {
  const categoryInfo = getCategoryInfo(post.category);

  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden transition-all duration-300"
      style={{
        background: 'rgba(10, 5, 3, 0.4)',
        backdropFilter: 'blur(4px)',
        border: post.isPinned
          ? '1px solid rgba(212, 175, 101, 0.6)'
          : '1px solid rgba(212, 175, 101, 0.15)',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(10, 5, 3, 0.6)';
        e.currentTarget.style.borderColor = 'rgba(212, 175, 101, 0.4)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(10, 5, 3, 0.4)';
        e.currentTarget.style.borderColor = post.isPinned ? 'rgba(212, 175, 101, 0.6)' : 'rgba(212, 175, 101, 0.15)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* 顶部微光装饰 */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#D4AF65]/20 to-transparent" />

      {/* 内容区 */}
      <div className="relative flex flex-col gap-3 px-6 py-5">
        {/* 标题行 */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {/* 状态标记 */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {post.isPinned && (
                <span className="px-2 py-0.5 text-[9px] font-black tracking-widest uppercase bg-[#831843] text-white rounded-sm shadow-[0_0_10px_rgba(131,24,67,0.4)]">
                  Pinned
                </span>
              )}
              {post.isFeatured && (
                <span className="px-2 py-0.5 text-[9px] font-black tracking-widest uppercase bg-[#D4AF65] text-[#0a0503] rounded-sm">
                  Featured
                </span>
              )}
              <span className="flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-black tracking-widest uppercase bg-white/5 border border-white/10 text-[#f6e4c3]/40 rounded-sm">
                <CategoryIcon id={post.category} color="currentColor" />
                <span>{categoryInfo.label}</span>
              </span>
            </div>

            {/* 标题 */}
            <h3 className="mb-2 line-clamp-1 text-lg font-serif text-[#f6e4c3] group-hover:text-[#D4AF65] transition-colors tracking-wide">
              {post.title}
            </h3>

            {/* 内容摘要 */}
            <p className="mb-4 line-clamp-2 text-[13px] leading-relaxed text-[#f6e4c3]/40 font-serif">
              {post.summary}
            </p>

            {/* 标签 */}
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] font-black tracking-widest uppercase text-[#D4AF65]/60 hover:text-[#D4AF65] transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 底部信息行 */}
        <div className="flex items-center justify-between gap-3 pt-4 mt-2 border-t border-white/5">
          <div className="flex items-center gap-3 text-[10px] font-black tracking-widest uppercase">
            <span className="text-[#D4AF65]">{post.authorName}</span>
            <span className="w-1 h-1 bg-white/10 rounded-full" />
            <span className="text-[#f6e4c3]/20">{formatTimeAgo(post.publishedAt ?? post.createdAt)}</span>
            <span className="w-1 h-1 bg-white/10 rounded-full" />
            <span className="text-[#f6e4c3]/20">{post.viewCount} VIEWS</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={(e) => { e.stopPropagation(); onLike(); }}
              className={`flex items-center gap-1.5 transition-all hover:scale-110 ${isLiked ? 'text-[#831843]' : 'text-[#f6e4c3]/20 hover:text-[#f6e4c3]/40'}`}
            >
              <span className="text-[10px] font-black uppercase tracking-widest">{isLiked ? 'Liked' : 'Like'}</span>
              <span className="text-[11px] font-mono">{post.likeCount}</span>
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); onFavorite(); }}
              className={`flex items-center gap-1.5 transition-all hover:scale-110 ${isFavorited ? 'text-[#D4AF65]' : 'text-[#f6e4c3]/20 hover:text-[#f6e4c3]/40'}`}
            >
              <span className="text-[10px] font-black uppercase tracking-widest">{isFavorited ? 'Saved' : 'Save'}</span>
              <span className="text-[11px] font-mono">{post.favoriteCount}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
