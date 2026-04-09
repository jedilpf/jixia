# 机甲 2.0·V9 雅化视觉并轨白皮书 (Refined Mineral Aesthetic)

## 一、 核心视觉准则 (The Law of Yahua)

### 1. 色彩体系 (The Mineral Palette)
所有新生成的资源必须严格锁定在以下 HSL 范围内，拒绝任何高饱和度的“现代感”：
- **象牙底色 (Ivory)**: `#FDFBF7` (主体纸张)
- **古金 (Ancient Gold)**: `#D4AF65` (高光、装裱、印章)
- **朱砂 (Cinnabar)**: `#8D2F2F` (关键警示、落款)
- **石绿 (Malachite)**: `#3A5F41` (生命恢复、墨家意象)
- **乌金 (Ink Black)**: `#1A1A1A` (骨架、文字、阴影)

### 2. 材质特征 (Material DNA)
- **去矢量化**：拒绝硬边，所有图形边缘必须有微小的毛刺或水渍晕染。
- **岩彩质感**：大面积纯色块必须填充 10% 透明度的矿物粉碎噪点。
- **留白策略**：画面中心主体外，必须保持 40% 以上的绝对留白。

## 二、 模块接入标准

### 1. 简牍系统 (Bamboo Slips - TopicScreenV2)
- **插入形式**：岩彩图腾内嵌在简牍上半部。
- **技术规范**：`mix-blend-mode: multiply`。
- **动态要求**：悬停时，插图应有微弱的“金粉浮动”动效。

### 2. 对话系统 (Historical Scroll - StoryScreen)
- **名士形象**：采用“朱拓”或“墨拓”形式展示，边缘用撕纸效果处理。
- **插画转场**：使用“水墨散开”作为默认转场动画。

## 三、 执行清单 (Action Items)
- [ ] 补全 `IssueDefinition` 的多维视觉属性 (`accentColor`, `maskKey`)。
- [ ] 在 `Card` 组件中增加岩彩重叠滤镜层。
- [ ] 重绘所有已失效的高光玄幻风格插图。
