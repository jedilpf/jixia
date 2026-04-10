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
      <div className="py-3 text-sm italic text-[#6b7280]">
        此评论已删除
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border p-4"
      style={{
        background: nested ? 'rgba(35, 12, 13, 0.72)' : 'rgba(45, 18, 16, 0.8)',
        borderColor: nested ? 'rgba(214, 151, 73, 0.08)' : 'rgba(214, 151, 73, 0.12)',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm"
          style={{
            background: 'linear-gradient(135deg, #5a221b, #8f3827)',
            color: '#f5e6b8',
            border: '1px solid rgba(214, 151, 73, 0.18)',
          }}
        >
          {comment.authorName.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-[#f5e6b8]">{comment.authorName}</span>
            {isAccepted ? (
              <span
                className="rounded-full px-2 py-0.5 text-[11px]"
                style={{ background: 'rgba(214, 151, 73, 0.18)', color: '#f2c36d' }}
              >
                已采纳
              </span>
            ) : null}
            <span className="text-xs text-[#a87a5d]">{formatTimeAgo(comment.createdAt)}</span>
          </div>

          <p className="mb-3 whitespace-pre-wrap text-sm leading-7 text-[#d4bf99]">
            {comment.content}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onLike}
              className="flex items-center gap-1 text-xs transition-colors"
              style={{ color: isLiked ? '#ff8a5b' : '#b89372' }}
            >
              <span>{isLiked ? '♥' : '♡'}</span>
              <span>{comment.likeCount}</span>
            </button>

            <button
              onClick={() => onReply(comment.id)}
              className="text-xs text-[#b89372] transition-colors"
            >
              回复
            </button>

            {canAccept && !isAccepted ? (
              <button
                onClick={onAccept}
                className="rounded-full px-2.5 py-1 text-xs transition-colors"
                style={{
                  background: 'rgba(214, 151, 73, 0.14)',
                  border: '1px solid rgba(214, 151, 73, 0.28)',
                  color: '#f2c36d',
                }}
              >
                采纳答案
              </button>
            ) : null}
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
    <div
      className="rounded-[22px] border p-5"
      style={{
        background:
          'linear-gradient(180deg, rgba(49, 20, 17, 0.9) 0%, rgba(24, 9, 11, 0.88) 100%)',
        borderColor: 'rgba(214, 151, 73, 0.14)',
      }}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <h3 className="text-base font-serif text-[#f5e6b8]">评论区</h3>
          <span className="text-xs text-[#b89372]">共 {comments.length} 条讨论</span>
        </div>
      </div>

      <div className="mb-5 space-y-3">
        {rootComments.length === 0 ? (
          <div
            className="rounded-2xl px-4 py-8 text-center text-sm text-[#b89372]"
            style={{ background: 'rgba(35, 12, 13, 0.64)', border: '1px solid rgba(214, 151, 73, 0.08)' }}
          >
            还没有评论，来留下第一条看法吧。
          </div>
        ) : (
          rootComments.map((comment) => (
            <div key={comment.id} className="space-y-3">
              <CommentItem
                comment={comment}
                isLiked={likedCommentIds.includes(comment.id)}
                isAccepted={acceptedCommentId === comment.id}
                canAccept={canAcceptAnswer}
                onLike={() => onLikeComment(comment.id)}
                onAccept={() => onAcceptAnswer?.(comment.id)}
                onReply={setReplyToId}
              />
              {getChildren(comment.id).length > 0 ? (
                <div className="ml-6 space-y-3 border-l border-[rgba(214,151,73,0.1)] pl-4">
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
              ) : null}
            </div>
          ))
        )}
      </div>

      <div
        className="rounded-2xl border p-4"
        style={{
          background: 'rgba(35, 12, 13, 0.72)',
          borderColor: 'rgba(214, 151, 73, 0.1)',
        }}
      >
        {replyToId ? (
          <div className="mb-3 flex items-center gap-2 text-xs text-[#d9c3a0]">
            <span>正在回复一条评论</span>
            <button onClick={() => setReplyToId(null)} className="text-[#f97316]">
              取消
            </button>
          </div>
        ) : null}

        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="写下你的看法..."
          rows={4}
          className="w-full resize-none rounded-2xl border px-4 py-3 text-sm outline-none"
          style={{
            background: 'rgba(34, 12, 13, 0.84)',
            borderColor: 'rgba(214, 151, 73, 0.16)',
            color: '#f5e6b8',
          }}
        />

        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-xs text-[#a87a5d]">支持主评与楼中回复</span>
          <button
            onClick={handleSubmit}
            disabled={!newComment.trim()}
            className="rounded-xl px-4 py-2 text-sm transition-colors disabled:opacity-50"
            style={{
              background: 'linear-gradient(180deg, rgba(176, 83, 39, 0.34), rgba(214, 151, 73, 0.12))',
              border: '1px solid rgba(214, 151, 73, 0.32)',
              color: '#f5e6b8',
            }}
          >
            发布评论
          </button>
        </div>
      </div>
    </div>
  );
}
