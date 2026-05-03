import { useState, useEffect, useMemo, ReactNode } from 'react';
import { uiAudio } from '@/utils/audioManager';
import { PRE_BATTLE_BACKGROUND } from '@/ui/screens/visualAssets';
import { CommunityBadge } from '@/components/community/CommunityBadge';
import { CommunityScreen } from '@/components/community/CommunityScreen';
import { FullscreenScreen } from '@/components/FullscreenScreen';
import { AvatarBackend, AvatarInfo } from '@/data/game/avatarRegistry';
import { useLanguage, getLanguageLabels, Language } from '@/contexts/LanguageContext';
import { 
  IconVanninBird, 
  IconBambooSlips, 
  IconBrushForest, 
  IconImperialBanner, 
  IconXuanjiGear, 
  IconKnifeMoney, 
  IconJadeJue,
  IconFire,
  IconLantern,
  IconCalendar,
  IconGift,
  IconCheck,
  IconMartial,
  IconCrossSwords,
  MineralIconWrapper,
  JixiaTooltip,
  JixiaIconsManager 
} from '@/components/common/JixiaIcons';

// ─── 统一 UI 辅助组件 ─────────────────────────────────────────────────────────

function GoldenCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl bg-[#0a0503]/60 backdrop-blur-md border border-[#D4AF65]/20 p-6 transition-all hover:border-[#D4AF65]/50 hover:shadow-[0_0_30px_rgba(212,175,101,0.15)] group overflow-hidden ${className}`}>
      {/* 装饰金丝线 */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#D4AF65]/30 to-transparent" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

function GoldenTab({ label, active, onClick, badge }: { label: string; active: boolean; onClick: () => void; badge?: boolean }) {
  return (
    <button
      onClick={() => { uiAudio.playClick(); onClick(); }}
      className={`relative px-8 py-3 text-sm font-serif tracking-[0.3em] transition-all border-b-2 ${
        active 
          ? 'text-[#D4AF65] border-[#D4AF65] bg-[#D4AF65]/10' 
          : 'text-[#f6e4c3]/30 border-transparent hover:text-[#f6e4c3]/60 hover:bg-white/5'
      }`}
    >
      {label}
      {badge && (
        <span className="absolute top-2 right-2">
            <span className="w-2 h-2 bg-[#831843] rounded-full animate-pulse shadow-[0_0_10px_#831843]" />
        </span>
      )}
    </button>
  );
}

function InkButton({ 
  label, 
  onClick, 
  onMouseEnter,
  sealChar = '论',
  icon
}: { 
  label: string; 
  onClick: () => void; 
  onMouseEnter?: () => void;
  sealChar?: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); uiAudio.playClick(); onClick(); }}
      onMouseEnter={onMouseEnter}
      className="yahua-ink-btn group outline-none focus:outline-none"
    >
      <div className="flex items-center gap-6 relative z-10">
        {/* 前置印章 */}
        <div className="yahua-seal">
          {icon || sealChar}
        </div>
        
        {/* 文字 */}
        <span className="yahua-ink-text">{label}</span>
      </div>
      
      {/* 悬停时的墨滴扩散粒子 */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="ink-bleed-particle w-3 h-3 left-[20%] top-[30%]" style={{ animationDelay: '0.2s' }} />
        <div className="ink-bleed-particle w-5 h-5 left-[60%] top-[60%]" style={{ animationDelay: '0.5s' }} />
        <div className="ink-bleed-particle w-2 h-2 left-[80%] top-[20%]" style={{ animationDelay: '0.8s' }} />
      </div>
    </button>
  );
}

function InkSystemButton({ 
  icon, 
  tooltip, 
  onClick, 
  onMouseEnter, 
  onMouseLeave, 
  visible, 
  hasNotice,
  noticeColor = '#8D2F2F'
}: {
  icon: ReactNode;
  tooltip: string;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  visible: boolean;
  hasNotice?: boolean;
  noticeColor?: string;
}) {
  return (
    <button 
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      className="yahua-system-ink group overflow-visible outline-none focus:outline-none"
    >
      {/* 迷你朱砂印章通知 */}
      {hasNotice && (
        <div className="yahua-mini-seal" style={{ backgroundColor: noticeColor }} />
      )}
      
      {/* 图标 */}
      <div className="relative z-10 opacity-75 group-hover:opacity-100 group-hover:scale-110 transition-all">
        {icon}
      </div>
      
      {/* 提示词 */}
      <JixiaTooltip text={tooltip} visible={visible} />
    </button>
  );
}

function ShopItem({ icon, name, price, amount, onBuy, type = 'coin' }: { 
  icon: string; name: string; price: string | number; amount: string; onBuy: () => void; type?: 'coin' | 'jade' 
}) {
  const isCoin = type === 'coin';
  return (
    <div className="group relative flex flex-col items-center bg-[#0a0503]/60 backdrop-blur-md border border-[#D4AF65]/20 rounded-2xl p-6 transition-all hover:border-[#D4AF65]/60 hover:shadow-[0_0_30px_rgba(212,175,101,0.15)] hover:-translate-y-1">
      {/* 装饰金角 */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#D4AF65]/40 rounded-tl-xl" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#D4AF65]/40 rounded-br-xl" />
      
      <div className="text-5xl mb-4 filter drop-shadow-[0_0_12px_rgba(212,175,101,0.3)] group-hover:scale-110 transition-transform duration-500">{icon}</div>
      <div className="text-[#f6e4c3] text-base font-serif mb-1 tracking-widest">{name}</div>
      <div className="text-[#D4AF65]/50 text-xs mb-6 font-bold tracking-tighter uppercase">{amount}</div>
      
      <button 
        onClick={(e) => { e.stopPropagation(); onBuy(); }}
        className={`w-full py-2.5 rounded-lg border text-xs font-black tracking-[0.2em] transition-all shadow-lg ${
          isCoin 
            ? 'bg-[#D4AF65]/10 border-[#D4AF65]/30 text-[#D4AF65] hover:bg-[#D4AF65] hover:text-[#0a0503]' 
            : 'bg-[#1e3a5f]/10 border-[#1e3a5f]/30 text-[#9eb9dd] hover:bg-[#1e3a5f] hover:text-white'
        }`}
      >
        {isCoin ? `🪙 ${price}` : `💠 ${price}`}
      </button>
    </div>
  );
}

// ─── 设置状态接口 ────────────────────────────────────────────────────────────
export interface AppSettings {
  masterVolume: number; // 0~1
  bgmVolume: number;    // 0~1
  sfxVolume: number;    // 0~1
  brightness: number;   // 0.3~1 (暗→亮)
  fullscreen: boolean;
  language: 'zh' | 'en' | 'ja'; // 语言设置
}

// ─── 全局亮度遮罩 ────────────────────────────────────────────────────────────
export function BrightnessOverlay({ brightness }: { brightness: number }) {
  const overlayOpacity = Math.max(0, 1 - brightness);
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        opacity: overlayOpacity * 0.65,
        pointerEvents: 'none',
        zIndex: 99998,
        transition: 'opacity 0.15s',
      }}
    />
  );
}

interface MainMenuProps {
  settings: AppSettings;
  onSettingsChange: (next: Partial<AppSettings>) => void;
  onStartGame: () => void;
  onStory?: () => void;
  onCollection: () => void;
  onCharacters: () => void;
}

