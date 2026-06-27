# SplitMate

Smart shared-expense splitting for groups, guests, recurring bills, budgets, receipts, and settlement tracking.

## Overview

SplitMate helps flatmates, families, travel groups, and office teams record shared expenses, calculate exact balances in integer minor units, and settle with fewer transfers. The app includes secure cookie-based authentication, group permissions, guest members, expiring invitations, receipt uploads, recurring rules, monthly budgets, UPI-aware settlements, activity history, and dashboard analytics.

## Key Features

- Register, login, session restore, refresh-token rotation, forgot/reset password, password change, and logout all sessions.
- Create groups, archive groups, invite members, add guests, and prevent unauthorized group access.
- Add expenses with equal, exact, percentage, and shares-based splits.
- Store all authoritative money values as integer paise/cents.
- Generate deterministic settlement suggestions.
- Track pending, sent, confirmed, cancelled, and rejected settlements.
- Add recurring expenses and run server-side occurrence generation from a scheduled job.
- Create group and category monthly budgets with threshold-aware dashboard progress.
- Attach receipts or payment proof through Cloudinary.
- View recent activity, spending trends, categories, budgets, and upcoming recurring bills.
- Light, dark, and system themes with pre-render theme application.

## Five Real-World Features

1. Recurring expenses and bill reminders: weekly, monthly, and custom recurring rules with pause/resume and idempotent cron generation.
2. Guest members and smart invitations: guests can split expenses immediately; invite links are random, hashed in storage, expiring, previewable, and revocable.
3. Receipts and payment proof: validated image/PDF upload via Multer and Cloudinary, linked to expenses or settlements.
4. Group budgets and spending alerts: real expense-backed usage, remaining amount, days remaining, projected spend, and threshold state.
5. Smart settle-up with UPI and payment tracking: pending/sent/confirmed workflow, partial payments, UPI deep links, references, notes, and proof attachments.

## Technology Stack

- Frontend: React 18, Vite, React Router, React Query, Axios, Chart.js, react-chartjs-2, Lucide React, custom CSS variables, responsive CSS.
- Backend: Node.js, Express, MongoDB, Mongoose, JWT cookies, bcryptjs, Helmet, CORS, express-rate-limit, cookie-parser, Multer, Cloudinary, Nodemailer, Zod validation.
- Tooling: npm, Vitest, Playwright smoke tests, GitHub Actions.

Note: the current repository remains an npm workspace with `apps/web`, `apps/api`, and `packages/shared`. The backend/shared source is TypeScript-checked even though the runtime output is JavaScript.

## Folder Structure

```text
SplitMate/
  apps/
    web/        React/Vite app
    api/        Express/Mongoose API
  packages/
    shared/     Money, split, budget, and settlement utilities
  render.yaml
  README.md
```

## Calculation Approach

All persisted financial values use integer minor units. For INR, Rs 100.50 is stored as `10050`. Split calculations use largest-remainder allocation so participant shares always equal the expense total exactly. Settlement suggestions sort debtors and creditors deterministically and reduce unnecessary transfers.

## Security Highlights

- HttpOnly access and refresh cookies.
- Refresh-token rotation with hashed token storage and reuse revocation.
- Exact CORS allowlist with credentials.
- Helmet, JSON body limits, auth rate limits, origin checks for cookie writes.
- Passwords hashed with bcryptjs.
- Password reset tokens are hashed, expiring, and single-use.
- Group access checks on private resources.
- File type and size validation before Cloudinary uploads.
- Safe production error messages.

## Local Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`. API health is `http://localhost:4000/api/health`.

## Environment Variables

Backend:

```text
PORT
NODE_ENV
MONGODB_URI or MONGO_URI
CLIENT_ORIGIN
CLIENT_URL
CORS_ORIGINS
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
ACCESS_TOKEN_EXPIRES_IN
REFRESH_TOKEN_EXPIRES_IN
COOKIE_DOMAIN
COOKIE_SECURE
COOKIE_SAMESITE
EMAIL_HOST
EMAIL_PORT
EMAIL_USER
EMAIL_PASS
EMAIL_FROM
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
CRON_SECRET
```

