# Outfit Combine — Backend

Spring Boot 3.5 / Java 21 REST API. Keycloak JWT resource server olarak çalışır, PostgreSQL'i Flyway ile yönetir.

## Teknoloji Stack

| Katman | Teknoloji |
|---|---|
| Runtime | Java 21 |
| Framework | Spring Boot 3.5.0 |
| Güvenlik | Spring Security OAuth2 Resource Server (Keycloak JWT) |
| Veritabanı | PostgreSQL 16 |
| ORM | Spring Data JPA / Hibernate 6 |
| Migration | Flyway 10 |
| Object Storage | MinIO (Java SDK 8.5.12) |
| API Docs | springdoc-openapi 2.6.0 (Swagger UI) |
| Build | Maven 3.9 |

## Klasör Yapısı

```
outfit-combine_backend/
├── Dockerfile
├── pom.xml
└── src/main/java/com/outfitcombine/backend/
    ├── common/              # ApiResponse wrapper, GlobalExceptionHandler
    ├── config/              # Security, CORS, MinIO, Swagger config
    ├── health/              # GET /api/v1/health
    ├── user/                # GET/PUT /api/v1/me — UserProfile
    ├── wardrobe/            # /api/v1/clothing — CRUD + mark clean/dirty
    ├── outfit/              # /api/v1/outfits — CRUD + AI generate + favorite
    ├── wearlog/             # /api/v1/outfits/{id}/wear + /api/v1/wear-logs
    └── social/
        ├── post/            # /api/v1/posts — CRUD + like
        ├── comment/         # /api/v1/posts/{id}/comments
        └── follow/          # /api/v1/{userId}/follow
```

### Flyway Migrations

| Versiyon | İçerik |
|---|---|
| V1 | user_profiles |
| V2 | clothing_items |
| V3 | outfits, outfit_items |
| V4 | wear_logs |
| V5 | posts, post_likes, comments, follows |

## Local Geliştirme (Docker olmadan)

### Gereksinimler

- Java 21+
- Maven 3.9+
- PostgreSQL 16 çalışıyor
- Keycloak 25 çalışıyor

### Ortam Değişkenleri

