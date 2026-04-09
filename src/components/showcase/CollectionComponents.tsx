/**
 * 卡牌收藏进度组件
 *
 * 在现有卡牌收藏基础上添加：
 * - 收藏进度统计
 * - 门派完成度
 * - 稀有度分布
 */

import React from 'react';
import { CARDS, rarityColor } from '@/data/cardsSource';

interface CollectionProgressProps {
  className?: string;
}

export function CollectionProgress({ className }: CollectionProgressProps) {
  // 统计各门派卡牌数量
  const factionStats = React.useMemo(() => {
    const stats: Record<string, { total: number; collected: number }> = {};
    const factions = Array.from(new Set(CARDS.map((c: { faction: string }) => c.faction)));

    for (const faction of factions) {
      const cards = CARDS.filter((c: { faction: string }) => c.faction === faction);
      stats[faction] = {
        total: cards.length,
        collected: cards.length, // 当前假设全部已收集，后续可接入实际收藏状态
      };
    }

    return stats;
  }, []);

  // 统计各稀有度卡牌数量
  const rarityStats = React.useMemo(() => {
    const stats: Record<string, number> = {};
    for (const card of CARDS) {
      const rarity = (card as { rarity?: string }).rarity || '普通';
      stats[rarity] = (stats[rarity] || 0) + 1;
    }
    return stats;
  }, []);

  // 总收藏进度
  const totalProgress = React.useMemo(() => {
    const total = CARDS.length;
    const collected = total; // 当前假设全部已收集
    return { total, collected, percentage: Math.round((collected / total) * 100) };
  }, []);

  return (
    <div className={`p-4 rounded-lg ${className}`} style={{ background: 'rgba(16, 25, 46, 0.8)', border: '1px solid rgba(212, 165, 32, 0.3)' }}>
      {/* 总进度 */}
      <div className="mb-6">
        <h3 className="text-lg font-serif mb-2" style={{ color: '#d4a520' }}>
          收藏进度
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${totalProgress.percentage}%`,
                background: 'linear-gradient(90deg, #3a5f41, #d4a520)',
              }}
            />
          </div>
          <span className="text-sm" style={{ color: '#f5e6b8' }}>
            {totalProgress.collected}/{totalProgress.total}
          </span>
        </div>
      </div>

      {/* 门派完成度 */}
      <div className="mb-6">
        <h4 className="text-sm font-serif mb-3" style={{ color: '#a7c5ba' }}>
          门派收藏
        </h4>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(factionStats).map(([faction, stats]) => (
            <div key={faction} className="text-center">
              <div
                className="text-xs mb-1 truncate"
                style={{ color: '#f5e6b8' }}
                title={faction}
              >
                {faction}
              </div>
              <div
                className="text-xs"
                style={{ color: stats.collected === stats.total ? '#4ade80' : '#d4a520' }}
              >
                {stats.collected}/{stats.total}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 稀有度分布 */}
      <div>
        <h4 className="text-sm font-serif mb-3" style={{ color: '#a7c5ba' }}>
          稀有度分布
        </h4>
        <div className="flex gap-2">
          {Object.entries(rarityStats).map(([rarity, count]) => (
            <div
              key={rarity}
              className="px-3 py-1.5 rounded text-xs"
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: `1px solid ${rarityColor[rarity] || '#666'}`,
                color: rarityColor[rarity] || '#aaa',
              }}
            >
              {rarity} ×{count}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface CardFilterBarProps {
  onFilterChange: (filters: {
    faction?: string;
    rarity?: string;
    type?: string;
    search?: string;
  }) => void;
  className?: string;
}

/**
 * 卡牌筛选栏组件
 */
export function CardFilterBar({ onFilterChange, className }: CardFilterBarProps) {
  const [filters, setFilters] = React.useState<{
    faction: string;
    rarity: string;
    type: string;
    search: string;
  }>({
    faction: 'all',
    rarity: 'all',
    type: 'all',
    search: '',
  });

  const factions = React.useMemo(() =>
    ['全部', ...Array.from(new Set(CARDS.map((c: { faction: string }) => c.faction)))],
    []);

  const rarities = React.useMemo(() =>
    ['全部', ...Array.from(new Set(CARDS.map((c: { rarity?: string }) => c.rarity || '普通')))],
    []);

  const types = React.useMemo(() =>
    ['全部', ...Array.from(new Set(CARDS.map((c: { type: string }) => c.type)))],
    []);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value === '全部' ? 'all' : value };
    setFilters(newFilters);
    onFilterChange({
      faction: newFilters.faction === 'all' ? undefined : newFilters.faction,
      rarity: newFilters.rarity === 'all' ? undefined : newFilters.rarity,
      type: newFilters.type === 'all' ? undefined : newFilters.type,
      search: newFilters.search || undefined,
    });
  };

  return (
    <div className={`p-4 rounded-lg flex flex-wrap gap-4 items-center ${className}`} style={{ background: 'rgba(16, 25, 46, 0.8)', border: '1px solid rgba(212, 165, 32, 0.3)' }}>
      {/* 搜索框 */}
      <input
        type="text"
        placeholder="搜索卡牌..."
        value={filters.search}
        onChange={(e) => handleFilterChange('search', e.target.value)}
        className="px-3 py-2 rounded-lg text-sm flex-1 min-w-[150px] max-w-[200px]"
        style={{
          background: 'rgba(16, 25, 46, 0.8)',
          border: '1px solid rgba(212, 165, 32, 0.3)',
          color: '#f5e6b8',
        }}
      />

      {/* 门派筛选 */}
      <select
        value={filters.faction === 'all' ? '全部' : filters.faction}
        onChange={(e) => handleFilterChange('faction', e.target.value)}
        className="px-3 py-2 rounded-lg text-sm"
        style={{
          background: 'rgba(16, 25, 46, 0.8)',
          border: '1px solid rgba(212, 165, 32, 0.3)',
          color: '#f5e6b8',
        }}
      >
        {factions.map((f) => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>

      {/* 稀有度筛选 */}
      <select
        value={filters.rarity === 'all' ? '全部' : filters.rarity}
        onChange={(e) => handleFilterChange('rarity', e.target.value)}
        className="px-3 py-2 rounded-lg text-sm"
        style={{
          background: 'rgba(16, 25, 46, 0.8)',
          border: '1px solid rgba(212, 165, 32, 0.3)',
          color: '#f5e6b8',
        }}
      >
        {rarities.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>

      {/* 类型筛选 */}
      <select
        value={filters.type === 'all' ? '全部' : filters.type}
        onChange={(e) => handleFilterChange('type', e.target.value)}
        className="px-3 py-2 rounded-lg text-sm"
        style={{
          background: 'rgba(16, 25, 46, 0.8)',
          border: '1px solid rgba(212, 165, 32, 0.3)',
          color: '#f5e6b8',
        }}
      >
        {types.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      {/* 重置按钮 */}
      <button
        onClick={() => {
          setFilters({ faction: 'all', rarity: 'all', type: 'all', search: '' });
          onFilterChange({});
        }}
        className="px-4 py-2 rounded-lg text-sm transition-colors"
        style={{
          background: 'rgba(212, 165, 32, 0.1)',
          border: '1px solid rgba(212, 165, 32, 0.3)',
          color: '#a7c5ba',
        }}
      >
        重置
      </button>
    </div>
  );
}