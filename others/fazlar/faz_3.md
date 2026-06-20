# Outfit Combine — Faz 3: Mobile Auth Foundation + Navigation Architecture

**Planlama Tarihi:** 2026-05-09  
**Durum:** PLANLANMIŞ — Faz 4 tamamlandıktan sonra feature ekranları aktarılacak  
**Hedef:** iOS + Android native uygulaması — `outfit-combine_frontend_mobile/` dizininde

---

## Temel Engel: keycloak-js Uyumsuzluğu

`keycloak-js` şu DOM API'lerine doğrudan bağımlıdır:
- `window.location` → redirect için
- `document.cookie` → session için
- DOM `CustomEvent` → iframe iletişimi için

React Native bu API'leri sağlamaz → runtime crash. **Çözüm:** `expo-auth-session` + `expo-crypto` + `expo-secure-store`.

---

## Mobile Stack

| Katman | Web (Faz 2) | Mobile (Faz 3) |
|--------|-------------|----------------|
| Auth | keycloak-js ^26 | expo-auth-session + expo-crypto |
| Token depolama | JS bellek | expo-secure-store (Keychain/Keystore) |
| Navigation | NativeStack flat (17 ekran) | RootStack + BottomTabs + 5 feature stack |
| Layout | DashboardLayout + Sidebar | SafeAreaView (react-native-safe-area-context) |
| Image picker | `<input type="file">` | expo-image-picker (kamera + galeri) |
| Overflow hack | `overflow: 'hidden' as any` | Kaldırılır (native scroll doğal çalışır) |
| Platform file | AuthProvider.tsx | AuthProvider.web.tsx + AuthProvider.native.tsx |

---

## Web'den Taşınan (Platform Agnostic) Dosyalar

Doğrudan kopyalanabilir — platform'a bağımsız:
- `src/shared/api/` — axiosClient, wardrobeApi, outfitApi, wearLogApi, socialApi, userApi, uploadApi
- `src/shared/types/` — tüm TypeScript tip tanımları
- `src/shared/constants/queryKeys.ts`
- `src/shared/utils/date.ts`
- `src/features/*/hooks/` — tüm React Query hook'ları
- `src/features/auth/store/authStore.ts` — saf Zustand, platform agnostic

---

## Mobile Auth Mimarisi

### expo-auth-session PKCE Akışı

```
app.json: scheme = "outfitcombine"
deep link: outfitcombine://auth/callback

1. makeRedirectUri({ scheme: 'outfitcombine', path: 'auth/callback' })
   → outfitcombine://auth/callback (native)

2. useAuthRequest({
     clientId: 'outfit-combine-web',
     scopes: ['openid', 'profile', 'email'],
     redirectUri,
     usePKCE: true,
     codeChallengeMethod: CodeChallengeMethod.S256,
   })

3. promptAsync() → expo-web-browser → Keycloak login form
   Keycloak → redirect outfitcombine://auth/callback?code=...

4. exchangeCodeAsync({ code, codeVerifier, redirectUri, clientId })
   → { accessToken, refreshToken, expiresIn }

5. SecureStore.setItemAsync('access_token', accessToken)
   SecureStore.setItemAsync('refresh_token', refreshToken)

6. authStore.setToken(accessToken)
   authStore.setUser({ keycloakId: ... })
   isAuthenticated = true
```

### Token Refresh

```typescript
const refreshResult = await refreshAsync({
  clientId: 'outfit-combine-web',
  refreshToken: stored.refreshToken,
}, discovery);
// Yeni token'ı SecureStore + authStore'a yaz
```

### SecureStore Persistence (Uygulama Yeniden Açılma)

```
App başlar → SecureStore.getItemAsync('access_token')
           → token var → decode → exp kontrolü
           → geçerli: authStore.setToken → isAuthenticated = true
           → süresi dolmuş: refreshAsync → yeni token
           → refresh de geçersiz: login ekranına yönlendir
```

---

## Navigation Mimarisi

### Navigator Ağacı

