# Outfit Combine — Faz 2: Web MVP Tamamlama

**Tamamlanma Tarihi:** 2026-05-09  
**Durum:** ✅ TAMAMLANDI  
**Hedef:** Web frontend'i production-ready hale getirme — image upload, server-side filtering, infinite scroll, sosyal özellikler, Docker E2E

---

## Faz 2 Kapsamı (7 Geliştirme Paketi)

| # | Paket | Durum |
|---|-------|-------|
| 1 | Image Upload — MinIO presigned URL | ✅ |
| 2 | MinIO Bucket Auto-Init (docker-compose) | ✅ |
| 3 | Backend-side filtering (native `@Query`) | ✅ |
| 4 | Infinite scroll (5 ekran, React Query v5) | ✅ |
| 5 | Explore / Keşfet ekranı | ✅ |
| 6 | UserProfilePublicScreen + Follow/Unfollow | ✅ |
| 7 | ProfileScreen baş harf avatar + SettingsScreen logout modal | ✅ |

---

## Faz 1 → Faz 2 Delta Tablosu

| Metrik | Faz 1 Sonu | Faz 2 Sonu | Delta |
|--------|-----------|-----------|-------|
| Backend Java dosyası (main/) | ~66 | 75 | +9 |
| Backend unit test | 32 | 57 | +25 |
| Backend API endpoint | 33 | 36 | +3 |
| Backend controller | 8 | 10 | +2 |
| Frontend TSX/TS dosyası (src/) | 42 | 49 | +7 |
| Frontend toplam satır | ~5.800 | ~6.700 | +900 |
| Frontend ekran | 14 | 16 | +2 |
| Frontend API modülü | 6 | 7 | +1 |
| Docker servis | 4 | 6 | +2 |
| TypeScript hata | 0 | 0 | — |

### Faz 2'de Eklenen Backend Endpoint'leri

| Method | Path | Açıklama |
|--------|------|---------|
| POST | `/api/v1/upload/presigned` | MinIO presigned PUT URL üretir |
| GET | `/api/v1/posts/explore` | Public post keşif feed'i |
| GET | `/api/v1/users/{id}` | Herkese açık kullanıcı profili |

### Faz 2'de Eklenen Docker Servisleri

| Servis | Image | Amaç |
|--------|-------|-------|
| `minio-init` | minio/mc:latest | One-shot bucket + public policy (restart: "no") |
| `frontend_web` | nginx multi-stage | Web SPA servisi (port 3000:80) |

### Faz 2'de Eklenen Frontend Dosyaları

| Dosya | Açıklama |
|-------|---------|
| `ExploreScreen.tsx` | Public post keşif ekranı |
| `UserProfilePublicScreen.tsx` | Herkese açık kullanıcı profili |
| `uploadApi.ts` | Presign + upload |
| `upload.types.ts` | PresignedUrlRequest/Response |
| `useImageUpload.ts` | Presign → binary PUT → publicUrl |
| `ImagePickerButton.tsx` | `<input type="file">` wrapper |
| `ImagePreview.tsx` | thumb/large önizleme |

---

## Modül Detayları

### 2.1 Image Upload — MinIO Presigned URL

**Akış:**
```
1. Frontend → POST /api/v1/upload/presigned
   Body: { folder: "clothing" | "profiles", filename, contentType }

2. Backend → MinIO SDK → presignedPutUrl (15 dk TTL)
   Response: { uploadUrl: "http://minio:9000/...", publicUrl: "http://localhost:9000/..." }

3. Frontend → PUT <uploadUrl> (binary, Content-Type: image/jpeg)
   fetch kullanılır — axios değil (Authorization header EKLENMEMELİ)

4. publicUrl → form alanına yazılır → POST/PUT ile backend'e gönderilir
```

**Kritik:** MinIO presigned URL'ye `Authorization: Bearer` header GÖNDERİLMEZ. Axios interceptor bu header'ı ekler; bu yüzden presigned upload `fetch` ile yapılır.

**Kullanılan ekranlar:** AddClothingScreen, ClothingDetailScreen (inline edit), CreatePostScreen, ProfileScreen

---

### 2.2 MinIO Bucket Auto-Init

**Çift güvence mekanizması:**

| Mekanizma | Araç | Tetiklenme |
|-----------|------|-----------|
| `minio-init` container | minio/mc:latest, restart: "no" | MinIO service_healthy sonrası |
| `BucketInitializer` bean | @PostConstruct, MinIO Java SDK | Backend başladığında |

Her ikisi `bucketExists()` / `--ignore-existing` kontrolü yapar — idempotent.

**Race condition fix:** Backend `depends_on minio: service_started` → `service_healthy` olarak güncellendi.

---

### 2.3 Backend-Side Filtering

**Teknik çözüm:**
```sql
SELECT * FROM clothing_items c
WHERE c.user_id = :userId
AND (CAST(:category AS TEXT) IS NULL OR c.category = :category)
AND (CAST(:season  AS TEXT) IS NULL OR :season  = ANY(c.seasons))
AND (CAST(:style   AS TEXT) IS NULL OR :style   = ANY(c.styles))
AND (CAST(:isClean AS TEXT) IS NULL OR c.is_clean = :isClean)
ORDER BY c.created_at DESC
```

**Kritik notlar:**
- `CAST(:param AS TEXT) IS NULL` — null-safe guard; param gönderilmezse filtre devreye girmez
- `= ANY(array_col)` — PostgreSQL TEXT[] alanlar için native syntax
- `@PageableDefault(sort = "created_at")` — native query'de Java property adı değil veritabanı sütun adı
- `@BatchSize(size = 30)` — Outfit.clothingItems için; @EntityGraph native query ile uyumsuz