Frontend:

```text
VITE_API_URL
```

Use long random values for JWT and cron secrets. Never commit real secrets.

## MongoDB Atlas Setup

1. Create a MongoDB Atlas cluster.
2. Add a database user with a strong password.
3. Allow Render outbound access or configure an IP allowlist suitable for your environment.
4. Copy the connection string into `MONGO_URI` or `MONGODB_URI`.
5. Use a database name such as `splitmate`.

## Cloudinary Setup

1. Create a Cloudinary project.
2. Add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` to the API environment.
3. Restart the API.
4. If Cloudinary variables are absent, upload endpoints return a clear `UPLOAD_DISABLED` error and the rest of the app continues to work.

## Email Setup

Set SMTP variables for password reset, invitation, budget, recurring, and settlement emails:

```text
EMAIL_HOST
EMAIL_PORT
EMAIL_USER
EMAIL_PASS
EMAIL_FROM
```

When email is not configured, development logs a warning and does not crash.

## Seed Data

```bash
npm run seed
```

Demo account:

```text
Email: demo@splitmate.app
Password: DemoPass123!
```

The seed resets local demo collections and creates travel, flatmate, guest, expense, settlement, recurring, budget, and activity data. Do not run destructive seed logic against production.

## Testing Commands

```bash
npm run lint
npm test
npm run build
npm run test:e2e
```

Playwright smoke tests require the app servers to be running.

## API Overview

- `GET /api/health`
- `/api/auth`: signup, login, refresh, logout, logout-all, me, forgot/reset password, change password
- `/api/users`: profile update
- `/api/groups`: groups, archive, join invite
- `/api/groups/:groupId/members`: invite, add guest, role update, remove
- `/api/groups/:groupId/expenses`: list, create, update, delete
- `/api/groups/:groupId/recurring`: recurring rules
- `/api/groups/:groupId/budgets`: budgets
- `/api/groups/:groupId/settlements`: settlements and confirmation workflow
- `/api/groups/:groupId/activity`: activity timeline
- `/api/attachments`: receipt/payment proof uploads
- `/api/notifications`: in-app notifications
- `/api/recurring/generate`: secured cron generation endpoint

## Vercel Deployment

1. Create a Vercel project with root directory `apps/web`.
2. Build command: `npm run build`.
3. Output directory: `dist`.
4. Add `VITE_API_URL=https://your-render-api.onrender.com/api`.
5. `apps/web/vercel.json` rewrites React routes to `index.html`.

## Render Deployment

1. Create a Render web service from this repository.
2. Build command: `npm ci && npm run build`.
3. Start command: `npm start`.
4. Set `NODE_ENV=production`, `COOKIE_SECURE=true`, and `COOKIE_SAMESITE=none` for cross-site Vercel/Render cookies.
5. Set `CLIENT_URL` and `CORS_ORIGINS` to the exact Vercel URL.
6. Add MongoDB Atlas, JWT, Cloudinary, email, and cron variables.
7. Confirm `GET /api/health` returns success.

## Render Cron Setup

Create a Render Cron Job that sends:

```bash
curl -X POST https://your-render-api.onrender.com/api/recurring/generate \
  -H "x-cron-secret: $CRON_SECRET"
```

Recommended schedule: once per hour. The generation logic is idempotent and prevents duplicate occurrences.

## Common Troubleshooting

- `401` after deploy: check `CLIENT_URL`, `CORS_ORIGINS`, `COOKIE_SECURE`, and `COOKIE_SAMESITE`.
- Upload disabled: add Cloudinary variables to the API service.
- Password reset not emailed: add SMTP variables or check development logs.
- Build cannot find shared package: run commands from the repository root.
- Mongo connection fails: verify Atlas credentials, network access, and connection string.

## Future Improvements

- Add OCR-assisted receipt parsing.
- Add richer notification preferences and email templates.
- Add more frontend component tests and authenticated Playwright flows.
- Migrate the workspace layout to `client/` and `server/` if strict non-workspace deployment structure is required.

## Author

Built as a portfolio-ready MERN expense-sharing platform for placement interviews and production-style engineering review.
