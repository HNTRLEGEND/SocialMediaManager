# WiesLogic Deployment (Hetzner / Traefik)

This stack runs Traefik (TLS), Postgres, Redis, n8n 1.114.x, and the WiesLogic backend behind HTTPS.

## Prerequisites
- Ubuntu 24.04 LTS (recommended) with Docker + Compose plugin
- DNS A records:
  - `N8N_HOST` (e.g. n8n.example.com) → server IP
  - `API_HOST` (e.g. api.example.com) → server IP
- Open ports 80/443 (firewall), SSH 22 (restricted to your IP)

## 1) Clone and configure
```
cd /opt
# place your repo here, e.g.
# git clone <your-repo-url> SocialMediaManager
cd SocialMediaManager/deployment/hetzner
cp .env.example .env
# edit .env and set N8N_HOST, API_HOST, LETSENCRYPT_EMAIL, PG_USER/PG_PASSWORD, BACKEND_TOKEN, N8N_ENCRYPTION_KEY
```

## 2) Bring up the stack
```
docker compose up -d
```
- Traefik obtains TLS certificates via Let’s Encrypt (first run may take up to 1–2 minutes)
- n8n UI: https://$N8N_HOST
- Backend UI: https://$API_HOST/ui
- Swagger: https://$API_HOST/docs

## 3) n8n configuration
- In n8n, set Variables (Settings → Variables):
  - `BACKEND_BASE_URL` = `https://$API_HOST`
  - `BACKEND_TOKEN` = value from your .env
- Add OpenAI credentials for the AI nodes
- Import your workflows (MASTER, LEAD) and run tests

## 4) Data & Backups
- Postgres data: `deployment/hetzner/data/postgres`
- n8n data: `deployment/hetzner/data/n8n`
- Redis data: `deployment/hetzner/data/redis`
- Let’s Encrypt certs: `deployment/hetzner/letsencrypt/acme.json`
- Create regular DB dumps or enable provider snapshots

## 5) Updates
```
docker compose pull

docker compose up -d
```

## Notes
- The backend service mounts your code from `wieslogic-agent-system/backend` and runs `npm ci && npm run build && node dist/main.js` on container start. For stricter production builds, add a Dockerfile and switch to an image build.
- n8n runs in queue mode with Redis; adjust resources for heavy workloads.
- If you see TLS issues, verify DNS is set and ports 80/443 are reachable from the Internet.
