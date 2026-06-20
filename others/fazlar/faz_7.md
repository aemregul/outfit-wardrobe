# Outfit Combine — Faz 7: Production & DevOps

**Planlama Tarihi:** 2026-05-14  
**Durum:** PLANLANMIŞ — Faz 6 AI Service tamamlandıktan sonra başlanacak  
**Bağımlılık:** Tüm feature fazları (1-6) tamamlanmış ve stabil olmalı  
**Hedef:** Production-ready deployment — Kubernetes, CI/CD, Monitoring, Güvenlik, Backup

---

## Mevcut Eksikler

| Alan | Mevcut Durum | Hedef |
|------|-------------|-------|
| docker-compose.dev.yml | Yok | Development ortamı ayrıştırması |
| docker-compose.prod.yml | Yok | Production override (secrets, restart policy) |
| k8s/ | Klasör var, boş | Tam Kubernetes manifests |
| CI/CD | Yok | GitHub Actions pipeline |
| Monitoring | Yok | Prometheus + Grafana |
| Logging | Yok (stdout) | Centralized log aggregation |
| Security hardening | Minimal | HTTPS, rate limit, secrets management |
| Backup | Yok | PostgreSQL scheduled backup |
| Mobile distribution | Yok | EAS Build + App Store / Play Store |

---

## Modül 1: Docker Compose Ayrıştırma

### docker-compose.dev.yml

```yaml
# Geliştirme ortamı override'ları
services:
  backend:
    build:
      target: development
    volumes:
      - ./outfit-combine_backend:/app    # hot reload
    environment:
      SPRING_PROFILES_ACTIVE: dev
      LOGGING_LEVEL_ROOT: DEBUG
  
  frontend_web:
    command: npx expo start --web        # dev server (hot reload)
    ports:
      - "19006:19006"
```

### docker-compose.prod.yml

```yaml
services:
  postgres:
    restart: always
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/postgres_password
    secrets:
      - postgres_password
  
  backend:
    restart: always
    deploy:
      resources:
        limits: { cpus: '1', memory: 1G }
    environment:
      SPRING_PROFILES_ACTIVE: prod
  
  frontend_web:
    restart: always
    
secrets:
  postgres_password:
    external: true
```

---

## Modül 2: Kubernetes Manifests

`k8s/` dizini şu anda boş. Doldurulacak dosyalar:

### Namespace

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: outfit-combine
```

### ConfigMap

```yaml
# k8s/configmap.yaml
data:
  SPRING_DATASOURCE_URL: jdbc:postgresql://postgres-service:5432/outfit_combine
  KEYCLOAK_ISSUER_URI: https://keycloak.yourdomain.com/...
  MINIO_ENDPOINT: http://minio-service:9000
```

### Secrets

```yaml
# k8s/secrets.example.yaml (gerçek secret'lar kubectl create secret ile)
# POSTGRES_PASSWORD, KEYCLOAK_ADMIN_PASSWORD, MINIO_ROOT_PASSWORD, ANTHROPIC_API_KEY
```

### Deployment Listesi

| Bileşen | Replicas | CPU | Memory |
|---------|----------|-----|--------|
| backend | 2 | 500m-1000m | 512Mi-1Gi |
| frontend-web | 2 | 100m-200m | 128Mi-256Mi |
| postgres | 1 | 500m | 512Mi |
| keycloak | 1 | 500m | 512Mi |
| minio | 1 | 200m | 256Mi |

### Ingress

```yaml
# Tek Ingress ile tüm servisler
host: yourdomain.com
rules:
  /api → backend-service:8080
  /    → frontend-web-service:80
  /auth → keycloak-service:8080 (subdomain: auth.yourdomain.com)
