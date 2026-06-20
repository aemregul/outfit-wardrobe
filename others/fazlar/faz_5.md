# Outfit Combine — Faz 5: Mobile Feature Screens

**Planlama Tarihi:** 2026-05-14  
**Durum:** PLANLANMIŞ — Faz 4 Navigation Bootstrap tamamlandıktan sonra başlanacak  
**Bağımlılık:** Faz 4 minimum kabul kriterleri karşılanmış olmalı (çalışan navigation shell)  
**Hedef:** Tüm 17 ekranın mobile native uygulamasına taşınması + kamera/galeri + push bildirim

---

## Giriş

Faz 3 + Faz 4 çalışan bir navigation shell teslim eder: auth, 5 tab, placeholder ekranlar, 401 flow, deep link.  
Bu faz o shell'e gerçek ekranları birer birer ekler.

**Temel fark — Web vs Native:**
- `DashboardLayout` + `Sidebar` → `SafeAreaView` (her ekranda)
- `overflow: 'hidden' as any` → kaldırılır (native FlatList doğal scroll)
- `<input type="file">` → `expo-image-picker` (kamera + galeri)
- `keycloak-js logout redirect` → `SecureStore.deleteItemAsync` + authStore.clear()
- Tab bar web'de Sidebar'dı → native BottomTabNavigator (Faz 4'ten geliyor)

---

## Web → Mobile Ekran Uyumluluk Matrisi

| Ekran | Web Durumu | Mobile Değişiklik | Öncelik |
|-------|-----------|------------------|---------|
| DashboardScreen | ✅ | Sidebar kaldır, SafeAreaView, quick actions tab'lara yönlendir | HIGH |
| WardrobeListScreen | ✅ | overflow hack kaldır, FlatList native | HIGH |
| AddClothingScreen | ✅ | ImagePickerButton → expo-image-picker | HIGH |
| ClothingDetailScreen | ✅ | Küçük layout düzeltmeleri | HIGH |
| OutfitListScreen | ✅ | overflow hack kaldır | HIGH |
| OutfitDetailScreen | ✅ | Küçük layout düzeltmeleri | HIGH |
| GenerateOutfitScreen | ✅ | navigation.replace → navigation.navigate (TB-8) | HIGH |
| WearLogListScreen | ✅ | overflow hack kaldır, client filter korunur | HIGH |
| WearLogDetailScreen | ✅ | Küçük layout düzeltmeleri | HIGH |
| FeedScreen | ✅ | overflow hack kaldır | HIGH |
| ExploreScreen | ✅ | overflow hack kaldır | HIGH |
| CreatePostScreen | ✅ | expo-image-picker entegre et | HIGH |
| PostDetailScreen | ✅ | Küçük layout düzeltmeleri | HIGH |
| UserProfilePublicScreen | ✅ | Küçük layout düzeltmeleri | HIGH |
| ProfileScreen | ✅ | expo-image-picker (profil fotoğrafı), SafeAreaView | HIGH |
| SettingsScreen | ✅ | Logout — SecureStore.deleteItemAsync, kc.logout yok | HIGH |

---

## Modül Detayları

### 5.1 DashboardScreen (Mobile)

Web'deki Sidebar + 8 QuickAction kartı bottom tab navigation ile değiştirilir.

**Değişiklikler:**
- `DashboardLayout` → `SafeAreaView` wrapper
- QuickAction kartları: WardrobeList, OutfitList, GenerateOutfit, WearLogList, Feed, CreatePost
- 7 stat kartı korunur (API çağrıları aynı)
- Tab navigation bar QuickAction'ların bir kısmını obsolete kılar — sadece en sık kullanılanlar kalır

---

### 5.2 Image Upload (Native)

Web'de `ImagePickerButton` → `<input type="file">` kullanır.  
Mobile'da platform split: `ImagePickerButton.native.tsx`

```typescript
// ImagePickerButton.native.tsx
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,
  aspect: [4, 3],
  quality: 0.8,
});

// Veya kamera:
const result = await ImagePicker.launchCameraAsync({ ... });

if (!result.canceled) {
  const asset = result.assets[0];
  // useImageUpload hook aynı kalır — presigned PUT akışı değişmez
  // Sadece File objesi yerine { uri, type, name } objesini oluştur
  const file = {
    uri: asset.uri,
    type: asset.mimeType ?? 'image/jpeg',
    name: asset.fileName ?? `photo_${Date.now()}.jpg`,
  };
  await upload(file, 'clothing');
}
```

**app.json izinleri (zaten Faz 4'te eklendi):**
```json
{
  "ios": { "infoPlist": { "NSCameraUsageDescription": "Kıyafet fotoğrafı çekmek için" } },
  "android": { "permissions": ["CAMERA", "READ_EXTERNAL_STORAGE", "WRITE_EXTERNAL_STORAGE"] }
}
```

**Kullanılan ekranlar:** AddClothingScreen, ClothingDetailScreen (inline edit), CreatePostScreen, ProfileScreen

---

### 5.3 Presigned Upload — Native Binary PUT

Web'de `fetch(uploadUrl, { method: 'PUT', body: file })` çalışır.  
Native'de aynı pattern kullanılır ama `body` `File` değil `Blob` veya `FormData` içinde URI:

```typescript
// useImageUpload.ts — native uyumlu versiyon
const response = await fetch(asset.uri);
const blob = await response.blob();

await fetch(uploadUrl, {
  method: 'PUT',
  body: blob,
  headers: { 'Content-Type': mimeType },
});
```

---

### 5.4 SettingsScreen — Native Logout

Web'de: `kc.logout({ redirectUri: window.location.origin })`  
Native'de: DOM yok, Keycloak redirect çalışmaz.

```typescript
async function logout() {
  await SecureStore.deleteItemAsync('access_token');
  await SecureStore.deleteItemAsync('refresh_token');
  authStore.clear();
  queryClient.removeQueries();
  // navigationRef.resetToLogin() — authStore watch ile otomatik tetiklenir
}
```

---

### 5.5 Push Bildirimleri (expo-notifications)

**Backend değişikliği (V6 migration):**
```sql
CREATE TABLE push_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    platform VARCHAR(10) NOT NULL CHECK (platform IN ('ios', 'android')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, platform)
);
```

**Yeni backend endpoint:**
```
POST /api/v1/notifications/register
Body: { token: string, platform: 'ios' | 'android' }
```

**Tetikleyiciler:**
| Aksiyon | Bildirim |
|---------|---------|
| Like | "X gönderini beğendi" |
| Comment | "X gönderine yorum yaptı" |
| Follow | "X seni takip etti" |
| Outfit AI tamamlandı | "Kombinin hazır!" |

**Frontend akışı:**
```typescript
// App başlarken
const { status } = await Notifications.requestPermissionsAsync();
if (status === 'granted') {
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  await notificationApi.register({ token, platform: Platform.OS });
}
```

---

### 5.6 useFocusEffect Invalidation

Tüm list ekranlarında ekrana her dönüşte güncelleme:

```typescript
// WardrobeListScreen, OutfitListScreen, FeedScreen, WearLogListScreen
useFocusEffect(useCallback(() => {
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLOTHING] });
}, []));
```

---

### 5.7 SafeAreaView Pattern

Her ekranda `DashboardLayout` yerine:

```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

export function WardrobeListScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F7FF' }}>
      {/* ekran içeriği */}
    </SafeAreaView>
  );
}
```

---

### 5.8 overflow: 'hidden' Temizliği (TB-1)

Native'de bu hack gereksiz — kaldırılır:

```typescript
// Web: container: { flex: 1, padding: 28, overflow: 'hidden' as any }
// Native: container: { flex: 1, padding: 28 }
```

Etkilenen 7 dosya: WardrobeListScreen, OutfitListScreen, FeedScreen, ExploreScreen, WearLogListScreen, ClothingCard, PostCard.

---

## HIGH Öncelikli Görevler

| # | Görev | Bağımlı TB |
|---|-------|-----------|
| H1 | WardrobeListScreen native | TB-1 (overflow) |
| H2 | AddClothingScreen + ImagePickerButton.native.tsx | — |
| H3 | ClothingDetailScreen native | — |
| H4 | OutfitListScreen native | TB-1 |
| H5 | OutfitDetailScreen native | TB-8 (replace→navigate) |
| H6 | GenerateOutfitScreen native | TB-8 |
| H7 | WearLogListScreen native | TB-1 |
| H8 | WearLogDetailScreen native | TB-11 (delete→goBack) |
| H9 | FeedScreen native | TB-1 |
| H10 | ExploreScreen native | TB-1 |
| H11 | CreatePostScreen + ImagePickerButton | — |
| H12 | PostDetailScreen native | TB-11 |
| H13 | UserProfilePublicScreen native | — |
| H14 | ProfileScreen native + expo-image-picker | — |
| H15 | SettingsScreen native logout (SecureStore) | TB-2 |
| H16 | DashboardScreen native (Sidebar kaldır) | TB-2 |

## MEDIUM Öncelikli Görevler

| # | Görev |
|---|-------|
| M1 | Push bildirimleri (expo-notifications + backend V6 migration) |
| M2 | useFocusEffect invalidation tüm list ekranlarına |
| M3 | Optimistic UI — Like/Unlike, Follow/Unfollow |
| M4 | Haptic feedback (expo-haptics) — like, follow, delete |
| M5 | Network status banner (offline uyarısı) |

## LOW Öncelikli Görevler

| # | Görev |
|---|-------|
| L1 | Daily outfit recommendation bildirimi (scheduled) |
| L2 | Hava durumu entegrasyonu (5.9 Weather Modülü) |
| L3 | Gesture-based swipe back özelleştirme |
| L4 | Skeleton loading ekranları (shimmer effect) |
| L5 | Tema sistemi + Dark Mode |

---

## Teknik Borç Tamamlanma Planı

| Kod | Konu | Bu Fazda |
|-----|------|---------|
| TB-1 | overflow: hidden | ✅ Kaldırılır |
| TB-2 | DashboardLayout | ✅ SafeAreaView ile değiştirilir |
| TB-6 | WearLog client-side filtre | Opsiyonel — backend param eklenebilir |
| TB-7 | PostDetail yetki kontrolü | me.id === post.userId kontrolü eklenir |
| TB-8 | GenerateOutfit replace() | ✅ navigate() ile değiştirilir |
| TB-10 | WearLogList shortcut butonu | ✅ Kaldırılır |
| TB-11 | Delete → goBack() | ✅ Düzeltilir |

---

## QA Kriterleri

- [ ] iOS — tüm 16 ekran açılıyor, kırık yok
- [ ] Android — aynı
- [ ] Kamera izni → kıyafet fotoğrafı → MinIO upload → DB kayıt
- [ ] Galeri izni → fotoğraf seç → upload
- [ ] Logout → SecureStore temizlendi → Login ekranı
- [ ] useFocusEffect → geri dönünce liste güncelleniyor
- [ ] Push bildirim izni → token backend'e kayıt → like bildirimi alınıyor
- [ ] `tsc --noEmit` → 0 hata
- [ ] `expo export --platform web` → web hâlâ çalışıyor
