# 社区模块规格说明

状态：重写版 v2
创建日期：2026-04-08
适用范围：`思筹之录` 当前前端主链路与后续社区功能实现

## 1. 文档目的
- 把“社区模块”从泛化的策划提案，收敛成一份能指导后续实现的规格说明。
- 明确这个功能在当前仓库里应该怎样接入，而不是单独漂在主流程之外。
- 为后续 UI、数据、交互、存储、审核和扩展提供统一口径。

## 2. 设计结论

### 2.1 模块定位
- 社区模块是大厅层的内容与互动扩展，不是当前版本的主玩法入口。
- 它服务于四件事：
  - 玩家交流卡组、论场、门派理解
  - 分享对局经历与剧情体验
  - 承接新手提问与答疑
  - 扩展“百家争鸣”主题下的文化内容表达

### 2.2 MVP 架构选择
- 社区模块在 MVP 阶段应优先作为 `MainMenu` 层的扩展入口接入。
- 入口形式应复用当前大厅右上角圆形功能按钮风格。
- 打开方式应优先复用现有 `SystemModal` / overlay 模式，而不是立即扩展为新的主屏幕状态链路。

原因：
- 当前 `App.tsx` 主链路仍以 `menu -> transition -> battle_setup -> pre_battle -> battle` 为核心。
- 当前 `MainMenu.tsx` 已经有成熟的顶部快捷入口和多种弹层模式。
- 以 modal 形态落地，能显著降低集成成本，也更适合社区功能“轻进入、轻退出”的使用频率。

### 2.3 非目标
- 本阶段不做真实联网社区。
- 本阶段不做用户私信。
- 本阶段不做跨设备同步。
- 本阶段不做复杂推荐算法。
- 本阶段不做独立客户端级通知中心。

## 3. 与当前仓库的对齐要求

### 3.1 主链路对齐
- 当前主入口参考：`src/App.tsx`
- 当前大厅交互参考：`src/components/MainMenu.tsx`
- 社区模块不得破坏现有默认可玩链路。
- 若后续需要将社区提升为独立 screen，必须在后续任务中重新评估，再决定是否修改 `LegacyScreen`。

### 3.2 现有弹层体系对齐
- 社区模块的首版容器建议命名为 `CommunityModal`，但交互层级应与现有 `SystemModal` 保持一致。
- 首版不建议直接做“覆盖整个 App 的全新导航系统”，而应保持：
  - 打开即进入社区首页
  - 关闭后无状态污染地回到大厅
  - 不打断当前音频、亮度、设置等大厅级状态

### 3.3 存储方式对齐
- 当前仓库已经存在本地持久化模式：
  - `src/utils/persistence.ts`
  - `src/components/MainMenu.tsx` 内部本地状态存储
- 社区模块 MVP 应采用 local-first 存储。
- 需要单独的社区命名空间，避免和玩家进度、主菜单状态混用。

建议键名：
- `jixia.community.v1.state`
- `jixia.community.v1.meta`

## 4. 用户价值与使用场景

### 4.1 核心用户故事
1. 作为玩家，我想快速查看别人分享的卡组、论场和对局心得。
2. 作为新手，我想提出问题，并看到已解决的答疑内容。
3. 作为内容型玩家，我想发布长文、截图和文化向内容。
4. 作为收藏型玩家，我想收藏有价值的帖子，后续再看。

### 4.2 MVP 使用路径
1. 玩家在大厅点击社区入口。
2. 弹出社区首页，默认进入推荐流或最新流。
3. 玩家浏览帖子列表。
4. 玩家可进入详情、点赞、收藏、评论。
5. 玩家可发布新帖或保存草稿。
6. 玩家关闭弹层后回到大厅。

## 5. 信息架构

### 5.1 一级板块
- `论道`
  - 讨论卡组、门派、议题、论场和战术。
- `战报`
  - 分享高光对局、翻盘记录、剧情体验。
- `问答`
  - 新手提问、规则解释、玩法答疑。
- `文苑`
  - 分享与诸子百家、历史典故、文化主题相关的内容。

### 5.2 二级页面
- 社区首页
- 帖子详情
- 发帖页
- 搜索/筛选结果页
- 我的收藏
- 我的帖子
- 草稿箱

### 5.3 MVP 不拆出的页面
- 独立用户主页
- 独立关注流
- 独立消息页

