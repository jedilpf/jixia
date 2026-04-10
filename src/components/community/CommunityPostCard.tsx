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
  const minute = 60_000;
  const hour = 3_600_000;
  const day = 86_400_000;

  if (diff < minute) return '刚刚';
  if (diff < hour) return `${Math.floor(diff / minute)}分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)}小时前`;
  if (diff < day * 7) return `${Math.floor(diff / day)}天前`;

  const date = new Date(timestamp);
  return `${date.getMonth() + 1}/${date.getDate()}`;
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
      className="group relative cursor-pointer overflow-hidden rounded-[20px] border p-5 transition-all duration-200"
      style={{
        background:
          'linear-gradient(180deg, rgba(47, 18, 15, 0.96) 0%, rgba(22, 8, 10, 0.96) 100%)',
        borderColor: post.isPinned
          ? 'rgba(212, 165, 32, 0.42)'
          : post.isFeatured
            ? 'rgba(184, 92, 55, 0.4)'
            : 'rgba(214, 151, 73, 0.16)',
        boxShadow: '0 12px 30px rgba(0,0,0,0.22)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 18px 36px rgba(0,0,0,0.28)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.22)';
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-20"
        style={{
          background:
            'linear-gradient(180deg, rgba(214,151,73,0.1) 0%, rgba(214,151,73,0) 100%)',
        }}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {post.isPinned ? (
              <span
                className="rounded-full px-2.5 py-1 text-[11px] tracking-wide"
                style={{ background: 'rgba(212, 165, 32, 0.16)', color: '#d4a520' }}
              >
                置顶
              </span>
            ) : null}
            {post.isFeatured ? (
              <span
                className="rounded-full px-2.5 py-1 text-[11px] tracking-wide"
                style={{ background: 'rgba(184, 92, 55, 0.22)', color: '#efc28e' }}
              >
                精华
              </span>
            ) : null}
            {post.qaState === 'resolved' ? (
              <span
                className="rounded-full px-2.5 py-1 text-[11px] tracking-wide"
                style={{ background: 'rgba(214, 151, 73, 0.18)', color: '#f2c36d' }}
              >
                已解决
              </span>
            ) : null}
            <span
              className="rounded-full px-2.5 py-1 text-[11px] tracking-wide"
              style={{ background: 'rgba(116, 41, 29, 0.3)', color: '#f1c697' }}
            >
              {categoryInfo.icon} {categoryInfo.label}
            </span>
          </div>

          <h3 className="mb-2 line-clamp-2 text-lg font-serif leading-8 text-[#f5e6b8]">
            {post.title}
          </h3>

          <p className="mb-4 line-clamp-2 text-sm leading-7 text-[#d9c3a0]">
            {post.summary}
          </p>

          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full px-2.5 py-1 text-[11px]"
                style={{ background: 'rgba(214, 151, 73, 0.1)', color: '#e7c484' }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div
        className="relative mt-4 flex flex-wrap items-center justify-between gap-3 pt-4"
        style={{ borderTop: '1px solid rgba(212, 165, 32, 0.12)' }}
      >
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#b89372]">
          <span>{post.authorName}</span>
          <span className="opacity-50">/</span>
          <span>{formatTimeAgo(post.publishedAt ?? post.createdAt)}</span>
          <span className="opacity-50">/</span>
          <span>{post.viewCount} 阅读</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLike();
            }}
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition-colors"
            style={{
              background: isLiked ? 'rgba(183, 54, 33, 0.2)' : 'rgba(255,244,230,0.04)',
              color: isLiked ? '#ff8a5b' : '#d9c3a0',
            }}
          >
            <span>{isLiked ? '♥' : '♡'}</span>
            <span>{post.likeCount}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite();
            }}
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition-colors"
            style={{
              background: isFavorited ? 'rgba(214, 151, 73, 0.16)' : 'rgba(255,244,230,0.04)',
              color: isFavorited ? '#d69849' : '#d9c3a0',
            }}
          >
            <span>{isFavorited ? '★' : '☆'}</span>
            <span>{post.favoriteCount}</span>
          </button>

          <span
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs"
            style={{ background: 'rgba(255,244,230,0.04)', color: '#d9c3a0' }}
          >
            <span>评</span>
            <span>{post.commentCount}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
