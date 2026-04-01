# 争鸣史后端架构设计方案

## 一、现有架构分析

### 1.1 项目技术栈
```
前端：Vite + React + TypeScript + electron
后端：Express + Socket.IO（已有）
存储：内存存储（当前）
端口：8787
```

### 1.2 现有后端结构
```
server/
├── index.cjs          # 服务入口
├── app.cjs            # Express 应用创建
├── constants.cjs      # 常量配置
├── socket/
│   └── index.cjs     # Socket.IO 封装
├── store/
│   └── match-store.cjs  # 对战存储（内存）
├── routes/
│   ├── health.cjs    # 健康检查
│   └── matches.cjs    # 对战 API
├── middleware/
│   ├── error-handler.cjs
│   └── request-logger.cjs
└── README.md
```

### 1.3 争鸣史当前存档方案
```
存储位置：localStorage（前端）
存储键：jixia.story.autosave.v1
限制：单存档点，无法跨设备同步
```

## 二、需求分析

### 2.1 为什么需要后端存档？

| 需求 | localStorage 限制 | 后端优势 |
|------|-------------------|----------|
| 多槽位存档 | 可实现但复杂 | 原生支持 |
| 跨设备同步 | 不支持 | 支持 |
| 数据持久化 | 浏览器清除会丢失 | 持久化存储 |
| 存档元数据 | 有限 | 完整支持 |
| 存档导出/备份 | 不支持 | 支持 |
| 防作弊 | 无 | 可验证 |

### 2.2 用户场景
```
场景1：玩家在家用电脑玩到第三章，出门用手机继续
场景2：玩家重装系统，存档丢失
场景3：玩家想备份存档到云端
场景4：开发者想查看玩家进度数据分析
```

## 三、后端架构设计

### 3.1 技术选型

**方案A：SQLite（文件数据库）**
```
优点：
- 部署简单，单文件
- 无需额外部署数据库服务
- 支持 SQL 查询
- 适合中小型数据

缺点：
- 并发写入需要锁
- 不适合高并发

适用场景：单人游戏存档
```

**方案B：JSON 文件存储**
```
优点：
- 部署最简单
- 人类可读，方便调试
- 迁移方便

缺点：
- 不支持复杂查询
- 并发写入需要锁

适用场景：独立游戏原型
```

**方案C：MongoDB**
```
优点：
- 文档型，存储灵活
- 支持复杂查询
- 易于扩展

缺点：
- 需要额外部署
- 学习成本

适用场景：多人游戏、需要数据分析
```

### 3.2 推荐方案

**选择：SQLite**
理由：
1. 单机游戏存档不需要高并发
2. 部署简单，无需额外部署
3. 支持 SQL 查询，便于扩展
4. `better-sqlite3` 性能优秀

### 3.3 数据库设计

```sql
-- 用户表（可选，简单实现可以用设备ID）
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,           -- 用户ID（可以是设备ID或游客ID）
  device_id TEXT,                -- 设备ID
  created_at TEXT DEFAULT (datetime('now')),
  last_login_at TEXT
);

-- 争鸣史存档表
CREATE TABLE IF NOT EXISTS story_saves (
  id TEXT PRIMARY KEY,           -- 存档唯一ID
  user_id TEXT NOT NULL,         -- 所属用户
  slot_type TEXT NOT NULL,       -- 'autosave' | 'manual_1' | 'manual_2' | 'manual_3'
  version TEXT NOT NULL,         -- 存档版本
  timestamp INTEGER NOT NULL,     -- 存档时间戳

  -- 存档数据（JSON）
  current_node_id TEXT,
  chapter INTEGER,
  scene INTEGER,
  player_stats TEXT,              -- JSON: {fame, wisdom, charm, courage, insight}
  player_relationships TEXT,     -- JSON: {faction: {affection, trust}}
  player_flags TEXT,             -- JSON: {flagName: value}
  progress TEXT,                 -- JSON: {completedNodes, history}
  bridge_state TEXT,             -- JSON: {unlockedFactions, unlockedCards, chapterFlags}

  -- 元数据
  metadata TEXT,                 -- JSON: {playTime, endingCount, choicesMade}

  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_story_saves_user ON story_saves(user_id);
CREATE INDEX IF NOT EXISTS idx_story_saves_slot ON story_saves(user_id, slot_type);
```

