/**
 * 战斗日志抽屉
 * 显示出牌记录、结算记录、议题推进记录
 */

import React from 'react';
import { BattleLog } from '@/battleV2/types';

interface LogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: BattleLog[];
}

const LOG_TYPE_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  action: { color: '#3A5F41', icon: '行', label: '名士行动' },
  effect: { color: '#1A1A1A', icon: '效', label: '言辞效果' },
  result: { color: '#D4AF65', icon: '结', label: '定论结果' },
  damage: { color: '#8D2F2F', icon: '伤', label: '辩锋挫损' },
  heal: { color: '#3A5F41', icon: '愈', label: '根基固守' },
  system: { color: '#5C4033', icon: '系', label: '司议笔录' },
};

const LogDrawer: React.FC<LogDrawerProps> = ({ isOpen, onClose, logs }) => {
  if (!isOpen) return null;

  const groupedLogs = logs.reduce((acc, log) => {
    if (!acc[log.round]) acc[log.round] = [];
    acc[log.round].push(log);
    return acc;
  }, {} as Record<number, BattleLog[]>);

  const rounds = Object.keys(groupedLogs)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="fixed inset-0 z-[100] flex animate-in fade-in duration-500">
      <div className="flex-1 bg-[#1A1A1A]/40 backdrop-blur-sm" onClick={onClose} />

      <div className="w-[450px] h-full bg-[#FDFBF7] border-l-4 border-white shadow-[-50px_0_100px_rgba(0,0,0,0.2)] flex flex-col pt-safe animate-in slide-in-from-right duration-500">
        <div className="h-24 px-8 flex items-center justify-between border-b border-[#1A1A1A]/5 bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1A1A1A]/5 flex items-center justify-center text-[#1A1A1A]">
               <span className="text-sm font-black">录</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-[#1A1A1A] uppercase tracking-tight">论战笔录</h2>
              <p className="text-[10px] font-black text-[#5C4033]/40 uppercase tracking-widest">{logs.length} RECORDS FILED</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#1A1A1A]/5 flex items-center justify-center text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all active:scale-90"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-8 space-y-10 relative">
          <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-0">
             <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
          </div>
          
          <div className="relative z-10 space-y-10">
            {rounds.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20 py-20 text-center">
                <div className="text-6xl font-black italic mb-4">无</div>
                <p className="text-sm font-black tracking-widest uppercase">司议尚未开笔，论争犹待后续</p>
              </div>
            ) : (
              rounds.map((round) => (
                <RoundGroup key={round} round={round} logs={groupedLogs[round]} />
              ))
            )}
          </div>
        </div>

        <div className="h-16 px-8 flex items-center justify-between border-t border-[#1A1A1A]/5 bg-white/40 text-[10px] font-black text-[#5C4033]/30 uppercase tracking-[0.2em]">
          <span>Sorted by Timeline</span>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A]/10" />
            <span>Esc to Close</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const RoundGroup: React.FC<{
  round: number;
  logs: BattleLog[];
}> = ({ round, logs }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-4 sticky top-0 bg-[#FDFBF7]/90 backdrop-blur-md py-2 z-20">
      <div className="px-5 py-2.5 rounded-full bg-[#1A1A1A] text-white shadow-lg flex items-center gap-2">
        <span className="text-xs font-black uppercase tracking-widest">ROUND</span>
        <span className="text-lg font-black italic tabular-nums">{round}</span>
      </div>
      <div className="flex-1 h-px bg-[#1A1A1A]/5" />
      <span className="text-[10px] font-black text-[#5C4033]/30 uppercase tracking-widest">{logs.length} OPS</span>
    </div>
    <div className="space-y-3 pl-2">
      {logs.map((log, index) => (
        <LogItem key={log.id || index} log={log} />
      ))}
    </div>
  </div>
);

const LogItem: React.FC<{
  log: BattleLog;
}> = ({ log }) => {
  const getLogType = (text: string): keyof typeof LOG_TYPE_CONFIG => {
    const t = text.toLowerCase();
    if (t.includes('结算') || t.includes('获胜') || t.includes('失败') || t.includes('定论')) return 'result';
    if (t.includes('伤害') || t.includes('扣除') || t.includes('损失') || t.includes('挫损')) return 'damage';
    if (t.includes('恢复') || t.includes('获得') || t.includes('增加') || t.includes('固守')) return 'heal';
    if (t.includes('触发') || t.includes('效果') || t.includes('能力') || t.includes('共鸣')) return 'effect';
    if (t.includes('已') || t.includes('选择') || t.includes('出牌') || t.includes('行动')) return 'action';
    return 'system';
  };

  const type = getLogType(log.text);
  const config = LOG_TYPE_CONFIG[type];

  return (
    <div
      className="flex items-start gap-5 p-5 rounded-[1.25rem] border-2 transition-all hover:bg-white hover:shadow-xl group"
      style={{
        borderColor: 'rgba(26,26,26,0.03)',
        backgroundColor: 'rgba(255,255,255,0.4)',
      }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black shadow-sm shrink-0 mt-0.5"
        style={{ backgroundColor: config.color, color: 'white' }}
      >
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-bold text-[#1A1A1A] leading-relaxed serif underline decoration-[#1A1A1A]/5 decoration-2 underline-offset-4">{log.text}</p>
        <div className="flex items-center gap-4 mt-3">
          <span
            className="text-[9px] font-black uppercase tracking-[0.2em]"
            style={{ color: config.color }}
          >
            {config.label}
          </span>
          {log.timestamp && (
            <span className="text-[9px] font-black text-[#5C4033]/20 tabular-nums">
              {new Date(log.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogDrawer;
