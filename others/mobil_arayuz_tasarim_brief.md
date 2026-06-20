# Outfit Combine — Mobil Uygulama Arayüzü Tasarım Brief'i

> Bu doküman, bir AI UI tasarım aracına (Lovable, v0, Figma AI, Uizard vb.) verilebilecek şekilde hazırlanmıştır. Mevcut Expo / React Native mobil kod tabanındaki gerçek ekranlar, navigasyon yapısı ve bileşenler baz alınmıştır. **Web sürümünden farklı olarak mobilde sidebar YOKTUR — alt sekme (bottom tab) navigasyonu kullanılır.**

---

## 1. Proje Genel Tanımı

**Outfit Combine**, kullanıcıların dijital gardırobunu yönetmesini, AI ile kombin önerileri almasını, giydiği kombinleri kaydetmesini ve sosyal bir feed üzerinden paylaşım yapmasını sağlayan bir mobil uygulamadır (iOS/Android, Expo/React Native).

- **Platform:** iOS & Android (mobil-first, dikey ekran)
- **Dil:** Türkçe arayüz metinleri
- **Genel his:** Web sürümüyle aynı renk dili (indigo/mor), ama mobil native uygulama hissi — alt sekme barı, üstte basit başlıklar, kart listeleri, FAB (floating action button) tarzı ekleme butonları, pull-to-refresh

---

## 2. Tasarım Sistemi (Renkler, Tipografi, Bileşen Stilleri)

### Renk Paleti (mobil ekranlarda kullanılan)

| Token | Hex / Değer | Kullanım |
|---|---|---|
| primary (indigo) | `#6366F1` | Aktif sekme, ana butonlar, vurgular, istatistik değerleri |
| primary tab inactive | `#9CA3AF` | Pasif sekme ikon/yazı rengi |
| background | `#F8F7FF` | Ekran arka planı (açık lavanta-beyaz) |
| surface | `#FFFFFF` | Kart arka planı |
| text (koyu başlık) | `#1E1B4B` | Başlıklar, ana metin (koyu indigo-lacivert) |
| textSecondary | `#6B7280` | Alt metin, açıklamalar |
| textMuted | `#9CA3AF` | Placeholder, ikincil bilgiler |
| success / error / warning | `#10B981` / `#EF4444` / `#F59E0B` | Temiz/Kirli, tekrar giyerim/giymem, uyarılar |
| accent (mor) | `#8B5CF6` | AI ile ilgili rozet ve butonlar |

### Köşe Yuvarlaklığı & Gölge
- Kartlar: `borderRadius: 12px`, beyaz arka plan, hafif gölge (shadowOpacity 0.05, shadowRadius 6, elevation 2)
- Aksiyon kartları (Hızlı Erişim grid): aynı stil, grid'de %47 genişlik (2 sütun)

### Genel Bileşen Stili
- **Üst başlıklar**: `fontSize: 24, fontWeight: 700` (ana başlık), `fontSize: 17, fontWeight: 600` (bölüm başlığı)
- **İstatistik kartları**: ortalanmış büyük sayı (28px, indigo, bold) + altında küçük gri etiket
- **Hızlı erişim kartları**: emoji ikon (büyük) + başlık (14px, bold) + açıklama (11px, gri), 2 sütunlu grid
- **Chip/filtre butonları**: yatay kaydırılabilir (ScrollView horizontal), pill şekilli
- **Liste kartları**: FlatList ile sonsuz kaydırma (infinite scroll), her kart beyaz, radius 12, gölgeli
- **Boş/Hata/Yükleniyor durumları**: ortalanmış ikon + metin + (varsa) buton
- **SafeAreaView**: Tüm ekranlar `react-native-safe-area-context` ile çentik/status bar güvenli alanına uyumlu olmalı

---

## 3. Navigasyon Yapısı

### 3.1 Auth Akışı (giriş öncesi)
- **AuthLoading**: Açılış/yükleniyor ekranı (logo + spinner)
- **Login**: Keycloak ile OAuth/PKCE girişi — "Giriş Yap" butonu, hata mesajı alanı, yükleniyor durumu

### 3.2 Ana Uygulama — Alt Sekme Barı (Bottom Tab Navigator)

