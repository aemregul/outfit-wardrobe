# Outfit Combine — Web Frontend

Expo ~53 / React Native Web tabanlı SPA. Keycloak PKCE flow ile kimlik doğrulama yapar, Spring Boot backend'e Axios ile bağlanır.

## Teknoloji Stack

| Katman | Teknoloji | Versiyon |
|---|---|---|
| Framework | Expo / React Native Web | ~53.0 / 0.76.7 |
| Dil | TypeScript (strict) | 5.x |
| Navigasyon | React Navigation NativeStack | ^7.0 |
| Server State | TanStack React Query | ^5.62 |
| Client State | Zustand | ^5.0 |
| HTTP | Axios | ^1.7 |
| Auth | keycloak-js (ESM) | ^26.0 |
| Build | Expo CLI (`expo export`) | — |
| Prod Sunucu | nginx alpine | — |

## Klasör Yapısı

```
outfit-combine_frontend_web/
├── App.tsx                         # Root — QueryClient + AuthProvider + Navigator
├── app.json                        # "output": "single" (SPA modu)
├── metro.config.js                 # unstable_enablePackageExports: true (keycloak-js ESM)
├── nginx.conf                      # SPA fallback: try_files $uri /index.html
├── Dockerfile                      # node:20-alpine build → nginx:alpine serve
└── src/
    ├── app/
    │   ├── navigation/AppNavigator.tsx   # RootStackParamList + Stack.Navigator
    │   └── providers/AuthProvider.tsx    # Keycloak init, token refresh, /me prefetch
    ├── features/
    │   ├── auth/
    │   │   ├── hooks/useMe.ts            # React Query — GET /api/v1/me
    │   │   └── store/authStore.ts        # Zustand — token, user, isAuthenticated
    │   ├── dashboard/screens/
    │   ├── wardrobe/                     # WardrobeList, AddClothing
    │   ├── outfits/                      # OutfitList, OutfitDetail, GenerateOutfit
    │   ├── wearlogs/                     # WearLogList, WearLogDetail
    │   └── social/                       # Feed, CreatePost, PostDetail
    └── shared/
        ├── api/                          # axiosClient, wardrobeApi, outfitApi, socialApi, userApi
        ├── components/Layout/            # DashboardLayout, Sidebar
        ├── constants/queryKeys.ts
        ├── types/                        # clothing.types, outfit.types, social.types, user.types
        └── utils/date.ts                 # formatDate, formatDateTime, toLocalDateTime
```

## Ekranlar

| Ekran | Route | Açıklama |
|---|---|---|
| Dashboard | `Dashboard` | Ana sayfa, istatistikler, hızlı erişim |
| Dolap | `WardrobeList` | Kıyafet listesi, filtrele |
| Kıyafet Ekle | `AddClothing` | Yeni kıyafet formu |
| Kombinler | `OutfitList` | Kombin listesi |
| Kombin Detay | `OutfitDetail` | Detay, favori, giyildi işaretle |
| Kombin Üret | `GenerateOutfit` | AI kombin oluştur |
| Geçmiş | `WearLogList` | Giyilme geçmişi |
| Geçmiş Detay | `WearLogDetail` | Tek kayıt detayı |
| Feed | `Feed` | Sosyal paylaşım akışı |
| Gönderi Oluştur | `CreatePost` | Resim + açıklama + kombin seç |
| Gönderi Detay | `PostDetail` | Beğen, yorum yap, sil |

## Local Geliştirme

### Gereksinimler

- Node.js 20+
- Backend ve Keycloak çalışıyor olmalı (bkz. root `docker compose up -d`)

### Kurulum

```bash
cd outfit-combine_frontend_web
npm install --legacy-peer-deps
```

### Ortam Değişkenleri

`.env.local` dosyası oluştur:

```env
EXPO_PUBLIC_API_URL=http://localhost:8080/api/v1
EXPO_PUBLIC_KEYCLOAK_URL=http://localhost:8081
EXPO_PUBLIC_KEYCLOAK_REALM=outfit-combine
EXPO_PUBLIC_KEYCLOAK_CLIENT_ID=outfit-combine-web
```

