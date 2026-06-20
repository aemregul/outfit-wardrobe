# Outfit Combine — Faz 2 Kapanış Raporu / Faz 3 Mobile Roadmap

**Tarih:** 2026-05-09  
**Durum:** Faz 2 tamamlandı. Docker E2E geçti. Faz 3 Mobile başlangıcı için kontrollü geçiş planı hazır.  
**Bir sonraki görev:** `expo-auth-session` PKCE kurulumu — keycloak-js'den native auth'a geçiş.

---

## 1. Faz 2 Kapanış Özeti

Faz 2 kapsamında web frontend ve backend'e toplam 7 bağımsız geliştirme paketi teslim edildi:

| # | Paket | Durum |
|---|-------|-------|
| 1 | Image Upload — MinIO presigned URL | ✅ Tamamlandı |
| 2 | MinIO Bucket Auto-Init (docker-compose) | ✅ Tamamlandı |
| 3 | Backend-side filtering (native `@Query`) | ✅ Tamamlandı |
| 4 | Infinite scroll (5 ekran, React Query v5) | ✅ Tamamlandı |
| 5 | Explore / Keşfet ekranı | ✅ Tamamlandı |
| 6 | UserProfilePublicScreen + Follow/Unfollow nav | ✅ Tamamlandı |
| 7 | ProfileScreen baş harf avatar + SettingsScreen logout modal | ✅ Tamamlandı |

**QA Doğrulama (Faz 2 Kapanış):**
- `tsc --noEmit` → 0 hata ✅
- `npx expo export --platform web` → başarılı ✅
- `docker compose up -d --build` → tüm servisler healthy ✅
- `GET /api/v1/health` → HTTP 200 ✅
- `mvn test` → 57/57 test yeşil ✅

---

## 2. Faz 1 vs Faz 2 Delta Tablosu

### Genel Metrikler

| Metrik | Faz 1 Sonu | Faz 2 Sonu | Delta |
|--------|-----------|-----------|-------|
| **Backend — Java dosyası (main/)** | ~66 | 75 | +9 |
| **Backend — Test dosyası** | 6 | 7 | +1 |
| **Backend — Unit test sayısı** | 32 | 57 | +25 |
| **Backend — API endpoint sayısı** | 33 | 36 | +3 |
| **Backend — Controller sayısı** | 8 | 10 | +2 |
| **Frontend — TS/TSX dosyası (src/)** | 42 | 49 | +7 |
| **Frontend — Toplam satır (src/)** | ~5.800 | ~6.700 | +900 |
| **Frontend — Ekran sayısı** | 14 | 16 | +2 |
| **Frontend — API modülü** | 6 | 7 | +1 |
| **Docker — Servis sayısı** | 4 | 6 | +2 |
| **Flyway migration** | V1–V5 | V1–V5 | — |
| **TypeScript hata** | 0 | 0 | — |

### Faz 2'de Eklenen Backend Endpoint'leri (3 yeni)

| Method | Path | Açıklama |
|--------|------|---------|
| `POST` | `/api/v1/upload/presigned` | MinIO presigned PUT URL üretir |
| `GET` | `/api/v1/posts/explore` | Public post keşif feed'i (explore) |
| `GET` | `/api/v1/users/{id}` | Herkese açık kullanıcı profili |

### Faz 2'de Eklenen Docker Servisleri (2 yeni)

| Servis | Image | Amaç |
|--------|-------|-------|
| `minio-init` | `minio/mc:latest` | One-shot bucket oluşturma + public policy |
| `frontend_web` | nginx multi-stage | Web SPA servisi (port 3000) |

### Faz 2'de Eklenen Frontend Dosyaları (7 yeni)

| Dosya | Tip | Açıklama |
|-------|-----|---------|
| `ExploreScreen.tsx` | Screen | Public post keşif ekranı |
| `UserProfilePublicScreen.tsx` | Screen | Herkese açık kullanıcı profili |
| `uploadApi.ts` | API | Presign + upload fonksiyonları |
| `upload.types.ts` | Type | PresignedUrlRequest/Response tipleri |
| `useImageUpload.ts` | Hook | Presign → binary PUT → publicUrl state |
| `ImagePickerButton.tsx` | Component | `<input type="file">` wrapper |
| `ImagePreview.tsx` | Component | thumb/large boyutlu görsel önizleme |

---

## 3. Faz 2 Modül Özetleri

### 3.1 Image Upload — MinIO Presigned URL

