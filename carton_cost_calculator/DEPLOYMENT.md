# 🚀 Deployment-Optionen

## Option 1: Lokale Python-Installation (Empfohlen für Entwicklung)

### Voraussetzungen
- Python 3.8+
- pip

### Installation
```bash
cd carton_cost_calculator
pip install -r requirements.txt
streamlit run app.py
```

Öffnen Sie `http://localhost:8501` im Browser.

---

## Option 2: Docker (Empfohlen für Produktion)

### Voraussetzungen
- Docker installiert
- Docker Compose (optional)

### Mit Docker Compose (einfachste Methode)

```bash
cd carton_cost_calculator
docker-compose up -d
```

Die Anwendung läuft unter `http://localhost:8501`

### Mit Docker direkt

```bash
cd carton_cost_calculator

# Image bauen
docker build -t karton-kostenrechner .

# Container starten
docker run -d -p 8501:8501 --name karton-calculator karton-kostenrechner
```

### Container-Verwaltung

```bash
# Status prüfen
docker ps

# Logs anzeigen
docker logs karton-calculator

# Stoppen
docker stop karton-calculator

# Neustarten
docker restart karton-calculator

# Entfernen
docker rm -f karton-calculator
```

---

## Option 3: Cloud-Deployment

### Streamlit Community Cloud (Kostenlos)

1. Code auf GitHub pushen
2. Gehe zu [share.streamlit.io](https://share.streamlit.io)
3. Repository verbinden
4. App-Pfad angeben: `carton_cost_calculator/app.py`
5. Deploy klicken

**Vorteile:**
- Kostenlos
- Automatische Updates bei Git-Push
- SSL-Zertifikat inklusive
- Keine Server-Verwaltung

### Heroku

```bash
# Heroku CLI installieren und anmelden
heroku login

# App erstellen
heroku create mein-karton-rechner

# Python Buildpack hinzufügen
heroku buildpacks:set heroku/python

# Procfile erstellen
echo "web: streamlit run app.py --server.port=\$PORT --server.address=0.0.0.0" > Procfile

# Deployen
git push heroku main
```

### Google Cloud Run

```bash
# gcloud CLI installieren und konfigurieren
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Docker Image bauen und pushen
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/karton-calculator

# Deployen
gcloud run deploy karton-calculator \
  --image gcr.io/YOUR_PROJECT_ID/karton-calculator \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated
```

### AWS Elastic Beanstalk

```bash
# EB CLI installieren
pip install awsebcli

# Initialisieren
eb init -p docker karton-calculator

# Erstellen und deployen
eb create karton-calculator-env
eb open
```

### Azure Container Instances

```bash
# Azure CLI verwenden
az login

# Resource Group erstellen
az group create --name karton-calculator-rg --location westeurope

# Container deployen
az container create \
  --resource-group karton-calculator-rg \
  --name karton-calculator \
  --image karton-kostenrechner:latest \
  --dns-name-label karton-calculator \
  --ports 8501
```

---

## Option 4: Unternehmens-Deployment (On-Premise)

### Reverse Proxy mit Nginx

**nginx.conf:**
```nginx
server {
    listen 80;
    server_name calculator.ihredomäne.de;

    location / {
        proxy_pass http://localhost:8501;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Mit SSL (Let's Encrypt)

```bash
# Certbot installieren
sudo apt-get install certbot python3-certbot-nginx

# Zertifikat beantragen
sudo certbot --nginx -d calculator.ihredomäne.de
```

### Systemd Service (Linux)

**/etc/systemd/system/karton-calculator.service:**
```ini
[Unit]
Description=Karton Cost Calculator
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/karton-calculator
Environment="PATH=/opt/karton-calculator/venv/bin"
ExecStart=/opt/karton-calculator/venv/bin/streamlit run app.py --server.port=8501

[Install]
WantedBy=multi-user.target
```

```bash
# Service aktivieren und starten
sudo systemctl enable karton-calculator
sudo systemctl start karton-calculator
sudo systemctl status karton-calculator
```

---

## Sicherheits-Empfehlungen

### 1. Authentifizierung hinzufügen

Erstellen Sie `.streamlit/config.toml`:

```toml
[server]
enableCORS = false
enableXsrfProtection = true

[browser]
gatherUsageStats = false

[client]
showErrorDetails = false
```

### 2. Umgebungsvariablen verwenden

Erstellen Sie `.env`:

```bash
STREAMLIT_SERVER_PORT=8501
STREAMLIT_SERVER_HEADLESS=true
STREAMLIT_BROWSER_GATHER_USAGE_STATS=false
```

### 3. Firewall konfigurieren

```bash
# UFW (Ubuntu)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## Performance-Optimierung

### 1. Caching aktivieren

In der `app.py` bereits implementiert mit `@st.cache_data`

### 2. Multi-Container Setup

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  app:
    build: .
    deploy:
      replicas: 3
      restart_policy:
        condition: on-failure

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app
```

### 3. Load Balancing mit Nginx

```nginx
upstream streamlit_backend {
    least_conn;
    server app1:8501;
    server app2:8501;
    server app3:8501;
}

server {
    listen 80;
    location / {
        proxy_pass http://streamlit_backend;
    }
}
```

---

## Monitoring

### Docker Health Checks

Bereits im Dockerfile implementiert:
```dockerfile
HEALTHCHECK CMD curl --fail http://localhost:8501/_stcore/health
```

### Prometheus + Grafana

Fügen Sie Metriken hinzu:
```python
from prometheus_client import Counter, Histogram
import streamlit as st

calculation_counter = Counter('calculations_total', 'Total calculations')
calculation_time = Histogram('calculation_duration_seconds', 'Calculation duration')
```

---

## Troubleshooting

### Port bereits belegt
```bash
# Anderen Port verwenden
streamlit run app.py --server.port 8502
```

### Docker-Build schlägt fehl
```bash
# Cache löschen
docker build --no-cache -t karton-kostenrechner .
```

### Berechtigungsprobleme
```bash
# Dateiberechtigungen setzen
chmod +x app.py
chown -R www-data:www-data /opt/karton-calculator
```

### Memory Issues
```bash
# Docker Memory-Limit erhöhen
docker run -d -p 8501:8501 -m 2g karton-kostenrechner
```

---

## Backup-Strategie

### Konfiguration sichern
```bash
# Backup erstellen
tar -czf backup-$(date +%Y%m%d).tar.gz \
  carton_cost_calculator/ \
  .streamlit/ \
  .env

# Automatisches Backup (Crontab)
0 2 * * * /path/to/backup-script.sh
```

---

## Update-Prozedur

### Manuelles Update
```bash
git pull origin main
pip install -r requirements.txt --upgrade
sudo systemctl restart karton-calculator
```

### Automatisches Update (GitHub Actions)

**.github/workflows/deploy.yml:**
```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to server
        run: |
          ssh user@server 'cd /opt/karton-calculator && git pull && systemctl restart karton-calculator'
```

---

Für weitere Unterstützung siehe [README.md](README.md) oder kontaktieren Sie Ihren Administrator.