这些保留为后续增强项，不在首版强行展开。

## 6. 功能范围

### 6.1 必做功能
- 板块切换
- 帖子列表浏览
- 帖子详情浏览
- 发帖
- 评论
- 点赞
- 收藏
- 搜索
- 标签筛选
- 草稿保存
- 本地审核状态展示

### 6.2 可选增强
- 置顶
- 精华
- 已解决问答标记
- 举报
- 我的互动统计

### 6.3 后续扩展
- 后端同步
- 内容推荐
- 用户关注
- 运营活动专题
- 官方公告与活动联动

## 7. 交互规范

### 7.1 入口
- 位置：大厅右上角快捷功能区，与当前事件、任务、邮件、设置一组。
- 样式：延续现有圆形按钮语言，不单独造一套完全不同的视觉系统。
- 状态：
  - 默认态
  - 有新内容态
  - 有草稿未发布态

### 7.2 首页布局
- 顶部：
  - 标题
  - 搜索入口
  - 发布按钮
  - 关闭按钮
- 左侧或顶部：
  - 板块切换
  - 标签快捷筛选
- 主内容区：
  - 帖子列表
- 次要入口：
  - 我的帖子
  - 我的收藏
  - 草稿箱

### 7.3 帖子卡片
每张卡片至少包含：
- 标题
- 作者
- 发布时间
- 板块
- 标签
- 摘要
- 点赞数
- 评论数
- 收藏数
- 审核状态

### 7.4 发帖流程
1. 选择板块
2. 填写标题
3. 填写正文
4. 选择标签
5. 可选上传图片
6. 预览
7. 提交或保存草稿

### 7.5 问答板块特有交互
- 问答帖可以标记为：
  - `open`
  - `answered`
  - `resolved`
- 仅问答板块支持“采纳答案”。
- 采纳后应在列表和详情中有明显标识。

## 8. 内容规范与审核

### 8.1 内容类型
- 纯文本贴
- 图文贴
- 问答贴
- 文化长文

### 8.2 内容限制建议
- 标题：6 到 50 字
- 正文：10 到 5000 字
- 标签：0 到 5 个
- 图片：0 到 6 张

### 8.3 审核状态
- `draft`
- `pending`
- `approved`
- `rejected`
- `hidden`
- `deleted`

### 8.4 MVP 审核策略
- 本地敏感词过滤
- 本地长度校验
- 发布频率限制
- 被拦截内容给出明确原因

说明：
- 由于 MVP 阶段没有真实服务端审核，这里的“待审核”更多是本地规则过滤与状态标记，不应伪装成真实人工审核系统。

## 9. 数据模型

### 9.1 枚举定义
```ts
type CommunityCategory = 'discussion' | 'battle_report' | 'qa' | 'culture';
type CommunityQaState = 'open' | 'answered' | 'resolved';

type CommunityPostStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'hidden'
  | 'deleted';

type CommunitySortMode = 'latest' | 'hot' | 'featured' | 'most_favorited';
```

### 9.2 帖子结构
```ts
interface CommunityPost {
  id: string;
  category: CommunityCategory;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  imageUrls: string[];
  authorId: string;
  authorName: string;
  authorFaction?: string;
  createdAt: number;
  updatedAt: number;
  publishedAt: number | null;
  status: CommunityPostStatus;
  isPinned: boolean;
  isFeatured: boolean;
  likeCount: number;
  commentCount: number;
  favoriteCount: number;
  viewCount: number;
  qaState?: CommunityQaState;
  acceptedCommentId?: string | null;
}
```

### 9.3 评论结构
```ts
interface CommunityComment {
  id: string;
  postId: string;
  parentId: string | null;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  status: 'normal' | 'hidden' | 'deleted';
  likeCount: number;
}
```

### 9.4 用户本地交互结构
```ts
interface CommunityUserInteraction {
  likedPostIds: string[];
  favoritedPostIds: string[];
  likedCommentIds: string[];
  viewedPostIds: string[];
}
```

### 9.5 持久化根结构
```ts
interface CommunityPersistedState {
  version: 1;
  userPosts: CommunityPost[];
  commentsByPostId: Record<string, CommunityComment[]>;
  drafts: CommunityDraft[];
  interactions: CommunityUserInteraction;
  meta: {
    lastEnteredAt: number | null;
    unreadRecommendedCount: number;
    hasDraft: boolean;
  };
  uiSnapshot?: {
    category: CommunityCategory | 'all';
    sortMode: CommunitySortMode;
    searchQuery: string;
    selectedTags: string[];
  };
}
```

