import type { CommunityPost } from '../../community/types';
import { COMMUNITY_CATEGORIES } from '../../community/types';

interface CommunityPostCardProps {
  post: CommunityPost;
  isLiked: boolean;
  isFavorited: boolean;
  onClick: () => void;
  onLike: () => void;
  onFavorite: () => void;
}

function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minute = 60000;
  const hour = 3600000;
  const day = 86400000;

  if (diff < minute) return '刚刚';
  if (diff < hour) return `${Math.floor(diff / minute)}分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)}小时前`;
  if (diff < day * 7) return `${Math.floor(diff / day)}天前`;

  const date = new Date(timestamp);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function getCategoryInfo(categoryId: string) {
  return COMMUNITY_CATEGORIES.find(c => c.id === categoryId) || COMMUNITY_CATEGORIES[0];
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
      className="group cursor-pointer rounded-lg border p-4 transition-all duration-200"
      style={{
        background: 'rgba(16, 25, 46, 0.8)',
        borderColor: post.isPinned
          ? 'rgba(212, 165, 32, 0.6)'
          : post.isFeatured
          ? 'rgba(74, 124, 111, 0.5)'
          : 'rgba(212, 165, 32, 0.2)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(212, 165, 32, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {post.isPinned && (
              <span
                className="px-1.5 py-0.5 text-xs rounded"
                style={{ background: 'rgba(212, 165, 32, 0.2)', color: '#d4a520' }}
              >
                置顶
              </span>
            )}
            {post.isFeatured && (
              <span
                className="px-1.5 py-0.5 text-xs rounded"
                style={{ background: 'rgba(74, 124, 111, 0.3)', color: '#a7c5ba' }}
              >
                精华
              </span>
            )}
            <span
              className="px-1.5 py-0.5 text-xs rounded"
              style={{ background: 'rgba(80, 100, 150, 0.3)', color: '#a7c5ba' }}
            >
              {categoryInfo.icon} {categoryInfo.label}
            </span>
            {post.qaState === 'resolved' && (
              <span
                className="px-1.5 py-0.5 text-xs rounded"
                style={{ background: 'rgba(74, 175, 80, 0.2)', color: '#4ade80' }}
              >
                已解决
              </span>
            )}
          </div>

          <h3
            className="text-base font-serif mb-1 line-clamp-2"
            style={{ color: '#f5e6b8' }}
          >
            {post.title}
          </h3>

          <p className="text-sm line-clamp-2 mb-2" style={{ color: '#a7c5ba' }}>
            {post.summary}
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            {post.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="px-1.5 py-0.5 text-xs rounded"
                style={{ background: 'rgba(212, 165, 32, 0.1)', color: '#d4a520' }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: 'rgba(212, 165, 32, 0.15)' }}>
        <div className="flex items-center gap-3 text-xs" style={{ color: '#a7c5ba' }}>
          <span>{post.authorName}</span>
          <span>·</span>
          <span>{formatTimeAgo(post.publishedAt ?? post.createdAt)}</span>
          <span>·</span>
          <span>{post.viewCount}阅读</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); onLike(); }}
            className="flex items-center gap-1 text-xs transition-colors"
            style={{ color: isLiked ? '#f97316' : '#a7c5ba' }}
          >
            <span>{isLiked ? '❤️' : '🤍'}</span>
            <span>{post.likeCount}</span>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onFavorite(); }}
            className="flex items-center gap-1 text-xs transition-colors"
            style={{ color: isFavorited ? '#d4a520' : '#a7c5ba' }}
          >
            <span>{isFavorited ? '⭐' : '☆'}</span>
            <span>{post.favoriteCount}</span>
          </button>

          <span className="flex items-center gap-1 text-xs" style={{ color: '#a7c5ba' }}>
            💬 {post.commentCount}
          </span>
        </div>
      </div>
    </div>
  );
}
