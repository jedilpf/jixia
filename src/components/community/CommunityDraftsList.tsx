import type { CommunityDraft } from '../../community/types';
import { CommunityEmptyState } from './CommunityEmptyState';

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
  const minute = 60_000;
  const hour = 3_600_000;
  const day = 86_400_000;

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
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="rounded-xl px-3 py-2 text-sm"
            style={{
              background: 'rgba(212, 165, 32, 0.1)',
              border: '1px solid rgba(212, 165, 32, 0.24)',
              color: '#d9c3a0',
            }}
          >
            返回
          </button>
        </div>
        <CommunityEmptyState icon="📝" title="草稿箱为空" message="发布内容时可以先保存草稿，晚点再回来继续编辑。" />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="rounded-xl px-3 py-2 text-sm"
          style={{
            background: 'rgba(212, 165, 32, 0.1)',
            border: '1px solid rgba(212, 165, 32, 0.24)',
            color: '#d9c3a0',
          }}
        >
          返回
        </button>
        <div className="flex flex-col">
          <span className="font-serif text-[#f5e6b8]">草稿箱</span>
          <span className="text-xs text-[#b89372]">共 {drafts.length} 份未发布内容</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 space-y-4 overflow-y-auto pr-1" style={{ overscrollBehavior: 'contain' }}>
        {drafts.map((draft) => (
          <div
            key={draft.id}
            className="rounded-[20px] border p-5"
            style={{
              background:
                'linear-gradient(180deg, rgba(47, 18, 15, 0.94) 0%, rgba(22, 8, 10, 0.94) 100%)',
              borderColor: 'rgba(214, 151, 73, 0.14)',
            }}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="mb-2 line-clamp-1 text-lg font-serif text-[#f5e6b8]">
                  {draft.title || '未命名草稿'}
                </h3>
                <p className="line-clamp-2 text-sm leading-7 text-[#d9c3a0]">
                  {draft.summary || `${draft.content.slice(0, 80)}...`}
                </p>
              </div>
              <span className="rounded-full px-2.5 py-1 text-[11px]" style={{ background: 'rgba(214,151,73,0.1)', color: '#e7c484' }}>
                草稿
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4" style={{ borderColor: 'rgba(212, 165, 32, 0.1)' }}>
              <span className="text-xs text-[#a87a5d]">更新于 {formatTimeAgo(draft.updatedAt)}</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onDeleteDraft(draft.id)}
                  className="rounded-xl px-3 py-1.5 text-xs"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.24)',
                    color: '#ef4444',
                  }}
                >
                  删除
                </button>
                <button
                  onClick={() => onEditDraft(draft.id)}
                  className="rounded-xl px-3 py-1.5 text-xs"
                  style={{
                    background: 'rgba(70, 21, 18, 0.26)',
                    border: '1px solid rgba(214, 151, 73, 0.16)',
                    color: '#d9c3a0',
                  }}
                >
                  编辑
                </button>
                <button
                  onClick={() => onPublishDraft(draft.id)}
                  className="rounded-xl px-3 py-1.5 text-xs"
                  style={{
                    background: 'linear-gradient(180deg, rgba(176, 83, 39, 0.34), rgba(214, 151, 73, 0.12))',
                    border: '1px solid rgba(214, 151, 73, 0.3)',
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
