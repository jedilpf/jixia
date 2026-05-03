import type { CommunityPost } from '../../community/types';
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
}

export function CommunityPostList({
  posts,
  likedPostIds,
  favoritedPostIds,
  onPostClick,
  onLike,
  onFavorite,
}: CommunityPostListProps) {
  if (posts.length === 0) {
    return (
      <CommunityEmptyState 
        icon={<IconBambooSlips size={48} color="rgba(212,175,101,0.1)" />} 
        title="文库寂静" 
        message="当前分类尚无相关文献记录。提笔论道，开启新的篇章。" 
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
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
  );
}
