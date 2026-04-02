# 元宇宙 API 契约草案 v1

更新时间：2026-04-02  
任务ID：TASK-20260402-122  
主责：Codex（接口框架与复杂链路）

---

## 1. 目标与范围

本草案定义元宇宙方向第一阶段可实施的接口契约，覆盖：
- Identity（身份）
- Cloud Save（云存档）
- Progress（成长进度）
- Social Lobby（大厅与房间）
- World Event（世界事件）
- Economy（经济，阶段C预留）

目标是**不破坏现有 `/api/v1/*`**，通过 `/api/v2/*` 渐进上线。

---

## 2. 基础协议

## 2.1 Base URL
- 开发环境：`/api/v2`
- 内网调用：`http://<host>:<port>/api/v2`

## 2.2 鉴权约定（阶段A）
- 必须携带：`x-user-id`
- 可选：`x-device-id`, `x-client-version`, `x-request-id`
- 后续阶段（B/C）升级为 `Authorization: Bearer <token>`

## 2.3 通用响应包
```json
{
  "ok": true,
  "data": {},
  "meta": {
    "request_id": "req_01H...",
    "server_time": "2026-04-02T12:00:00.000Z",
    "revision": 3
  }
}
```

失败包：
```json
{
  "ok": false,
  "error": {
    "code": "REQUEST_ERROR",
    "message": "Invalid slot type.",
    "details": {}
  },
  "meta": {
    "request_id": "req_01H...",
    "server_time": "2026-04-02T12:00:00.000Z"
  }
}
```

## 2.4 幂等与并发控制
- 写接口必须接受 `idempotency_key`。
- 关键写接口（存档、资产）支持 `if_revision`。
- 返回 `409` 表示版本冲突，客户端按最新版本重试。

---

## 3. 错误码规范

| code | http | 说明 |
|---|---|---|
| REQUEST_ERROR | 400 | 参数错误、字段缺失、slot非法 |
| UNAUTHORIZED | 401 | 未认证或认证失效 |
| FORBIDDEN | 403 | 权限不足 |
| NOT_FOUND | 404 | 资源不存在 |
| CONFLICT | 409 | revision 冲突或重复提交冲突 |
| RATE_LIMITED | 429 | 触发限流 |
| INTERNAL_ERROR | 500 | 服务内部错误 |
| UPSTREAM_ERROR | 502 | 上游依赖异常 |

---

## 4. 接口清单（按模块）

## 4.1 Identity

### POST `/identity/guest-session`
用途：创建游客会话并返回 `player_id`。  
请求：
```json
{
  "device_id": "dev_xxx",
  "client_version": "0.0.1",
  "locale": "zh-CN"
}
```
响应：
```json
{
  "ok": true,
  "data": {
    "player_id": "plyr_01H...",
    "session_token": "token_xxx",
    "expires_in_sec": 86400
  }
}
```

### GET `/identity/me`
用途：查询当前身份档案。  
响应字段与 `PlayerIdentity` 对齐。

### POST `/identity/bind-device`
用途：绑定新设备或更新设备信任状态。

---

## 4.2 Cloud Save（兼容现有 Story Save）

### GET `/story/saves`
用途：获取四槽摘要（`autosave/manual_1/manual_2/manual_3`）。

### GET `/story/saves/:slot_type`
用途：读取完整存档。

### PUT `/story/saves/:slot_type`
用途：写入存档。  
请求：
```json
{
  "idempotency_key": "save_20260402_001",
  "if_revision": 8,
  "save_payload": {}
}
```

### POST `/story/saves/:slot_type/load`
用途：触发读取语义接口（兼容现有前端语义）。

### DELETE `/story/saves/:slot_type`
用途：删除指定槽位。

---

## 4.3 Progress（兼容现有 Player Progress）

### GET `/progress`
用途：读取玩家成长状态。

### PUT `/progress`
用途：全量覆盖写入。

### PATCH `/progress`
用途：增量更新写入（推荐默认方式）。

### DELETE `/progress`
用途：删除当前玩家进度（仅管理场景）。

---

## 4.4 Social Lobby（阶段B）

### GET `/lobby/summary`
用途：大厅摘要（在线人数、可加入房间数、活跃事件）。

### GET `/lobby/rooms`
用途：分页查询房间列表。  
查询参数：`page`, `limit`, `mode`, `visibility`

### POST `/lobby/rooms`
用途：创建房间。

### POST `/lobby/rooms/:room_id/join`
用途：加入房间。  

### POST `/lobby/rooms/:room_id/leave`
用途：离开房间。

### POST `/lobby/rooms/:room_id/ready`
用途：准备状态切换。

---

## 4.5 World Event（阶段B）

### GET `/world/events/active`
用途：获取当前活动事件列表。

### GET `/world/events/:event_id`
用途：获取单个事件详情。

### POST `/world/events/:event_id/participate`
用途：报名/参与事件。

### GET `/world/events/:event_id/leaderboard`
用途：查询事件榜单（分页）。

---

## 4.6 Economy（阶段C，预留）

### GET `/economy/wallet`
用途：读取钱包余额。

### GET `/economy/ledger`
用途：查询流水账。

### POST `/economy/ledger/transfer`
用途：执行受控转账（仅白名单）。

### POST `/economy/reward/claim`
用途：领取活动/赛季奖励。

---

## 5. 与 `/api/v1` 兼容策略

## 5.1 双轨期（建议至少 2 个版本周期）
- `/api/v1`：稳定主链路，维持当前客户端可用。
- `/api/v2`：新增元宇宙能力与新字段。

## 5.2 适配层规则
- v1 写入时，后端同步写入 v2 基础字段（`player_id/revision/schema_version`）。
- v2 读取时，如缺少新字段，自动从 v1 结构推断并补默认值。

## 5.3 回滚策略
- 发现 v2 质量问题时，网关层一键回退到 v1。
- 回滚不影响已存在的 v1 读写能力。

---

## 6. 安全与风控要求

- 写接口限流（用户级 + 设备级）。
- 关键交易接口需要风控评分字段 `risk_score`。
- 所有经济相关接口必须记录审计日志（request_id, player_id, tx_id）。
- 后端错误对外脱敏，不返回堆栈。

---

## 7. 可观测性与SLA

关键指标：
- 接口成功率（按模块）
- p95 延迟（读 <= 120ms，写 <= 200ms）
- 幂等冲突率
- revision 冲突率
- 存档读写一致性

建议SLA（阶段A）：
- Identity: 99.9%
- Save/Progress: 99.9%
- Lobby/Event: 99.5%

---

## 8. 团队分工落地（接口侧）

- Codex：
  - 负责 v2 契约定义、服务边界、幂等和并发策略。
  - 负责复杂路由（lobby/world/economy）与兼容适配层。
- Trae：
  - 负责 `error.message` 友好文案、事件文案映射、状态描述文案词典。
- Antigravity：
  - 基于契约字段设计前端状态组件（loading/error/empty/success）视觉规范。

---

## 9. 下一步执行项（可直接开工）

1. 在 `server` 创建 `/api/v2` 路由骨架（identity/save/progress 先行）。  
2. 先把 `/story/saves` 与 `/progress` 做 v1-v2 双写适配。  
3. 新增接口契约测试（成功/失败/冲突三类）并接入 `npm run test`。  
