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

Optional CORS origin override:
- `CLIENT_ORIGIN=http://127.0.0.1:5174`
- Multiple origins: comma separated.
