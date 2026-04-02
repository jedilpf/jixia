/**
 * 《争鸣史》实录 
 * 稷下受业全案记录 (V9 雅化版)
 */

import React from 'react';
import { BattleLog } from '@/battleV2/types';

interface LogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: BattleLog[];
}

const LOG_TYPE_CONFIG: Record<string, { color: string; bg: string; label: string; offset: string }> = {
  action: { color: '#1A1A1A', bg: 'rgba(26,26,26,0.05)', label: '名士出奇', offset: '0% 0%' },
  effect: { color: '#3A5F41', bg: 'rgba(58,95,65,0.05)', label: '言辞法效', offset: '50% 0%' },
  result: { color: '#8D2F2F', bg: 'rgba(141,47,47,0.05)', label: '终局定论', offset: '0% 50%' },
  damage: { color: '#1A1A1A', bg: 'rgba(26,26,26,0.05)', label: '锋芒挫损', offset: '50% 50%' },
  heal: { color: '#3A5F41', bg: 'rgba(58,95,65,0.05)', label: '物华固本', offset: '0% 100%' },
  system: { color: '#5C4033', bg: 'rgba(92,64,51,0.05)', label: '司议笔录', offset: '50% 100%' },
};

const LogIcon: React.FC<{ type: string; color: string }> = ({ type, color }) => {
  const iconPath = '/assets/v9/battle_log_icons.png';
  return (
    <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
      <div 
        className="absolute inset-0 rounded-2xl border-2 rotate-6 transition-transform group-hover:rotate-0 shadow-lg"
        style={{ borderColor: `${color}20`, backgroundColor: '#fff' }}
      />
      <div 
        className="relative w-12 h-12 rounded-xl overflow-hidden grayscale group-hover:grayscale-0 transition-all"
        style={{ 
          backgroundImage: `url('${iconPath}')`,
          backgroundSize: '200% 300%',
          backgroundPosition: LOG_TYPE_CONFIG[type]?.offset || '0% 0%',
          border: `1px solid ${color}10`
        }}
      />
      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-[#1A1A1A] shadow-md flex items-center justify-center">
         <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      </div>
    </div>
  );
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
    <div className="fixed inset-0 z-[100] flex animate-in fade-in duration-700">
      <div className="flex-1 bg-[#1A1A1A]/60 backdrop-blur-md" onClick={onClose} />

      <div className="w-[500px] h-full bg-[#FDFBF7] shadow-[-80px_0_120px_rgba(0,0,0,0.4)] flex flex-col pt-safe relative overflow-hidden animate-in slide-in-from-right duration-700 cubic-bezier(0.23, 1, 0.32, 1)">
        {/* 背景纹理：宣纸经折感 */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0">
           <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
           <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/20 to-transparent" />
        </div>

        <header className="relative z-10 h-32 px-10 flex items-center justify-between border-b-4 border-[#1A1A1A] bg-white">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full border-4 border-[#1A1A1A] flex items-center justify-center shadow-2xl bg-[#FDFBF7]">
               <span className="text-2xl font-black italic serif">史</span>
            </div>
            <div>
              <h2 className="text-3xl font-black text-[#1A1A1A] tracking-tighter uppercase leading-none">争鸣实录</h2>
              <div className="flex items-center gap-3 mt-2">
                 <span className="text-[10px] font-black bg-[#8D2F2F] text-white px-3 py-1 rounded-full tracking-widest uppercase">Chronicle</span>
                 <span className="text-[10px] font-black text-[#5C4033]/30 tracking-[0.3em] uppercase italic">{logs.length} SCROLLS</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="group w-12 h-12 rounded-2xl border-2 border-[#1A1A1A]/10 flex items-center justify-center text-[#1A1A1A] hover:border-[#8D2F2F] hover:text-[#8D2F2F] transition-all active:scale-90 bg-white"
          >
            <span className="text-xl font-bold group-hover:rotate-90 transition-transform">✕</span>
          </button>
        </header>

        <main className="relative z-10 flex-1 overflow-y-auto scrollbar-hide px-10 py-12 space-y-12">
          {rounds.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-40 text-center space-y-6">
              <div className="w-40 h-40 rounded-full border-8 border-[#1A1A1A]/5 flex items-center justify-center grayscale opacity-20">
                 <span className="text-8xl font-black italic serif">虚</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-[#1A1A1A] uppercase tracking-widest">笔下无痕</h3>
                <p className="text-[10px] font-black text-[#5C4033]/30 tracking-[0.4em] uppercase mt-2">The contention has not yet begun</p>
              </div>
            </div>
          ) : (
            rounds.map((round) => (
              <RoundBlock key={round} round={round} logs={groupedLogs[round]} />
            ))
          )}
        </main>

        <footer className="relative z-10 h-20 px-10 flex items-center justify-between border-t border-[#1A1A1A]/10 bg-white/80 backdrop-blur-sm text-[10px] font-black text-[#5C4033]/40 uppercase tracking-[0.3em]">
          <div className="flex items-center gap-4">
             <div className="w-2 h-2 rounded-full bg-[#3A5F41] animate-pulse" />
             <span>Archived by Jixia Scholars</span>
          </div>
          <span>Page {rounds.length || 0}</span>
        </footer>
      </div>
    </div>
  );
};

const RoundBlock: React.FC<{
  round: number;
  logs: BattleLog[];
}> = ({ round, logs }) => (
  <section className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
    <div className="flex items-center gap-6 sticky top-0 bg-[#FDFBF7]/95 backdrop-blur-sm py-4 z-20">
      <div className="relative group">
        <div className="absolute -inset-2 bg-[#8D2F2F]/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative w-14 h-14 bg-[#8D2F2F] text-white shadow-xl flex flex-col items-center justify-center rounded-lg rotate-3 group-hover:rotate-0 transition-transform">
           <span className="text-[8px] font-black tracking-widest">第</span>
           <span className="text-xl font-black italic serif leading-none">{round}</span>
           <span className="text-[8px] font-black tracking-widest">轮</span>
        </div>
      </div>
      <div className="flex-1">
         <div className="text-[10px] font-black text-[#1A1A1A]/30 uppercase tracking-[0.5em] mb-1">Encounter History</div>
         <div className="h-0.5 w-full bg-[#1A1A1A]/5 rounded-full overflow-hidden">
            <div className="h-full bg-[#1A1A1A] w-24" />
         </div>
      </div>
    </div>

    <div className="space-y-4 pl-4 border-l-2 border-[#1A1A1A]/5">
      {logs.map((log, index) => (
        <ContentEntry key={log.id || index} log={log} />
      ))}
    </div>
  </section>
);

const ContentEntry: React.FC<{
  log: BattleLog;
}> = ({ log }) => {
  const detectType = (text: string): keyof typeof LOG_TYPE_CONFIG => {
    const t = text.toLowerCase();
    if (t.includes('结算') || t.includes('定论') || t.includes('回合') || t.includes('获胜')) return 'result';
    if (t.includes('伤害') || t.includes('扣除') || t.includes('损失')) return 'damage';
    if (t.includes('回复') || t.includes('获得') || t.includes('增加')) return 'heal';
    if (t.includes('由于') || t.includes('效果') || t.includes('触发') || t.includes('连锁')) return 'effect';
    return 'action';
  };

  const type = detectType(log.text);
  const config = LOG_TYPE_CONFIG[type];

  return (
    <div className="group flex items-start gap-6 p-6 rounded-[2rem] bg-white border-2 border-[#1A1A1A]/5 hover:border-[#1A1A1A] hover:shadow-2xl transition-all duration-500">
      <LogIcon type={type} color={config.color} />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
           <span className="text-[9px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full border border-current" style={{ color: config.color, backgroundColor: config.bg }}>
             {config.label}
           </span>
           {log.timestamp && (
             <span className="text-[9px] font-black text-[#5C4033]/20 tabular-nums">
               {new Date(log.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
             </span>
           )}
        </div>
        <p className="text-base font-bold text-[#1A1A1A] leading-relaxed serif tracking-tight">
          {log.text}
        </p>
      </div>
    </div>
  );
};

export default LogDrawer;
