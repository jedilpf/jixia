import { useState, useEffect, useMemo, ReactNode } from 'react';
import { uiAudio } from '@/utils/audioManager';

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
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [profileTab, setProfileTab] = useState<ProfileTab>('overview');
  const [coinBalance, setCoinBalance] = useState(initialState.coinBalance);
  const [jadeBalance, setJadeBalance] = useState(initialState.jadeBalance);
  const [events, setEvents] = useState<EventItem[]>(initialState.events);
  const [quests, setQuests] = useState<QuestItem[]>(initialState.quests);
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

  const handleJoinEvent = (id: string) => {
    uiAudio.playClick();
    setEvents((prev) => prev.map((item) => (item.id === id ? { ...item, joined: true } : item)));
  };

  const handleClaimEvent = (id: string) => {
    const item = events.find((event) => event.id === id);
    if (!item || item.claimed) return;
    uiAudio.playClick();
    claimRewards(item.rewardCoin, item.rewardJade);
    setEvents((prev) => prev.map((event) => (event.id === id ? { ...event, claimed: true } : event)));
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
        @keyframes border-glow { 0%,100% { box-shadow: 0 0 10px rgba(255,120,0,0.3); } 50% { box-shadow: 0 0 25px rgba(255,150,0,0.6); } }
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
          <h1 style={{ fontSize: 'clamp(56px, 10vw, 96px)', fontWeight: 900, fontFamily: 'serif', background: 'linear-gradient(180deg, #f5e6b8 0%, #d4a520 40%, #8B5e00 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'title-glow 2.5s ease-in-out infinite', letterSpacing: '16px', lineHeight: 1.1 }}>
            谋天下：问道百家
          </h1>
          <div className="flex items-center justify-center gap-3 mt-2">
            <div style={{ height: '1px', width: '60px', background: 'linear-gradient(90deg, transparent, rgba(212,165,32,0.6))' }} />
            <div style={{ color: 'rgba(212,197,169,0.7)', fontSize: '13px', letterSpacing: '4px' }}>ASKING THE TAO</div>
            <div style={{ height: '1px', width: '60px', background: 'linear-gradient(90deg, rgba(212,165,32,0.6), transparent)' }} />
          </div>
        </div>
        <div className="mb-12" style={{ color: 'rgba(212,197,169,0.55)', fontSize: '14px', letterSpacing: '3px', fontFamily: 'serif' }}>青铜机关城 · 卡牌对战</div>

        <div className="flex flex-col gap-2 w-72">
          <button onClick={() => { uiAudio.playClick(); onStartGame(); }} onMouseEnter={() => { uiAudio.playHover(); setHoveredBtn('start'); }} onMouseLeave={() => setHoveredBtn(null)}
            className="mb-1 relative transition-all duration-300 ease-out flex items-center justify-center outline-none focus:outline-none"
            style={{ width: '100%', background: 'transparent', border: 'none', padding: 0, transform: hoveredBtn === 'start' ? 'scale(1.06)' : 'scale(1)', filter: hoveredBtn === 'start' ? 'drop-shadow(0 0 15px rgba(255, 170, 0, 0.6)) brightness(1.1)' : 'drop-shadow(0 5px 10px rgba(0, 0, 0, 0.4)) brightness(1)' }}>
            <img src={asset('assets/btn-start.png')} alt="开始辩斗" style={{ width: '100%', height: 'auto', display: 'block', pointerEvents: 'none' }}
              onError={(e) => { e.currentTarget.style.display = 'none'; if (e.currentTarget.nextElementSibling) (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block'; }} />
            <div style={{ display: 'none', width: '100%', padding: '14px 32px', background: 'linear-gradient(135deg, #7a3508 0%, #b8470a 50%, #7a3508 100%)', border: '1px solid rgba(232,93,4,0.6)', borderRadius: '8px', animation: 'border-glow 2s ease-in-out infinite' }}>
              <span style={{ color: '#fef3c7', fontSize: '22px', fontWeight: 700, fontFamily: 'serif', letterSpacing: '6px' }}>⚔ 开始辩斗</span>
            </div>
          </button>

          <button onClick={() => { uiAudio.playClick(); if (onStory) onStory(); }} onMouseEnter={() => { uiAudio.playHover(); setHoveredBtn('story'); }} onMouseLeave={() => setHoveredBtn(null)}
            className="mb-1 relative transition-all duration-300 ease-out flex items-center justify-center outline-none focus:outline-none"
            style={{ width: '100%', background: 'transparent', border: 'none', padding: 0, transform: hoveredBtn === 'story' ? 'scale(1.06)' : 'scale(1)', filter: hoveredBtn === 'story' ? 'drop-shadow(0 0 15px rgba(255, 170, 0, 0.6)) brightness(1.1)' : 'drop-shadow(0 5px 10px rgba(0, 0, 0, 0.4)) brightness(1)' }}>
            <img src={asset('assets/btn-story.png')} alt="争鸣史" style={{ width: '100%', height: 'auto', display: 'block', pointerEvents: 'none' }}
              onError={(e) => { e.currentTarget.style.display = 'none'; if (e.currentTarget.nextElementSibling) (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block'; }} />
            <div style={{ display: 'none', width: '100%', padding: '12px 32px', background: 'linear-gradient(135deg, #2f1f3f 0%, #1f2a4d 100%)', border: '1px solid rgba(138,114,180,0.55)', borderRadius: '8px' }}>
              <span style={{ color: '#d8c7f3', fontSize: '18px', fontWeight: 600, fontFamily: 'serif', letterSpacing: '4px' }}>📚 争鸣史</span>
            </div>
          </button>

          <button onClick={() => { uiAudio.playClick(); onCharacters(); }} onMouseEnter={() => { uiAudio.playHover(); setHoveredBtn('characters'); }} onMouseLeave={() => setHoveredBtn(null)}
            className="mb-1 relative transition-all duration-300 ease-out flex items-center justify-center outline-none focus:outline-none"
            style={{ width: '100%', background: 'transparent', border: 'none', padding: 0, transform: hoveredBtn === 'characters' ? 'scale(1.06)' : 'scale(1)', filter: hoveredBtn === 'characters' ? 'drop-shadow(0 0 15px rgba(255, 170, 0, 0.6)) brightness(1.1)' : 'drop-shadow(0 5px 10px rgba(0, 0, 0, 0.4)) brightness(1)' }}>
            <img src={asset('assets/btn-characters.png')} alt="问道百家人物志" style={{ width: '100%', height: 'auto', display: 'block', pointerEvents: 'none' }}
              onError={(e) => { e.currentTarget.style.display = 'none'; if (e.currentTarget.nextElementSibling) (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block'; }} />
            <div style={{ display: 'none', width: '100%', padding: '12px 32px', background: 'linear-gradient(135deg, #10192e 0%, #172440 100%)', border: '1px solid rgba(80,120,200,0.5)', borderRadius: '8px' }}>
              <span style={{ color: '#a0bddc', fontSize: '18px', fontWeight: 600, fontFamily: 'serif', letterSpacing: '4px' }}>📜 问道百家人物志</span>
            </div>
          </button>

          <button onClick={() => { uiAudio.playClick(); onCollection(); }} onMouseEnter={() => { uiAudio.playHover(); setHoveredBtn('collection'); }} onMouseLeave={() => setHoveredBtn(null)}
            className="mb-1 relative transition-all duration-300 ease-out flex items-center justify-center outline-none focus:outline-none"
            style={{ width: '100%', background: 'transparent', border: 'none', padding: 0, transform: hoveredBtn === 'collection' ? 'scale(1.06)' : 'scale(1)', filter: hoveredBtn === 'collection' ? 'drop-shadow(0 0 15px rgba(255, 170, 0, 0.6)) brightness(1.1)' : 'drop-shadow(0 5px 10px rgba(0, 0, 0, 0.4)) brightness(1)' }}>
            <img src={asset('assets/btn-collection.png')} alt="卡牌图鉴" style={{ width: '100%', height: 'auto', display: 'block', pointerEvents: 'none' }}
              onError={(e) => { e.currentTarget.style.display = 'none'; if (e.currentTarget.nextElementSibling) (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block'; }} />
            <div style={{ display: 'none', width: '100%', padding: '12px 32px', background: 'linear-gradient(135deg, #1a2820 0%, #243530 100%)', border: '1px solid rgba(74,124,111,0.5)', borderRadius: '8px' }}>
              <span style={{ color: '#a7c5ba', fontSize: '18px', fontWeight: 600, fontFamily: 'serif', letterSpacing: '4px' }}>📜 卡牌图鉴</span>
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
          <div className="w-full max-w-xl">
            <div className="mb-5 flex gap-2">
              {[
                { id: 'overview', label: '总览' },
                { id: 'records', label: '战绩' },
                { id: 'collection', label: '收藏' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    uiAudio.playClick();
                    setProfileTab(tab.id as ProfileTab);
                  }}
                  className="rounded-md border px-3 py-1.5 text-sm transition"
                  style={{
                    borderColor: profileTab === tab.id ? '#d4a520' : 'rgba(212,165,32,0.25)',
                    color: profileTab === tab.id ? '#f5e6b8' : '#c6b792',
                    background: profileTab === tab.id ? 'rgba(212,165,32,0.14)' : 'rgba(10,10,18,0.35)',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {profileTab === 'overview' ? (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-[rgba(212,165,32,0.25)] bg-black/30 p-3">
                  <div className="text-[#bda77f]">当前身份</div>
                  <div className="mt-1 text-[#f5e6b8]">机枢学徒 · Lv.12</div>
                </div>
                <div className="rounded-lg border border-[rgba(212,165,32,0.25)] bg-black/30 p-3">
                  <div className="text-[#bda77f]">主修门派</div>
                  <div className="mt-1 text-[#f5e6b8]">墨家 / 儒家</div>
                </div>
                <div className="rounded-lg border border-[rgba(212,165,32,0.25)] bg-black/30 p-3">
                  <div className="text-[#bda77f]">铜钱</div>
                  <div className="mt-1 text-[#f5e6b8]">{coinBalance.toLocaleString()}</div>
                </div>
                <div className="rounded-lg border border-[rgba(212,165,32,0.25)] bg-black/30 p-3">
                  <div className="text-[#bda77f]">机关玉</div>
                  <div className="mt-1 text-[#f5e6b8]">{jadeBalance.toLocaleString()}</div>
                </div>
              </div>
            ) : null}
            {profileTab === 'records' ? (
              <div className="space-y-3 text-sm">
                <div className="rounded-lg border border-[rgba(212,165,32,0.25)] bg-black/30 p-3 flex justify-between">
                  <span className="text-[#bda77f]">最近论场胜率</span><span className="text-[#f5e6b8]">58%</span>
                </div>
                <div className="rounded-lg border border-[rgba(212,165,32,0.25)] bg-black/30 p-3 flex justify-between">
                  <span className="text-[#bda77f]">连胜记录</span><span className="text-[#f5e6b8]">4 场</span>
                </div>
                <div className="rounded-lg border border-[rgba(212,165,32,0.25)] bg-black/30 p-3 flex justify-between">
                  <span className="text-[#bda77f]">剧情完成度</span><span className="text-[#f5e6b8]">序章 + 第一章上半</span>
                </div>
              </div>
            ) : null}
            {profileTab === 'collection' ? (
              <div className="space-y-3 text-sm">
                <div className="rounded-lg border border-[rgba(212,165,32,0.25)] bg-black/30 p-3 flex justify-between">
                  <span className="text-[#bda77f]">已收录卡牌</span><span className="text-[#f5e6b8]">52 / 160</span>
                </div>
                <div className="rounded-lg border border-[rgba(212,165,32,0.25)] bg-black/30 p-3 flex justify-between">
                  <span className="text-[#bda77f]">本周新增</span><span className="text-[#f5e6b8]">+5</span>
                </div>
                <div className="text-xs text-[#97adbd]">提示：更多卡牌可在“卡牌图鉴”和活动奖励中解锁。</div>
              </div>
            ) : null}
          </div>
        </SystemModal>
      )}
      {activeModal === 'store_coin' && (
        <SystemModal title="获取铜钱" onClose={() => setActiveModal(null)}>
          <div className="w-full max-w-md space-y-3">
            {COIN_PACKS.map((pack) => (
              <button
                key={pack.id}
                className="w-full rounded-lg border border-[rgba(212,165,32,0.35)] bg-black/30 px-4 py-3 text-left transition hover:bg-[#d4a520]/10"
                onClick={() => handleBuyCoinPack(pack)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[#f5e6b8]">{pack.name}</span>
                  <span className="text-[#d4a520]">{pack.priceLabel}</span>
                </div>
                <div className="mt-1 text-xs text-[#bda77f]">获得 {pack.amount.toLocaleString()} 铜钱</div>
              </button>
            ))}
          </div>
        </SystemModal>
      )}
      {activeModal === 'store_jade' && (
        <SystemModal title="获取机关玉" onClose={() => setActiveModal(null)}>
          <div className="w-full max-w-md space-y-3">
            {JADE_PACKS.map((pack) => (
              <button
                key={pack.id}
                className="w-full rounded-lg border border-[rgba(94,127,170,0.45)] bg-black/30 px-4 py-3 text-left transition hover:bg-[#4a6b99]/12"
                onClick={() => handleBuyJadePack(pack)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[#d7e8ff]">{pack.name}</span>
                  <span className="text-[#88b6ff]">{pack.priceLabel}</span>
                </div>
                <div className="mt-1 text-xs text-[#9eb9dd]">获得 {pack.amount.toLocaleString()} 机关玉</div>
              </button>
            ))}
          </div>
        </SystemModal>
      )}
      {activeModal === 'events' && (
        <SystemModal title="活动中心" onClose={() => setActiveModal(null)}>
          <div className="w-full max-w-lg space-y-3">
            {events.map((item) => (
              <div key={item.id} className="rounded-lg border border-[rgba(212,165,32,0.25)] bg-black/30 p-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[#f5e6b8]">{item.title}</h3>
                  <span className="text-xs text-[#bda77f]">奖励 {item.rewardCoin}铜钱 / {item.rewardJade}玉</span>
                </div>
                <p className="mt-1 text-sm text-[#b4c9d8]">{item.summary}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    disabled={item.joined}
                    onClick={() => handleJoinEvent(item.id)}
                    className="rounded-md border border-[rgba(212,165,32,0.35)] px-3 py-1 text-xs text-[#f5e6b8] disabled:opacity-50"
                  >
                    {item.joined ? '已参与' : '参加活动'}
                  </button>
                  <button
                    disabled={!item.joined || item.claimed}
                    onClick={() => handleClaimEvent(item.id)}
                    className="rounded-md border border-[rgba(80,180,120,0.45)] px-3 py-1 text-xs text-[#bfeccf] disabled:opacity-50"
                  >
                    {item.claimed ? '已领取' : '领取奖励'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SystemModal>
      )}
      {activeModal === 'quests' && (
        <SystemModal title="修行任务" onClose={() => setActiveModal(null)}>
          <div className="w-full max-w-lg space-y-3">
            {quests.map((item) => {
              const done = item.progress >= item.target;
              return (
                <div key={item.id} className="rounded-lg border border-[rgba(212,165,32,0.25)] bg-black/30 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[#f5e6b8]">{item.title}</span>
                    <span className="text-xs text-[#bda77f]">{item.progress}/{item.target}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-black/40">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#8b5e00] to-[#d4a520]"
                      style={{ width: `${Math.min(100, (item.progress / item.target) * 100)}%` }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-[#9fbad4]">奖励 {item.rewardCoin}铜钱 / {item.rewardJade}玉</span>
                    <button
                      disabled={!done || item.claimed}
                      onClick={() => handleClaimQuest(item.id)}
                      className="rounded-md border border-[rgba(80,180,120,0.45)] px-3 py-1 text-xs text-[#bfeccf] disabled:opacity-50"
                    >
                      {item.claimed ? '已领取' : done ? '领取' : '未完成'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </SystemModal>
      )}
      {activeModal === 'mail' && (
        <SystemModal title="百灵鸟传书" onClose={() => setActiveModal(null)}>
          <div className="w-full max-w-lg space-y-3">
            {mails.map((item) => (
              <div key={item.id} className="rounded-lg border border-[rgba(212,165,32,0.25)] bg-black/30 p-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[#f5e6b8]">{item.title}</h3>
                  <span className="text-xs text-[#bda77f]">{item.read ? '已读' : '未读'}</span>
                </div>
                <p className="mt-1 text-sm text-[#b4c9d8]">{item.content}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-[#9fbad4]">
                    {item.rewardCoin || item.rewardJade ? `附件：${item.rewardCoin}铜钱 / ${item.rewardJade}玉` : '无附件'}
                  </span>
                  <button
                    disabled={item.claimed || (item.rewardCoin === 0 && item.rewardJade === 0)}
                    onClick={() => handleClaimMail(item.id)}
                    className="rounded-md border border-[rgba(80,180,120,0.45)] px-3 py-1 text-xs text-[#bfeccf] disabled:opacity-50"
                  >
                    {item.claimed ? '已领取' : '领取附件'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SystemModal>
      )}
      {activeModal === 'settings' && (
        <SystemModal title="机枢设置" onClose={() => setActiveModal(null)}>
          <SettingsPanel settings={settings} onSettingsChange={onSettingsChange} />
        </SystemModal>
      )}
    </div>
  );
}