Giriş yapıldıktan sonra **5 sekmeli alt navigasyon barı** gösterilir:

| Sekme | İkon (aktif/pasif) | Etiket | İçerik |
|---|---|---|---|
| 1 | shirt / shirt-outline | **Gardırop** | WardrobeList stack |
| 2 | layers / layers-outline | **Kombinler** | OutfitList stack |
| 3 | home / home-outline | **Akış** | Feed stack (ana/orta sekme) |
| 4 | calendar / calendar-outline | **Giyim Log** | WearLogList stack |
| 5 | person / person-outline | **Profil** | Profile stack |

- Aktif sekme rengi: indigo `#6366F1`, pasif: gri `#9CA3AF`
- Her sekme kendi stack navigator'üne sahip (içinde detay/form ekranları açılabilir, tab bar gizlenebilir)

### 3.3 Stack İçi Ekranlar (her sekmeden ulaşılabilir)
- **Gardırop stack**: WardrobeList → AddClothing, ClothingDetail
- **Kombinler stack**: OutfitList → GenerateOutfit, OutfitDetail
- **Akış stack**: Feed → Explore, CreatePost, PostDetail, UserProfile
- **Giyim Log stack**: WearLogList → WearLogDetail
- **Profil stack**: Profile → Settings
- **Cross-tab paylaşılan detaylar**: ClothingDetail, OutfitDetail, PostDetail, UserProfile her sekmeden navigate edilebilir (root stack'te tanımlı)

---

## 4. Ekranlar (Detaylı)

---

### 4.1 Auth — AuthLoading

**Amaç:** Uygulama açılırken token kontrolü yapılırken gösterilen splash/yükleniyor ekranı.

**İçerik:** Ortada uygulama logosu + "Outfit Combine" yazısı + alt kısımda yükleniyor spinner'ı. Tam ekran indigo/lavanta arka plan.

---

### 4.2 Auth — Login

**Amaç:** Kullanıcının Keycloak üzerinden giriş yapması.

**Bölümler:**
1. Üstte logo/marka alanı + "Outfit Combine" başlığı + kısa slogan
2. Ortada/altta büyük "Giriş Yap" butonu (indigo dolgu, tam genişlik, radius 12)
3. Giriş sırasında buton içinde spinner ("Giriş yapılıyor...")
4. Hata durumunda buton altında kırmızı hata metni ("Giriş iptal edildi veya başarısız oldu.")

---

### 4.3 Dashboard / Ana Sayfa (Akış sekmesi içinde veya ayrı giriş ekranı olabilir)

> Not: Mobilde dashboard, "Akış" sekmesinin ilk açılış ekranı olarak ya da ayrı bir karşılama ekranı olarak kullanılabilir.

**Bölümler (üstten alta, dikey scroll):**
1. **Karşılama**: "Merhaba, {Kullanıcı Adı} 👋" (24px bold) + "Bugün ne giymek istersin?" (15px gri)
2. **"Dolabım" bölümü** — başlık + 3 istatistik kartı yan yana:
   - Toplam Kıyafet, Temiz, Kirli (her biri büyük sayı + etiket)
3. **"Kombinlerim" bölümü** — başlık + 2 istatistik kartı:
   - Toplam Kombin, Favori Kombin
4. **"Giyilme" bölümü** — başlık + 2 kart:
   - Kayıt Sayısı, Son Giyilme (tarih, küçük yazı)
5. **"Hızlı Erişim" bölümü** — başlık + 2 sütunlu grid (6 kart, emoji + başlık + açıklama):
   - 👚 Dolabım — "Kıyafetlerini yönet"
   - ➕ Kıyafet Ekle — "Yeni kıyafet ekle"
   - ✨ Kombin Oluştur — "AI ile kombin yap"
   - 👗 Kombinlerim — "Kombinleri görüntüle"
   - 📅 Giyilme Geçmişi — "Ne zaman ne giydim"
   - 📱 Sosyal Feed — "Paylaşımları keşfet"

**Durumlar:** İstatistikler yüklenirken "–" gösterilir (loading placeholder).

---

### 4.4 Gardırop (Wardrobe List) — Sekme 1

**Amaç:** Kullanıcının kıyafetlerini listeleme/filtreleme.

**Bölümler:**
1. **Üst başlık**: "Gardırop" + sağda "+" FAB veya buton (Kıyafet Ekle)
2. **Arama kutusu**: kıyafet adı/marka/alt kategoriye göre anlık filtreleme
3. **Yatay kaydırılabilir filtre çipleri**:
   - Kategori (13 seçenek), Durum (Temiz/Kirli), Mevsim (5), Stil (12)
4. **Sonuç sayısı** (toplam kıyafet sayısı)
5. **Kart listesi (FlatList, infinite scroll, pull-to-refresh)**: her kart
   - Küçük görsel (sol), kıyafet adı, kategori/marka bilgisi, Temiz/Kirli rozeti
   - Hızlı aksiyon: temiz/kirli toggle, sil
   - Tıklayınca → ClothingDetail

**Durumlar:** loading (spinner), error (mesaj + tekrar dene), empty (ikon + "Henüz kıyafet eklemediniz" + "Kıyafet Ekle" CTA), filtrelenmiş-boş

---

### 4.5 Kıyafet Ekle (Add Clothing)

**Amaç:** Yeni kıyafet ekleme formu (Gardırop stack içinde, tam ekran modal/push).

**Bölümler:** Dikey scroll form:
1. Kıyafet Adı* (text)
2. Kategori* (yatay/grid chip seçimi, 13 seçenek)
3. Alt Kategori, Marka, Beden (text input'lar)
4. Renkler (virgülle ayrılmış metin)
5. Mevsimler (çoklu chip, 5 seçenek)
6. Stiller (çoklu chip, 12 seçenek)
7. Kumaş, Desen, Ürün URL (text input'lar)
8. Fotoğraf — kamera/galeri seç (ImagePickerButton) + önizleme
9. Notlar (textarea)
10. Alt sabit (sticky) "Dolaba Ekle" butonu

---

### 4.6 Kıyafet Detayı (Clothing Detail)

**Bölümler:**
1. Üst bar: geri ok + (varsa) düzenle/sil ikonları
2. Büyük fotoğraf (yoksa placeholder ikon)
3. Kıyafet adı + Temiz/Kirli rozeti
4. İstatistik pilleri: giyilme sayısı, son giyilme tarihi
5. Bilgi listesi: kategori, alt kategori, marka, beden, renkler, mevsimler, stiller, kumaş, desen, ürün linki, notlar
6. Aksiyon butonları: Temiz/Kirli toggle, Düzenle, Sil (onay modalı ile)

**Düzenleme modu:** Add Clothing ile aynı form, "Kaydet/İptal"

---

### 4.7 Kombinler (Outfit List) — Sekme 2

**Bölümler:**
1. Üst başlık: "Kombinler" + sağda "✦ AI Kombin" butonu
2. Arama kutusu
3. Yatay filtre çipleri: Favoriler, Kaynak (AI/Manuel), Mevsim, Stil, Etkinlik
4. Kart listesi (infinite scroll): kombin adı, "AI Üretildi" rozeti, favori yıldız toggle, mevsim/stil/etkinlik chip'leri
5. Tıklayınca → OutfitDetail

**Durumlar:** loading/empty/error standart

---

### 4.8 AI Kombin Oluştur (Generate Outfit)

**Bölümler:**
1. Bilgilendirme kartı (mor tonlu, AI açıklaması)
2. Etkinlik chip seçimi (7 hazır + özel metin)
3. Mevsim chip seçimi (5)
4. Büyük "✨ Kombini Oluştur" butonu (mor/indigo)
5. Oluşturulurken: tam ekran/overlay loading ("AI kombin hazırlıyor...")
6. Başarılı → OutfitDetail'e otomatik geçiş

---

### 4.9 Kombin Detayı (Outfit Detail)

**Bölümler:**
1. Üst bar: geri + favori toggle (★/☆)
2. Başlık + "✨ AI Üretildi" rozeti
3. Açıklama metni
4. AI açıklama kartı (varsa) + güven skoru
5. Mevsim/etkinlik/stil chip satırı
6. "Kıyafetler (N)" listesi — her satır: ikon, ad, kategori·marka·beden, temiz/kirli nokta
7. "Giyildi İşaretle" butonu → açılır form: yıldız puanlama (1-5), etkinlik input, not textarea, gönder
8. Sil butonu (onay modalı)

---

### 4.10 Giyim Log (Wear Log List) — Sekme 4

**Bölümler:**
1. Üst başlık: "Giyim Log"
2. Arama kutusu
3. Filtreler: Min. Puan (1-5 yıldız chip), "Tekrar Giyerim mi?" (Tümü/Evet/Hayır)
4. Sonuç sayısı
5. Kart listesi (infinite scroll): tarih (gün/ay/yıl), etkinlik rozeti, lokasyon, "Tekrar Giyerim/Giymem" rozeti, yıldız puanı, not önizlemesi
6. Tıklayınca → WearLogDetail

---

### 4.11 Giyilme Kaydı Detayı (Wear Log Detail)

**Bölümler:**
1. Hero kart: kombin adı + giyilme tarihi
2. Fotoğraf (varsa)
3. Detay kartı: etkinlik, lokasyon, yıldız puanı, tekrar giyerim rozeti, not
4. "Bu Kombini Gör →" butonu (OutfitDetail'e link)
5. Sil butonu (onay modalı)

---

### 4.12 Akış / Sosyal Feed (Feed) — Sekme 3

**Bölümler:**
1. Üst başlık: "Akış" + sağda "+" (Gönderi Oluştur) butonu
2. Kart listesi (infinite scroll, pull-to-refresh): her kart
   - Kullanıcı satırı (avatar baş harfi, ad, tarih)
   - Gönderi görseli (tam genişlik)
   - Açıklama metni
   - Beğeni (kalp toggle) + yorum sayısı
   - "İlgili Kombin" linki (varsa)
   - Tıklayınca → PostDetail / UserProfile / OutfitDetail

**Durumlar:** empty → "Henüz takip ettiğiniz kimsenin paylaşımı yok" + "Keşfet'e Git"/"Gönderi Oluştur" CTA

---

### 4.13 Keşfet (Explore)

**Bölümler:** "Keşfet" başlığı + Feed ile aynı PostCard infinite-scroll listesi (herkese açık gönderiler), "+ Gönderi" butonu yok. Akış stack'i içinden erişilir (örn. üstte tab/link ile).

---

### 4.14 Gönderi Oluştur (Create Post)

**Bölümler:**
1. Görsel yükleme (zorunlu) — kamera/galeri + önizleme
2. Açıklama (caption) textarea
3. Kombin seç (opsiyonel) — yatay kaydırılabilir chip listesi (✨ AI rozetiyle)
4. Görünürlük seçici: 🌍 Herkese Açık / 👥 Takipçiler / 🔒 Özel (3 chip)
5. "Yayınla" butonu (alt sabit)

---

### 4.15 Gönderi Detayı (Post Detail)

**Bölümler:**
1. Üst bar: geri + (sahibiyse) sil
2. Kullanıcı satırı: avatar, ad/kullanıcı adı, tarih · görünürlük ikonu
3. Büyük görsel
4. Açıklama metni
5. "İlgili Kombini Gör →" butonu (varsa)
6. Beğeni/yorum sayısı satırı
7. Yorumlar listesi: avatar, yazar, içerik, tarih, (sahibiyse) sil
8. Alt sabit yorum input + gönder butonu (klavye açıldığında yukarı kayan KeyboardAvoidingView)

---

### 4.16 Kullanıcı Profili (Public User Profile)

**Bölümler:**
1. Geri butonu
2. Profil kartı: avatar (foto/baş harf), görünen ad, @kullanıcıadı, "Gizli Hesap" rozeti (varsa), bio, takipçi/takip sayıları, "Takip Et"/"Takibi Bırak" butonu

---

### 4.17 Profil (Profile) — Sekme 5

**Bölümler:**
1. Üst başlık: "Profil" + "Düzenle" butonu/ikonu
2. Avatar + @kullanıcıadı + görünen ad + açık/gizli hesap rozeti

**Görüntüleme:** E-posta, Kullanıcı Adı, Görünen İsim, Bio, Stil Tercihleri (chip'ler), Hesap Tipi, Üyelik Tarihi, ayrıca "Ayarlar" satırı/butonu (Settings'e link)

**Düzenleme modu:** Görünen İsim, Bio (textarea), Profil Fotoğrafı (kamera/galeri), Stil Tercihleri, "Hesabı Gizli Yap" switch, Kaydet/İptal

---

### 4.18 Ayarlar (Settings)

**Bölümler (kart grupları):**
1. "Hesap Bilgileri": kullanıcı adı, e-posta, görünen ad, üyelik tarihi
2. "Gizlilik": hesap görünürlüğü + açıklama
3. "Uygulama Bilgileri": uygulama adı, versiyon, platform (iOS/Android)
4. "Bağlantı Yapılandırması": API URL, Keycloak URL, Realm, Client ID (monospace, geliştirici bilgisi)
5. "Oturum": "Çıkış Yap" butonu (kırmızı, onay modalı)

---

## 5. Ortak/Paylaşılan Bileşenler

- **Bottom Tab Bar**: 5 sekme, ikon + Türkçe etiket, aktif/pasif renk farkı
- **ConfirmModal**: ortalanmış modal — başlık, açıklama, "Vazgeç"/"Onayla" butonları
- **ImagePickerButton + ImagePreview**: kamera/galeriden seçim + küçük önizleme
- **StatCard**: büyük sayı + etiket, ortalanmış, beyaz kart
- **QuickAction kartı**: emoji + başlık + açıklama, 2 sütunlu grid
- **Filtre çipleri**: yatay kaydırılabilir (ScrollView horizontal), pill şekilli, seçili/seçili-değil durumları
- **Liste kartı (Card)**: beyaz, radius 12, hafif gölge
- **Empty/Loading/Error state'leri**: ikon + metin + opsiyonel CTA / spinner / tekrar dene butonu
- **SafeAreaView**: tüm ekranlarda status bar/notch güvenliği

---

## 6. Navigasyon Akışı (Özet)

```
[AuthLoading] → [Login] → (giriş başarılı) → [Bottom Tab Bar]

Bottom Tab Bar:
├─ Gardırop ──┬─ Kıyafet Ekle
│             └─ Kıyafet Detayı
│
├─ Kombinler ─┬─ AI Kombin Oluştur
│             └─ Kombin Detayı ── Giyildi İşaretle
│
├─ Akış ──────┬─ Keşfet
│             ├─ Gönderi Oluştur
│             └─ Gönderi Detayı ──┬─ Kullanıcı Profili
│                                 └─ Kombin Detayı
│
├─ Giyim Log ── Giyilme Kaydı Detayı ── Kombin Detayı
│
└─ Profil ──── Ayarlar (Çıkış Yap)

Cross-tab: ClothingDetail / OutfitDetail / PostDetail / UserProfile
her sekmeden navigate edilebilir.
```

---

## 7. AI Tasarım Aracına Notlar

- Bu **mobil (iOS/Android)** bir uygulama — dikey ekran, alt sekme barı (bottom tab bar) her zaman görünür (form/detay ekranlarında gizlenebilir).
- Web sürümüyle **aynı renk paleti** (indigo `#6366F1`, mor accent `#8B5CF6`, yeşil/kırmızı durum renkleri) kullanılmalı, ancak arka plan tonu hafif farklı (`#F8F7FF`) ve sidebar yerine alt sekme + üst başlık (header) kullanılır.
- Kartlar mobilde tam genişlik (1 sütun) liste halinde; sadece "Hızlı Erişim" ve istatistik alanları 2-3 sütunlu grid.
- Formlar (Kıyafet Ekle, Profil Düzenle, Gönderi Oluştur) tam ekran sayfa olarak açılır, alt kısımda sabit (sticky) ana aksiyon butonu olmalı.
- Klavye açıldığında alt input alanları (yorum, not) `KeyboardAvoidingView` ile yukarı kaymalı.
- Listelerde **pull-to-refresh** ve **infinite scroll** standart davranış olmalı.
- AI ile ilgili öğeler (AI Kombin, AI rozeti, AI açıklama kartı) mor (`#8B5CF6`) ile vurgulanmalı.
