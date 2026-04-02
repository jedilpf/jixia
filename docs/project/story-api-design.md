# 剧情数据后端API设计

## 1. 概述

为支持剧情数据的动态加载和后端管理，设计以下API架构。

## 2. 数据模型

### StoryNode（剧情节点）
```typescript
interface StoryNode {
  id: string;           // 唯一标识，如 "ch_moru_001_n001"
  chapterId: string;    // 所属章节，如 "ch_moru_001"
  type: 'narration' | 'dialogue' | 'choice' | 'ending' | 'battle';
  speaker?: string;      // 说话者（如为对话节点）
  emotion?: string;      // 情绪状态
  content: string;      // 剧情内容
  background?: string;   // 背景
  nextNode?: string;    // 下一节点ID（用于无分支）
  choices?: Choice[];    // 选项列表（用于分支）
  effects?: NodeEffects; // 节点效果（如flag、属性修改）
  metadata?: {
    isKeyPoint?: boolean;  // 是否关键节点
    isCheckpoint?: boolean; // 是否存档点
    isBattleRequired?: boolean; // 是否需要战斗
  };
}

interface Choice {
  id: string;
  text: string;
  nextNode: string;
  effects?: NodeEffects;
  condition?: string;  // 显示条件
}

interface NodeEffects {
  flags?: Record<string, boolean | string | number>;
  stats?: Record<string, number>;
  unlocks?: string[];  // 解锁内容
}
```

### Chapter（章节）
```typescript
interface Chapter {
  id: string;           // 如 "ch_moru_001"
  title: string;        // 如 "第一章·百家争鸣"
  order: number;        // 章节顺序
  status: 'draft' | 'active' | 'archived';
  nodeCount: number;    // 节点总数
  estimatedDuration: number; // 预计时长（分钟）
  prerequisites?: {
    chapterId?: string;  // 前置章节
    flags?: Record<string, boolean>;
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    author?: string;
    version?: string;
  };
}
```

## 3. API接口设计

### 基础信息
- Base URL: `/api/v1/story`
- 认证：JWT Token（可选，部分接口需要）

### 3.1 章节管理

#### GET /api/v1/story/chapters
获取所有章节列表
```json
Response: {
  "success": true,
  "data": [
    {
      "id": "ch_moru_001",
      "title": "第一章·百家争鸣",
      "order": 1,
      "status": "active",
      "nodeCount": 80
    }
  ]
}
```

#### GET /api/v1/story/chapters/:chapterId
获取单个章节详情
```json
Response: {
  "success": true,
  "data": {
    "id": "ch_moru_001",
    "title": "第一章·百家争鸣",
    "order": 1,
    "status": "active",
    "nodeCount": 80,
    "summary": "..."
  }
}
```

### 3.2 节点查询

#### GET /api/v1/story/nodes/:nodeId
获取单个节点
```json
Response: {
  "success": true,
  "data": {
    "id": "ch_moru_001_n001",
    "chapterId": "ch_moru_001",
    "type": "narration",
    "content": "...",
    "background": "academy_courtyard"
  }
}
```

#### GET /api/v1/story/chapters/:chapterId/nodes
获取章节所有节点（分页）
```json
Query: ?page=1&limit=50&type=dialogue
Response: {
  "success": true,
  "data": {
    "nodes": [...],
    "pagination": {
      "total": 80,
      "page": 1,
      "limit": 50
    }
  }
}
```

### 3.3 剧情推进

#### POST /api/v1/story/progress
推进剧情（处理分支选择）
```json
Request: {
  "currentNodeId": "ch_moru_001_n005",
  "choiceId": "ch_moru_001_n005_c1",
  "playerFlags": {
    "墨家线": true
  }
}
Response: {
  "success": true,
  "data": {
    "nextNode": {
      "id": "ch_moru_001_n006",
      "type": "dialogue",
      "content": "..."
    },
    "unlockedChapters": [],
    "flagUpdates": {
      "墨家线": true,
      "fame": 5
    }
  }
}
```

### 3.4 存档管理

#### GET /api/v1/story/saves/:slotId
获取存档
```json
Response: {
  "success": true,
  "data": {
    "slotId": "autosave",
    "currentNodeId": "ch_moru_001_n020",
    "chapterId": "ch_moru_001",
    "progress": 25,
    "flags": {},
    "stats": {
      "fame": 10,
      "wisdom": 8
    },
    "savedAt": "2026-04-02T12:00:00Z"
  }
}
```

#### POST /api/v1/story/saves/:slotId
保存进度
```json
Request: {
  "currentNodeId": "ch_moru_001_n020",
  "chapterId": "ch_moru_001",
  "flags": {},
  "stats": {}
}
Response: {
  "success": true,
  "message": "存档成功"
}
```

## 4. 数据库设计（PostgreSQL）

### Tables

```sql
-- 章节表
CREATE TABLE chapters (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  title_en VARCHAR(200),
  chapter_order INT NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  node_count INT DEFAULT 0,
  estimated_duration INT,
  summary TEXT,
  prerequisites JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 剧情节点表
CREATE TABLE story_nodes (
  id VARCHAR(50) PRIMARY KEY,
  chapter_id VARCHAR(50) REFERENCES chapters(id),
  node_order INT NOT NULL,
  type VARCHAR(20) NOT NULL,
  speaker VARCHAR(100),
  emotion VARCHAR(50),
  content TEXT NOT NULL,
  background VARCHAR(100),
  next_node VARCHAR(50),
  choices JSONB,
  effects JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 玩家存档表
CREATE TABLE player_saves (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100),
  slot_id VARCHAR(20) NOT NULL,
  chapter_id VARCHAR(50),
  current_node_id VARCHAR(50),
  progress INT DEFAULT 0,
  flags JSONB DEFAULT '{}',
  stats JSONB DEFAULT '{}',
  choices JSONB DEFAULT '[]',
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, slot_id)
);

-- 索引
CREATE INDEX idx_nodes_chapter ON story_nodes(chapter_id);
CREATE INDEX idx_nodes_type ON story_nodes(type);
CREATE INDEX idx_saves_user ON player_saves(user_id);
```

## 5. 前端适配

### StoryEngine改造

```typescript
// 支持远程加载
class StoryEngine {
  private useRemote = true;
  private apiBase = '/api/v1/story';

  async loadNode(nodeId: string): Promise<StoryNode> {
    if (this.useRemote) {
      const res = await fetch(`${this.apiBase}/nodes/${nodeId}`);
      return res.json();
    }
    return this.nodeMap.get(nodeId);
  }

  async saveProgress(slot: string): Promise<void> {
    if (this.useRemote) {
      await fetch(`${this.apiBase}/saves/${slot}`, {
        method: 'POST',
        body: JSON.stringify(this.getSaveData())
      });
    }
    // 保留本地存储
  }
}
```

## 6. 实施计划

### Phase 1: 数据迁移
1. 将现有TS文件数据导入数据库
2. 验证数据一致性

### Phase 2: API开发
1. 实现基础CRUD接口
2. 实现存档管理接口
3. 实现剧情推进接口

### Phase 3: 前端适配
1. 改造StoryEngine支持远程加载
2. 添加离线支持
3. 优化加载速度

### Phase 4: 运营功能
1. 灰度发布剧情
2. A/B测试分支
3. 数据分析

## 7. 技术栈

- **后端**: Node.js + Express 或 NestJS
- **数据库**: PostgreSQL + Redis（缓存）
- **部署**: Docker + Kubernetes
