# 剧情文本分段显示优化方案

## 一、现状问题

### 1.1 当前实现
- 剧情文本（`StoryNode.content`）是一个完整的长文本字段
- UI一次性将所有文本渲染在单一对话框内
- 玩家需要上下滚动才能看完较长段落
- 打字机效果逐字显示，但文本始终在同一容器内

### 1.2 痛点
- **阅读负担重**：长文本（如场景描述、大段对话）需要滚动阅读
- **视觉焦点分散**：无法聚焦当前阅读位置
- **沉浸感打断**：频繁滚动打断阅读节奏
- **手机端体验差**：触屏滚动操作不便

## 二、优化目标

### 2.1 核心目标
将长文本切割为更小的阅读单元，实现：
- **分段渐进式阅读**：一屏一段，点击翻页
- **保持阅读节奏**：无需滚动，焦点集中
- **沉浸式体验**：类似阅读竹简/卷轴的节奏感

### 2.2 次要目标
- 保持打字机效果（可选）
- 支持回看已读段落
- 自动/手动翻页模式

## 三、方案设计

### 方案A：角色对话分段模式（推荐）

#### 核心规则

| 场景 | 显示方式 | 示例 |
|------|---------|------|
| **单人说话** | 单页面，头像+对话框，点击翻页 | 祭酒说一句 → 一页 |
| **双人对话** | 同一页面，双头像+各自对话 | 祭酒和主角对话 → 一页显示两人 |
| **主角思考** | 单页面，主角头像+思考样式（淡色/斜体） | 「我该如何选择...」 |
| **旁白/场景** | 单页面，无头像，场景描述样式 | 【场景】清晨的稷下学宫 |
| **连续对话** | 每人一句一页，轮流显示 | A说 → B说 → A说 |

#### 设计思路

**核心原则：一角色一页面，多角色同页面**

```
单人说话场景：
┌─────────────────────────────────┐
│                                 │
│   [祭酒头像]                    │
│   ┌───────────────────────────┐ │
│   │「今日所论，乃是治国之道。」│ │
│   └───────────────────────────┘ │
│                                 │
│              [点击继续 ▼]       │
└─────────────────────────────────┘

双人对话场景：
┌─────────────────────────────────┐
│                                 │
│  [祭酒头像]    [主角头像]        │
│                                 │
│  祭酒：「你可愿选择一门派？」    │
│                                 │
│  我：「我想先了解各派学说。」    │
│                                 │
│              [点击继续 ▼]       │
└─────────────────────────────────┘

主角思考场景：
┌─────────────────────────────────┐
│                                 │
│   [主角头像]                    │
│   ╔───────────────────────────╗ │
│   ║（内心）这些门派各有特色...║ │
│   ║ 我该如何抉择？            ║ │
│   ╚───────────────────────────╝ │
│      ※ 思考框：淡金色边框       │
│              [点击继续 ▼]       │
└─────────────────────────────────┘

旁白/场景场景：
┌─────────────────────────────────┐
│                                 │
│   ╔═════════════════════════════╗│
│   ║ 【场景】清晨的稷下学宫      ║│
│   ║ 晨雾尚未散去...            ║│
│   ╚═════════════════════════════╝│
│      ※ 无头像，居中显示         │
│              [点击继续 ▼]       │
└─────────────────────────────────┘
```

#### 数据结构变更

```typescript
// 现有结构
interface StoryNode {
  id: string;
  type: 'dialogue' | 'narration' | 'choice';
  content: string; // 单一长文本
  speaker?: string;
  choices?: StoryChoice[];
  nextNode?: string;
}

// 新增：对话分段单元
interface DialogueSegment {
  index: number;
  type: 'single_speaker' | 'dual_speaker' | 'inner_thought' | 'scene' | 'narration';
  speakers: string[];           // 说话人列表（1-2人）
  contents: string[];           // 对应说话人的内容（与speakers一一对应）
  isLast: boolean;
}

// 说话人类型识别
type SpeakerType = 'character' | 'player' | 'inner' | 'narrator';
```

#### 段落切割规则（细化）

| 原文本格式 | 解析结果 | 显示方式 |
|-----------|---------|---------|
| `祭酒：「xxx」` | 单人对话 → 一页 | 祭酒头像 + 对话框 |
| `我：「xxx」` | 单人对话 → 一页 | 主角头像 + 对话框 |
| `(内心)xxx` 或 `（思考）xxx` | 主角思考 → 一页 | 主角头像 + 思考框（特殊样式） |
| `祭酒：「xxx」我：「yyy」` | 双人对话 → 合并一页 | 两人头像 + 各自对话 |
| `【场景】xxx` | 场景描述 → 一页 | 无头像 + 场景框 |
| `旁白文本（无标记）` | 旁白 → 一页 | 无头像 + 淡色文本 |