Aynı pattern `OutfitRepository`'de de uygulandı (isFavorite, aiGenerated, occasion, season, style).

---

### 2.4 Infinite Scroll

**React Query v5 Pattern:**
```typescript
useInfiniteQuery({
  queryKey: [QUERY_KEYS.CLOTHING, 'infinite', filterParams],
  queryFn: ({ pageParam }) =>
    wardrobeApi.list({ ...params, page: pageParam, size: 20 }).then(r => r.data),
  initialPageParam: 0,
  getNextPageParam: (lastPage) =>
    lastPage.data.last ? undefined : lastPage.data.number + 1,
})
```

**Web-only teknik not:** Container `overflow: 'hidden' as any` zorunlu — FlatList'e bounded height verir, parent scroll devreye girmez.

| Ekran | Hook | Filtre Türü |
|-------|------|-------------|
| WardrobeListScreen | useInfiniteWardrobe(params) | Server-side |
| OutfitListScreen | useInfiniteOutfits(params) | Server-side |
| FeedScreen | useInfiniteFeed() | — |
| ExploreScreen | useInfiniteExplore() | — |
| WearLogListScreen | useInfiniteWearLogs() | Client-side (rating/wouldWearAgain) |

`filterParams` `useMemo` ile stabilize edildi → filtre değişince query key değişir, liste sıfırlanır.

---

### 2.5 Explore / Keşfet Ekranı

Feed vs Explore farkı: Feed yalnızca takip edilen kullanıcıların paylaşımlarını döndürür. Explore tüm PUBLIC postları döndürür.

**Backend endpoint:** `GET /api/v1/posts/explore` — PostController içinde ayrı handler.

---

### 2.6 UserProfilePublicScreen + Follow/Unfollow

**Own-profile check:**
```typescript
const isOwnProfile = !!me && me.id === userId;
// me.id → UserProfile UUID (backend /me endpoint)
// userId → route param, PostResponse.userId'den gelir (aynı UUID)
// DIKKAT: keycloakId (Keycloak sub) ile karıştırılmamalı
```

**Invalidation zinciri:**
```
useFollowUser / useUnfollowUser
  → invalidateQueries(['public-user', userId])   // followerCount güncellenir
  → invalidateQueries(['feed', 'infinite'])       // feed takip bazlı
```

---

### 2.7 Shared Components

**ConfirmModal** — visible, title, message, confirmLabel, isLoading, onConfirm, onCancel  
Kullanım: ClothingDetailScreen (sil), OutfitDetailScreen (sil), WearLogDetailScreen (sil), PostDetailScreen (sil), SettingsScreen (logout)

**ImagePreview** — uri, size ('thumb' 100×100 | 'large' 240px), onError  
uri değiştiğinde error state sıfırlanır — inline edit sırasında yeni URL ile güncellenir.

---

## Mimari Pattern Özeti

### Query Key Hiyerarşisi
```typescript
export const QUERY_KEYS = {
  ME:          'me',
  CLOTHING:    'clothing',
  OUTFITS:     'outfits',
  OUTFIT_ITEM: 'outfit-item',
  WEAR_LOGS:   'wear-logs',
  FEED:        'feed',
  EXPLORE:     'explore',
  POST_ITEM:   'post-item',
  PUBLIC_USER: 'public-user',
};

// Infinite: ['clothing', 'infinite', { category, season }]
// Regular:  ['outfit-item', id]
// Invalidation: invalidateQueries({ queryKey: [QUERY_KEYS.CLOTHING] })
//               → 'clothing' prefix'li tüm query'leri invalidate eder
```

### Auth Pattern (Web)
```
Browser → Keycloak /auth (PKCE S256) ← redirect + code
keycloak-js → /token → access_token + refresh_token
AuthProvider → kc.init({ onLoad: 'login-required' }) → authStore
kc.onTokenExpired → kc.updateToken(30) → setToken(newToken)
logout → authStore.clear() + kc.logout({ redirectUri: window.location.origin })
```

### Docker Bağımlılık Zinciri
```
postgres (healthcheck: pg_isready)
  ↓ service_healthy
keycloak (--import-realm)
minio    (healthcheck: mc ready)
  ↓ service_healthy
minio-init (one-shot, restart: "no")
backend    (depends: postgres+minio healthy)
frontend_web (nginx SPA, port 3000)
```

---

## Bilinen Teknik Borçlar (Faz 3'e bırakıldı)

| Kod | Konu | Öncelik |
|-----|------|---------|
| TB-1 | `overflow: 'hidden' as any` — 7 dosyada TypeScript hack | HIGH (mobile'da gerekmiyor) |
| TB-2 | `DashboardLayout` web-only — mobile için SafeAreaView gerekli | HIGH |
| TB-3 | axiosClient 401 handler → sadece clear(), navigation yok | HIGH |
| TB-4 | `AuthProvider.tsx` → `AuthProvider.web.tsx` olarak rename edilmeli | HIGH |
| TB-5 | Keycloak test kullanıcıları realm-export.json'a dahil değil | MEDIUM |
| TB-6 | WearLog rating/wouldWearAgain filtreleri client-side | LOW |
| TB-7 | PostDetailScreen silme butonu yetki kontrolü yok (backend 403 ile yakalar) | LOW |
