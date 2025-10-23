# WIESLOGIC.DE – The Control Hub for AI Automation (2026 Edition)

Eine vollständige, moderne Monorepo-Codebasis für **WIES.AI / WIESLOGIC.DE**. Sie kombiniert eine neon-inspirierte Marketing-Landingpage, ein mandantenfähiges Kundenportal und ein skalierbares NestJS-Backend inklusive Prisma/PostgreSQL, BullMQ, Stripe-Stub sowie ElevenLabs-/n8n-Integrationspunkten.

Die Readme richtet sich ausdrücklich auch an Einsteiger:innen. Jeder Schritt – vom Herunterladen der Dateien bis zum Starten der Entwicklungsumgebung in Visual Studio (oder Visual Studio Code) – ist detailliert beschrieben. Außerdem findest du Hinweise zur Fehlerbehebung, falls `pnpm install` oder andere Schritte Schwierigkeiten bereiten.

---

## Inhaltsverzeichnis

1. [Warum dieses Projekt?](#warum-dieses-projekt)
2. [Tech-Stack & Architektur](#tech-stack--architektur)
3. [Repository-Struktur](#repository-struktur)
4. [Schnellstart für Einsteiger:innen](#schnellstart-für-einsteigerinnen)
    - [Schritt 0: Voraussetzungen prüfen](#schritt-0-voraussetzungen-prüfen)
    - [Schritt 1: Code herunterladen & speichern](#schritt-1-code-herunterladen--speichern)
    - [Schritt 2: Projekt in Visual-Studio-Umgebung öffnen](#schritt-2-projekt-in-visual-studio-umgebung-öffnen)
    - [Schritt 3: Node.js & pnpm installieren](#schritt-3-nodejs--pnpm-installieren)
    - [Schritt 4: Umgebungsvariablen anlegen](#schritt-4-umgebungsvariablen-anlegen)
    - [Schritt 5: Datenbank & Redis starten](#schritt-5-datenbank--redis-starten)
    - [Schritt 6: Abhängigkeiten installieren](#schritt-6-abhängigkeiten-installieren)
    - [Schritt 7: Prisma-Migrationen ausführen](#schritt-7-prisma-migrationen-ausführen)
    - [Schritt 8: Entwicklungsserver starten](#schritt-8-entwicklungsserver-starten)
    - [Schritt 9: Produktion builden & testen](#schritt-9-produktion-builden--testen)
5. [Frontend-Highlights (Next.js 15 + Tailwind)](#frontend-highlights-nextjs-15--tailwind)
6. [Backend-Highlights (NestJS + Prisma)](#backend-highlights-nestjs--prisma)
7. [Arbeiten mit Git & GitHub](#arbeiten-mit-git--github)
8. [Tipps für Visual Studio & Visual Studio Code](#tipps-für-visual-studio--visual-studio-code)
9. [Fehlerbehebung & FAQ](#fehlerbehebung--faq)
10. [Tests, Linting & weitere Skripte](#tests-linting--weitere-skripte)
11. [Roadmap für die nächsten 90 Tage](#roadmap-für-die-nächsten-90-tage)

---

## Warum dieses Projekt?

- **Positionierung wie Grant Cardone**: Ein auf Wachstum, Performance und Conversion optimiertes Auftreten für KI-Beratungsleistungen.
- **10x Mindset in Code**: Die Plattform deckt Marketing, Kundenzugang, Agent-Konfiguration, Workflow-Steuerung, Billing und Admin-Kontrolle ab.
- **Zukunftssichere Architektur**: Turborepo, modulare Services, Multi-Tenant-Design, Echtzeit-Telemetrie, Guardrails und Audit Trails.
- **Leichte Erweiterbarkeit**: Für spätere CMS-Anbindung, Self-Service-Templates, SSO/SAML oder Public API vorbereitet.

---

## Tech-Stack & Architektur

| Layer            | Technologien                                                                                                               |
|------------------|-----------------------------------------------------------------------------------------------------------------------------|
| Frontend         | Next.js 15 (App Router), React 18, TypeScript, TailwindCSS, shadcn/ui, Framer Motion, Clerk Auth, SSE + Socket.IO Hooks     |
| Backend          | NestJS 10, Prisma ORM, PostgreSQL, BullMQ (Redis), Stripe (Usage Billing), ElevenLabs TTS Webhooks, n8n-Integrations-Stubs  |
| Infrastruktur    | Turborepo + pnpm Workspace, Docker Compose (Postgres/Redis), Pino Logging, OpenTelemetry Hooks, GitHub Actions-ready        |
| Sicherheit       | JWT/Auth-Stub mit Clerk-Integration, Row-Level-Security-Konzept, Audit Logging, Guardrails & Rate-Limiting-Platzhalter      |

---

## Repository-Struktur

```
.
├── apps/
│   ├── api/          # NestJS Backend (Module: Auth, Agents, Workflows, Billing, Telemetry, Admin, Webhooks, ...)
│   └── web/          # Next.js 15 Frontend (Landingpage + Dashboard)
├── docker-compose.yml# Lokale Datenbank (Postgres) + Redis für BullMQ
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── turbo.json        # Turborepo Pipelines für dev/build/lint
└── .env.example      # Vorlage für alle benötigten Umgebungsvariablen
```

Wichtige Frontend-Ordner:

- `apps/web/app` – App Router Pages (`/` Landingpage, `(dashboard)` Kundenportal, API-Routen).
- `apps/web/components` – UI-Komponenten (Sections, Dashboard-Widgets, Floating-CTA, AI-Assistent).
- `apps/web/lib` – Hilfsfunktionen, Fake-Daten, SSE Hook (`useRealtimeTelemetry`).
- `apps/web/components/ui` – Reusable Buttons/Cards (shadcn/ui-inspiriert).

Backend-Ordner:

- `apps/api/src/modules` – Feature-Module (Agents, Workflows, Billing, Webhooks, Telemetry, Admin, ...).
- `apps/api/prisma/schema.prisma` – Datenbankmodell inkl. Tenant-IDs, Audit-Logs, Billing Accounts, Agent Runs.
- `apps/api/src/prisma/prisma.service.ts` – Prisma-Client, Tenant Helper, Logging.

---

## Schnellstart für Einsteiger:innen

### Schritt 0: Voraussetzungen prüfen

| Tool                | Empfehlung                                                                                          |
|---------------------|-----------------------------------------------------------------------------------------------------|
| Git                 | [Download](https://git-scm.com/downloads) für Windows/macOS/Linux                                   |
| Node.js             | Version **≥ 18.18.0** (LTS). Empfohlen: Installation via [nvm](https://github.com/nvm-sh/nvm)        |
| pnpm                | Version **≥ 8.15.4** (wird via Corepack installiert, siehe Schritt 3)                              |
| Docker (optional)   | Für lokale Postgres/Redis-Container. Desktop-App für Windows/macOS oder `docker` CLI für Linux      |
| Visual Studio / VS Code | Visual Studio 2022 (mit „Node.js-Entwicklung“-Workload) oder Visual Studio Code (empfohlen) |

### Schritt 1: Code herunterladen & speichern

Du hast drei Möglichkeiten:

1. **Git Clone (empfohlen, wenn du mit Git arbeitest)**
   ```bash
   git clone https://github.com/dein-github-account/wieslogic-platform.git
   cd wieslogic-platform
   ```

2. **GitHub als ZIP herunterladen**
   - Gehe auf die GitHub-Seite des Projekts (oder verwende `Code → Download ZIP`).
   - Entpacke das ZIP in einen Ordner deiner Wahl, z. B. `C:\Projekte\WIESLOGIC` oder `~/Projects/WIESLOGIC`.
   - Dieser Ordner ist nun dein Projektverzeichnis.

3. **GitHub Desktop / „Add Existing Repository“**
   - Starte GitHub Desktop → `File > Clone repository`.
   - Wähle das Repo aus oder gib die URL an.
   - Zielordner auswählen → „Clone“.

> 💡 **Tipp:** Wenn du später deine Änderungen auf GitHub pushen möchtest, solltest du Variante 1 oder 3 wählen, damit ein Git-Repository eingerichtet ist.

### Schritt 2: Projekt in Visual-Studio-Umgebung öffnen

- **Visual Studio Code:** `Datei → Ordner öffnen…` und den Projektordner auswählen. Die integrierte Terminal-Ansicht (`Strg + ``) hilft bei Befehlen.
- **Visual Studio 2022:**
  1. `Datei → Öffnen → Ordner…`
  2. Projektordner auswählen.
  3. Falls die Node-Workload fehlt: Visual Studio Installer öffnen → Workload „Node.js-Entwicklung“ nachinstallieren.
  4. Terminal: `Ansicht → Terminal` verwenden oder die PowerShell/CMD.

### Schritt 3: Node.js & pnpm installieren

1. **Node über nvm installieren (empfohlen)**
   ```bash
   nvm install 18.18.2
   nvm use 18.18.2
   ```
   Prüfe die Version: `node -v`

2. **Corepack aktivieren und pnpm bereitstellen**
   ```bash
   corepack enable
   corepack prepare pnpm@8.15.4 --activate
   pnpm -v
   ```
   - Falls `corepack` nicht gefunden wird: Stelle sicher, dass du Node ≥ 16.13 nutzt.
   - Alternativ kann pnpm auch global via `npm install -g pnpm` installiert werden.

### Schritt 4: Umgebungsvariablen anlegen

1. Kopiere die Vorlage:
   ```bash
   cp .env.example .env
   ```
2. Für das Frontend (Next.js) empfiehlt sich zusätzlich eine `.env.local` im Ordner `apps/web/`:
   ```bash
   cp .env.example apps/web/.env.local
   ```
3. Werte anpassen (z. B. echte Stripe-/Clerk-Keys eintragen, falls vorhanden).

| Variable                           | Beschreibung                                                                                           |
|------------------------------------|--------------------------------------------------------------------------------------------------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`| Public Key für Clerk Frontend-SDK (optional, Demo läuft auch mit Platzhalter)                          |
| `CLERK_SECRET_KEY`                 | Server-Side Key für Clerk (oder nutze `JWT_SECRET` für internes JWT)                                  |
| `NEXT_PUBLIC_API_BASE_URL`         | Basis-URL zur API (`http://localhost:3333/api`)                                                        |
| `DATABASE_URL`                     | Postgres-DSN (lokal via Docker: `postgresql://postgres:postgres@localhost:5432/wieslogic`)            |
| `REDIS_URL`                        | Redis-URL (`redis://localhost:6379`)                                                                  |
| `JWT_SECRET`                       | Geheimnis für JWT-Signatur, wenn kein Clerk-Secret hinterlegt ist                                     |
| `STRIPE_SECRET_KEY` / `WEBHOOK`    | Optional: Stripe Billing Integration                                                                  |
| `ELEVENLABS_API_KEY`               | Optional: Voice Agent Stimmen                                                                         |
| `OTLP_ENDPOINT`, `LOG_LEVEL`       | Optional: OpenTelemetry Export                                                                        |

### Schritt 5: Datenbank & Redis starten

Wenn Docker installiert ist:
```bash
docker-compose up -d
```
- Postgres läuft auf `localhost:5432` (User/Pass: `postgres`/`postgres`).
- Redis läuft auf `localhost:6379`.
- Stoppen später mit `docker-compose down`.

Ohne Docker kannst du auch lokale Installationen von Postgres/Redis verwenden – passe dann die `.env` an.

### Schritt 6: Abhängigkeiten installieren

```bash
pnpm install
```

- Der Befehl installiert sowohl Frontend- als auch Backend-Abhängigkeiten dank des pnpm-Workspaces.
- Sollte eine Fehlermeldung wie `ERR_PNPM_ADDING_TO_ROOT` erscheinen, nutze `pnpm install --filter web...` oder `pnpm install --filter api...`.

### Schritt 7: Prisma-Migrationen ausführen

```bash
pnpm --filter api prisma migrate dev
```

- Legt die Datenbanktabellen an (Organization, Projects, Agents, Workflows, Billing, Audit Logs, ...).
- Optional kannst du eigene Seed-Skripte ergänzen.

### Schritt 8: Entwicklungsserver starten

```bash
pnpm dev
```

Dies startet via Turborepo beide Apps parallel:

- **Frontend** – http://localhost:3000
  - Marketing Landingpage (Hero, Leistungen, Case Studies, ROI-Rechner, Insights, Kontakt, Floating CTA, AI-Assistent „HNTR“).
  - Dashboard-Bereich (`/dashboard`, `/projects`, `/agents`, `/billing`, `/admin`, `/settings`, `/support`, `/workflows`).
- **Backend** – http://localhost:3333/api
  - REST-Endpunkte für Agents, Workflows, Dashboard, Billing, Webhooks.
  - Auth-Stubs (`POST /api/auth/sign-in`), SSE/Realtime (`/api/dashboard`, `/api/webhooks/...`).

Wenn du nur ein Teilprojekt starten willst:

```bash
pnpm --filter web dev     # Nur Frontend
pnpm --filter api dev     # Nur Backend (NestJS)
```

### Schritt 9: Produktion builden & testen

```bash
pnpm build                 # Turborepo führt build in allen Apps aus
pnpm --filter web start    # Frontend in Production Mode
pnpm --filter api start    # Backend (NestJS) im Production Mode
```

Weitere Skripte:

- `pnpm lint` – führt Next.js- und NestJS-Linter aus.
- `pnpm format` – Prettier-Formatierung.

---

## Frontend-Highlights (Next.js 15 + Tailwind)

- **Neon-Hero mit Motion Hooks**: Starker Hook in den ersten Sekunden, CTA „Kostenlose Potenzialanalyse“ & „Case Studies ansehen“.
- **Services, Ablauf, Mission, Case Studies**: Jede Sektion nutzt Glassmorphism, Glow-Shadows und passende IDs für Smooth-Scrolling.
- **Plattform-Showcase**: KPI-Gitter, Workflow-Builder-Preview, Features (Clerk, Realtime, Stripe) als Karten.
- **ROI-Rechner**: Dynamische Berechnung von automatisierten Stunden, monetären Einsparungen und ROI-Prozentsatz.
- **Insights & Kontakt**: Thought Leadership-Karten, Formular mit Datenschutz-Consent, Social Links, Termin-Link.
- **Floating Action Center**: Sticky CTA-Leiste, die beim Scrollen erscheint (kostenlose Analyse + ROI-Canvas via Mail).
- **HNTR AI-Assistent**: Chat-Bubble mit zufälligem Einstiegsprompt, Beispiel-Dialog und Formular zum Absenden.
- **Dashboard Shell**: Mandantenlayout, KPIs, Agent-Tabellen, Live-Events (SSE-Hook), Admin Cockpit, Billing-Pläne, Workflow-Übersichten.

---

## Backend-Highlights (NestJS + Prisma)

- **Module pro Domäne**: `auth`, `organizations`, `projects`, `agents`, `workflows`, `dashboard`, `billing`, `telemetry`, `admin`, `webhooks`, `audit`.
- **Prisma-Schema**: Mandantenfähige Tabellen (Organization, OrgUser, Project, Agent, Workflow, AgentRun, ApiKey, AuditLog, BillingAccount).
- **Validierung & DTOs**: `class-validator` (z. B. `CreateAgentDto`, `CreateWorkflowDto`, `UpcomingInvoiceQueryDto`, `SignInDto`).
- **Sicherheit**: `TenantGuard` setzt `x-tenant-id` voraus, Activity Interceptor schreibt Audit Logs, JWT-Secret kann über `.env` gesteuert werden.
- **Webhooks**: ElevenLabs (Call Started/Ended/Transcript Ready) und Stripe (Webhook Signature wird entgegengenommen).
- **Realtime**: Telemetry-Gateway (Socket.IO) + SSE-Route für das Frontend.
- **Billing-Service**: Stripe-Client wird nur initialisiert, wenn ein Key gesetzt ist. Rückgabe strukturierter Upcoming-Invoices.

---

## Arbeiten mit Git & GitHub

1. **Git initialisieren (falls du ZIP genutzt hast)**
   ```bash
   git init
   git add .
   git commit -m "Initial import of WIESLOGIC platform"
   ```
2. **Remote hinzufügen**
   ```bash
   git remote add origin https://github.com/dein-account/wieslogic-platform.git
   git branch -M main
   git push -u origin main
   ```
3. **Feature-Branch-Workflow**
   ```bash
   git checkout -b feature/meine-aenderung
   # ... Änderungen vornehmen ...
   git add .
   git commit -m "Beschreibe die Änderung"
   git push origin feature/meine-aenderung
   ```
4. **Pull Request erstellen**: Über GitHub UI → Merge nach Review.

---

## Tipps für Visual Studio & Visual Studio Code

### Visual Studio Code
- Erweiterungen: `ESLint`, `Prettier`, `Tailwind CSS IntelliSense`, `Prisma`, `NestJS Files`, `GitLens`.
- Launch Config: Richte im `.vscode`-Ordner Tasks für `pnpm dev` ein, um Frontend & Backend parallel zu starten.

### Visual Studio 2022
- Stelle sicher, dass der Workload „Node.js-Entwicklung“ installiert ist.
- Nutze das integrierte Terminal (PowerShell) für pnpm-Befehle.
- Optional: „Task Runner Explorer“ → `pnpm run dev` als NPM-Skript einbinden.

---

## Fehlerbehebung & FAQ

| Problem / Fehlermeldung                            | Lösungsvorschlag                                                                                                                       |
|----------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|
| `pnpm: command not found`                          | `corepack enable` ausführen, Node-Version prüfen (`node -v`), ggf. `npm install -g pnpm`.                                               |
| `ERR_PNPM_LOCKFILE_NOT_FOUND`                      | Stelle sicher, dass du im Projektordner bist; führe `pnpm install` im Root aus.                                                        |
| `ERR_PNPM_ADDING_TO_ROOT`                          | Füge `-w` hinzu (`pnpm install -w <paket>`), oder arbeite mit `--filter web` / `--filter api`.                                         |
| Docker startet nicht / Ports belegt                | Prüfe, ob andere Datenbanken auf `5432` / `6379` laufen. Passe Ports in `docker-compose.yml` an (z. B. `5433:5432`).                  |
| NestJS startet, aber DB-Verbindung schlägt fehl    | `.env` prüfen (`DATABASE_URL`). Ist Postgres erreichbar? Port & Credentials prüfen.                                                   |
| Frontend lädt ohne Styling                         | Tailwind Build prüfen: `pnpm --filter web lint`. Stelle sicher, dass `pnpm dev` läuft und keine Fehler im Terminal stehen.            |
| Clerk Keys fehlen                                  | Für lokale Tests kannst du Platzhalter nutzen. Für echte Auth → Clerk Projekt anlegen und Keys in `.env` setzen.                      |
| „Unhandled Runtime Error“ bei Imports              | Stelle sicher, dass du neue Komponenten über die Barrel-Files (`@/components`) importierst und `pnpm lint` ausführst.                 |
| `node-gyp` oder Build-Tools fehlen (Windows)       | Installiere die „Build Tools for Visual Studio“ oder nutze WSL2. Alternativ Node über die offizielle MSI + „Automatically install tools“. |

---

## Tests, Linting & weitere Skripte

| Kommando                                  | Beschreibung                                                       |
|-------------------------------------------|--------------------------------------------------------------------|
| `pnpm dev`                                 | Startet Frontend & Backend parallel                                |
| `pnpm --filter web dev`                    | Nur Next.js App                                                    |
| `pnpm --filter api dev`                    | Nur NestJS API                                                     |
| `pnpm build`                               | Produktionsbuild (alle Apps)                                      |
| `pnpm --filter web build`                  | Next.js Production Build                                           |
| `pnpm --filter api build`                  | NestJS Build (Ergebnis in `apps/api/dist`)                         |
| `pnpm lint`                                | Next.js + NestJS Linting                                           |
| `pnpm format`                              | Prettier Formatierung                                              |
| `pnpm --filter api prisma studio`          | Öffnet Prisma Studio (Datenbank-UI)                                |

---

## Roadmap für die nächsten 90 Tage

1. **Foundation (0–30 Tage)**
   - Landingpage Feinschliff, Auth, Organisationen/Projects/Agents CRUD, ElevenLabs Webhooks, Dashboard v1.
2. **Automation (31–60 Tage)**
   - Workflow Builder mit n8n-ähnlicher UI, Realtime Telemetrie in Produktion, Billing (Stripe) Go-Live, Admin Cockpit.
3. **Scale (61–90 Tage)**
   - Self-Service Templates & Libraries, ROI/SLAs Reports, SSO/SAML/SCIM, Public API + SDK, Mandanten-spezifische Feature Flags.

---

Viel Erfolg beim 10x-Scaling deines KI-Beratungsunternehmens! Bei Fragen kannst du die Issues im Repository nutzen oder das Kontaktformular auf der Landingpage ausprobieren.