### 3.4 API 设计

#### 基础路径：`/api/v1/story`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/saves` | 获取用户所有存档列表 |
| GET | `/saves/:slotType` | 获取指定槽位存档 |
| POST | `/saves/:slotType` | 创建/覆盖存档 |
| DELETE | `/saves/:slotType` | 删除存档 |
| POST | `/saves/:slotType/load` | 从存档加载（验证后返回完整数据） |

#### 请求/响应示例

**GET /api/v1/story/saves**
```json
// Response 200
{
  "ok": true,
  "data": {
    "autosave": {
      "exists": true,
      "timestamp": 1743561234567,
      "chapter": 1,
      "nodeCount": 42,
      "currentNodeId": "ch_moru_001_n035"
    },
    "manual_1": {
      "exists": false
    },
    "manual_2": {
      "exists": false
    },
    "manual_3": {
      "exists": false
    }
  }
}
```

**POST /api/v1/story/saves/manual_1**
```json
// Request
{
  "userId": "user_123",
  "data": {
    "currentNodeId": "ch_moru_001_n035",
    "chapter": 1,
    "scene": 35,
    "player": {
      "stats": { "fame": 10, "wisdom": 15, ... },
      "relationships": { "mozi": { "affection": 5, "trust": 3 } },
      "flags": { "met_suqin": true }
    },
    "progress": {
      "completedNodes": ["ch_moru_001_n001", ...],
      "history": [...]
    },
    "bridgeState": { ... }
  }
}

// Response 200
{
  "ok": true,
  "data": {
    "slotType": "manual_1",
    "timestamp": 1743561234567,
    "saveId": "save_abc123"
  }
}
```

### 3.5 服务端存储设计

```typescript
// server/store/story-save-store.cjs

const DB_PATH = './data/story_saves.db';  // 或从环境变量读取

function createStorySaveStore() {
  // 初始化 SQLite
  const db = openDatabase(DB_PATH);

  // 创建表
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (...)
    CREATE TABLE IF NOT EXISTS story_saves (...)
  `);

  return {
    // 获取用户存档列表（不包含完整数据）
    getSaveSlots(userId) {
      const rows = db.prepare(`
        SELECT slot_type, timestamp, chapter, current_node_id
        FROM story_saves WHERE user_id = ?
      `).all(userId);

      // 返回槽位状态
      return ['autosave', 'manual_1', 'manual_2', 'manual_3'].map(slot => {
        const row = rows.find(r => r.slot_type === slot);
        return row ? {
          exists: true,
          timestamp: row.timestamp,
          chapter: row.chapter,
          currentNodeId: row.current_node_id
        } : { exists: false };
      });
    },

    // 保存存档
    save(userId, slotType, saveData) {
      // 使用 UPSERT 语法
      db.prepare(`
        INSERT INTO story_saves (id, user_id, slot_type, version, timestamp, ...)
        VALUES (?, ?, ?, 'v1', ?, ...)
        ON CONFLICT(user_id, slot_type) DO UPDATE SET ...
      `).run(...);
    },

    // 读取存档
    load(userId, slotType) {
      return db.prepare(`
        SELECT * FROM story_saves WHERE user_id = ? AND slot_type = ?
      `).get(userId, slotType);
    },

    // 删除存档
    delete(userId, slotType) {
      db.prepare(`DELETE FROM story_saves WHERE user_id = ? AND slot_type = ?`)
        .run(userId, slotType);
    }
  };
}
```

### 3.6 路由设计

```javascript
// server/routes/story.cjs

