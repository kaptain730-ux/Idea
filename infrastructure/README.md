# Infrastructure Notes

- Target hosting: Vercel (web), Render/Fly.io (API), Supabase (Postgres), Upstash (Redis).
- `docker-compose.yml` spins up Postgres + Redis for local development. Use `npm run db:up` / `npm run db:down`.
- Keep Terraform or Pulumi stacks here if infra-as-code is required later.