**Amaç:** Kullanıcı kıyafet ve post fotoğraflarını doğrudan MinIO'ya yükleyebilir. Backend hiçbir zaman binary veri taşımaz.

**Akış:**
```
1. Frontend → POST /api/v1/upload/presigned
   Body: { folder: "clothing" | "profiles", filename, contentType }

2. Backend → MinIO SDK → presignedPutUrl üretir (15 dk TTL)
   Response: { uploadUrl: "http://minio:9000/...", publicUrl: "http://localhost:9000/..." }

3. Frontend → PUT <uploadUrl> (binary, Content-Type: image/jpeg)
   MinIO doğrudan kabul eder. Backend aradan çıkar.

4. publicUrl → form alanına yazılır → POST/PUT ile backend'e gönderilir.
```

**İlgili dosyalar:**
- Backend: `upload/UploadController.java`, `storage/MinioStorageService.java`, `storage/StorageService.java`
- Frontend: `shared/api/uploadApi.ts`, `shared/hooks/useImageUpload.ts`, `shared/components/ImagePickerButton.tsx`, `shared/components/ImagePreview.tsx`

**Kullanılan ekranlar:** AddClothingScreen, ClothingDetailScreen (inline edit), CreatePostScreen, ProfileScreen

---

### 3.2 MinIO Bucket Auto-Init

**Amaç:** `docker compose up -d` sonrası `outfit-combine` bucket'ı otomatik ve idempotent biçimde oluşturulur. Manuel MinIO Console adımı ortadan kalktı.

**Mekanizma — çift güvence:**

| Mekanizma | Araç | Tetiklenme zamanı |
|-----------|------|------------------|
| `minio-init` container | `minio/mc:latest`, `restart: "no"` | MinIO `service_healthy` olduktan sonra |
| `BucketInitializer` bean | `@PostConstruct`, MinIO Java SDK | Backend başladığında |

Her iki mekanizma `bucketExists()` / `--ignore-existing` kontrolü yapar — ikinci çalıştırmada sessizce atlar.

**Race condition fix:** Backend `depends_on minio: service_started` → `service_healthy` olarak güncellendi. `BucketInitializer` artık MinIO hazır olmadan çalışmaz.

---

### 3.3 Backend-Side Filtering

**Amaç:** Faz 1'deki `size:200` + client-side `useMemo` filtre stratejisi 200+ item için yavaşlıyordu. Filtreler backend native SQL'e taşındı.

**Teknik çözüm — ClothingItemRepository:**
```sql
@Query(value = """
    SELECT * FROM clothing_items c
    WHERE c.user_id = :userId
    AND (CAST(:category AS TEXT) IS NULL OR c.category = :category)
    AND (CAST(:season  AS TEXT) IS NULL OR :season  = ANY(c.seasons))
    AND (CAST(:style   AS TEXT) IS NULL OR :style   = ANY(c.styles))
    AND (CAST(:isClean AS TEXT) IS NULL OR c.is_clean = :isClean)
    ORDER BY c.created_at DESC
""", nativeQuery = true)
Page<ClothingItem> findFiltered(..., Pageable pageable);
```

**Kritik notlar:**
- `CAST(:param AS TEXT) IS NULL` — null-safe guard. Param gönderilmezse filtre devreye girmez.
- `= ANY(array_col)` — PostgreSQL `TEXT[]` alanlar için native syntax.
- `@PageableDefault(sort = "created_at")` — native query'de Java property adı değil **veritabanı sütun adı** kullanılır.
- `@BatchSize(size = 30)` — `Outfit.clothingItems` collection için. `@EntityGraph` native query ile uyumsuz olduğundan `IN(...)` batch load stratejisi seçildi.

---

### 3.4 Infinite Scroll

**Amaç:** Pagination butonu kaldırıldı, FlatList `onEndReached` ile otomatik sayfa yükleme.

**React Query v5 Pattern:**
```typescript
useInfiniteQuery({
  queryKey: [QUERY_KEYS.CLOTHING, 'infinite', filterParams],
  queryFn: ({ pageParam }) =>
    wardrobeApi.list({ ...filterParams, page: pageParam, size: 20 }).then(r => r.data),
  initialPageParam: 0,
  getNextPageParam: (lastPage) =>
    lastPage.data.last ? undefined : lastPage.data.number + 1,
});
```

**FlatList pattern:**
```tsx
// Container: overflow: 'hidden' → FlatList'e bounded height verir
// onEndReachedThreshold: 0.3 → listenin %30'una ulaşınca tetiklenir
// ListFooterComponent: ActivityIndicator (yükleniyor) / "Tüm sonuçlar yüklendi"
```