### 9.6 草稿结构
```ts
interface CommunityDraft {
  id: string;
  category: CommunityCategory;
  title: string;
  content: string;
  tags: string[];
  imageUrls: string[];
  summary: string;
  updatedAt: number;
  sourcePostId?: string | null;
}
```

### 9.7 运行时状态结构
```ts
interface CommunityRuntimeState {
  seedPosts: CommunityPost[];
  userPosts: CommunityPost[];
  drafts: CommunityDraft[];
  commentsByPostId: Record<string, CommunityComment[]>;
  interactions: CommunityUserInteraction;
  meta: CommunityPersistedState['meta'];
}
```

说明：
- `seedPosts` 应来自 `src/community/mockData.ts` 的只读内置内容，不写回 localStorage。
- localStorage 只保存用户增量数据、草稿、评论与交互记录，避免把种子内容重复写入存储。

## 10. 本地存储策略

### 10.1 MVP 原则
- 只存当前设备数据。
- 不保证跨设备一致。
- 不保证卸载后恢复。
- 必须考虑 localStorage 容量约束。

### 10.2 建议策略
- 帖子数限制：
  - 本地保留最近 200 条帖子
- 草稿数限制：
  - 最多保留 20 条草稿
- 图片处理：
  - MVP 不建议直接把大图 base64 长期写入 localStorage
  - 若需要图片，优先保存资源引用、缩略信息或临时 URL
- 种子帖子处理：
  - 内置示例帖、官方演示帖、问答样例帖应由代码侧提供
  - 不应在首次进入时把整包示例帖复制进 localStorage
  - 选择器层负责把 `seedPosts + userPosts` 合并成最终列表

### 10.3 存储封装
- 不建议把 localStorage 读写散落在多个组件中。
- 应增加独立的社区存储封装层，例如：
  - `src/community/storage.ts`
  - 或 `src/utils/communityPersistence.ts`

## 11. 仓库内推荐实现结构
```text
src/
├─ components/
│  └─ community/
│     ├─ CommunityModal.tsx
│     ├─ CommunityHome.tsx
│     ├─ CommunityCategoryTabs.tsx
│     ├─ CommunityPostList.tsx
│     ├─ CommunityPostCard.tsx
│     ├─ CommunityPostDetail.tsx
│     ├─ CommunityComposer.tsx
│     └─ CommunityCommentSection.tsx
├─ community/
│  ├─ types.ts
│  ├─ mockData.ts
│  ├─ storage.ts
│  ├─ selectors.ts
│  └─ moderation.ts
└─ hooks/
   └─ useCommunityState.ts
```

说明：
- 这里故意避免把社区状态塞进现有不稳定的旧 `src/app/*` 链路。
- 社区模块首版应做自包含结构，降低对主链的侵入风险。

## 12. 与现有代码的集成建议

### 12.1 `App.tsx`
- MVP 不强制新增 `community` screen。
- 社区功能优先在 `MainMenu` 内部用 modal 打开。
- 只有当后续内容深度明显增长时，再评估是否提升为独立 screen。

### 12.2 `MainMenu.tsx`
- 在顶部快捷功能区新增社区入口按钮。
- 延续现有：
  - hover 音效
  - 红点提醒
  - backdrop blur
  - modal 弹出层

### 12.3 `SystemModal`
- 社区容器应优先复用或轻扩展 `SystemModal` 的弹层行为。
- 如果内容复杂到需要更宽布局，可以做 `CommunityModal`，但体验上仍要和当前弹层家族一致。

## 13. 排序与发现机制

### 13.1 MVP 排序
- 最新
- 最热
- 精华
- 收藏最多

### 13.2 热度计算建议
```ts
hotScore =
  likeCount * 1 +
  commentCount * 2 +
  favoriteCount * 3 +
  viewCount * 0.05;
```

说明：
- 这是本地模拟排序口径，不是最终线上推荐算法。
- 首版只需要稳定、可解释，不需要复杂。

## 14. 响应式要求

