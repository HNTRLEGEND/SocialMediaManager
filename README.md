# WIESLOGIC.DE – KI Prozessautomation & Beratung

Monorepo für die WIESLOGIC Plattform: Next.js 15 Frontend (App Router) + NestJS Backend mit Prisma, PostgreSQL, BullMQ und Stripe/Clerk-Integrationen. Fokus: Multi-Tenant Control Hub für KI-Automatisierung, Voice Agents und Monitoring.

## Struktur

```
.
├─ apps/
│  ├─ web/        # Next.js App Router Frontend, Tailwind + shadcn/ui
│  └─ api/        # NestJS Backend mit Modularer Architektur
├─ turbo.json     # Turborepo Pipeline
├─ pnpm-workspace.yaml
└─ tsconfig.base.json
```

## Quickstart

1. **Abhängigkeiten installieren**
   ```bash
   pnpm install
   ```
2. **Entwicklung starten**
   ```bash
   pnpm dev
   ```
   - `apps/web`: `http://localhost:3000`
   - `apps/api`: `http://localhost:3333`

## Apps

### Frontend (apps/web)

- Next.js 15 App Router, TypeScript, Tailwind, shadcn/ui
- Themen: Dark Theme + Neon Akzente, Poppins + Inter
- Pages: Landingpage, Auth (Clerk), Dashboard mit Overview, Projects, Agents, Workflows, Billing, Admin, Settings, Support
- Features: ROI-Rechner, Case Studies, Realtime Telemetrie über SSE, CTA & Kontaktformular, Insights/Blog-Teaser

### Backend (apps/api)

- NestJS 10 + Prisma + PostgreSQL
- Module: Auth, Organizations, Projects, Agents, Workflows, Dashboard, Billing, Webhooks, Telemetry, Audit, Admin
- BullMQ + Redis für Hintergrundjobs, Socket.IO Gateway für Echtzeit
- Stripe Billing, ElevenLabs TTS, n8n Integrationen (stubs)
- OpenTelemetry, Audit Logging, Row-Level Security vorbereitet

## Infrastruktur

- Docker Compose für Postgres + Redis
- Deployment: Vercel (Frontend), Render/Fly.io (Backend)
- Storage: AWS S3/Cloudflare R2 (Konfiguration in `.env`)

## Entwicklung

- `pnpm dev` – Startet Frontend + Backend parallel (turbo task)
- `pnpm build` – Produktionsbuild
- `pnpm lint` – Linting via Next/Nest Presets
- Prisma Migrationen: `pnpm --filter api prisma migrate dev`

## Sicherheit & Compliance

- Tenant-Isolation via Prisma + Postgres RLS
- Field Encryption Hooks, Rate Limiting, Audit Logs
- DSGVO konformer Betrieb (EU Datacenter)

## Roadmap 90 Tage

1. **Foundation (0–30 Tage)** – Landingpage, Auth, Orgs/Projects/Agents CRUD, ElevenLabs Webhooks, Dashboard v1
2. **Automation (31–60 Tage)** – Workflow Builder, Realtime Telemetrie, Billing Integration, Admin Cockpit
3. **Scale (61–90 Tage)** – Template Library, Reporting, Enterprise Features (SSO/SAML/SCIM), Public API + SDK
