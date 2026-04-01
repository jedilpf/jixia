# Jixia Backend (P1 Skeleton)

## Purpose
- Provide a minimal backend foundation for PvE (human vs AI).
- Keep existing frontend battle flow unchanged in this stage.

## Implemented in P1
- `GET /health` health check endpoint.
- `POST /api/v1/matches/ai` create local in-memory AI match.
- `GET /api/v1/matches/:matchId` query match snapshot.
- Socket.IO base connection and match subscribe event.
- Request logging and centralized error response middleware.

## Run
```bash
npm run server:dev
```

or

```bash
npm run server:start
```

Default port: `8787`  
Override with env: `BACKEND_PORT=9000`

Default host bind: `127.0.0.1`  
Override with env: `BACKEND_HOST=0.0.0.0`

Optional CORS origin override:
- Default allows local Vite origins: `127.0.0.1/localhost` on `5173` and `5174`
- Custom override: `CLIENT_ORIGIN=http://127.0.0.1:5173`
- Multiple origins: comma separated.

Optional match lifecycle hardening:
- `MATCH_TTL_MS=14400000` (default 4 hours): expire inactive in-memory matches.
- `REQUIRE_PLAYER_ID=true`: require socket subscribers to provide `playerId` bound to match participants.
