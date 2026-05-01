# 思筹之录 - 后端产品需求文档（PRD）

> 版本：1.0.0
> 创建日期：2026-04-10
> 文档类型：产品需求文档（PRD）
> 适用范围：全部后端系统设计与实现

---

## 一、文档概述

### 1.1 项目背景

**思筹之录**是一款以战国时期诸子百家为背景的辩论卡牌对战游戏。项目当前已有前端原型和基础后端框架，需要完善后端系统以支撑完整游戏功能。

### 1.2 文档目的

- 定义所有后端模块的功能需求
- 规范API接口设计
- 明确数据模型与存储方案
- 为开发团队提供实施依据

### 1.3 技术栈

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| 运行时 | Node.js | 服务端运行环境 |
| 框架 | Express | Web框架 |
| 实时通信 | Socket.IO | 多人对战通信 |
| 数据库 | SQLite | 轻量级关系型数据库 |
| 认证 | JWT | 用户身份认证 |
| 密码 | bcrypt | 密码哈希 |

---

## 二、系统架构

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        客户端层                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Web端     │  │  Electron端 │  │   移动端    │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        网关层                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   REST API  │  │  WebSocket  │  │   认证中间件 │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        服务层                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ 用户服务 │ │ 匹配服务 │ │ 战斗服务 │ │ 社区服务 │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ 存档服务 │ │ 进度服务 │ │ 卡牌服务 │ │ 奖励服务 │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        数据层                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                    SQLite 数据库                      │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 后端目录结构

```
server/
├── index.cjs              # 服务入口
├── app.cjs                # Express应用配置
├── constants.cjs          # 全局常量
├── config/
│   └── database.cjs       # 数据库配置
├── middleware/
│   ├── auth.cjs           # 认证中间件
│   ├── error-handler.cjs  # 错误处理
│   ├── request-logger.cjs # 请求日志
│   └── rate-limit.cjs     # 请求限流
├── routes/
│   ├── auth.cjs           # 认证路由
│   ├── users.cjs          # 用户路由
│   ├── matches.cjs        # 匹配路由
│   ├── battle.cjs         # 战斗路由
│   ├── story.cjs          # 存档路由
│   ├── progress.cjs       # 进度路由
│   ├── cards.cjs          # 卡牌路由
│   ├── community.cjs      # 社区路由
│   └── health.cjs         # 健康检查
├── services/
│   ├── user.service.cjs   # 用户服务
│   ├── match.service.cjs  # 匹配服务
│   ├── battle.service.cjs # 战斗服务
│   ├── story.service.cjs  # 存档服务
│   ├── card.service.cjs   # 卡牌服务
│   └── community.service.cjs # 社区服务
├── store/
│   ├── user-store.cjs     # 用户存储
│   ├── match-store.cjs    # 匹配存储
│   ├── story-save-store.cjs # 存档存储
│   ├── player-progress-store.cjs # 进度存储
│   └── identity-store.cjs # 身份存储
├── models/
│   ├── user.model.cjs     # 用户模型
│   ├── card.model.cjs     # 卡牌模型
│   ├── match.model.cjs    # 对局模型
│   └── post.model.cjs     # 帖子模型
├── utils/
│   ├── jwt.cjs            # JWT工具
│   ├── password.cjs       # 密码工具
│   ├── validators.cjs     # 验证器
│   └── http-error.cjs     # HTTP错误
├── socket/
│   └── index.cjs          # Socket.IO
└── migrations/
    └── init.sql           # 数据库初始化
```

---

## 三、数据库设计

### 3.1 ER图概述

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    users    │────<│ user_cards  │>────│    cards    │
└─────────────┘     └─────────────┘     └─────────────┘
       │
       │
       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ user_decks  │     │   matches   │────<│ match_logs  │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │
       │                   │
       ▼                   ▼
┌─────────────┐     ┌─────────────┐
│    cards    │     │  progress   │
└─────────────┘     └─────────────┘
       │
       │
       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│story_saves  │     │   posts     │────<│  comments   │
