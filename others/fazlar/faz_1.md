# Outfit Combine — Faz 1: Backend Core

**Süre:** Projenin ilk aşaması  
**Durum:** ✅ TAMAMLANDI  
**Hedef:** Production-ready Spring Boot backend + Keycloak Auth + PostgreSQL + MinIO + Temel Web MVP

---

## Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| Backend dil | Java 21 |
| Framework | Spring Boot 3.5 |
| Güvenlik | Spring Security — OAuth2 Resource Server (Keycloak JWT) |
| ORM | Spring Data JPA / Hibernate 6 |
| Veritabanı | PostgreSQL (Docker) |
| Migration | Flyway V1–V5 |
| Object Storage | MinIO (Docker) — presigned URL pattern |
| API Docs | springdoc-openapi 2.6 (Swagger UI) |
| Build | Maven (mvnw yok, `mvn` kullanılır) |
| Container | Docker multi-stage — maven build / JRE Alpine runtime |

---

## Backend API Endpoint'leri (33 adet)

### Auth / User
| Method | Path | Açıklama |
|--------|------|---------|
| GET | `/api/v1/me` | Mevcut kullanıcı profili — yok ise otomatik oluşturur |
| PUT | `/api/v1/me` | Profil güncelle |

### Wardrobe
| Method | Path | Açıklama |
|--------|------|---------|
| GET | `/api/v1/clothing` | Kıyafet listesi (sayfalı, filtrelenebilir) |
| POST | `/api/v1/clothing` | Kıyafet ekle |
| GET | `/api/v1/clothing/{id}` | Kıyafet detay |
| PUT | `/api/v1/clothing/{id}` | Kıyafet güncelle |
| DELETE | `/api/v1/clothing/{id}` | Kıyafet sil |
| PATCH | `/api/v1/clothing/{id}/mark-clean` | Temiz işaretle |
| PATCH | `/api/v1/clothing/{id}/mark-dirty` | Kirli işaretle |

### Outfit
| Method | Path | Açıklama |
|--------|------|---------|
| GET | `/api/v1/outfits` | Kombin listesi |
| POST | `/api/v1/outfits` | Kombin oluştur |
| GET | `/api/v1/outfits/{id}` | Kombin detay |
| PUT | `/api/v1/outfits/{id}` | Kombin güncelle |
| DELETE | `/api/v1/outfits/{id}` | Kombin sil |
| POST | `/api/v1/outfits/generate` | AI mock kombin üret |
| POST | `/api/v1/outfits/{id}/favorite` | Favoriye ekle |
| DELETE | `/api/v1/outfits/{id}/favorite` | Favoriden çıkar |

### WearLog
| Method | Path | Açıklama |
|--------|------|---------|
| POST | `/api/v1/outfits/{id}/wear` | Giyildi işaretle + log oluştur |
| GET | `/api/v1/wear-logs` | Giyilme geçmişi |
| GET | `/api/v1/wear-logs/{id}` | Geçmiş detay |
| DELETE | `/api/v1/wear-logs/{id}` | Geçmiş kaydı sil |

### Social
| Method | Path | Açıklama |
|--------|------|---------|
| GET | `/api/v1/posts` | Feed (takip edilenler) |
| POST | `/api/v1/posts` | Gönderi oluştur |
| GET | `/api/v1/posts/{id}` | Gönderi detay |
| DELETE | `/api/v1/posts/{id}` | Gönderi sil |
| POST | `/api/v1/posts/{id}/like` | Beğen |
| DELETE | `/api/v1/posts/{id}/like` | Beğeniyi kaldır |
| GET | `/api/v1/posts/{id}/comments` | Yorum listesi |
| POST | `/api/v1/posts/{id}/comments` | Yorum ekle |
| DELETE | `/api/v1/posts/{id}/comments/{commentId}` | Yorum sil |
| POST | `/api/v1/users/{id}/follow` | Takip et |
| DELETE | `/api/v1/users/{id}/follow` | Takipten çık |

---

## Veritabanı Şeması (Flyway V1–V5)