### Geliştirme Sunucusu

```bash
npx expo start --web
```

Tarayıcıda `http://localhost:19006` açılır. Keycloak login ekranına yönlendirir.

### TypeScript Kontrolü

```bash
npx tsc --noEmit
```

### Web Build

```bash
npx expo export --platform web
# dist/ klasörüne çıktı verir
```

## Docker ile Çalıştırma

Build argümanları build zamanında Metro bundle'a baked-in olur — nginx runtime'da okuyamaz.

```bash
# Root'tan tüm stack:
docker compose up -d --build

# Sadece frontend yeniden build:
docker compose up -d --build frontend_web
```

Uygulama `http://localhost:3000` adresinde açılır.

## Auth Mimarisi

```
Browser → Keycloak PKCE (S256) → access_token
access_token → Axios interceptor (Authorization: Bearer) → Spring Boot API
```

### Zustand authStore

`src/features/auth/store/authStore.ts` — Keycloak oturum durumunu tutar:

```typescript
interface AuthState {
  token: string | null;          // Keycloak access token (Axios interceptor okur)
  user: { keycloakId, username, email, firstName, lastName } | null;
  isAuthenticated: boolean;
  setToken(token: string): void;
  setUser(user: ...): void;
  clear(): void;                  // logout'ta çağrılır
}
```

**AuthProvider** → `kc.init()` → `setToken` + `setUser` → `authStore.isAuthenticated = true`  
**kc.onTokenExpired** → `kc.updateToken(30)` → `setToken` (yeni token)  
**logout** → `clear()` → `kc.logout({ redirectUri: window.location.origin })`

Keycloak state (Zustand) ile backend profili (React Query `useMe`) birbirinden bağımsız tutulur — backend profili `isAuthenticated` değişince otomatik `GET /api/v1/me` ile çekilir ve `user_profiles` satırı ilk girişte oluşturulur.

### React Query Cache Yapısı

`src/shared/constants/queryKeys.ts`:

| Query Key | Veri | Stale Time |
|---|---|---|
| `['me']` | `UserProfileResponse` (kendi profil) | 5 dk |
| `['clothing', 'infinite', params]` | `Page<ClothingItemResponse>` | default |
| `['outfit-item', id]` | `OutfitResponse` | default |
| `['outfits', 'infinite', params]` | `Page<OutfitResponse>` | default |
| `['wear-logs', params]` | `Page<WearLogResponse>` | default |
| `['wear-logs', 'infinite', {}]` | `Page<WearLogResponse>` | default |
| `['feed', 'infinite']` | `Page<PostResponse>` | default |
| `['explore', 'infinite']` | `Page<PostResponse>` | default |
| `['post-item', id]` | `PostResponse` | default |
| `['public-user', id]` | `PublicUserProfileResponse` | default |

Mutation sonrası invalidasyon: `invalidateQueries` ile ilgili query key'in tüm varyantları temizlenir.

## Görsel Yükleme (Image Upload) Akışı

```
1. Kullanıcı ImagePickerButton'a basar
2. useImageUpload hook → POST /api/v1/upload/presign
   { folder: "clothing" | "profiles", filename, contentType }
3. Backend → MinIO SDK → presigned PUT URL döner
4. useImageUpload → fetch PUT <uploadUrl> ile binary görsel yükler
5. publicUrl state'e yazılır → ImagePreview component'i gösterir
6. Kullanıcı formu kaydeder → publicUrl backend'e gönderilir (imageUrl / profileImageUrl)
```

İlgili dosyalar:
- `src/shared/hooks/useImageUpload.ts`
- `src/shared/components/ImagePickerButton.tsx`
- `src/shared/components/ImagePreview.tsx`

MinIO bucket `outfit-combine` ilk başlatmada elle oluşturulmalıdır (bkz. backend README → Presigned Upload Akışı).

## Infinite Scroll Kullanan Ekranlar