```
NavigationContainer (ref={navigationRef}, linking={linking})
└── RootStack (NativeStackNavigator)
    ├── AuthLoading (undefined)         ← splash/init
    ├── Login (undefined)               ← Keycloak PKCE
    ├── Main (undefined)                ← BottomTabNavigator
    │   ├── WardrobeTab  → WardrobeStack: WardrobeList, AddClothing
    │   ├── OutfitTab    → OutfitStack:  OutfitList, GenerateOutfit
    │   ├── FeedTab      → FeedStack:    Feed, Explore, CreatePost
    │   ├── WearLogTab   → WearLogStack: WearLogList, WearLogDetail
    │   └── ProfileTab   → ProfileStack: Profile, Settings
    ├── ClothingDetail ({ id: string })  [shared — cross-tab]
    ├── OutfitDetail   ({ id: string })  [shared — cross-tab]
    ├── PostDetail     ({ id: string })  [shared — cross-tab]
    └── UserProfile    ({ id: string })  [shared — cross-tab]
```

### Neden Shared Detail Screens RootStack'te?

Cross-tab navigate sorununu çözer. Örnek:
- FeedScreen → OutfitDetail: FeedStack ile OutfitStack farklı — `CompositeNavigationProp` olmadan navigate imkansız
- Çözüm: Detail ekranları RootStack'e taşı → her feature stack oradan navigate eder

Dezavantaj yok. Detail ekranlarının tab bar'ı göstermesi gerekmez.

### RootStackParamList (Flat Strategy)

```typescript
type RootStackParamList = {
  AuthLoading: undefined;
  Login: undefined;
  Main: undefined;
  WardrobeList: undefined;
  AddClothing: undefined;
  OutfitList: undefined;
  GenerateOutfit: undefined;
  Feed: undefined;
  Explore: undefined;
  CreatePost: undefined;
  WearLogList: undefined;
  WearLogDetail: { id: string };
  Profile: undefined;
  Settings: undefined;
  ClothingDetail: { id: string };
  OutfitDetail: { id: string };
  PostDetail: { id: string };
  UserProfile: { id: string };
};
```

Tüm feature stack'ler aynı `RootStackParamList` tipini kullanır → `CompositeNavigationProp` gerekmez.

---

## navigationRef Pattern

axiosClient 401 handler React lifecycle dışında çalışır. `createNavigationContainerRef` bu problemi çözer:

```typescript
// navigationRef.ts
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

let pendingReset: (() => void) | null = null;

export function resetToLogin() {
  if (navigationRef.isReady()) {
    navigationRef.reset({ index: 0, routes: [{ name: 'Login' }] });
  } else {
    pendingReset = () =>
      navigationRef.reset({ index: 0, routes: [{ name: 'Login' }] });
  }
}

// NavigationContainer.onReady:
// if (pendingReset) { pendingReset(); pendingReset = null; }
```

axiosClient 401 interceptor:
```typescript
authStore.clear()
navigationRef.resetToLogin()
```

---

## State Management

### Zustand authStore (Platform Agnostic)

Web'dekiyle aynı — `src/features/auth/store/authStore.ts` kopyalanır, değişmez.

### React Query + AppState Bridge

```typescript
// App.tsx veya QueryProvider.tsx
AppState.addEventListener('change', (status) => {
  focusManager.setFocused(status === 'active');
});
```

Uygulama foreground'a döndüğünde stale query'ler otomatik refetch yapar.

### useFocusEffect + invalidateQueries

```typescript
useFocusEffect(useCallback(() => {
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.OUTFITS] });
}, []));
```

Ekrana her dönüşte ilgili liste güncellenir.

---

## Deep Link v1

```typescript
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['outfitcombine://'],
  config: {
    screens: {
      Main: {
        screens: {
          FeedTab: { screens: { Feed: 'feed' } },
          WardrobeTab: { screens: { WardrobeList: 'wardrobe' } },
          OutfitTab: { screens: { OutfitList: 'outfits' } },
        },
      },
      OutfitDetail: 'outfit/:id',
      PostDetail: 'post/:id',
      UserProfile: 'user/:id',
    },
  },
};
```

