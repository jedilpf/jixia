import type { CommunityPost, CommunitySortMode } from '../../community/types';
import { CommunityPostCard } from './CommunityPostCard';

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
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-4xl mb-4">📜</div>
        <p className="text-lg font-serif mb-2" style={{ color: '#f5e6b8' }}>暂无帖子</p>
        <p className="text-sm" style={{ color: '#a7c5ba' }}>成为第一个发布内容的人吧！</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm" style={{ color: '#a7c5ba' }}>
          共 {posts.length} 篇帖子
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: '#a7c5ba' }}>排序：</span>
          <select
            value={sortMode}
            onChange={(e) => onSortChange(e.target.value as CommunitySortMode)}
            className="text-xs px-2 py-1 rounded border"
            style={{
              background: 'rgba(16, 25, 46, 0.8)',
              borderColor: 'rgba(212, 165, 32, 0.3)',
              color: '#f5e6b8',
            }}
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1" style={{ maxHeight: 'calc(100vh - 300px)' }}>
        {posts.map(post => (
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