└─────────────┘     └─────────────┘     └─────────────┘
```

### 3.2 核心数据表

#### 3.2.1 用户表（users）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | TEXT | PRIMARY KEY | 用户唯一ID（user_xxx） |
| username | TEXT | UNIQUE, NOT NULL | 用户名（3-32字符） |
| password_hash | TEXT | NOT NULL | bcrypt密码哈希 |
| email | TEXT | UNIQUE | 邮箱（可选） |
| display_name | TEXT | | 显示名称 |
| avatar_url | TEXT | | 头像URL |
| status | TEXT | DEFAULT 'active' | 状态：active/banned/inactive |
| role | TEXT | DEFAULT 'player' | 角色：player/admin/moderator |
| level | INTEGER | DEFAULT 1 | 名士等级 |
| exp | INTEGER | DEFAULT 0 | 经验值 |
| opportunity | INTEGER | DEFAULT 0 | 机遇点数 |
| created_at | TEXT | DEFAULT datetime('now') | 创建时间 |
| updated_at | TEXT | DEFAULT datetime('now') | 更新时间 |
| last_login_at | TEXT | | 最后登录时间 |

#### 3.2.2 卡牌表（cards）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | TEXT | PRIMARY KEY | 卡牌ID |
| name | TEXT | NOT NULL | 卡牌名称 |
| faction | TEXT | NOT NULL | 所属门派 |
| type | TEXT | NOT NULL | 类型：立论/策术/玄章/门客/反诘 |
| rarity | TEXT | NOT NULL | 稀有度：常见/稀有/史诗/传说 |
| tier | INTEGER | NOT NULL | 阶级：1/2/3 |
| cost | INTEGER | NOT NULL | 费用 |
| attack | INTEGER | | 攻击力（门客牌） |
| hp | INTEGER | | 底蕴（门客牌） |
| shield | INTEGER | | 护盾（玄章牌） |
| skill | TEXT | NOT NULL | 技能描述 |
| background | TEXT | | 背景故事 |
| unlock_level | INTEGER | DEFAULT 1 | 解锁等级 |
| is_active | INTEGER | DEFAULT 1 | 是否可用 |

#### 3.2.3 用户卡牌表（user_cards）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | TEXT | PRIMARY KEY | 记录ID |
| user_id | TEXT | NOT NULL, FOREIGN KEY | 用户ID |
| card_id | TEXT | NOT NULL, FOREIGN KEY | 卡牌ID |
| count | INTEGER | DEFAULT 1 | 拥有数量 |
| unlocked_at | TEXT | DEFAULT datetime('now') | 解锁时间 |

#### 3.2.4 用户牌组表（user_decks）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | TEXT | PRIMARY KEY | 牌组ID |
| user_id | TEXT | NOT NULL, FOREIGN KEY | 用户ID |
| name | TEXT | NOT NULL | 牌组名称 |
| faction | TEXT | NOT NULL | 主门派 |
| cards | TEXT | NOT NULL | 卡牌ID列表（JSON数组） |
| is_default | INTEGER | DEFAULT 0 | 是否默认牌组 |
| created_at | TEXT | DEFAULT datetime('now') | 创建时间 |
| updated_at | TEXT | DEFAULT datetime('now') | 更新时间 |

#### 3.2.5 对局表（matches）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | TEXT | PRIMARY KEY | 对局ID |
| player1_id | TEXT | NOT NULL, FOREIGN KEY | 玩家1 ID |
| player2_id | TEXT | | 玩家2 ID（AI为null） |
| player1_faction | TEXT | NOT NULL | 玩家1门派 |
| player2_faction | TEXT | NOT NULL | 玩家2门派 |
| winner_id | TEXT | | 胜利者ID |
| status | TEXT | DEFAULT 'pending' | 状态：pending/playing/finished |
| rounds | INTEGER | DEFAULT 0 | 回合数 |
| final_momentum | TEXT | | 最终大势（JSON） |
| created_at | TEXT | DEFAULT datetime('now') | 创建时间 |
| finished_at | TEXT | | 结束时间 |

#### 3.2.6 对局日志表（match_logs）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | TEXT | PRIMARY KEY | 日志ID |
| match_id | TEXT | NOT NULL, FOREIGN KEY | 对局ID |
| round | INTEGER | NOT NULL | 回合数 |
| phase | TEXT | NOT NULL | 阶段 |
| player_id | TEXT | NOT NULL | 操作玩家 |
| action | TEXT | NOT NULL | 动作类型 |
| data | TEXT | | 动作数据（JSON） |
| created_at | TEXT | DEFAULT datetime('now') | 时间戳 |

#### 3.2.7 玩家进度表（player_progress）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | TEXT | PRIMARY KEY | 记录ID |
| user_id | TEXT | NOT NULL, UNIQUE, FOREIGN KEY | 用户ID |
| level | INTEGER | DEFAULT 1 | 名士等级 |
| exp | INTEGER | DEFAULT 0 | 经验值 |
| win_count | INTEGER | DEFAULT 0 | 胜利场数 |
| total_games | INTEGER | DEFAULT 0 | 总对局数 |
| win_streak | INTEGER | DEFAULT 0 | 连胜数 |
| max_win_streak | INTEGER | DEFAULT 0 | 最高连胜 |
| total_damage | INTEGER | DEFAULT 0 | 总伤害 |
| collected_cards | INTEGER | DEFAULT 0 | 收集卡牌数 |
| opportunity | INTEGER | DEFAULT 0 | 机遇点数 |
| created_at | TEXT | DEFAULT datetime('now') | 创建时间 |
| updated_at | TEXT | DEFAULT datetime('now') | 更新时间 |

#### 3.2.8 争鸣史存档表（story_saves）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | TEXT | PRIMARY KEY | 存档ID |
| user_id | TEXT | NOT NULL, FOREIGN KEY | 用户ID |
| slot_type | TEXT | NOT NULL | 槽位：autosave/manual_1/manual_2/manual_3 |
| version | TEXT | NOT NULL | 存档版本 |
| current_node_id | TEXT | NOT NULL | 当前节点ID |
| chapter | INTEGER | DEFAULT 0 | 章节数 |
| scene | INTEGER | DEFAULT 0 | 场景数 |
| player_stats | TEXT | NOT NULL | 玩家属性（JSON） |
| player_relationships | TEXT | NOT NULL | 关系数据（JSON） |
| player_flags | TEXT | NOT NULL | 标记数据（JSON） |
| history | TEXT | NOT NULL | 历史记录（JSON） |
| visited_nodes | TEXT | | 已访问节点（JSON） |
| bridge_state | TEXT | | 桥接状态（JSON） |
| play_time | INTEGER | DEFAULT 0 | 游戏时长（秒） |
| created_at | TEXT | DEFAULT datetime('now') | 创建时间 |
| updated_at | TEXT | DEFAULT datetime('now') | 更新时间 |

#### 3.2.9 社区帖子表（posts）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | TEXT | PRIMARY KEY | 帖子ID |
| user_id | TEXT | NOT NULL, FOREIGN KEY | 作者ID |
| category | TEXT | NOT NULL | 板块：论道/战报/问答/文苑 |
| title | TEXT | NOT NULL | 标题 |
| content | TEXT | NOT NULL | 正文 |
| tags | TEXT | | 标签（JSON数组） |
| images | TEXT | | 图片URL（JSON数组） |
| status | TEXT | DEFAULT 'active' | 状态：active/hidden/deleted |
| is_pinned | INTEGER | DEFAULT 0 | 是否置顶 |
| is_featured | INTEGER | DEFAULT 0 | 是否精华 |
| view_count | INTEGER | DEFAULT 0 | 浏览数 |
| like_count | INTEGER | DEFAULT 0 | 点赞数 |
| comment_count | INTEGER | DEFAULT 0 | 评论数 |
| collect_count | INTEGER | DEFAULT 0 | 收藏数 |
| qa_status | TEXT | DEFAULT 'open' | 问答状态：open/answered/resolved |
| created_at | TEXT | DEFAULT datetime('now') | 创建时间 |
| updated_at | TEXT | DEFAULT datetime('now') | 更新时间 |

#### 3.2.10 评论表（comments）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | TEXT | PRIMARY KEY | 评论ID |
| post_id | TEXT | NOT NULL, FOREIGN KEY | 帖子ID |
| user_id | TEXT | NOT NULL, FOREIGN KEY | 评论者ID |
| parent_id | TEXT | | 父评论ID（嵌套回复） |
| content | TEXT | NOT NULL | 评论内容 |
| status | TEXT | DEFAULT 'active' | 状态 |
| like_count | INTEGER | DEFAULT 0 | 点赞数 |
| is_answer | INTEGER | DEFAULT 0 | 是否被采纳答案 |
| created_at | TEXT | DEFAULT datetime('now') | 创建时间 |

#### 3.2.11 用户互动表（user_interactions）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | TEXT | PRIMARY KEY | 记录ID |
| user_id | TEXT | NOT NULL, FOREIGN KEY | 用户ID |
| target_type | TEXT | NOT NULL | 目标类型：post/comment |
| target_id | TEXT | NOT NULL | 目标ID |
| interaction_type | TEXT | NOT NULL | 类型：like/collect |
| created_at | TEXT | DEFAULT datetime('now') | 时间戳 |

#### 3.2.12 刷新令牌表（refresh_tokens）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | TEXT | PRIMARY KEY | 令牌ID |
| user_id | TEXT | NOT NULL, FOREIGN KEY | 用户ID |
| token | TEXT | NOT NULL, UNIQUE | 刷新令牌 |
| expires_at | INTEGER | NOT NULL | 过期时间戳 |
| created_at | TEXT | DEFAULT datetime('now') | 创建时间 |
| revoked_at | TEXT | | 撤销时间 |

#### 3.2.13 设备绑定表（device_bindings）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | TEXT | PRIMARY KEY | 记录ID |
| user_id | TEXT | NOT NULL, FOREIGN KEY | 用户ID |
| device_id | TEXT | NOT NULL | 设备ID |
| platform | TEXT | NOT NULL | 平台：web/electron/mobile |
| trusted | INTEGER | DEFAULT 1 | 是否受信任 |
| last_seen_at | TEXT | DEFAULT datetime('now') | 最后活跃 |
| created_at | TEXT | DEFAULT datetime('now') | 创建时间 |

### 3.3 数据库索引设计

#### 3.3.1 索引列表

| 索引名 | 表名 | 字段 | 类型 | 说明 |
|--------|------|------|------|------|
| idx_users_username | users | username | UNIQUE | 用户名唯一索引 |
| idx_users_email | users | email | UNIQUE | 邮箱唯一索引 |
| idx_users_status | users | status | INDEX | 用户状态筛选 |
| idx_user_cards_user_id | user_cards | user_id | INDEX | 用户卡牌查询 |
| idx_user_cards_card_id | user_cards | card_id | INDEX | 卡牌归属查询 |
| idx_user_decks_user_id | user_decks | user_id | INDEX | 用户牌组查询 |
| idx_matches_player1 | matches | player1_id | INDEX | 玩家1对局查询 |
| idx_matches_player2 | matches | player2_id | INDEX | 玩家2对局查询 |
| idx_matches_status | matches | status | INDEX | 对局状态筛选 |
| idx_matches_created | matches | created_at | INDEX | 对局时间排序 |
| idx_match_logs_match | match_logs | match_id | INDEX | 对局日志查询 |
| idx_match_logs_round | match_logs | match_id, round | INDEX | 回合日志查询 |
| idx_player_progress_user | player_progress | user_id | UNIQUE | 用户进度唯一索引 |
| idx_story_saves_user | story_saves | user_id | INDEX | 用户存档查询 |
| idx_story_saves_slot | story_saves | user_id, slot_type | UNIQUE | 用户槽位唯一索引 |
| idx_posts_category | posts | category | INDEX | 板块筛选 |
| idx_posts_user | posts | user_id | INDEX | 用户帖子查询 |
| idx_posts_status | posts | status | INDEX | 帖子状态筛选 |
| idx_posts_created | posts | created_at | INDEX | 帖子时间排序 |
| idx_posts_hot | posts | category, view_count, created_at | INDEX | 热门帖子查询 |
| idx_comments_post | comments | post_id | INDEX | 帖子评论查询 |
| idx_comments_user | comments | user_id | INDEX | 用户评论查询 |
| idx_interactions_user | user_interactions | user_id | INDEX | 用户互动查询 |
| idx_interactions_target | user_interactions | target_type, target_id | INDEX | 目标互动查询 |
| idx_refresh_tokens_user | refresh_tokens | user_id | INDEX | 用户令牌查询 |
| idx_refresh_tokens_token | refresh_tokens | token | UNIQUE | 令牌唯一索引 |
| idx_device_bindings_user | device_bindings | user_id | INDEX | 用户设备查询 |
| idx_device_bindings_device | device_bindings | device_id | INDEX | 设备查询 |

#### 3.3.2 migrations/init.sql 索引定义示例

```sql
-- 用户表索引
CREATE UNIQUE INDEX idx_users_username ON users(username);
CREATE UNIQUE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX idx_users_status ON users(status);