### 14.1 桌面端
- 双栏或三栏布局可接受
- 详情面板可左右切换

### 14.2 平板端
- 以单栏为主
- 分类切换改为横向 tab

### 14.3 移动端
- 全屏 modal
- 底部固定主操作按钮
- 发布器改为分步填写，避免一次性塞满表单

## 15. 分阶段实施建议

### Phase 1：社区 MVP
- 社区入口按钮
- 社区首页
- 板块切换
- 帖子列表
- 帖子详情
- 点赞、收藏、评论
- 发帖与草稿
- 本地存储

### Phase 2：可用性增强
- 搜索与标签筛选
- 我的帖子
- 我的收藏
- 问答采纳
- 精华与置顶
- 举报入口

### Phase 3：运营与联动
- 活动专题
- 官方公告流
- 剧情/卡牌/门派联动推荐
- 后端同步准备

## 16. 验收标准

### 16.1 功能验收
- 玩家能从大厅进入社区并返回大厅。
- 玩家能浏览四个板块的帖子列表。
- 玩家能创建、保存、编辑、发布草稿。
- 玩家能进行点赞、收藏、评论。
- 问答贴支持“已解决”状态展示。

### 16.2 体验验收
- 打开社区不影响当前大厅主链逻辑。
- 关闭社区后不会丢失大厅状态。
- 列表在 100 条本地帖子规模下仍可流畅滚动。
- 空状态、错误状态、审核拦截状态都有明确反馈。

### 16.3 架构验收
- 不侵入 battleV2 主逻辑。
- 不要求后端存在才能本地跑通。
- 本地存储结构可迁移、可版本化。

## 17. 风险与对策

| 风险 | 说明 | 对策 |
|---|---|---|
| 文档写得大而全，实际很难落地 | 需求膨胀 | 严格按 Phase 1 / 2 / 3 拆分 |
| localStorage 空间不足 | 图文内容过大 | 控制数量、限制图片策略、避免大图 base64 |
| 与当前大厅结构冲突 | 入口和弹层层级混乱 | 首版坚持 MainMenu modal 方案 |
| 内容质量失控 | 垃圾内容或测试噪声多 | 本地规则校验 + 举报 + 精华筛选 |
| 后续迁移成本高 | 本地数据与线上结构差异过大 | 提前固定最小数据契约和版本号 |

## 18. 当前版本相较旧稿的主要修正
- 删除了过度细节化但难落地的 ASCII 布局和大段视觉代码示意。
- 把“社区是新 screen”收敛为“社区先是大厅 modal 扩展”。
- 补充了非目标，避免社区一期范围失控。
- 补充了可实施的数据结构、审核状态、草稿策略和存储边界。
- 补充了与 `App.tsx`、`MainMenu.tsx`、本地持久化工具的实际对齐要求。
- 把后续开发拆成三个清晰阶段，降低一次性实现风险。

## 19. 实施级状态模型

### 19.1 视图状态建议
```ts
type CommunityView =
  | 'home'
  | 'detail'
  | 'composer'
  | 'drafts'
  | 'my_posts'
  | 'favorites'
  | 'search';

type CommunityComposerMode = 'create' | 'edit_draft' | 'edit_post';

interface CommunityUiState {
  view: CommunityView;
  selectedCategory: CommunityCategory | 'all';
  sortMode: CommunitySortMode;
  selectedPostId: string | null;
  activeDraftId: string | null;
  composerMode: CommunityComposerMode;
  searchQuery: string;
  selectedTags: string[];
}
```

### 19.2 视图流转规则
- `MainMenu` 点击社区按钮后，只负责把 `activeModal` 切到 `community`。
- `CommunityModal` 打开后，默认进入 `home`。
- `home` 可以进入：
  - `detail`
  - `composer`
  - `drafts`
  - `my_posts`
  - `favorites`
  - `search`
- `drafts` 进入 `composer` 时，`composerMode = 'edit_draft'`。
- `my_posts` 进入 `composer` 时，仅允许编辑当前作者自己的帖子，`composerMode = 'edit_post'`。
- `detail` 返回时，应回到进入前的列表语境，而不是重置到默认分类。

### 19.3 关闭与恢复策略
- 关闭社区时保留：
  - `selectedCategory`
  - `sortMode`
  - `searchQuery`
  - `selectedTags`