**`filterParams` stabilizasyonu:**
```typescript
const filterParams = useMemo(
  () => ({ ...(category && { category }), ...(season && { season }) }),
  [category, season]
);
// filterParams değişince query key değişir → liste sıfırlanır
// useMemo olmadan her render yeni nesne → gereksiz refetch
```

| Ekran | Hook | Filtre Türü |
|-------|------|-------------|
| WardrobeListScreen | `useInfiniteWardrobe(params)` | Server-side |
| OutfitListScreen | `useInfiniteOutfits(params)` | Server-side |
| FeedScreen | `useInfiniteFeed()` | — |
| ExploreScreen | `useInfiniteExplore()` | — |
| WearLogListScreen | `useInfiniteWearLogs()` | Client-side (rating/wouldWearAgain) |

---

### 3.5 Explore / Keşfet Ekranı

**Amaç:** Giriş yapmış tüm kullanıcıların PUBLIC paylaşımlarını keşfet.

**Backend endpoint:** `GET /api/v1/posts/explore` — `PostController` içinde ayrı handler.  
**Frontend hook:** `useInfiniteExplore` → `socialApi.explore(page)` → aynı `Page<PostResponse>` yapısı.  
**Navigation:** `PostCard.onPress` → `navigation.navigate('PostDetail', { id })`. PostCard'da `onUserPress` → `navigation.navigate('UserProfilePublic', { userId })`.

Feed vs Explore farkı: Feed yalnızca takip edilen kullanıcıların paylaşımlarını döndürür (backend `follows` tablosu join). Explore tüm PUBLIC postları döndürür.

---

### 3.6 UserProfilePublicScreen + Follow/Unfollow

**Amaç:** Herhangi bir kullanıcının profilini görüntüleyip takip et/bırak yapılabilir.

**Bileşenler:**
- Avatar: `profileImageUrl` varsa `Image`, yoksa indigo circle + `displayName[0]` baş harf
- Metrikler: `followerCount`, `followingCount`
- `isPrivate` badge: gizli hesap uyarısı
- Follow/Unfollow toggle butonu

**Own-profile check:**
```typescript
const { data: me } = useMe();
const isOwnProfile = !!me && me.id === userId;
// me.id  → UserProfile UUID (backend /me endpoint)
// userId → route param, PostResponse.userId'den gelir (aynı UUID)
// DIKKAT: keycloakId (Keycloak sub) ile karıştırılmamalı
{!isOwnProfile && <FollowButton ... />}
```

**Invalidation zinciri:**
```
useFollowUser / useUnfollowUser
  → invalidateQueries(['public-user', userId])   // followerCount güncellenir
  → invalidateQueries(['feed', 'infinite'])       // feed takip bazlı filtrelendiği için
```

**Navigation kaynakları:** FeedScreen PostCard → UserProfilePublic, ExploreScreen PostCard → UserProfilePublic, PostDetailScreen header → UserProfilePublic.

---

### 3.7 ProfileScreen + SettingsScreen

**ProfileScreen — Avatar Değişikliği:**
- Önceki: `👤` emoji
- Sonraki: `backgroundColor: '#6366F1'` indigo circle, içinde `(displayName ?? username)[0].toUpperCase()` beyaz baş harf
- `profileImageUrl` varsa `Image` bileşeni gösterilir; yoksa initial circle

**SettingsScreen — Logout Modal:**
- Logout butonu ayrı bir `SectionCard title="Oturum"` içine taşındı
- `ConfirmModal` bileşeni eklendi (`visible: showLogoutModal`, `onConfirm: () => { logout(); }`)
- Kullanıcı accidentaly logout yapmaz; onay gerektiren 2 adımlı akış

**ClothingDetailScreen — productUrl eksikliği giderildi:**
```tsx
{item.productUrl && <InfoRow label="Ürün URL" value={item.productUrl} />}
```

---

### 3.8 ConfirmModal + ImagePreview Shared Components

**ConfirmModal:**
```typescript
interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}
```
Kullanım yerleri: ClothingDetailScreen (sil), OutfitDetailScreen (sil), WearLogDetailScreen (sil), PostDetailScreen (sil), SettingsScreen (logout).