// ─── SystemModal ─────────────────────────────────────────────────────────────
export function SystemModal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-[9999] flex items-center justify-center p-8 bg-black/75 backdrop-blur-md pointer-events-auto" style={{ animation: 'modal-fade-in 0.2s ease-out' }}>
      <div className="bg-[#0a0503] border-2 border-[rgba(212, 175, 101, 0.5)] rounded-xl w-full max-w-2xl shadow-[0_0_50px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden" style={{ animation: 'modal-scale-up 0.3s cubic-bezier(0.175,0.885,0.32,1.275)' }}>
        {/* Header */}
        <div className="h-14 bg-gradient-to-r from-[#1a2840] via-[#1e3a5f] to-[#1a2840] border-b border-[rgba(212, 175, 101, 0.25)] flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="w-0.5 h-5 bg-[#D4AF65] rounded-full" />
            <span className="text-[#f6e4c3] font-serif text-xl tracking-widest">{title}</span>
          </div>
          <button onClick={() => { uiAudio.playClick(); onClose(); }} className="w-8 h-8 rounded-full bg-black/30 hover:bg-[#D4AF65]/20 text-[#f6e4c3]/60 hover:text-[#f6e4c3] text-xl transition-all flex items-center justify-center border border-[rgba(212, 175, 101, 0.15)]"
            onMouseEnter={() => uiAudio.playHover()}>×</button>
        </div>
        {/* Content */}
        <div className="p-8 min-h-[300px] flex items-center justify-center text-[#f6e4c3]/80 text-lg">
          {children}
        </div>
      </div>
      <style>{`
        @keyframes modal-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modal-scale-up { from { transform: scale(0.95) translateY(-10px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}

// ─── 美化滑块组件 ─────────────────────────────────────────────────────────────
function GoldenSlider({ value, onChange, min = 0, max = 1, step = 0.01, label, icon }: {
  value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number;
  label: string; icon: ReactNode;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-[#f6e4c3] font-serif tracking-wide text-sm">{label}</span>
        </div>
        <span className="text-[#D4AF65] text-xs font-mono tabular-nums w-8 text-right">{Math.round(pct)}%</span>
      </div>
      <div className="relative h-5 flex items-center">
        {/* Track */}
        <div className="w-full h-1.5 bg-black/60 rounded-full border border-[rgba(212, 175, 101, 0.2)] overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, #1e3a5f, #D4AF65 70%, #f6e4c3)', // 石青到金丝
              boxShadow: '0 0 8px rgba(212, 175, 101, 0.4)',
              transition: 'width 0.05s',
            }}
          />
        </div>
        {/* Invisible native range for interaction */}
        <input
          type="range"
          min={min} max={max} step={step}
          value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          style={{ height: '20px', margin: 0 }}
        />
        {/* Custom thumb */}
        <div
          className="absolute w-4 h-4 rounded-full border-2 border-[#D4AF65] bg-[#0a0503] shadow-[0_0_10px_rgba(212, 175, 101, 0.8)] pointer-events-none"
          style={{
            left: `calc(${pct}% - 8px)`,
            transition: 'left 0.05s',
          }}
        />
      </div>
    </div>
  );
}

// ─── 齿轮装饰组件 ─────────────────────────────────────────────────────────────
function Gear({ size, x, y, speed, opacity }: { size: number; x: string; y: string; speed: number; opacity: number }) {
  const [rotation, setRotation] = useState(0);
  useEffect(() => {
    let raf: number;
    let last = Date.now();
    const tick = () => {
      const now = Date.now();
      setRotation(r => r + speed * (now - last) / 1000);
      last = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speed]);

  const teeth = 12;
  const outerR = size / 2;
  const innerR = outerR * 0.68;
  const toothH = outerR * 0.22;
  const holeR = outerR * 0.28;

  const points = [];
  for (let i = 0; i < teeth; i++) {
    const angle = (i / teeth) * Math.PI * 2;
    const nextAngle = ((i + 0.4) / teeth) * Math.PI * 2;
    const nextAngle2 = ((i + 0.6) / teeth) * Math.PI * 2;
    const endAngle = ((i + 1) / teeth) * Math.PI * 2;
    points.push(
      `${(Math.cos(angle) * innerR + outerR).toFixed(2)},${(Math.sin(angle) * innerR + outerR).toFixed(2)}`,
      `${(Math.cos(nextAngle) * (outerR + toothH) + outerR).toFixed(2)},${(Math.sin(nextAngle) * (outerR + toothH) + outerR).toFixed(2)}`,
      `${(Math.cos(nextAngle2) * (outerR + toothH) + outerR).toFixed(2)},${(Math.sin(nextAngle2) * (outerR + toothH) + outerR).toFixed(2)}`,
      `${(Math.cos(endAngle) * innerR + outerR).toFixed(2)},${(Math.sin(endAngle) * innerR + outerR).toFixed(2)}`,
    );
  }

  return (
    <svg width={size} height={size} style={{ position: 'absolute', left: x, top: y, opacity, transform: `rotate(${rotation}deg)`, transformOrigin: `${outerR}px ${outerR}px`, pointerEvents: 'none' }}>
      <polygon points={points.join(' ')} fill="none" stroke="#8B7355" strokeWidth="1.5" />
      <circle cx={outerR} cy={outerR} r={holeR} fill="none" stroke="#8B7355" strokeWidth="1.5" />
    </svg>
  );
}

// ─── 火花粒子 ─────────────────────────────────────────────────────────────────
function EmberParticle() {
  const style = useMemo(() => ({
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 4}s`,
    animationDuration: `${2 + Math.random() * 3}s`,
    width: `${2 + Math.random() * 3}px`,
    height: `${2 + Math.random() * 3}px`,
  }), []);
  return <div className="absolute bottom-0 rounded-full bg-orange-400 animate-ember" style={style} />;
}