#### 合页规则

**双人对话合并条件**：
- 紧邻的两句对话来自**不同角色**
- 第二句说完后没有选项/场景切换
- 自动合并为一页显示

```typescript
// 示例：双人对话合并逻辑
// 输入：
"祭酒：「你可愿选择一门派？」\n我：「我想先了解各派学说。」"

// 解析结果：
{
  type: 'dual_speaker',
  speakers: ['祭酒', '我'],
  contents: ['你可愿选择一门派？', '我想先了解各派学说。'],
}

// 显示：一页，双头像，各自对话内容
```

**不合并的情况**：
- 同一人连续说话 → 分两页（体现说话节奏）
- 对话后紧跟场景描述 → 分页（场景需独立显示）
- 对话后有选项 → 分页（选项需单独页面）

#### 核心解析逻辑

```typescript
/**
 * 解析剧情文本为对话分段
 */
function parseDialogueSegments(content: string): DialogueSegment[] {
  const segments: DialogueSegment[] = [];
  
  // 1. 按换行分割原始文本
  const lines = content.split(/\n+/).filter(line => line.trim());
  
  // 2. 解析每行为对话单元
  const units: DialogueUnit[] = lines.map(line => parseLine(line));
  
  // 3. 合并双人对话
  for (let i = 0; i < units.length; i++) {
    const current = units[i];
    const next = units[i + 1];
    
    // 双人对话合并条件
    if (
      current.type === 'dialogue' &&
      next?.type === 'dialogue' &&
      current.speaker !== next.speaker &&
      !next.hasOption && // 下一段不是选项
      !current.isSceneEnd // 当前段不是场景结尾
    ) {
      segments.push({
        type: 'dual_speaker',
        speakers: [current.speaker!, next.speaker!],
        contents: [current.content, next.content],
        isLast: false,
      });
      i++; // 跳过已合并的下一段
    } else {
      segments.push({
        type: getSegmentType(current),
        speakers: current.speaker ? [current.speaker] : [],
        contents: [current.content],
        isLast: false,
      });
    }
  }
  
  // 4. 标记最后一段
  if (segments.length > 0) {
    segments[segments.length - 1].isLast = true;
  }
  
  return segments;
}

/**
 * 解析单行文本
 */
function parseLine(line: string): DialogueUnit {
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
```

#### 说话人头像映射

```typescript
// 说话人 → 头像图片
const SPEAKER_AVATARS: Record<string, string> = {
  '祭酒': 'assets/story/chars/jijiu.png',
  '稷下宫主': 'assets/story/chars/school_master.png',
  '孟舆': 'assets/story/chars/meng_yu.png',
  '我': 'assets/story/chars/player.png',       // 主角默认头像
  '苏秦': 'assets/story/chars/suqin.png',
  '庄周': 'assets/story/chars/zhuangzhou.png',
  // ... 更多角色
};

// 主角思考特殊头像
const INNER_THOUGHT_AVATAR = 'assets/story/chars/player_thinking.png';
```
```

### 方案B：分页模式

#### 设计思路
将文本按固定字数（如150-200字）分页，每页一屏，翻页阅读。

#### 适用场景
- 纯叙述文本（无对话标记）
- 历史文献/书籍阅读界面

#### 不推荐原因
- 可能切断语义完整性
- 需要人工调整分割点
- 不适合对话密集的剧情

### 方案C：对话气泡模式

#### 设计思路
每次只显示一行对话，类似即时通讯界面，逐条弹出。

#### 适用场景
- 纯对话场景
- 多人对话场景

#### 不推荐原因
- 不适合场景描述/旁白
- 破坏传统剧情叙事节奏
- 与现有风格不匹配

## 四、UI组件设计

### 4.1 分段显示组件

```tsx
interface DialogueDisplayProps {
  segment: DialogueSegment;
  isLast: boolean;
  onNext: () => void;
  onShowChoices: () => void;
  choices?: StoryChoice[];
}

