﻿﻿﻿﻿﻿﻿﻿﻿﻿/**
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
  action: { color: '#7ab8c9', icon: '行', label: '行动' },
  effect: { color: '#9C88A8', icon: '效', label: '效果' },
  result: { color: '#c9952a', icon: '结', label: '结果' },
  damage: { color: '#c9725a', icon: '伤', label: '伤害' },
  heal: { color: '#5a8a5a', icon: '愈', label: '恢复' },
  system: { color: '#8a7a6a', icon: '系', label: '系统' },
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
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="w-96 h-full bg-gradient-to-l from-[#1a1510] via-[#151210] to-[#0d0b08] border-l border-[#5c4d3a]/50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="h-16 px-5 flex items-center justify-between border-b border-[#3d3225]/50 bg-gradient-to-r from-[#1a1510] to-[#151210]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7ab8c9]/10 border border-[#7ab8c9]/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#7ab8c9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#c9b896]">战斗日志</h2>
              <p className="text-xs text-[#8a7a6a]">共 {logs.length} 条记录</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-[#2a2318]/80 border border-[#5c4d3a]/50 flex items-center justify-center text-[#8a7a6a] hover:text-[#c9b896] hover:bg-[#3d3225] hover:border-[#7a6a5a] transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {rounds.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[#5c4d3a]">
              <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium">暂无战斗记录</p>
              <p className="text-sm mt-1">战斗开始后将显示日志</p>
            </div>
          ) : (
            rounds.map((round) => (
              <RoundGroup key={round} round={round} logs={groupedLogs[round]} />
            ))
          )}
        </div>

        <div className="h-12 px-5 flex items-center justify-between border-t border-[#3d3225]/30 bg-[#0d0b08]/50 text-xs text-[#8a7a6a]">
          <span>按时间倒序排列</span>
          <span className="flex items-center gap-2">
            <kbd className="px-2 py-1 rounded bg-[#2a2318] border border-[#3d3225]">Esc</kbd>
            <span>关闭</span>
          </span>
        </div>
      </div>
    </div>
  );
};

const RoundGroup: React.FC<{
  round: number;
  logs: BattleLog[];
}> = ({ round, logs }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-3 sticky top-0 bg-gradient-to-r from-[#1a1510] via-[#151210] to-[#1a1510] py-1 z-10">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#c9952a]/10 border border-[#c9952a]/30">
        <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-[#c9952a]/20 text-[#c9952a]">
          {round}
        </span>
        <span className="text-xs font-bold text-[#c9952a]">回合 {round}</span>
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-[#3d3225] to-transparent" />
      <span className="text-[10px] text-[#5c4d3a]">{logs.length} 条记录</span>
    </div>
    <div className="space-y-1.5 pl-2">
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
    if (text.includes('结算') || text.includes('获胜') || text.includes('失败')) return 'result';
    if (text.includes('伤害') || text.includes('扣除') || text.includes('损失')) return 'damage';
    if (text.includes('恢复') || text.includes('获得') || text.includes('增加')) return 'heal';
    if (text.includes('触发') || text.includes('效果') || text.includes('能力')) return 'effect';
    if (text.includes('已') || text.includes('选择') || text.includes('出牌')) return 'action';
    return 'system';
  };

  const type = getLogType(log.text);
  const config = LOG_TYPE_CONFIG[type];

  return (
    <div
      className="flex items-start gap-2 p-2.5 rounded-lg border-l-2 transition-all hover:bg-[#1a1510]/50"
      style={{
        borderLeftColor: config.color,
        backgroundColor: `${config.color}08`,
      }}
    >
      <div
        className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5"
        style={{ backgroundColor: `${config.color}20`, color: config.color }}
      >
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#c9b896] leading-relaxed">{log.text}</p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="px-1.5 py-0.5 rounded text-[10px]"
            style={{ backgroundColor: `${config.color}15`, color: config.color }}
          >
            {config.label}
          </span>
          {log.timestamp && (
            <span className="text-[10px] text-[#5c4d3a]">
              {new Date(log.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogDrawer;