```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=outfit_combine
export DB_USER=outfit_user
export DB_PASSWORD=outfit_password
export KEYCLOAK_ISSUER_URI=http://localhost:8081/realms/outfit-combine
export KEYCLOAK_JWK_SET_URI=http://localhost:8081/realms/outfit-combine/protocol/openid-connect/certs
export CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Çalıştırma

```bash
mvn spring-boot:run
```

veya:

```bash
mvn clean package -DskipTests
java -jar target/*.jar
```

## Docker ile Çalıştırma

Sadece backend imajını build et:

```bash
docker build -t outfit-backend .
```

Tüm stack için root'tan:

```bash
docker compose up -d --build backend
```

## API Endpoints

| Method | Path | Açıklama |
|---|---|---|
| GET | `/api/v1/health` | Health check (public) |
| GET | `/api/v1/me` | Profili getir / ilk girişte oluştur |
| PUT | `/api/v1/me` | Profili güncelle |
| GET/POST | `/api/v1/clothing` | Dolap listesi / kıyafet ekle |
| GET/PUT/DELETE | `/api/v1/clothing/{id}` | Kıyafet detay / güncelle / sil |
| POST | `/api/v1/clothing/{id}/clean` | Temiz işaretle |
| POST | `/api/v1/clothing/{id}/dirty` | Kirli işaretle |
| GET/POST | `/api/v1/outfits` | Kombin listesi / oluştur |
| GET/PUT/DELETE | `/api/v1/outfits/{id}` | Kombin detay |
| POST | `/api/v1/outfits/generate` | AI kombin üret |
| POST | `/api/v1/outfits/{id}/favorite` | Favoriye ekle |
| DELETE | `/api/v1/outfits/{id}/favorite` | Favoriden çıkar |
| POST | `/api/v1/outfits/{id}/wear` | Giyildi işaretle |
| GET | `/api/v1/wear-logs` | Giyilme geçmişi |
| GET | `/api/v1/feed` | Sosyal feed |
| GET/POST | `/api/v1/posts` | Post listesi / oluştur |
| GET/DELETE | `/api/v1/posts/{id}` | Post detay / sil |
| POST/DELETE | `/api/v1/posts/{id}/like` | Beğen / beğeniyi kaldır |
| GET/POST | `/api/v1/posts/{id}/comments` | Yorumlar / yorum ekle |
| DELETE | `/api/v1/comments/{id}` | Yorum sil |
| POST/DELETE | `/api/v1/{userId}/follow` | Takip et / takibi bırak |

Tüm endpoint'ler (health hariç) Keycloak Bearer token gerektirir.

## Swagger UI

```
http://localhost:8080/swagger-ui.html        # /swagger-ui/index.html'e yönlendirir
http://localhost:8080/swagger-ui/index.html  # Doğrudan URL
```

Swagger'da test etmek için: **Authorize** → `Bearer <token>` gir.

> **Not:** `/v3/api-docs` endpoint'i yetkilendirme gerektirdiğinden tarayıcıdan doğrudan erişimde hata verebilir. Swagger UI üzerinden kullanın.

## JWT Yapılandırması

Backend iki ayrı property kullanır:

| Property | Değer (Docker) | Amaç |
|---|---|---|
| `KEYCLOAK_ISSUER_URI` | `http://localhost:8081/realms/outfit-combine` | Token `iss` claim doğrulama |
| `KEYCLOAK_JWK_SET_URI` | `http://keycloak:8080/realms/outfit-combine/protocol/openid-connect/certs` | JWKS indirme (Docker iç ağ) |

Spring Boot, `jwk-set-uri` set edildiğinde JWKS indirme için bu URL'yi kullanır; `issuer-uri` ise sadece string karşılaştırması yapar (HTTP fetch yapmaz). Bu sayede browser tokenı (`iss=localhost:8081`) ile backend iç ağ (`keycloak:8080`) uyumsuzluğu çözülür.

## Pagination ve Filtre Örnekleri

Tüm liste endpoint'leri Spring Data `Pageable` destekler. Temel parametreler:

| Parametre | Tip | Açıklama |
|---|---|---|
| `page` | int (0-based) | Sayfa numarası |
| `size` | int | Sayfa boyutu (default 20) |
| `sort` | string | Alan adı, örn. `created_at,desc` |

**Kıyafet listesi — filtreli:**

```bash
GET /api/v1/clothing?category=TOP&season=SPRING&style=CASUAL&page=0&size=20
```

Desteklenen `category` değerleri: `TOP BOTTOM SHOES OUTERWEAR BAG ACCESSORY HEADWEAR`  
Desteklenen `season` değerleri: `SPRING SUMMER AUTUMN WINTER ALL_SEASON`  
Desteklenen `style` değerleri: `CASUAL FORMAL SMART_CASUAL SPORTY ELEGANT STREETWEAR BOHEMIAN MINIMALIST`

**Kombin listesi — filtreli:**

```bash
GET /api/v1/outfits?isFavorite=true&season=SUMMER&style=CASUAL&page=0&size=20
GET /api/v1/outfits?aiGenerated=true&occasion=İş
```

**Sosyal feed + keşfet:**

```bash
GET /api/v1/feed?page=0&size=20
GET /api/v1/posts?page=0&size=20          # public explore
GET /api/v1/wear-logs?page=0&size=20
GET /api/v1/wear-logs?outfitId=<uuid>     # belirli kombin geçmişi
```

Native `@Query`'lerde `CAST(:param AS TEXT) IS NULL` null-safe guard ile çalışır; param gönderilmezse filtre uygulanmaz.

## Presigned Upload Akışı

Frontend MinIO'ya doğrudan yükler; backend presigned URL üretir:

```
1. Frontend → POST /api/v1/upload/presign
   Body: { "folder": "clothing", "filename": "photo.jpg", "contentType": "image/jpeg" }

2. Backend → MinIO SDK → presigned PUT URL üretir (15 dk geçerli)
   Response: { "uploadUrl": "http://localhost:9000/...", "publicUrl": "http://localhost:9000/..." }

3. Frontend → PUT <uploadUrl> (binary, Content-Type: image/jpeg)
   MinIO doğrudan kabul eder.

4. Frontend → publicUrl'i form alanına yazar → POST/PUT isteğiyle backend'e gönderir.
```

**MinIO bucket kurulumu**: `docker compose up -d` ile otomatik oluşur — `minio-init` servisi bucket'ı oluşturur ve public-read policy uygular. Manuel işlem gerekmez.

Backend `BucketInitializer` (`@PostConstruct`) da aynı işlemi idempotent olarak yapar; her iki init mekanizması çakışmaz çünkü ikisi de `bucketExists` / `--ignore-existing` kontrolü yapar.

## Önemli Teknik Notlar

### `@Modifying(clearAutomatically = true, flushAutomatically = true)`

`ClothingItemService` ve `OutfitService` içindeki `markClean` / `markDirty` JPQL UPDATE operasyonları bu annotation ile işaretlenmiştir:

```java
@Modifying(clearAutomatically = true, flushAutomatically = true)
@Query("UPDATE ClothingItem c SET c.isClean = true WHERE c.id = :id AND c.userId = :userId")
int markClean(@Param("id") UUID id, @Param("userId") UUID userId);
```

- `flushAutomatically`: UPDATE öncesi pending dirty entities veritabanına yazılır.
- `clearAutomatically`: UPDATE sonrası Hibernate L1 cache temizlenir; ardından yapılan `findById` stale nesne döndürmez.
Bu olmadan `markClean` çağrısı sonrası `getOne` çağrısı eski değeri döndürebilir.

### `@BatchSize(size = 30)` — Outfit clothingItems

Native `@Query` ile paginated `Outfit` listesi dönerken `@EntityGraph` çalışmaz (Hibernate kısıtlaması). Bunun yerine `clothingItems` collection'una `@BatchSize(size = 30)` eklendi: Hibernate 30'ar ID'lik `IN (...)` sorguları ile lazy yükleme yapar, N+1 sorununu önler.

### `@PageableDefault(sort = "created_at")`

Native query'lerde `ORDER BY` Pageable tarafından SQL'e doğrudan eklenir. Sıralama alanı Java property adı değil, **veritabanı sütun adı** olmalıdır (`createdAt` değil `created_at`).

## Testler

```bash
mvn test
```

57 unit test, tümü yeşil. Test kapsamı: UserProfileService, ClothingItemService (filtering + edge cases), OutfitService (generate + favorites + filtering), WearLogService, PostService, CommentService.

Mock stratejisi: `@ExtendWith(MockitoExtension.class)`, repository'ler `@Mock`. Gerçek veritabanı bağlantısı kullanılmaz.

## Sık Karşılaşılan Hatalar

**Uygulama başlarken `Connection refused` (PostgreSQL)**
- PostgreSQL container'ın `healthy` durumuna geçmesini bekle.
- `docker compose ps` ile kontrol et.

**`401 Unauthorized` tüm endpoint'lerde**
- Token `iss` claim'i `KEYCLOAK_ISSUER_URI` ile eşleşmiyor olabilir.
- Token'ı decode edip `iss` değerini kontrol et: `jwt.io`

**`500` — `keycloak_user_id` null**
- Keycloak 25'te access token'a `sub` claim varsayılan olarak eklenmiyor.
- `realm-export.json` içindeki `oidc-sub-mapper` bu sorunu çözer.
- Realm import'u yeniden dene: `docker compose down -v && docker compose up -d`
