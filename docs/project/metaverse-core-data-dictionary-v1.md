# 元宇宙核心数据字典 v1

更新时间：2026-04-02  
任务ID：TASK-20260402-122  
主责：Codex（架构与复杂系统）

---

## 1. 目标与设计原则

本字典用于统一“身份-存档-社交-世界-经济”五层数据，目标是在**尽量不改现有核心玩法**的前提下，增加可持续在线能力。

设计原则：
- 增量演进：保留现有 `story/progress/matches` 数据结构，新增统一外层主键。
- 强兼容：现有 `/api/v1/*` 可继续使用，逐步接入 `/api/v2/*`。
- 可审计：关键资产变更必须可追溯（ledger/event log）。
- 可治理：为风控、申诉、回滚预留必要字段。

---

## 2. 全局主键与命名规范

## 2.1 主键规范
- `player_id`: `plyr_<ulid>`
- `device_id`: `dev_<hash>`
- `asset_id`: `ast_<ulid>`
- `room_id`: `room_<ulid>`
- `event_id`: `evt_<yyyy><mm><seq>`
- `tx_id`: `tx_<ulid>`
- `season_id`: `season_<yyyy>_<index>`

## 2.2 时间与版本字段
- 所有核心实体必须包含 `created_at`、`updated_at`（ISO 8601）。
- 可变结构体必须包含 `schema_version`（如 `1.0.0`）。
- 业务流程型实体必须包含 `status` 与 `status_reason`（可空）。

## 2.3 多端一致性字段
- `revision`: 乐观锁版本号（整数，单调递增）。
- `source`: 来源标识（`client_web` / `client_pc` / `backend_job`）。
- `idempotency_key`: 防重提交键（写接口必填）。

---

## 3. 核心实体定义

## 3.1 Identity（身份层）

### 3.1.1 PlayerIdentity
```json
{
  "player_id": "plyr_01H...",
  "schema_version": "1.0.0",
  "display_name": "string",
  "avatar_url": "string|null",
  "locale": "zh-CN",
  "timezone": "Asia/Shanghai",
  "status": "active",
  "status_reason": null,
  "created_at": "2026-04-02T12:00:00.000Z",
  "updated_at": "2026-04-02T12:00:00.000Z",
  "revision": 1
}
```

### 3.1.2 DeviceBinding
```json
{
  "player_id": "plyr_01H...",
  "device_id": "dev_abcd...",
  "platform": "web",
  "trusted": true,
  "last_seen_at": "2026-04-02T12:00:00.000Z",
  "created_at": "2026-04-02T12:00:00.000Z",
  "updated_at": "2026-04-02T12:00:00.000Z",
  "revision": 3
}
```

---

## 3.2 Save & Progress（进度层）

### 3.2.1 StorySaveSlot（兼容现有 slot）
```json
{
  "player_id": "plyr_01H...",
  "slot_type": "autosave",
  "save_payload": {
    "currentNodeId": "prolog_0_1",
    "player": {},
    "progress": {
      "chapter": 0,
      "scene": 1,
      "completedNodes": [],
      "visitedNodes": []
    },
    "history": {
      "nodeIds": [],
      "choices": [],
      "entries": []
    },
    "runtime": {},
    "bridgeState": {}
  },
  "summary": {
    "chapter": 0,
    "node_count": 1,
    "current_node_id": "prolog_0_1",
    "saved_at": 1712040000000
  },
  "schema_version": "1.1.0",
  "created_at": "2026-04-02T12:00:00.000Z",
  "updated_at": "2026-04-02T12:00:00.000Z",
  "revision": 9
}
```

### 3.2.2 PlayerProgressState（兼容现有 progress）
```json
{
  "player_id": "plyr_01H...",
  "level": 1,
  "exp": 0,
  "total_exp": 0,
  "win_count": 0,
  "total_games": 0,
  "win_streak": 0,
  "total_damage": 0,
  "collected_cards": 12,
  "total_cards": 190,
  "opportunity": 0,
  "last_settlement_key": null,
  "unlocked_personages": [],
  "faction_reputation": {
    "rujia": 0,
    "fajia": 0,
    "mojia": 0,
    "daojia": 0,
    "mingjia": 0,
    "yinyang": 0
  },
  "schema_version": "1.0.0",
  "created_at": "2026-04-02T12:00:00.000Z",
  "updated_at": "2026-04-02T12:00:00.000Z",
  "revision": 4
}
```

---

## 3.3 Social & Lobby（社交层）

### 3.3.1 LobbyRoom
```json
{
  "room_id": "room_01H...",
  "owner_player_id": "plyr_01H...",
  "mode": "casual",
  "visibility": "public",
  "capacity": 4,
  "status": "open",
  "tags": ["story", "newbie"],
  "created_at": "2026-04-02T12:00:00.000Z",
  "updated_at": "2026-04-02T12:00:00.000Z",
  "revision": 1
}
```

