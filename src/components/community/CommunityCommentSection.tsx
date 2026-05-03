import { useState } from 'react';
import type { CommunityComment } from '../../community/types';

interface CommunityCommentSectionProps {
  postId: string;
  comments: CommunityComment[];
  likedCommentIds: string[];
  acceptedCommentId: string | null | undefined;
  canAcceptAnswer: boolean;
  onAddComment: (content: string, parentId: string | null) => void;
  onLikeComment: (commentId: string) => void;
  onAcceptAnswer?: (commentId: string) => void;
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

interface CommentItemProps {
  comment: CommunityComment;
  isLiked: boolean;
  isAccepted: boolean;
  canAccept: boolean;
  nested?: boolean;
  onLike: () => void;
  onAccept: () => void;
  onReply: (parentId: string) => void;
}

function CommentItem({
  comment,
  isLiked,
  isAccepted,
  canAccept,
  nested = false,
  onLike,
  onAccept,
  onReply,
}: CommentItemProps) {
  const isDeleted = comment.status === 'deleted' || comment.status === 'hidden';

  if (isDeleted) {
    return (
      <div className="py-3 text-[11px] italic text-[#f6e4c3]/20 tracking-widest uppercase">
        Message Dissolved
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border p-5 transition-all ${nested ? 'bg-[#0a0503]/20' : 'bg-[#0a0503]/40 shadow-lg'}`}
      style={{
        borderColor: isAccepted ? 'rgba(212, 175, 101, 0.4)' : 'rgba(212, 175, 101, 0.1)',
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-black tracking-widest uppercase"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            color: '#D4AF65',
            border: '1px solid rgba(212, 175, 101, 0.2)',
          }}
        >
          {comment.authorName.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
               <span className="text-sm font-serif text-[#f6e4c3]">{comment.authorName}</span>
               {isAccepted && (
                 <span className="px-2 py-0.5 text-[9px] font-black tracking-widest uppercase bg-[#D4AF65] text-[#0a0503] rounded-sm">
                   Accepted
                 </span>
               )}
            </div>
            <span className="text-[10px] font-black tracking-widest uppercase text-[#f6e4c3]/20">{formatTimeAgo(comment.createdAt)}</span>
          </div>

          <p className="mb-4 whitespace-pre-wrap text-[13px] leading-relaxed text-[#f6e4c3]/60 font-serif">
            {comment.content}
          </p>

          <div className="flex items-center gap-6">
            <button
              onClick={onLike}
              className={`flex items-center gap-1.5 transition-all hover:scale-110 ${isLiked ? 'text-[#831843]' : 'text-[#f6e4c3]/20 hover:text-[#f6e4c3]/40'}`}
            >
              <span className="text-[10px] font-black uppercase tracking-widest">{isLiked ? 'Liked' : 'Like'}</span>
              <span className="font-mono text-[10px]">{comment.likeCount}</span>
            </button>

            <button
              onClick={() => onReply(comment.id)}
              className="text-[10px] font-black uppercase tracking-widest text-[#f6e4c3]/20 hover:text-[#D4AF65] transition-colors"
            >
              Reply
            </button>

            {canAccept && !isAccepted && (
              <button
                onClick={onAccept}
                className="px-3 py-1 text-[9px] font-black tracking-widest uppercase bg-[#D4AF65]/10 border border-[#D4AF65]/30 text-[#D4AF65] rounded-md hover:bg-[#D4AF65] hover:text-[#0a0503] transition-all"
              >
                Accept Answer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CommunityCommentSection({
  comments,
  likedCommentIds,
  acceptedCommentId,
  canAcceptAnswer,
  onAddComment,
  onLikeComment,
  onAcceptAnswer,
}: CommunityCommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);

  const rootComments = comments.filter((c) => c.parentId === null);
  const childComments = comments.filter((c) => c.parentId !== null);
  const getChildren = (parentId: string) => childComments.filter((c) => c.parentId === parentId);

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    onAddComment(newComment, replyToId);
    setNewComment('');
    setReplyToId(null);
  };

  return (
    <div className="mt-8 space-y-8">
      <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div className="flex flex-col">
          <h3 className="text-xl font-serif text-[#f6e4c3] tracking-wider">讨论室</h3>
          <p className="text-[10px] font-black tracking-widest uppercase text-[#f6e4c3]/20 mt-1">Total {comments.length} Dialogues</p>
        </div>
      </div>

      <div className="space-y-4">
        {rootComments.length === 0 ? (
          <div className="rounded-2xl py-12 text-center bg-white/5 border border-white/10">
            <p className="text-[11px] font-black tracking-widest uppercase text-[#f6e4c3]/20">Empty Space · Awaiting Wisdom</p>
          </div>
        ) : (
          rootComments.map((comment) => (
            <div key={comment.id} className="space-y-4">
              <CommentItem
                comment={comment}
                isLiked={likedCommentIds.includes(comment.id)}
                isAccepted={acceptedCommentId === comment.id}
                canAccept={canAcceptAnswer}
                onLike={() => onLikeComment(comment.id)}
                onAccept={() => onAcceptAnswer?.(comment.id)}
                onReply={setReplyToId}
              />
              {getChildren(comment.id).length > 0 && (
                <div className="ml-10 space-y-4 border-l border-white/5 pl-6">
                  {getChildren(comment.id).map((child) => (
                    <CommentItem
                      key={child.id}
                      comment={child}
                      isLiked={likedCommentIds.includes(child.id)}
                      isAccepted={acceptedCommentId === child.id}
                      canAccept={false}
                      nested
                      onLike={() => onLikeComment(child.id)}
                      onAccept={() => {}}
                      onReply={setReplyToId}
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="relative rounded-2xl border p-6 bg-[#0a0503]/60 shadow-2xl" style={{ borderColor: 'rgba(212, 175, 101, 0.2)' }}>
        {replyToId && (
          <div className="mb-4 flex items-center justify-between px-4 py-2 bg-[#D4AF65]/10 border border-[#D4AF65]/30 rounded-lg">
            <span className="text-[10px] font-black tracking-widest uppercase text-[#D4AF65]">Replying to comment</span>
            <button onClick={() => setReplyToId(null)} className="text-[10px] font-black tracking-widest uppercase text-[#831843] hover:underline">Cancel</button>
          </div>
        )}

        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="写下你的看法..."
          rows={3}
          className="w-full bg-transparent text-sm text-[#f6e4c3] outline-none placeholder:text-[#f6e4c3]/20 resize-none font-serif leading-relaxed"
        />

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/5 pt-4">
          <span className="text-[10px] font-black tracking-widest uppercase text-[#f6e4c3]/20">Dialogue Gateway</span>
          <button
            onClick={handleSubmit}
            disabled={!newComment.trim()}
            className="px-8 py-2 text-[11px] font-black tracking-widest uppercase bg-[#D4AF65] text-[#0a0503] rounded-lg shadow-[0_0_20px_rgba(212,175,101,0.2)] hover:scale-105 active:scale-95 transition-all disabled:opacity-20"
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}
