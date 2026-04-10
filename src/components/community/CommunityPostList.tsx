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

        <div
          className="flex flex-col items-start gap-2 rounded-2xl border px-3 py-2"
          style={{
            background: 'linear-gradient(180deg, rgba(57, 20, 19, 0.88), rgba(28, 10, 11, 0.9))',
            borderColor: 'rgba(214, 151, 73, 0.16)',
            boxShadow: 'inset 0 1px 0 rgba(255, 221, 164, 0.05)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-[0.22em] text-[#b89372]">排序</span>
            <span className="rounded-full px-2 py-0.5 text-[10px] text-[#d8bb72]" style={{ background: 'rgba(214, 151, 73, 0.1)' }}>
              当前: {SORT_OPTIONS.find((option) => option.value === sortMode)?.label}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {SORT_OPTIONS.map((option) => {
              const isActive = option.value === sortMode;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onSortChange(option.value)}
                  onWheel={(e) => {
                    e.preventDefault();
                    forwardWheelToList(e.deltaY);
                  }}
                  className="rounded-full px-3 py-1.5 text-xs transition-all"
                  style={{
                    background: isActive
                      ? 'linear-gradient(180deg, rgba(176, 83, 39, 0.4), rgba(214, 151, 73, 0.16))'
                      : 'rgba(34, 12, 13, 0.76)',
                    border: `1px solid ${isActive ? 'rgba(214, 151, 73, 0.38)' : 'rgba(214, 151, 73, 0.14)'}`,
                    color: isActive ? '#f5e6b8' : '#d9c3a0',
                    boxShadow: isActive ? '0 6px 18px rgba(176, 83, 39, 0.18)' : 'none',
                  }}
                >
                  {isActive ? '◆ ' : ''}
                  {option.label}
                </button>
              );
            })}
          </div>
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
