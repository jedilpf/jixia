import { getLeadingDirection } from '@/core/issueSystem';
import type { IssueDirectionId, IssueState } from '@/core/types';
import { ISSUES } from '@/data/game/issues';

interface IssueBarProps {
  issueState: IssueState | null;
}

const defaultDirectionLabel: Record<IssueDirectionId, string> = {
  ritual: '礼法',
  economy: '富民',
  strategy: '权变',
};

export function IssueBar({ issueState }: IssueBarProps) {
  if (!issueState) {
    return (
      <div className="rounded-lg border border-[#5f523e] bg-[#16120d] p-3 text-sm text-[#9f8a6d]">
        暂无议题数据
      </div>
    );
  }

  const issueDef = ISSUES.find((item) => item.id === issueState.id);
  const leading = getLeadingDirection(issueState);
  const percent =
    issueState.triggerThreshold > 0
      ? Math.min(100, Math.round((issueState.heat / issueState.triggerThreshold) * 100))
      : 0;

  const labelMap = issueDef?.directionLabels ?? defaultDirectionLabel;

  return (
    <div className="rounded-lg border border-[#5f523e] bg-[#16120d] p-3">
      <div className="mb-2 text-sm font-semibold text-[#f1d7a8]">中央议题：{issueState.name}</div>
      <div className="mb-2 text-xs text-[#ceb792]">阶段：{issueState.stage === 'seed' ? '议题种子' : issueState.stage === 'contested' ? '争夺中' : '已锁定'}</div>
      <div className="mb-2 h-2 rounded bg-[#2d261b]">
        <div className="h-2 rounded bg-[#c69a54]" style={{ width: `${percent}%` }} />
      </div>
      <div className="mb-2 text-xs text-[#ceb792]">热度：{issueState.heat}/{issueState.triggerThreshold}</div>
      <div className="space-y-1 text-xs text-[#c9b28d]">
        {(Object.keys(issueState.directionScore) as IssueDirectionId[]).map((direction) => (
          <div key={direction} className="flex items-center justify-between">
            <span>{labelMap[direction] ?? defaultDirectionLabel[direction]}</span>
            <span>{issueState.directionScore[direction]}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 text-xs text-[#9f8a6d]">
        当前领先方向：{leading ? labelMap[leading] ?? defaultDirectionLabel[leading] : '暂无'}
      </div>
      <div className="text-xs text-[#9f8a6d]">
        引爆检查：每 {issueState.burstCheckEvery} 轮一次
        {issueState.lastBurstRound ? `（上次触发：第 ${issueState.lastBurstRound} 轮）` : ''}
      </div>
    </div>
  );
}
