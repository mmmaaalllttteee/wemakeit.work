# Deployment Guide - WMIW Platform

## Overview

This guide provides instructions for deploying the WMIW Platform to production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Docker Deployment](#docker-deployment)
5. [Kubernetes Deployment](#kubernetes-deployment)
6. [Cloud Deployments](#cloud-deployments)
7. [Post-Deployment](#post-deployment)
8. [Monitoring](#monitoring)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- Node.js 20+ (LTS)
- pnpm 8+
- Docker 24+
- Docker Compose 2.20+
- PostgreSQL 15+
- Redis 7+
- MinIO (or S3-compatible storage)

### Required Accounts

- Domain registrar (for DNS)
- SSL certificate provider (or Let's Encrypt)
- Email service (SendGrid, AWS SES, etc.)
- Object storage (MinIO, AWS S3, etc.)
- Monitoring service (optional: DataDog, New Relic)

---

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-org/wmiw-platform.git
cd wmiw-platform
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Variables

Create `.env` file in root directory:

```bash
# Application
NODE_ENV=production
PORT=3000
API_URL=https://api.yourdomain.com
WEB_URL=https://app.yourdomain.com

# Database
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=wmiw_user
DB_PASSWORD=<strong-password>
DB_NAME=wmiw_production
DB_POOL_SIZE=20

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=<strong-password>

# JWT
JWT_SECRET=<generate-strong-secret>
JWT_REFRESH_SECRET=<generate-strong-secret>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# MinIO / S3
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=<access-key>
MINIO_SECRET_KEY=<secret-key>
MINIO_BUCKET=wmiw-files
MINIO_USE_SSL=true

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=<sendgrid-api-key>
SMTP_FROM=noreply@yourdomain.com

# OAuth (Google)
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
GOOGLE_REDIRECT_URI=https://api.yourdomain.com/auth/google/callback

# OAuth (Meta/Facebook)
META_APP_ID=<your-app-id>
META_APP_SECRET=<your-app-secret>

# OAuth (Spotify)
SPOTIFY_CLIENT_ID=<your-client-id>
SPOTIFY_CLIENT_SECRET=<your-client-secret>

# OAuth (YouTube)
YOUTUBE_API_KEY=<your-api-key>

# Strapi CMS
STRAPI_URL=http://strapi:1337
STRAPI_API_TOKEN=<your-api-token>

# Security
CORS_ORIGIN=https://app.yourdomain.com,https://admin.yourdomain.com
RATE_LIMIT_WHITELIST=127.0.0.1,10.0.0.0/8

# Monitoring (optional)
APM_ENABLED=true
APM_SERVER_URL=https://apm.yourdomain.com
LOG_LEVEL=info
```

### 4. Generate Secrets

```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate API keys
node -e "console.log('wmiw_' + require('crypto').randomBytes(32).toString('hex'))"
```

---

## Database Setup

### 1. Create Database

```sql
CREATE DATABASE wmiw_production;
CREATE USER wmiw_user WITH ENCRYPTED PASSWORD 'strong-password';
GRANT ALL PRIVILEGES ON DATABASE wmiw_production TO wmiw_user;

-- Enable extensions
\c wmiw_production
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

### 2. Run Migrations

```bash
cd apps/api
pnpm migration:run
```

### 3. Seed Initial Data (Optional)

```bash
pnpm seed:production
```

### 4. Backup Strategy

```bash
# Daily backups
0 2 * * * pg_dump -U wmiw_user wmiw_production | gzip > /backups/wmiw_$(date +\%Y\%m\%d).sql.gz

# Retention: Keep 30 days
find /backups -name "wmiw_*.sql.gz" -mtime +30 -delete
```

---

## Docker Deployment

### 1. Build Images

```bash
# Build API
docker build -t wmiw/api:latest -f apps/api/Dockerfile .

# Build Web
docker build -t wmiw/web:latest -f apps/web/Dockerfile .
```

### 2. Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: wmiw_production
      POSTGRES_USER: wmiw_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
    volumes:
      - minio_data:/data
    restart: unless-stopped

  api:
    image: wmiw/api:latest
    environment:
      NODE_ENV: production
      PORT: 3000
    env_file:
      - .env
    depends_on:
      - postgres
      - redis
      - minio
    restart: unless-stopped

  web:
    image: wmiw/web:latest
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_API_URL: ${API_URL}
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - api
      - web
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

### 3. Start Services

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 4. Verify Deployment

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f api

# Check health
curl http://localhost:3000/health
```

---

## Kubernetes Deployment

### 1. Create Namespace

```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: wmiw-production
```

### 2. Secrets

```yaml
# secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: wmiw-secrets
  namespace: wmiw-production
type: Opaque
stringData:
  DB_PASSWORD: <base64-encoded>
  JWT_SECRET: <base64-encoded>
  REDIS_PASSWORD: <base64-encoded>
```

### 3. Database Deployment

```yaml
# postgres.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: wmiw-production
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:15-alpine
          env:
            - name: POSTGRES_DB
              value: wmiw_production
            - name: POSTGRES_USER
              value: wmiw_user
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: wmiw-secrets
                  key: DB_PASSWORD
          volumeMounts:
            - name: postgres-data
              mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
    - metadata:
        name: postgres-data
      spec:
        accessModes: ['ReadWriteOnce']
        resources:
          requests:
            storage: 50Gi
```

### 4. API Deployment

```yaml
# api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wmiw-api
  namespace: wmiw-production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: wmiw-api
  template:
    metadata:
      labels:
        app: wmiw-api
    spec:
      containers:
        - name: api
          image: wmiw/api:latest
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: production
          envFrom:
            - secretRef:
                name: wmiw-secrets
          resources:
            requests:
              memory: '512Mi'
              cpu: '500m'
            limits:
              memory: '1Gi'
              cpu: '1000m'
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
```

### 5. Service & Ingress

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: wmiw-api
  namespace: wmiw-production
spec:
  selector:
    app: wmiw-api
  ports:
    - port: 3000
      targetPort: 3000
  type: ClusterIP

---
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: wmiw-ingress
  namespace: wmiw-production
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: 'true'
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - api.yourdomain.com
      secretName: wmiw-tls
  rules:
    - host: api.yourdomain.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: wmiw-api
                port:
                  number: 3000
```

### 6. Deploy

```bash
kubectl apply -f namespace.yaml
kubectl apply -f secrets.yaml
kubectl apply -f postgres.yaml
kubectl apply -f api-deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
```

---

## Cloud Deployments

### AWS (ECS/Fargate)

1. **Create ECR repositories**
2. **Push Docker images**
3. **Create RDS PostgreSQL instance**
4. **Create ElastiCache Redis cluster**
5. **Create S3 bucket for file storage**
6. **Create ECS cluster and task definitions**
7. **Set up Application Load Balancer**
8. **Configure auto-scaling**

### Google Cloud (Cloud Run)

1. **Push images to Artifact Registry**
2. **Create Cloud SQL PostgreSQL instance**
3. **Create Memorystore Redis instance**
4. **Create Cloud Storage bucket**
5. **Deploy to Cloud Run**
6. **Configure Cloud CDN**

### Azure (Container Apps)

1. **Push images to Container Registry**
2. **Create Azure Database for PostgreSQL**
3. **Create Azure Cache for Redis**
4. **Create Blob Storage account**
5. **Deploy Container Apps**
6. **Configure Azure Front Door**

---

## Post-Deployment

### 1. Health Checks

```bash
# API health
curl https://api.yourdomain.com/health

# Database connection
curl https://api.yourdomain.com/health/database

# Redis connection
curl https://api.yourdomain.com/health/redis
```

### 2. SSL/TLS Setup

```bash
# Using Let's Encrypt with Certbot
certbot certonly --webroot -w /var/www/html \
  -d api.yourdomain.com \
  -d app.yourdomain.com

# Auto-renewal
echo "0 0,12 * * * root certbot renew --quiet" >> /etc/crontab
```

### 3. DNS Configuration

```
# A Records
api.yourdomain.com  → <server-ip>
app.yourdomain.com  → <server-ip>
www.yourdomain.com  → <server-ip>

# CNAME Records
*.yourdomain.com    → yourdomain.com
```

### 4. Firewall Rules

```bash
# Allow HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Allow SSH (change default port recommended)
ufw allow 22/tcp

# Deny all other incoming
ufw default deny incoming
ufw default allow outgoing
ufw enable
```

### 5. Initial Admin User

```bash
# Create admin user via API
curl -X POST https://api.yourdomain.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourdomain.com",
    "password": "SecurePassword123!",
    "name": "Admin User",
    "orgName": "Your Organization"
  }'
```

---

## Monitoring

### Application Monitoring

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - '9090:9090'

  grafana:
    image: grafana/grafana
    environment:
      GF_SECURITY_ADMIN_PASSWORD: <password>
    volumes:
      - grafana_data:/var/lib/grafana
    ports:
      - '3001:3000'

  node-exporter:
    image: prom/node-exporter
    ports:
      - '9100:9100'

volumes:
  prometheus_data:
  grafana_data:
```

### Logging

```bash
# Centralized logging with Loki
docker run -d --name=loki -p 3100:3100 grafana/loki

# Log aggregation
docker run -d --name=promtail \
  -v /var/log:/var/log \
  grafana/promtail
```

### Alerts

```yaml
# alertmanager.yml
route:
  receiver: 'email'

receivers:
  - name: 'email'
    email_configs:
      - to: 'ops@yourdomain.com'
        from: 'alerts@yourdomain.com'

# Alert rules
groups:
  - name: api_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status="500"}[5m]) > 0.05
        annotations:
          summary: 'High error rate detected'

      - alert: DatabaseDown
        expr: pg_up == 0
        annotations:
          summary: 'Database is down'
```

---

## Troubleshooting

### Common Issues

**1. Database Connection Failed**

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Check connection
psql -h localhost -U wmiw_user -d wmiw_production

# Check logs
docker logs postgres
```

**2. Redis Connection Failed**

```bash
# Test Redis connection
redis-cli -h localhost -p 6379 -a <password> ping

# Check logs
docker logs redis
```

**3. File Upload Issues**

```bash
# Check MinIO is accessible
curl http://localhost:9000/minio/health/live

# Check bucket exists
mc ls minio/wmiw-files
```

**4. High Memory Usage**

```bash
# Check memory usage
docker stats

# Restart container
docker-compose restart api

# Check for memory leaks
node --inspect api/dist/main.js
```

**5. Slow Queries**

```sql
-- Enable query logging
ALTER SYSTEM SET log_min_duration_statement = 1000;

-- View slow queries
SELECT * FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Rollback Procedure

```bash
# 1. Stop current deployment
docker-compose down

# 2. Restore database backup
gunzip < /backups/wmiw_20241012.sql.gz | psql -U wmiw_user wmiw_production

# 3. Deploy previous version
docker-compose up -d --build

# 4. Verify health
curl http://localhost:3000/health
```

---

## Maintenance

### Regular Tasks

**Daily**

- Check error logs
- Monitor resource usage
- Review security alerts

**Weekly**

- Update dependencies (security patches)
- Review slow queries
- Check backup integrity

**Monthly**

- Security audit
- Performance review
- Dependency updates (minor versions)
- Database optimization (VACUUM)

**Quarterly**

- Major version updates
- Penetration testing
- Disaster recovery drill

---

## Support

For deployment assistance:

- Email: ops@wmiw.com
- Slack: #deployment-support
- Documentation: https://docs.wmiw.com

---

**Last Updated**: 2025-10-12
**Version**: 1.0.0
