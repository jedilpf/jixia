import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { getStoryEngine, type StoryNode, type StoryChoice, type SaveSlotType } from '@/game/story';
import { useAppStore } from '@/app/store';
import { asset } from '@/utils/assets';
import { SaveLoadModal } from '@/ui/components/SaveLoadModal';
import { uiAudio } from '@/utils/audioManager';

// ═══════════════════════════════════════════════════════════════
// 场景映射常量（必须在函数定义之前）
// ═══════════════════════════════════════════════════════════════

const NODE_TO_SCENES: Record<string, string> = {
  'prolog_0_0': 'assets/story/scenes/story_ch0_01_candlelight.png',
  'prolog_0_1': 'assets/story/scenes/story_ch0_20_dawn_mist.png',
  'wendao_hall': 'assets/story/scenes/story_ch0_04_cloud_boat_dream.png',
};

// ═══════════════════════════════════════════════════════════════
// 对话分段类型定义 - 按语义单元分段（符合文档规范）
// ═══════════════════════════════════════════════════════════════

type SegmentType = 'single_speaker' | 'dual_speaker' | 'scene' | 'narration' | 'inner_thought';

interface DialogueSegment {
  index: number;
  type: SegmentType;
  // 对话：说话人和内容
  speakers: string[];
  contents: string[];
  // 场景/旁白：完整文本
  fullContent?: string;
  isLast: boolean;
  illustration?: string | null;
}

interface DialogueLine {
  type: 'dialogue' | 'scene' | 'inner_thought' | 'narration';
  speaker?: string;
  content: string;
}

// 每段字数控制范围（确保视觉舒适度）
const MIN_SEGMENT_CHARS = 30;   // 最少30字，避免段落过短
const MAX_SEGMENT_CHARS = 150;  // 最多150字，避免段落过长

/**
 * 解析单行文本
 */
function parseLine(line: string): DialogueLine {
  // 场景描述
  if (line.startsWith('【') || line.startsWith('『')) {
    return { type: 'scene', content: line };
  }

  // 主角思考
  if (line.includes('(内心)') || line.includes('（思考）')) {
    const content = line.replace(/[(（]内心|思考[)）]/g, '').trim();
    return { type: 'inner_thought', speaker: '我', content };
  }

  // 对话解析：说话人：「内容」
  const dialogueMatch = line.match(/^([^「」]+)：「([^」]+)」$/);
  if (dialogueMatch) {
    return {
      type: 'dialogue',
      speaker: dialogueMatch[1].trim(),
      content: dialogueMatch[2],
    };
  }

  // 旁白/无标记文本
  return { type: 'narration', content: line };
}

/**
 * 按句子分割长文本
 * 支持中文句号、问号、感叹号作为句子边界
 */
function splitIntoSentences(text: string): string[] {
  // 按句子边界分割，但保留标点
  const sentences = text.split(/([。！？]+)/).filter(s => s.trim());
  
  // 将标点和内容重新组合
  const result: string[] = [];
  for (let i = 0; i < sentences.length; i += 2) {
    const content = sentences[i];
    const punctuation = sentences[i + 1] || '';
    if (content) {
      result.push(content + punctuation);
    }
  }
  
  return result.length > 0 ? result : [text];
}

/**
 * 智能合并旁白文本
 * 按语义单元合并，控制字数在合理范围内
 */
function mergeNarrationLines(lines: string[]): string[] {
  const result: string[] = [];
  let currentText = '';
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    // 如果当前行加上新行会超过最大限制，先保存当前行
    if (currentText && (currentText.length + trimmedLine.length > MAX_SEGMENT_CHARS)) {
      result.push(currentText);
      currentText = trimmedLine;
    } else {
      // 合并行
      currentText = currentText ? currentText + '\n' + trimmedLine : trimmedLine;
    }
    
    // 如果当前文本已经超过最小限制，保存它
    if (currentText.length >= MIN_SEGMENT_CHARS) {
      result.push(currentText);
      currentText = '';
    }
  }
  
  // 保存剩余的文本
  if (currentText) {
    result.push(currentText);
  }
  
  return result;
}

/**
 * 按语义单元分段 - 优化视觉节奏
 *
 * 分段规则：
 * - 场景描述（【】开头） → 单独一页
 * - 主角思考 → 单独一页
 * - 对话 → 每人每句单独一页（无论是否为同一人）
 * - 旁白 → 智能合并，控制字数在30-150字之间
 */