const express = require('express');
const { createStoryRouter } = (storySaveStore) => {
  const router = express.Router();

  // 获取存档列表
  router.get('/saves', (req, res) => {
    const userId = req.headers['x-user-id'];  // 或从 session 获取
    if (!userId) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }
    const slots = storySaveStore.getSaveSlots(userId);
    res.json({ ok: true, data: slots });
  });

  // 获取单个存档
  router.get('/saves/:slotType', (req, res) => {
    const { slotType } = req.params;
    const userId = req.headers['x-user-id'];
    const save = storySaveStore.load(userId, slotType);
    if (!save) {
      return res.status(404).json({ ok: false, error: 'Save not found' });
    }
    res.json({ ok: true, data: save });
  });

  // 保存存档
  router.post('/saves/:slotType', (req, res) => {
    const { slotType } = req.params;
    const userId = req.headers['x-user-id'];
    const saveData = req.body.data;

    storySaveStore.save(userId, slotType, saveData);
    res.json({ ok: true, timestamp: Date.now() });
  });

  // 删除存档
  router.delete('/saves/:slotType', (req, res) => {
    const { slotType } = req.params;
    const userId = req.headers['x-user-id'];
    storySaveStore.delete(userId, slotType);
    res.json({ ok: true });
  });

  return router;
};

module.exports = { createStoryRouter };
```

## 四、前端集成设计

### 4.1 API 客户端

```typescript
// src/api/storyApi.ts

const API_BASE = 'http://localhost:8787/api/v1/story';

interface SaveSlotInfo {
  exists: boolean;
  timestamp?: number;
  chapter?: number;
  nodeCount?: number;
  currentNodeId?: string;
}

interface SaveSlotData {
  currentNodeId: string;
  chapter: number;
  scene: number;
  player: {...};
  progress: {...};
  bridgeState?: {...};
}

class StorySaveAPI {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  private headers() {
    return {
      'Content-Type': 'application/json',
      'x-user-id': this.userId,
    };
  }

  async getSaveSlots(): Promise<Record<string, SaveSlotInfo>> {
    const res = await fetch(`${API_BASE}/saves`, { headers: this.headers() });
    const json = await res.json();
    return json.data;
  }