| Tablo | Açıklama |
|-------|---------|
| `user_profiles` | Keycloak sub → DB user map, displayName, bio, isPrivate |
| `clothing_items` | Kıyafet — name, category, subCategory, brand, size, colors[], seasons[], styles[], material, pattern, imageUrl, productUrl, notes, isClean, wearCount |
| `outfits` | Kombin — name, clothingItems (M2M), occasion, season[], styles[], isAiGenerated, aiReason, aiScore, isFavorite |
| `wear_logs` | Giyilme kaydı — outfitId, wornAt, occasion, location, note, rating (1-5), wouldWearAgain |
| `posts` | Sosyal gönderi — userId, imageUrl, caption, outfitId (optional), visibility (ENUM), likeCount, commentCount |
| `comments` | Yorum — postId, userId, content |
| `likes` | Beğeni — postId, userId (unique constraint) |
| `follows` | Takip — followerId, followingId (unique constraint) |

---

## Web Frontend (Faz 1 ile birlikte teslim)

**Stack:** Expo ~53 / React Native Web, TypeScript strict, React Navigation v7 NativeStack, React Query v5, Zustand v5, Axios, keycloak-js ^26

**Ekranlar (16 adet):**
- Auth: Keycloak PKCE redirect
- Dashboard: 7 stat kartı + 8 QuickAction
- WardrobeList, AddClothing, ClothingDetail
- OutfitList, OutfitDetail, GenerateOutfit
- WearLogList, WearLogDetail
- Feed, CreatePost, PostDetail
- Explore, UserProfilePublic
- Profile, Settings

**Mimari:**
```
React Native Web (Expo)
├── Navigation     React Navigation native-stack, typed RootStackParamList
├── Auth           Keycloak PKCE → Zustand authStore → axiosClient interceptor
├── Server State   React Query — useQuery + useMutation, QUERY_KEYS sabitleri
├── API Layer      wardrobeApi / outfitApi / wearLogApi / socialApi / userApi
├── Types          clothing.types / outfit.types / user.types / social.types / api.types
└── Shared UI      DashboardLayout + Sidebar, ImagePreview, FormField pattern
```

---

## Keycloak Realm Konfigürasyonu

- Realm: `outfit-combine`
- Client: `outfit-combine-web` (public, PKCE S256)
- Redirect URIs: `localhost:3000/*`, `localhost:19006/*`
- Roller: USER / ADMIN / MODERATOR
- Default rol: USER (default-roles-outfit-combine composite üzerinden)
- `oidc-sub-mapper` eklendi — access token'a `sub` claim garantisi
- `--import-realm` idempotent (realm varsa atlar)

---

## Docker Compose Servisleri (4 adet)

| Servis | Image | Port | Açıklama |
|--------|-------|------|---------|
| `postgres` | postgres:16 | 5432 | Healthcheck: pg_isready |
| `keycloak` | quay.io/keycloak/keycloak:25 | 8081:8080 | --import-realm, idempotent |
| `minio` | minio/minio | 9000, 9001 | Healthcheck: mc ready |
| `backend` | maven multi-stage build | 8080 | depends_on: postgres+minio healthy |

---

## Kalite Metrikleri

| Metrik | Değer |
|--------|-------|
| Backend unit test | 32 / 32 ✅ |
| TypeScript hata | 0 ✅ |
| Frontend ekran | 16 |
| API endpoint | 33 |
| DB tablosu | 8 |
| Web bundle boyutu | ~961 kB |

---

## Önemli Teknik Kararlar

- **JWT issuer/JWK ayrıştırması:** `jwk-set-uri` Docker iç ağ (keycloak:8080), `issuer-uri` localhost (token iss validation). Spring Boot `jwk-set-uri` varken discovery fetch yapmaz.
- **PostResponse.userId** = UserProfile UUID; `AuthStore.keycloakId` = Keycloak sub. Ownership kontrolü için `/me` çağrısı gerekiyor — UUID'ler farklı.
- **@Modifying:** `clearAutomatically = true, flushAutomatically = true` — UPDATE sonrası L1 cache temizlenir; stale veri dönmez.
- **authStore** saf Zustand — Keycloak state ve backend profile ayrı tutuldu (React Query `useMe` ayrı).
- **Metro `unstable_enablePackageExports: true`** — keycloak-js ^26 ESM-only; bu flag olmadan import crash.
- **`"output": "single"`** app.json — SPA mode; expo-router src/app/ detection'ı atlatır.