-- 用户卡牌表索引
CREATE INDEX idx_user_cards_user_id ON user_cards(user_id);
CREATE INDEX idx_user_cards_card_id ON user_cards(card_id);

-- 用户牌组表索引
CREATE INDEX idx_user_decks_user_id ON user_decks(user_id);

-- 对局表索引
CREATE INDEX idx_matches_player1 ON matches(player1_id);
CREATE INDEX idx_matches_player2 ON matches(player2_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_created ON matches(created_at);

-- 对局日志表索引
CREATE INDEX idx_match_logs_match ON match_logs(match_id);
CREATE INDEX idx_match_logs_round ON match_logs(match_id, round);

-- 玩家进度表索引
CREATE UNIQUE INDEX idx_player_progress_user ON player_progress(user_id);

-- 争鸣史存档表索引
CREATE INDEX idx_story_saves_user ON story_saves(user_id);
CREATE UNIQUE INDEX idx_story_saves_slot ON story_saves(user_id, slot_type);

-- 社区帖子表索引
CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_posts_user ON posts(user_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_created ON posts(created_at);
CREATE INDEX idx_posts_hot ON posts(category, view_count DESC, created_at DESC);

-- 评论表索引
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_user ON comments(user_id);

-- 用户互动表索引
CREATE INDEX idx_interactions_user ON user_interactions(user_id);
CREATE INDEX idx_interactions_target ON user_interactions(target_type, target_id);

-- 刷新令牌表索引
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE UNIQUE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- 设备绑定表索引
CREATE INDEX idx_device_bindings_user ON device_bindings(user_id);
CREATE INDEX idx_device_bindings_device ON device_bindings(device_id);
```

---

## 四、API接口设计

### 4.1 接口规范

#### 4.1.1 基础URL

```
生产环境：https://api.jixia.game
开发环境：http://localhost:8787
```

#### 4.1.2 请求格式

```
Content-Type: application/json
Authorization: Bearer <access_token>
```

#### 4.1.3 响应格式

**成功响应**
```json
{
  "ok": true,
  "data": { ... }
}
```

**错误响应**
```json
{
  "ok": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": { ... }
  }
}
```

#### 4.1.4 错误码定义

| 错误码 | HTTP状态 | 说明 |
|--------|----------|------|
| VALIDATION_ERROR | 400 | 参数验证失败 |
| UNAUTHORIZED | 401 | 未认证 |
| FORBIDDEN | 403 | 无权限 |
| NOT_FOUND | 404 | 资源不存在 |
| CONFLICT | 409 | 资源冲突 |
| RATE_LIMITED | 429 | 请求过于频繁 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |

### 4.2 认证模块API

#### 4.2.1 用户注册

**POST /api/v1/auth/register**

请求体：
```json
{
  "username": "player001",
  "password": "SecurePass123!",
  "email": "player@example.com",
  "display_name": "论者玩家"
}
```

响应体：
```json
{
  "ok": true,
  "data": {
    "user": {
      "user_id": "user_abc123",
      "username": "player001",
      "display_name": "论者玩家",
      "level": 1,
      "created_at": "2026-04-10T12:00:00Z"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 3600
  }
}
```

**业务规则**：
- 用户名：3-32字符，仅允许字母、数字、下划线、中文
- 密码：至少8字符，包含大小写字母和数字
- 邮箱：可选，用于找回密码
- 新用户默认获得所有一阶卡牌

#### 4.2.2 用户登录

**POST /api/v1/auth/login**

请求体：
```json
{
  "username": "player001",
  "password": "SecurePass123!"
}
```

响应体：
```json
{
  "ok": true,
  "data": {
    "user": {
      "user_id": "user_abc123",
      "username": "player001",
      "display_name": "论者玩家",
      "role": "player"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 3600
  }
}
```

#### 4.2.3 刷新令牌

**POST /api/v1/auth/refresh**

请求体：
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

响应体：
```json
{
  "ok": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 3600
  }
}
```

#### 4.2.4 登出

**POST /api/v1/auth/logout**

请求头：`Authorization: Bearer <token>`

请求体：
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### 4.2.5 游客登录

**POST /api/v1/auth/guest**

请求体：
```json
{
  "device_id": "device_xxx",
  "platform": "web"
}
```

响应体：
```json
{
  "ok": true,
  "data": {
    "player_id": "plyr_xxx",
    "profile": {
      "display_name": "论者-abc123",
      "locale": "zh-CN"
    },
    "session_token": "sess_xxx",
    "expires_in_sec": 86400
  }
}
```

### 4.3 用户模块API

#### 4.3.1 获取当前用户信息

**GET /api/v1/users/me**

响应体：
```json
{
  "ok": true,
  "data": {
    "user_id": "user_abc123",
    "username": "player001",
    "display_name": "论者玩家",
    "avatar_url": null,
    "email": "player@example.com",
    "level": 5,
    "exp": 1250,
    "opportunity": 100,
    "status": "active",
    "role": "player",
    "created_at": "2026-04-10T12:00:00Z",
    "last_login_at": "2026-04-10T15:30:00Z"
  }
}
```

#### 4.3.2 更新用户信息

**PUT /api/v1/users/me**

请求体：
```json
{
  "display_name": "新名字",
  "avatar_url": "https://..."
}
```

#### 4.3.3 修改密码

**PUT /api/v1/users/me/password**

请求体：
```json
{
  "current_password": "OldPass123!",
  "new_password": "NewPass456!"
}
```

#### 4.3.4 获取用户进度

**GET /api/v1/users/me/progress**

响应体：
```json
{
  "ok": true,
  "data": {
    "level": 5,
    "exp": 1250,
    "exp_to_next": 2000,
    "win_count": 15,
    "total_games": 20,
    "win_rate": 0.75,
    "win_streak": 3,
    "max_win_streak": 5,
    "total_damage": 12500,
    "collected_cards": 50,
    "total_cards": 191,
    "opportunity": 100
  }
}
```

### 4.4 卡牌模块API

#### 4.4.1 获取卡牌列表

**GET /api/v1/cards**

查询参数：
- `faction`: 门派筛选
- `type`: 类型筛选
- `rarity`: 稀有度筛选
- `tier`: 阶级筛选
- `page`: 页码
- `limit`: 每页数量

响应体：
```json
{
  "ok": true,
  "data": {
    "cards": [
      {
        "id": "card_001",
        "name": "温言立论",
        "faction": "礼心殿",
        "type": "立论",
        "rarity": "常见",
        "tier": 1,
        "cost": 2,
        "skill": "获得1点大势",
        "unlock_level": 1,
        "owned": true
      }
    ],
    "total": 191,
    "page": 1,
    "limit": 20
  }
}
```

#### 4.4.2 获取卡牌详情

**GET /api/v1/cards/:cardId**

响应体：
```json
{
  "ok": true,
  "data": {
    "id": "card_001",
    "name": "温言立论",
    "faction": "礼心殿",
    "type": "立论",
    "rarity": "常见",
    "tier": 1,
    "cost": 2,
    "skill": "获得1点大势",
    "background": "以温和之言立论...",
    "attack": null,
    "hp": null,
    "shield": null,
    "unlock_level": 1,
    "owned": true,
    "count": 2
  }
}
```

#### 4.4.3 获取用户卡牌

**GET /api/v1/users/me/cards**

响应体：
```json
{
  "ok": true,
  "data": {
    "cards": [
      {
        "card_id": "card_001",
        "name": "温言立论",
        "count": 2,
        "unlocked_at": "2026-04-10T12:00:00Z"
      }
    ],
    "total": 50
  }
}
```

### 4.5 牌组模块API

#### 4.5.1 获取用户牌组列表

**GET /api/v1/users/me/decks**

响应体：
```json
{
  "ok": true,
  "data": {
    "decks": [
      {
        "id": "deck_001",
        "name": "我的牌组",
        "faction": "礼心殿",
        "card_count": 24,
        "is_default": true,
        "created_at": "2026-04-10T12:00:00Z"
      }
    ],
    "total": 3
  }
}
```

#### 4.5.2 创建牌组

**POST /api/v1/users/me/decks**

请求体：
```json
{
  "name": "新牌组",
  "faction": "礼心殿",
  "cards": ["card_001", "card_002", ...]
}
```

**业务规则**：
- 牌组必须包含24张卡牌
- 二阶卡牌数量受等级限制
- 三阶卡牌数量受等级限制
- 必须包含至少1张立论牌

#### 4.5.3 更新牌组

**PUT /api/v1/users/me/decks/:deckId**

请求体：
```json
{
  "name": "更新名称",
  "cards": ["card_001", "card_002", ...]
}
```

#### 4.5.4 删除牌组

**DELETE /api/v1/users/me/decks/:deckId**

#### 4.5.5 设置默认牌组

**PUT /api/v1/users/me/decks/:deckId/default**

### 4.6 匹配模块API

#### 4.6.1 开始匹配

**POST /api/v1/matches**

请求体：
```json
{
  "deck_id": "deck_001",
  "game_mode": "ai"
}
```

响应体：
```json
{
  "ok": true,
  "data": {
    "match_id": "match_xxx",
    "status": "pending",
    "player1": {
      "user_id": "user_abc123",
      "faction": "礼心殿"
    },
    "player2": {
      "is_ai": true,
      "faction": "衡戒廷",
      "difficulty": "normal"
    }
  }
}
```

#### 4.6.2 获取对局状态

**GET /api/v1/matches/:matchId**

响应体：
```json
{
  "ok": true,
  "data": {
    "match_id": "match_xxx",
    "status": "playing",
    "round": 3,
    "current_phase": "hidden_submit",
    "player1": {
      "momentum": 2,
      "hand_count": 5,
      "deck_count": 15
    },
    "player2": {
      "momentum": 1,
      "hand_count": 4,
      "deck_count": 16
    }
  }
}
```

#### 4.6.3 提交出牌

**POST /api/v1/matches/:matchId/submit**

请求体：
```json
{
  "cards": [
    {
      "card_id": "card_001",
      "zone": "main",
      "position": 0
    }
  ]
}
```

#### 4.6.4 结算回合

**POST /api/v1/matches/:matchId/resolve**

响应体：
```json
{
  "ok": true,
  "data": {
    "round_result": {
      "main_zone": {
        "player1_power": 5,
        "player2_power": 3,
        "winner": "player1"
      },
      "momentum_change": {
        "player1": 1,
        "player2": 0
      }
    },
    "next_phase": "round_start",
    "game_over": false
  }
}
```

#### 4.6.5 获取对局历史

**GET /api/v1/users/me/matches**

查询参数：
- `status`: 状态筛选
- `page`: 页码
- `limit`: 每页数量

响应体：
```json
{
  "ok": true,
  "data": {
    "matches": [
      {
        "match_id": "match_xxx",
        "opponent": "AI",
        "result": "win",
        "rounds": 8,
        "my_faction": "礼心殿",
        "opponent_faction": "衡戒廷",
        "created_at": "2026-04-10T15:00:00Z"
      }
    ],
    "total": 20
  }
}
```

### 4.7 存档模块API

#### 4.7.1 获取存档列表

**GET /api/v1/story/saves**

响应体：
```json
{
  "ok": true,
  "data": {
    "slots": [
      {
        "slot_type": "autosave",
        "exists": true,
        "chapter": 3,
        "scene": 15,
        "current_node_id": "ch_moru_003_n045",
        "play_time": 3600,
        "updated_at": "2026-04-10T15:00:00Z"
      },
      {
        "slot_type": "manual_1",
        "exists": false
      }
    ]
  }
}
```

#### 4.7.2 保存进度

**POST /api/v1/story/saves**

请求体：
```json
{
  "slot_type": "manual_1",
  "save_data": {
    "current_node_id": "ch_moru_003_n045",
    "chapter": 3,
    "scene": 15,
    "player_stats": {
      "fame": 10,
      "wisdom": 8,
      "charm": 6,
      "courage": 7,
      "insight": 9
    },
    "player_relationships": {
      "confucian": {"affection": 10, "trust": 5}
    },
    "player_flags": {},
    "history": [],
    "visited_nodes": [],
    "bridge_state": {}
  }
}
```

#### 4.7.3 读取存档

**GET /api/v1/story/saves/:slotType**

响应体：
```json
{
  "ok": true,
  "data": {
    "slot_type": "manual_1",
    "version": "1.1.0",
    "current_node_id": "ch_moru_003_n045",
    "chapter": 3,
    "scene": 15,
    "player_stats": {...},
    "player_relationships": {...},
    "player_flags": {...},
    "history": [...],
    "visited_nodes": [...],
    "bridge_state": {...},
    "play_time": 3600
  }
}
```

#### 4.7.4 删除存档

**DELETE /api/v1/story/saves/:slotType**

### 4.8 社区模块API

#### 4.8.1 获取帖子列表

**GET /api/v1/community/posts**

查询参数：
- `category`: 板块筛选
- `tag`: 标签筛选
- `sort`: 排序方式（latest/popular）
- `page`: 页码
- `limit`: 每页数量

响应体：
```json
{
  "ok": true,
  "data": {
    "posts": [
      {
        "id": "post_xxx",
        "title": "礼心殿卡组分享",
        "author": {
          "user_id": "user_abc",
          "display_name": "论者玩家"
        },
        "category": "论道",
        "tags": ["卡组", "礼心殿"],
        "summary": "分享一下我常用的礼心殿卡组...",
        "view_count": 100,
        "like_count": 25,
        "comment_count": 5,
        "collect_count": 10,
        "is_pinned": false,
        "is_featured": false,
        "created_at": "2026-04-10T12:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

#### 4.8.2 获取帖子详情

**GET /api/v1/community/posts/:postId**

#### 4.8.3 创建帖子

**POST /api/v1/community/posts**

请求体：
```json
{
  "category": "论道",
  "title": "礼心殿卡组分享",
  "content": "正文内容...",
  "tags": ["卡组", "礼心殿"],
  "images": ["https://..."]
}
```

#### 4.8.4 更新帖子

**PUT /api/v1/community/posts/:postId**

#### 4.8.5 删除帖子

**DELETE /api/v1/community/posts/:postId**

#### 4.8.6 点赞/取消点赞

**POST /api/v1/community/posts/:postId/like**

**DELETE /api/v1/community/posts/:postId/like**

#### 4.8.7 收藏/取消收藏

**POST /api/v1/community/posts/:postId/collect**

**DELETE /api/v1/community/posts/:postId/collect**

#### 4.8.8 获取评论列表

**GET /api/v1/community/posts/:postId/comments**

#### 4.8.9 创建评论

**POST /api/v1/community/posts/:postId/comments**

请求体：
```json
{
  "content": "很好的分享！",
  "parent_id": null
}
```

#### 4.8.10 采纳答案（问答板块）

**POST /api/v1/community/comments/:commentId/accept**

#### 4.8.11 获取我的帖子

**GET /api/v1/community/my/posts**

#### 4.8.12 获取我的收藏

**GET /api/v1/community/my/collections**

#### 4.8.13 搜索帖子

**GET /api/v1/community/search**

查询参数：
- `q`: 搜索关键词
- `category`: 板块筛选
- `page`: 页码
- `limit`: 每页数量

### 4.9 奖励模块API

#### 4.9.1 领取奖励

**POST /api/v1/rewards/claim**

请求体：
```json
{
  "reward_type": "match_win",
  "match_id": "match_xxx"
}
```

响应体：
```json
{
  "ok": true,
  "data": {
    "rewards": {
      "exp": 50,
      "opportunity": 10,
      "cards": [
        {"card_id": "card_050", "count": 1}
      ]
    },
    "new_level": 6,
    "level_up": true
  }
}
```

#### 4.9.2 获取奖励历史

**GET /api/v1/users/me/rewards**

---

## 五、实时通信（WebSocket）

### 5.1 连接建立

```javascript
const socket = io('ws://localhost:8787', {
  auth: {
    token: 'Bearer <access_token>'
  }
});
```

### 5.2 事件定义

#### 5.2.1 对战相关

| 事件 | 方向 | 说明 |
|------|------|------|
| `match:join` | 客户端→服务器 | 加入对局 |
| `match:leave` | 客户端→服务器 | 离开对局 |
| `match:submit` | 客户端→服务器 | 提交出牌 |
| `match:resolve` | 服务器→客户端 | 回合结算 |
| `match:state` | 服务器→客户端 | 对局状态更新 |
| `match:end` | 服务器→客户端 | 对局结束 |

#### 5.2.2 匹配相关

| 事件 | 方向 | 说明 |
|------|------|------|
| `matchmaking:start` | 客户端→服务器 | 开始匹配 |
| `matchmaking:cancel` | 客户端→服务器 | 取消匹配 |
| `matchmaking:found` | 服务器→客户端 | 匹配成功 |

### 5.3 消息格式

**请求格式**
```json
{
  "event": "match:submit",
  "data": {
    "match_id": "match_xxx",
    "cards": [...]
  }
}
```

**响应格式**
```json
{
  "event": "match:resolve",
  "data": {
    "round_result": {...}
  }
}
```

### 5.4 服务层Socket接口预留（Phase 2设计）

在Phase 2服务层设计时，需要为Phase 4的Socket.IO实时通信预留接口。

#### 5.4.1 MatchService Socket接口

```javascript
// services/match.service.cjs - Socket接口预留

class MatchService {
  /**
   * 创建对局（供HTTP路由和Socket调用）
   * @param {Object} params - 创建参数
   * @returns {Promise<Match>} 对局对象
   */
  async createMatch(params) {
    // 实现...
  }

  /**
   * 玩家加入对局 - Socket事件处理器预留
   * @param {string} matchId - 对局ID
   * @param {string} playerId - 玩家ID
   * @param {Socket} socket - Socket实例（Phase 4注入）
   * @returns {Promise<void>}
   */
  async joinMatch(matchId, playerId, socket) {
    // Phase 4实现：加入房间、广播状态
  }

  /**
   * 玩家提交出牌 - Socket事件处理器预留
   * @param {string} matchId - 对局ID
   * @param {string} playerId - 玩家ID
   * @param {Array} cards - 出牌数据
   * @param {Socket} socket - Socket实例（Phase 4注入）
   * @returns {Promise<Object>} 提交结果
   */
  async submitCards(matchId, playerId, cards, socket) {
    // Phase 4实现：验证、存储、广播
  }

  /**
   * 结算回合 - Socket事件处理器预留
   * @param {string} matchId - 对局ID
   * @param {SocketServer} io - Socket.IO服务器（Phase 4注入）
   * @returns {Promise<Object>} 结算结果
   */
  async resolveRound(matchId, io) {
    // Phase 4实现：计算结果、广播给房间所有玩家
  }

  /**
   * 获取对局状态（供HTTP和Socket共享）
   * @param {string} matchId - 对局ID
   * @returns {Promise<MatchState>} 对局状态
   */
  async getMatchState(matchId) {
    // 实现...
  }

  /**
   * 广播对局状态更新 - Socket方法预留
   * @param {string} matchId - 对局ID
   * @param {Object} state - 状态数据
   * @param {SocketServer} io - Socket.IO服务器（Phase 4注入）
   * @returns {Promise<void>}
   */
  async broadcastMatchState(matchId, state, io) {
    // Phase 4实现：io.to(`match:${matchId}`).emit('match:state', state)
  }
}
```

#### 5.4.2 MatchmakingService Socket接口

```javascript
// services/matchmaking.service.cjs - Socket接口预留

class MatchmakingService {
  /**
   * 开始匹配 - Socket事件处理器预留
   * @param {string} playerId - 玩家ID
   * @param {Object} preferences - 匹配偏好
   * @param {Socket} socket - Socket实例（Phase 4注入）
   * @returns {Promise<void>}
   */
  async startMatchmaking(playerId, preferences, socket) {
    // Phase 4实现：加入匹配队列、监听匹配成功
  }

  /**
   * 取消匹配 - Socket事件处理器预留
   * @param {string} playerId - 玩家ID
   * @param {Socket} socket - Socket实例（Phase 4注入）
   * @returns {Promise<void>}
   */
  async cancelMatchmaking(playerId, socket) {
    // Phase 4实现：从队列移除
  }

  /**
   * 匹配成功回调 - Socket广播预留
   * @param {Array<string>} playerIds - 匹配到的玩家ID列表
   * @param {Match} match - 对局对象
   * @param {SocketServer} io - Socket.IO服务器（Phase 4注入）
   * @returns {Promise<void>}
   */
  async onMatchFound(playerIds, match, io) {
    // Phase 4实现：向匹配玩家发送 matchmaking:found 事件
  }
}
```

#### 5.4.3 Socket与Service集成架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Socket.IO Layer                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  socket/index.cjs                                   │    │
│  │  - 连接认证 (JWT验证)                                │    │
│  │  - 事件路由                                          │    │
│  │  - 房间管理                                          │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────┘
                           │ 调用
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │MatchService  │  │BattleService │  │MMService     │       │
│  │- Socket接口  │  │- Socket接口  │  │- Socket接口  │       │
│  │  预留        │  │  预留        │  │  预留        │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└──────────────────────────┬──────────────────────────────────┘
                           │ 调用
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Model/Store Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  User Model  │  │  Match Model │  │  Card Model  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

#### 5.4.4 Phase 2 Service层设计要点

在Phase 2设计服务层时，需要遵循以下原则以便Phase 4集成Socket：

1. **依赖注入**：Service方法接收socket/io参数，但不直接依赖Socket.IO
2. **事件驱动**：Service层通过回调或事件通知Socket层广播
3. **状态隔离**：业务逻辑在Service层，通信逻辑在Socket层
4. **接口预留**：为所有需要实时通知的操作预留Socket参数

```javascript
// 示例：Phase 2实现业务逻辑，Phase 4注入Socket能力

// Phase 2: 纯业务逻辑
async submitCards(matchId, playerId, cards) {
  // 1. 验证玩家是否在对局中
  // 2. 验证出牌合法性
  // 3. 存储出牌数据
  // 4. 返回结果（不处理广播）
  return result;
}

// Phase 4: 添加Socket广播
async submitCardsWithBroadcast(matchId, playerId, cards, socket) {
  const result = await this.submitCards(matchId, playerId, cards);
  // 广播给对手
  socket.to(`match:${matchId}`).emit('match:opponent-submitted', {
    playerId,
    submitted: true
  });
  return result;
}
```

---

## 六、安全设计

### 6.1 认证机制

#### 6.1.1 JWT配置

| 参数 | 值 | 说明 |
|------|-----|------|
| 算法 | HS256 | HMAC SHA-256 |
| Access Token过期 | 1小时 | 短期令牌 |
| Refresh Token过期 | 7天 | 长期令牌 |
| 密钥 | 环境变量 | JWT_SECRET |

#### 6.1.2 Token负载

```json
{
  "sub": "user_abc123",
  "username": "player001",
  "role": "player",
  "iat": 1712793600,
  "exp": 1712797200
}
```

### 6.2 密码安全

- 使用bcrypt进行密码哈希
- Cost factor: 12
- 密码强度要求：至少8字符，包含大小写字母和数字

### 6.3 请求限流

| 端点类型 | 限制 | 窗口 |
|----------|------|------|
| 认证接口 | 10次 | 1分钟 |
| 普通接口 | 100次 | 1分钟 |
| 写入接口 | 30次 | 1分钟 |

### 6.4 输入验证

- 所有用户输入必须经过验证
- 使用正则表达式验证格式
- 限制字符串长度
- 过滤特殊字符

### 6.5 CORS配置

```javascript
{
  origin: ['https://jixia.game', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

---

## 七、性能要求

### 7.1 响应时间

| 接口类型 | 目标响应时间 |
|----------|--------------|
| 认证接口 | < 200ms |
| 查询接口 | < 100ms |
| 写入接口 | < 300ms |
| WebSocket消息 | < 50ms |

### 7.2 并发能力

| 指标 | 目标值 |
|------|--------|
| 同时在线用户 | 1000+ |
| 同时进行对局 | 500+ |
| 每秒请求数 | 1000+ |

### 7.3 数据库性能

| 指标 | 目标值 |
|------|--------|
| 查询延迟 | < 10ms |
| 写入延迟 | < 50ms |
| 索引覆盖 | 主要查询100% |

---

## 八、部署方案

### 8.1 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 后端服务地址
http://localhost:8787
```

### 8.2 生产环境

```bash
# 构建
npm run build

# 启动生产服务器
NODE_ENV=production node server/index.cjs

# 环境变量
JWT_SECRET=your-secret-key
CLIENT_ORIGIN=https://jixia.game
```

### 8.3 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| PORT | 服务端口 | 8787 |
| NODE_ENV | 运行环境 | development |
| JWT_SECRET | JWT密钥 | - |
| CLIENT_ORIGIN | 客户端域名 | http://localhost:5173 |
| DATABASE_PATH | 数据库路径 | ./data/jixia.db |

---

## 九、实施计划

### 9.1 里程碑（调整后）

| 阶段 | 内容 | 预计工时 | 关键产出 |
|------|------|----------|----------|
| Phase 1 | 数据库 + 模型层（含索引） | 2天 | `migrations/init.sql`、所有Model文件 |
| Phase 2 | 服务层（预留Socket接口） | 2天 | `services/*.service.cjs`、Socket接口定义 |
| Phase 3 | 用户/卡牌/牌组路由 | 3天 | `routes/auth.cjs`、`routes/users.cjs`、`routes/cards.cjs` |
| Phase 4 | 匹配/对战路由 + Socket.IO实时通信 | 4天 | `routes/matches.cjs`、`routes/battle.cjs`、完整Socket事件实现 |
| Phase 5 | 存档/进度路由 | 2天 | `routes/story.cjs`、`routes/progress.cjs` |
| Phase 6 | 社区模块 | 3天 | `routes/community.cjs`、帖子/评论/互动功能 |
| Phase 7 | 限流/优化/测试 | 2天 | `middleware/rate-limit.cjs`、性能优化、测试覆盖 |

### 9.2 优先级

| 优先级 | 模块 | 说明 |
|--------|------|------|
| P0 | 数据库设计 | 基础设施，必须先到位 |
| P0 | 模型层 | 数据访问基础 |
| P0 | 服务层 | 业务逻辑核心，需预留Socket接口 |
| P1 | 用户认证 | 核心功能 |
| P1 | 卡牌/牌组 | 核心玩法 |
| P1 | 匹配/对战 + Socket.IO | 核心玩法，实时通信是重点 |
| P2 | 存档系统 | 用户体验 |
| P2 | 进度系统 | 用户留存 |
| P3 | 社区模块 | 内容生态，可延后 |
| P3 | 限流/优化 | 性能保障 |

---

## 十、附录

### 10.1 参考文档

- [游戏规则手册](../GAME_RULES.md)
- [社区模块规格](../community/COMMUNITY_MODULE_SPEC.md)
- [争鸣史后端架构](../story/STORY_BACKEND_ARCHITECTURE.md)
- [三阶卡牌战斗模型](../project/three-tier-battle-operation-model-20260408.md)

### 10.2 术语表

| 术语 | 说明 |
|------|------|
| 大势 | 胜利点数，先到8点获胜 |
| 势 | 每回合可用的行动点 |
| 底蕴 | 门客牌的生命值 |
| 护持 | 防御护盾 |
| 主议 | 正面战场 |
| 旁议 | 侧面战场 |
| 暗辩 | 双方同时暗下出牌阶段 |
| 名士等级 | 玩家等级 |
| 机遇 | 游戏货币 |

---

*文档维护：开发团队*
*最后更新：2026-04-10（已根据评审意见调整实施计划）*