- 关闭社区时清空：
  - `selectedPostId`
  - `activeDraftId`
  - `composerMode`
- 若发布器存在未提交内容，应先触发自动保存草稿，再允许关闭。
- `meta.lastEnteredAt` 应在每次成功打开社区首页时更新。
- `MainMenu` 红点只读 `meta.unreadRecommendedCount` 与 `meta.hasDraft` 的组合结果，不直接知道社区内部列表细节。

## 20. 状态归属与职责边界

### 20.1 模块归属
| 层级 / 文件 | 负责内容 | 不负责内容 |
|---|---|---|
| `src/components/MainMenu.tsx` | 入口按钮、红点、打开/关闭社区 modal | 社区内部列表、帖子编辑、排序逻辑 |
| `src/components/community/CommunityModal.tsx` | 社区容器、顶部导航、视图切换、关闭行为 | 直接读写 localStorage |
| `src/hooks/useCommunityState.ts` | 统一状态源、动作分发、界面所需的只读派生数据 | 复杂 UI 排版 |
| `src/community/storage.ts` | 加载、保存、迁移、异常恢复 | React 组件状态 |
| `src/community/selectors.ts` | 排序、筛选、列表合并、统计派生 | 副作用写入 |
| `src/community/moderation.ts` | 输入校验、敏感词、频率限制、错误原因 | UI 呈现 |
| `src/community/mockData.ts` | 内置示例帖与问答样例 | 用户运行时可变状态 |

### 20.2 推荐 Hook 形态
```ts
interface UseCommunityStateResult {
  ui: CommunityUiState;
  runtime: CommunityRuntimeState;
  visiblePosts: CommunityPost[];
  selectedPost: CommunityPost | null;
  actions: {
    openHome(): void;
    openPost(postId: string): void;
    openComposer(mode?: CommunityComposerMode, draftId?: string | null): void;
    closeCommunity(): void;
    saveDraft(input: CommunityDraft): string;
    publishDraft(draftId: string): string;
    togglePostLike(postId: string): void;
    togglePostFavorite(postId: string): void;
    addComment(postId: string, content: string, parentId?: string | null): string;
    acceptAnswer(postId: string, commentId: string): void;
    markViewed(postId: string): void;
  };
}
```

说明：
- 其他 AI 实现时，优先把动作收敛在 hook 或 domain action 层，不要把 `setState` 分散到每个组件里。
- `selectors.ts` 应保持纯函数，避免在排序或筛选时顺手修改原数组。

## 21. 核心操作契约

### 21.1 必备动作
| 动作 | 输入 | 输出 | 关键副作用 |
|---|---|---|---|
| `loadBootstrap` | 无 | `CommunityRuntimeState` | 合并 `mockData` 与持久化增量，处理版本迁移 |
| `saveDraft` | 草稿内容 | `draftId` | 更新 `meta.hasDraft`，刷新 `updatedAt` |
| `publishDraft` | `draftId` | `postId` | 从草稿转成帖子，移除草稿，刷新列表 |
| `createPost` | 发帖输入 | `postId` | 生成帖子、挂审核状态、写回持久化 |
| `updatePost` | `postId + patch` | `void` | 仅允许当前作者编辑自己的帖子 |
| `togglePostLike` | `postId` | `void` | 同步 `interactions.likedPostIds` 与 `likeCount` |
| `togglePostFavorite` | `postId` | `void` | 同步 `interactions.favoritedPostIds` 与 `favoriteCount` |
| `addComment` | `postId + content + parentId?` | `commentId` | 增加评论、回写 `commentCount` |
| `acceptAnswer` | `postId + commentId` | `void` | 仅问答帖可用，设置 `acceptedCommentId` 与 `qaState` |
| `markViewed` | `postId` | `void` | 累积浏览数据，更新未读计数来源 |

### 21.2 行为规则
- 点赞和收藏必须是可逆操作，不允许重复累加。
- 评论删除若仅做 MVP，可先实现为 `hidden/deleted` 状态，不强制物理删除。
- `acceptAnswer` 只能作用于 `category === 'qa'` 的帖子。
- `publishDraft` 前必须先通过 `moderation.ts` 的长度和敏感词校验。
- `seedPosts` 默认只读，其他 AI 不应在运行时直接改写 `mockData.ts` 中的对象引用。

## 22. 代码落地拆分建议

