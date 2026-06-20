# Outfit Combine — Faz 4: Navigation Bootstrap (Native AppNavigator)

**Planlama Tarihi:** 2026-05-14  
**Durum:** PLANLANMIŞ — Faz 3 Auth Foundation tamamlandıktan sonra başlanacak  
**Hedef:** Production-ready navigation shell — sadece çalışan navigator, feature ekranı değil

> **Kritik kural:** Bu fazın çıktısı yalnızca çalışan navigation shell olmalıdır.  
> Feature implementasyonu değil. Tüm navigation kararları bu fazda finalize edilir.  
> Sonraki fazlarda navigation mimarisi DEĞİŞMEMELİDİR.

---

## Final Navigation Blueprint

```
NavigationContainer (ref={navigationRef}, linking={linking})
└── RootStack (NativeStackNavigator)
    ├── AuthLoading (undefined)
    ├── Login (undefined)
    ├── Main (undefined) → BottomTabNavigator
    │   ├── WardrobeTab  → WardrobeStack: WardrobeList, AddClothing
    │   ├── OutfitTab    → OutfitStack:   OutfitList, GenerateOutfit
    │   ├── FeedTab      → FeedStack:     Feed, Explore, CreatePost
    │   ├── WearLogTab   → WearLogStack:  WearLogList, WearLogDetail
    │   └── ProfileTab   → ProfileStack:  Profile, Settings
    ├── ClothingDetail ({ id: string })    [shared — RootStack]
    ├── OutfitDetail   ({ id: string })    [shared — RootStack]
    ├── PostDetail     ({ id: string })    [shared — RootStack]
    └── UserProfile    ({ id: string })    [shared — RootStack]
```

---

## Mimari Kararların Gerekçeleri

### Neden Bottom Tab + Feature Stack?

Web'deki flat 17-ekran NativeStack → mobile'a doğrudan çevrilmez:
1. Back button davranışı: flat stack'te tüm ekranlar aynı stack'te → back her zaman bir önceki ekrana döner. Bottom tab pattern'de her tab'ın kendi stack'i var → tab değişince stack korunur.
2. Tab bar görünürlüğü: Detail ekranlarında tab bar gizlenebilir. Flat stack'te her ekranda tab bar manuel yönetilmeli.
3. iOS/Android convention: kullanıcılar bottom tab navigation'ı bekler.

### Neden Shared Detail Screens RootStack'te?

Cross-tab navigate problemini çözer:
- FeedScreen → OutfitDetail: FeedStack ile OutfitStack farklı navigator altında
- `CompositeNavigationProp` ile çözülebilir ama her dosyada tekrar gerekir
- **Daha iyi çözüm:** Detail ekranları RootStack'e taşı → her yerde aynı navigate()

Trade-off: Detail ekranlarında tab bar görünmez. Bu istenen davranış.

### Neden Flat RootStackParamList?

```typescript
// Tüm screen'ler tek tipte
type RootStackParamList = { WardrobeList: undefined; ClothingDetail: { id: string }; ... };
```

- CompositeNavigationProp gerektirmez
- Feature stack'ler aynı tipi kullanır
- TypeScript tip çıkarımı her yerden aynı çalışır

Dezavantaj: Feature Stack'ler kendi paramListType'larını tanımlamaz. Kabul edilebilir — ekran sayısı az.

---

## Bağımlılık Listesi

```json
{
  "@react-navigation/native": "^7",
  "@react-navigation/native-stack": "^7",
  "@react-navigation/bottom-tabs": "^7",
  "react-native-screens": "^4",
  "react-native-safe-area-context": "^5",
  "react-native-gesture-handler": "^2",
  "expo-auth-session": "^6",
  "expo-crypto": "^14",
  "expo-secure-store": "^14",
  "expo-web-browser": "^14"
}
```

---

## 18-Adım Bootstrap Sprint Planı

