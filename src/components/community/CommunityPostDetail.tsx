import type { CommunityPost, CommunityComment } from '../../community/types';
import { COMMUNITY_CATEGORIES } from '../../community/types';
import { CommunityCommentSection } from './CommunityCommentSection';

interface CommunityPostDetailProps {
  post: CommunityPost;
  comments: CommunityComment[];
  isLiked: boolean;
  isFavorited: boolean;
  likedCommentIds: string[];
  onBack: () => void;
  onLike: () => void;
  onFavorite: () => void;
  onAddComment: (content: string, parentId: string | null) => void;
  onLikeComment: (commentId: string) => void;
  onAcceptAnswer?: (commentId: string) => void;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

function getCategoryInfo(categoryId: string) {
  return COMMUNITY_CATEGORIES.find(c => c.id === categoryId) || COMMUNITY_CATEGORIES[0];
}

export function CommunityPostDetail({
  post,
  comments,
  isLiked,
  isFavorited,
  likedCommentIds,
  onBack,
  onLike,
  onFavorite,
  onAddComment,
  onLikeComment,
  onAcceptAnswer,
}: CommunityPostDetailProps) {
  const categoryInfo = getCategoryInfo(post.category);
  const canAcceptAnswer = post.category === 'qa' && post.qaState !== 'resolved';

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors"
          style={{
            background: 'rgba(212, 165, 32, 0.1)',
            border: '1px solid rgba(212, 165, 32, 0.3)',
            color: '#a7c5ba',
          }}
        >
          ← 返回
        </button>
        <span
          className="px-2 py-1 text-xs rounded"
          style={{ background: 'rgba(80, 100, 150, 0.3)', color: '#a7c5ba' }}
        >
          {categoryInfo.icon} {categoryInfo.label}
        </span>
        {post.isPinned && (
          <span className="px-2 py-1 text-xs rounded" style={{ background: 'rgba(212, 165, 32, 0.2)', color: '#d4a520' }}>
            置顶
          </span>
        )}
        {post.isFeatured && (
          <span className="px-2 py-1 text-xs rounded" style={{ background: 'rgba(74, 124, 111, 0.3)', color: '#a7c5ba' }}>
            精华
          </span>
        )}
        {post.qaState === 'resolved' && (
          <span className="px-2 py-1 text-xs rounded" style={{ background: 'rgba(74, 175, 80, 0.2)', color: '#4ade80' }}>
            已解决
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 400px)' }}>
        <div
          className="rounded-lg border p-6 mb-4"
          style={{
            background: 'rgba(16, 25, 46, 0.8)',
            borderColor: 'rgba(212, 165, 32, 0.3)',
          }}
        >
          <h1 className="text-xl font-serif mb-3" style={{ color: '#f5e6b8' }}>
            {post.title}
          </h1>

          <div className="flex items-center gap-3 mb-4 text-sm" style={{ color: '#a7c5ba' }}>
            <span>{post.authorName}</span>
            {post.authorFaction && (
              <>
                <span>·</span>
                <span>{post.authorFaction}</span>
              </>
            )}
            <span>·</span>
            <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
            <span>·</span>
            <span>{post.viewCount}阅读</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-1 text-xs rounded"
                style={{ background: 'rgba(212, 165, 32, 0.1)', color: '#d4a520' }}
              >
                #{tag}
              </span>
            ))}
          </div>

          <div
            className="prose prose-sm max-w-none mb-6 whitespace-pre-wrap"
            style={{ color: '#d4bf99', lineHeight: 1.8 }}
          >
            {post.content}
          </div>

          <div className="flex items-center gap-4 pt-4 border-t" style={{ borderColor: 'rgba(212, 165, 32, 0.15)' }}>
            <button
              onClick={onLike}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-colors"
              style={{
                background: isLiked ? 'rgba(249, 115, 22, 0.2)' : 'rgba(16, 25, 46, 0.6)',
                border: `1px solid ${isLiked ? 'rgba(249, 115, 22, 0.5)' : 'rgba(212, 165, 32, 0.2)'}`,
                color: isLiked ? '#f97316' : '#a7c5ba',
              }}
            >
              <span>{isLiked ? '❤️' : '🤍'}</span>
              <span>点赞 {post.likeCount}</span>
            </button>

            <button
              onClick={onFavorite}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-colors"
              style={{
                background: isFavorited ? 'rgba(212, 165, 32, 0.2)' : 'rgba(16, 25, 46, 0.6)',
                border: `1px solid ${isFavorited ? 'rgba(212, 165, 32, 0.5)' : 'rgba(212, 165, 32, 0.2)'}`,
                color: isFavorited ? '#d4a520' : '#a7c5ba',
              }}
            >
              <span>{isFavorited ? '⭐' : '☆'}</span>
              <span>收藏 {post.favoriteCount}</span>
            </button>
          </div>
        </div>

        <CommunityCommentSection
          postId={post.id}
          comments={comments}
          likedCommentIds={likedCommentIds}
          acceptedCommentId={post.acceptedCommentId}
          canAcceptAnswer={canAcceptAnswer}
          onAddComment={onAddComment}
          onLikeComment={onLikeComment}
          onAcceptAnswer={onAcceptAnswer}
        />
      </div>
    </div>
  );
}