### 22.1 文件级拆分
1. Domain / 数据层
   - `src/community/types.ts`
   - `src/community/mockData.ts`
   - `src/community/storage.ts`
   - `src/community/selectors.ts`
   - `src/community/moderation.ts`
   - `src/hooks/useCommunityState.ts`
2. 容器 / 集成层
   - `src/components/MainMenu.tsx`
   - `src/components/community/CommunityModal.tsx`
   - `src/components/community/CommunityHome.tsx`
3. 视图 / 内容层
   - `src/components/community/CommunityCategoryTabs.tsx`
   - `src/components/community/CommunityPostList.tsx`
   - `src/components/community/CommunityPostCard.tsx`
   - `src/components/community/CommunityPostDetail.tsx`
   - `src/components/community/CommunityComposer.tsx`
   - `src/components/community/CommunityCommentSection.tsx`

### 22.2 推荐实施顺序
1. 先完成 `types + mockData + storage + selectors + moderation`，把数据底座定住。
2. 再完成 `useCommunityState.ts`，把“可供 UI 调用的状态和动作”收口。
3. 然后接 `CommunityModal` 和 `MainMenu` 入口，确认打开/关闭链路。
4. 最后再接帖子列表、详情、评论、发帖器等视图组件。

### 22.3 多 AI 并行时的写入边界
- AI-1 负责数据底座：
  - `src/community/*`
  - `src/hooks/useCommunityState.ts`
- AI-2 负责入口和容器：
  - `src/components/MainMenu.tsx`
  - `src/components/community/CommunityModal.tsx`
  - `src/components/community/CommunityHome.tsx`
- AI-3 负责内容视图：
  - `src/components/community/CommunityPostList.tsx`
  - `src/components/community/CommunityPostCard.tsx`
  - `src/components/community/CommunityPostDetail.tsx`
  - `src/components/community/CommunityComposer.tsx`
  - `src/components/community/CommunityCommentSection.tsx`

说明：
- 其他 AI 若要并行开工，应尽量遵守以上写集划分，避免都去改 `MainMenu.tsx` 和 hook 主状态文件。
- 集成人员最后统一处理组件拼装与轻量样式修正。

## 23. 对其他 AI 的验证清单

### 23.1 交互链路
- 从大厅点击社区入口可以正常打开 modal。
- 从社区任意二级视图关闭后，能稳定回到大厅，不留下无法点击的遮罩层。
- 发布器关闭时，脏内容会进入草稿箱，不会直接丢失。

### 23.2 数据正确性
- localStorage 为空时可正常初始化。
- localStorage 损坏 JSON 时可自动回退到默认状态。
- `seedPosts + userPosts` 合并后，排序和筛选结果稳定。
- 点赞、收藏来回切换不会出现计数漂移。
- 采纳答案后，问答帖状态会从 `open/answered` 正确进入 `resolved`。

### 23.3 体验与性能
- 100 条帖子列表下滚动和切换筛选仍可接受。
- 空列表、无搜索结果、审核拦截、存储恢复失败都有明确 UI 反馈。
- 社区模块不应影响 `menu -> transition -> battle_setup -> pre_battle -> battle` 现有可玩链路。

## 24. 待确认项与 UNKNOWN

以下问题不阻塞文档继续推进，但会影响后续实现细节。实现时若未先确认，必须按 `UNKNOWN` 处理，不要私自脑补成最终方案。

1. `UNKNOWN`：社区作者名称到底复用当前大厅档案名，还是允许独立社区昵称。
   - 影响：`authorName` 来源、个人帖子列表展示、后续账号体系兼容。
2. `UNKNOWN`：Phase 1 的图片能力是“仅支持内置/引用图片”，还是允许本地文件选择后预览。
   - 影响：`CommunityComposer` 表单结构、存储策略、审核和容量控制。
3. `UNKNOWN`：社区首页的“推荐”在 MVP 中到底是种子策展流，还是 `hot/latest` 的别名。
   - 影响：未读红点、首页默认排序、`meta.unreadRecommendedCount` 的真实含义。

建议：
- 在其他 AI 开工前，优先由主理人把这 3 项定掉。
- 如果暂时不定，先以最保守实现推进：
  - 作者名先复用大厅档案名
  - 图片先只支持引用或内置资源
  - 首页默认先走 `latest`