```

---

## Modül 3: CI/CD — GitHub Actions

### Pipeline Yapısı

```
.github/workflows/
├── ci.yml          ← PR'da: test + lint + build
├── cd-staging.yml  ← main branch push: staging deploy
└── cd-prod.yml     ← release tag: production deploy
```

### ci.yml (PR pipeline)

```yaml
jobs:
  backend-test:
    steps:
      - mvn test                           # 57+ unit test
      - mvn verify -P integration          # integration test (opsiyonel)
  
  frontend-type-check:
    steps:
      - npm ci
      - npx tsc --noEmit                   # 0 TypeScript hata
      - npx expo export --platform web     # build başarılı
  
  docker-build:
    steps:
      - docker build outfit-combine_backend
      - docker build outfit-combine_frontend_web
```

### EAS Build (Mobile CI)

```yaml
  mobile-build:
    steps:
      - npx eas build --platform all --profile preview --non-interactive
      - npx eas submit --platform ios --auto-submit     # TestFlight
      - npx eas submit --platform android --auto-submit # Google Play Internal
```

---

## Modül 4: Monitoring — Prometheus + Grafana

### Spring Boot Actuator Metrikleri (zaten mevcut)

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health, metrics, prometheus
  metrics:
    export:
      prometheus:
        enabled: true
```

Endpoint: `GET /actuator/prometheus`

### Prometheus Hedefleri

```yaml
# prometheus.yml
scrape_configs:
  - job_name: backend
    static_configs:
      - targets: ['backend:8080']
    metrics_path: /actuator/prometheus
```

### Kritik Grafana Dashboard'ları

| Dashboard | Metrikler |
|-----------|---------|
| API Health | HTTP 5xx rate, p95/p99 latency, request/s |
| JVM | Heap kullanım, GC pause, thread pool |
| Database | Connection pool, slow query count, active connections |
| MinIO | Upload başarı oranı, storage kullanımı |
| Auth | Login başarı/başarısızlık, token refresh oranı |

### Alert Kuralları

| Alert | Eşik | Aksiyon |
|-------|------|--------|
| High error rate | HTTP 5xx > %5 (5 dk) | Slack/email bildirim |
| High latency | p95 > 2s (5 dk) | Slack bildirim |
| DB connection exhaustion | > %80 | Kritik alert |
| MinIO down | health check fail | Kritik alert |

---

## Modül 5: Centralized Logging

### Seçenek A: Docker Logging Driver (Basit)

```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Seçenek B: ELK Stack (Gelişmiş)

```
Logback → Logstash → Elasticsearch → Kibana
```

**Structured logging (JSON format):**
```java
// logback-spring.xml
<encoder class="net.logstash.logback.encoder.LogstashEncoder">
  <includeMdcKeyName>requestId</includeMdcKeyName>
  <includeMdcKeyName>userId</includeMdcKeyName>
</encoder>
```

MDC alanları: `requestId` (UUID), `userId` (Keycloak sub), `path`, `method`

---

## Modül 6: Security Hardening

### HTTPS / TLS

```yaml
# Nginx (frontend) veya Ingress Controller ile TLS termination
# cert-manager ile Let's Encrypt otomatik sertifika
```

### Rate Limiting

| Endpoint | Limit | Neden |
|---------|-------|-------|
| POST /api/v1/clothing/analyze | 10 req/dk/user | AI maliyet kontrolü |
| POST /api/v1/outfits/generate | 20 req/dk/user | AI maliyet |
| POST /api/v1/upload/presigned | 50 req/dk/user | DoS koruması |
| Tüm diğer | 200 req/dk/user | Genel koruma |

**Spring Boot — Bucket4j veya Resilience4j:**
```java
@RateLimiter(name = "aiEndpoints", fallbackMethod = "rateLimitFallback")
public ResponseEntity<?> analyze(...)
```

### Secrets Management

- Docker: Docker Secrets veya `.env` (git'e commit edilmez)
- Kubernetes: Kubernetes Secrets + External Secrets Operator (Vault/AWS SM)
- **Asla:** Hardcoded secret, environment variable olarak Dockerfile'da

### Security Headers (Nginx)

```nginx
add_header X-Content-Type-Options "nosniff";
add_header X-Frame-Options "DENY";
add_header Strict-Transport-Security "max-age=31536000";
add_header Content-Security-Policy "default-src 'self'";
```

---

## Modül 7: PostgreSQL Backup

### Strateji

| Backup Türü | Sıklık | Saklama |
|-------------|--------|--------|
| Full backup (pg_dump) | Günlük | 30 gün |
| Incremental (WAL) | Sürekli | 7 gün |

### Docker Compose Backup Servisi

```yaml
backup:
  image: postgres:16
  command: >
    sh -c "pg_dump -h postgres -U outfit_user outfit_combine
           | gzip > /backups/outfit_$(date +%Y%m%d_%H%M%S).sql.gz"
  volumes:
    - ./backups:/backups
  profiles:
    - backup    # docker compose --profile backup up backup
