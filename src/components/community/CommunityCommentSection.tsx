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
  const minute = 60000;
  const hour = 3600000;
  const day = 86400000;

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
  onLike: () => void;
  onAccept: () => void;
  onReply: (parentId: string) => void;
}

function CommentItem({ comment, isLiked, isAccepted, canAccept, onLike, onAccept, onReply }: CommentItemProps) {
  const isDeleted = comment.status === 'deleted' || comment.status === 'hidden';

  if (isDeleted) {
    return (
      <div className="py-3 text-sm italic" style={{ color: '#6b7280' }}>
        此评论已删除
      </div>
    );
  }

  return (
    <div
      className="py-3"
      style={{ borderBottom: '1px solid rgba(212, 165, 32, 0.1)' }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
          style={{ background: 'linear-gradient(135deg, #1a2840, #2a3c66)', color: '#f5e6b8' }}
        >
          {comment.authorName.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium" style={{ color: '#f5e6b8' }}>
              {comment.authorName}
            </span>
            {isAccepted && (
              <span
                className="px-1.5 py-0.5 text-xs rounded"
                style={{ background: 'rgba(74, 175, 80, 0.2)', color: '#4ade80' }}
              >
                ✅ 已采纳
              </span>
            )}
            <span className="text-xs" style={{ color: '#6b7280' }}>
              {formatTimeAgo(comment.createdAt)}
            </span>
          </div>

          <p className="text-sm mb-2 whitespace-pre-wrap" style={{ color: '#d4bf99' }}>
            {comment.content}
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={onLike}
              className="flex items-center gap-1 text-xs transition-colors"
              style={{ color: isLiked ? '#f97316' : '#6b7280' }}
            >
              {isLiked ? '❤️' : '🤍'} {comment.likeCount}
            </button>

            <button
              onClick={() => onReply(comment.id)}
              className="text-xs transition-colors"
              style={{ color: '#6b7280' }}
            >
              回复
            </button>

            {canAccept && !isAccepted && (
              <button
                onClick={onAccept}
                className="text-xs px-2 py-0.5 rounded transition-colors"
                style={{
                  background: 'rgba(74, 175, 80, 0.1)',
                  border: '1px solid rgba(74, 175, 80, 0.3)',
                  color: '#4ade80',
                }}
              >
                采纳答案
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

  const rootComments = comments.filter(c => c.parentId === null);
  const childComments = comments.filter(c => c.parentId !== null);

  const getChildren = (parentId: string) => childComments.filter(c => c.parentId === parentId);

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    onAddComment(newComment, replyToId);
    setNewComment('');
    setReplyToId(null);
  };

  const handleReply = (parentId: string) => {
    setReplyToId(parentId);
  };

  return (
    <div>
      <h3 className="text-sm font-serif mb-3" style={{ color: '#f5e6b8' }}>
        评论 ({comments.length})
      </h3>

      <div className="space-y-1 mb-4">
        {rootComments.map(comment => (
          <div key={comment.id}>
            <CommentItem
              comment={comment}
              isLiked={likedCommentIds.includes(comment.id)}
              isAccepted={acceptedCommentId === comment.id}
              canAccept={canAcceptAnswer}
              onLike={() => onLikeComment(comment.id)}
              onAccept={() => onAcceptAnswer?.(comment.id)}
              onReply={handleReply}
            />
            {getChildren(comment.id).map(child => (
              <div key={child.id} className="ml-8">
                <CommentItem
                  comment={child}
                  isLiked={likedCommentIds.includes(child.id)}
                  isAccepted={acceptedCommentId === child.id}
                  canAccept={false}
                  onLike={() => onLikeComment(child.id)}
                  onAccept={() => {}}
                  onReply={handleReply}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div
        className="rounded-lg border p-3"
        style={{
          background: 'rgba(16, 25, 46, 0.6)',
          borderColor: 'rgba(212, 165, 32, 0.2)',
        }}
      >
        {replyToId && (
          <div className="flex items-center gap-2 mb-2 text-xs" style={{ color: '#a7c5ba' }}>
            <span>回复评论</span>
            <button
              onClick={() => setReplyToId(null)}
              className="text-xs"
              style={{ color: '#f97316' }}
            >
              取消
            </button>
          </div>
        )}
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="发表你的看法..."
          rows={3}
          className="w-full px-3 py-2 rounded text-sm resize-none outline-none"
          style={{
            background: 'rgba(10, 15, 30, 0.6)',
            border: '1px solid rgba(212, 165, 32, 0.2)',
            color: '#f5e6b8',
          }}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleSubmit}
            disabled={!newComment.trim()}
            className="px-4 py-1.5 rounded text-sm transition-colors disabled:opacity-50"
            style={{
              background: 'rgba(212, 165, 32, 0.2)',
              border: '1px solid rgba(212, 165, 32, 0.4)',
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
