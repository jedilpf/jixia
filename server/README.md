# Jixia Backend (P2 Persistent Core)

## Scope
- Keep existing PvE match backend contract.
- Add persistent backend APIs for:
  - Story saves (`autosave`, `manual_1`, `manual_2`, `manual_3`)
  - Player progress profile

## Storage
- File-based JSON persistence (no external DB dependency in this stage).
- Default data directory: `data/backend`
- Files:
  - `story-saves.json`
  - `player-progress.json`

Override data directory:
```bash
BACKEND_DATA_DIR=./data/backend npm run server:start
```

## Run
```bash
npm run server:dev
```
or
```bash
npm run server:start
```

Default host/port:
- Host: `127.0.0.1`
- Port: `8787`

## Existing Match API
- `POST /api/v1/matches/ai` create AI match
- `GET /api/v1/matches/:matchId` query match snapshot
- `GET /api/v1/matches?limit=50` list active matches
- `DELETE /api/v1/matches/:matchId` remove match

## Story Save API
Identity can be provided by:
- Header: `x-user-id` (recommended)
- Header: `x-device-id`
- Query/body fallback: `userId`

Endpoints:
- `GET /api/v1/story/saves`
- `GET /api/v1/story/saves/:slotType`
- `POST /api/v1/story/saves/:slotType`
- `POST /api/v1/story/saves/:slotType/load`
- `DELETE /api/v1/story/saves/:slotType`

`slotType` allowed values:
- `autosave`
- `manual_1`
- `manual_2`
- `manual_3`

Save request body format:
```json
{
  "data": {
    "currentNodeId": "ch_moru_001_n001",
    "player": {},
    "progress": {
      "chapter": 1,
      "scene": 1,
      "completedNodes": []
    }
  }
}
```

## Player Progress API
- `GET /api/v1/progress`
- `PUT /api/v1/progress`
- `PATCH /api/v1/progress`
- `DELETE /api/v1/progress`

`PUT`/`PATCH` accepts either:
- direct payload object
- `{ "data": payload }`

## Health
- `GET /health`
- Includes `story/progress` storage stats and server timestamp.

## Socket.IO
- Keeps existing event contract:
  - `client:ping`
  - `client:subscribe-match`
  - `server:hello`
  - `server:pong`
  - `server:match-state`
  - `server:error`