function DialogueDisplay({
  segment,
  isLast,
  onNext,
  onShowChoices,
  choices,
}) {
  return (
    <div className="dialogue-page">
      {/* 单人说话 */}
      {segment.type === 'single_speaker' && (
        <SingleSpeakerPage
          speaker={segment.speakers[0]}
          content={segment.contents[0]}
          onContinue={!isLast ? onNext : onShowChoices}
        />
      )}
      
      {/* 双人对话 */}
      {segment.type === 'dual_speaker' && (
        <DualSpeakerPage
          speakers={segment.speakers}
          contents={segment.contents}
          onContinue={!isLast ? onNext : onShowChoices}
        />
      )}
      
      {/* 主角思考 */}
      {segment.type === 'inner_thought' && (
        <InnerThoughtPage
          content={segment.contents[0]}
          onContinue={!isLast ? onNext : onShowChoices}
        />
      )}
      
      {/* 场景/旁白 */}
      {segment.type === 'scene' && (
        <ScenePage
          content={segment.contents[0]}
          onContinue={!isLast ? onNext : onShowChoices}
        />
      )}
      
      {/* 最后一段显示选项 */}
      {isLast && choices && (
        <ChoicesPanel choices={choices} />
      )}
    </div>
  );
}
```

### 4.2 各类型页面样式

#### 单人对话页
```tsx
function SingleSpeakerPage({ speaker, content, onContinue }) {
  const avatar = SPEAKER_AVATARS[speaker] || DEFAULT_AVATAR;
  
  return (
    <div className="single-speaker-page">
      <div className="avatar-container">
        <img src={avatar} alt={speaker} className="avatar" />
        <div className="speaker-name">{speaker}</div>
      </div>
      
      <div className="dialogue-box">
        <div className="dialogue-text">{content}</div>
      </div>
      
      <button className="continue-btn" onClick={onContinue}>
        点击继续 ▼
      </button>
    </div>
  );
}
```

#### 双人对话页
```tsx
function DualSpeakerPage({ speakers, contents, onContinue }) {
  return (
    <div className="dual-speaker-page">
      {/* 双头像并排 */}
      <div className="avatars-row">
        {speakers.map((speaker, i) => (
          <div key={i} className="avatar-mini">
            <img src={SPEAKER_AVATARS[speaker]} alt={speaker} />
            <span>{speaker}</span>
          </div>
        ))}
      </div>
      
      {/* 对话内容垂直排列 */}
      <div className="dialogues-list">
        {speakers.map((speaker, i) => (
          <div key={i} className="dialogue-item">
            <span className="speaker-label">{speaker}：</span>
            <span className="dialogue-content">「{contents[i]}」</span>
          </div>
        ))}
      </div>
      
      <button className="continue-btn" onClick={onContinue}>
        点击继续 ▼
      </button>
    </div>
  );
}
```

#### 主角思考页（特殊样式）
```tsx
function InnerThoughtPage({ content, onContinue }) {
  return (
    <div className="inner-thought-page">
      <div className="thought-container">
        {/* 思考图标 */}
        <div className="thought-icon">💭</div>
        
        {/* 主角头像（偏小） */}
        <img src={INNER_THOUGHT_AVATAR} alt="我" className="avatar-small" />
        
        {/* 思考框：淡金色边框，斜体 */}
        <div className="thought-box" style={{
          border: '1px solid rgba(212,165,32,0.3)',
          background: 'rgba(212,165,32,0.08)',
          fontStyle: 'italic',
          color: '#d4a520',
        }}>
          （{content}）
        </div>
      </div>
      
      <button className="continue-btn" onClick={onContinue}>
        点击继续 ▼
      </button>
    </div>
  );
}
```

#### 场景页
```tsx
function ScenePage({ content, onContinue }) {
  return (
    <div className="scene-page">
      {/* 无头像，居中显示 */}
      <div className="scene-container" style={{
        textAlign: 'center',
        padding: '32px',
        background: 'rgba(48,18,10,0.55)',
        borderLeft: '3px solid #d9a23a',
      }}>
        <div className="scene-text">{content}</div>
      </div>
      
      <button className="continue-btn" onClick={onContinue}>
        点击继续 ▼
      </button>
    </div>
  );
}
```
        isLast: i === splits.length - 1,
      });
    });
  }
  
  // 标记最后一段
  if (paragraphs.length > 0) {
    paragraphs[paragraphs.length - 1].isLast = true;
  }
  
  return paragraphs;
}
```

### 4.2 UI组件设计

```tsx
interface ParagraphDisplayProps {
  paragraphs: StoryParagraph[];
  currentIndex: number;
  onNextParagraph: () => void;
  onComplete: () => void;
  hasChoices: boolean;
  choices?: StoryChoice[];
}

function ParagraphDisplay({
  paragraphs,
  currentIndex,
  onNextParagraph,
  onComplete,
  hasChoices,
  choices,
}) {
  const current = paragraphs[currentIndex];
  const isLastParagraph = currentIndex === paragraphs.length - 1;
  
  return (
    <div className="paragraph-container">
      {/* 段落进度指示 */}
      <div className="paragraph-progress">
        第 {currentIndex + 1} 段 / 共 {paragraphs.length} 段
      </div>
      
      {/* 当前段落内容 */}
      <div className="paragraph-content" style={getParagraphStyle(current.type)}>
        {current.content}
      </div>
      
      {/* 翻页控制 */}
      {!isLastParagraph && (
        <button onClick={onNextParagraph} className="continue-btn">
          继续阅读 ▼
        </button>
      )}
      
      {/* 最后一段：显示选项或继续按钮 */}
      {isLastParagraph && (
        hasChoices ? (
          <ChoicesList choices={choices} />
        ) : (
          <button onClick={onComplete} className="complete-btn">
            进入下一场景 →
          </button>
        )
      )}
    </div>
  );
}
```

