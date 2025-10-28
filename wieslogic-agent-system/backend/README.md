WiesLogic Backend (NestJS + Prisma)

Overview
- Minimal NestJS module and Prisma schema implementing Phase 1 (Foundation):
  - Prisma schema for WiesLogic tables
  - NestJS module structure (`WiesLogicModule`)
  - Services: CustomerAgentConfig, SheetMapping, ProductCatalog, AgentOrchestration
  - Controllers: Config (CRUD + mappings), Webhook (example entrypoint)

Prerequisites
- Node.js 18+
- PostgreSQL database

Setup
1) Install dependencies
   npm install

2) Configure environment
   cp .env.example .env
   # Edit DATABASE_URL to point to your Postgres instance

3) Generate Prisma client
   npm run prisma:generate

4) Run database migrations (development)
   npm run prisma:migrate

5) Start dev server
   npm run dev

API Endpoints
- POST  /api/wieslogic/config/:customerId           Create configuration
- GET   /api/wieslogic/config/:customerId           Get configuration
- PATCH /api/wieslogic/config/:customerId           Update configuration
- GET   /api/wieslogic/config/:customerId/sheets    Get sheet mappings
- POST  /api/wieslogic/config/:customerId/sheets    Upsert one sheet mapping
- POST  /api/wieslogic/webhooks/:customerId/lead    Example webhook proxy

Notes
- The `Customer` model in Prisma is minimal to satisfy FK constraints. Replace with your real Customer table or adjust relations when integrating into your main backend.
- The Personal Assistant fields are included (optional) as per docs/PERSONAL_ASSISTANT_INTEGRATION.md.
- In production, forward webhook requests from this backend to n8n MASTER controller URL with authentication.