function parseDialogueSegments(currentNode: StoryNode): DialogueSegment[] {
  const segments: DialogueSegment[] = [];
  const content = currentNode.content;

  // 按换行分割原始文本
  const lines = content.split(/\n+/).filter(line => line.trim());

  if (lines.length === 0) {
    return segments;
  }

  // 解析每行
  const parsedLines: DialogueLine[] = lines.map(line => parseLine(line));

  // 先收集连续的旁白行
  const narrationBuffer: string[] = [];
  
  const flushNarrationBuffer = () => {
    if (narrationBuffer.length === 0) return;

    // 智能合并旁白
    const mergedTexts = mergeNarrationLines(narrationBuffer);
    for (const text of mergedTexts) {
      const idx = segments.length;
      segments.push({
        index: idx,
        type: 'narration',
        speakers: [],
        contents: [],
        fullContent: text,
        isLast: false,
        illustration: getSceneIllustration(currentNode.id, idx, text, currentNode.background),
      });
    }

    narrationBuffer.length = 0;
  };

  let i = 0;
  while (i < parsedLines.length) {
    const line = parsedLines[i];

    // 场景描述 - 单独一页
    if (line.type === 'scene') {
      flushNarrationBuffer();

      const sceneText = line.content;
      if (sceneText.length > MAX_SEGMENT_CHARS) {
        const sentences = splitIntoSentences(sceneText);
        let currentTemp = '';

        for (const sentence of sentences) {
          if (currentTemp.length + sentence.length > MAX_SEGMENT_CHARS && currentTemp.length >= MIN_SEGMENT_CHARS) {
            const idx = segments.length;
            segments.push({
              index: idx,
              type: 'scene',
              speakers: [],
              contents: [],
              fullContent: currentTemp,
              isLast: false,
              illustration: getSceneIllustration(currentNode.id, idx, currentTemp, currentNode.background),
            });
            currentTemp = sentence;
          } else {
            currentTemp += sentence;
          }
        }

        if (currentTemp) {
          const idx = segments.length;
          segments.push({
            index: idx,
            type: 'scene',
            speakers: [],
            contents: [],
            fullContent: currentTemp,
            isLast: false,
            illustration: getSceneIllustration(currentNode.id, idx, currentTemp, currentNode.background),
          });
        }
      } else {
        const idx = segments.length;
        segments.push({
          index: idx,
          type: 'scene',
          speakers: [],
          contents: [],
          fullContent: sceneText,
          isLast: false,
          illustration: getSceneIllustration(currentNode.id, idx, sceneText, currentNode.background),
        });
      }

      i++;
      continue;
    }

    // 主角思考 - 单独一页
    if (line.type === 'inner_thought') {
      flushNarrationBuffer();
      const idx = segments.length;
      segments.push({
        index: idx,
        type: 'inner_thought',
        speakers: ['我'],
        contents: [line.content],
        fullContent: line.content,
        isLast: false,
        illustration: getSceneIllustration(currentNode.id, idx, line.content, currentNode.background),
      });
      i++;
      continue;
    }

    // 旁白 - 加入缓冲，稍后统一处理
    if (line.type === 'narration') {
      narrationBuffer.push(line.content);
      i++;
      continue;
    }

    // 对话处理 - 每人每句单独一页
    if (line.type === 'dialogue') {
      flushNarrationBuffer();

      const currentSpeaker = line.speaker || '未知';
      const idx = segments.length;
      const fullText = `${currentSpeaker}：「${line.content}」`;

      segments.push({
        index: idx,
        type: 'single_speaker',
        speakers: [currentSpeaker],
        contents: [line.content],
        fullContent: fullText,
        isLast: false,
        illustration: getSceneIllustration(currentNode.id, idx, line.content, currentNode.background),
      });
      i++;
      continue;
    }

    // 其他情况
    i++;
  }

  // 处理剩余的旁白
  flushNarrationBuffer();

  // 标记最后一段
  if (segments.length > 0) {
    segments[segments.length - 1].isLast = true;
  }

  return segments;
}

/**
 * 核心逻辑：根据剧情节点、分段索引及关键词，查找最合适的插画
 * 目标：每 2-3 段内容尽可能触发一次视觉转场
 */
function getSceneIllustration(nodeId: string, _segmentIndex: number, text: string = '', background?: string): string | null {
  // ─────────────────────────────────────────────────────────
  // 1. 内容驱动映射 (Content Driven) - 最高优先级
  // ─────────────────────────────────────────────────────────
  const contentBeats = [
    // --- 交互与细节特写 (Fine Details & Close-ups) ---
    { keywords: ['燃烧', '废墟', '火焰', '追兵', '幻象'], asset: 'assets/story/scenes/story_ch0_29_mind_test_ruins.png' },
    { keywords: ['知识如海', '探其真', '博学', '学问', '山'], asset: 'assets/story/scenes/story_ch0_26_path_wisdom.png' },
    { keywords: ['报家国', '英杰', '成大业', '家国', '矛', '刃', '勇'], asset: 'assets/story/scenes/story_ch0_27_path_courage.png' },
    { keywords: ['运行之理', '规律', '观世间', '运行', '八卦', '变'], asset: 'assets/story/scenes/story_ch0_28_path_insight.png' },
    { keywords: ['紧握', '浑浊双眸', '颤'], asset: 'assets/story/scenes/story_ch0_30_father_hand_clasp.png' },
    { keywords: ['父亲临终', '气息如游丝', '此信', '临终', '故去', '去后'], asset: 'assets/story/scenes/story_ch0_25_father_parting.png' },
    { keywords: ['落笔', '签字', '触到纸面', '签名', '推荐信'], asset: 'assets/story/scenes/story_ch0_12_induction_signature.png' },
    { keywords: ['有教无类', '匾额', '牌匾'], asset: 'assets/story/scenes/story_ch0_17_plaque_detail.png' },
    { keywords: ['目光如电', '双眸', '审视', '盯着', '直视'], asset: 'assets/story/scenes/story_ch0_15_eyes_lightning.png' },
    { keywords: ['酒葫芦', '叮咚', '晃', '酒'], asset: 'assets/story/scenes/story_ch0_14_wine_gourd.png' },
    { keywords: ['朱红印章', '如血', '玺', '红色', '印记'], asset: 'assets/story/scenes/story_ch0_13_blood_seal.png' },
    { keywords: ['冷汗', '心跳如鼓', '紧握', '心悸', '惊醒'], asset: 'assets/story/scenes/story_ch0_23_awakening_sweat.png' },
    { keywords: ['墨迹淡褪', '泛黄', '陈旧', '边角微卷'], asset: 'assets/story/scenes/story_ch0_21_faded_ink.png' },
    { keywords: ['「百家」', '旗帜', '旗'], asset: 'assets/story/scenes/story_ch0_16_baijia_flag.png' },
    { keywords: ['长案', '登记处', '注册', '排'], asset: 'assets/story/scenes/story_ch0_18_hall_tables.png' },
    { keywords: ['晨钟', '响', '钟', '洪亮'], asset: 'assets/story/scenes/story_ch0_19_morning_bell.png' },
    { keywords: ['袍服', '素色', '身着'], asset: 'assets/story/scenes/story_ch0_24_official_robes.png' },
    { keywords: ['风云骤变', '漩涡', '雷', '翻涌', '天旋地转'], asset: 'assets/story/scenes/story_ch0_22_cloud_vortex.png' },
    { keywords: ['问道堂', '正中有一束光', '宫主', '白发苍苍'], asset: 'assets/story/scenes/story_ch0_04_cloud_boat_dream.png' },

    // --- 核心环境场景 (Core Environments) ---
    { keywords: ['名册', '卷轴', '抉择', '书写'], asset: 'assets/story/scenes/story_ch0_11_selection_scroll.png' },
    { keywords: ['史官', '登记官', '官吏'], asset: 'assets/story/scenes/story_ch0_10_registrar_portrait.png' },
    { keywords: ['大殿', '殿宇', '大厅'], asset: 'assets/story/scenes/story_ch0_09_registration_hall.png' },
    { keywords: ['幽径', '修竹', '学宫', '长廊'], asset: 'assets/story/scenes/story_ch0_08_academy_path.png' },
    { keywords: ['街道', '商贾', '人潮'], asset: 'assets/story/scenes/story_ch0_07_jixia_streets.png' },
    { keywords: ['城门', '城郭', '石碑'], asset: 'assets/story/scenes/story_ch0_06_jixia_monument.png' },
    { keywords: ['薄雾', '隐于'], asset: 'assets/story/scenes/story_ch0_20_dawn_mist.png' },
    { keywords: ['惊醒', '东方已白', '启程'], asset: 'assets/story/scenes/story_ch0_05_arrival_dawn.png' },
    { keywords: ['云海', '扁舟', '九霄', '梦中'], asset: 'assets/story/scenes/story_ch0_04_cloud_boat_dream.png' },
    { keywords: ['窗', '明月', '夜深'], asset: 'assets/story/scenes/story_ch0_03_moonlit_window.png' },
    { keywords: ['信', '信函', '信笺'], asset: 'assets/story/scenes/story_ch0_02_father_letter.png' },
    { keywords: ['烛火', '摇曳', '客栈'], asset: 'assets/story/scenes/story_ch0_01_candlelight.png' },
  ];

  for (const beat of contentBeats) {
    if (beat.keywords.some(kw => text.includes(kw))) {
      return beat.asset;
    }
  }

  // ─────────────────────────────────────────────────────────
  // 2. 节点兜底映射 (Node Fallback)
  // ─────────────────────────────────────────────────────────
  if (nodeId === 'prolog_0_0') return 'assets/story/scenes/story_ch0_01_candlelight.png';
  if (nodeId === 'prolog_0_1') return 'assets/story/scenes/story_ch0_20_dawn_mist.png';
  if (nodeId.includes('prolog_0_3')) return 'assets/story/scenes/story_ch0_09_registration_hall.png';
  
  if (background && NODE_TO_SCENES[background]) return NODE_TO_SCENES[background];
  if (NODE_TO_SCENES[nodeId]) return NODE_TO_SCENES[nodeId];

  return null;
}