### Adım 1 — AuthProvider.tsx → AuthProvider.web.tsx (TB-4)
- Mevcut `AuthProvider.tsx` → `AuthProvider.web.tsx` olarak rename
- `App.web.tsx` import'larını güncelle
- Web build test: `expo export --platform web` → 0 hata

### Adım 2 — Bağımlılıkları Kur
```
npx expo install @react-navigation/native @react-navigation/native-stack
npx expo install @react-navigation/bottom-tabs react-native-screens
npx expo install react-native-safe-area-context react-native-gesture-handler
npx expo install expo-auth-session expo-crypto expo-secure-store expo-web-browser
```

### Adım 3 — app.json Güncelle
```json
{
  "expo": {
    "scheme": "outfitcombine",
    "ios": { "bundleIdentifier": "com.outfitcombine.app" },
    "android": { "package": "com.outfitcombine.app" }
  }
}
```

### Adım 4 — navigationRef.ts Oluştur (TB-13)
```typescript
// src/shared/navigation/navigationRef.ts
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

let pendingReset: (() => void) | null = null;

export function resetToLogin() {
  const reset = () => navigationRef.reset({ index: 0, routes: [{ name: 'Login' }] });
  if (navigationRef.isReady()) reset();
  else pendingReset = reset;
}

export function onNavigationReady() {
  if (pendingReset) { pendingReset(); pendingReset = null; }
}
```

### Adım 5 — axiosClient.ts Güncelle (TB-3)
- 401 interceptor'a `navigationRef.resetToLogin()` ekle
- Refresh mutex ekle: tek seferde bir refresh deneyi
- refreshAsync başarısız → clear() + resetToLogin()

```typescript
let isRefreshing = false;
let failedQueue: Array<{ resolve: Function; reject: Function }> = [];

// 401 interceptor:
if (!isRefreshing) {
  isRefreshing = true;
  try {
    const newToken = await refreshAsync(...);
    authStore.setToken(newToken.accessToken);
    failedQueue.forEach(p => p.resolve(newToken.accessToken));
    return axiosClient(originalRequest);
  } catch {
    authStore.clear();
    navigationRef.resetToLogin();
    failedQueue.forEach(p => p.reject(error));
  } finally {
    isRefreshing = false;
    failedQueue = [];
  }
} else {
  return new Promise((resolve, reject) => {
    failedQueue.push({ resolve, reject });
  });
}
```

### Adım 6 — App.tsx İskeleti (Native)
```typescript
// App.tsx (native)
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppNavigator />
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

### Adım 7 — Navigation Tip Tanımları
```typescript
// src/app/navigation/types.ts
export type RootStackParamList = {
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

### Adım 8–12 — Feature Stack'ler (Placeholder)

Her feature stack için:
```typescript
// WardrobeStack.native.tsx
const Stack = createNativeStackNavigator<RootStackParamList>();
export function WardrobeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WardrobeList" component={PlaceholderScreen} />
      <Stack.Screen name="AddClothing" component={PlaceholderScreen} />
    </Stack.Navigator>
  );
}
```

Aynı pattern: OutfitStack, FeedStack, WearLogStack, ProfileStack.

### Adım 13 — MainTabs (BottomTabNavigator)
```typescript
// 5 tab: Wardrobe, Outfit, Feed, WearLog, Profile
// tabBarIcon: Ionicons veya MaterialCommunityIcons
// tabBarActiveTintColor: '#6366F1'
// Tab press → en üst ekrana pop (tabPress event)
```

### Adım 14 — AppNavigator.native.tsx

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

export function AppNavigator() {
  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      onReady={onNavigationReady}
    >
      <RootStack />
    </NavigationContainer>
  );
}
```

### Adım 15 — QueryProvider + AppState Bridge (TB-9)
```typescript
// App.tsx veya QueryProvider.tsx
useEffect(() => {
  const subscription = AppState.addEventListener('change', (status) => {
    focusManager.setFocused(status === 'active');
  });
  return () => subscription.remove();
}, []);
```

### Adım 16 — AuthProvider.native.tsx Bootstrap

```typescript
// İskelet — tam PKCE implementasyonu Faz 3'te
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const setToken = useAuthStore(s => s.setToken);

  useEffect(() => {
    async function init() {
      const token = await SecureStore.getItemAsync('access_token');
      if (token) setToken(token);
      setIsReady(true);
    }
    init();
  }, []);

  if (!isReady) return <AuthLoadingScreen />;
  return <>{children}</>;
}
```

### Adım 17 — Auth Guard useEffect

```typescript
// AppNavigator veya RootStack içinde
const isAuthenticated = useAuthStore(s => s.isAuthenticated);

