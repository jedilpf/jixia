import { useRef } from 'react';
import type { CommunityPost, CommunitySortMode } from '../../community/types';
import { CommunityPostCard } from './CommunityPostCard';
import { CommunityEmptyState } from './CommunityEmptyState';
import { IconBambooSlips } from '@/components/common/JixiaIcons';

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
  { value: 'recommended', label: '推荐' },
  { value: 'latest', label: '新撰' },
  { value: 'hot', label: '热议' },
  { value: 'featured', label: '精华' },
  { value: 'most_favorited', label: '珍藏' },
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
    return <CommunityEmptyState icon={<IconBambooSlips size={32} color="#d4a520" />} title="尚无篇章" message="此处静待文人，稍后再来，或提笔开篇。" />;
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* 筛选栏 - 竹简风格 */}
      <div
        className="mb-3 flex flex-wrap items-center justify-between gap-3 px-3 py-2"
        onWheel={(e) => {
          e.preventDefault();
          forwardWheelToList(e.deltaY);
        }}
        style={{
          background: 'rgba(28, 12, 10, 0.6)',
          borderBottom: '1px solid rgba(139, 90, 43, 0.2)',
        }}
      >
        <div className="flex items-center gap-2 font-serif">
          <span className="text-sm text-[#d4a520]">{posts.length}</span>
          <span className="text-xs text-[#b89372]">篇</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-serif text-[#8b5a2b]">按</span>
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
                className="px-2 py-1 text-xs font-serif transition-all"
                style={{
                  background: isActive
                    ? 'rgba(139, 90, 43, 0.25)'
                    : 'rgba(20, 8, 6, 0.5)',
                  border: isActive
                    ? '1px solid rgba(212, 165, 32, 0.4)'
                    : '1px solid rgba(139, 90, 43, 0.15)',
                  color: isActive ? '#d4a520' : '#b89372',
                  borderRadius: '2px',
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 帖子列表 */}
      <div
        ref={scrollContainerRef}
        tabIndex={-1}
        className="flex-1 min-h-0 space-y-3 overflow-y-auto pr-1 outline-none"
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