const STORY_STYLES = {
  container: {
    width: '100%',
    height: '100dvh',
    background: '#0a0503', // 深邃墨玉底色
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    position: 'relative' as const,
  },
  topBar: {
    height: '64px',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid rgba(212, 175, 101, 0.2)', // 金丝勾边
    background: 'rgba(10, 5, 3, 0.85)',
    backdropFilter: 'blur(10px)',
    zIndex: 10,
    boxShadow: '0 4px 30px rgba(0,0,0,0.5)',
  },
  chapterBadge: {
    padding: '6px 20px',
    background: 'linear-gradient(135deg, #1e3a5f 0%, #0a0e14 100%)', // 石青色勋章
    borderRadius: '2px',
    border: '1px solid rgba(212, 175, 101, 0.4)',
    color: '#f6e4c3', // 绢本白
    fontSize: '14px',
    fontWeight: 800,
    letterSpacing: '0.2em',
    textShadow: '0 0 10px rgba(246, 228, 195, 0.3)',
  },
  centerArea: {
    flex: 1,
    padding: '32px 64px',
    overflowY: 'auto' as const,
    scrollbarGutter: 'stable',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '32px',
    background: 'radial-gradient(circle at center, rgba(30, 58, 95, 0.05) 0%, transparent 70%)', // 极淡的石青色晕染
  },
  sceneDescription: {
    fontSize: '18px',
    lineHeight: 2.2,
    color: '#f6e4c3', // 绢本白
    marginBottom: '24px',
    padding: '32px 40px',
    background: 'rgba(20, 20, 20, 0.4)',
    borderRadius: '2px',
    border: '1px solid rgba(212, 175, 101, 0.15)',
    borderLeft: '4px solid #1e3a5f', // 石青色侧边
    whiteSpace: 'pre-wrap' as const,
    fontFamily: '"Noto Serif SC", serif',
    boxShadow: 'inset 0 0 40px rgba(0,0,0,0.3)',
  },
  dialogueArea: {
    display: 'flex',
    gap: '40px',
    marginBottom: '24px',
    alignItems: 'flex-start',
    width: '100%',
    maxWidth: '1000px',
  },
  portrait: {
    width: '260px',
    height: '390px',
    borderRadius: '2px',
    border: '1px solid rgba(212, 175, 101, 0.3)',
    objectFit: 'cover' as const,
    background: '#0a0e14',
    boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
    flexShrink: 0,
    filter: 'contrast(1.05) brightness(0.95)',
  },
  dialogueBox: {
    flex: 1,
    background: 'linear-gradient(135deg, rgba(246, 228, 195, 0.98) 0%, rgba(231, 225, 240, 0.95) 100%)', // 绢本白与润玉色的结合
    borderRadius: '2px',
    border: '1px solid #D4AF65',
    padding: '32px 40px',
    position: 'relative' as const,
    boxShadow: '0 15px 45px rgba(0,0,0,0.5)',
  },
  speakerName: {
    fontSize: '20px',
    fontWeight: 900,
    color: '#1e3a5f', // 石青色名字
    marginBottom: '16px',
    borderBottom: '2px solid rgba(30, 58, 95, 0.15)',
    paddingBottom: '6px',
    display: 'inline-block',
    letterSpacing: '0.1em',
  },
  dialogueText: {
    fontSize: '19px',
    lineHeight: 1.9,
    color: '#1a1a1a', // 深墨色文字
    whiteSpace: 'pre-wrap' as const,
    fontWeight: 500,
  },
  continueIndicator: {
    textAlign: 'right' as const,
    marginTop: '20px',
    color: '#1e3a5f', // 石青色指示器
    fontSize: '14px',
    fontWeight: 'bold',
    letterSpacing: '0.2em',
    opacity: 0.8,
  },
  choicesArea: {
    padding: '40px 64px',
    background: 'rgba(10, 5, 3, 0.95)',
    borderTop: '1px solid rgba(212, 175, 101, 0.2)',
    backdropFilter: 'blur(20px)',
  },
  choiceButton: {
    width: '100%',
    padding: '20px 40px',
    marginBottom: '16px',
    background: 'rgba(30, 58, 95, 0.1)', // 石青色透明背景
    border: '1px solid rgba(212, 175, 101, 0.3)',
    borderRadius: '2px',
    color: '#f6e4c3', // 绢本白
    fontSize: '18px',
    textAlign: 'left' as const,
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  choiceButtonHover: {
    background: 'linear-gradient(90deg, rgba(30, 58, 95, 0.4) 0%, transparent 100%)',
    borderColor: '#D4AF65',
    color: '#ffffff',
    transform: 'translateX(10px)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.4), inset 0 0 20px rgba(212, 175, 101, 0.1)',
  },
  relationshipBar: {
    height: '72px',
    padding: '0 32px',
    background: 'rgba(10, 5, 3, 1)',
    borderTop: '1px solid rgba(212, 175, 101, 0.2)',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    overflowX: 'auto' as const,
    scrollbarWidth: 'none' as const,
  },
  factionBadge: {
    minWidth: '100px',
    padding: '10px 16px',
    background: 'rgba(231, 225, 240, 0.05)', // 润玉色极淡背景
    borderRadius: '1px',
    border: '1px solid rgba(212, 175, 101, 0.2)',
    textAlign: 'center' as const,
    flexShrink: 0,
  },
  factionName: {
    fontSize: '12px',
    color: '#f6e4c3',
    marginBottom: '8px',
    fontWeight: 'bold',
  },
  reputationBar: {
    height: '2px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '1px',
    overflow: 'hidden',
  },
  backButton: {
    padding: '8px 24px',
    background: 'transparent',
    border: '1px solid rgba(212, 175, 101, 0.5)',
    borderRadius: '2px',
    color: '#f6e4c3',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    letterSpacing: '0.1em',
    transition: 'all 0.3s ease',
  },
  menuButton: {
    padding: '8px 24px',
    background: 'rgba(231, 225, 240, 0.1)',
    border: '1px solid rgba(212, 175, 101, 0.5)',
    borderRadius: '2px',
    color: '#f6e4c3',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
  },
  illustrationContainer: {
    width: '100%',
    maxWidth: '720px',
    margin: '0 auto',
    aspectRatio: '16/9',
    position: 'relative' as const,
    border: '1px solid rgba(212, 175, 101, 0.3)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
    background: '#000000',
    overflow: 'hidden',
    borderRadius: '2px',
    flexShrink: 0,
  },
  illustrationImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    animation: 'kenburns 30s infinite alternate linear',
  },
  illustrationOverlay: {
    position: 'absolute' as const,
    inset: 0,
    background: 'linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.6) 100%)',
    pointerEvents: 'none' as const,
  },
};

