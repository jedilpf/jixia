import type { CommunityComment, CommunityPost } from '../../community/types';
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
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function getCategoryInfo(categoryId: string) {
  return COMMUNITY_CATEGORIES.find((c) => c.id === categoryId) || COMMUNITY_CATEGORIES[0];
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
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm transition-colors"
          style={{
            background: 'rgba(212, 165, 32, 0.1)',
            border: '1px solid rgba(212, 165, 32, 0.24)',
            color: '#d9c3a0',
          }}
        >
          返回
        </button>
        <span
          className="rounded-full px-3 py-1 text-xs"
          style={{ background: 'rgba(116, 41, 29, 0.3)', color: '#f1c697' }}
        >
          {categoryInfo.icon} {categoryInfo.label}
        </span>
        {post.isPinned ? (
          <span className="rounded-full px-3 py-1 text-xs" style={{ background: 'rgba(212,165,32,0.16)', color: '#d4a520' }}>
            置顶
          </span>
        ) : null}
        {post.isFeatured ? (
          <span className="rounded-full px-3 py-1 text-xs" style={{ background: 'rgba(184,92,55,0.22)', color: '#efc28e' }}>
            精华
          </span>
        ) : null}
        {post.qaState === 'resolved' ? (
          <span className="rounded-full px-3 py-1 text-xs" style={{ background: 'rgba(214,151,73,0.18)', color: '#f2c36d' }}>
            已解决
          </span>
        ) : null}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pr-1" style={{ overscrollBehavior: 'contain' }}>
        <div
          className="mb-4 rounded-[24px] border p-6"
          style={{
            background:
              'linear-gradient(180deg, rgba(47, 18, 15, 0.96) 0%, rgba(22, 8, 10, 0.96) 100%)',
            borderColor: 'rgba(214, 151, 73, 0.16)',
            boxShadow: '0 14px 32px rgba(0,0,0,0.22)',
          }}
        >
          <div
            className="mb-5 rounded-2xl p-5"
            style={{
              background:
                'linear-gradient(180deg, rgba(176,83,39,0.12) 0%, rgba(214,151,73,0.04) 100%)',
              border: '1px solid rgba(214, 151, 73, 0.08)',
            }}
          >
            <h1 className="mb-3 text-2xl font-serif leading-10 text-[#f5e6b8]">{post.title}</h1>

            <div className="flex flex-wrap items-center gap-2 text-sm text-[#b89372]">
              <span>{post.authorName}</span>
              {post.authorFaction ? <span>/ {post.authorFaction}</span> : null}
              <span>/ {formatDate(post.publishedAt ?? post.createdAt)}</span>
              <span>/ {post.viewCount} 阅读</span>
            </div>
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full px-3 py-1 text-xs"
                style={{ background: 'rgba(214, 151, 73, 0.1)', color: '#e7c484' }}
              >
                #{tag}
              </span>
            ))}
          </div>

          <div
            className="mb-6 whitespace-pre-wrap rounded-2xl border p-5 text-sm leading-8"
            style={{
              background: 'rgba(31, 10, 12, 0.58)',
              borderColor: 'rgba(214, 151, 73, 0.08)',
              color: '#d4bf99',
            }}
          >
            {post.content}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4" style={{ borderTop: '1px solid rgba(212, 165, 32, 0.12)' }}>
            <button
              onClick={onLike}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition-colors"
              style={{
                background: isLiked ? 'rgba(183, 54, 33, 0.2)' : 'rgba(255,244,230,0.04)',
                border: `1px solid ${isLiked ? 'rgba(183, 54, 33, 0.34)' : 'rgba(214, 151, 73, 0.14)'}`,
                color: isLiked ? '#ff8a5b' : '#d9c3a0',
              }}
            >
              <span>{isLiked ? '♥' : '♡'}</span>
              <span>点赞 {post.likeCount}</span>
            </button>

            <button
              onClick={onFavorite}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition-colors"
              style={{
                background: isFavorited ? 'rgba(214, 151, 73, 0.16)' : 'rgba(255,244,230,0.04)',
                border: `1px solid ${isFavorited ? 'rgba(214, 151, 73, 0.3)' : 'rgba(214, 151, 73, 0.14)'}`,
                color: isFavorited ? '#d69849' : '#d9c3a0',
              }}
            >
              <span>{isFavorited ? '★' : '☆'}</span>
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