```

### Kubernetes CronJob

```yaml
apiVersion: batch/v1
kind: CronJob
spec:
  schedule: "0 2 * * *"   # Her gece 02:00
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: pg-backup
              image: postgres:16
              command: ["sh", "-c", "pg_dump ... | aws s3 cp - s3://bucket/backup.sql.gz"]
```

---

## Modül 8: Mobile App Distribution (EAS)

### eas.json

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": { "simulator": false }
    },
    "production": {
      "ios": { "autoIncrement": true },
      "android": { "autoIncrement": true }
    }
  },
  "submit": {
    "production": {
      "ios": { "appleId": "...", "ascAppId": "..." },
      "android": { "serviceAccountKeyPath": "./google-credentials.json" }
    }
  }
}
```

### Release Süreci

```
1. main branch tag → v1.0.0
2. GitHub Action: eas build --platform all --profile production
3. iOS → TestFlight → App Store Review
4. Android → Google Play Internal → Production
```

---

## HIGH Öncelikli Görevler

| # | Görev |
|---|-------|
| H1 | docker-compose.dev.yml + docker-compose.prod.yml |
| H2 | GitHub Actions ci.yml (test + build) |
| H3 | Kubernetes namespace + configmap + secrets (template) |
| H4 | Backend + frontend-web Kubernetes deployment |
| H5 | Ingress konfigürasyonu (HTTPS ile) |
| H6 | Prometheus scraping + Grafana API Health dashboard |
| H7 | PostgreSQL daily backup cron |
| H8 | Rate limiting — AI endpoint'leri |

## MEDIUM Öncelikli Görevler

| # | Görev |
|---|-------|
| M1 | EAS Build + staging pipeline |
| M2 | Grafana JVM + DB dashboard |
| M3 | Alert rules (Slack/email) |
| M4 | Structured logging (JSON + MDC) |
| M5 | Security headers (nginx) |

## LOW Öncelikli Görevler

| # | Görev |
|---|-------|
| L1 | ELK Stack centralized logging |
| L2 | External Secrets Operator (Vault) |
| L3 | App Store / Play Store production submit |
| L4 | CDN (CloudFront/Cloudflare) frontend için |
| L5 | Database read replica (yüksek trafik) |
| L6 | Canary deployment strategy |

---

## QA Kriterleri

- [ ] `docker compose -f docker-compose.yml -f docker-compose.dev.yml up` → çalışıyor
- [ ] PR açınca GitHub Action otomatik tetiklendi → testler geçti
- [ ] Kubernetes `kubectl apply -k k8s/` → tüm pod'lar Running
- [ ] `https://yourdomain.com` → SSL sertifikası geçerli
- [ ] Grafana → API Health dashboard → gerçek metrikler görünüyor
- [ ] Alert: backend'i öldür → 5 dk içinde Slack bildirimi
- [ ] pg_dump backup cron → dosya oluştu, restore edilebilir
- [ ] EAS build → TestFlight'a yüklendi
- [ ] Rate limit: 11. istek → 429 döndü
