# Outfit Combine

AI destekli kombin öneri ve sosyal stil platformu. Kullanıcılar dolabındaki kıyafetleri yönetebilir, AI ile kombin oluşturabilir, giyilme geçmişini takip edebilir ve sosyal feed'de paylaşım yapabilir.

## Servisler

| Servis | Teknoloji | Port |
|---|---|---|
| Backend API | Spring Boot 3.5 / Java 21 | 8080 |
| Web Uygulaması | Expo / React Native Web | 3000 |
| Keycloak (Auth) | Keycloak 25 | 8081 |
| PostgreSQL | PostgreSQL 16 | 5432 |
| MinIO (Object Storage) | MinIO latest | 9000 / 9001 |

## Klasör Yapısı

```
outfit-combine/
├── docker-compose.yml              # Tüm servisleri ayağa kaldırır
├── keycloak/
│   └── realm-export.json           # Keycloak realm otomatik import
├── outfit-combine_backend/         # Spring Boot REST API
├── outfit-combine_frontend_web/    # Expo / React Native Web SPA
├── outfit-combine_frontend_mobile/ # (Faz 3 — henüz geliştirilmedi)
└── k8s/                            # (Faz 4 — henüz geliştirilmedi)
```

## Docker Compose ile Çalıştırma (Önerilen)

Tüm servisleri tek komutla başlatır:

```bash
docker compose up -d --build
```

İlk başlatmada Keycloak realm otomatik olarak import edilir (`outfit-combine` realm, `outfit-combine-web` client, roller).

Servis durumunu kontrol et:

```bash
docker compose ps
```

Logları izle:

```bash
docker compose logs -f backend
docker compose logs -f keycloak
```

Durdur:

```bash
docker compose down
```

Volumes dahil tamamen sıfırla:

```bash
docker compose down -v
```

## Servis Adresleri

| Servis | URL |
|---|---|
| Web Uygulaması | http://localhost:3000 |
| Backend Swagger UI | http://localhost:8080/swagger-ui.html |
| Backend API Docs | http://localhost:8080/v3/api-docs |
| Keycloak Admin | http://localhost:8081 (admin / admin) |
| MinIO Console | http://localhost:9001 (minio / minio_password) |

## Test Kullanıcıları

Stack ilk kez `docker compose up -d --build` ile başlatıldığında Keycloak realm import edilir fakat kullanıcılar elle oluşturulmalıdır.

**Hazır E2E Kullanıcısı** (varsa — daha önce oluşturulduysa):

| Kullanıcı | Şifre | Rol |
|---|---|---|
| `e2e_alice` | `Test1234!` | USER |

**Yeni Kullanıcı Oluşturma** (Keycloak Admin Console):

1. `http://localhost:8081` → `admin / admin` ile giriş yap
2. Sol üst köşeden **outfit-combine** realm'ini seç
3. **Users** → **Create user**
   - Username: `testuser`
   - Email: `testuser@example.com`
   - **Save**
4. **Credentials** sekmesi → **Set password**
   - Password: `Test1234!`, Temporary: **OFF** → **Save**

Kullanıcı otomatik olarak `USER` rolü alır (default role).

CLI ile token alma (servisler ayakta iken):

```bash
curl -s -X POST "http://localhost:8081/realms/outfit-combine/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=outfit-combine-web&username=e2e_alice&password=Test1234!" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])"
```

## Sık Karşılaşılan Hatalar

**Backend 401 — JWT issuer mismatch**
- Neden: Backend container içinden Keycloak'a farklı URL üzerinden erişiliyorsa `iss` claim uyuşmaz.
- Çözüm: `docker-compose.yml` içinde `KEYCLOAK_ISSUER_URI=http://localhost:8081/...` ve `KEYCLOAK_JWK_SET_URI=http://keycloak:8080/...` ayarlı olmalı. Mevcut konfigürasyon doğru.

**Keycloak realm import olmadı**
- Neden: Realm zaten varsa `--import-realm` atlar (idempotent).
- Çözüm: Temiz başlatmak için `docker compose down -v && docker compose up -d`.

**Frontend `sub` claim yok → 500**
- Neden: Keycloak 25 access token'a `sub` claim'i varsayılan olarak eklemez.
- Çözüm: `realm-export.json` içindeki `oidc-sub-mapper` bu sorunu çözer. Mevcut konfigürasyon doğru.

**`version` uyarısı docker compose**
- `the attribute 'version' is obsolete` uyarısı görmezden gelinebilir; işlevsel değil.

## Önemli Özellikler

| Özellik | Açıklama |
|---|---|
| **Dolap Yönetimi** | Kıyafet ekleme, düzenleme, silme; kategori / mevsim / stil filtresi; temiz/kirli işaretleme |
| **AI Kombin Üretme** | `POST /api/v1/outfits/generate` — temiz kıyafetlerden mock AI ile kombin önerir |
| **Kombin Yönetimi** | CRUD, favorilere ekle, giyildi işaretle |
| **Giyilme Geçmişi** | Tarih, etkinlik, lokasyon, puan, "tekrar giyer misin" kaydı |
| **Sosyal Feed** | Post, yorum, beğeni; takip / takibi bırak; keşfet |
| **Görsel Yükleme** | MinIO presigned upload — kıyafet ve profil fotoğrafları |
| **Kullanıcı Profili** | Görünen isim, bio, stil tercihleri, gizli hesap; public profil görüntüleme |
| **Infinite Scroll** | Wardrobe, Outfit, Feed, Explore, WearLog ekranlarında `useInfiniteQuery` |

## Bilinen Teknik Borçlar

| Alan | Konu |
|---|---|
| AI Generate | Mock implementasyon — gerçek model entegrasyonu yok (`storage/` ve `ai/` paketleri placeholder) |
| MinIO Bucket | `outfit-combine` bucket'ı ilk başlatmada elle oluşturulmalı (MinIO Console → `http://localhost:9001`) |
| Keycloak Kullanıcıları | Realm import kullanıcı içermez; her ortamda elle oluşturulur |
| Mobile | `outfit-combine_frontend_mobile/` dizini boş (Faz 3) |
| Kubernetes | `k8s/` dizini boş (Faz 4) |
| PostDetailScreen | Silme butonu yetki kontrolü frontend'de yok — backend 403 ile yakalar |
| Rating/WearAgain Filtresi | WearLog filtreleri server-side değil, client-side (backend param desteği yok) |

## Production Notları

Bu proje şu an **geliştirme modunda** çalışacak şekilde yapılandırılmıştır:

- Keycloak `start-dev` modunda çalışır — production'da `start --optimized` kullanılmalı
- HTTPS yapılandırması yok — prod'da TLS termination (reverse proxy / Ingress) eklenmeli
- `docker-compose.yml` tek `version: "3.9"` bloğu içeriyor — compose V2'de obsolete uyarısı verir, işlevselliği etkilemez
- Frontend env değerleri (`EXPO_PUBLIC_*`) build zamanında bundle'a gömülür — runtime'da değiştirilemez; her ortam değişikliğinde yeniden build gerekir
- Keycloak Admin şifresi: `admin/admin` — production'da mutlaka değiştirilmeli
- MinIO şifresi: `minio/minio_password` — production'da mutlaka değiştirilmeli

## Geliştirme Aşamaları

| Faz | Kapsam | Durum |
|---|---|---|
| Faz 1 | Backend Core (API, Auth, DB) | Tamamlandı |
| Faz 2 | Web MVP (Tüm ekranlar) | Tamamlandı |
| Faz 3 | Mobile (React Native) | Planlandı |
| Faz 4 | Kubernetes / Prod Deploy | Planlandı |
