# 稷下 2.0 UI 视觉系统与交互 Prompt 规范 (V9 矿物华彩版)

- 文档版本：v2.0-Alpha
- 设计宗旨：将 UI 交互从“功能组件”升格为“雅谈礼器”，与 V9 卡牌原画实现像素级审美对齐。

## 🎨 1. 色彩与材质规范 (Mineral Palette)

| 材质/色彩 | 雅称 | HEX 建议 | 应用场景 |
|---|---|---|---|
| Aged Ivory | **绢本白** | `#f6e4c3` | 主要文字、高级按钮文本、浅色底图 |
| Lapis Lazuli | **石青** | `#1e3a5f` | 胜利按钮背景、正面逻辑高亮、核心饰边 |
| Malachite | **石绿** | `#064e3b` | 确认/继续按钮、进度条、生机类反馈 |
| Cinnabar | **朱砂** | `#831843` | 负面反馈、失败标题、警示类装饰 |
| Polished Jade | **润玉** | `#e7e1f0` | 次级按钮、轻量级面板、半透明遮罩 |

---

## ✍️ 2. 指令词库 (Button Prompt Library)

### 2.1 核心决策类 (Major Decision)
- **应用场景**：开始对战 (Match Start)、锁定门派 (Lock Faction)、提交立论 (Submit)。
- **Prompt**:
  > `High-end Game UI Button, Rounded rectangle with intricate silk-woven pattern borders. Material: Deep polished Bronze with Turquoise mineral inlay. Center text "宣篇" or "定谳" in gold-embossed scholarly calligraphy. Elegant gold-leaf filigree edges. Soft ambient golden glow. Top-down view, 8k, cinematic lighting, isolated on transparent background.`

### 2.2 功能撤回类 (Retract/Cancel)
- **应用场景**：返回 (Back)、取消 (Cancel)、重置 (Reset)。
- **Prompt**:
  > `Game UI Button, leaf-shaped, material: Translucent Mutton-fat White Jade with subtle gray ink-wash veins. Text "辍笔" in thin traditional ink-stroke font. Minimalist silver edges. Zen aesthetic, clear negative space. High-end museum artifact finish, professional photorealism, isolated on transparent background.`

### 2.3 进度/奖励点击 (Claim/Level Up)
- **应用场景**：领取奖励 (Claim)、升级 (Level Up)。
- **Prompt**:
  > `Hexagonal Game UI Medallion, material: Cinnabar lacquer and Gold foil. Rhythmic fire patterns etched on side. Center focal point: Glowing green Malachite gem. Text "承运" (Accept Fate) in thick brush calligraphy. Vibrant mineral pigments. Dramatic masterwork lighting, isolated on transparent background.`

---

## 🛠️ 3. 交互逻辑优化（主动纠错建议）

### 3.1 红点策略 (The 800ms Rule)
- **逻辑**：红点不仅仅是提醒，它是一种“未读之志”。
- **清除逻辑**：
  - 点击卡牌后延迟 `800ms` 清除，给玩家足够的视觉留白。
  - 前端增加 `Codex_Unread_Store` 全局状态，后端增加 `last_read_timestamp` 保证多端对齐。

### 3.2 翻页与反馈
- **动效**：所有翻页交互必须伴随“纸张翻动”音效与“微光扫过”的视觉遮罩。
- **反馈**：按钮点击时，增加“金粉散去”或“墨迹晕染”的微交互（Micro-interaction）。

---

## 📜 4. 待设计/高优先级列表
1. **[NEW] 人物志详情主界面**：设计如古代名帖般的列表布局。
2. **[UPDATE] 结算战报页**：从方块盒子变更为带有印泥质感的卷轴。
3. **[UPDATE] 议题抉择悬浮窗**：将文字改为动态漂浮的“策论旗帜”。
