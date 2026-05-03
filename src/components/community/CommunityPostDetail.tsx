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
    <div className="flex h-full min-h-0 flex-col gap-5 overflow-hidden">
      {/* 顶部操作区 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="px-4 py-1.5 text-[10px] font-black tracking-widest uppercase bg-white/5 border border-white/10 text-[#f6e4c3]/60 rounded-lg hover:bg-white/10 transition-all"
          >
            Back
          </button>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[9px] font-black tracking-widest uppercase bg-white/5 border border-white/10 text-[#f6e4c3]/40 rounded-sm">
              {categoryInfo.label}
            </span>
            {post.isPinned && (
              <span className="px-2 py-0.5 text-[9px] font-black tracking-widest uppercase bg-[#831843] text-white rounded-sm">
                Pinned
              </span>
            )}
            {post.isFeatured && (
              <span className="px-2 py-0.5 text-[9px] font-black tracking-widest uppercase bg-[#D4AF65] text-[#0a0503] rounded-sm">
                Featured
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pr-1" style={{ overscrollBehavior: 'contain' }}>
        <div
          className="relative mb-6 rounded-3xl border p-8"
          style={{
            background: 'rgba(10, 5, 3, 0.6)',
            backdropFilter: 'blur(12px)',
            borderColor: 'rgba(212, 175, 101, 0.15)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          }}
        >
          {/* 金丝装饰 */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#D4AF65]/30 to-transparent" />

          <header className="mb-8 border-b border-white/5 pb-8">
            <h1 className="mb-4 text-3xl font-serif leading-relaxed text-[#f6e4c3] tracking-wide">
              {post.title}
            </h1>

            <div className="flex items-center gap-3 text-[10px] font-black tracking-widest uppercase text-[#f6e4c3]/30">
              <span className="text-[#D4AF65]">{post.authorName}</span>
              <span className="w-1 h-1 bg-white/10 rounded-full" />
              {post.authorFaction && (
                <>
                  <span>{post.authorFaction}</span>
                  <span className="w-1 h-1 bg-white/10 rounded-full" />
                </>
              )}
              <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
              <span className="w-1 h-1 bg-white/10 rounded-full" />
              <span>{post.viewCount} VIEWS</span>
            </div>
          </header>

          <div className="mb-8 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-[9px] font-black tracking-widest uppercase text-[#D4AF65]/40"
              >
                #{tag}
              </span>
            ))}
          </div>

          <article
            className="mb-10 text-base leading-[1.8] text-[#f6e4c3]/80 font-serif whitespace-pre-wrap"
          >
            {post.content}
          </article>

          <footer className="flex items-center gap-6 pt-8 border-t border-white/5">
            <button
              onClick={onLike}
              className={`flex items-center gap-2 px-6 py-2 rounded-full border transition-all ${
                isLiked 
                  ? 'bg-[#831843]/10 border-[#831843] text-[#831843] shadow-[0_0_15px_rgba(131,24,67,0.2)]' 
                  : 'bg-white/5 border-white/10 text-[#f6e4c3]/40 hover:border-[#f6e4c3]/20'
              }`}
            >
              <span className="text-xs font-black uppercase tracking-widest">{isLiked ? 'Liked' : 'Like'}</span>
              <span className="font-mono text-xs">{post.likeCount}</span>
            </button>

            <button
              onClick={onFavorite}
              className={`flex items-center gap-2 px-6 py-2 rounded-full border transition-all ${
                isFavorited 
                  ? 'bg-[#D4AF65]/10 border-[#D4AF65] text-[#D4AF65] shadow-[0_0_15px_rgba(212,175,101,0.2)]' 
                  : 'bg-white/5 border-white/10 text-[#f6e4c3]/40 hover:border-[#f6e4c3]/20'
              }`}
            >
              <span className="text-xs font-black uppercase tracking-widest">{isFavorited ? 'Saved' : 'Save'}</span>
              <span className="font-mono text-xs">{post.favoriteCount}</span>
            </button>
          </footer>
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