// ─── SettingsPanel ────────────────────────────────────────────────────────────
export function SettingsPanel({ settings, onSettingsChange }: {
  settings: AppSettings;
  onSettingsChange: (next: Partial<AppSettings>) => void;
}) {
  const { language, setLanguage } = useLanguage();
  const t = (zh: string, en: string, ja?: string) => {
    if (language === 'zh') return zh;
    if (language === 'ja' && ja) return ja;
    return en;
  };

  return (
    <div className="w-full max-w-sm space-y-8">
      {/* 声音 */}
      <div className="space-y-5">
        <p className="text-[#d4a520] font-serif tracking-widest text-xs border-b border-[rgba(212,165,32,0.2)] pb-2 flex items-center gap-2">
          <span>◆</span> {t('声音设置', 'Sound', 'サウンド')}
        </p>
        <GoldenSlider icon={<IconXuanjiGear size={20} color="#a7c5ba" />} label={t('总音量', 'Master', 'マスター音量')} value={settings.masterVolume} onChange={v => onSettingsChange({ masterVolume: v })} />
        <GoldenSlider icon={<IconVanninBird size={20} color="#a7c5ba" />} label={t('背景音乐', 'BGM', 'BGM')} value={settings.bgmVolume} onChange={v => onSettingsChange({ bgmVolume: v })} />
        <GoldenSlider icon={<IconBambooSlips size={20} color="#a7c5ba" />} label={t('操作音效', 'SFX', '効果音')} value={settings.sfxVolume} onChange={v => onSettingsChange({ sfxVolume: v })} />
      </div>

      {/* 画面 */}
      <div className="space-y-5">
        <p className="text-[#d4a520] font-serif tracking-widest text-xs border-b border-[rgba(212,165,32,0.2)] pb-2 flex items-center gap-2">
          <span>◆</span> {t('画面设置', 'Display', '画面')}
        </p>
        <GoldenSlider icon={<IconXuanjiGear size={20} color="#d4a520" />} label={t('屏幕亮度', 'Brightness', '明るさ')} value={settings.brightness} min={0.3} max={1} onChange={v => onSettingsChange({ brightness: v })} />

        {/* 全屏开关 */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <IconBrushForest size={20} color="#f5e6b8" />
            <span className="text-[#f5e6b8] font-serif tracking-wide text-sm">{t('全屏模式', 'Fullscreen', 'フルスクリーン')}</span>
          </div>
          <button
            onClick={() => {
              if (!settings.fullscreen) {
                document.documentElement.requestFullscreen().catch(e => console.error(e));
              } else {
                if (document.fullscreenElement) {
                  document.exitFullscreen().catch(e => console.error(e));
                }
              }
              onSettingsChange({ fullscreen: !settings.fullscreen });
            }}
            className={`relative w-12 h-6 rounded-full border-2 transition-all duration-300 ${settings.fullscreen ? 'bg-[#d4a520]/30 border-[#d4a520]' : 'bg-black/50 border-[rgba(139,115,85,0.4)]'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full shadow-md transition-all duration-300 ${settings.fullscreen ? 'left-[26px] bg-[#d4a520] shadow-[0_0_6px_rgba(212,165,32,0.8)]' : 'left-0.5 bg-[#8B7355]'}`} />
          </button>
        </div>
      </div>

      {/* 语言 */}
      <div className="space-y-5">
        <p className="text-[#d4a520] font-serif tracking-widest text-xs border-b border-[rgba(212,165,32,0.2)] pb-2 flex items-center gap-2">
          <span>◆</span> {t('语言设置', 'Language', '言語')}
        </p>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <IconBambooSlips size={20} color="#f5e6b8" />
            <span className="text-[#f5e6b8] font-serif tracking-wide text-sm">{t('显示语言', 'Display Language', '表示言語')}</span>
          </div>
          <div className="flex gap-2">
            {(['zh', 'en', 'ja'] as Language[]).map((lang) => {
              const isSelected = language === lang;
              const labels = getLanguageLabels(language);
              return (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-4 py-2 rounded-lg text-sm font-serif tracking-wide transition-all ${
                    isSelected
                      ? 'bg-[#d4a520] text-black font-bold shadow-[0_0_10px_rgba(212,165,32,0.4)]'
                      : 'bg-black/30 text-[#a7c5ba] border border-[rgba(139,115,85,0.3)] hover:border-[#d4a520]/50 hover:text-[#f5e6b8]'
                  }`}
                >
                  {labels[lang]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 隐藏原生range的外观，但不影响交互 */}
      <style>{`
        input[type="range"] {
          -webkit-appearance: none;
          background: transparent;
        }
        input[type="range"]:focus {
          outline: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

type ProfileTab = 'overview' | 'records' | 'collection';

interface ShopPack {
  id: string;
  name: string;
  amount: number;
  priceLabel: string;
}

interface EventItem {
  id: string;
  title: string;
  summary: string;
  rewardCoin: number;
  rewardJade: number;
  joined: boolean;
  claimed: boolean;
}

interface QuestItem {
  id: string;
  title: string;
  progress: number;
  target: number;
  rewardCoin: number;
  rewardJade: number;
  claimed: boolean;
}

interface MailItem {
  id: string;
  title: string;
  content: string;
  rewardCoin: number;
  rewardJade: number;
  read: boolean;
  claimed: boolean;
}

const COIN_PACKS: ShopPack[] = [
  { id: 'coin-small', name: '青铜钱袋', amount: 800, priceLabel: '¥6' },
  { id: 'coin-mid', name: '学宫月俸', amount: 3000, priceLabel: '¥18' },
  { id: 'coin-large', name: '论场赏金', amount: 6800, priceLabel: '¥30' },
];

const JADE_PACKS: ShopPack[] = [
  { id: 'jade-small', name: '机关玉簇', amount: 80, priceLabel: '¥6' },
  { id: 'jade-mid', name: '机关玉匣', amount: 260, priceLabel: '¥18' },
  { id: 'jade-large', name: '机关玉宝函', amount: 580, priceLabel: '¥30' },
];

const INITIAL_EVENTS: EventItem[] = [
  {
    id: 'event-weekly-debate',
    title: '七日论场',
    summary: '本周完成 3 场论辩可领取阶段奖励。',
    rewardCoin: 1200,
    rewardJade: 40,
    joined: false,
    claimed: false,
  },
  {
    id: 'event-faction-trial',
    title: '门派试锋',
    summary: '使用墨/儒任一门派完成 1 场胜利。',
    rewardCoin: 800,
    rewardJade: 30,
    joined: false,
    claimed: false,
  },
];

const INITIAL_QUESTS: QuestItem[] = [
  { id: 'quest-battle-1', title: '完成 1 场论辩', progress: 0, target: 1, rewardCoin: 600, rewardJade: 10, claimed: false },
  { id: 'quest-card-play-5', title: '打出 5 张牌', progress: 2, target: 5, rewardCoin: 500, rewardJade: 10, claimed: false },
  { id: 'quest-login', title: '今日登录', progress: 1, target: 1, rewardCoin: 300, rewardJade: 0, claimed: false },
];

const INITIAL_MAILS: MailItem[] = [
  {
    id: 'mail-beta-reward',
    title: '内测奖励发放',
    content: '感谢参与测试，奉上铜钱与机关玉，请查收。',
    rewardCoin: 1000,
    rewardJade: 50,
    read: false,
    claimed: false,
  },
  {
    id: 'mail-weekly-news',
    title: '学宫周报',
    content: '本周新增剧情章节预告与卡牌平衡更新。',
    rewardCoin: 0,
    rewardJade: 0,
    read: false,
    claimed: false,
  },
];

const MAIN_MENU_STORAGE_KEY = 'jixia.mainmenu.state.v1';

interface MainMenuPersistedState {
  coinBalance: number;
  jadeBalance: number;
  events: EventItem[];
  quests: QuestItem[];
  mails: MailItem[];
}

function loadMainMenuState(): MainMenuPersistedState {
  const fallback: MainMenuPersistedState = {
    coinBalance: 12500,
    jadeBalance: 850,
    events: JSON.parse(JSON.stringify(INITIAL_EVENTS)),
    quests: JSON.parse(JSON.stringify(INITIAL_QUESTS)),
    mails: JSON.parse(JSON.stringify(INITIAL_MAILS)),
  };

  if (typeof window === 'undefined' || !window.localStorage) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(MAIN_MENU_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<MainMenuPersistedState>;
    return {
      coinBalance: typeof parsed.coinBalance === 'number' ? parsed.coinBalance : fallback.coinBalance,
      jadeBalance: typeof parsed.jadeBalance === 'number' ? parsed.jadeBalance : fallback.jadeBalance,
      events: Array.isArray(parsed.events) ? parsed.events : fallback.events,
      quests: Array.isArray(parsed.quests) ? parsed.quests : fallback.quests,
      mails: Array.isArray(parsed.mails) ? parsed.mails : fallback.mails,
    };
  } catch {
    return fallback;
  }
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────
export function MainMenu({ settings, onSettingsChange, onStartGame, onStory, onCollection, onCharacters }: MainMenuProps) {
  const initialState = useMemo(() => {
    try {
      return loadMainMenuState();
    } catch (e) {
      console.error('Failed to load menu state:', e);
      return {
        coinBalance: 12500,
        jadeBalance: 850,
        events: [],
        quests: [],
        mails: []
      } as any as MainMenuPersistedState;
    }
  }, []);

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [profileTab, setProfileTab] = useState<ProfileTab>('overview');

  // 玩家状态：头像与昵称 (带防御性初始化)
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarInfo>(() => {
    try {
      return AvatarBackend.getSelectedInfo();
    } catch {
      return {
        id: 'mozi_default',
        assetPath: '/assets/chars/avatars/mozi.png',
        name: '墨翟',
        category: 'scholar',
        unlockDesc: '初始获得',
        isUnlocked: true,
        fullPath: '/assets/chars/stand/mozi.png',
      };
    }
  });

  const [userName, setUserName] = useState(() => {
    if (typeof window === 'undefined') return '机枢学徒';
    return localStorage.getItem('jixia_user_name') || '机枢学徒';
  });

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);

  const [coinBalance, setCoinBalance] = useState(initialState?.coinBalance ?? 12500);
  const [jadeBalance, setJadeBalance] = useState(initialState?.jadeBalance ?? 850);
  const [events, _setEvents] = useState<EventItem[]>(initialState?.events || []);
  const [quests, setQuests] = useState<QuestItem[]>(initialState?.quests || []);
  const [questTab, setQuestTab] = useState<'daily' | 'weekly' | 'achieve'>('daily');
  const [mails, setMails] = useState<MailItem[]>(initialState?.mails || []);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const embers = Array.from({ length: 18 }, (_, i) => i);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ 
        x: (e.clientX / window.innerWidth) - 0.5, 
        y: (e.clientY / window.innerHeight) - 0.5 
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const asset = (path: string) => {
    const baseUrl = (import.meta as any).env?.BASE_URL || '';
    return `${baseUrl}${path.replace(/^\/+/, '')}`;
  };

  const hasEventNotice = events.some((item) => item.joined && !item.claimed);
  const hasQuestNotice = quests.some((item) => item.progress >= item.target && !item.claimed);
  const hasMailNotice = mails.some((item) => !item.read || (!item.claimed && (item.rewardCoin > 0 || item.rewardJade > 0)));

  const claimRewards = (coin: number, jade: number) => {
    if (coin > 0) setCoinBalance((prev) => prev + coin);
    if (jade > 0) setJadeBalance((prev) => prev + jade);
  };

  const handleBuyCoinPack = (pack: ShopPack) => {
    uiAudio.playClick();
    claimRewards(pack.amount, 0);
  };

  const handleBuyJadePack = (pack: ShopPack) => {
    uiAudio.playClick();
    claimRewards(0, pack.amount);
  };

  const handleClaimQuest = (id: string) => {
    const item = quests.find((quest) => quest.id === id);
    if (!item || item.claimed || item.progress < item.target) return;
    uiAudio.playClick();
    claimRewards(item.rewardCoin, item.rewardJade);
    setQuests((prev) => prev.map((quest) => (quest.id === id ? { ...quest, claimed: true } : quest)));
  };

  const handleOpenMail = () => {
    uiAudio.playClick();
    setMails((prev) => prev.map((mail) => ({ ...mail, read: true })));
    setActiveModal('mail');
  };

  const handleClaimMail = (id: string) => {
    const item = mails.find((mail) => mail.id === id);
    if (!item || item.claimed) return;
    uiAudio.playClick();
    claimRewards(item.rewardCoin, item.rewardJade);
    setMails((prev) => prev.map((mail) => (mail.id === id ? { ...mail, claimed: true } : mail)));
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const payload: MainMenuPersistedState = {
      coinBalance,
      jadeBalance,
      events,
      quests,
      mails,
    };
    window.localStorage.setItem(MAIN_MENU_STORAGE_KEY, JSON.stringify(payload));
  }, [coinBalance, jadeBalance, events, quests, mails]);

  return (
    <div className="w-full h-full overflow-hidden select-none relative">
      <JixiaIconsManager />
      {/* 背景图 */}
      <div className="absolute inset-0" style={{ backgroundImage: `url(${PRE_BATTLE_BACKGROUND})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(13,11,7,0.35) 0%, rgba(26,18,8,0.28) 40%, rgba(15,26,21,0.32) 100%)' }} />

      {/* 全局动画样式 */}
      <style>{`
        @keyframes ember-rise { 0% { transform: translateY(0) scale(1); opacity: 0.9; } 100% { transform: translateY(-100vh) scale(0); opacity: 0; } }
        .animate-ember { animation: ember-rise linear infinite; }
        @keyframes forge-pulse { 0%,100% { opacity:0.15; transform: scale(1); } 50% { opacity: 0.35; transform: scale(1.08); } }
        @keyframes title-glow { 0%,100% { text-shadow: 0 0 20px rgba(184,134,11,0.6), 0 0 40px rgba(184,134,11,0.3); } 50% { text-shadow: 0 0 40px rgba(255,180,30,0.9), 0 0 80px rgba(255,140,0,0.5); } }
        @keyframes title-brush { 0%,100% { filter: drop-shadow(2px 2px 5px rgba(0,0,0,0.4)) drop-shadow(0 0 12px rgba(212,165,32,0.2)); } 50% { filter: drop-shadow(3px 4px 8px rgba(0,0,0,0.5)) drop-shadow(0 0 20px rgba(255,180,50,0.4)); } }
        @keyframes ink-spread { 0% { opacity: 0; transform: scale(0.7) blur(10px); } 100% { opacity: 0.6; transform: scale(1.1) blur(15px); } }
        @keyframes seal-appear { 0% { opacity: 0; transform: rotate(-15deg) scale(0.5); } 100% { opacity: 1; transform: rotate(-8deg) scale(1); } }
        @keyframes border-glow { 0%,100% { box-shadow: 0 0 10px rgba(255,120,0,0.2); } 50% { box-shadow: 0 0 20px rgba(255,150,0,0.4); } }
        @keyframes bg-breathing { 0%, 100% { transform: scale(1.05); } 50% { transform: scale(1.1); } }
        @keyframes drifting-mist {
          0% { transform: translateX(-5%) translateY(0) scale(1); opacity: 0.15; }
          50% { transform: translateX(5%) translateY(-2%) scale(1.1); opacity: 0.35; }
          100% { transform: translateX(-5%) translateY(0) scale(1); opacity: 0.15; }
        }
        @keyframes god-ray-pulse {
          0%, 100% { opacity: 0.05; transform: skewX(-20deg) scale(1); }
          50% { opacity: 0.12; transform: skewX(-20deg) scale(1.02); }
        }
        @keyframes particle-glow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.1); }
        }
        @keyframes particle-float {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(2px, -1px); }
          50% { transform: translate(-1px, 2px); }
          75% { transform: translate(1px, 1px); }
        }
        .yahua-glass {
          background: linear-gradient(135deg, rgba(16, 25, 46, 0.85), rgba(26, 40, 64, 0.75));
          backdrop-filter: blur(12px);
          border: 1px solid rgba(212, 165, 32, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }
        .yahua-paper {
          background-color: #1a2840;
          background-image: radial-gradient(circle at 50% 50%, rgba(212, 165, 32, 0.05) 0%, transparent 80%);
          position: relative;
        }
        .yahua-paper::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0.1;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
        .gold-border-gradient {
          border-image: linear-gradient(to bottom, rgba(212,165,32,0.6), rgba(212,165,32,0.1), rgba(212,165,32,0.4)) 1;
        }
        .btn-ripple {
          position: relative;
          overflow: hidden;
        }
        .btn-ripple::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 50%;
          height: 25%;
          background: 
            radial-gradient(ellipse at 20% 30%, rgba(255,255,255,0.9) 0%, transparent 8%),
            radial-gradient(ellipse at 70% 20%, rgba(255,240,180,0.8) 0%, transparent 6%),
            radial-gradient(ellipse at 40% 70%, rgba(255,220,150,0.7) 0%, transparent 5%),
            radial-gradient(ellipse at 80% 60%, rgba(255,255,255,0.6) 0%, transparent 4%),
            radial-gradient(ellipse at 30% 50%, rgba(212,165,32,0.5) 0%, transparent 50%);
          transform: translate(-50%, -50%);
          pointer-events: none;
          animation: particle-glow 2s ease-in-out infinite;
        }
        .btn-ripple::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 45%;
          height: 22%;
          background: 
            radial-gradient(ellipse at 60% 40%, rgba(255,255,255,0.8) 0%, transparent 7%),
            radial-gradient(ellipse at 25% 60%, rgba(255,230,160,0.7) 0%, transparent 5%),
            radial-gradient(ellipse at 75% 30%, rgba(255,255,255,0.6) 0%, transparent 4%),
            radial-gradient(ellipse at 45% 25%, rgba(255,220,150,0.5) 0%, transparent 6%);
          transform: translate(-50%, -50%);
          pointer-events: none;
          animation: particle-glow 2s ease-in-out infinite, particle-float 3s ease-in-out infinite;
          animation-delay: 0.5s, 0s;
        }
      `}</style>

      {/* L0: 远景基底 - 呼吸与微视差 */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ 
          backgroundImage: `url(${PRE_BATTLE_BACKGROUND})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          transform: `scale(1.1) translate(${mousePos.x * -15}px, ${mousePos.y * -15}px)`,
          transition: 'transform 0.6s cubic-bezier(0.2, 0, 0.2, 1)',
          animation: 'bg-breathing 30s ease-in-out infinite'
        }} 
      />

      {/* L1: 渐变遮罩与色彩氛围 */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(160deg, rgba(13,11,7,0.45) 0%, rgba(26,18,8,0.3) 40%, rgba(15,26,21,0.4) 100%)' }} />

      {/* L2: 氤氲水墨雾气 */}
      <div 
        className="absolute inset-0 pointer-events-none mix-blend-screen opacity-30"
        style={{
          backgroundImage: `url(${asset('/assets/story/scenes/story_ch0_21_faded_ink.png')})`,
          backgroundSize: '200% auto',
          filter: 'invert(1) grayscale(1) brightness(1.5)',
          animation: 'drifting-mist 40s ease-in-out infinite',
          transform: `translate(${mousePos.x * 35}px, ${mousePos.y * 25}px)`
        }}
      />

      {/* L3: 侧边神光束 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute -top-1/2 -left-1/4 w-[200%] h-[200%] bg-gradient-to-r from-transparent via-[#f5e6b8]/10 to-transparent"
          style={{ 
            transform: `skewX(-20deg) translate(${mousePos.x * 10}px, 0)`,
            animation: 'god-ray-pulse 8s ease-in-out infinite'
          }}
        />
      </div>

      {/* L4: 炉火光晕背景 */}
      <div className="absolute inset-0 pointer-events-none" style={{ animation: 'forge-pulse 3s ease-in-out infinite' }}>
        <div style={{ position: 'absolute', bottom: '-10%', left: '50%', transform: `translateX(calc(-50% + ${mousePos.x * -10}px))`, width: '60%', height: '50%', background: 'radial-gradient(ellipse at bottom, rgba(232,93,4,0.22) 0%, transparent 70%)' }} />
      </div>

      {/* L5: 机关齿轮组 (带视差) */}
      <div style={{ transform: `translate(${mousePos.x * -40}px, ${mousePos.y * -40}px)`, transition: 'transform 0.8s cubic-bezier(0.1, 0, 0.1, 1)' }} className="absolute inset-0 pointer-events-none">
        <Gear size={180} x="-40px" y="10%" speed={12} opacity={0.15} />
        <Gear size={120} x="8%" y="55%" speed={-18} opacity={0.12} />
        <Gear size={240} x="75%" y="-5%" speed={8} opacity={0.1} />
        <Gear size={100} x="85%" y="60%" speed={-22} opacity={0.13} />
        <Gear size={60} x="60%" y="75%" speed={30} opacity={0.1} />
      </div>

      {/* L6: 火星粒子 (受鼠标影响) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ transform: `translateX(${mousePos.x * 20}px)` }}>
        {embers.map(i => <EmberParticle key={i} />)}
      </div>

      {/* 顶部导航 */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20 pointer-events-none">
        <div className="flex gap-4 items-start">
          {/* 墨翠玉佩头像 */}
          <div className="yahua-pendant-wrap">
            <div className="yahua-hanging-line" />
            <div 
              onClick={() => { uiAudio.playClick(); setActiveModal('profile'); }} 
              className="yahua-jade-frame cursor-pointer group"
            >
              <img 
                src={asset(selectedAvatar?.assetPath || '')} 
                alt="玩家头像" 
                className="w-full h-full object-cover transition-transform group-hover:scale-110 opacity-80 group-hover:opacity-100"
              />
            </div>
            {/* 底部流苏 */}
            <div className="yahua-tassel">
               <div className="flex">
                  <div className="yahua-tassel-thread" />
                  <div className="yahua-tassel-thread" style={{ height: '35px' }} />
                  <div className="yahua-tassel-thread" />
               </div>
            </div>
            <div className="mt-3 flex flex-col items-center">
               <span className="text-[#8B7355] font-serif text-lg font-black tracking-[0.2em] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] group-hover:text-[#D4AF65] transition-colors duration-300">{userName}</span>
               <div className="mt-1.5 flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-black/40 border border-[#D4AF65]/30">
                 <span className="text-[#D4AF65] text-[10px] font-black tracking-[0.2em] shadow-sm">学说造诣 · 12</span>
               </div>
            </div>
          </div>

          {/* 刀币笔触按钮 */}
          <div className="relative mt-2" style={{ animationDelay: '0.4s' }}>
            <div 
              onClick={() => { uiAudio.playClick(); setActiveModal('store_coin'); }}
              className="yahua-ink-stroke group"
            >
              <div className="flex items-center gap-3 relative z-10">
                <IconKnifeMoney size={22} color="#D4AF65" className="filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform" />
                <span className="text-[#8B7355] font-mono tracking-wider text-lg font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] group-hover:text-[#D4AF65] transition-colors">{coinBalance.toLocaleString()}</span>
                <span className="text-[#D4AF65] text-xs font-bold opacity-40 group-hover:opacity-100 transition-opacity ml-1">+</span>
              </div>
            </div>
          </div>

          {/* 玉玦笔触按钮 */}
          <div className="relative mt-2" style={{ animationDelay: '0.8s' }}>
            <div 
              onClick={() => { uiAudio.playClick(); setActiveModal('store_jade'); }}
              className="yahua-ink-stroke group"
            >
              <div className="flex items-center gap-3 relative z-10">
                <IconJadeJue size={22} color="#a0aec0" className="filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform" />
                <span className="text-[#8B7355] font-mono tracking-wider text-lg font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] group-hover:text-[#a7c5ba] transition-colors">{jadeBalance.toLocaleString()}</span>
                <span className="text-[#a0aec0] text-xs font-bold opacity-40 group-hover:opacity-100 transition-opacity ml-1">+</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 pointer-events-auto mt-2">
          <InkSystemButton 
            tooltip="百家盛会"
            visible={hoveredLabel === 'events'}
            onMouseEnter={() => { uiAudio.playHover(); setHoveredLabel('events'); }}
            onMouseLeave={() => setHoveredLabel(null)}
            onClick={() => { uiAudio.playClick(); setActiveModal('events'); }}
            hasNotice={hasEventNotice}
            icon={<IconImperialBanner size={30} color="#f5e6b8" />}
          />

          <InkSystemButton 
            tooltip="修行课业"
            visible={hoveredLabel === 'quests'}
            onMouseEnter={() => { uiAudio.playHover(); setHoveredLabel('quests'); }}
            onMouseLeave={() => setHoveredLabel(null)}
            onClick={() => { uiAudio.playClick(); setActiveModal('quests'); }}
            hasNotice={hasQuestNotice}
            noticeColor="#3A5F41"
            icon={<IconBambooSlips size={30} color="#f5e6b8" />}
          />

          <InkSystemButton 
            tooltip="万宁传书"
            visible={hoveredLabel === 'mail'}
            onMouseEnter={() => { uiAudio.playHover(); setHoveredLabel('mail'); }}
            onMouseLeave={() => setHoveredLabel(null)}
            onClick={handleOpenMail}
            hasNotice={hasMailNotice}
            icon={<IconVanninBird size={32} color="#f5e6b8" />}
          />

          <InkSystemButton 
            tooltip="百家文库"
            visible={hoveredLabel === 'community'}
            onMouseEnter={() => { uiAudio.playHover(); setHoveredLabel('community'); }}
            onMouseLeave={() => setHoveredLabel(null)}
            onClick={() => { uiAudio.playClick(); setActiveModal('community'); }}
            icon={<IconBrushForest size={30} color="#f5e6b8" />}
          />

          <div className="w-px h-6 bg-[rgba(212,165,32,0.15)]" />

          <InkSystemButton 
            tooltip="系统机枢"
            visible={hoveredLabel === 'settings'}
            onMouseEnter={() => { uiAudio.playHover(); setHoveredLabel('settings'); }}
            onMouseLeave={() => setHoveredLabel(null)}
            onClick={() => { uiAudio.playClick(); setActiveModal('settings'); }}
            icon={<IconXuanjiGear size={30} color="#f5e6b8" />}
          />
        </div>
      </div>

      {/* 主内容 */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-8">
        <div className="mb-4 text-center">
          <div style={{ color: 'rgba(74,124,111,0.8)', fontSize: '13px', letterSpacing: '8px', fontFamily: 'serif' }}>◆ 诸子百家 · 论道争锋 ◆</div>
        </div>
        <div className="mb-2 text-center relative">
          {/* 删除了原有的“筹”字印章装饰 */}

          <div
            className="absolute -left-8 -top-10"
            style={{
              width: '180px',
              height: '140px',
              background: 'radial-gradient(ellipse at center, rgba(10, 8, 5, 0.4) 0%, rgba(20, 15, 10, 0.2) 40%, transparent 85%)',
              animation: 'ink-spread 2s ease-out both',
              filter: 'blur(20px)',
              pointerEvents: 'none',
              zIndex: 0
            }}
          />

          {/* 主标题 - 使用 CSS 渲染以确保色彩统一与矿物感 */}
          <h1 className="relative flex flex-col items-center" style={{ animation: 'title-brush 4s ease-in-out infinite' }}>
            {/* 文字标题 */}
            <span
              className="relative z-10"
              style={{
                fontSize: 'clamp(64px, 11vw, 108px)',
                fontWeight: 900,
                fontFamily: '"STKaiti", "KaiTi", "楷体", serif',
                background: 'linear-gradient(180deg, #f6e4c3 0%, #D4AF65 45%, #D4AF65 55%, #8B7355 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: 'clamp(8px, 2vw, 24px)',
                lineHeight: 1.1,
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.8)) drop-shadow(0 0 20px rgba(212,175,101,0.2))',
                WebkitTextStroke: '1px rgba(212,175,101,0.15)',
              }}
            >
              思筹之录
            </span>
            
            {/* 底部倒影/辉光 */}
            <span 
              className="absolute inset-0 blur-[30px] opacity-20 pointer-events-none select-none"
              style={{
                fontSize: 'clamp(64px, 11vw, 108px)',
                fontWeight: 900,
                fontFamily: '"STKaiti", "KaiTi", "楷体", serif',
                color: '#D4AF65',
                letterSpacing: 'clamp(8px, 2vw, 24px)',
                lineHeight: 1.1,
                transform: 'translateY(4px)'
              }}
            >
              思筹之录
            </span>
          </h1>

          {/* 笔锋装饰线 */}
          <div className="flex items-center justify-center gap-3 mt-3">
            <div
              style={{
                height: '2px',
                width: '80px',
                background: 'linear-gradient(90deg, transparent, rgba(212,165,32,0.8), rgba(176,83,39,0.6))',
                boxShadow: '0 1px 3px rgba(212,165,32,0.3)',
              }}
            />
            <div
              style={{
                color: 'rgba(212,197,169,0.75)',
                fontSize: '12px',
                letterSpacing: '6px',
                fontFamily: 'serif',
                fontWeight: 500,
              }}
            >
              ASKING THE TAO
            </div>
            <div
              style={{
                height: '2px',
                width: '80px',
                background: 'linear-gradient(90deg, rgba(176,83,39,0.6), rgba(212,165,32,0.8), transparent)',
                boxShadow: '0 1px 3px rgba(212,165,32,0.3)',
              }}
            />
          </div>
        </div>
        <div className="mb-12" style={{ color: 'rgba(212,197,169,0.55)', fontSize: '18px', letterSpacing: '3px', fontFamily: 'serif' }}>包罗万象，百家永生。</div>

        <div className="flex flex-col gap-8 w-fit items-center">
          <InkButton 
            label="锋芒演武" 
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 17.5L3 6V3h3l11.5 11.5"/>
                <path d="M13 19l6-6"/>
                <path d="M16 16l4 4"/>
                <path d="M19 21l2-2"/>
              </svg>
            }
            onClick={onStartGame} 
            onMouseEnter={() => uiAudio.playHover()}
          />
          <InkButton 
            label="争鸣叙史" 
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                <line x1="8" y1="7" x2="16" y2="7"/>
                <line x1="8" y1="11" x2="16" y2="11"/>
                <line x1="8" y1="15" x2="12" y2="15"/>
              </svg>
            }
            onClick={() => { if (onStory) onStory(); }} 
            onMouseEnter={() => uiAudio.playHover()}
          />
          <InkButton 
            label="名士风采" 
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4"/>
                <path d="M18 21v-2a4 4 0 0 0-4-4H10a4 4 0 0 0-4 4v2"/>
                <path d="M12 12v4"/>
                <path d="M9 15l3-3 3 3"/>
              </svg>
            }
            onClick={onCharacters} 
            onMouseEnter={() => uiAudio.playHover()}
          />
          <InkButton 
            label="卡牌宝鉴" 
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="4" rx="1"/>
                <rect x="3" y="9" width="18" height="4" rx="1"/>
                <rect x="3" y="15" width="18" height="4" rx="1"/>
                <line x1="6" y1="5" x2="6" y2="5"/>
                <line x1="6" y1="11" x2="6" y2="11"/>
                <line x1="6" y1="17" x2="6" y2="17"/>
              </svg>
            }
            onClick={onCollection} 
            onMouseEnter={() => uiAudio.playHover()}
          />
        </div>

        <div className="absolute bottom-6 w-full flex items-center justify-between px-8 pointer-events-none">
          <div style={{ color: 'rgba(212,197,169,0.3)', fontSize: '11px', letterSpacing: '1px' }}>v1.0.0 Alpha</div>
          <div style={{ color: 'rgba(212,197,169,0.3)', fontSize: '11px', letterSpacing: '2px' }}>© 2026 ASKING THE TAO ALL RIGHTS RESERVED.</div>
        </div>
      </div>

      {/* ★ 弹窗渲染区 */}
      {activeModal === 'profile' && (
        <div className="absolute inset-0 z-[9999] flex items-center justify-center pointer-events-auto overflow-hidden">
          {/* 背景：大面积水墨晕染与深邃遮罩 */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-all duration-1000"
            onClick={() => setActiveModal(null)}
          />
          <div 
            className="absolute inset-0 pointer-events-none opacity-60"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(10, 14, 20, 0.95) 0%, rgba(10, 14, 20, 0.4) 60%, transparent 100%)',
              animation: 'ink-spread 1.5s cubic-bezier(0.16, 1, 0.3, 1) both'
            }}
          />

          {/* 核心内容区：无框设计，浮动于墨色空间 */}
          <div className="relative w-full max-w-5xl h-[75vh] flex flex-col items-center animate-in fade-in zoom-in-95 duration-700 z-10">
            {/* 顶栏：紧凑化标题 */}
            <div className="w-full flex items-center justify-between px-16 mb-6">
              <div className="flex items-center gap-6">
                <div className="w-1 h-6 bg-gradient-to-b from-[#D4AF65] to-transparent rounded-full shadow-[0_0_10px_#D4AF65]" />
                <div>
                  <h2 className="text-[#f6e4c3] font-serif text-3xl tracking-[0.3em] drop-shadow-lg select-none">名士风采</h2>
                </div>
              </div>
              <button 
                onClick={() => { uiAudio.playClick(); setActiveModal(null); }}
                className="group relative w-10 h-10 flex items-center justify-center text-[#f6e4c3]/40 hover:text-[#f6e4c3] transition-colors z-20"
              >
                <div className="absolute inset-0 border border-[#D4AF65]/20 rounded-full group-hover:scale-110 group-hover:border-[#D4AF65]/50 transition-all" />
                <span className="text-xl font-light group-hover:rotate-90 transition-transform">✕</span>
              </button>
            </div>

            {/* 左右分栏布局 - 移除滚动，使用 Flex 适配 */}
            <div className="w-full flex-1 flex gap-12 px-16 overflow-hidden">
              {/* 左侧：名士立像 - 调整为更紧凑的垂直分布 */}
              <div className="w-80 flex flex-col items-center justify-start pt-4">
                <div className="relative group mb-6">
                  {/* 背景装饰层级调低 */}
                  <div className="absolute -inset-6 border border-[#D4AF65]/5 rounded-full animate-[spin_20s_linear_infinite] z-0" />
                  <div className="absolute -inset-4 border-2 border-[#D4AF65]/10 rounded-full animate-[spin_12s_linear_infinite_reverse] z-0" />
                  
                  <div className="relative w-40 h-40 rounded-full border-2 border-[#D4AF65] p-1 bg-[#0a0503] shadow-[0_0_30px_rgba(212,175,101,0.2)] overflow-hidden z-10">
                    <img 
                      src={asset(selectedAvatar.assetPath)} 
                      alt="名士头像" 
                      className="w-full h-full object-cover rounded-full opacity-90 group-hover:scale-105 transition-all duration-700"
                    />
                  </div>
                  
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#D4AF65] text-[#0a0503] text-[10px] px-4 py-0.5 rounded-full font-black shadow-xl tracking-widest border border-white/20 z-20">
                    等级 · 12
                  </div>
                </div>

                <div className="text-center space-y-3 z-10">
                  <div className="flex items-center justify-center gap-2">
                    <h3 className="text-[#f6e4c3] text-2xl font-serif tracking-[0.2em] drop-shadow-md">{userName}</h3>
                    <button onClick={() => { setIsEditingName(true); setTempName(userName); }} className="opacity-30 hover:opacity-100 text-[#D4AF65] transition-opacity">
                      <span className="text-base">✎</span>
                    </button>
                  </div>
                  <div className="flex flex-col gap-1 items-center py-2 px-6 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm">
                    <span className="text-[#D4AF65] text-[10px] font-bold tracking-[0.2em] uppercase">学派 · 墨家</span>
                    <span className="text-[#f6e4c3]/60 text-[10px] tracking-widest">段位 · 青铜 Ⅲ</span>
                  </div>
                </div>
              </div>

              {/* 右侧：数据看板与成就 - 优化布局以适应无滚动 */}
              <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                {/* 页签切换 */}
                <div className="flex gap-10 border-b border-[#D4AF65]/10 pb-2 z-10">
                  <button 
                    onClick={() => setProfileTab('overview')}
                    className={`text-xs tracking-[0.2em] font-bold transition-all ${profileTab === 'overview' ? 'text-[#D4AF65]' : 'text-[#f6e4c3]/30 hover:text-[#f6e4c3]/60'}`}
                  >纵览概要</button>
                  <button 
                    onClick={() => setProfileTab('records')}
                    className={`text-xs tracking-[0.2em] font-bold transition-all ${profileTab === 'records' ? 'text-[#D4AF65]' : 'text-[#f6e4c3]/30 hover:text-[#f6e4c3]/60'}`}
                  >名士影谱</button>
                </div>

                {profileTab === 'overview' ? (
                  <div className="flex-1 flex flex-col justify-between py-2 animate-in fade-in slide-in-from-right-4 duration-500 overflow-hidden">
                    {/* 资产看板 - 紧凑型 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-4 group hover:bg-white/10 transition-colors z-10">
                        <div className="w-10 h-10 rounded-lg bg-[#D4AF65]/10 flex items-center justify-center border border-[#D4AF65]/20">
                          <IconKnifeMoney size={20} color="#D4AF65" />
                        </div>
                        <div>
                          <p className="text-[#D4AF65]/40 text-[9px] font-bold tracking-widest mb-0.5">铜钱</p>
                          <p className="text-[#f6e4c3] font-mono text-lg tabular-nums leading-none">{coinBalance.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-4 group hover:bg-white/10 transition-colors z-10">
                        <div className="w-10 h-10 rounded-lg bg-[#3A5F41]/10 flex items-center justify-center border border-[#3A5F41]/20">
                          <IconJadeJue size={20} color="#3A5F41" />
                        </div>
                        <div>
                          <p className="text-[#3A5F41]/60 text-[9px] font-bold tracking-widest mb-0.5">机关玉</p>
                          <p className="text-[#f6e4c3] font-mono text-lg tabular-nums leading-none">{jadeBalance.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* 战绩记录 - 横向排布 */}
                    <div className="p-5 rounded-xl bg-[#0a0503]/40 border border-white/5 z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-2 h-2 bg-[#D4AF65] rotate-45" />
                        <h4 className="text-[#f6e4c3] font-serif text-sm tracking-widest">论道战绩</h4>
                      </div>
                      <div className="flex justify-around items-center">
                        {[
                          { label: '总场次', val: '42', color: '#f6e4c3' },
                          { label: '胜率', val: '64%', color: '#D4AF65' },
                          { label: '连胜', val: '5', color: '#1e3a5f' }
                        ].map((stat, i) => (
                          <div key={i} className="text-center px-6 border-r border-white/5 last:border-0">
                            <p className="text-[#f6e4c3]/40 text-[8px] font-bold tracking-widest mb-1 uppercase">{stat.label}</p>
                            <p className="text-xl font-black tabular-nums leading-none" style={{ color: stat.color }}>{stat.val}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 成就墙 - 缩减列表长度或紧凑排列 */}
                    <div className="space-y-4 z-10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-[#D4AF65] rotate-45" />
                          <h4 className="text-[#f6e4c3] font-serif text-sm tracking-widest">近期成就</h4>
                        </div>
                        <span className="text-[9px] text-[#D4AF65]/60 font-bold tracking-widest">24 / 120</span>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {[
                          { title: '首次论道', done: true },
                          { title: '连胜3场', done: true },
                          { title: '墨家翘楚', done: true },
                          { title: '卡牌新手', done: false },
                          { title: '论战不休', done: false }
                        ].map((ach, idx) => (
                          <div key={idx} className={`px-4 py-1.5 rounded-full border text-[10px] font-bold tracking-widest transition-all ${
                            ach.done 
                              ? 'bg-[#D4AF65]/10 border-[#D4AF65]/30 text-[#D4AF65]' 
                              : 'bg-white/5 border-white/5 text-[#f6e4c3]/10'
                          }`}>
                            {ach.done && <span className="mr-1.5 text-[8px]">✦</span>}
                            {ach.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-500 overflow-hidden z-10">
                     <div className="grid grid-cols-4 gap-4 flex-1">
                       {AvatarBackend.listAll().slice(0, 8).map((av) => (
                         <button
                           key={av.id}
                           onClick={() => {
                             if (av.isUnlocked) {
                               AvatarBackend.select(av.id);
                               setSelectedAvatar(av);
                               uiAudio.playClick();
                             }
                           }}
                           className={`relative aspect-square rounded-xl border-2 transition-all duration-500 overflow-hidden group/item ${
                             selectedAvatar.id === av.id 
                               ? 'border-[#D4AF65] shadow-[0_0_20px_rgba(212,175,101,0.2)] z-10 scale-105' 
                               : av.isUnlocked 
                                 ? 'border-white/5 hover:border-[#D4AF65]/40' 
                                 : 'border-transparent opacity-20 grayscale'
                           }`}
                         >
                           <img 
                             src={asset(av.assetPath)} 
                             className={`w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110 ${av.id === 'faction_legalist' ? 'scale-[0.82]' : ''}`} 
                             alt={av.name}
                           />
                           {selectedAvatar.id === av.id && (
                             <div className="absolute top-1 right-1 bg-[#D4AF65] text-[#0a0503] rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-black">✓</div>
                           )}
                           <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent py-1 text-[8px] text-[#f6e4c3] font-serif tracking-widest truncate px-2">
                             {av.name}
                           </div>
                         </button>
                       ))}
                     </div>
                     <div className="mt-4 p-4 rounded-xl bg-[#0a0503]/40 border border-white/5">
                        <p className="text-[#D4AF65] text-[9px] font-black tracking-[0.2em] uppercase mb-1">Unlock Condition</p>
                        <p className="text-[#f6e4c3]/60 text-xs leading-relaxed italic font-serif">
                          「 {selectedAvatar.unlockDesc} 」
                        </p>
                     </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {activeModal === 'store_coin' && (
        <div className="absolute inset-0 z-[9999] flex items-center justify-center pointer-events-auto overflow-hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md transition-all duration-1000" onClick={() => setActiveModal(null)} />
          <div className="absolute inset-0 pointer-events-none opacity-40" style={{ background: 'radial-gradient(circle at 50% 50%, #0a0e14 0%, transparent 100%)' }} />
          
          <div className="relative w-full max-w-5xl h-[65vh] flex flex-col items-center animate-in fade-in zoom-in-95 duration-500 z-10 px-16">
            <div className="w-full flex items-center justify-between mb-10">
               <div className="flex items-center gap-6">
                <div className="w-1 h-8 bg-[#D4AF65] shadow-[0_0_15px_#D4AF65]" />
                <h2 className="text-[#f6e4c3] font-serif text-4xl tracking-[0.4em] drop-shadow-xl">珍宝阁</h2>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-[#f6e4c3]/40 hover:text-[#f6e4c3] text-3xl font-light transition-all hover:rotate-90">✕</button>
            </div>

            <div className="grid grid-cols-3 gap-8 w-full mb-12">
              <ShopItem icon="🃏" name="随机卡牌" price="500 铜钱" amount="包含 1 张随机卡牌" onBuy={() => handleBuyCoinPack(COIN_PACKS[0])} />
              <ShopItem icon="🏯" name="门派礼包" price="1000 铜钱" amount="墨/儒门派基础卡" onBuy={() => handleBuyCoinPack(COIN_PACKS[1])} />
              <ShopItem icon="💎" name="每日特惠" price="300 铜钱" amount="限时 7 折优惠" onBuy={() => handleBuyCoinPack(COIN_PACKS[2])} />
            </div>

            <div className="mt-auto py-4 px-12 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl flex items-center gap-6">
              <span className="text-[#D4AF65]/60 text-xs font-bold tracking-widest uppercase">当前储备</span>
              <span className="text-[#f6e4c3] font-mono text-2xl tabular-nums drop-shadow-[0_0_10px_rgba(212,175,101,0.3)]">🪙 {coinBalance.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'store_jade' && (
        <div className="absolute inset-0 z-[9999] flex items-center justify-center pointer-events-auto overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xl transition-all duration-1000" onClick={() => setActiveModal(null)} />
          
          <div className="relative w-full max-w-5xl h-[65vh] flex flex-col items-center animate-in fade-in zoom-in-95 duration-500 z-10 px-16">
            <div className="w-full flex items-center justify-between mb-10">
               <div className="flex items-center gap-6">
                <div className="w-1 h-8 bg-[#1e3a5f] shadow-[0_0_15px_#1e3a5f]" />
                <h2 className="text-[#f6e4c3] font-serif text-4xl tracking-[0.4em] drop-shadow-xl">珍宝阁</h2>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-[#f6e4c3]/40 hover:text-[#f6e4c3] text-3xl font-light transition-all hover:rotate-90">✕</button>
            </div>

            <div className="grid grid-cols-3 gap-8 w-full mb-12">
              <ShopItem type="jade" icon="✨" name="限定卡牌" price="200" amount="本季限定传说卡" onBuy={() => handleBuyJadePack(JADE_PACKS[0])} />
              <ShopItem type="jade" icon="🎭" name="皮肤碎片" price="50" amount="用于兑换名士外观" onBuy={() => handleBuyJadePack(JADE_PACKS[1])} />
              <ShopItem type="jade" icon="🖼️" name="头像框" price="100" amount="稷下学宫特殊框" onBuy={() => handleBuyJadePack(JADE_PACKS[2])} />
            </div>

            <div className="mt-auto py-4 px-12 rounded-full bg-[#1e3a5f]/10 border border-[#1e3a5f]/20 backdrop-blur-xl flex items-center gap-6">
              <span className="text-[#9eb9dd]/60 text-xs font-bold tracking-widest uppercase">机关密藏</span>
              <span className="text-[#f6e4c3] font-mono text-2xl tabular-nums drop-shadow-[0_0_10px_rgba(158,185,221,0.3)]">💠 {jadeBalance.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
      {activeModal === 'events' && (
        <div className="absolute inset-0 z-[9999] flex items-center justify-center pointer-events-auto overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xl transition-all duration-1000" onClick={() => setActiveModal(null)} />
          
          <div className="relative w-full max-w-5xl h-[75vh] flex flex-col items-center animate-in fade-in zoom-in-95 duration-500 z-10 px-16">
            <div className="w-full flex items-center justify-between mb-8">
               <div className="flex items-center gap-6">
                <div className="w-1.5 h-10 bg-gradient-to-b from-[#831843] to-transparent shadow-[0_0_20px_#831843]" />
                <div>
                  <h2 className="text-[#f6e4c3] font-serif text-4xl tracking-[0.4em] drop-shadow-xl">百家盛会</h2>
                  <p className="text-[#831843] text-[10px] tracking-[0.2em] font-black uppercase mt-1">Jixia Events Hub</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-[#f6e4c3]/40 hover:text-[#f6e4c3] text-3xl font-light transition-all hover:rotate-90">✕</button>
            </div>

            <div className="w-full flex-1 flex flex-col gap-6 overflow-hidden">
              {/* V9 Banner */}
              <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-[#D4AF65]/30 group shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0503] via-[#0a0503]/80 to-transparent z-10" />
                <div className="absolute inset-0 bg-[#0a0503] opacity-20 group-hover:scale-110 transition-transform duration-[3s]" />
                
                <div className="relative z-20 h-full flex flex-col justify-center px-12">
                  <div className="flex items-center gap-3 mb-2 text-[#D4AF65]">
                    <IconFire size={20} className="animate-pulse" />
                    <span className="text-xs font-black tracking-[0.3em] uppercase">Limited Time</span>
                  </div>
                  <h3 className="text-[#f6e4c3] text-3xl font-serif mb-3 tracking-widest">稷下开学季 · 墨子公开课</h3>
                  <p className="text-[#f6e4c3]/50 text-xs max-w-lg leading-relaxed mb-6">墨子亲传机枢秘笈限时发放，参与公开课论辩即可解锁限定门派卡牌“非攻”。</p>
                  
                  <div className="flex items-center gap-8 w-96">
                    <div className="flex-1">
                      <div className="flex justify-between text-[10px] text-[#D4AF65] mb-2 font-bold tracking-widest">
                        <span>论道进度</span>
                        <span>3 / 5</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-gradient-to-r from-[#D4AF65] to-[#f6e4c3] w-[60%] rounded-full shadow-[0_0_10px_#D4AF65]" />
                      </div>
                    </div>
                    <button 
                      onClick={() => { uiAudio.playClick(); onStartGame(); }}
                      className="px-10 py-2.5 bg-[#D4AF65] text-[#0a0503] text-xs font-black tracking-[0.2em] rounded-full hover:scale-105 transition-all shadow-lg active:scale-95"
                    >立即前往</button>
                  </div>
                </div>
                
                <div className="absolute top-6 right-8 text-[10px] text-[#D4AF65]/40 font-black tracking-[0.2em] z-20 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#D4AF65] rounded-full animate-ping" />
                  剩余时间：3天 12:45
                </div>
              </div>

              {/* Sub-Events */}
              <div className="grid grid-cols-2 gap-6 pb-4">
                <GoldenCard className="flex items-center justify-between border-l-4 border-l-[#D4AF65] py-5">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-full bg-[#D4AF65]/10 flex items-center justify-center border border-[#D4AF65]/20">
                      <IconCalendar size={24} color="#D4AF65" />
                    </div>
                    <div>
                      <h4 className="text-[#f6e4c3] text-lg font-serif mb-1">日常签到</h4>
                      <p className="text-[#f6e4c3]/40 text-xs">每日首胜奖励翻倍，额外获赠 400 铜钱</p>
                    </div>
                  </div>
                  <div className="text-[#D4AF65] text-[10px] font-black tracking-[0.2em] px-4 py-1.5 bg-[#D4AF65]/5 rounded-full border border-[#D4AF65]/20">进行中</div>
                </GoldenCard>

                <GoldenCard className="flex items-center justify-between opacity-50 py-5">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                      <IconGift size={24} color="#f6e4c3" />
                    </div>
                    <div>
                      <h4 className="text-[#f6e4c3]/60 text-lg font-serif mb-1 line-through">萌新礼包</h4>
                      <p className="text-[#f6e4c3]/30 text-xs">恭喜获得初始墨家基础卡组 × 1</p>
                    </div>
                  </div>
                  <div className="text-white/20 text-[10px] font-black tracking-[0.2em] px-4 py-1.5 bg-white/5 rounded-full border border-white/5">已领取</div>
                </GoldenCard>
              </div>
            </div>
            
            <div className="mt-auto py-6 border-t border-white/5 w-full text-center">
              <span className="text-[10px] text-[#f6e4c3]/20 tracking-[0.5em] font-serif uppercase">Jixia Academic Academy · Scholarly Pursuit</span>
            </div>
          </div>
        </div>
      )}
      {activeModal === 'quests' && (
        <div className="absolute inset-0 z-[9999] flex items-center justify-center pointer-events-auto overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xl transition-all duration-1000" onClick={() => setActiveModal(null)} />
          
          <div className="relative w-full max-w-6xl h-[80vh] flex flex-col items-center animate-in fade-in zoom-in-95 duration-500 z-10 px-16">
            <div className="w-full flex items-center justify-between mb-6">
               <div className="flex items-center gap-6">
                <div className="w-1.5 h-10 bg-gradient-to-b from-[#D4AF65] to-transparent shadow-[0_0_20px_#D4AF65]" />
                <div>
                  <h2 className="text-[#f6e4c3] font-serif text-4xl tracking-[0.4em] drop-shadow-xl">修行课业</h2>
                  <p className="text-[#D4AF65]/60 text-[10px] tracking-[0.2em] font-black uppercase mt-1">Spiritual Cultivation Tasks</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-[#f6e4c3]/40 hover:text-[#f6e4c3] text-3xl font-light transition-all hover:rotate-90">✕</button>
            </div>

            {/* Tabs & Layout */}
            <div className="w-full flex flex-col gap-6 overflow-hidden">
              <div className="flex gap-10 border-b border-[#D4AF65]/10 pb-2">
                <button onClick={() => setQuestTab('daily')} className={`text-xs tracking-[0.2em] font-bold transition-all ${questTab === 'daily' ? 'text-[#D4AF65]' : 'text-[#f6e4c3]/30'}`}>今日修行</button>
                <button onClick={() => setQuestTab('weekly')} className={`text-xs tracking-[0.2em] font-bold transition-all ${questTab === 'weekly' ? 'text-[#D4AF65]' : 'text-[#f6e4c3]/30'}`}>每周课业</button>
                <button onClick={() => setQuestTab('achieve')} className={`text-xs tracking-[0.2em] font-bold transition-all ${questTab === 'achieve' ? 'text-[#D4AF65]' : 'text-[#f6e4c3]/30'}`}>历程成就</button>
              </div>

              {/* Grid Layout to avoid scrolling */}
              <div className="grid grid-cols-2 gap-4 flex-1">
                {quests.slice(0, 4).map((item) => {
                  const done = item.progress >= item.target;
                  return (
                    <GoldenCard key={item.id} className={`py-4 px-6 ${item.claimed ? 'opacity-30' : ''}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-[#D4AF65]/10 border border-[#D4AF65]/20 flex items-center justify-center">
                             {item.title.includes('胜利') ? <IconMartial size={20} color="#D4AF65" /> : <IconBambooSlips size={20} color="#D4AF65" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[#f6e4c3] text-sm font-serif">{item.title}</span>
                            <div className="flex gap-3 mt-1">
                              {item.rewardCoin > 0 && <span className="text-[9px] text-[#D4AF65]/60 font-mono">🪙 {item.rewardCoin}</span>}
                              {item.rewardJade > 0 && <span className="text-[9px] text-[#3A5F41] font-mono">💠 {item.rewardJade}</span>}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-[#D4AF65]/60">{item.progress} / {item.target}</span>
                      </div>
                      
                      <div className="h-1 w-full bg-white/5 rounded-full mb-4 overflow-hidden border border-white/5">
                        <div className="h-full bg-gradient-to-r from-[#D4AF65] to-[#f6e4c3] transition-all duration-700" style={{ width: `${Math.min(100, (item.progress / item.target) * 100)}%` }} />
                      </div>

                      <div className="flex justify-end">
                        <button
                          disabled={!done || item.claimed}
                          onClick={() => handleClaimQuest(item.id)}
                          className={`text-[9px] px-5 py-1.5 rounded-full transition-all tracking-widest font-black uppercase ${
                            item.claimed ? 'bg-transparent text-white/10' : done ? 'bg-[#D4AF65] text-[#0a0503] shadow-lg' : 'bg-white/5 text-[#f6e4c3]/20 border border-white/5'
                          }`}
                        >
                          {item.claimed ? 'Claimed' : done ? 'Claim Rewards' : 'In Progress'}
                        </button>
                      </div>
                    </GoldenCard>
                  );
                })}
              </div>
            </div>
            
            <div className="mt-auto py-6 border-t border-white/5 w-full text-center">
              <span className="text-[10px] text-[#f6e4c3]/20 tracking-[0.5em] font-serif uppercase">Cultivation Path · Persistence is Virtue</span>
            </div>
          </div>
        </div>
      )}
      {activeModal === 'mail' && (
        <div className="absolute inset-0 z-[9999] flex items-center justify-center pointer-events-auto overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xl transition-all duration-1000" onClick={() => setActiveModal(null)} />
          
          <div className="relative w-full max-w-5xl h-[75vh] flex flex-col items-center animate-in fade-in zoom-in-95 duration-500 z-10 px-16">
            <div className="w-full flex items-center justify-between mb-8">
               <div className="flex items-center gap-6">
                <div className="w-1.5 h-10 bg-gradient-to-b from-[#1e3a5f] to-transparent shadow-[0_0_20px_#1e3a5f]" />
                <div>
                  <h2 className="text-[#f6e4c3] font-serif text-4xl tracking-[0.4em] drop-shadow-xl">万宁传书</h2>
                  <p className="text-[#1e3a5f]/80 text-[10px] tracking-[0.2em] font-black uppercase mt-1">Messenger Chronicles</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <button
                  onClick={() => setMails(prev => prev.map(m => ({ ...m, read: true })))}
                  className="text-[10px] text-[#D4AF65] border border-[#D4AF65]/30 px-6 py-2 rounded-full hover:bg-[#D4AF65]/10 transition-all font-black tracking-widest uppercase"
                >Mark All Read</button>
                <button onClick={() => setActiveModal(null)} className="text-[#f6e4c3]/40 hover:text-[#f6e4c3] text-3xl font-light transition-all hover:rotate-90">✕</button>
              </div>
            </div>

            <div className="w-full flex-1 flex flex-col gap-4 overflow-hidden">
              <div className="grid grid-cols-2 gap-4">
                {mails.slice(0, 4).map((item) => (
                  <GoldenCard key={item.id} className={`py-4 px-6 ${item.read ? 'opacity-40' : 'border-l-4 border-l-[#D4AF65]'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-xl">
                           {item.rewardCoin || item.rewardJade ? <IconGift size={22} color="#D4AF65" /> : <IconVanninBird size={22} color="#f6e4c3" />}
                        </div>
                        <div className="flex flex-col">
                           <h3 className="text-[#f6e4c3] text-sm font-serif">{item.title}</h3>
                           <span className="text-[8px] text-[#f6e4c3]/30 font-mono tracking-tighter">APRIL 15, 2026</span>
                        </div>
                      </div>
                      {!item.read && <div className="w-2 h-2 bg-[#831843] rounded-full animate-pulse shadow-[0_0_10px_#831843]" />}
                    </div>
                    
                    <p className="text-[#f6e4c3]/50 text-[11px] leading-relaxed line-clamp-2 mb-4">{item.content}</p>

                    <div className="flex items-center justify-between">
                       <div className="flex gap-2">
                         {item.rewardCoin > 0 && <div className="bg-[#D4AF65]/10 px-2 py-0.5 rounded text-[9px] text-[#D4AF65]">🪙 {item.rewardCoin}</div>}
                         {item.rewardJade > 0 && <div className="bg-[#1e3a5f]/10 px-2 py-0.5 rounded text-[9px] text-[#9eb9dd]">💠 {item.rewardJade}</div>}
                       </div>
                       <div className="flex gap-3">
                         <button
                           disabled={item.claimed}
                           onClick={() => handleClaimMail(item.id)}
                           className={`text-[9px] px-4 py-1.5 rounded-full transition-all font-black uppercase ${
                             item.claimed ? 'text-white/10' : 'bg-white/5 text-[#D4AF65] border border-[#D4AF65]/20 hover:bg-[#D4AF65]/20'
                           }`}
                         >
                           {item.claimed ? 'Received' : 'Claim Attachment'}
                         </button>
                         <button className="text-[#831843] opacity-30 hover:opacity-100 transition-opacity">
                            <IconFire size={14} />
                         </button>
                       </div>
                    </div>
                  </GoldenCard>
                ))}
              </div>
            </div>
            
            <div className="mt-auto py-6 border-t border-white/5 w-full text-center">
              <span className="text-[10px] text-[#f6e4c3]/20 tracking-[0.5em] font-serif uppercase">Messenger Chronicles · Distant Echoes</span>
            </div>
          </div>
        </div>
      )}
      {activeModal === 'community' && (
        <CommunityScreen
          isOpen={activeModal === 'community'}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'settings' && (
        <div className="absolute inset-0 z-[9999] flex items-center justify-center pointer-events-auto overflow-hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-2xl transition-all duration-1000" onClick={() => setActiveModal(null)} />
          
          <div className="relative w-full max-w-3xl h-[60vh] flex flex-col items-center animate-in fade-in slide-in-from-bottom-10 duration-500 z-10 px-12 py-10 bg-[#0a0503]/80 border border-[#D4AF65]/30 rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.8)]">
            <div className="w-full flex items-center justify-between mb-10">
               <div className="flex items-center gap-6">
                <div className="w-1.5 h-10 bg-[#D4AF65] shadow-[0_0_20px_#D4AF65]" />
                <div>
                  <h2 className="text-[#f6e4c3] font-serif text-3xl tracking-[0.4em] drop-shadow-xl">机枢设置</h2>
                  <p className="text-[#D4AF65]/60 text-[10px] tracking-[0.2em] font-black uppercase mt-1">System Configuration</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-[#f6e4c3]/40 hover:text-[#f6e4c3] text-2xl font-light transition-all hover:rotate-90">✕</button>
            </div>

            <div className="w-full flex-1 overflow-hidden">
              <SettingsPanel settings={settings} onSettingsChange={onSettingsChange} />
            </div>
            
            <div className="mt-8 pt-6 border-t border-[#D4AF65]/10 w-full text-center">
              <p className="text-[10px] text-[#f6e4c3]/20 tracking-[0.3em] font-serif uppercase">Jixia Academic Academy · Tech Division</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
