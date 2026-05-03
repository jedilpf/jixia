import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStoryEngine, type StoryNode, type StoryChoice, type SaveSlotType } from '@/game/story';
import { useAppStore } from '@/app/store';
import { asset } from '@/utils/assets';
import { SaveLoadModal } from '@/ui/components/SaveLoadModal';
import { uiAudio } from '@/utils/audioManager';

// ═══════════════════════════════════════════════════════════════
// 视觉映射常量
// ═══════════════════════════════════════════════════════════════

const NODE_TO_SCENES: Record<string, string> = {
  'prolog_0_0': 'assets/story/scenes/story_ch0_01_candlelight.png',
  'prolog_0_1': 'assets/story/scenes/story_ch0_20_dawn_mist.png',
  'wendao_hall': 'assets/story/scenes/story_ch0_04_cloud_boat_dream.png',
};

const SPEAKER_TO_IMAGE: Record<string, string> = {
  '登记官': 'assets/story/chars/registration_official.png',
  '登记': 'assets/story/chars/registration_official.png',
  '稷下宫主': 'assets/story/chars/school_master.png',
  '祭酒': 'assets/story/chars/jijiu.png',
  '墨家弟子': 'assets/story/chars/mohist_disciple.png',
  '追兵首领': 'assets/story/chars/pursuer_leader.png',
  '法家官员': 'assets/story/chars/legalist_official.png',
  '祖父': 'assets/story/chars/grandfather.png',
  '执笔史官': 'assets/story/chars/history_official.png',
  '孟舆': 'assets/story/chars/meng_yu.png',
  '汝': 'assets/story/chars/meng_yu.png',
  '苏秦': 'assets/story/chars/suqin.png',
  '禽滑厘': 'assets/story/chars/qinhuali.png',
  '慎到': 'assets/story/chars/shendao.png',
  '庄周': 'assets/story/chars/zhuangzhou.png',
};

const FACTION_COLORS: Record<string, string> = {
  confucian: '#f2c56d', legalist: '#d9813f', daoist: '#e5a657', mozi: '#c77d2b',
  strategist: '#e29a50', diplomat: '#f0b35c', logician: '#d6a24d',
};

const FACTION_NAMES: Record<string, string> = {
  confucian: '儒家', legalist: '法家', daoist: '道家', mozi: '墨家',
  strategist: '兵家', diplomat: '纵横家', logician: '名家',
};

// ═══════════════════════════════════════════════════════════════
// 类型定义与解析器
// ═══════════════════════════════════════════════════════════════

type SegmentType = 'single_speaker' | 'scene' | 'narration' | 'inner_thought';

type CameraMotion = 'pan_left' | 'pan_right' | 'tilt_up' | 'tilt_down' | 'zoom_in' | 'zoom_out' | 'dramatic_zoom' | 'breathing_focus' | 'slow_push';

interface SceneAsset {
  asset: string;
  motion: CameraMotion;
}

interface DialogueSegment {
  index: number;
  type: SegmentType;
  speakers: string[];
  contents: string[];
  fullContent?: string;
  isLast: boolean;
  illustration?: SceneAsset | null;
}

interface DestinyEcho {
  id: string;
  message: string;
  color: string;
}

function parseDialogueSegments(currentNode: StoryNode): DialogueSegment[] {
  const segments: DialogueSegment[] = [];
  const lines = currentNode.content.split(/\n+/).filter(l => l.trim());
  
  lines.forEach((line, idx) => {
    let type: SegmentType = 'narration';
    let speakers: string[] = [];
    let contents: string[] = [];
    let fullContent = line;

    if (line.startsWith('【') || line.startsWith('『')) {
      type = 'scene';
    } else if (line.includes('(内心)') || line.includes('（思考）')) {
      type = 'inner_thought';
      speakers = ['我'];
      contents = [line.replace(/[(（]内心|思考[)）]/g, '').trim()];
    } else {
      const match = line.match(/^([^「」]+)：「([^」]+)」$/);
      if (match) {
        type = 'single_speaker';
        speakers = [match[1].trim()];
        contents = [match[2]];
      } else {
        type = 'narration';
      }
    }

    segments.push({
      index: idx,
      type,
      speakers,
      contents,
      fullContent,
      isLast: idx === lines.length - 1,
      illustration: getIllustration(currentNode.id, line),
    });
  });
  return segments;
}