**ImagePreview:**
```typescript
interface ImagePreviewProps {
  uri: string | null | undefined;
  size?: 'thumb' | 'large';   // thumb: 100×100, large: 240px yüksek
  onError?: () => void;
}
```
`uri` değiştiğinde error state sıfırlanır — aynı bileşen inline edit sırasında yeni URL ile güncellenir.

---

### 3.9 README / Onboarding Dokümantasyonu

| Dosya | Güncelleme |
|-------|-----------|
| `README.md` (root) | Test kullanıcıları (e2e_alice), token curl komutu, önemli özellikler tablosu, bilinen teknik borçlar, production notları |
| `outfit-combine_backend/README.md` | `mvn` komutu (mvnw yok), pagination/filter curl örnekleri + enum değerleri, presigned upload 4 adım akışı, @Modifying/@BatchSize/@PageableDefault teknik notları |
| `outfit-combine_frontend_web/README.md` | Zustand authStore interface, React Query cache yapısı (tüm query key'ler), image upload 5 adım akışı, infinite scroll ekranlar tablosu, browser desteği, bilinen UX eksikleri |

---

## 4. Güncel Mimari Pattern Notları

### 4.1 React Query Query Key Pattern

```typescript
// queryKeys.ts sabitlerini kullan, string literal YAZMA
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

// Infinite query key: ['clothing', 'infinite', { category, season }]
// Regular query key:  ['outfit-item', id]
// Invalidation:       invalidateQueries({ queryKey: [QUERY_KEYS.CLOTHING] })
//                     → 'clothing' prefix'li tüm query'leri invalidate eder
```

### 4.2 Infinite Query Pattern (React Query v5)

```typescript
// Hook tanımı
export function useInfiniteWardrobe(params?: WardrobeFilterParams) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.CLOTHING, 'infinite', params ?? {}],
    queryFn: ({ pageParam }) =>
      wardrobeApi.list({ ...params, page: pageParam as number, size: 20 }).then(r => r.data),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.data.last ? undefined : lastPage.data.number + 1,
  });
}

// Kullanım
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteWardrobe(filterParams);
const allItems = useMemo(() => data?.pages.flatMap(p => p.data.content) ?? [], [data]);

// Web'de onEndReached için container overflow: 'hidden' zorunlu
// FlatList: onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
```

### 4.3 Upload (Presigned PUT) Pattern

```typescript
// useImageUpload.ts
async function upload(file: File, folder: 'clothing' | 'profiles') {
  // 1. Presign
  const { data } = await uploadApi.presign({ folder, filename: file.name, contentType: file.type });
  const { uploadUrl, publicUrl } = data.data;

  // 2. Binary PUT — Authorization header GÖNDERİLMEZ (MinIO presigned URL kendi imzalıdır)
  await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });

  // 3. publicUrl formdaki imageUrl alanına yazılır
  return publicUrl;
}
```

**Kritik:** MinIO presigned URL'ye istek atarken `Authorization: Bearer` header EKLENMEMELİ. Axios interceptor bu header'ı ekler; bu yüzden presigned upload `fetch` ile yapılır.

### 4.4 Auth Pattern (Web)

```
Browser → Keycloak /auth?response_type=code&code_challenge (PKCE S256)
       ← redirect URI + code

keycloak-js → /token → access_token + refresh_token

AuthProvider → kc.init({ onLoad: 'login-required' })
            → setToken(kc.token)
            → setUser({ keycloakId: kc.subject, ... })
            → authStore.isAuthenticated = true

kc.onTokenExpired → kc.updateToken(30) → setToken(newToken)

axiosClient interceptor:
  config.headers.Authorization = `Bearer ${useAuthStore.getState().token}`
  // Hook değil, getState() — interceptor hook dışında çalışır

logout:
  authStore.clear()
  queryClient.removeQueries()
  kc.logout({ redirectUri: window.location.origin })
```

### 4.5 Backend Filtering Pattern

```java
// Repository — native query ile null-safe çoklu filtre
@Query(value = """
    SELECT * FROM clothing_items c
    WHERE c.user_id = :userId
    AND (CAST(:category AS TEXT) IS NULL OR c.category = :category)
    AND (CAST(:season   AS TEXT) IS NULL OR :season = ANY(c.seasons))
    ORDER BY c.created_at DESC
""", nativeQuery = true)
Page<ClothingItem> findFiltered(
    @Param("userId") UUID userId,
    @Param("category") String category,
    @Param("season") String season,
    Pageable pageable
);

// Controller
@GetMapping
public ResponseEntity<ApiResponse<Page<ClothingItemResponse>>> list(
    @RequestParam(required = false) String category,
    @RequestParam(required = false) String season,
    @PageableDefault(sort = "created_at") Pageable pageable,
    Authentication auth
) { ... }
```

**@Modifying için zorunlu annotation:**
```java
@Modifying(clearAutomatically = true, flushAutomatically = true)
@Query("UPDATE ClothingItem c SET c.isClean = true WHERE c.id = :id AND c.userId = :userId")
int markClean(@Param("id") UUID id, @Param("userId") UUID userId);
// clearAutomatically: UPDATE sonrası L1 cache temizlenir → ardından findById stale değer döndürmez
// flushAutomatically: UPDATE öncesi pending dirty entities DB'ye yazılır
```

### 4.6 Docker Compose Pattern

```yaml
# Bağımlılık zinciri
postgres (healthcheck: pg_isready)
  ↓ service_healthy
keycloak (--import-realm, idempotent)
minio    (healthcheck: mc ready)
  ↓ service_healthy
minio-init (one-shot, restart: "no")
backend    (depends: postgres healthy + minio healthy)
frontend_web (depends: backend started)
```

**service_started vs service_healthy farkı:**
- `service_started`: container çalışıyor ama uygulama henüz hazır olmayabilir
- `service_healthy`: healthcheck başarılı → uygulama gerçekten hazır
- PostgreSQL ve MinIO için `service_healthy` zorunlu; keycloak için `service_started` kabul edilebilir (retry mekanizması var)

---

## 5. Faz 3 Mobile Roadmap

> **Hedef:** `outfit-combine_frontend_mobile/` dizininde iOS + Android native uygulaması.  
> **Kullanılan:** Aynı Spring Boot backend, aynı Keycloak realm, aynı MinIO. Yalnızca frontend değişir.  
> **Temel engel:** `keycloak-js` React Native'de çalışmaz → `expo-auth-session` ile değiştirilmeli.

### HIGH — Blocker veya temel kullanıcı değeri

#### H1. Auth — keycloak-js → expo-auth-session PKCE

**Neden blocker?** `keycloak-js` `window.location`, `document.cookie`, DOM event API'lerine doğrudan bağımlıdır. React Native bu API'leri sağlamaz → runtime crash.

**Çözüm:** `expo-auth-session` + `expo-crypto` + `expo-secure-store`

Detaylar Bölüm 6'da.

#### H2. Expo Managed Workflow Kurulumu

```
package.json      → expo ~53, react-native, dependencies
app.json          → bundleIdentifier: com.outfitcombine.app
                    scheme: outfitcombine (deep link için)
                    ios.infoPlist, android.permissions
eas.json          → development / preview / production profiles
metro.config.js   → aynı unstable_enablePackageExports: true
tsconfig.json     → strict: true, aynı web projesi ayarları
```

**Web projesinden doğrudan taşınan dosyalar:**
- `src/shared/api/` — axiosClient, wardrobeApi, outfitApi, wearLogApi, socialApi, userApi, uploadApi
- `src/shared/types/` — tüm TypeScript tip tanımları
- `src/shared/constants/queryKeys.ts`
- `src/shared/utils/date.ts`
- `src/features/*/hooks/` — tüm React Query hook'ları (API'ye bağımlı, platforma bağımsız)

