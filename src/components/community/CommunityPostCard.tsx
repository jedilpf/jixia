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
      className="group relative cursor-pointer overflow-hidden transition-all duration-200"
      style={{
        background: 'linear-gradient(180deg, rgba(26, 12, 10, 0.92) 0%, rgba(16, 6, 8, 0.95) 100%)',
        border: post.isPinned
          ? '2px solid rgba(212, 165, 32, 0.5)'
          : post.isFeatured
            ? '1px solid rgba(184, 92, 55, 0.45)'
            : '1px solid rgba(139, 90, 43, 0.25)',
        borderRadius: '4px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(212,165,32,0.08)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(212,165,32,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(212,165,32,0.08)';
      }}
    >
      {/* 书信/竹简质感 - 顶部折痕 */}
      <div
        className="absolute inset-x-0 top-0 h-6"
        style={{
          background: 'linear-gradient(180deg, rgba(139, 90, 43, 0.15) 0%, transparent 100%)',
        }}
      />

      {/* 左侧竹简纹理线 */}
      <div
        className="absolute left-0 top-6 bottom-6 w-2"
        style={{
          background: 'repeating-linear-gradient(180deg, rgba(139, 90, 43, 0.2) 0px, rgba(139, 90, 43, 0.2) 2px, transparent 2px, transparent 8px)',
        }}
      />

      {/* 内容区 */}
      <div className="relative flex flex-col gap-3 px-6 py-4">
        {/* 标题行 - 古书信格式 */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {/* 状态标记 - 印章风格 */}
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {post.isPinned ? (
                <span
                  className="px-2 py-0.5 text-[10px] font-serif"
                  style={{
                    background: 'rgba(212, 165, 32, 0.18)',
                    border: '1px solid rgba(212, 165, 32, 0.4)',
                    color: '#d4a520',
                    borderRadius: '2px',
                  }}
                >
                  置顶
                </span>
              ) : null}
              {post.isFeatured ? (
                <span
                  className="px-2 py-0.5 text-[10px] font-serif"
                  style={{
                    background: 'rgba(184, 92, 55, 0.18)',
                    border: '1px solid rgba(184, 92, 55, 0.4)',
                    color: '#efc28e',
                    borderRadius: '2px',
                  }}
                >
                  精华
                </span>
              ) : null}
              {post.qaState === 'resolved' ? (
                <span
                  className="px-2 py-0.5 text-[10px] font-serif"
                  style={{
                    background: 'rgba(100, 80, 50, 0.2)',
                    border: '1px solid rgba(139, 90, 43, 0.4)',
                    color: '#d4a520',
                    borderRadius: '2px',
                  }}
                >
                  已解
                </span>
              ) : null}
              <span
                className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-serif"
                style={{
                  background: 'rgba(70, 30, 20, 0.25)',
                  border: '1px solid rgba(139, 90, 43, 0.25)',
                  color: '#f1c697',
                  borderRadius: '2px',
                }}
              >
                <CategoryIcon id={post.category} color="#f1c697" />
                <span>{categoryInfo.label}</span>
              </span>
            </div>

            {/* 标题 - 书信正文感 */}
            <h3 className="mb-2 line-clamp-2 text-base font-serif leading-7 text-[#f5e6b8]" style={{ letterSpacing: '0.02em' }}>
              {post.title}
            </h3>

            {/* 内容摘要 */}
            <p className="mb-3 line-clamp-2 text-sm leading-6 text-[#d9c3a0]" style={{ textIndent: '2em' }}>
              {post.summary}
            </p>

            {/* 标签 */}
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-[10px] font-serif"
                  style={{
                    background: 'rgba(139, 90, 43, 0.1)',
                    border: '1px solid rgba(139, 90, 43, 0.2)',
                    color: '#e7c484',
                    borderRadius: '2px',
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 底部信息行 - 书信落款感 */}
        <div
          className="flex items-center justify-between gap-3 pt-3"
          style={{ borderTop: '1px solid rgba(139, 90, 43, 0.18)' }}
        >
          {/* 作者与时间 */}
          <div className="flex items-center gap-2 text-xs font-serif text-[#b89372]">
            <span className="text-[#d4a520]">{post.authorName}</span>
            <span className="opacity-40">撰于</span>
            <span>{formatTimeAgo(post.publishedAt ?? post.createdAt)}</span>
            <span className="opacity-40">·</span>
            <span>{post.viewCount}阅</span>
          </div>

          {/* 互动统计 - 古风 */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onLike(); }}
              className="flex items-center gap-1 px-2 py-1 text-xs font-serif transition-colors"
              style={{
                background: isLiked ? 'rgba(183, 54, 33, 0.15)' : 'rgba(0,0,0,0)',
                border: isLiked ? '1px solid rgba(183, 54, 33, 0.3)' : '1px solid rgba(139, 90, 43, 0.15)',
                color: isLiked ? '#ff8a5b' : '#d9c3a0',
                borderRadius: '2px',
              }}
            >
              <span>{isLiked ? '赞' : '赏'}</span>
              <span>{post.likeCount}</span>
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); onFavorite(); }}
              className="flex items-center gap-1 px-2 py-1 text-xs font-serif transition-colors"
              style={{
                background: isFavorited ? 'rgba(212, 165, 32, 0.12)' : 'rgba(0,0,0,0)',
                border: isFavorited ? '1px solid rgba(212, 165, 32, 0.3)' : '1px solid rgba(139, 90, 43, 0.15)',
                color: isFavorited ? '#d69849' : '#d9c3a0',
                borderRadius: '2px',
              }}
            >
              <span>{isFavorited ? '藏' : '录'}</span>
              <span>{post.favoriteCount}</span>
            </button>

            <span
              className="flex items-center gap-1 px-2 py-1 text-xs font-serif"
              style={{
                background: 'rgba(0,0,0,0)',
                border: '1px solid rgba(139, 90, 43, 0.15)',
                color: '#d9c3a0',
                borderRadius: '2px',
              }}
            >
              <span>议</span>
              <span>{post.commentCount}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