const FACTION_COLORS: Record<string, string> = {
  confucian: '#f2c56d',
  legalist: '#d9813f',
  daoist: '#e5a657',
  mozi: '#c77d2b',
  strategist: '#e29a50',
  diplomat: '#f0b35c',
  logician: '#d6a24d',
  eclectic: '#c89d63',
  agronomist: '#bc8a45',
  yin_yang: '#e1b873',
  novelist: '#ce8f4b',
  healer: '#e7b66a',
  musician: '#d89f4d',
  calendar: '#f4c76f',
  ritualist: '#d7a24d',
  merchant: '#b97d3b',
};

const FACTION_NAMES: Record<string, string> = {
  confucian: '儒家',
  legalist: '法家',
  daoist: '道家',
  mozi: '墨家',
  strategist: '兵家',
  diplomat: '纵横家',
  logician: '名家',
  eclectic: '杂家',
  agronomist: '农家',
  yin_yang: '阴阳家',
  novelist: '小说家',
  healer: '医家',
  musician: '乐家',
  calendar: '历数家',
  ritualist: '礼家',
  merchant: '商家',
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
  '无名老者': 'assets/story/chars/nameless_elder.png',
  '藏书阁老者': 'assets/story/chars/nameless_elder.png',
  '颜如玉': 'assets/story/chars/yanruyu.png',
  '公输盘': 'assets/story/chars/gongshupan.png',
  '执教长史': 'assets/story/chars/instructor_official.png',
  '儒家讲席': 'assets/story/chars/yanruyu.png',
  '学宫评议席': 'assets/story/chars/jijiu.png',
  // 补齐缺失的历史/剧情人物映射
  '齐王': 'assets/story/chars/qiwang.png',
  '楚王': 'assets/story/chars/chuwang.png',
  '燕王': 'assets/story/chars/yanwang.png',
  '天子': 'assets/story/chars/emperor.png',
  '屈原': 'assets/story/chars/quyuan.png',
  '李斯': 'assets/story/chars/lisi.png',
  '范雎': 'assets/story/chars/fanju.png',
  '平原君': 'assets/story/chars/pingyuanjun.png',
  '信陵君': 'assets/story/chars/xinlingjun.png',
  '荀况': 'assets/story/chars/xunzi.png',
  '荀子': 'assets/story/chars/xunzi.png',
  '颜回': 'assets/story/chars/yanhui.png',
  '鬼谷子': 'assets/story/chars/guiguzi.png',
  '郭开': 'assets/story/chars/guokai.png',
  '秦冉': 'assets/story/chars/qinran.png',
  '特使': 'assets/story/chars/envoy.png',
  '使者': 'assets/story/chars/envoy.png',
  '法家代表': 'assets/story/chars/legalist_official.png',
  '太子丹': 'assets/story/chars/taizidan.png',
};

// ═══════════════════════════════════════════════════════════════
// 类型定义和常量
// ═══════════════════════════════════════════════════════════════

type DialogueState = 'typing' | 'complete' | 'choice' | 'transition';

interface StorySettings {
  textSpeed: 'slow' | 'normal' | 'fast' | 'instant';
  autoPlay: boolean;
  showRelationshipChanges: boolean;
}

const TEXT_SPEED_MAP: Record<StorySettings['textSpeed'], number> = {
  slow: 60,
  normal: 30,
  fast: 15,
  instant: 0,
};

// 主角思考头像
const INNER_THOUGHT_AVATAR = 'assets/story/chars/player_thinking.png';

