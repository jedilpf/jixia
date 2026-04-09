import type { CommunityDraft } from '../../community/types';

interface CommunityDraftsListProps {
  drafts: CommunityDraft[];
  onEditDraft: (draftId: string) => void;
  onDeleteDraft: (draftId: string) => void;
  onPublishDraft: (draftId: string) => void;
  onBack: () => void;
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
  return `${Math.floor(diff / day)}天前`;
}

export function CommunityDraftsList({
  drafts,
  onEditDraft,
  onDeleteDraft,
  onPublishDraft,
  onBack,
}: CommunityDraftsListProps) {
  if (drafts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-4xl mb-4">📁</div>
        <p className="text-lg font-serif mb-2" style={{ color: '#f5e6b8' }}>草稿箱为空</p>
        <p className="text-sm mb-4" style={{ color: '#a7c5ba' }}>发布帖子时可以选择保存草稿</p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-lg text-sm"
          style={{
            background: 'rgba(212, 165, 32, 0.2)',
            border: '1px solid rgba(212, 165, 32, 0.4)',
            color: '#f5e6b8',
          }}
        >
          返回首页
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="px-3 py-1.5 rounded-lg text-sm"
          style={{
            background: 'rgba(212, 165, 32, 0.1)',
            border: '1px solid rgba(212, 165, 32, 0.3)',
            color: '#a7c5ba',
          }}
        >
          ← 返回
        </button>
        <span className="text-sm font-serif" style={{ color: '#f5e6b8' }}>草稿箱</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        {drafts.map(draft => (
          <div
            key={draft.id}
            className="p-4 rounded-lg border"
            style={{
              background: 'rgba(16, 25, 46, 0.8)',
              borderColor: 'rgba(212, 165, 32, 0.2)',
            }}
          >
            <h3 className="text-base font-serif mb-2" style={{ color: '#f5e6b8' }}>
              {draft.title || '无标题'}
            </h3>
            <p className="text-sm line-clamp-2 mb-3" style={{ color: '#a7c5ba' }}>
              {draft.summary || draft.content.slice(0, 80) + '...'}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: '#6b7280' }}>
                保存于 {formatTimeAgo(draft.updatedAt)}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => onDeleteDraft(draft.id)}
                  className="px-3 py-1 rounded text-xs"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                  }}
                >
                  删除
                </button>
                <button
                  onClick={() => onEditDraft(draft.id)}
                  className="px-3 py-1 rounded text-xs"
                  style={{
                    background: 'rgba(212, 165, 32, 0.1)',
                    border: '1px solid rgba(212, 165, 32, 0.3)',
                    color: '#a7c5ba',
                  }}
                >
                  编辑
                </button>
                <button
                  onClick={() => onPublishDraft(draft.id)}
                  className="px-3 py-1 rounded text-xs"
                  style={{
                    background: 'rgba(212, 165, 32, 0.2)',
                    border: '1px solid rgba(212, 165, 32, 0.4)',
                    color: '#f5e6b8',
                  }}
                >
                  发布
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
