import type { CommunityDraft } from '../../community/types';
import { CommunityEmptyState } from './CommunityEmptyState';
import { IconBrush, IconPlus, IconCheck } from '@/components/common/JixiaIcons';

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
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* 简洁页眉 */}
      <header className="shrink-0 flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="px-4 py-1.5 text-[10px] font-black tracking-widest uppercase bg-white/5 border border-white/10 text-[#f6e4c3]/40 rounded-lg hover:bg-white/10 transition-all"
          >
            返回文库
          </button>
          <div className="flex flex-col">
            <span className="font-serif text-xl text-[#f6e4c3] tracking-wider">草稿箱 (Drafts)</span>
            <span className="text-[10px] font-black tracking-widest uppercase text-[#f6e4c3]/20 mt-1">共 {drafts.length} 篇未完成的篇章</span>
          </div>
        </div>
      </header>

      {/* 草稿列表 */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar space-y-5">
        {drafts.length === 0 ? (
          <CommunityEmptyState 
            icon={<IconBrush size={40} color="rgba(212,175,101,0.2)" />} 
            title="墨砚尚空" 
            message="目前还没有保存的草稿。提笔论道时可点击“存为草稿”以便后续编辑。" 
          />
        ) : (
          drafts.map((draft) => (
            <div
              key={draft.id}
              className="relative rounded-2xl border p-6 transition-all bg-[#0a0503]/40 hover:bg-[#0a0503]/60 group"
              style={{ borderColor: 'rgba(212, 175, 101, 0.1)' }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* 文本内容区 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-serif text-[#f6e4c3] line-clamp-1 group-hover:text-[#D4AF65] transition-colors">
                      {draft.title || '无标题篇章'}
                    </h3>
                    <span className="px-2 py-0.5 text-[9px] font-black bg-[#D4AF65]/10 text-[#D4AF65] border border-[#D4AF65]/20 rounded-sm">DRAFT</span>
                  </div>
                  <p className="text-sm text-[#f6e4c3]/30 line-clamp-2 leading-relaxed mb-3">
                    {draft.summary || `${draft.content.slice(0, 100)}...`}
                  </p>
                  <span className="text-[10px] font-black tracking-widest text-[#f6e4c3]/20 uppercase">
                    最后编辑：{formatTimeAgo(draft.updatedAt)}
                  </span>
                </div>

                {/* 显性操作区 (Action Bar) */}
                <div className="shrink-0 flex items-center gap-3 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6">
                  <button
                    onClick={() => onDeleteDraft(draft.id)}
                    className="px-4 py-2 text-[10px] font-black tracking-widest uppercase text-[#831843]/60 hover:text-[#831843] transition-colors"
                    title="废弃此篇"
                  >
                    废弃
                  </button>
                  <button
                    onClick={() => onEditDraft(draft.id)}
                    className="flex items-center gap-2 px-5 py-2 text-[10px] font-black tracking-widest uppercase bg-white/5 border border-white/10 text-[#f6e4c3]/80 rounded-xl hover:bg-white/10 transition-all"
                  >
                    继续撰写
                  </button>
                  <button
                    onClick={() => onPublishDraft(draft.id)}
                    className="flex items-center gap-2 px-6 py-2 text-[10px] font-black tracking-widest uppercase bg-[#D4AF65] text-[#0a0503] rounded-xl shadow-[0_0_20px_rgba(212,175,101,0.2)] hover:scale-105 active:scale-95 transition-all"
                  >
                    立即发表
                  </button>
                </div>
              </div>

              {/* 装饰金丝线 (Hover 显现) */}
              <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-[#D4AF65]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
