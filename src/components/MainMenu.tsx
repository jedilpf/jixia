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
    <div className={`yahua-paper rounded-lg border border-[rgba(212, 175, 101, 0.2)] p-5 transition-all hover:border-[rgba(212, 175, 101, 0.45)] hover:shadow-[0_0_25px_rgba(212, 175, 101, 0.15)] active:scale-[0.99] group overflow-hidden ${className}`}>
      {/* Decorative inner light */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[rgba(212, 175, 101, 0.35)] to-transparent" />
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
      className={`relative px-6 py-2 text-sm font-serif tracking-widest transition-all border-b-2 ${
        active 
          ? 'text-[#D4AF65] border-[#D4AF65] bg-[#D4AF65]/5' 
          : 'text-[#f6e4c3]/60 border-transparent hover:text-[#f6e4c3] hover:bg-white/5'
      }`}
    >
      {label}
      {badge && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center">
            <span className="w-2.5 h-2.5 bg-[#831843] rounded-full animate-pulse shadow-[0_0_8px_rgba(131,24,67,0.6)]" />
            <span className="absolute w-4 h-4 border border-[#831843]/30 rounded-full animate-ping" />
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
    <div className="group relative flex flex-col items-center bg-[#1a2840] border border-[rgba(212,165,32,0.3)] rounded-lg p-4 transition-all hover:border-[rgba(212,165,32,0.6)] hover:brightness-110">
      <div className="text-4xl mb-3 filter drop-shadow-[0_0_8px_rgba(212,165,32,0.4)] group-hover:scale-110 transition-transform">{icon}</div>
      <div className="text-[#f5e6b8] text-sm font-serif mb-1">{name}</div>
      <div className="text-[#a7c5ba] text-xs mb-4">{amount}</div>
      <button 
        onClick={(e) => { e.stopPropagation(); onBuy(); }}
        className={`w-full py-1.5 rounded border text-xs transition-all ${
          isCoin 
            ? 'border-[rgba(212,165,32,0.4)] text-[#d4a520] hover:bg-[#d4a520] hover:text-black' 
            : 'border-[rgba(74,124,111,0.4)] text-[#a7c5ba] hover:bg-[#4a6b99] hover:text-white'
        }`}
      >
        {typeof price === 'number' ? `💠 ${price}` : price}
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
            tooltip="翰林墨汇"
            visible={hoveredLabel === 'community'}
            onMouseEnter={() => { uiAudio.playHover(); setHoveredLabel('community'); }}
            onMouseLeave={() => setHoveredLabel(null)}
            onClick={() => { uiAudio.playClick(); setActiveModal('community'); }}
            icon={<IconBrushForest size={30} color="#f5e6b8" />}
          />

          <div className="w-px h-6 bg-[rgba(212,165,32,0.15)]" />

          <InkSystemButton 
            tooltip="璇玑机枢"
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

          {/* 主标题 - 图片优先，文字fallback */}
          <h1 className="relative" style={{ animation: 'title-brush 3s ease-in-out infinite' }}>
            {/* 标题图片 */}
            <img
              src={asset('assets/title-logo.png')}
              alt="思筹之录"
              style={{
                width: 'clamp(320px, 60vw, 520px)',
                height: 'auto',
                display: 'block',
                filter: 'drop-shadow(2px 2px 6px rgba(0,0,0,0.4)) drop-shadow(0 0 15px rgba(212,165,32,0.3))',
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'block';
              }}
            />
            {/* 文字fallback */}
            <span
              style={{
                display: 'none',
                fontSize: 'clamp(64px, 11vw, 108px)',
                fontWeight: 900,
                fontFamily: '"STKaiti", "KaiTi", "楷体", serif',
                background: 'linear-gradient(175deg, #fef3c7 0%, #f5e6b8 15%, #d4a520 35%, #a07020 55%, #5d3a1a 80%, #2a1508 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: 'clamp(8px, 2vw, 20px)',
                lineHeight: 1.05,
                textIndent: '0.1em',
                WebkitTextStroke: '1px rgba(139,90,43,0.3)',
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
            label="开始辩斗" 
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
            label="人物志" 
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
        <SystemModal title="玩家档案" onClose={() => setActiveModal(null)}>
          <div className="w-full h-full flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar max-h-[70vh]">
            {/* Tabs for Profile */}
            <div className="flex gap-4 border-b border-white/5 pb-2">
              <button onClick={() => setProfileTab('overview')} className={`text-sm font-serif tracking-widest pb-1 border-b-2 transition-all ${profileTab === 'overview' ? 'text-[#d4a520] border-[#d4a520]' : 'text-[#a7c5ba] border-transparent'}`}>概览</button>
              <button onClick={() => setProfileTab('collection')} className={`text-sm font-serif tracking-widest pb-1 border-b-2 transition-all ${profileTab === 'collection' ? 'text-[#d4a520] border-[#d4a520]' : 'text-[#a7c5ba] border-transparent'}`}>头像库</button>
            </div>

            {profileTab === 'overview' ? (
              <>
                {/* Header Info */}
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-lg border-2 border-[#d4a520] overflow-hidden shadow-[0_0_20px_rgba(212,165,32,0.3)] bg-black/40">
                      <img 
                        src={asset(selectedAvatar.assetPath)} 
                        alt="头像" 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-[#d4a520] text-black text-[10px] px-2 py-0.5 rounded font-bold shadow-lg">
                      LV.12
                    </div>
                  </div>
                  
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      {isEditingName ? (
                        <div className="flex items-center gap-2">
                          <input 
                            value={tempName} 
                            onChange={(e) => setTempName(e.target.value)}
                            className="bg-black/40 border border-[#d4a520]/40 text-[#f5e6b8] px-2 py-1 rounded outline-none font-serif text-lg w-40"
                            autoFocus
                          />
                          <button 
                            onClick={() => {
                              setUserName(tempName);
                              localStorage.setItem('jixia_user_name', tempName);
                              setIsEditingName(false);
                              uiAudio.playClick();
                            }}
                            className="text-[#d4a520] hover:text-[#f5e6b8] text-xs"
                          >保存</button>
                        </div>
                      ) : (
                        <>
                          <h2 className="text-[#f5e6b8] text-2xl font-serif tracking-widest">{userName}</h2>
                          <button onClick={() => { setIsEditingName(true); setTempName(userName); }} className="text-[#a7c5ba] hover:text-[#d4a520] transition-colors">
                            <span className="text-sm">✎</span>
                          </button>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-[#a7c5ba]">墨家门徒</span>
                      <div className="w-1 h-1 rounded-full bg-[#d4a520]/40" />
                      <span className="text-[#d4a520]">段位：青铜 Ⅲ</span>
                    </div>
                  </div>
                </div>

                {/* Currency Bar */}
                <div className="w-full py-4 border-y border-[rgba(212,165,32,0.15)] flex justify-around text-base">
                  <div className="flex items-center gap-2">
                    <IconKnifeMoney size={20} color="#d4a520" />
                    <span className="text-[#a7c5ba]">铜钱：</span>
                    <span className="text-[#f5e6b8] font-mono">{coinBalance.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconJadeJue size={20} color="#3A5F41" />
                    <span className="text-[#a7c5ba]">机关玉：</span>
                    <span className="text-[#f5e6b8] font-mono">{jadeBalance.toLocaleString()}</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h3 className="text-[#d4a520] text-xs font-serif tracking-[0.2em] flex items-center gap-2">
                      <span>◆</span> 战斗记录
                    </h3>
                    <div className="bg-black/20 rounded-lg p-3 border border-white/5 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#a7c5ba]">总场次</span>
                        <span className="text-[#f5e6b8]">42</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#a7c5ba]">胜率</span>
                        <span className="text-[#f5e6b8]">64%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#a7c5ba]">最高连胜</span>
                        <span className="text-[#f5e6b8]">5</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[#d4a520] text-xs font-serif tracking-[0.2em] flex items-center gap-2">
                      <span>◆</span> 最爱门派
                    </h3>
                    <div className="bg-black/20 rounded-lg p-3 border border-white/5 flex items-center gap-2">
                      <div className="flex-1">
                        <div className="flex justify-between text-[10px] text-[#a7c5ba] mb-1">
                          <span>墨家 (32场)</span>
                          <span>76%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-[#d4a520] w-[76%]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Achievements */}
                <div className="space-y-3 pb-4">
                  <h3 className="text-[#d4a520] text-xs font-serif tracking-[0.2em] flex items-center gap-2">
                    <span>◆</span> 近期成就
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { title: '首次论道', done: true },
                      { title: '连胜3场', done: true },
                      { title: '收集10张卡', done: false },
                    ].map((ach, idx) => (
                      <div key={idx} className={`flex items-center justify-center p-2 rounded border text-[10px] gap-1.5 transition-colors ${
                        ach.done ? 'bg-[#d4a520]/10 border-[#d4a520]/30 text-[#f5e6b8]' : 'bg-black/20 border-white/5 text-[#a7c5ba]'
                      }`}>
                        <span>{ach.done ? '🏆' : '⬜'}</span>
                        {ach.title}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-6 pb-6">
                <div className="bg-black/20 p-4 rounded-lg border border-[rgba(212,165,32,0.1)]">
                   <p className="text-[#f5e6b8] text-sm font-serif mb-4 flex items-center gap-2">
                     <span className="text-[#d4a520]">✦</span> 稷下名士影谱
                   </p>
                   <div className="grid grid-cols-4 gap-4">
                     {AvatarBackend.listAll().map((av) => (
                       <button
                         key={av.id}
                         onClick={() => {
                           if (av.isUnlocked) {
                             AvatarBackend.select(av.id);
                             setSelectedAvatar(av);
                             uiAudio.playClick();
                           }
                         }}
                         className={`relative aspect-square rounded-lg border-2 transition-all ${
                           selectedAvatar.id === av.id 
                             ? 'border-[#d4a520] shadow-[0_0_15px_rgba(212,165,32,0.4)] scale-105 z-10' 
                             : av.isUnlocked 
                               ? 'border-white/10 hover:border-[#d4a520]/50' 
                               : 'border-transparent opacity-40 cursor-not-allowed'
                         }`}
                       >
                         <img 
                           src={asset(av.assetPath)} 
                           className="w-full h-full object-cover rounded-md" 
                           alt={av.name}
                         />
                         {selectedAvatar.id === av.id && (
                           <div className="absolute -top-1 -right-1 bg-[#d4a520] text-black rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">✓</div>
                         )}
                         {!av.isUnlocked && (
                           <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-md">
                             <span className="text-[10px] text-white">未解锁</span>
                           </div>
                         )}
                         <div className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-[8px] text-[#f5e6b8] font-serif truncate px-1 rounded-b-md">
                           {av.name}
                         </div>
                       </button>
                     ))}
                   </div>
                </div>
                
                <div className="space-y-2">
                   <p className="text-[#d4a520] text-xs font-serif tracking-widest">选中头像解锁条件</p>
                   <p className="text-[#a7c5ba] text-xs leading-relaxed italic border-l-2 border-[#d4a520]/40 pl-3">
                     {selectedAvatar.unlockDesc}
                   </p>
                </div>

                <div className="bg-[#1a2840] p-4 rounded-lg border border-white/5 flex items-center gap-4">
                  <div className="w-16 h-16 rounded border border-[#d4a520]/30 overflow-hidden">
                    <img src={asset(selectedAvatar.assetPath)} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-[#f5e6b8] font-serif">{selectedAvatar.name}</h4>
                    <p className="text-[#a7c5ba] text-[10px] mt-1">
                      {selectedAvatar.category === 'scholar' ? '学塾名士系列头像' : '稷下特殊成就系列'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SystemModal>
      )}
      {activeModal === 'store_coin' && (
        <SystemModal title="铜钱商店" onClose={() => setActiveModal(null)}>
          <div className="w-full flex flex-col gap-6">
            <div className="grid grid-cols-3 gap-4">
              <ShopItem icon="🃏" name="随机卡牌" price="500 铜钱" amount="包含 1 张随机卡牌" onBuy={() => handleBuyCoinPack(COIN_PACKS[0])} />
              <ShopItem icon="🏯" name="门派礼包" price="1000 铜钱" amount="墨/儒门派基础卡" onBuy={() => handleBuyCoinPack(COIN_PACKS[1])} />
              <ShopItem icon="💎" name="每日特惠" price="300 铜钱" amount="限时 7 折优惠" onBuy={() => handleBuyCoinPack(COIN_PACKS[2])} />
            </div>
            <div className="text-center py-2 border-t border-white/5">
              <span className="text-xs text-[#a7c5ba]">当前拥有：</span>
              <span className="text-sm text-[#f5e6b8] font-mono">🪙 {coinBalance.toLocaleString()}</span>
            </div>
          </div>
        </SystemModal>
      )}
      {activeModal === 'store_jade' && (
        <SystemModal title="机关玉兑换" onClose={() => setActiveModal(null)}>
          <div className="w-full flex flex-col gap-6">
            <div className="grid grid-cols-3 gap-4">
              <ShopItem type="jade" icon="✨" name="限定卡牌" price="200" amount="本季限定传说卡" onBuy={() => handleBuyJadePack(JADE_PACKS[0])} />
              <ShopItem type="jade" icon="🎭" name="皮肤碎片" price="50" amount="用于兑换名士外观" onBuy={() => handleBuyJadePack(JADE_PACKS[1])} />
              <ShopItem type="jade" icon="🖼️" name="头像框" price="100" amount="稷下学宫特殊框" onBuy={() => handleBuyJadePack(JADE_PACKS[2])} />
            </div>
            <div className="text-center py-2 border-t border-white/5">
              <span className="text-xs text-[#a7c5ba]">当前拥有：</span>
              <span className="text-sm text-[#9eb9dd] font-mono">💠 {jadeBalance.toLocaleString()}</span>
            </div>
          </div>
        </SystemModal>
      )}
      {activeModal === 'events' && (
        <FullscreenScreen
          isOpen={activeModal === 'events'}
          onClose={() => setActiveModal(null)}
          title="活动中心"
          subtitle="限时活动"
          icon={<MineralIconWrapper type="seal" size={40}><IconFire size={28} color="#f5e6b8" /></MineralIconWrapper>}
        >
          <div className="flex h-full flex-col gap-6">
            {/* Enhanced Banner */}
            <div className="relative rounded-xl overflow-hidden group shadow-2xl">
              <div className="h-40 bg-gradient-to-br from-[#1a2840] via-[#2a3c66] to-[#1a2840] flex flex-col justify-center px-10 relative z-10 border border-[rgba(212,165,32,0.3)]">
                {/* Background Decoration */}
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#d4a520]/10 to-transparent pointer-events-none" />
                
                <h3 className="text-[#f5e6b8] text-2xl font-serif mb-2 flex items-center gap-3">
                  <IconFire size={28} className="animate-pulse" /> 
                  限时活动：稷下开学季
                </h3>
                <p className="text-[#a7c5ba] text-sm mb-5 max-w-sm leading-relaxed">墨子亲传机枢秘笈限时发放，参与公开课论辩即可解锁限定门派卡牌“非攻”。</p>
                
                <div className="flex items-center justify-between gap-12">
                  <div className="flex-1">
                    <div className="flex justify-between text-[10px] text-[#d4a520] mb-2 uppercase tracking-tighter">
                      <span>已完成论道</span>
                      <span>3 / 5</span>
                    </div>
                    <div className="h-2 w-full bg-black/50 rounded-full p-0.5 border border-white/5 shadow-inner">
                      <div className="h-full bg-gradient-to-r from-[#8b5e00] via-[#d4a520] to-[#f5e6b8] w-[60%] rounded-full shadow-[0_0_10px_rgba(212,165,32,0.5)]" />
                    </div>
                  </div>
                  <button 
                    onClick={() => { uiAudio.playClick(); onStartGame(); }} 
                    className="whitespace-nowrap bg-gradient-to-b from-[#d4a520] to-[#b8860b] text-black text-sm px-8 py-2.5 rounded shadow-[0_4px_15px_rgba(212,165,32,0.3)] font-black hover:scale-105 hover:brightness-110 transition-all active:scale-95"
                  >
                    前往论辩
                  </button>
                </div>
              </div>
              <div className="absolute top-4 right-8 text-[11px] text-[#f5e6b8]/40 italic font-serif flex items-center gap-2">
                <IconLantern size={16} color="#d4a520" /> 结束倒计时：3天 12:45:21
              </div>
            </div>

            {/* Sub-Events List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GoldenCard className="flex items-center justify-between border-l-4 border-l-[#d4a520]">
                <div>
                  <div className="text-[#f5e6b8] text-lg font-serif mb-1 flex items-center gap-2">
                    <IconCalendar size={20} color="#d4a520" /> 日常签到
                  </div>
                  <div className="text-[#a7c5ba] text-xs">每日首胜奖励翻倍，额外获赠 400 铜钱</div>
                </div>
                <button className="text-[#d4a520] text-xs font-serif uppercase tracking-widest bg-[#d4a520]/5 px-5 py-2 rounded border border-[#d4a520]/20 hover:bg-[#d4a520]/20 transition-all">
                  进行中
                </button>
              </GoldenCard>

              <GoldenCard className="flex items-center justify-between opacity-70 group-hover:opacity-100 transition-opacity">
                <div>
                  <div className="text-[#a7c5ba] text-lg font-serif mb-1 line-through decoration-[#d4a520]/40 flex items-center gap-2">
                    <IconGift size={20} color="#a7c5ba" style={{ opacity: 0.6 }} /> 萌新礼包
                  </div>
                  <div className="text-[#a7c5ba]/60 text-xs">恭喜获得初始墨家基础卡组 × 1</div>
                </div>
                <div className="bg-[#50b478]/10 text-[#50b478] text-[10px] px-3 py-1 rounded border border-[#50b478]/20 flex items-center gap-1.5 font-bold">
                  <IconCheck size={12} color="#50b478" /> 已领取
                </div>
              </GoldenCard>
            </div>
            
            <div className="mt-auto pt-6 text-center border-t border-white/5">
              <p className="text-[10px] text-[#a7c5ba]/40 tracking-widest">稷下学宫 · 勤学不倦</p>
            </div>
          </div>
        </FullscreenScreen>
      )}
      {activeModal === 'quests' && (
        <FullscreenScreen
          isOpen={activeModal === 'quests'}
          onClose={() => setActiveModal(null)}
          title="修行任务"
          subtitle="日积月累"
          icon={<MineralIconWrapper type="bronze" size={40}><IconBambooSlips size={28} color="#f5e6b8" /></MineralIconWrapper>}
        >
          <div className="flex h-full flex-col">
            {/* Tabs */}
            <div className="flex gap-4 mb-6">
              <GoldenTab label="今日修行" active={questTab === 'daily'} onClick={() => setQuestTab('daily')} />
              <GoldenTab label="每周课业" active={questTab === 'weekly'} onClick={() => setQuestTab('weekly')} />
              <GoldenTab label="历程成就" active={questTab === 'achieve'} onClick={() => setQuestTab('achieve')} />
            </div>

            {/* List */}
            <div className="flex-1 min-h-0 space-y-4 overflow-y-auto pr-3 custom-scrollbar">
              <div className="flex items-center gap-4 mb-6 px-1">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(212,165,32,0.2)] to-transparent" />
                <div className="text-[10px] text-[#a7c5ba] uppercase tracking-[0.3em] font-serif">
                  {questTab === 'daily' ? '日常任务 · 每日五时更新' : questTab === 'weekly' ? '本周任务 · 周一凌晨更新' : '历史成就 · 记录点滴成长'}
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(212,165,32,0.2)] to-transparent" />
              </div>

              {quests.map((item) => {
                const done = item.progress >= item.target;
                return (
                  <GoldenCard key={item.id} className={`group ${item.claimed ? 'opacity-40 grayscale-[0.5]' : ''}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <MineralIconWrapper type="bronze" size={44}>
                          {item.title.includes('胜利') ? <IconMartial size={24} color="#f5e6b8" /> : item.title.includes('战') ? <IconCrossSwords size={24} color="#f5e6b8" /> : <IconBambooSlips size={24} color="#f5e6b8" />}
                        </MineralIconWrapper>
                        <div className="flex flex-col">
                          <span className="text-[#f5e6b8] text-base font-serif tracking-wide">{item.title}</span>
                          <span className="text-[10px] text-[#a7c5ba] mt-0.5">完成即可获得丰厚学宫奖励</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`font-mono text-sm ${done ? 'text-[#d4a520]' : 'text-[#a7c5ba]/60'}`}>
                          {item.progress} <span className="opacity-30 mx-1">/</span> {item.target}
                        </span>
                      </div>
                    </div>

                    <div className="h-1 w-full bg-black/40 rounded-full mb-5 overflow-hidden border border-white/5">
                      <div
                        className={`h-full bg-gradient-to-r from-[#6b4300] via-[#d4a520] to-[#f5e6b8] transition-all duration-700 ease-out rounded-full shadow-[0_0_8px_rgba(212,165,32,0.3)]`}
                        style={{ width: `${Math.min(100, (item.progress / item.target) * 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-5">
                        {item.rewardCoin > 0 && (
                          <div className="flex items-center gap-1.5 bg-[#d4a520]/5 px-2 py-0.5 rounded-md border border-[#d4a520]/10">
                            <IconKnifeMoney size={14} color="#d4a520" />
                            <span className="text-[11px] text-[#d4a520]/80 font-mono mt-0.5">{item.rewardCoin}</span>
                          </div>
                        )}
                        {item.rewardJade > 0 && (
                          <div className="flex items-center gap-1.5 bg-[#9eb9dd]/5 px-2 py-0.5 rounded-md border border-[#9eb9dd]/10">
                            <IconJadeJue size={14} color="#3A5F41" />
                            <span className="text-[11px] text-[#9eb9dd]/80 font-mono mt-0.5">{item.rewardJade}</span>
                          </div>
                        )}
                      </div>
                      
                      <button
                        disabled={!done || item.claimed}
                        onClick={() => handleClaimQuest(item.id)}
                        className={`text-[11px] font-bold px-6 py-2 rounded-full transition-all tracking-widest ${
                          item.claimed
                            ? 'bg-transparent text-white/10 border border-white/5 cursor-default'
                            : done
                              ? 'bg-gradient-to-b from-[#d4a520] to-[#b8860b] text-black shadow-[0_0_15px_rgba(212,165,32,0.2)] hover:scale-105 active:scale-95'
                              : 'bg-black/40 text-[#a7c5ba]/40 border border-white/5'
                        }`}
                      >
                        {item.claimed ? '已领取' : done ? '领取奖励' : '未完成'}
                      </button>
                    </div>
                  </GoldenCard>
                );
              })}

              <div className="text-center py-8 opacity-20">
                <div className="inline-block px-12 h-px bg-gradient-to-r from-transparent via-[rgba(212,165,32,0.5)] to-transparent mb-2" />
                <div className="text-[10px] text-[#a7c5ba] uppercase tracking-[0.5em] font-serif">万卷诗书 · 勤学不待</div>
              </div>
            </div>
          </div>
        </FullscreenScreen>
      )}
      {activeModal === 'mail' && (
        <FullscreenScreen
          isOpen={activeModal === 'mail'}
          onClose={() => setActiveModal(null)}
          title="百灵鸟传书"
          subtitle="音讯往来"
          icon={<MineralIconWrapper type="bronze" size={40}><IconVanninBird size={34} color="#f5e6b8" /></MineralIconWrapper>}
        >
          <div className="flex h-full flex-col">
            <div className="flex justify-between items-center mb-6">
              <div className="text-[10px] text-[#a7c5ba] uppercase tracking-[0.3em] font-serif bg-black/20 px-4 py-1.5 rounded-full border border-white/5">
                收件箱 · {mails.filter(m => !m.read).length} 封未读
              </div>
              <button
                onClick={() => setMails(prev => prev.map(m => ({ ...m, read: true })))}
                className="text-xs text-[#d4a520] border border-[#d4a520]/20 px-5 py-1.5 rounded-full hover:bg-[#d4a520]/10 transition-all font-serif tracking-widest"
                onMouseEnter={() => uiAudio.playHover()}
              >
                全部阅毕
              </button>
            </div>

            <div className="flex-1 min-h-0 space-y-4 overflow-y-auto pr-3 custom-scrollbar">
              {mails.map((item) => (
                <GoldenCard key={item.id} className={`${item.read ? 'opacity-60' : 'border-l-4 border-l-[#d4a520]'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-black/40 border border-white/5 relative`}>
                        {item.rewardCoin || item.rewardJade ? <IconGift size={28} /> : <IconBambooSlips size={28} />}
                        {!item.read && (
                          <span className="absolute -top-1 -right-1 flex items-center justify-center">
                            <span className="w-2.5 h-2.5 bg-[#8D2F2F] rounded-full shadow-[0_0_8px_rgba(141,47,47,0.6)] animate-pulse border-2 border-[#1a2840]" />
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <h3 className={`text-base font-serif tracking-wide ${item.read ? 'text-[#a7c5ba]' : 'text-[#f5e6b8]'}`}>
                          {item.title}
                        </h3>
                        <span className="text-[10px] text-[#a7c5ba]/50 font-mono mt-0.5 uppercase tracking-tighter">Received: 2026-04-15 14:02</span>
                      </div>
                    </div>
                  </div>

                  <p className={`text-sm leading-relaxed mb-5 ${item.read ? 'text-[#a7c5ba]/60' : 'text-[#a7c5ba]'}`}>
                    {item.content}
                  </p>

                  <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <div className="flex gap-3">
                      {item.rewardCoin > 0 && (
                        <div className="flex items-center gap-2 bg-[#d4a520]/10 px-3 py-1 rounded-md border border-[#d4a520]/20">
                          <IconKnifeMoney size={14} color="#d4a520" />
                          <span className="text-xs text-[#d4a520] font-mono">{item.rewardCoin}</span>
                        </div>
                      )}
                      {item.rewardJade > 0 && (
                        <div className="flex items-center gap-2 bg-[#9eb9dd]/10 px-3 py-1 rounded-md border border-[#9eb9dd]/20">
                          <IconJadeJue size={14} color="#3A5F41" />
                          <span className="text-xs text-[#9eb9dd] font-mono">{item.rewardJade}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-3 items-center">
                      {(item.rewardCoin > 0 || item.rewardJade > 0) && (
                        <button
                          disabled={item.claimed}
                          onClick={() => handleClaimMail(item.id)}
                          className={`text-[11px] font-bold px-6 py-2 rounded transition-all tracking-widest ${
                            item.claimed
                              ? 'text-white/10 cursor-default'
                              : 'bg-white/5 text-[#d4a520] border border-[#d4a520]/30 hover:bg-[#d4a520] hover:text-black active:scale-95'
                          }`}
                        >
                          {item.claimed ? '已领取' : '领取附件'}
                        </button>
                      )}
                      <button
                        className="text-xs text-[#a7c5ba]/40 hover:text-red-400/60 transition-colors px-2 py-2"
                        onMouseEnter={() => uiAudio.playHover()}
                      >
                        焚毁
                      </button>
                    </div>
                  </div>
                </GoldenCard>
              ))}
            </div>
            
            <div className="mt-auto py-4 text-center opacity-10">
              <span className="text-[10px] font-serif tracking-[1em]">百灵传音 · 莫失莫忘</span>
            </div>
          </div>
        </FullscreenScreen>
      )}
      {activeModal === 'community' && (
        <CommunityScreen
          isOpen={activeModal === 'community'}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'settings' && (
        <SystemModal title="机枢设置" onClose={() => setActiveModal(null)}>
          <SettingsPanel settings={settings} onSettingsChange={onSettingsChange} />
        </SystemModal>
      )}
    </div>
  );
}