function getIllustration(nodeId: string, text: string): SceneAsset | null {
  const contentBeats: { keywords: string[], asset: string, motion: CameraMotion }[] = [
    { keywords: ['燃烧', '废墟', '火焰', '追兵', '幻象'], asset: 'assets/story/scenes/story_ch0_29_mind_test_ruins.png', motion: 'dramatic_zoom' },
    { keywords: ['知识如海', '探其真', '博学', '学问', '山'], asset: 'assets/story/scenes/story_ch0_26_path_wisdom.png', motion: 'tilt_up' },
    { keywords: ['报家国', '英杰', '成大业', '家国', '矛', '刃', '勇'], asset: 'assets/story/scenes/story_ch0_27_path_courage.png', motion: 'slow_push' },
    { keywords: ['运行之理', '规律', '观世间', '运行', '八卦', '变'], asset: 'assets/story/scenes/story_ch0_28_path_insight.png', motion: 'breathing_focus' },
    { keywords: ['紧握', '浑浊双眸', '颤'], asset: 'assets/story/scenes/story_ch0_30_father_hand_clasp.png', motion: 'zoom_in' },
    { keywords: ['父亲临终', '气息如游丝', '此信', '临终', '故去', '去后'], asset: 'assets/story/scenes/story_ch0_25_father_parting.png', motion: 'tilt_up' },
    { keywords: ['落笔', '签字', '触到纸面', '签名', '推荐信'], asset: 'assets/story/scenes/story_ch0_12_induction_signature.png', motion: 'zoom_in' },
    { keywords: ['有教无类', '匾额', '牌匾'], asset: 'assets/story/scenes/story_ch0_17_plaque_detail.png', motion: 'slow_push' },
    { keywords: ['目光如电', '双眸', '审视', '盯着', '直视'], asset: 'assets/story/scenes/story_ch0_15_eyes_lightning.png', motion: 'breathing_focus' },
    { keywords: ['酒葫芦', '叮咚', '晃', '酒'], asset: 'assets/story/scenes/story_ch0_14_wine_gourd.png', motion: 'pan_right' },
    { keywords: ['朱红印章', '如血', '玺', '红色', '印记'], asset: 'assets/story/scenes/story_ch0_13_blood_seal.png', motion: 'dramatic_zoom' },
    { keywords: ['冷汗', '心跳如鼓', '紧握', '心悸', '惊醒'], asset: 'assets/story/scenes/story_ch0_23_awakening_sweat.png', motion: 'dramatic_zoom' },
    { keywords: ['墨迹淡褪', '泛黄', '陈旧', '边角微卷'], asset: 'assets/story/scenes/story_ch0_21_faded_ink.png', motion: 'zoom_in' },
    { keywords: ['「百家」', '旗帜', '旗'], asset: 'assets/story/scenes/story_ch0_16_baijia_flag.png', motion: 'pan_left' },
    { keywords: ['长案', '登记处', '注册', '排'], asset: 'assets/story/scenes/story_ch0_18_hall_tables.png', motion: 'pan_right' },
    { keywords: ['晨钟', '响', '钟', '洪亮'], asset: 'assets/story/scenes/story_ch0_19_morning_bell.png', motion: 'zoom_out' },
    { keywords: ['袍服', '素色', '身着'], asset: 'assets/story/scenes/story_ch0_24_official_robes.png', motion: 'slow_push' },
    { keywords: ['风云骤变', '漩涡', '雷', '翻涌', '天旋地转'], asset: 'assets/story/scenes/story_ch0_22_cloud_vortex.png', motion: 'dramatic_zoom' },
    { keywords: ['问道堂', '正中有一束光', '宫主', '白发苍苍'], asset: 'assets/story/scenes/story_ch0_04_cloud_boat_dream.png', motion: 'tilt_up' },
    { keywords: ['名册', '卷轴', '抉择', '书写'], asset: 'assets/story/scenes/story_ch0_11_selection_scroll.png', motion: 'breathing_focus' },
    { keywords: ['史官', '登记官', '官吏'], asset: 'assets/story/scenes/story_ch0_10_registrar_portrait.png', motion: 'breathing_focus' },
    { keywords: ['大殿', '殿宇', '大厅'], asset: 'assets/story/scenes/story_ch0_09_registration_hall.png', motion: 'slow_push' },
    { keywords: ['幽径', '修竹', '学宫', '长廊'], asset: 'assets/story/scenes/story_ch0_08_academy_path.png', motion: 'pan_right' },
    { keywords: ['街道', '商贾', '人潮'], asset: 'assets/story/scenes/story_ch0_07_jixia_streets.png', motion: 'pan_left' },
    { keywords: ['城门', '城郭', '石碑'], asset: 'assets/story/scenes/story_ch0_06_jixia_monument.png', motion: 'tilt_up' },
    { keywords: ['薄雾', '隐于'], asset: 'assets/story/scenes/story_ch0_20_dawn_mist.png', motion: 'zoom_out' },
    { keywords: ['惊醒', '东方已白', '启程'], asset: 'assets/story/scenes/story_ch0_05_arrival_dawn.png', motion: 'dramatic_zoom' },
    { keywords: ['云海', '扁舟', '九霄', '梦中'], asset: 'assets/story/scenes/story_ch0_04_cloud_boat_dream.png', motion: 'zoom_out' },
    { keywords: ['窗', '明月', '夜深'], asset: 'assets/story/scenes/story_ch0_03_moonlit_window.png', motion: 'breathing_focus' },
    { keywords: ['信', '信函', '信笺'], asset: 'assets/story/scenes/story_ch0_02_father_letter.png', motion: 'zoom_in' },
    { keywords: ['烛火', '摇曳', '客栈'], asset: 'assets/story/scenes/story_ch0_01_candlelight.png', motion: 'breathing_focus' },
  ];

  for (const beat of contentBeats) {
    if (beat.keywords.some(kw => text.includes(kw))) {
      return { asset: beat.asset, motion: beat.motion };
    }
  }

  if (nodeId === 'prolog_0_0') return { asset: 'assets/story/scenes/story_ch0_01_candlelight.png', motion: 'slow_push' };
  if (nodeId.includes('prolog_0_3')) return { asset: 'assets/story/scenes/story_ch0_09_registration_hall.png', motion: 'pan_left' };
  if (NODE_TO_SCENES[nodeId]) return { asset: NODE_TO_SCENES[nodeId], motion: 'slow_push' };
  
  return null;
}