  async loadSave(slotType: string): Promise<SaveSlotData | null> {
    const res = await fetch(`${API_BASE}/saves/${slotType}`, {
      headers: this.headers(),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  }

  async save(slotType: string, data: SaveSlotData): Promise<boolean> {
    const res = await fetch(`${API_BASE}/saves/${slotType}`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ data }),
    });
    return res.ok;
  }

  async delete(slotType: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/saves/${slotType}`, {
      method: 'DELETE',
      headers: this.headers(),
    });
    return res.ok;
  }
}
```

### 4.2 StoryEngine 集成

```typescript
// src/game/story/StoryEngine.ts

class StoryEngine {
  private api: StorySaveAPI;
  private useRemoteSave: boolean = false;

  constructor(api?: StorySaveAPI) {
    this.api = api;
  }

  public enableRemoteSave(api: StorySaveAPI) {
    this.api = api;
    this.useRemoteSave = true;
  }

  public persist(slotType: 'autosave' | 'manual_1' | 'manual_2' | 'manual_3' = 'autosave') {
    const saveData = this.save();

    // 本地存储（始终保留）
    localStorage.setItem(STORAGE_KEYS[slotType], JSON.stringify(saveData));

    // 远程存储（如果启用）
    if (this.useRemoteSave && this.api) {
      this.api.save(slotType, saveData).catch(err => {
        console.error('Remote save failed:', err);
      });
    }
  }

  public async restore(slotType: 'autosave' | 'manual_1' | 'manual_2' | 'manual_3' = 'autosave'): Promise<boolean> {
    // 优先尝试远程
    if (this.useRemoteSave && this.api) {
      const remoteData = await this.api.loadSave(slotType);
      if (remoteData) {
        this.load(remoteData);
        return true;
      }
    }

    // 回退到本地
    const localData = localStorage.getItem(STORAGE_KEYS[slotType]);
    if (localData) {
      this.load(JSON.parse(localData));
      return true;
    }

    return false;
  }

  public async syncSaveSlots(): Promise<Record<string, SaveSlotInfo>> {
    if (!this.api) {
      return this.getLocalSaveSlots();
    }
    return this.api.getSaveSlots();
  }
}
```

### 4.3 用户身份识别

**方案1：设备ID（简单）**
```typescript
// 生成设备ID并存储
function getOrCreateDeviceId(): string {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = 'device_' + crypto.randomUUID().slice(0, 8);
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
}
```

**方案2：游客账号（中等）**
- 首次启动时自动创建游客账号
- 账号数据绑定设备ID
- 后续可升级为正式账号

**方案3：完整账号系统（复杂）**
- 需要注册/登录
- 支持多设备同步
- 超出本次范围

### 4.4 离线优先策略

```
┌─────────────────────────────────────────┐
│            存档操作流程                   │
├─────────────────────────────────────────┤
│  1. 用户点击保存                         │
│  2. 立即保存到 localStorage（最快）      │
│  3. 后台异步同步到服务器                 │
│  4. 如果离线，队列等待网络恢复           │
│  5. 返回存档成功（本地）给用户           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│            读档操作流程                   │
├─────────────────────────────────────────┤
│  1. 检查服务器是否有更新                  │
│  2. 如果有，下载并覆盖本地               │
│  3. 如果无，使用本地存档                 │
│  4. 如果都没有，返回失败                 │
└─────────────────────────────────────────┘
```

## 五、目录结构设计

```
server/
├── index.cjs              # 服务入口（已有）
├── app.cjs                # Express 应用（已有）
├── constants.cjs          # 常量（已有）
├── db/
│   ├── index.cjs          # 数据库初始化
│   ├── migrations/        # 数据库迁移脚本
│   │   └── 001_init.sql
│   │   └── 002_add_story_saves.sql
│   └── schema.sql         # 数据库 schema
├── store/
│   ├── match-store.cjs    # 对战存储（已有）
│   └── story-save-store.cjs  # 新增：争鸣史存档存储
├── routes/
│   ├── health.cjs         # 健康检查（已有）
│   ├── matches.cjs        # 对战 API（已有）
│   └── story.cjs          # 新增：争鸣史存档 API
├── middleware/
│   ├── error-handler.cjs  # 错误处理（已有）
│   └── request-logger.cjs # 请求日志（已有）
└── socket/
    └── index.cjs          # Socket.IO（已有）

data/                     # 新增：数据目录
└── story_saves.db        # SQLite 数据库文件
```

## 六、实现计划

### Phase 1: 基础后端（1-2天）
- [ ] 创建数据库初始化模块
- [ ] 实现 story-save-store（SQLite）
- [ ] 实现 story 路由
- [ ] 单元测试

### Phase 2: 前端集成（1-2天）
- [ ] 创建 storyApi.ts
- [ ] 修改 StoryEngine 支持远程存档
- [ ] 实现离线优先策略
- [ ] UI 存档/读档功能

### Phase 3: 高级功能（可选）
- [ ] 用户认证系统
- [ ] 多设备同步
- [ ] 存档云备份
- [ ] 存档数据分析后台

## 七、存储键映射

| 槽位 | localStorage | 后端 SQLite |
|------|-------------|------------|
| 自动存档 | `jixia.story.autosave.v2` | `autosave` |
| 手动存档1 | `jixia.story.manual.1.v2` | `manual_1` |
| 手动存档2 | `jixia.story.manual.2.v2` | `manual_2` |
| 手动存档3 | `jixia.story.manual.3.v2` | `manual_3` |

## 八、注意事项

1. **向后兼容**：保留 localStorage 实现，不强制要求联网
2. **数据验证**：后端需要对存档数据进行校验
3. **错误处理**：网络失败时不影响本地游戏
4. **性能考虑**：SQLite 写入不应阻塞主线程
5. **安全考虑**：用户只能访问自己的存档
