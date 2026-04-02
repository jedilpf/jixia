import type { FactionDefinition } from '@/core/types';

export const FACTIONS: FactionDefinition[] = [
  { id: 'confucian', name: '礼心殿', style: '秩序与教化', color: '#3A5F41' }, // 石绿 Malachite
  { id: 'legalist', name: '衡戒廷', color: '#8D2F2F', style: '法术与威势' }, // 朱砂 Cinnabar
  { id: 'daoist', name: '虚静居', color: '#2C5F78', style: '无为与借势' }, // 石青 Azure
  { id: 'mohist', name: '天工坊', color: '#3E4E5E', style: '守御与节用' }, // 玄铁 Iron-Ink
  { id: 'strategist', name: '兵戈楼', style: '攻势与调度', color: '#A85C45' },
  { id: 'diplomat', name: '纵横家', style: '博弈与连锁', color: '#7C5FA3' },
  { id: 'logician', name: '名家', style: '诘辩与反制', color: '#5C6D9E' },
  { id: 'eclectic', name: '杂家', style: '融合与适配', color: '#80755A' },
  { id: 'agronomist', name: '农家', style: '养成与资源', color: '#6B8D4F' },
  { id: 'yin_yang', name: '阴阳家', style: '节律与预判', color: '#6C6A89' },
  { id: 'novelist', name: '小说家', style: '叙事与扰动', color: '#8E6B6B' },
  { id: 'healer', name: '医家', style: '修复与续战', color: '#5F8D8B' },
  { id: 'musician', name: '乐家', style: '共鸣与强化', color: '#92713D' },
  { id: 'calendar', name: '历数家', style: '时机与爆发', color: '#536A76' },
  { id: 'ritualist', name: '礼家', style: '稳定与增益', color: '#8B6A4E' },
  { id: 'merchant', name: '商家', style: '交易与金币', color: '#9A7E3B' },
];