---

## Platform Split Pattern

Metro bundler `.web.tsx` / `.native.tsx` uzantılarını otomatik çözümler:

```
AuthProvider.tsx        → Web: AuthProvider.web.tsx
                        → Native: AuthProvider.native.tsx

AppNavigator.tsx        → Web: AppNavigator.web.tsx (mevcut flat stack)
                        → Native: AppNavigator.native.tsx (yeni nested)
```

---

## HIGH Öncelikli Görevler

| # | Görev | Açıklama |
|---|-------|---------|
| H1 | expo-auth-session PKCE | keycloak-js yerine native auth |
| H2 | SecureStore token persistence | Keychain/Keystore, yeniden açılma |
| H3 | AuthProvider.native.tsx | Platform split, expo-web-browser |
| H4 | AppNavigator.native.tsx | RootStack + BottomTabs + 5 feature stack |
| H5 | navigationRef.ts | axiosClient 401 navigation fix (TB-3) |
| H6 | axiosClient refresh mutex | 401 → refreshAsync → retry (TB-3) |
| H7 | AuthProvider.tsx → .web.tsx rename | (TB-4) |
| H8 | overflow: hidden kaldırma (7 dosya) | (TB-1) |
| H9 | SafeAreaView wrapping | DashboardLayout yerine (TB-2) |

## MEDIUM Öncelikli Görevler

| # | Görev |
|---|-------|
| M1 | Sosyal ekranlar (Feed, Post, Explore, UserProfile) native layout |
| M2 | expo-image-picker (kamera + galeri) entegrasyonu |
| M3 | Push bildirimleri (expo-notifications + backend V6 migration) |
| M4 | Optimistic UI (Like/Unlike, Follow/Unfollow) |
| M5 | AppState focusManager bridge |

## LOW Öncelikli Görevler

| # | Görev |
|---|-------|
| L1 | Gesture handler (swipe to go back) — react-native-gesture-handler |
| L2 | Haptic feedback (expo-haptics) |
| L3 | Offline mode + network status banner |
| L4 | EAS build konfigürasyonu |
| L5 | Tema sistemi (colors.ts token, Dark Mode) |

---

## Teknik Borç Listesi (TB-1 — TB-13)

| Kod | Konu | Kaynak | Çözüm |
|-----|------|--------|-------|
| TB-1 | `overflow: 'hidden' as any` 7 dosyada | Web FlatList scroll hack | Mobile'da kaldır |
| TB-2 | DashboardLayout web-only | Sidebar + web-only scroll | SafeAreaView ile değiştir |
| TB-3 | axiosClient 401 → navigation yok | Redirect mekanizması yok | navigationRef + refreshAsync |
| TB-4 | AuthProvider.tsx → web/native split | keycloak-js DOM bağımlılığı | .web.tsx / .native.tsx |
| TB-5 | Keycloak test kullanıcıları realm'da yok | Manuel oluşturma gerekiyor | realm-export.json'a ekle |
| TB-6 | WearLog rating/wouldWearAgain client-side | Backend param yok | Backend parametre ekle (opsiyonel) |
| TB-7 | PostDetail silme yetki frontend'de yok | Backend 403 ile yakalıyor | Frontend me.id kontrolü ekle |
| TB-8 | GenerateOutfitScreen replace() yerine navigate() | Nested stack'te replace() kırılır | navigation.navigate() kullan |
| TB-9 | AppState focusManager bridge yok | Foreground'a dönünce refetch yok | App.tsx'e addEventListener ekle |
| TB-10 | WearLogList → OutfitList shortcut butonu | Cross-tab navigate — nested'da kırılır | Butonu kaldır (bottom tab var) |
| TB-11 | Delete ekranlar navigate('WardrobeList') | Nested stack'te cross-tab | goBack() kullan |
| TB-12 | expo-secure-store yokken token kayıp | Uygulama restart'ta logout | SecureStore persistence ekle |
| TB-13 | navigationRef pending queue yok | NavigationContainer hazır olmadan reset() çağrılırsa crash | pendingReset kuyruğu ekle |