// 运镜变体解析引擎
function getMotionVariants(motionType: CameraMotion) {
  switch (motionType) {
    case 'tilt_up': return { animate: { y: ['10%', '-10%'] }, transition: { duration: 40, ease: 'linear', repeat: Infinity, repeatType: 'reverse' as const } };
    case 'pan_left': return { animate: { x: ['5%', '-5%'] }, transition: { duration: 40, ease: 'linear', repeat: Infinity, repeatType: 'reverse' as const } };
    case 'pan_right': return { animate: { x: ['-5%', '5%'] }, transition: { duration: 40, ease: 'linear', repeat: Infinity, repeatType: 'reverse' as const } };
    case 'dramatic_zoom': return { animate: { scale: [1, 1.25] }, transition: { duration: 25, ease: 'easeOut' } };
    case 'zoom_out': return { animate: { scale: [1.3, 1] }, transition: { duration: 35, ease: 'easeOut' } };
    case 'zoom_in': return { animate: { scale: [1, 1.2] }, transition: { duration: 40, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' as const } };
    case 'breathing_focus': return { animate: { scale: [1.05, 1.1] }, transition: { duration: 8, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' as const } };
    case 'slow_push': 
    default: return { animate: { scale: [1, 1.15], x: ['0%', '-2%'], y: ['0%', '1%'] }, transition: { duration: 45, ease: 'linear', repeat: Infinity, repeatType: 'reverse' as const } };
  }
}

// ═══════════════════════════════════════════════════════════════
// 主渲染组件
// ═══════════════════════════════════════════════════════════════

export function StoryScreen({ onBack }: { onBack?: () => void } = {}) {
  const { dispatch } = useAppStore();
  const engine = getStoryEngine();

  const [currentNode, setCurrentNode] = useState<StoryNode | undefined>();
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [typingComplete, setTypingComplete] = useState(false);
  
  // 交互状态
  const [isHoveredChoice, setIsHoveredChoice] = useState<number | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isMenuHovered, setIsMenuHovered] = useState(false);
  
  // 底特律式命轨回响 (Destiny Echoes)
  const [echoes, setEchoes] = useState<DestinyEcho[]>([]);
  const previousRelationships = useRef(engine.getRelationships());

  const segments = useMemo(() => currentNode ? parseDialogueSegments(currentNode) : [], [currentNode]);
  const currentSegment = segments[segmentIndex] || null;
  const isLastSegment = segmentIndex === segments.length - 1;
  const hasChoices = Boolean(currentNode?.choices);
  
  // 是否处于抉择状态 (L4 景深模糊)
  const isChoiceMode = isLastSegment && hasChoices && typingComplete;

  const typingTimer = useRef<number | null>(null);

  // 打字机引擎
  const startTyping = useCallback((text: string) => {
    if (typingTimer.current) clearInterval(typingTimer.current);
    setDisplayedText('');
    setTypingComplete(false);
    let i = 0;
    typingTimer.current = window.setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        i++;
      } else {
        if (typingTimer.current) clearInterval(typingTimer.current);
        setTypingComplete(true);
      }
    }, 40); // 略微放慢，增加电影感
  }, []);

  // 监听引擎变化 (捕捉好感度变更)
  useEffect(() => {
    const unsub = engine.subscribe(e => {
      if (e.type === 'node_changed') {
        setCurrentNode(engine.getCurrentNode());
        setSegmentIndex(0);
      }
      if (e.type === 'relationship_changed') {
        const newRels = engine.getRelationships();
        const newEchoes: DestinyEcho[] = [];
        
        Object.keys(newRels).forEach(faction => {
          const oldVal = previousRelationships.current[faction]?.affection || 0;
          const newVal = newRels[faction].affection;
          if (newVal > oldVal) {
            newEchoes.push({ id: Date.now() + faction, faction, message: `${FACTION_NAMES[faction] || faction} 羁绊加深 ✦`, color: FACTION_COLORS[faction] || '#D4AF65' });
          } else if (newVal < oldVal) {
            newEchoes.push({ id: Date.now() + faction, faction, message: `${FACTION_NAMES[faction] || faction} 产生分歧 ▽`, color: '#831843' });
          }
        });

        if (newEchoes.length > 0) {
          setEchoes(prev => [...prev, ...newEchoes]);
          // 5秒后自动清除
          setTimeout(() => {
            setEchoes(prev => prev.filter(e => !newEchoes.find(n => n.id === e.id)));
          }, 5000);
        }
        previousRelationships.current = newRels;
      }
    });
    setCurrentNode(engine.getCurrentNode());
    return () => unsub();
  }, [engine]);

  // 触发打字
  useEffect(() => {
    if (currentSegment) {
      const text = currentSegment.type === 'single_speaker' 
        ? currentSegment.contents[0] 
        : currentSegment.fullContent || '';
      startTyping(text);
    }
  }, [currentSegment, startTyping]);

  // 全局点击推进
  const handleNext = () => {
    if (isChoiceMode) return; // 抉择模式下禁止点击全局推进
    
    if (!typingComplete) {
      if (typingTimer.current) clearInterval(typingTimer.current);
      const text = currentSegment?.type === 'single_speaker' ? currentSegment.contents[0] : currentSegment?.fullContent || '';
      setDisplayedText(text);
      setTypingComplete(true);
      return;
    }
    
    if (isLastSegment) {
      if (!hasChoices && currentNode?.nextNode) {
        // 无选项的自动推进
        engine.goToNext();
      }
    } else {
      setSegmentIndex(v => v + 1);
    }
  };

  if (!currentNode) return null;

  return (
    <div 
      style={{
        width: '100%', height: '100dvh', background: '#0a0503', 
        overflow: 'hidden', position: 'relative', color: '#f6e4c3', 
        fontFamily: '"Noto Serif SC", serif', userSelect: 'none'
      }}
      onClick={handleNext}
    >
      {/* ───────────────────────────────────────────────────────── */}
      {/* L0: 寰宇层 (Atmosphere) */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, #1a0f0a 0%, #0a0503 100%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'url("https://www.transparenttextures.com/patterns/black-paper.png")', opacity: 0.15, mixBlendMode: 'overlay', pointerEvents: 'none' }} />
      
      {/* 金粉粒子 */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`dust-${i}`}
          animate={{ y: ['-5vh', '105vh'], x: Math.sin(i) * 50, opacity: [0, 0.4, 0] }}
          transition={{ duration: 10 + Math.random() * 10, repeat: Infinity, ease: 'linear', delay: Math.random() * 10 }}
          style={{
            position: 'absolute', top: '-10%', left: `${Math.random() * 100}%`,
            width: '2px', height: '2px', background: '#D4AF65', borderRadius: '50%',
            boxShadow: '0 0 8px #D4AF65', zIndex: 0, pointerEvents: 'none'
          }}
        />
      ))}

      {/* ───────────────────────────────────────────────────────── */}
      {/* L1 & L2 & 景深控制: 视界与演像层 */}
      <motion.div 
        animate={{ filter: isChoiceMode ? 'blur(12px) brightness(0.4)' : 'blur(0px) brightness(1)' }}
        transition={{ duration: 0.8 }}
        style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <AnimatePresence mode="wait">
          {currentSegment?.illustration && (
            <motion.div 
              key={currentSegment.illustration.asset}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 2 }}
              style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
            >
              <motion.img 
                src={asset(currentSegment.illustration.asset)} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6, scale: 1.25 }} 
                alt="Scene" 
                {...getMotionVariants(currentSegment.illustration.motion)}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0a0503 10%, transparent 60%, #0a0503 90%)' }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 立绘渲染 */}
        {currentSegment && currentSegment.speakers.map((s, i) => SPEAKER_TO_IMAGE[s] && (
          <motion.div
            key={s}
            initial={{ opacity: 0, filter: 'blur(10px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} transition={{ duration: 1.2 }}
            style={{ position: 'absolute', bottom: '5%', right: currentSegment.speakers.length === 1 ? '15%' : `${15 + i * 20}%`, height: '80vh', zIndex: 20 }}
          >
            <img 
              src={asset(SPEAKER_TO_IMAGE[s])} 
              style={{ height: '100%', objectFit: 'contain', animation: 'breathing 6s infinite ease-in-out', filter: 'drop-shadow(0 0 30px rgba(0,0,0,0.8))' }} 
              alt={s} 
            />
          </motion.div>
        ))}
      </motion.div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* L3: 沉浸叙事层 (Subtitle / Silk Floating Box) */}
      <AnimatePresence mode="wait">
        {!isChoiceMode && currentSegment && (
          <motion.div 
            key={`text-${segmentIndex}`}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'absolute',
              bottom: '10%',
              left: '0',
              right: '0',
              margin: '0 auto',
              width: '100%',
              maxWidth: '900px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '0 40px',
              zIndex: 30,
              pointerEvents: 'none'
            }}
          >
            {/* 电影字幕式阴影遮罩 - 限定在文本框周围，而非横跨整个屏幕 */}
            <div style={{ position: 'absolute', inset: '-60px -40px', background: 'radial-gradient(ellipse at center, rgba(10,5,3,0.9) 0%, transparent 70%)', zIndex: -1 }} />

            {/* 说话人名牌 - 极简玉签 */}
            {currentSegment.type === 'single_speaker' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                style={{
                  padding: '6px 24px',
                  border: '1px solid #D4AF65',
                  background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.9) 0%, rgba(10, 14, 20, 0.9) 100%)',
                  color: '#f6e4c3',
                  fontSize: '20px',
                  fontWeight: 900,
                  letterSpacing: '0.2em',
                  marginBottom: '24px',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.6)',
                  borderRadius: '2px',
                  alignSelf: 'flex-start',
                }}
              >
                {currentSegment.speakers[0]}
              </motion.div>
            )}

            {/* 对话文本区 */}
            <div style={{
              width: '100%',
              fontSize: currentSegment.type === 'scene' ? '20px' : '26px',
              lineHeight: 2.0,
              color: currentSegment.type === 'inner_thought' ? '#a39b8f' : '#f6e4c3',
              fontStyle: currentSegment.type === 'inner_thought' ? 'italic' : 'normal',
              textShadow: '0 4px 12px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.5)',
              letterSpacing: '0.05em',
              textAlign: (currentSegment.type === 'scene' || currentSegment.type === 'narration') ? 'center' : 'left',
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
            }}>
              {currentSegment.type === 'single_speaker' && <span style={{ color: '#D4AF65', marginRight: '12px' }}>「</span>}
              {displayedText}
              {typingComplete && currentSegment.type === 'single_speaker' && <span style={{ color: '#D4AF65', marginLeft: '12px' }}>」</span>}
            </div>

            {/* 点击延续提示 */}
            {typingComplete && !isLastSegment && (
              <motion.div 
                animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
                style={{ marginTop: '30px', color: 'rgba(212,175,101,0.6)', fontSize: '14px', letterSpacing: '0.3em' }}
              >
                — 点击推演 —
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───────────────────────────────────────────────────────── */}
      {/* L4: 命轨层 (Destiny Layer) - 抉择与回响 */}
      
      {/* 底特律式命轨回响 (右上角提示) */}
      <div style={{ position: 'absolute', top: '100px', right: '40px', display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 40, pointerEvents: 'none' }}>
        <AnimatePresence>
          {echoes.map(echo => (
            <motion.div
              key={echo.id}
              initial={{ opacity: 0, x: 50, filter: 'blur(5px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(10px)', transition: { duration: 1 } }}
              style={{
                background: 'linear-gradient(90deg, rgba(10,5,3,0.9) 0%, rgba(30,30,30,0.8) 100%)',
                borderLeft: `4px solid ${echo.color}`,
                padding: '16px 32px',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 900,
                letterSpacing: '0.1em',
                boxShadow: `0 10px 30px rgba(0,0,0,0.5), -5px 0 20px ${echo.color}33`,
                backdropFilter: 'blur(10px)',
              }}
            >
              {echo.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 沉浸式抉择 (悬浮竹简) */}
      {isChoiceMode && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 40 }}>
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            style={{ color: '#D4AF65', fontSize: '18px', letterSpacing: '0.5em', marginBottom: '60px', textShadow: '0 0 20px #D4AF65' }}
          >
            【 抉 择 命 轨 】
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '700px' }}>
            {currentNode.choices?.map((c, i) => (
              <motion.button
                key={c.id}
                initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.15, type: 'spring' }}
                onMouseEnter={() => { uiAudio.playHover(); setIsHoveredChoice(i); }}
                onMouseLeave={() => setIsHoveredChoice(null)}
                onClick={(e) => { e.stopPropagation(); engine.makeChoice(c.id); }}
                style={{
                  width: '100%',
                  padding: '24px 40px',
                  background: isHoveredChoice === i ? 'rgba(212, 175, 101, 0.15)' : 'rgba(10, 5, 3, 0.6)',
                  border: '1px solid',
                  borderColor: isHoveredChoice === i ? '#D4AF65' : 'rgba(212, 175, 101, 0.2)',
                  backdropFilter: 'blur(20px)',
                  color: isHoveredChoice === i ? '#fff' : '#f6e4c3',
                  fontSize: '22px',
                  textAlign: 'center',
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isHoveredChoice === i ? '0 0 40px rgba(212,175,101,0.2)' : '0 10px 30px rgba(0,0,0,0.5)',
                  transform: isHoveredChoice === i ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                {c.text}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────── */}
      {/* L5: 统御层 (Control Layer) - 悬停显现的系统栏 */}
      <motion.div 
        onMouseEnter={() => setIsMenuHovered(true)} onMouseLeave={() => setIsMenuHovered(false)}
        animate={{ opacity: isMenuHovered || isChoiceMode ? 1 : 0.1 }} transition={{ duration: 0.5 }}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '80px', padding: '0 40px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(to bottom, rgba(10,5,3,0.9), transparent)', zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button 
            onClick={(e) => { e.stopPropagation(); onBack ? onBack() : dispatch({ type: 'NAVIGATE', screen: 'home' }); }}
            style={{ background: 'transparent', border: 'none', color: 'rgba(246, 228, 195, 0.6)', cursor: 'pointer', fontSize: '14px', letterSpacing: '0.2em' }}
          >
            ← 终止推演
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '20px' }}>
          <button 
            onClick={(e) => { e.stopPropagation(); setShowSaveModal(true); }}
            style={{ background: 'transparent', border: '1px solid rgba(212,175,101,0.3)', padding: '6px 16px', color: '#D4AF65', cursor: 'pointer', fontSize: '12px', letterSpacing: '0.2em', borderRadius: '2px' }}
          >
            命轨记录
          </button>
        </div>
      </motion.div>

      <SaveLoadModal 
        mode="save" 
        open={showSaveModal} 
        slots={engine.getSaveSlots()} 
        onSave={(slot) => { engine.forceSave(slot); setShowSaveModal(false); }} 
        onLoad={(slot) => { engine.loadSlot(slot); setShowSaveModal(false); }} 
        onClose={() => setShowSaveModal(false)} 
      />

      <style>{`
        @keyframes kenburns { 0% { transform: scale(1) translate(0,0); } 100% { transform: scale(1.1) translate(-1%, 1%); } }
        @keyframes breathing { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-10px) scale(1.02); } }
      `}</style>
    </div>
  );
}