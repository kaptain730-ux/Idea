# CampusDash Monorepo

CampusDash is a smart campus logistics platform. This repository hosts the polyrepo-style scaffolding for web, API, shared packages, and infrastructure assets.

## Structure

- `apps/web` – Next.js 16 app router frontend
- `apps/api` – Express + Prisma backend
- `packages/ui` – Shared UI primitives built with React
- `packages/config` – Shared configuration (TypeScript, ESLint)
- `infrastructure` – Deployment manifests and docs

## Getting Started

```bash
npm install
npm run db:up          # start Postgres + Redis via Docker
cp .env.example .env   # configure secrets, reuse inside apps/api/.env
npm run db:migrate     # run Prisma migrations (requires DATABASE_URL)
npm run db:seed        # optional demo data
npm run dev:api        # Express dev server (http://localhost:4000)
npm run dev:web        # Next.js dev server (http://localhost:3000)
```

Stop infrastructure with `npm run db:down`.

## Environment

- `.env` at repo root feeds `DATABASE_URL`, `REDIS_URL`, etc.
- `NEXT_PUBLIC_API_URL` tells the Next.js client where to find the Express API (defaults to `http://localhost:4000`).
- `NEXT_PUBLIC_RUNNER_ID` is used by the runner console to impersonate a demo runner user seeded in the database.
- `ACCESS_TOKEN_TTL` / `REFRESH_TOKEN_TTL` let you tune JWT expiry windows (defaults 15m / 7d).
- `apps/api/.env` can mirror those values for IDE tooling; runtime picks up root env when using npm scripts.

## Tooling

- Workspace orchestrated with `turbo`
- TypeScript strict mode everywhere
- Prisma schema aligned with initial CampusDash entities
- Docker Compose recipe for repeatable local services

## Auth workflow

1. `POST /auth/otp/send` with `{ "contact": "demo@campusdash.test" }` to generate a 6-digit OTP (returned as `previewCode` during local development).
2. `POST /auth/otp/verify` with the code to obtain `accessToken` and `refreshToken` JWTs tied to the user's role.
3. Include `Authorization: Bearer <accessToken>` on protected requests; `POST /auth/refresh` swaps a valid refresh token for a new pair.
4. `GET /auth/me` (requires a token) returns the authenticated profile so clients can gate student vs. runner vs. admin functionality.
>>>>>>> cb7b307d8ebcbafbd8419d38d9eb693e19db30c5