export function StoryScreen({ onBack }: { onBack?: () => void } = {}) {
  const { dispatch } = useAppStore();
  const engine = getStoryEngine();

  const [isInitialized, setIsInitialized] = useState(false);
  const [currentNode, setCurrentNode] = useState<StoryNode | undefined>();
  // dialogueState 用于追踪过渡状态，UI显示主要依赖 segmentTypingComplete
  const [, setDialogueState] = useState<DialogueState>('typing');
  const [displayedText, setDisplayedText] = useState('');
  const [isHoveredChoice, setIsHoveredChoice] = useState<number | null>(null);
  const [chapter, setChapter] = useState(0);
  const [, setScene] = useState(0);
  const [relationships, setRelationships] = useState(engine.getRelationships());
  const [stats, setStats] = useState(engine.getPlayerStats());
  const [showSettings, setShowSettings] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<{
    show: boolean;
    success: boolean;
    message: string;
  }>({ show: false, success: false, message: '' });
  const [settings, setSettings] = useState<StorySettings>({
    textSpeed: 'normal',
    autoPlay: false,
    showRelationshipChanges: true,
  });

  // ═══════════════════════════════════════════════════════════
  // 分段显示状态
  // ═══════════════════════════════════════════════════════════
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [segmentTypingComplete, setSegmentTypingComplete] = useState(false);

  // 解析当前节点内容为分段
  const segments = useMemo(() => {
    if (!currentNode) return [];
    return parseDialogueSegments(currentNode);
  }, [currentNode]);

  // 当前分段
  const currentSegment = segments[segmentIndex] || null;

  // 获取当前插画路径 - 直接使用 segment 创建时已计算好的 illustration
  const currentIllustration = currentSegment?.illustration ?? null;

  const isLastSegment = segmentIndex === segments.length - 1;
  const hasChoices = Boolean(currentNode?.choices);

  const textContainerRef = useRef<HTMLDivElement>(null);
  const typingIntervalRef = useRef<number | null>(null);

  // 分段打字机效果
  const startSegmentTyping = useCallback((text: string) => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    const speed = TEXT_SPEED_MAP[settings.textSpeed];

    if (speed === 0) {
      setDisplayedText(text);
      setSegmentTypingComplete(true);
      if (isLastSegment && hasChoices) {
        setDialogueState('choice');
      } else {
        setDialogueState('complete');
      }
      return;
    }

    setDisplayedText('');
    setSegmentTypingComplete(false);
    let index = 0;

    typingIntervalRef.current = window.setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
        }
        setSegmentTypingComplete(true);
        if (isLastSegment && hasChoices) {
          setDialogueState('choice');
        } else {
          setDialogueState('complete');
        }
      }
    }, speed);
  }, [settings.textSpeed, isLastSegment, hasChoices]);

  // 初始化节点时重置分段索引
  useEffect(() => {
    const unsubscribe = engine.subscribe((event) => {
      switch (event.type) {
        case 'node_changed': {
          const nextNode = engine.getCurrentNode();
          setCurrentNode(nextNode);
          setChapter(engine.getChapter());
          setScene(engine.getScene());
          setSegmentIndex(0); // 重置分段索引
          setSegmentTypingComplete(false);
          setDialogueState('typing');
          break;
        }
        case 'relationship_changed':
          setRelationships(engine.getRelationships());
          break;
        case 'stats_changed':
          setStats(engine.getPlayerStats());
          break;
      }
    });

    const initialNode = engine.getCurrentNode();
    setCurrentNode(initialNode);
    setSegmentIndex(0);
    setIsInitialized(true);

    return () => {
      unsubscribe();
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, [engine]);

  // 当分段变化时开始打字
  useEffect(() => {
    if (currentSegment) {
      if ((currentSegment.type === 'single_speaker' || currentSegment.type === 'dual_speaker') && currentSegment.contents.length > 0) {
        // 对话类型：生成带说话人和双引号的文本用于打字机效果
        const dialogueText = currentSegment.contents.map((content, i) =>
          `${currentSegment.speakers[i]}："${content}"`
        ).join('\n');
        startSegmentTyping(dialogueText);
      } else if (currentSegment.fullContent) {
        // 场景/旁白/思考类型：显示完整内容
        startSegmentTyping(currentSegment.fullContent);
      }
    }
  }, [currentSegment, startSegmentTyping]);

  // 自动播放：打字完成后自动切换下一段
  useEffect(() => {
    if (!settings.autoPlay || !segmentTypingComplete) return;
    if (isLastSegment && hasChoices) return; // 有选项时不自动切换

    // 等待一段时间后自动切换
    const autoAdvanceDelay = 1500; // 1.5秒后自动切换
    const timer = setTimeout(() => {
      if (isLastSegment) {
        // 最后一段且无选项：进入下一节点
        if (currentNode?.nextNode) {
          setDialogueState('transition');
          setTimeout(() => {
            engine.goToNext();
          }, 300);
        }
      } else {
        // 进入下一分段
        setSegmentIndex(prev => prev + 1);
        setSegmentTypingComplete(false);
        setDialogueState('typing');
      }
    }, autoAdvanceDelay);

    return () => clearTimeout(timer);
  }, [settings.autoPlay, segmentTypingComplete, isLastSegment, hasChoices, currentNode, engine]);

  // 跳过当前分段打字
  const skipSegmentTyping = useCallback(() => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
    if (currentSegment) {
      if ((currentSegment.type === 'single_speaker' || currentSegment.type === 'dual_speaker') && currentSegment.contents.length > 0) {
        // 对话类型：生成带说话人和双引号的文本
        const dialogueText = currentSegment.contents.map((content, i) =>
          `${currentSegment.speakers[i]}："${content}"`
        ).join('\n');
        setDisplayedText(dialogueText);
      } else if (currentSegment.fullContent) {
        // 场景/旁白/思考类型
        setDisplayedText(currentSegment.fullContent);
      }
    }
    setSegmentTypingComplete(true);
    if (isLastSegment && hasChoices) {
      setDialogueState('choice');
    } else {
      setDialogueState('complete');
    }
  }, [currentSegment, isLastSegment, hasChoices]);

  // 下一个分段
  const handleNextSegment = useCallback(() => {
    // 关闭设置面板（如果打开着）
    setShowSettings(false);

    if (!segmentTypingComplete) {
      skipSegmentTyping();
      return;
    }

    if (isLastSegment) {
      // 最后一段：显示选项或进入下一节点
      if (hasChoices) {
        // 选项已在渲染中处理
      } else if (currentNode?.nextNode) {
        setDialogueState('transition');
        setTimeout(() => {
          engine.goToNext();
        }, 300);
      }
    } else {
      // 进入下一分段
      setSegmentIndex(prev => prev + 1);
      setSegmentTypingComplete(false);
      setDialogueState('typing');
    }
  }, [segmentTypingComplete, isLastSegment, hasChoices, currentNode, engine, skipSegmentTyping]);

  const handleChoice = useCallback((choice: StoryChoice) => {
    // 关闭设置面板（如果打开着）
    setShowSettings(false);
    engine.makeChoice(choice.id);
  }, [engine]);

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      dispatch({ type: 'NAVIGATE', screen: 'home' });
    }
  }, [dispatch, onBack]);

  // 存档处理
  const handleSave = useCallback((slot: SaveSlotType) => {
    uiAudio.playClick();
    const success = engine.forceSave(slot);
    setSaveFeedback({
      show: true,
      success,
      message: success ? '存档成功！' : '存档失败，请重试',
    });
    setShowSaveModal(false);

    // 2秒后自动隐藏 Toast
    setTimeout(() => {
      setSaveFeedback({ show: false, success: false, message: '' });
    }, 2000);
  }, [engine]);

  const handleLoad = useCallback((slot: SaveSlotType) => {
    uiAudio.playClick();
    const success = engine.loadSlot(slot);
    if (success) {
      setSaveFeedback({
        show: true,
        success: true,
        message: '读档成功！',
      });
      setShowSaveModal(false);

      setTimeout(() => {
        setSaveFeedback({ show: false, success: false, message: '' });
      }, 2000);
    } else {
      setSaveFeedback({
        show: true,
        success: false,
        message: '读档失败，存档可能已损坏',
      });
      setTimeout(() => {
        setSaveFeedback({ show: false, success: false, message: '' });
      }, 2000);
    }
  }, [engine]);

  const getChapterLabel = () => {
    if (chapter === 0) return '序章·入学';
    if (chapter === 1) return '第一章·百家入门';
    if (chapter === 2) return '第二章·论辩风云';
    if (chapter === 3) return '第三章·暗流涌动';
    if (chapter === 99) return '终章·问道';
    return '未知章节';
  };

  const getReputation = (faction: string) => {
    const rel = relationships[faction];
    if (!rel) return 0;
    return Math.max(0, Math.min(100, rel.affection + rel.trust + 50));
  };

  const visibleFactions = Object.keys(FACTION_NAMES).slice(0, 8);

  if (!isInitialized || !currentNode) {
    return (
      <div style={STORY_STYLES.container}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#f1dfbb' }}>
          正在加载争鸣史...
        </div>
      </div>
    );
  }

  const getBackgroundStyle = (chap: number) => {
    // Determine image path based on chapter
    const validChaps = [0, 1, 2, 3, 4, 5, 99];
    const targetChap = validChaps.includes(chap) ? chap : 0;
    return {
      background: `linear-gradient(rgba(42, 14, 10, 0.75), rgba(18, 6, 4, 0.95)), url('assets/story/chapter_${targetChap}_bg.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  };

  return (
    <div style={{ ...STORY_STYLES.container, ...getBackgroundStyle(chapter) }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes kenburns {
          0%   { transform: scale(1)    translate(0, 0); }
          25%  { transform: scale(1.04) translate(-1%, 0.5%); }
          50%  { transform: scale(1.06) translate(0.5%, -1%); }
          75%  { transform: scale(1.04) translate(-0.5%, 1%); }
          100% { transform: scale(1)    translate(0, 0); }
        }
      `}</style>

      {/* Top Bar */}
      <div style={STORY_STYLES.topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            style={STORY_STYLES.backButton}
            onClick={handleBack}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#f1c56a';
              e.currentTarget.style.color = '#f1c56a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(236,185,87,0.42)';
              e.currentTarget.style.color = '#fff3de';
            }}
          >
            ← 返回
          </button>
          <span style={STORY_STYLES.chapterBadge}>{getChapterLabel()}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#fff3de', fontSize: '14px' }}>
            名望: {stats.fame}
          </span>
          <button
            style={{
              ...STORY_STYLES.menuButton,
              background: 'rgba(88,35,16,0.76)',
            }}
            onClick={() => setShowSaveModal(true)}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#f1c56a';
              e.currentTarget.style.color = '#f1c56a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(236,185,87,0.42)';
              e.currentTarget.style.color = '#fff3de';
            }}
          >
            📁 存档
          </button>
          {/* 自动播放开关 */}
          <button
            style={{
              ...STORY_STYLES.menuButton,
              background: settings.autoPlay ? 'rgba(212,165,32,0.3)' : 'transparent',
              borderColor: settings.autoPlay ? '#d4a520' : 'rgba(236,185,87,0.42)',
              color: settings.autoPlay ? '#d4a520' : '#fff3de',
            }}
            onClick={() => setSettings((s: StorySettings) => ({ ...s, autoPlay: !s.autoPlay }))}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#f1c56a';
              e.currentTarget.style.color = '#f1c56a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = settings.autoPlay ? '#d4a520' : 'rgba(236,185,87,0.42)';
              e.currentTarget.style.color = settings.autoPlay ? '#d4a520' : '#fff3de';
            }}
          >
            {settings.autoPlay ? '▶ 自动' : '⏸ 手动'}
          </button>
          <button
            style={STORY_STYLES.menuButton}
            onClick={() => setShowSettings(!showSettings)}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#f1c56a';
              e.currentTarget.style.color = '#f1c56a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(236,185,87,0.42)';
              e.currentTarget.style.color = '#fff3de';
            }}
          >
            ⚙️ 设置
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div style={{
          position: 'absolute',
          top: '64px',
          right: 0,
          width: '320px',
          height: 'calc(100% - 64px)',
          background: 'rgba(39,12,8,0.98)',
          borderLeft: '1px solid rgba(236,185,87,0.38)',
          zIndex: 20,
          animation: 'slideIn 0.3s ease',
          padding: '24px',
          overflowY: 'auto',
        }}>
          <h3 style={{ color: '#f1c56a', fontSize: '18px', marginBottom: '24px', fontWeight: 700 }}>
            故事设置
          </h3>

          {/* Text Speed */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ color: '#fff3de', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
              文字速度
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['slow', 'normal', 'fast', 'instant'] as const).map((speed) => (
                <button
                  key={speed}
                  onClick={() => setSettings((s: StorySettings) => ({ ...s, textSpeed: speed }))}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: settings.textSpeed === speed
                      ? 'rgba(236,185,87,0.3)'
                      : 'rgba(52,20,12,0.62)',
                    border: settings.textSpeed === speed
                      ? '1px solid #f1c56a'
                      : '1px solid rgba(236,185,87,0.28)',
                    borderRadius: '6px',
                    color: settings.textSpeed === speed ? '#f1c56a' : '#fff3de',
                    cursor: 'pointer',
                    fontSize: '13px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {speed === 'slow' ? '慢' : speed === 'normal' ? '中' : speed === 'fast' ? '快' : '即时'}
                </button>
              ))}
            </div>
          </div>

          {/* Auto Play */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              color: '#fff3de',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={settings.autoPlay}
                onChange={(e) => setSettings((s: StorySettings) => ({ ...s, autoPlay: e.target.checked }))}
                style={{ width: '18px', height: '18px', accentColor: '#f1c56a' }}
              />
              自动播放
            </label>
          </div>

          {/* Show Relationship Changes */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              color: '#fff3de',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={settings.showRelationshipChanges}
                onChange={(e) => setSettings((s: StorySettings) => ({ ...s, showRelationshipChanges: e.target.checked }))}
                style={{ width: '18px', height: '18px', accentColor: '#f1c56a' }}
              />
              显示好感度变化
            </label>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setShowSettings(false)}
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(236,185,87,0.2)',
              border: '1px solid rgba(236,185,87,0.42)',
              borderRadius: '8px',
              color: '#fff3de',
              cursor: 'pointer',
              fontSize: '14px',
              marginTop: '16px',
            }}
          >
            关闭
          </button>
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          top: '14px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 11,
          padding: '8px 22px',
          borderRadius: '999px',
          border: '1px solid rgba(236,185,87,0.38)',
          background: 'rgba(39,12,8,0.78)',
          color: '#f4d28a',
          fontSize: '20px',
          fontWeight: 900,
          letterSpacing: '0.18em',
          textShadow: '0 0 14px rgba(241,197,106,0.22)',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        争鸣史
      </div>

      {/* Center Content - 分段显示 */}
        <div
          style={STORY_STYLES.centerArea}
          ref={textContainerRef}
          onClick={handleNextSegment}
        >
          {/* ═══════════════════════════════════════════════════════════ */}
          {/* 插画展示区 - 动态匹配插画 */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {currentIllustration && (
            <motion.div 
              key={currentIllustration} // 使用图片地址作为Key，图片不变时不重新触发进场动画
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              style={STORY_STYLES.illustrationContainer}
            >
              <img 
                src={asset(currentIllustration)}
                alt="Scene Illustration"
                style={STORY_STYLES.illustrationImage}
              />
              <div style={STORY_STYLES.illustrationOverlay} />
            </motion.div>
          )}

        {/* 当前分段内容 */}
        {currentSegment && (
          <>
            {/* 场景描述 - 打字机效果 */}
            {currentSegment.type === 'scene' && (
              <div style={{
                textAlign: 'center',
                padding: '32px 48px',
                background: 'rgba(48,18,10,0.55)',
                borderLeft: '3px solid #d9a23a',
                borderRadius: '8px',
                color: '#fff3de',
                fontSize: '17px',
                lineHeight: 1.8,
                whiteSpace: 'pre-wrap',
              }}>
                {displayedText || currentSegment.fullContent}
              </div>
            )}

            {/* 旁白 - 打字机效果 */}
            {currentSegment.type === 'narration' && (
              <div style={{
                textAlign: 'center',
                padding: '24px 40px',
                background: 'rgba(36,12,8,0.6)',
                borderRadius: '8px',
                border: '1px solid rgba(236,185,87,0.25)',
                color: '#fff3de',
                fontSize: '16px',
                lineHeight: 1.8,
                whiteSpace: 'pre-wrap',
                fontStyle: 'italic',
              }}>
                {displayedText || currentSegment.fullContent}
              </div>
            )}

            {/* 对话显示 - 区分单人/双人 */}
            {(currentSegment.type === 'single_speaker' || currentSegment.type === 'dual_speaker') && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}>
                {/* 说话人头像区 */}
                {currentSegment.speakers.length > 0 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: currentSegment.speakers.length === 1 ? 'flex-start' : 'center',
                    gap: currentSegment.speakers.length === 1 ? '0' : '48px',
                    marginBottom: '16px',
                  }}>
                    {/* 获取所有说话人（去重） */}
                    {Array.from(new Set(currentSegment.speakers)).map((speaker, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                      }}>
                        {SPEAKER_TO_IMAGE[speaker] ? (
                          <img
                            src={asset(SPEAKER_TO_IMAGE[speaker])}
                            alt={speaker}
                            style={{
                              width: currentSegment.speakers.length === 1 ? '240px' : '120px',
                              height: currentSegment.speakers.length === 1 ? '360px' : '180px',
                              borderRadius: currentSegment.speakers.length === 1 ? '2px' : '8px',
                              border: '3px solid #d4a520',
                              objectFit: 'cover',
                              background: 'rgba(58,13,10,0.8)',
                              boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
                            }}
                          />
                        ) : (
                          <div style={{
                            width: currentSegment.speakers.length === 1 ? '240px' : '120px',
                            height: currentSegment.speakers.length === 1 ? '360px' : '180px',
                            borderRadius: currentSegment.speakers.length === 1 ? '2px' : '8px',
                            border: '3px solid #d4a520',
                            background: 'rgba(58,13,10,0.8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#f5e6b8',
                            fontSize: '14px',
                            boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
                          }}>
                            <span style={{ writingMode: 'vertical-rl' }}>{speaker}</span>
                          </div>
                        )}
                        <div style={{
                          color: '#f5e6b8',
                          fontSize: '14px',
                          fontWeight: 700,
                        }}>
                          {speaker}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 对话内容区 - 打字机效果，使用双引号 */}
                <div style={{
                  background: 'rgba(245,230,184,0.95)',
                  borderRadius: '4px',
                  border: '2px solid #d4a520',
                  padding: '28px 32px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.8,
                }}>
                  {/* 如果打字未完成，显示打字机效果的文本 */}
                  {!segmentTypingComplete ? (
                    <span style={{
                      color: '#2a0e0a',
                      fontSize: '19px',
                      fontWeight: 500,
                    }}>
                      {displayedText}
                    </span>
                  ) : (
                    /* 打字完成后，显示格式化的对话内容（带说话人） */
                    currentSegment.contents.map((content, i) => (
                      <div key={i} style={{
                        marginBottom: i < currentSegment.contents.length - 1 ? '20px' : 0,
                      }}>
                        <span style={{
                          color: '#8b2e2e',
                          fontWeight: 900,
                          fontSize: '18px',
                          borderBottom: '1px solid rgba(139,46,46,0.2)',
                          paddingBottom: '4px',
                          marginRight: '8px',
                        }}>
                          {currentSegment.speakers[i]}：
                        </span>
                        <span style={{
                          color: '#2a0e0a',
                          fontSize: '19px',
                          lineHeight: 1.8,
                          fontWeight: 500,
                        }}>
                          "{content}"
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 主角思考 - 打字机效果 */}
            {currentSegment.type === 'inner_thought' && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
              }}>
                {/* 思考图标 */}
                <div style={{
                  fontSize: '48px',
                  color: 'rgba(212,165,32,0.6)',
                }}>
                  💭
                </div>

                {/* 主角头像（偏小） */}
                <img
                  src={asset(INNER_THOUGHT_AVATAR)}
                  alt="我"
                  style={{
                    width: '100px',
                    height: '150px',
                    borderRadius: '8px',
                    border: '2px solid rgba(212,165,32,0.5)',
                    objectFit: 'cover',
                    background: 'rgba(48,18,10,0.55)',
                  }}
                  onError={(e) => {
                    // 如果思考头像不存在，使用普通头像
                    e.currentTarget.src = asset('assets/story/chars/player.png');
                  }}
                />

                {/* 思考框 - 打字机效果 */}
                <div style={{
                  padding: '20px 32px',
                  background: 'rgba(212,165,32,0.08)',
                  border: '1px solid rgba(212,165,32,0.3)',
                  borderRadius: '12px',
                  color: '#d4a520',
                  fontSize: '17px',
                  lineHeight: 1.8,
                  fontStyle: 'italic',
                  whiteSpace: 'pre-wrap',
                  maxWidth: '80%',
                  textAlign: 'center',
                }}>
                  ({displayedText || currentSegment.fullContent})
                </div>
              </div>
            )}

            {/* 继续提示 - 非最后一段 */}
            {segmentTypingComplete && !isLastSegment && (
              <div style={{
                textAlign: 'center',
                marginTop: '24px',
                color: '#f1c56a',
                fontSize: '14px',
              }}>
                ▼ 点击继续
              </div>
            )}

            {/* 最后一段无选项时 - 显示进入下一场景提示 */}
            {segmentTypingComplete && isLastSegment && !hasChoices && currentNode?.nextNode && (
              <div style={{
                textAlign: 'center',
                marginTop: '24px',
                color: '#f1c56a',
                fontSize: '14px',
              }}>
                ▼ 点击进入下一场景
              </div>
            )}

            {/* 最后一段显示选项 */}
            {isLastSegment && hasChoices && segmentTypingComplete && (
              <div
                style={{
                  width: '100%',
                  maxWidth: '720px',
                  marginTop: '16px',
                  animation: 'fadeIn 0.3s ease',
                  padding: '16px 0',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {currentNode?.choices?.map((choice, index) => (
                  <button
                    key={choice.id}
                    style={{
                      ...STORY_STYLES.choiceButton,
                      ...(isHoveredChoice === index ? STORY_STYLES.choiceButtonHover : {}),
                    }}
                    onClick={() => handleChoice(choice)}
                    onMouseEnter={() => setIsHoveredChoice(index)}
                    onMouseLeave={() => setIsHoveredChoice(null)}
                  >
                    <span style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'rgba(236,185,87,0.18)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      flexShrink: 0,
                    }}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span>{choice.text}</span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* 无分段时显示完整内容 */}
        {!currentSegment && currentNode?.content && (
          <div style={STORY_STYLES.sceneDescription}>
            {displayedText}
          </div>
        )}
      </div>

      {/* Relationship Bar */}
      <div style={STORY_STYLES.relationshipBar}>
        {visibleFactions.map((faction) => (
          <div key={faction} style={STORY_STYLES.factionBadge}>
            <div style={STORY_STYLES.factionName}>
              {FACTION_NAMES[faction] || faction}
            </div>
            <div style={STORY_STYLES.reputationBar}>
              <div
                style={{
                  width: `${getReputation(faction)}%`,

                  height: '100%',
                  background: FACTION_COLORS[faction] || '#d7a24d',
                  borderRadius: '2px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 存档/读档弹窗 */}
      <SaveLoadModal
        mode="save"
        open={showSaveModal}
        slots={engine.getSaveSlots()}
        onSave={handleSave}
        onLoad={handleLoad}
        onClose={() => setShowSaveModal(false)}
      />

      {/* 存档反馈 Toast */}
      {saveFeedback.show && (
        <div
          style={{
            position: 'fixed',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '12px 24px',
            borderRadius: '8px',
            background: saveFeedback.success
              ? 'rgba(90,201,114,0.9)'
              : 'rgba(180,60,60,0.9)',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 600,
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            animation: 'fadeInUp 0.3s ease',
          }}
        >
          {saveFeedback.success ? '✓ ' : '✗ '}
          {saveFeedback.message}
        </div>
      )}

      {/* Toast 动画 */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}