#### H3. Native Navigasyon Yapısı

Web uygulaması `Sidebar` + NativeStack kullanıyor. Mobile'da standart bottom tab navigator uygun.

```
AppNavigator (Stack)
├── AuthLoading          (kc.init() sürerken)
├── MainTabs (BottomTabs)
│   ├── WardrobeStack
│   │   ├── WardrobeListScreen
│   │   ├── ClothingDetailScreen
│   │   └── AddClothingScreen
│   ├── OutfitStack
│   │   ├── OutfitListScreen
│   │   ├── OutfitDetailScreen
│   │   └── GenerateOutfitScreen
│   ├── FeedStack
│   │   ├── FeedScreen
│   │   ├── PostDetailScreen
│   │   ├── CreatePostScreen
│   │   └── UserProfilePublicScreen
│   ├── WearLogStack
│   │   ├── WearLogListScreen
│   │   └── WearLogDetailScreen
│   └── ProfileStack
│       ├── ProfileScreen
│       └── SettingsScreen
└── DashboardScreen      (ilk açılış / modal overlay)
```

`RootStackParamList` web projesindekiyle birebir aynı tutulursa hook'lar ve navigate çağrıları platforma bağımsız kalır.

#### H4. Auth Token Güvenli Depolama

Web'de `keycloak-js` token'ı bellek içinde tutar (js variable). Mobile'da uygulama arka plana geçince token kaybolur. Çözüm:

```
expo-secure-store → iOS Keychain, Android Keystore
SecureStore.setItemAsync('access_token', token)
SecureStore.setItemAsync('refresh_token', refreshToken)
SecureStore.getItemAsync('access_token')
```

`authStore` token alanı SecureStore'dan beslenir. Uygulama yeniden açıldığında `SecureStore.getItemAsync` → `setToken` → isAuthenticated=true zinciri kurulur (Keycloak'a yeniden giriş gerekmez, refresh token geçerliyse).

#### H5. Temel 9 Ekran (Mobile Layout ile)

| Web Ekranı | Mobile Değişiklik |
|-----------|-----------------|
| WardrobeListScreen | FlatList → native scroll (overflow: hidden gerekmez) |
| AddClothingScreen | ImagePicker → kamera + galeri native API |
| ClothingDetailScreen | Aynı, StyleSheet güncelleme |
| OutfitListScreen | Aynı |
| OutfitDetailScreen | Aynı |
| GenerateOutfitScreen | Aynı |
| WearLogListScreen | Aynı |
| WearLogDetailScreen | Aynı |
| DashboardScreen | Tab içinde, Sidebar olmadan |

`DashboardLayout` ve `Sidebar` web-specific bileşenler — mobile'da kullanılmaz. Her ekran `SafeAreaView` ile sarılır.

#### H6. Kamera / Galeri Image Picker (Native)

Web'de `ImagePickerButton` → `<input type="file">` kullanır; kamera erişimi yoktur.

Mobile'da native kamera:
```typescript
// expo-image-picker — native API
const result = await ImagePicker.launchCameraAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,
  aspect: [4, 3],
  quality: 0.8,
});

// ya da galeriden:
const result = await ImagePicker.launchImageLibraryAsync({ ... });

if (!result.canceled) {
  const file = result.assets[0];
  // useImageUpload hook aynı kalır — presigned URL akışı değişmez
  const publicUrl = await upload(file.uri, 'clothing');
}
```

Gerekli `app.json` izinleri:
```json
{
  "ios": { "infoPlist": { "NSCameraUsageDescription": "Kıyafet fotoğrafı çekmek için" } },
  "android": { "permissions": ["CAMERA", "READ_EXTERNAL_STORAGE"] }
}
```

---

### MEDIUM — Önemli, ilk native sürümü bloklamamaz

#### M1. Sosyal Ekranlar (FeedScreen, PostDetailScreen, CreatePostScreen, ExploreScreen, UserProfilePublicScreen)

Web implementasyonları yüksek oranda taşınabilir. Temel fark: native FlatList `onEndReached` web'deki `overflow: 'hidden'` hack'ini gerektirmez — native'de zaten doğal çalışır.

#### M2. Push Bildirimleri

```
expo-notifications → Expo Push Token
Backend: POST /api/v1/notifications/register { token, platform: 'ios'|'android' }
Yeni Flyway migration: V6__create_push_tokens.sql
Tetikleyiciler: like, comment, follow
```

Backend'de yeni modül gerektirir (`notification/` paketi). Bu Faz 3'ün kendi içinde ek bir geliştirme sprint'i sayılır.

#### M3. Optimistic UI (Follow/Unfollow, Like/Unlike)

```typescript
useMutation({
  mutationFn: followUser,
  onMutate: async (userId) => {
    // 1. Devam eden sorguları iptal et
    await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.PUBLIC_USER, userId] });
    // 2. Mevcut değeri kaydet (rollback için)
    const previous = queryClient.getQueryData([QUERY_KEYS.PUBLIC_USER, userId]);
    // 3. UI'ı hemen güncelle
    queryClient.setQueryData([QUERY_KEYS.PUBLIC_USER, userId], old => ({
      ...old, data: { ...old.data, isFollowing: true, followerCount: old.data.followerCount + 1 }
    }));
    return { previous };
  },
  onError: (_, userId, context) => {
    // Hata durumunda geri al
    queryClient.setQueryData([QUERY_KEYS.PUBLIC_USER, userId], context.previous);
  },
  onSettled: (_, __, userId) => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PUBLIC_USER, userId] });
  },
});
```

#### M4. Dark Mode

