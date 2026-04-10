import { useRef } from 'react';
import type { CommunityPost, CommunitySortMode } from '../../community/types';
import { CommunityPostCard } from './CommunityPostCard';
import { CommunityEmptyState } from './CommunityEmptyState';

interface CommunityPostListProps {
  posts: CommunityPost[];
  likedPostIds: string[];
  favoritedPostIds: string[];
  onPostClick: (postId: string) => void;
  onLike: (postId: string) => void;
  onFavorite: (postId: string) => void;
  sortMode: CommunitySortMode;
  onSortChange: (mode: CommunitySortMode) => void;
}

const SORT_OPTIONS: { value: CommunitySortMode; label: string }[] = [
  { value: 'latest', label: '最新' },
  { value: 'hot', label: '最热' },
  { value: 'featured', label: '精华' },
  { value: 'most_favorited', label: '收藏最多' },
];

export function CommunityPostList({
  posts,
  likedPostIds,
  favoritedPostIds,
  onPostClick,
  onLike,
  onFavorite,
  sortMode,
  onSortChange,
}: CommunityPostListProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const forwardWheelToList = (deltaY: number) => {
    scrollContainerRef.current?.scrollBy({ top: deltaY });
  };

  if (posts.length === 0) {
    return <CommunityEmptyState icon="🗂" title="暂无帖子" message="这里还很安静，稍后再来看看，或者成为第一个发言的人。" />;
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3"
        onWheel={(e) => {
          e.preventDefault();
          forwardWheelToList(e.deltaY);
        }}
        style={{
            background: 'rgba(37, 13, 14, 0.72)',
            borderColor: 'rgba(214, 151, 73, 0.12)',
        }}
      >
        <div className="flex flex-col">
          <span className="text-sm tracking-wide text-[#f5e6b8]">共 {posts.length} 篇内容</span>
          <span className="text-xs text-[#b89372]">按当前筛选与排序显示社区内容</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#b89372]">排序</span>
          <select
            value={sortMode}
            onChange={(e) => {
              onSortChange(e.target.value as CommunitySortMode);
              e.currentTarget.blur();
              requestAnimationFrame(() => {
                scrollContainerRef.current?.focus({ preventScroll: true });
              });
            }}
            onWheel={(e) => {
              e.preventDefault();
              e.currentTarget.blur();
              forwardWheelToList(e.deltaY);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.blur();
            }}
            className="rounded-xl border px-3 py-2 text-xs outline-none"
            style={{
                background: 'rgba(34, 12, 13, 0.9)',
                borderColor: 'rgba(214, 151, 73, 0.22)',
              color: '#f5e6b8',
            }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        tabIndex={-1}
        className="flex-1 min-h-0 space-y-4 overflow-y-auto pr-1 outline-none"
        style={{ overscrollBehavior: 'contain' }}
      >
        {posts.map((post) => (
          <CommunityPostCard
            key={post.id}
            post={post}
            isLiked={likedPostIds.includes(post.id)}
            isFavorited={favoritedPostIds.includes(post.id)}
            onClick={() => onPostClick(post.id)}
            onLike={() => onLike(post.id)}
            onFavorite={() => onFavorite(post.id)}
          />
        ))}
      </div>
    </div>
  );
}