| Ekran | Hook | Backend Filtre |
|---|---|---|
| `WardrobeListScreen` | `useInfiniteWardrobe(params)` | category, isClean, season, style — server-side |
| `OutfitListScreen` | `useInfiniteOutfits(params)` | isFavorite, aiGenerated, occasion, season, style — server-side |
| `FeedScreen` | `useInfiniteFeed()` | — |
| `ExploreScreen` | `useInfiniteExplore()` | — |
| `WearLogListScreen` | `useInfiniteWearLogs()` | rating, wouldWearAgain — **client-side** (backend desteği yok) |

Tüm ekranlarda aynı pattern uygulanır:
- Container: `overflow: 'hidden'` → FlatList'e bounded height verir, `onEndReached` tetiklenir
- FlatList: `onEndReached` + `onEndReachedThreshold={0.3}` + `ListFooterComponent` (spinner / "Tüm sonuçlar yüklendi")
- `filterParams`: `useMemo` ile stabilize edilir; filtre değişince query key değişir, liste sıfırlanır

## Browser Desteği

| Tarayıcı | Destek |
|---|---|
| Chrome 110+ | Tam |
| Firefox 110+ | Tam |
| Safari 16+ | Tam |
| Edge 110+ | Tam |
| Mobil Safari | Kısmi (scroll davranışı farklı olabilir) |

Web SPA olarak çalışır; React Native Web bileşenleri `div/span/input` karşılıklarına derlenir.

## Bilinen UX Eksikleri

| Alan | Açıklama |
|---|---|
| **ClothingDetail** | Kıyafete ait tüm giyilme geçmişini filtreleme yok |
| **WearLog Filtreleri** | Rating ve wouldWearAgain client-side filtre — yalnızca yüklenen sayfalar üzerinde çalışır |
| **PostDetail Yetki** | Silme butonu her zaman görünür; yetki backend'de kontrol edilir (403) |
| **ImagePicker (Web)** | `expo-image-picker` web'de `<input type="file">` kullanır; kamera erişimi yoktur |
| **Optimistic UI** | Follow/Unfollow, Like/Unlike sunucu yanıtını bekler; gerçek optimistic update yok |
| **Offline** | Service Worker veya offline cache yok |

## Önemli Konfigürasyon Detayları

**`metro.config.js` — `unstable_enablePackageExports: true`**
keycloak-js ^26 ESM-only paket; Metro'nun package exports'u çözmesi gerekir.

**`app.json` — `"output": "single"`**
SPA modu; `src/app/` dizini olmasına rağmen Expo Router'ı devre dışı bırakır.

**`nginx.conf` — `try_files $uri /index.html`**
Tüm React Navigation route'larının SPA fallback ile çalışmasını sağlar.

## Sık Karşılaşılan Hatalar

**Login sonrası beyaz ekran / sonsuz yükleme**
- Backend veya Keycloak çalışmıyor olabilir.
- Network tab'da `/api/v1/me` isteğinin 200 dönüp dönmediğini kontrol et.

**`401` — tüm API isteklerinde**
- JWT issuer mismatch. Backend konfigürasyonunu kontrol et (bkz. backend README).

**`CORS` hatası**
- Backend `CORS_ALLOWED_ORIGINS=http://localhost:3000` env'ini aldı mı kontrol et.

**keycloak-js import hatası (Metro)**
- `metro.config.js` içinde `unstable_enablePackageExports: true` olmalı.

**`EXPO_PUBLIC_*` değerleri production'da boş**
- Bu değişkenler build zamanında baked-in olur. Docker imajını yeniden build et:
  `docker compose up -d --build frontend_web`

**`POST /api/v1/posts` → 400**
- `imageUrl` alanı zorunludur (`@NotBlank`). CreatePost ekranı bu alanı doldurmalı.

**`POST /api/v1/outfits/{id}/wear` → 500**
- `wornAt` `LocalDateTime` formatı gerektirir: `"2026-05-06T12:00:00"`.
- `toLocalDateTime()` util fonksiyonu bu dönüşümü otomatik yapar.