```typescript
// ThemeContext.tsx
const { colorScheme } = useColorScheme();
const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

// colors.ts (platform-agnostic)
export const colors = {
  primary: '#6366F1',
  background: { light: '#F9FAFB', dark: '#111827' },
  surface:    { light: '#FFFFFF', dark: '#1F2937' },
  text:       { light: '#111827', dark: '#F9FAFB' },
};
```

Web ve mobile aynı `colors.ts` token dosyasını kullanır.

#### M5. Shared Types / Hooks Reuse

Web ve mobile arasında taşınabilir katman:
```
shared/api/       → platform agnostic (Axios + HTTP)
shared/types/     → TypeScript interfaces (platform agnostic)
shared/hooks/     → React Query hooks (platform agnostic)
shared/utils/     → date.ts (platform agnostic)

Web-only:
  DashboardLayout, Sidebar, keycloak-js AuthProvider

Mobile-only:
  expo-auth-session AuthProvider, SecureStore, kamera picker, push token
```

Uzun vadede monorepo (`packages/shared`) düşünülebilir ama Faz 3 için sembolik link veya kopyalama yeterli.

---

### LOW — Production hazırlığı / ilerleyen fazlar

| # | Görev | Neden |
|---|-------|-------|
| L1 | **EAS Build + Submit** | App Store (iOS) + Google Play (Android). `eas build --platform all` + `eas submit`. OTA update için `expo-updates`. |
| L2 | **Biometric Auth** | `expo-local-authentication` — Face ID / parmak izi ile SecureStore'daki token'ın kilidini aç. Keycloak oturumu etkilenmez. |
| L3 | **Kubernetes / Helm** | `k8s/` dizini şu an boş. Deployment, Service, Ingress, Secret manifest'leri. Backend HPA + MinIO StatefulSet. |
| L4 | **Detox E2E** | iOS + Android native otomasyonu. Login flow, kıyafet ekleme, kombin üretme kritik path'leri. |
| L5 | **Sentry React Native** | `@sentry/react-native` — crash report, JS error, ANR, performance trace. |
| L6 | **CI/CD Pipeline** | GitHub Actions: `eas build` → TestFlight / Play Console internal test → otomatik dağıtım. |

---

## 6. İlk Implementasyon Adımı: expo-auth-session PKCE Kurulumu

Bu adım tüm Faz 3 mobile geliştirmesinin blockerı. Kurulmadan hiçbir ekran gerçek veriyle çalışamaz.

### 6.1 Paket Kurulumu

```bash
cd outfit-combine_frontend_mobile

npx create-expo-app . --template blank-typescript
# ya da mevcut klasöre:
npx expo install expo-auth-session expo-crypto expo-secure-store expo-web-browser
npm install @tanstack/react-query zustand axios
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npx expo install react-native-safe-area-context react-native-screens react-native-gesture-handler
```

### 6.2 Keycloak Realm Güncelleme

`keycloak/realm-export.json` dosyasına mobile redirect URI eklenmeli:

```json
{
  "clients": [{
    "clientId": "outfit-combine-web",
    "redirectUris": [
      "http://localhost:3000/*",
      "http://localhost:19006/*",
      "outfitcombine://*"          ← yeni (deep link scheme)
    ],
    "webOrigins": ["*"]
  }]
}
```

Realm'e uygulamak: `docker compose down -v && docker compose up -d` (realm sıfırdan import edilir).

### 6.3 app.json Scheme Tanımı

```json
{
  "expo": {
    "name": "Outfit Combine",
    "slug": "outfit-combine",
    "scheme": "outfitcombine",
    "ios": {
      "bundleIdentifier": "com.outfitcombine.app",
      "infoPlist": {
        "NSCameraUsageDescription": "Kıyafet fotoğrafı çekmek için kamera erişimi gereklidir."
      }
    },
    "android": {
      "package": "com.outfitcombine.app",
      "permissions": ["CAMERA", "READ_MEDIA_IMAGES"]
    }
  }
}
```

### 6.4 AuthProvider.native.tsx