useEffect(() => {
  if (!isAuthenticated && navigationRef.isReady()) {
    navigationRef.reset({ index: 0, routes: [{ name: 'Login' }] });
  }
}, [isAuthenticated]);
```

### Adım 18 — tsc + Expo Web Doğrulama
```
tsc --noEmit          → 0 hata
expo export --platform web  → web build hâlâ çalışır
```

---

## Auth Lifecycle Diyagramı

```
Uygulama başlar
      ↓
AuthLoadingScreen gösterilir
      ↓
SecureStore.getItemAsync('access_token')
      ↓
    var?
   ↙    ↘
 Evet    Hayır
  ↓        ↓
token     LoginScreen
decode     ↓
exp?    promptAsync()
  ↓        ↓
geçerli  exchangeCodeAsync
  ↓        ↓
authStore SecureStore.set
.setToken  + authStore.setToken
  ↓        ↓
isAuthenticated = true
      ↓
Main (BottomTabs) gösterilir
```

---

## 401 Akışı

```
API isteği → 401 response
      ↓
isRefreshing?
  Hayır:
    isRefreshing = true
    refreshAsync(refreshToken)
        ↓
      Başarılı:       Başarısız:
      yeni token      authStore.clear()
      retry queue     resetToLogin()
      retry original
```

---

## Risk Analizi

| Risk | Olasılık | Etki | Mitigasyon |
|------|----------|------|-----------|
| expo-auth-session ↔ Keycloak PKCE uyumsuzluğu | Düşük | Kritik | Expo docs + realm-export oidc-sub-mapper |
| NavigationContainer hazır olmadan resetToLogin() | Orta | Yüksek | pendingReset kuyruğu (TB-13) |
| Refresh token süresi → sonsuz döngü | Düşük | Yüksek | refreshRetryCount mutex |
| Tab Navigator içinden cross-tab navigate | Yüksek | Yüksek | Shared detail screens RootStack'te (TB-10, TB-11) |
| Web build kırılması (platform split hatalı) | Düşük | Yüksek | Metro .web.tsx/.native.tsx uzantı kuralı |
| SecureStore olmadan token kayıp | Orta | Orta | SecureStore.setItemAsync her token güncellemesinde |

---

## Bu Fazda YAPILMAYACAKLAR

- Feature ekranları (gerçek UI) — placeholder yeterli
- Backend değişiklik
- Sosyal, Wardrobe, Outfit feature implementasyonu
- Push bildirim entegrasyonu
- EAS build konfigürasyonu
- CI/CD pipeline

---

## Minimum Navigation Shell Kabul Kriterleri

| Kriter | Test Yöntemi |
|--------|-------------|
| Keycloak login → callback → GET /api/v1/me 200 | Manuel + Flipper network tab |
| SecureStore persistence — restart'ta re-login yok | Uygulama kapat/aç |
| 5 tab görünür, placeholder ekranlar | Vizüel |
| Tab back stack izolasyonu | Tab değiştir → diğer tab stack korunur |
| isAuthenticated=false → Login reset | authStore.clear() manuel tetikle |
| Logout → back → uygulama kapanır | Back button press |
| 401 → clearAuth → resetToLogin | Backend token geçersiz kıl |
| Deep link outfitcombine://feed → FeedStack | `xcrun simctl openurl` |
| `tsc --noEmit` → 0 hata | CI |
| `expo export --platform web` çalışır | CI |
