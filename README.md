# WIES.AI – KI Prozessautomation & AI Voice Agents

WIES.AI ist eine moderne Monorepo-Plattform, die eine konversionsstarke Landingpage,
ein leichtgewichtiges Kunden-Dashboard und ein erweiterbares NestJS-Backend
kombiniert. Ziel ist es, Leads für KI-Automatisierung und AI Voice Agents zu
qualifizieren, Kundenprojekte zu verwalten und Konfigurationsdaten für n8n- und
ElevenLabs-Workflows zu speichern.

## Inhaltsverzeichnis
1. [Projektüberblick](#projektüberblick)
2. [Technologie-Stack](#technologie-stack)
3. [Verzeichnisstruktur](#verzeichnisstruktur)
4. [Voraussetzungen](#voraussetzungen)
5. [Schritt-für-Schritt-Anleitung](#schritt-für-schritt-anleitung)
6. [Entwicklungsbefehle](#entwicklungsbefehle)
7. [Deployment-Hinweise](#deployment-hinweise)
8. [Fehlersuche & Tipps](#fehlersuche--tipps)
9. [Weiterentwicklung](#weiterentwicklung)

## Projektüberblick
- **Landingpage**: High-End Dark Theme mit Neon-Akzenten, Framer-Motion-Animationen und DSGVO-konformem Lead-Formular.
- **Dashboard**: Authentifizierter Bereich (Clerk) mit Kundenverwaltung, Kennzahlen, Konfigurations-Editoren und Aktivitätsprotokoll.
- **Backend**: NestJS + Prisma + PostgreSQL mit Modulen für Kunden, Konfigurationen, Kennzahlen und Webhooks.

## Technologie-Stack
| Bereich     | Technologie                                               |
|-------------|-----------------------------------------------------------|
| Frontend    | Next.js 15 (App Router), React 18, TailwindCSS, shadcn/ui |
| Animationen | Framer Motion                                             |
| Auth        | Clerk (Next.js Integration)                               |
| Backend     | NestJS 10, Express, class-validator                       |
| Datenbank   | PostgreSQL (lokal via Docker Compose)                     |
| ORM         | Prisma                                                    |
| Sprache     | TypeScript                                                |

## Verzeichnisstruktur
```
.
├─ apps/
│  ├─ web/        # Next.js App mit Landingpage, Auth & Dashboard
│  └─ api/        # NestJS Backend mit Prisma-Modulen
├─ docker-compose.yml  # Lokale Datenbank & Redis
├─ package.json         # Root-Skripte für Turborepo
├─ pnpm-workspace.yaml  # Paketverwaltung
└─ tsconfig.base.json   # TypeScript Basiskonfiguration
```

## Voraussetzungen
- Node.js >= 20.10
- PNPM >= 8 (`corepack enable pnpm`)
- Docker Desktop oder Docker CLI für PostgreSQL/Redis
- Git
- (Optional) Ein ElevenLabs- und n8n-Account für die Konfiguration
- (Optional) Ein Clerk-Projekt mit Publishable & Secret Key

## Schritt-für-Schritt-Anleitung
1. **Repository klonen**
   ```bash
   git clone <dein-fork-oder-clone-url>
   cd SocialMediaManager
   ```

2. **PNPM aktivieren und Abhängigkeiten installieren**
   ```bash
   corepack enable pnpm
   pnpm install
   ```

3. **Umgebungsvariablen vorbereiten**
   - Kopiere die Beispieldateien und passe sie an:
     ```bash
     cp apps/api/.env.example apps/api/.env
     cp apps/web/.env.example apps/web/.env
     ```
   - Falls keine Beispiel-Dateien vorhanden sind, erstelle sie mit folgendem Inhalt:
     **apps/api/.env**
     ```env
     DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wiesai"
     JWT_SECRET="ersetzen-durch-einen-langen-schlüssel"
     N8N_API_KEY=""
     N8N_BASE_URL=""
     ELEVENLABS_API_KEY=""
     ```
     **apps/web/.env**
     ```env
     NEXT_PUBLIC_API_BASE_URL="http://localhost:3333/api"
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="dein-clerk-publishable-key"
     CLERK_SECRET_KEY="dein-clerk-secret-key"
     ```
   - Passe die Werte für produktive Deployments entsprechend an.

4. **Docker-Services starten (PostgreSQL & Redis)**
   ```bash
   docker-compose up -d
   ```
   - PostgreSQL läuft anschließend auf `localhost:5432` mit Benutzer `postgres` und Passwort `postgres`.

5. **Prisma-Migrationen ausführen**
   ```bash
   pnpm --filter api prisma migrate dev
   ```
   - Dieser Schritt legt das Schema für Kunden, Webhooks und Konfigurationswerte an.

6. **(Optional) Seed- oder Demo-Daten anlegen**
   - Aktuell gibt es kein automatisches Seeding. Du kannst Kunden direkt über das Dashboard oder den `/api/customers` Endpunkt erstellen.

7. **Backend starten**
   ```bash
   pnpm --filter api start:dev
   ```
   - Die API ist danach unter `http://localhost:3333/api` erreichbar.

8. **Frontend starten**
   ```bash
   pnpm --filter web dev
   ```
   - Das Frontend läuft unter `http://localhost:3000`.
   - Für geschützte Dashboard-Routen musst du dich über Clerk anmelden. Verwende in der Entwicklungsumgebung die Testnutzer aus deinem Clerk-Projekt.

9. **Gesamtes Monorepo parallel starten**
   - Alternativ kannst du den Turbo-Task verwenden:
     ```bash
     pnpm dev
     ```
   - Dadurch werden Frontend und Backend gemeinsam gestartet.

10. **Tests und Code-Qualität**
    - Linting für beide Apps:
      ```bash
      pnpm lint
      ```
    - Weitere Tests sind noch nicht implementiert.

## Entwicklungsbefehle
| Befehl                                  | Beschreibung                                              |
|-----------------------------------------|-----------------------------------------------------------|
| `pnpm dev`                              | Startet Frontend & Backend parallel                       |
| `pnpm --filter web dev`                 | Startet nur die Next.js App                               |
| `pnpm --filter api start:dev`           | Startet nur die NestJS API                                |
| `pnpm --filter api prisma migrate dev`  | Führt Prisma Migrationen lokal aus                        |
| `pnpm lint`                             | Führt ESLint für Frontend und Backend aus                 |

## Deployment-Hinweise
1. **Frontend (Vercel)**
   - Richte die Environment Variablen in Vercel ein (`NEXT_PUBLIC_API_BASE_URL`, Clerk Keys).
   - Aktiviere Edge Caching nur für statische Seiten; API-Aufrufe bleiben beim Backend.

2. **Backend (Render/Fly.io)**
   - Lege Secrets für `DATABASE_URL`, `JWT_SECRET` und Integrations-Keys an.
   - Aktiviere HTTPS und Logging.
   - Optional: Redis-Service anhängen, wenn Hintergrundjobs ergänzt werden.

3. **Datenbank**
   - PostgreSQL als verwalteten Dienst nutzen (z. B. Supabase, Railway oder Neon).
   - Prisma Migrationen beim Deployment automatisiert ausführen (`prisma migrate deploy`).

## Fehlersuche & Tipps
- **Clerk**: Wenn das Dashboard sofort weiterleitet, prüfe Publishable/Secret Key und erlaubte Domains im Clerk-Dashboard.
- **Prisma**: Bei `P1001` Fehlern sicherstellen, dass PostgreSQL läuft und die `DATABASE_URL` korrekt gesetzt ist.
- **CORS**: Für externe Clients kann in `apps/api/src/main.ts` ein CORS-Setup ergänzt werden.
- **SSL**: Für produktive Umgebungen TLS-Zertifikate auf Reverse Proxy Ebene terminieren (z. B. Nginx, Cloudflare).

## Weiterentwicklung
- ElevenLabs-Webhook-Validierung und Statusabgleich implementieren.
- n8n Workflow-Verwaltung mit OAuth und Template-Katalog erweitern.
- Billing-Modul reaktivieren (Stripe o. ä.).
- Mehrsprachige Landingpage (Deutsch/Englisch) ergänzen.
- E2E-Tests (Playwright) und visuelle Regressionen hinzufügen.

Viel Erfolg beim Aufbau von WIES.AI! Bei Fragen bitte Issues eröffnen oder direkt melden.