```typescript
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const KEYCLOAK_URL    = process.env.EXPO_PUBLIC_KEYCLOAK_URL!;
const KEYCLOAK_REALM  = process.env.EXPO_PUBLIC_KEYCLOAK_REALM!;
const CLIENT_ID       = process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID!;
const DISCOVERY_URL   = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/.well-known/openid-configuration`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const discovery = AuthSession.useAutoDiscovery(DISCOVERY_URL);
  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'outfitcombine' });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
      codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === 'success' && discovery) {
      const { code } = response.params;

      // Authorization code → token exchange
      AuthSession.exchangeCodeAsync(
        { clientId: CLIENT_ID, code, redirectUri, extraParams: { code_verifier: request!.codeVerifier! } },
        discovery
      ).then(async (tokenResponse) => {
        const { accessToken, refreshToken } = tokenResponse;

        // Güvenli depola
        await SecureStore.setItemAsync('access_token',  accessToken);
        await SecureStore.setItemAsync('refresh_token', refreshToken ?? '');

        // Zustand authStore'a yaz (axiosClient interceptor okur)
        useAuthStore.getState().setToken(accessToken);

        // Kullanıcı bilgilerini JWT'den çöz
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        useAuthStore.getState().setUser({
          keycloakId: payload.sub,
          username:   payload.preferred_username,
          email:      payload.email,
          firstName:  payload.given_name,
          lastName:   payload.family_name,
        });
      });
    }
  }, [response]);

  // Uygulama başlangıcında SecureStore'dan token yükle
  useEffect(() => {
    SecureStore.getItemAsync('access_token').then(token => {
      if (token) {
        useAuthStore.getState().setToken(token);
        // refresh gerekiyorsa discovery + refreshAsync ile yenile
      } else {
        promptAsync(); // Token yok → login
      }
    });
  }, [discovery]);

  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <LoginScreen onLogin={() => promptAsync()} />;
  return <>{children}</>;
}
```

### 6.5 Token Refresh (Arka Plan)

```typescript
// Uygulama foreground'a döndüğünde token kontrolü
useAppState((state) => {
  if (state === 'active') {
    SecureStore.getItemAsync('refresh_token').then(async (refreshToken) => {
      if (!refreshToken || !discovery) return;

      // Token süresi dolmuş mu?
      const currentToken = useAuthStore.getState().token;
      const payload = JSON.parse(atob(currentToken!.split('.')[1]));
      const expiresSoon = payload.exp * 1000 - Date.now() < 30_000; // 30 sn kala

      if (expiresSoon) {
        const fresh = await AuthSession.refreshAsync(
          { clientId: CLIENT_ID, refreshToken },
          discovery
        );
        await SecureStore.setItemAsync('access_token',  fresh.accessToken);
        await SecureStore.setItemAsync('refresh_token', fresh.refreshToken ?? refreshToken);
        useAuthStore.getState().setToken(fresh.accessToken);
      }
    });
  }
});
```

### 6.6 Platform-Specific AuthProvider Seçimi

Metro bundler platform-specific dosya uzantılarını otomatik çözer:

```
AuthProvider.web.tsx     → web build'de kullanılır (mevcut keycloak-js)
AuthProvider.native.tsx  → iOS/Android build'de kullanılır (expo-auth-session)

// App.tsx (her iki platform)
import { AuthProvider } from './src/app/providers/AuthProvider';
// Metro otomatik doğru dosyayı seçer
```

### 6.7 Doğrulama Adımları

```bash
# Expo Go ile test
npx expo start

# iOS Simulator
npx expo run:ios

# Android Emülatör
npx expo run:android

# Beklenen akış:
# 1. Uygulama açılır
# 2. AuthProvider → Keycloak login sayfasını in-app browser'da açar
# 3. Kullanıcı giriş yapar → outfitcombine:// deep link callback
# 4. Token SecureStore'a yazılır
# 5. GET /api/v1/me → 200 → UserProfile oluşturulur
# 6. Dashboard görüntülenir
```

---

## 7. Sonraki Önerilen Tek Görev

> **`outfit-combine_frontend_mobile` — Expo Kurulumu + expo-auth-session PKCE Auth**

**Kapsam (tek sprint):**
1. `npx create-expo-app outfit-combine_frontend_mobile --template blank-typescript`
2. `expo-auth-session`, `expo-crypto`, `expo-secure-store`, `expo-web-browser` kurulumu
3. `app.json` — scheme, bundleIdentifier, izinler
4. `AuthProvider.native.tsx` — PKCE flow, token exchange, SecureStore depolama
5. `authStore.ts` kopyası (web ile aynı Zustand store)
6. `axiosClient.ts` kopyası (aynı interceptor)
7. `GET /api/v1/me` → 200 doğrulanınca sprint tamamdır

**Başarı kriteri:**  
Expo Go veya iOS Simulator'da Keycloak ile giriş yapılabiliyor ve `/api/v1/me` 200 dönüyor → tüm API hook'ları ve ekranlar üzerine inşa edilebilir.
