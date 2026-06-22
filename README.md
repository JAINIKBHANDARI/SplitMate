# SplitMate

Premium shared-expense tracking with deterministic split math, live balances, and settlement suggestions.

## Architecture

- `apps/web` — React JavaScript, Vite, Tailwind, React Query, Chart.js.
- `apps/api` — Express, TypeScript, Mongoose, Argon2id and rotating JWT cookies.
- `packages/shared` — exact minor-unit split and settlement engine shared by the app.

The development client proxies `/api` to Express. In production, Express serves the built Vite bundle for a same-origin deployment.

## Run locally

1. Install Node 20+ and MongoDB 7+.
2. Copy `.env.example` to `.env` and replace the JWT secrets with random strings of 32+ characters.
3. Install and run:

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. The API health check is at `http://localhost:4000/api/health`; OpenAPI docs are at `http://localhost:4000/api/docs`.

## Demo data

With MongoDB running, seed a realistic account:

```bash
npm run seed
```

Use `demo@splitmate.app` with password `DemoPass123!`.

## Environment

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET` | 32+ character access-token secret |
| `JWT_REFRESH_SECRET` | Different 32+ character refresh-token secret |
| `CLIENT_ORIGIN` | Browser origin, e.g. `http://localhost:5173` |
| `PORT` / `API_PORT` | API port (default 4000) |
| `COOKIE_SECURE` | `true` only behind HTTPS |

## Docker

```bash
cp .env.example .env
npm run docker:up
```

The compose stack includes persistent MongoDB storage and serves the production build at `http://localhost:4000`. Stop it with `npm run docker:down`.

## Verify

```bash
npm run lint
npm test
npm run build
npm run test:e2e
```

For Playwright, start the API and web dev servers first. CI installs, lints, tests, and builds on every push and pull request.

## Deployment notes

Set `NODE_ENV=production`, point `MONGODB_URI` to managed MongoDB, use long unique JWT secrets, configure `CLIENT_ORIGIN` to the deployed URL, and set `COOKIE_SECURE=true`. Deploy the API container behind HTTPS; it serves the compiled frontend itself, so cookie auth stays same-origin. Password-reset URLs are logged in development; plug a transactional email provider into the reset delivery boundary before public launch.
