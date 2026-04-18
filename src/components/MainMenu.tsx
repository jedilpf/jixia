import { useState, useEffect, useMemo, ReactNode } from 'react';
import { uiAudio } from '@/utils/audioManager';
import { CommunityBadge } from '@/components/community/CommunityBadge';
import { CommunityScreen } from '@/components/community/CommunityScreen';
import { AvatarBackend } from '@/data/game/avatarRegistry';

// ─── 统一 UI 辅助组件 ─────────────────────────────────────────────────────────

function GoldenCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-[rgba(212,165,32,0.2)] bg-black/30 p-4 transition-all hover:border-[rgba(212,165,32,0.4)] ${className}`}>
      {children}
    </div>
  );
}

function GoldenTab({ label, active, onClick, badge }: { label: string; active: boolean; onClick: () => void; badge?: boolean }) {
  return (
    <button
      onClick={() => { uiAudio.playClick(); onClick(); }}
      className={`relative px-6 py-2 text-sm font-serif tracking-widest transition-all border-b-2 ${
        active 
          ? 'text-[#d4a520] border-[#d4a520] bg-[#d4a520]/5' 
          : 'text-[#a7c5ba] border-transparent hover:text-[#f5e6b8] hover:bg-white/5'
      }`}
    >
      {label}
      {badge && <span className="absolute top-1 right-2 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />}
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
    <div className="absolute inset-0 z-[9999] flex items-center justify-center p-8 bg-black/70 backdrop-blur-md pointer-events-auto" style={{ animation: 'modal-fade-in 0.2s ease-out' }}>
      <div className="bg-[#10192e] border-2 border-[rgba(212,165,32,0.6)] rounded-xl w-full max-w-2xl shadow-[0_0_40px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden" style={{ animation: 'modal-scale-up 0.3s cubic-bezier(0.175,0.885,0.32,1.275)' }}>
        {/* Header */}
        <div className="h-14 bg-gradient-to-r from-[#1a2840] via-[#2a3c66] to-[#1a2840] border-b border-[rgba(212,165,32,0.3)] flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="w-0.5 h-5 bg-[#d4a520] rounded-full" />
            <span className="text-[#f5e6b8] font-serif text-xl tracking-widest">{title}</span>
          </div>
          <button onClick={() => { uiAudio.playClick(); onClose(); }} className="w-8 h-8 rounded-full bg-black/30 hover:bg-[#d4a520]/20 text-[#a7c5ba] hover:text-[#f5e6b8] text-xl transition-all flex items-center justify-center border border-[rgba(212,165,32,0.2)]"
            onMouseEnter={() => uiAudio.playHover()}>×</button>
        </div>
        {/* Content */}
        <div className="p-8 min-h-[300px] flex items-center justify-center text-[#a7c5ba] text-lg">
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
  label: string; icon: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <span className="text-[#f5e6b8] font-serif tracking-wide text-sm">{label}</span>
        </div>
        <span className="text-[#d4a520] text-xs font-mono tabular-nums w-8 text-right">{Math.round(pct)}%</span>
      </div>
      <div className="relative h-5 flex items-center">
        {/* Track */}
        <div className="w-full h-1.5 bg-black/60 rounded-full border border-[rgba(139,115,85,0.25)] overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, #6b4300, #d4a520 70%, #fef3c7)',
              boxShadow: '0 0 6px rgba(212,165,32,0.4)',
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
          className="absolute w-4 h-4 rounded-full border-2 border-[#d4a520] bg-[#10192e] shadow-[0_0_8px_rgba(212,165,32,0.8)] pointer-events-none"
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
  return (
    <div className="w-full max-w-sm space-y-8">
      {/* 声音 */}
      <div className="space-y-5">
        <p className="text-[#d4a520] font-serif tracking-widest text-xs border-b border-[rgba(212,165,32,0.2)] pb-2 flex items-center gap-2">
          <span>◆</span> 声音设置
        </p>
        <GoldenSlider icon="🔊" label="总音量" value={settings.masterVolume} onChange={v => onSettingsChange({ masterVolume: v })} />
        <GoldenSlider icon="🎵" label="背景音乐" value={settings.bgmVolume} onChange={v => onSettingsChange({ bgmVolume: v })} />
        <GoldenSlider icon="🔔" label="操作音效" value={settings.sfxVolume} onChange={v => onSettingsChange({ sfxVolume: v })} />
      </div>

      {/* 画面 */}
      <div className="space-y-5">
        <p className="text-[#d4a520] font-serif tracking-widest text-xs border-b border-[rgba(212,165,32,0.2)] pb-2 flex items-center gap-2">
          <span>◆</span> 画面设置
        </p>
        <GoldenSlider icon="☀️" label="屏幕亮度" value={settings.brightness} min={0.3} max={1} onChange={v => onSettingsChange({ brightness: v })} />

        {/* 全屏开关 */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-base">🖥️</span>
            <span className="text-[#f5e6b8] font-serif tracking-wide text-sm">全屏模式</span>
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

  if (typeof window === 'undefined') {
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
  const initialState = useMemo(() => loadMainMenuState(), []);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  // TODO: profileTab 用于未来个人面板标签切换
  const [_profileTab, _setProfileTab] = useState<ProfileTab>('overview');
  const [coinBalance, setCoinBalance] = useState(initialState.coinBalance);
  const [jadeBalance, setJadeBalance] = useState(initialState.jadeBalance);
  const [events, setEvents] = useState<EventItem[]>(initialState.events);
  const [quests, setQuests] = useState<QuestItem[]>(initialState.quests);
  const [questTab, setQuestTab] = useState<'daily' | 'weekly' | 'achieve'>('daily');
  const [mails, setMails] = useState<MailItem[]>(initialState.mails);
  const embers = Array.from({ length: 18 }, (_, i) => i);
  const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;

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

  // TODO: handleJoinEvent 和 handleClaimEvent 用于未来活动功能，暂时保留
  void function _handleJoinEvent(_id: string) {
    uiAudio.playClick();
    setEvents((prev) => prev.map((item) => (item.id === _id ? { ...item, joined: true } : item)));
  };

  void function _handleClaimEvent(_id: string) {
    const item = events.find((event) => event.id === _id);
    if (!item || item.claimed) return;
    uiAudio.playClick();
    claimRewards(item.rewardCoin, item.rewardJade);
    setEvents((prev) => prev.map((event) => (event.id === _id ? { ...event, claimed: true } : event)));
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
      {/* 背景图 */}
      <div className="absolute inset-0" style={{ backgroundImage: `url(${asset('assets/bg-main.png')})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(13,11,7,0.35) 0%, rgba(26,18,8,0.28) 40%, rgba(15,26,21,0.32) 100%)' }} />

      {/* 全局动画样式 */}
      <style>{`
        @keyframes ember-rise { 0% { transform: translateY(0) scale(1); opacity: 0.9; } 100% { transform: translateY(-100vh) scale(0); opacity: 0; } }
        .animate-ember { animation: ember-rise linear infinite; }
        @keyframes forge-pulse { 0%,100% { opacity:0.15; transform: scale(1); } 50% { opacity: 0.35; transform: scale(1.08); } }
        @keyframes title-glow { 0%,100% { text-shadow: 0 0 20px rgba(184,134,11,0.6), 0 0 40px rgba(184,134,11,0.3); } 50% { text-shadow: 0 0 40px rgba(255,180,30,0.9), 0 0 80px rgba(255,140,0,0.5); } }
        @keyframes title-brush { 0%,100% { filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.8)) drop-shadow(0 0 15px rgba(212,165,32,0.4)); } 50% { filter: drop-shadow(3px 6px 10px rgba(0,0,0,0.9)) drop-shadow(0 0 25px rgba(255,180,50,0.6)); } }
        @keyframes ink-spread { 0% { opacity: 0; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes seal-appear { 0% { opacity: 0; transform: rotate(-15deg) scale(0.5); } 100% { opacity: 1; transform: rotate(-8deg) scale(1); } }
        @keyframes border-glow { 0%,100% { box-shadow: 0 0 10px rgba(255,120,0,0.3); } 50% { box-shadow: 0 0 25px rgba(255,150,0,0.6); } }
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

      {/* 炉火光晕背景 */}
      <div className="absolute inset-0 pointer-events-none" style={{ animation: 'forge-pulse 3s ease-in-out infinite' }}>
        <div style={{ position: 'absolute', bottom: '-10%', left: '50%', transform: 'translateX(-50%)', width: '60%', height: '50%', background: 'radial-gradient(ellipse at bottom, rgba(232,93,4,0.25) 0%, transparent 70%)' }} />
      </div>
      <div className="absolute inset-x-0 top-0 h-32 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(74,124,111,0.15) 0%, transparent 100%)' }} />

      {/* 齿轮 */}
      <Gear size={180} x="-40px" y="10%" speed={12} opacity={0.15} />
      <Gear size={120} x="8%" y="55%" speed={-18} opacity={0.12} />
      <Gear size={240} x="75%" y="-5%" speed={8} opacity={0.1} />
      <Gear size={100} x="85%" y="60%" speed={-22} opacity={0.13} />
      <Gear size={60} x="60%" y="75%" speed={30} opacity={0.1} />

      {/* 火星 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {embers.map(i => <EmberParticle key={i} />)}
      </div>

      {/* 顶部导航 */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20 pointer-events-none">
        <div className="flex gap-8 pointer-events-auto">
          <div onClick={() => { uiAudio.playClick(); setActiveModal('profile'); }} className="flex items-center gap-3 bg-black/40 backdrop-blur-sm p-2 pr-6 rounded-full border border-[rgba(212,165,32,0.3)] cursor-pointer hover:bg-black/60 transition-colors group">
            <div className="w-14 h-14 rounded-full border-2 border-[rgba(212,165,32,0.8)] overflow-hidden shadow-[0_0_10px_rgba(212,165,32,0.3)] group-hover:shadow-[0_0_15px_rgba(212,165,32,0.6)] transition-shadow">
              <div className="w-full h-full bg-gradient-to-br from-[#c0520a] to-[#2a3a32]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[#f5e6b8] font-serif text-lg tracking-wider">机枢学徒</span>
              <span className="text-[#a7c5ba] text-xs mt-0.5">Lv. 12 墨家门徒</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-black/40 backdrop-blur-sm h-11 pl-4 pr-1 rounded-full border border-[rgba(139,115,85,0.4)]">
              <span className="text-2xl mr-2">🪙</span>
              <span className="text-[#fef3c7] font-serif tracking-widest text-lg">{coinBalance.toLocaleString()}</span>
              <button onMouseEnter={() => uiAudio.playHover()} onClick={() => { uiAudio.playClick(); setActiveModal('store_coin'); }} className="ml-4 w-8 h-8 rounded-full bg-gradient-to-b from-[#b8860b] to-[#8B5e00] text-white flex items-center justify-center hover:brightness-125 transition-all border border-[#d4a520]">+</button>
            </div>
            <div className="flex items-center bg-black/40 backdrop-blur-sm h-11 pl-4 pr-1 rounded-full border border-[rgba(74,124,111,0.4)]">
              <span className="text-2xl mr-2">💠</span>
              <span className="text-[#a7c5ba] font-serif tracking-widest text-lg">{jadeBalance.toLocaleString()}</span>
              <button onMouseEnter={() => uiAudio.playHover()} onClick={() => { uiAudio.playClick(); setActiveModal('store_jade'); }} className="ml-4 w-8 h-8 rounded-full bg-gradient-to-b from-[#2a3c66] to-[#1a2840] text-white flex items-center justify-center hover:brightness-125 transition-all border border-[#4a6b99]">+</button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-5 pointer-events-auto mt-2">
          <button onMouseEnter={() => uiAudio.playHover()} onClick={() => { uiAudio.playClick(); setActiveModal('events'); }} className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm border border-[rgba(212,165,32,0.3)] text-[#d4a520] hover:text-[#f5e6b8] hover:bg-black/60 hover:scale-105 transition-all flex items-center justify-center text-2xl relative">
            {hasEventNotice ? <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#f97316] border-2 border-black rounded-full animate-pulse" /> : null}
            🎪
          </button>
          <button onMouseEnter={() => uiAudio.playHover()} onClick={() => { uiAudio.playClick(); setActiveModal('quests'); }} className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm border border-[rgba(212,165,32,0.3)] text-[#d4a520] hover:text-[#f5e6b8] hover:bg-black/60 hover:scale-105 transition-all flex items-center justify-center text-2xl relative">
            {hasQuestNotice ? <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#22c55e] border-2 border-black rounded-full animate-pulse" /> : null}
            📜
          </button>
          <button onMouseEnter={() => uiAudio.playHover()} onClick={handleOpenMail} className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm border border-[rgba(212,165,32,0.3)] text-[#d4a520] hover:text-[#f5e6b8] hover:bg-black/60 hover:scale-105 transition-all flex items-center justify-center text-2xl relative">
            ✉️
            {hasMailNotice ? <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-black rounded-full animate-pulse" /> : null}
          </button>
          <button
            onMouseEnter={() => uiAudio.playHover()}
            onClick={() => { uiAudio.playClick(); setActiveModal('community'); }}
            className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm border border-[rgba(212,165,32,0.3)] text-[#d4a520] hover:text-[#f5e6b8] hover:bg-black/60 hover:scale-105 transition-all flex items-center justify-center text-base font-serif tracking-widest relative"
            aria-label="打开社区"
            title="社区"
          >
            社
            <CommunityBadge />
          </button>
          <div className="w-px h-8 bg-[rgba(212,165,32,0.3)] mx-1" />
          <button onMouseEnter={() => uiAudio.playHover()} onClick={() => { uiAudio.playClick(); setActiveModal('settings'); }} className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm border border-[rgba(212,165,32,0.3)] text-[#d4a520] hover:text-[#f5e6b8] hover:bg-black/60 hover:scale-105 transition-all flex items-center justify-center text-2xl">⚙️</button>
        </div>
      </div>

      {/* 主内容 */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-8">
        <div className="mb-4 text-center">
          <div style={{ color: 'rgba(74,124,111,0.8)', fontSize: '13px', letterSpacing: '8px', fontFamily: 'serif' }}>◆ 诸子百家 · 论道争锋 ◆</div>
        </div>
        <div className="mb-2 text-center relative">
          {/* 印章装饰 */}
          <div
            className="absolute -right-8 top-0"
            style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, rgba(176,83,39,0.85), rgba(139,90,43,0.7))',
              border: '2px solid rgba(212,165,32,0.8)',
              borderRadius: '4px',
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.4), 0 0 15px rgba(176,83,39,0.5)',
              animation: 'seal-appear 1s ease-out 0.5s both',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'rotate(-8deg)',
            }}
          >
            <span style={{ color: '#d4a520', fontSize: '20px', fontFamily: 'serif', fontWeight: 900, writingMode: 'vertical-rl' }}>筹</span>
          </div>

          {/* 墨迹底纹 */}
          <div
            className="absolute -left-4 -top-6"
            style={{
              width: '120px',
              height: '80px',
              background: 'radial-gradient(ellipse at 30% 40%, rgba(20,15,10,0.6) 0%, transparent 70%)',
              animation: 'ink-spread 1.2s ease-out both',
              filter: 'blur(1px)',
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
                filter: 'drop-shadow(2px 4px 8px rgba(0,0,0,0.7)) drop-shadow(0 0 20px rgba(212,165,32,0.4))',
              }}
              onError={(e) => {
                // 图片加载失败时显示文字
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

        <div className="flex flex-col gap-3 w-72">
          <button onClick={() => { uiAudio.playClick(); onStartGame(); }} onMouseEnter={() => uiAudio.playHover()}
            className="btn-ripple relative transition-all duration-200 flex items-center justify-center outline-none focus:outline-none hover:opacity-90"
            style={{ width: '100%', background: 'transparent', border: 'none', padding: 0 }}>
            <img src={asset('assets/btn-start.png')} alt="开始辩斗" style={{ width: '100%', height: 'auto', display: 'block', pointerEvents: 'none' }}
              onError={(e) => { e.currentTarget.style.display = 'none'; if (e.currentTarget.nextElementSibling) (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block'; }} />
            <div style={{ display: 'none', width: '100%', padding: '16px 32px', background: 'linear-gradient(180deg, #8B4513 0%, #5D3A1A 100%)', border: '2px solid #D4A520', borderRadius: '8px', pointerEvents: 'auto' }}
              onClick={(e) => { e.stopPropagation(); uiAudio.playClick(); onStartGame(); }}>
              <span style={{ color: '#fef3c7', fontSize: '20px', fontWeight: 600, fontFamily: 'serif', letterSpacing: '4px' }}>开始辩斗</span>
            </div>
          </button>

          <button onClick={() => { console.log('Story button clicked'); uiAudio.playClick(); if (onStory) { console.log('Calling onStory'); onStory(); } else { console.log('onStory is undefined'); } }} onMouseEnter={() => uiAudio.playHover()}
            className="btn-ripple relative transition-all duration-200 flex items-center justify-center outline-none focus:outline-none hover:opacity-90"
            style={{ width: '100%', background: 'transparent', border: 'none', padding: 0 }}>
            <img src={asset('assets/btn-story.png')} alt="争鸣史" style={{ width: '100%', height: 'auto', display: 'block', pointerEvents: 'none' }}
              onError={(e) => { e.currentTarget.style.display = 'none'; if (e.currentTarget.nextElementSibling) (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex'; }} />
            <div style={{ display: 'none', width: '100%', padding: '14px 32px', background: 'linear-gradient(180deg, #2f1f3f 0%, #1f2a4d 100%)', border: '2px solid #8B7355', borderRadius: '8px', pointerEvents: 'auto' }}
              onClick={(e) => { e.stopPropagation(); uiAudio.playClick(); if (onStory) onStory(); }}>
              <span style={{ color: '#d8c7f3', fontSize: '18px', fontWeight: 600, fontFamily: 'serif', letterSpacing: '4px' }}>争鸣史</span>
            </div>
          </button>

          <button onClick={() => { uiAudio.playClick(); onCharacters(); }} onMouseEnter={() => uiAudio.playHover()}
            className="btn-ripple relative transition-all duration-200 flex items-center justify-center outline-none focus:outline-none hover:opacity-90"
            style={{ width: '100%', background: 'transparent', border: 'none', padding: 0 }}>
            <img src={asset('assets/btn-characters.png')} alt="问道百家人物志" style={{ width: '100%', height: 'auto', display: 'block', pointerEvents: 'none' }}
              onError={(e) => { e.currentTarget.style.display = 'none'; if (e.currentTarget.nextElementSibling) (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block'; }} />
            <div style={{ display: 'none', width: '100%', padding: '14px 32px', background: 'linear-gradient(180deg, #10192e 0%, #172440 100%)', border: '2px solid #8B7355', borderRadius: '8px', pointerEvents: 'auto' }}
              onClick={(e) => { e.stopPropagation(); uiAudio.playClick(); onCharacters(); }}>
              <span style={{ color: '#a0bddc', fontSize: '18px', fontWeight: 600, fontFamily: 'serif', letterSpacing: '4px' }}>问道百家人物志</span>
            </div>
          </button>

          <button onClick={() => { uiAudio.playClick(); onCollection(); }} onMouseEnter={() => uiAudio.playHover()}
            className="btn-ripple relative transition-all duration-200 flex items-center justify-center outline-none focus:outline-none hover:opacity-90"
            style={{ width: '100%', background: 'transparent', border: 'none', padding: 0 }}>
            <img src={asset('assets/btn-collection.png')} alt="卡牌图鉴" style={{ width: '100%', height: 'auto', display: 'block', pointerEvents: 'none' }}
              onError={(e) => { e.currentTarget.style.display = 'none'; if (e.currentTarget.nextElementSibling) (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block'; }} />
            <div style={{ display: 'none', width: '100%', padding: '14px 32px', background: 'linear-gradient(180deg, #1a2820 0%, #243530 100%)', border: '2px solid #8B7355', borderRadius: '8px', pointerEvents: 'auto' }}
              onClick={(e) => { e.stopPropagation(); uiAudio.playClick(); onCollection(); }}>
              <span style={{ color: '#a7c5ba', fontSize: '18px', fontWeight: 600, fontFamily: 'serif', letterSpacing: '4px' }}>卡牌图鉴</span>
            </div>
          </button>
        </div>

        <div className="absolute bottom-6 w-full flex items-center justify-between px-8 pointer-events-none">
          <div style={{ color: 'rgba(212,197,169,0.3)', fontSize: '11px', letterSpacing: '1px' }}>v1.0.0 Alpha</div>
          <div style={{ color: 'rgba(212,197,169,0.3)', fontSize: '11px', letterSpacing: '2px' }}>© 2026 ASKING THE TAO ALL RIGHTS RESERVED.</div>
        </div>
      </div>

      {/* ★ 弹窗渲染区 */}
      {activeModal === 'profile' && (
        <SystemModal title="玩家档案" onClose={() => setActiveModal(null)}>
          <div className="w-full space-y-6">
            {/* Header Info */}
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-lg border-2 border-[#d4a520] overflow-hidden shadow-[0_0_20px_rgba(212,165,32,0.3)] bg-black/40">
                  <img 
                    src={AvatarBackend.getSelectedInfo()?.assetPath} 
                    alt="头像" 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-[#d4a520] text-black text-[10px] px-2 py-0.5 rounded font-bold shadow-lg">
                  LV.12
                </div>
              </div>
              
              <div className="flex flex-col">
                <h2 className="text-[#f5e6b8] text-2xl font-serif tracking-widest mb-1">机枢学徒</h2>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-[#a7c5ba]">墨家门徒</span>
                  <div className="w-1 h-1 rounded-full bg-[#d4a520]/40" />
                  <span className="text-[#d4a520]">段位：青铜 Ⅲ</span>
                </div>
              </div>
            </div>

            {/* Currency Bar */}
            <div className="w-full py-3 border-y border-[rgba(212,165,32,0.15)] flex justify-around text-base">
              <div className="flex items-center gap-2">
                <span className="text-xl">🪙</span>
                <span className="text-[#a7c5ba]">铜钱：</span>
                <span className="text-[#f5e6b8] font-mono">{coinBalance.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">💠</span>
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
            <div className="space-y-3">
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
        <SystemModal title="活动中心" onClose={() => setActiveModal(null)}>
          <div className="w-full space-y-4">
            {/* Banner Item */}
            <div className="relative rounded-lg overflow-hidden border border-[#d4a520]/40 group">
              <div className="h-28 bg-[#1a2840] flex flex-col justify-center px-6 relative z-10">
                <div className="text-[#f5e6b8] text-lg font-serif mb-1 group-hover:text-white transition-colors">🔥 限时活动：稷下开学季</div>
                <div className="text-[#a7c5ba] text-xs">完成 5 场论道即可获得限定卡牌</div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex-1 max-w-[200px]">
                    <div className="flex justify-between text-[10px] text-[#a7c5ba] mb-1">
                      <span>活动进度</span>
                      <span>60%</span>
                    </div>
                    <div className="h-1.5 w-full bg-black/40 rounded-full">
                      <div className="h-full bg-[#d4a520] w-[60%]" />
                    </div>
                  </div>
                  <button onClick={() => uiAudio.playClick()} className="bg-[#d4a520] text-black text-[10px] px-4 py-1.5 rounded font-bold hover:brightness-110 active:scale-95 transition-all">
                    立即参与
                  </button>
                </div>
              </div>
              <div className="absolute top-2 right-4 text-[10px] text-[#d4a520]/60 italic font-mono">剩余：3天12小时</div>
            </div>

            {/* Daily/Other events */}
            <div className="grid grid-cols-1 gap-3">
              <GoldenCard className="flex items-center justify-between">
                <div>
                  <div className="text-[#f5e6b8] text-sm font-serif">📅 日常活动</div>
                  <div className="text-[#a7c5ba] text-xs">每日首胜额外奖励 +200 铜钱</div>
                </div>
                <button className="text-[#d4a520] text-xs border border-[#d4a520]/30 px-3 py-1 rounded hover:bg-[#d4a520]/10 transition-colors">查看详情</button>
              </GoldenCard>

              <GoldenCard className="flex items-center justify-between opacity-80">
                <div>
                  <div className="text-[#f5e6b8] text-sm font-serif">🎁 新手福利</div>
                  <div className="text-[#a7c5ba] text-xs">完成新手引导即可获得 1000 铜钱</div>
                </div>
                <div className="text-[#50b478] text-xs font-serif flex items-center gap-1">
                  <span>✅</span> 已完成
                </div>
              </GoldenCard>
            </div>
          </div>
        </SystemModal>
      )}
      {activeModal === 'quests' && (
        <SystemModal title="修行任务" onClose={() => setActiveModal(null)}>
          <div className="w-full flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-white/10 mb-6">
              <GoldenTab label="日常" active={questTab === 'daily'} onClick={() => setQuestTab('daily')} />
              <GoldenTab label="周常" active={questTab === 'weekly'} onClick={() => setQuestTab('weekly')} />
              <GoldenTab label="成就" active={questTab === 'achieve'} onClick={() => setQuestTab('achieve')} />
            </div>

            {/* List */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <div className="text-[10px] text-[#a7c5ba] uppercase tracking-widest mb-2 px-1">◆ {questTab === 'daily' ? '日常任务 (每日刷新)' : questTab === 'weekly' ? '本周任务' : '历史成就'}</div>
              
              {quests.map((item) => {
                const done = item.progress >= item.target;
                return (
                  <GoldenCard key={item.id} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{item.title.includes('胜利') ? '🏆' : item.title.includes('战') ? '⚔️' : '📚'}</span>
                        <span className="text-[#f5e6b8] text-sm font-serif">{item.title}</span>
                      </div>
                      <span className="text-xs text-[#d4a520] font-mono">{item.progress}/{item.target}</span>
                    </div>

                    <div className="h-1.5 w-full bg-black/40 rounded-full mb-4">
                      <div 
                        className="h-full bg-gradient-to-r from-[#8b5e00] to-[#d4a520] transition-all duration-500"
                        style={{ width: `${Math.min(100, (item.progress / item.target) * 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-3">
                        {item.rewardCoin > 0 && <span className="text-[10px] text-[#bda77f] flex items-center gap-1">🪙 {item.rewardCoin}</span>}
                        {item.rewardJade > 0 && <span className="text-[10px] text-[#9eb9dd] flex items-center gap-1">💠 {item.rewardJade}</span>}
                      </div>
                      <button
                        disabled={!done || item.claimed}
                        onClick={() => handleClaimQuest(item.id)}
                        className={`text-[10px] px-4 py-1 rounded transition-all ${
                          item.claimed 
                            ? 'bg-white/5 text-white/20 border border-white/5 cursor-default' 
                            : done 
                              ? 'bg-[#d4a520] text-black font-bold animate-pulse' 
                              : 'border border-[rgba(212,165,32,0.3)] text-[#a7c5ba] hover:border-[rgba(212,165,32,0.6)]'
                        }`}
                      >
                        {item.claimed ? '已领取' : done ? '领取奖励' : '未完成'}
                      </button>
                    </div>
                  </GoldenCard>
                );
              })}
              
              <div className="text-center pt-4 opacity-40 text-[10px] text-[#a7c5ba]">
                下次刷新：18小时32分钟
              </div>
            </div>
          </div>
        </SystemModal>
      )}
      {activeModal === 'mail' && (
        <SystemModal title="百灵鸟传书" onClose={() => setActiveModal(null)}>
          <div className="w-full flex flex-col">
            <div className="flex justify-end mb-4">
              <button 
                onClick={() => setMails(prev => prev.map(m => ({ ...m, read: true })))}
                className="text-[10px] text-[#d4a520] border border-[#d4a520]/30 px-3 py-1 rounded hover:bg-[#d4a520]/10"
              >
                全部已读
              </button>
            </div>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {mails.map((item) => (
                <GoldenCard key={item.id} className={`${item.read ? 'opacity-70' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{item.rewardCoin || item.rewardJade ? '🎁' : '📢'}</span>
                      <h3 className="text-[#f5e6b8] text-sm font-serif">{item.title}</h3>
                      {!item.read && <span className="w-1.5 h-1.5 bg-red-500 rounded-full" title="未读" />}
                    </div>
                    <span className="text-[10px] text-[#a7c5ba] font-mono">2026-04-15</span>
                  </div>
                  
                  <p className="text-xs text-[#a7c5ba] mb-4 line-clamp-2">{item.content}</p>
                  
                  <div className="flex items-center justify-between border-t border-white/5 pt-3">
                    <div className="flex gap-2">
                      {item.rewardCoin > 0 && <span className="text-[10px] text-[#d4a520]">🪙 {item.rewardCoin}</span>}
                      {item.rewardJade > 0 && <span className="text-[10px] text-[#9eb9dd]">💠 {item.rewardJade}</span>}
                    </div>
                    <div className="flex gap-2">
                      {(item.rewardCoin > 0 || item.rewardJade > 0) && (
                        <button
                          disabled={item.claimed}
                          onClick={() => handleClaimMail(item.id)}
                          className={`text-[10px] px-3 py-1 rounded transition-all ${
                            item.claimed 
                              ? 'text-white/20' 
                              : 'bg-[#d4a520]/20 text-[#d4a520] hover:bg-[#d4a520] hover:text-black'
                          }`}
                        >
                          {item.claimed ? '已领取' : '领取附件'}
                        </button>
                      )}
                      <button className="text-[10px] text-[#a7c5ba] hover:text-white transition-colors px-2">删除</button>
                    </div>
                  </div>
                </GoldenCard>
              ))}
            </div>
          </div>
        </SystemModal>
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