### 3.3.2 RoomParticipant
```json
{
  "room_id": "room_01H...",
  "player_id": "plyr_01H...",
  "role": "host",
  "seat_index": 0,
  "ready": true,
  "joined_at": "2026-04-02T12:01:00.000Z",
  "updated_at": "2026-04-02T12:01:00.000Z",
  "revision": 2
}
```

### 3.3.3 FriendRelation（阶段B预留）
```json
{
  "player_id": "plyr_01H...",
  "target_player_id": "plyr_01X...",
  "state": "accepted",
  "note": null,
  "created_at": "2026-04-02T12:00:00.000Z",
  "updated_at": "2026-04-02T12:00:00.000Z",
  "revision": 1
}
```

---

## 3.4 World Event（世界层）

### 3.4.1 WorldEvent
```json
{
  "event_id": "evt_202604_001",
  "season_id": "season_2026_1",
  "title": "稷下春辩季",
  "event_type": "weekly_theme",
  "status": "active",
  "start_at": "2026-04-08T00:00:00.000Z",
  "end_at": "2026-04-15T00:00:00.000Z",
  "ruleset_id": "ruleset_weekly_001",
  "rewards": [],
  "schema_version": "1.0.0",
  "created_at": "2026-04-02T12:00:00.000Z",
  "updated_at": "2026-04-02T12:00:00.000Z",
  "revision": 1
}
```

### 3.4.2 EventParticipation
```json
{
  "event_id": "evt_202604_001",
  "player_id": "plyr_01H...",
  "score": 120,
  "rank_bucket": "top_20",
  "reward_claimed": false,
  "last_match_at": "2026-04-09T09:00:00.000Z",
  "created_at": "2026-04-08T00:10:00.000Z",
  "updated_at": "2026-04-09T09:00:00.000Z",
  "revision": 5
}
```

---

## 3.5 Economy（经济层，阶段C起用）

### 3.5.1 EconomyWallet
```json
{
  "player_id": "plyr_01H...",
  "balances": {
    "coin": 1000,
    "token": 20
  },
  "frozen_balances": {
    "coin": 0,
    "token": 0
  },
  "schema_version": "1.0.0",
  "created_at": "2026-04-02T12:00:00.000Z",
  "updated_at": "2026-04-02T12:00:00.000Z",
  "revision": 1
}
```

### 3.5.2 LedgerTransaction
```json
{
  "tx_id": "tx_01H...",
  "player_id": "plyr_01H...",
  "direction": "in",
  "asset_type": "coin",
  "amount": 100,
  "before_balance": 900,
  "after_balance": 1000,
  "reason_code": "event_reward",
  "ref_id": "evt_202604_001",
  "risk_flags": [],
  "created_at": "2026-04-09T10:00:00.000Z",
  "revision": 1
}
```

---

## 4. 实体关系图（文字版）

- `PlayerIdentity` 1:N `DeviceBinding`
- `PlayerIdentity` 1:N `StorySaveSlot`
- `PlayerIdentity` 1:1 `PlayerProgressState`
- `LobbyRoom` 1:N `RoomParticipant`
- `WorldEvent` 1:N `EventParticipation`
- `PlayerIdentity` 1:1 `EconomyWallet`
- `PlayerIdentity` 1:N `LedgerTransaction`

---

## 5. 与现有系统映射（低改动策略）

## 5.1 Story Save 映射
- 现有 `server/routes/story.cjs` 的 slot 机制保留：`autosave`, `manual_1`, `manual_2`, `manual_3`。
- 新增 `player_id` 外层绑定，不改 `save_payload` 内核字段。

## 5.2 Progress 映射
- 现有 `player-progress-store.cjs` 字段保持，新增 `schema_version/revision` 元字段。
- 字段命名由接口层兼容（snake_case <-> camelCase）完成，不要求一次性迁移。

## 5.3 Match 映射
- 现有 `/api/v1/matches` 继续服务战斗核心。
- 元宇宙阶段通过 `room_id` 与 `event_id` 进行外层关联，不改战斗判定逻辑。

---

## 6. 版本与迁移规则

- 规则1：读兼容 >= 2 个小版本（N 与 N-1）。
- 规则2：写入统一走新版本结构，旧版本在读取时适配。
- 规则3：涉及资产与经济字段变更必须走“影子写入 + 审计校验”。
- 规则4：任一迁移脚本必须可回滚，并在预发演练一次。

---

## 7. 分工落地清单

- Codex：数据模型与迁移策略、版本兼容、异常回滚设计。
- Antigravity：仅消费“只读展示字段”用于 UI（不参与数据主结构变更）。
- Trae：维护 `event_type/reason_code/文案映射表`，保证前后端语义一致。

---

## 8. 下一步执行建议

1. 输出 `metaverse-api-contract-draft-v1.md` 并与本字典逐字段对齐。  
2. 在 `server` 新建 `api/v2` 路由骨架（只返回 mock 数据）。  
3. 先完成 Identity + Cloud Save 双模块联调，再推进 Lobby。  