### 4.3 视觉样式区分

| 段落类型 | 样式 | 说明 |
|---------|------|------|
| 场景描述 `【】` | 左侧金色边框，深色背景 | 环境描写 |
| 对话 `「」` | 显示头像+说话人，对话气泡风格 | 人物对话 |
| 旁白 `『』` | 居中显示，较小字体 | 作者叙述 |
| 动作描写 | 斜体，淡金色文字 | 角色动作 |
| 普通文本 | 默认样式 | 无标记内容 |

### 4.4 交互流程

```
用户进入剧情节点
    ↓
解析 content 为段落列表
    ↓
显示第1段（打字机效果可选）
    ↓
用户点击"继续"
    ↓
显示第2段
    ↓
...循环...
    ↓
显示最后一段 + 选项（如有）
    ↓
用户做出选择
    ↓
进入下一个 StoryNode
```

### 4.5 回看功能

```tsx
// 段落历史记录
interface ParagraphHistory {
  nodeId: string;
  paragraphs: StoryParagraph[];
  currentIndex: number;
}

// UI：向上滚动可回看已读段落
<div className="paragraph-scroll-area">
  {paragraphs.slice(0, currentIndex + 1).map((p, i) => (
    <div key={i} className={i === currentIndex ? 'current' : 'history'}>
      {p.content}
    </div>
  ))}
</div>
```

## 五、实现计划

### ✅ Phase 1：段落解析核心（已完成）
- 实现 `parseDialogueSegments()` 函数
- 创建 `DialogueSegment` 类型定义
- 解析逻辑支持：单人对话、双人对话合并、主角思考、场景描述、旁白

### ✅ Phase 2：UI组件重构（已完成）
- 重构 `StoryScreen.tsx`，引入分段状态管理
- 实现分段翻页交互逻辑
- 添加段落进度指示器
- 实现各类型分段的不同视觉样式

### Phase 3：视觉优化（待实现）
- 不同段落类型的过渡动画
- 回看已读段落功能
- 细化视觉样式

### Phase 4：打字机效果适配（待实现）
- 分段内打字机效果优化
- 双人对话的逐句显示
- 速度控制适配

### Phase 5：测试与调优（待实现）
- 全章节测试
- 性能优化
- 边界情况处理

## 六、数据迁移

### 6.1 无需修改现有数据
- 段落解析在运行时完成
- 现有 `StoryNode.content` 格式兼容
- 新增标记为可选增强

### 6.2 增强建议
- 剧情编写时可主动使用分割标记
- 建议每段控制在100-200字
- 避免单段过长影响体验

## 七、示例效果

### 现有长文本示例
```
"【场景】清晨的稷下学宫，晨雾尚未散去，学生们陆续来到讲坛前。
祭酒缓缓开口：「今日所论，乃是治国之道。」他的目光扫过在场每一位学子。
「你可愿选择一门派，深入研习？」他问道。
「墨家讲兼爱非攻，法家主张以法治国，道家追求无为而治。」"
```

### 优化后分段显示
```
段落1：【场景】清晨的稷下学宫，晨雾尚未散去，学生们陆续来到讲坛前。
        [点击继续 ▼]

段落2：「今日所论，乃是治国之道。」
        [祭酒头像]
        [点击继续 ▼]

段落3：他的目光扫过在场每一位学子。
        [点击继续 ▼]

段落4：「你可愿选择一门派，深入研习？」
        [祭酒头像]
        [点击继续 ▼]

段落5：「墨家讲兼爱非攻，法家主张以法治国，道家追求无为而治。」
        [祭酒头像]
        
        [选项A] 墨家 - 兼爱非攻
        [选项B] 法家 - 以法治国
        [选项C] 道家 - 无为而治
```

## 八、总结

### 核心收益
- **阅读体验提升**：一屏一段，无需滚动
- **沉浸感增强**：节奏感阅读，类似翻书
- **兼容性好**：运行时解析，无需修改现有数据

### 技术可行
- 改动集中在 `StoryScreen.tsx`
- 引入段落状态管理
- UI逻辑清晰，易于维护

### 建议优先级
- **P0**：段落分段显示核心功能
- **P1**：段落类型视觉区分
- **P2**：回看已读段落
- **P3**：段落内打字机效果（可选）

---

*文档版本：v1.0*
*创建日期：2026-04-17*
*适用项目：稷下学宫·问道百家*