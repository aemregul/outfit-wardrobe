# Outfit Combine — Web Arayüzü Tasarım Brief'i

> Bu doküman, bir AI UI tasarım aracına (örn. v0, Figma AI, Galileo, Uizard vb.) doğrudan verilebilecek şekilde hazırlanmıştır. Mevcut kod tabanındaki gerçek ekran yapıları, bileşenler ve veri alanları baz alınmıştır.

---

## 1. Proje Genel Tanımı

**Outfit Combine**, kullanıcıların dijital gardırobunu yönetmesini, AI ile kombin önerileri almasını, giydiği kombinleri kaydetmesini ve sosyal bir feed üzerinden paylaşım yapmasını sağlayan bir web uygulamasıdır.

- **Platform:** Web (masaüstü öncelikli, responsive olmalı)
- **Dil:** Türkçe arayüz metinleri
- **Genel his:** Modern, temiz, hafif "moda/lifestyle" hissi veren, indigo/mor tonlarında, yumuşak gölgeli kart tabanlı bir tasarım dili (Notion + moda uygulaması karışımı gibi düşünülebilir)

---

## 2. Tasarım Sistemi (Renkler, Tipografi, Bileşen Stilleri)

### Renk Paleti

| Token | Hex / Değer | Kullanım |
|---|---|---|
| primary | `#6366F1` (indigo) | Ana aksiyon butonları, aktif durumlar, vurgular |
| primaryDark | `#4F46E5` | Hover/active koyu ton |
| primaryLight | `#A5B4FC` | İkincil vurgular, ikon arka planları |
| accent | `#8B5CF6` (mor) | AI ile ilgili özellikler (AI Kombin, AI rozetleri) |
| background | `#F0EFFE` | Sayfa arka planı (açık lavanta) |
| surface | `#FFFFFF` | Kart, panel arka planı |
| text | `#111827` | Ana metin |
| textSecondary | `#6B7280` | İkincil metin |
| textMuted | `#9CA3AF` | Placeholder, pasif metin |
| border / borderLight | `#E5E7EB` / `#F3F4F6` | Kart kenarlıkları, ayraçlar |
| success / successBg / successText | `#10B981` / `#D1FAE5` / `#065F46` | "Temiz", "Tekrar giyerim", olumlu rozetler |
| error / errorBg / errorText | `#EF4444` / `#FEE2E2` / `#991B1B` | "Kirli", silme, hata durumları |
| warning / warningBg / warningText | `#F59E0B` / `#FEF3C7` / `#92400E` | Uyarılar |
| indigo50/100/200 | `#EEF2FF` / `#E0E7FF` / `#C7D2FE` | Hafif vurgu arka planları, chip'ler |
| **Sidebar** sidebarBg | `#0D0C1D` (neredeyse siyah/lacivert) | Sol menü arka planı |
| sidebarText / sidebarTextActive | `#A0A9C0` / `#FFFFFF` | Sidebar pasif/aktif yazı |
| sidebarActiveBg | `rgba(99,102,241,0.18)` | Aktif menü öğesi arka planı (yarı saydam indigo) |

### Köşe Yuvarlaklığı (radius)
- sm: 8px, md: 12px, lg: 16px, xl: 20px, full: 999px (pill/badge)

### Gölgeler
- Kartlar: hafif indigo tonlu yumuşak gölge (shadowColor #6366F1, opacity ~0.07)
- Modal/Dialog: koyu, daha belirgin gölge

### Genel Bileşen Stili
- **Kartlar**: beyaz arka plan, `radius.lg` (16px), hafif gölge, iç boşluk geniş (16-20px)
- **Chip/Etiketler**: pill şeklinde (radius.full), seçiliyken indigo arka plan + beyaz yazı, seçili değilken açık gri/indigo50 arka plan
- **Butonlar**: 
  - Primary: indigo dolgu, beyaz yazı, radius.md
  - Secondary/outline: beyaz arka plan, indigo kenarlık
  - Tehlikeli aksiyonlar (sil): kırmızı tonlar
- **Rozetler (badge)**: küçük pill, durum rengine göre (yeşil=temiz/olumlu, kırmızı=kirli/olumsuz, mor=AI)
- **Boş durum (empty state)**: ortalanmış ikon + açıklama metni + opsiyonel CTA butonu
- **Yükleniyor durumu**: spinner/skeleton + "Yükleniyor..." metni
- **Hata durumu**: kırmızı tonlu kart + tekrar dene butonu

---

## 3. Genel Sayfa Düzeni (Layout)

Tüm sayfalar (giriş/kayıt ekranları hariç) ortak bir **Dashboard Layout** içinde render edilir:

```
┌─────────────┬────────────────────────────────────────┐
│             │                                          │
│   SIDEBAR   │           İÇERİK ALANI                  │
│  (sol, 224  │      (kaydırılabilir, scroll)           │
│   px sabit, │                                          │
│   koyu      │                                          │
│   arka plan)│                                          │
│             │                                          │
└─────────────┴────────────────────────────────────────┘
```

### Sidebar İçeriği (üstten alta)
1. **Marka logosu/adı**: "OC" ikon + "Outfit Combine" yazısı
2. **Navigasyon menüsü** (8 öğe, her biri ikon + Türkçe etiket):
   - ⊞ Dashboard (Ana Sayfa)
   - ▣ Dolabım (Wardrobe)
   - ◆ Kombinler (Outfits)
   - ◷ Geçmiş (Wear Log / Giyilme Geçmişi)
   - ◎ Sosyal Feed
   - ⊕ Keşfet (Explore)
   - ○ Profil
   - ◈ Ayarlar (Settings)
   - Aktif menü öğesi: yarı saydam indigo arka plan + beyaz yazı; pasifler gri yazı
3. **Kullanıcı bilgisi satırı** (alt kısım): yuvarlak avatar (kullanıcı adının baş harfi), görünen isim
4. **Çıkış Yap butonu**

---

## 4. Ekranlar (Sayfa Sayfa Detay)

Aşağıda her ekran; **amaç**, **bölümler/layout**, **bileşenler**, **veri alanları/seçenekler** ve **durumlar** olarak detaylandırılmıştır.

---

### 4.1 Dashboard (Ana Sayfa)

**Amaç:** Kullanıcıyı karşılayan, genel istatistikleri gösteren ve hızlı erişim sağlayan ana sayfa.

**Bölümler:**
1. **Karşılama bandı (banner)**: "Merhaba, {Kullanıcı Adı} 👋" başlığı + "Bugün ne giymek istersin?" alt metni + sağda/altta belirgin "✨ AI Kombin Oluştur" butonu (indigo/mor gradient olabilir)
2. **"Genel Bakış" istatistik kartları** (3 kart, yan yana grid):
   - **Toplam Kıyafet**: büyük sayı + "X temiz / Y kirli" alt bilgi
   - **Toplam Kombin**: büyük sayı + "Z favori" alt bilgi
   - **Giyilme Kayıtları**: büyük sayı + "Son giyilme: {tarih}" alt bilgi
3. **"Hızlı Erişim" grid** (8 kart, ikon + başlık + kısa açıklama, her biri farklı renk vurgusu):
   - Dolabım, Kıyafet Ekle, Kombin Oluştur, Kombinlerim, Giyilme Geçmişi, Sosyal Feed, Profilim, Ayarlar
   - Her kart tıklanabilir, hover'da hafif yükselme/gölge efekti

**Durumlar:** İstatistikler yüklenirken skeleton/loading göstergesi.

---

### 4.2 Dolabım (Wardrobe List)

**Amaç:** Kullanıcının tüm kıyafetlerini listeleyen, filtreleyen ve yöneten ana gardırop ekranı.

**Bölümler:**
1. **Üst başlık satırı**: "Dolabım" başlığı + toplam kıyafet sayısı + sağda "+ Kıyafet Ekle" butonu
2. **Arama kutusu**: kıyafet adına göre arama (text input, büyüteç ikonu)
3. **Filtre paneli (FilterPanel)**: yatay/grup halinde chip filtreler
   - **Kategori**: 13 seçenek (Üst Giyim, Alt Giyim, Dış Giyim, Ayakkabı, Çanta, Aksesuar, Takı, Elbise, Takım Elbise, Spor Giyim, Özel Gün, İç Giyim, Diğer)
   - **Durum**: Temiz / Kirli
   - **Mevsim**: İlkbahar, Yaz, Sonbahar, Kış, Tüm Mevsimler
   - **Stil**: Casual, Formal, Business, Spor, Streetwear, Şık, Minimal, Vintage, Elegant, Parti, Seyahat, Ev
   - Aktif filtreler ayrı bir satırda chip olarak gösterilir, "Tümünü Temizle" linki
4. **Kıyafet kartları listesi (infinite scroll / sonsuz kaydırma)**:
   - Her kart: küçük resim (sol), kıyafet adı, kategori/marka/beden bilgisi, Temiz/Kirli rozeti, mevsim/stil etiketleri (küçük chip'ler)
   - Kart üzerinde aksiyon ikonları: "Temiz/Kirli olarak işaretle" toggle, "Sil" (çöp kutusu ikonu)
   - Karta tıklayınca → Kıyafet Detay sayfasına gider

**Durumlar:**
- Yükleniyor: kart iskeletleri (skeleton)
- Hata: hata mesajı + tekrar dene
- Boş (hiç kıyafet yok): "Henüz kıyafet eklemediniz" + "Kıyafet Ekle" CTA
- Boş (filtre sonucu yok): "Bu filtrelere uygun kıyafet bulunamadı" + filtreleri temizle linki

---

### 4.3 Kıyafet Ekle (Add Clothing)

**Amaç:** Dolaba yeni kıyafet eklemek için form ekranı.

**Bölümler:** Tek sütun, dikey form. Alanlar:
1. **Kıyafet Adı*** — metin input (zorunlu)
2. **Kategori*** — 13 seçenekli chip grid (zorunlu, tek seçim)
3. **Alt Kategori** — serbest metin input
4. **Marka** — metin input
5. **Beden** — metin input
6. **Renkler** — virgülle ayrılmış metin input (ör: "Siyah, Beyaz")
7. **Mevsimler** — 5 seçenekli chip grid (çoklu seçim)
8. **Stiller** — 12 seçenekli chip grid (çoklu seçim)
9. **Kumaş** — metin input
10. **Desen** — metin input
11. **Ürün URL** — url input
12. **Fotoğraf** — resim yükleme bileşeni (dosya seç + önizleme) veya URL girişi alternatif
13. **Notlar** — çok satırlı textarea
14. Alt kısımda büyük "Dolaba Ekle" submit butonu (indigo, tam genişlik veya sağa yaslı)

**Durumlar:** Zorunlu alan boşsa hata vurgusu, gönderim sırasında buton "Ekleniyor..." disabled.

---

### 4.4 Kıyafet Detayı (Clothing Detail)

**Amaç:** Tek bir kıyafetin detaylarını görüntüleme ve düzenleme.

**Görüntüleme modu:**
1. Üstte büyük kıyafet fotoğrafı (yoksa placeholder ikon)
2. Kıyafet adı (büyük başlık) + yanında "Temiz" / "Kirli" rozeti
3. İstatistik pilleri: "Giyilme sayısı: Nx", "Son giyilme: {tarih}"
4. Bilgi kartı/grid (etiket-değer çiftleri): Kategori, Alt Kategori, Marka, Beden, Renkler, Mevsimler, Stiller, Kumaş, Desen, Ürün URL (link), Notlar
5. Aksiyon butonları: "Temiz/Kirli olarak işaretle" toggle butonu, "Düzenle" butonu, "Sil" butonu (kırmızı, ConfirmModal ile onay ister)

**Düzenleme modu:** Add Clothing ile aynı alanlar, düzenlenebilir form + "Kaydet" / "İptal" butonları

**Durumlar:** Yükleniyor, bulunamadı/hata, silme onay modalı (başlık + açıklama + "Vazgeç"/"Sil" butonları)

---

### 4.5 Kombinlerim (Outfit List)

**Amaç:** Kullanıcının kombinlerini (manuel veya AI üretimi) listeleme.

**Bölümler:**
1. **Üst başlık**: "Kombinlerim" + toplam sayı + sağda "✦ AI Kombin" butonu (mor/accent renkte, vurgulu)
2. **Arama kutusu**
3. **Filtre paneli**: 
   - **Favoriler**: Tümü / Sadece Favoriler
   - **Kaynak**: Tümü / AI / Manuel
   - **Mevsim**: 5 seçenek
   - **Stil**: 12 seçenek
   - **Etkinlik**: Günlük, İş, Akşam Yemeği, Düğün, Spor, Seyahat, Özel Gün
4. **Kombin kartları listesi (infinite scroll)**:
   - Her kart: kombin adı, "AI Üretildi" rozeti (varsa, mor), favori yıldızı (★/☆ toggle), mevsim/stil/etkinlik chip'leri, kombindeki kıyafet sayısı/önizleme ikonları
   - Karta tıklayınca → Kombin Detay

**Durumlar:** Loading/empty/error aynı pattern (Wardrobe ile tutarlı)

---

### 4.6 Kombin Detayı (Outfit Detail)

**Amaç:** Bir kombinin tüm detaylarını gösterme, giyildi olarak işaretleme.

**Bölümler:**
1. **Üst bar**: geri butonu + favori toggle (★/☆) sağda
2. **Başlık**: kombin adı + "✨ AI Üretildi" rozeti (varsa)
3. **Açıklama** metni
4. **AI Açıklama Kartı** (varsa): AI'nin kombini neden önerdiğine dair metin + güven skoru (% confidence, progress bar veya yüzde gösterimi)
5. **Metadata chip satırı**: mevsimler, etkinlik, stiller
6. **"Kıyafetler (N)" listesi**: her satırda kıyafet ikonu, adı, "{kategori} · {marka} · {beden}" alt metni, sağda temiz/kirli durumu için renkli nokta
7. **"Giyildi İşaretle" butonu** → tıklanınca form açılır:
   - Puan (1-5 yıldız seçici)
   - Etkinlik (metin input)
   - Not (textarea)
   - Gönder butonu → başarı banner'ı gösterir
8. **"Sil" butonu** (kırmızı, ConfirmModal ile)

**Durumlar:** Loading, hata, giyildi-kayıt-başarılı banner'ı

---

### 4.7 AI Kombin Oluştur (Generate Outfit)

**Amaç:** AI'dan yeni kombin önerisi istemek.

**Bölümler:**
1. **Bilgilendirme kartı**: AI'nin temiz kıyafetlerden nasıl kombin oluşturduğunu açıklayan kısa metin (mor/accent tonlu, ikon ile)
2. **"Etkinlik" seçimi**: 7 hazır chip (Günlük, İş, Akşam Yemeği, Düğün, Spor, Seyahat, Özel Gün) + özel etkinlik için serbest metin input
3. **"Mevsim" seçimi**: 5 chip (İlkbahar, Yaz, Sonbahar, Kış, Tüm Mevsimler)
4. **"✨ Kombini Oluştur" butonu** — büyük, vurgulu, mor/indigo gradient
5. Alt kısımda "Mevcut Kombinlere Git →" linki

**Durumlar:** Oluşturuluyor (loading spinner + "AI kombin hazırlıyor..." mesajı), başarılı → Kombin Detay'a yönlendirme, hata mesajı

---

### 4.8 Giyilme Geçmişi (Wear Log List)

**Amaç:** Kullanıcının geçmişte giydiği kombinlerin kaydını listeleme.

**Bölümler:**
1. **Başlık**: "Giyilme Geçmişi"
2. **Arama kutusu**
3. **Filtreler**:
   - "Min. Puan" — 1-5 yıldız chip seçimi
   - "Tekrar Giyerim mi?" — Tümü / Tekrar Giyerim / Giymem
4. **Sonuç sayısı metni**
5. **Kart listesi (infinite scroll)**: her kart
   - Sol tarafta tarih sütunu (gün / ay / yıl, büyük gün rakamı)
   - Etkinlik rozeti
   - Lokasyon metni
   - "Tekrar Giyerim" / "Giymem" rozeti (yeşil/kırmızı)
   - Yıldız puanlaması (1-5)
   - Not önizlemesi (kısaltılmış metin)
   - Tıklayınca → Wear Log Detay

**Durumlar:** loading/empty/error standart pattern

---

### 4.9 Giyilme Kaydı Detayı (Wear Log Detail)

**Amaç:** Tek bir giyilme kaydının detayı.

**Bölümler:**
1. **Hero kartı**: kombin adı (büyük başlık) + "Giyilme Tarihi" + biçimlendirilmiş tarih
2. **Fotoğraf** (varsa, opsiyonel)
3. **Detay kartı**: Etkinlik, Lokasyon, Puan (yıldız gösterimi), "Tekrar Giyerim mi?" rozeti, Not metni
4. **"Bu Kombini Gör →" butonu** (Outfit Detail'e link)
5. **"Sil" butonu** (kırmızı, onay modalı)

---

### 4.10 Sosyal Feed (Feed)

**Amaç:** Takip edilen kullanıcıların gönderilerini gösteren ana sosyal akış.

**Bölümler:**
1. **Üst başlık**: "Sosyal Feed" + sağda "+ Gönderi" butonu
2. **Gönderi kartları listesi (infinite scroll)**: her kart (PostCard)
   - Üstte kullanıcı satırı: avatar (baş harf), kullanıcı adı, tarih
   - Gönderi görseli (büyük, kart genişliğinde)
   - Açıklama metni (caption)
   - Beğeni sayısı + kalp ikonu (tıklanabilir, like/unlike)
   - Yorum sayısı
   - "İlgili Kombin" linki varsa gösterilir
   - Karta/kullanıcı adına tıklayınca → Post Detail / User Profile / Outfit Detail

**Durumlar:**
- Yükleniyor, hata
- Boş: "Henüz takip ettiğiniz kimsenin paylaşımı yok" + "Keşfet'e Git" / "Gönderi Oluştur" CTA

---

### 4.11 Keşfet (Explore)

**Amaç:** Herkese açık (PUBLIC) gönderileri keşfetme.

**Bölümler:**
1. **Başlık**: "Keşfet"
2. Feed ile aynı PostCard infinite scroll listesi (herkese açık gönderiler), "+ Gönderi" butonu yok

---

### 4.12 Gönderi Oluştur (Create Post)

**Amaç:** Yeni sosyal paylaşım oluşturma.

**Bölümler:**
1. **Görsel yükleme** (zorunlu) — dosya seç + önizleme veya URL girişi
2. **Açıklama (caption)** — textarea
3. **Kombin seç (opsiyonel)** — kullanıcının kombinlerinden yatay kaydırılabilir chip listesi, AI üretimi olanlarda "✨" ön eki
4. **Görünürlük seçici**: 3 chip — 🌍 Herkese Açık (PUBLIC) / 👥 Takipçiler (FOLLOWERS) / 🔒 Özel (PRIVATE)
5. **"Yayınla" submit butonu**

**Durumlar:** Görsel yüklenmeden submit edilemez (hata vurgusu), gönderiliyor durumu

---

### 4.13 Gönderi Detayı (Post Detail)

**Amaç:** Tek bir gönderiyi ve yorumlarını görüntüleme.

**Bölümler:**
1. **Üst bar**: geri butonu + (sahibiyse) sil butonu
2. **Kullanıcı satırı**: avatar (baş harf), görünen ad/kullanıcı adı, tarih · görünürlük ikonu
3. **Büyük görsel** (yüklenemezse 📷 placeholder)
4. **Açıklama metni**
5. **"İlgili Kombini Gör →" butonu** (varsa outfitId)
6. **Beğeni/yorum sayısı satırı** (kalp toggle + yorum ikonu)
7. **Yorumlar bölümü**: her yorum — avatar, yazar adı, içerik, tarih, (sahibiyse) sil ikonu
8. **Alt sabit (sticky) yorum giriş kutusu**: text input + gönder butonu

**Durumlar:** loading, hata, yorum gönderiliyor

---

### 4.14 Kullanıcı Profili (Public User Profile)

**Amaç:** Başka bir kullanıcının herkese açık profilini görüntüleme.

**Bölümler:**
1. **Geri butonu**
2. **Profil kartı**:
   - Avatar (fotoğraf veya baş harf çemberi)
   - Görünen ad (büyük başlık)
   - @kullanıcıadı
   - "Gizli Hesap" rozeti (hesap private ise)
   - Bio metni
   - İstatistik satırı: Takipçi sayısı / Takip Edilen sayısı
   - "Takip Et" / "Takibi Bırak" butonu (kendi profilinde gizli)

---

### 4.15 Profilim (Profile)

**Amaç:** Kullanıcının kendi profil bilgilerini görüntüleme/düzenleme.

**Bölümler:**
1. **Üst başlık**: "Profilim" + sağda "Düzenle" butonu
2. **Avatar satırı**: profil fotoğrafı (veya baş harf çemberi), @kullanıcıadı, görünen ad, açık/gizli hesap rozeti

**Görüntüleme modu — bilgi satırları:**
- E-posta, Kullanıcı Adı, Görünen İsim, Bio, Stil Tercihleri (chip'ler), Hesap Tipi, Üyelik Tarihi

**Düzenleme modu — form alanları:**
- Görünen İsim (text)
- Bio (textarea)
- Profil Fotoğrafı (yükleme bileşeni)
- Stil Tercihleri (virgülle ayrılmış metin)
- "Hesabı Gizli Yap" switch/toggle
- "Kaydet" / "İptal" butonları

---

### 4.16 Ayarlar (Settings)

**Amaç:** Hesap, gizlilik, uygulama ve bağlantı bilgilerini gösterme; çıkış yapma.

**Bölümler (her biri ayrı kart):**
1. **"Hesap Bilgileri"**: Kullanıcı adı, E-posta, Görünen İsim, Üyelik tarihi (salt okunur)
2. **"Gizlilik"**: Hesap görünürlüğü durumu + açıklayıcı bilgi metni
3. **"Uygulama Bilgileri"**: Uygulama adı, Versiyon (0.1.0), Platform (Web)
4. **"Bağlantı Yapılandırması"**: API URL, Keycloak URL, Realm, Client ID — monospace font ile gösterilir (geliştirici/teknik bilgi kartı)
5. **"Oturum"**: "Çıkış Yap" butonu (kırmızı) → ConfirmModal ile onay

---

## 5. Ortak/Paylaşılan Bileşenler

AI tasarım aracına bu bileşenlerin tutarlı bir şekilde tüm ekranlarda tekrar kullanıldığını belirtmek faydalı olacaktır:

- **FilterPanel**: Gruplandırılmış chip filtreler + aktif filtre chip'leri satırı + "Tümünü Temizle"
- **ConfirmModal**: Ortalanmış modal — başlık, açıklama metni, "Vazgeç" (gri) / "Onayla" (kırmızı veya indigo) butonları
- **ImagePickerButton + ImagePreview**: Resim seçme butonu + küçük önizleme + kaldırma ikonu
- **Card (genel kart)**: beyaz arka plan, radius.lg, hafif gölge, 16-20px padding
- **Chip (seçilebilir etiket)**: pill şekilli, seçili/seçili-değil iki durumu
- **Badge/Rozet**: küçük pill, durum renklerine göre (yeşil/kırmızı/mor/sarı)
- **Empty State**: ikon + açıklama + opsiyonel CTA buton
- **Loading State**: spinner veya skeleton kart
- **Error State**: kırmızı tonlu uyarı kartı + "Tekrar Dene" butonu

---

## 6. Navigasyon Akışı (Özet)

```
Dashboard ─┬─ Dolabım ─┬─ Kıyafet Ekle
           │           └─ Kıyafet Detayı (düzenle/sil)
           │
           ├─ Kombinlerim ─┬─ AI Kombin Oluştur
           │               └─ Kombin Detayı ─┬─ Giyildi İşaretle
           │                                  └─ (Giyilme Geçmişi'ne kayıt)
           │
           ├─ Giyilme Geçmişi ─── Giyilme Kaydı Detayı ─── Kombin Detayı'na link
           │
           ├─ Sosyal Feed ─┬─ Gönderi Oluştur
           │               └─ Gönderi Detayı ─┬─ Kullanıcı Profili
           │                                   └─ Kombin Detayı'na link
           │
           ├─ Keşfet ─── Gönderi Detayı (yukarıdaki gibi)
           │
           ├─ Profilim (düzenle)
           │
           └─ Ayarlar (çıkış yap)
```

Tüm sayfalar sol sidebar'dan erişilebilir; sidebar her sayfada sabit kalır.

---

## 7. AI Tasarım Aracına Notlar

- Uygulama **masaüstü web** odaklı, sidebar her zaman görünür (mobilde hamburger menüye dönüşebilir).
- Kart tabanlı, bol boşluklu (whitespace), yuvarlak köşeli, indigo/mor aksanlı modern bir "SaaS dashboard + moda uygulaması" hissi hedefleniyor.
- AI ile ilgili özellikler (AI Kombin, AI rozetleri, AI açıklama kartları) **mor/accent (#8B5CF6)** rengiyle diğer aksiyonlardan ayrıştırılmalı.
- Olumlu durumlar (temiz, tekrar giyerim, takip) **yeşil**; olumsuz/tehlikeli (kirli, sil, giymem) **kırmızı**; nötr bilgi **indigo/gri** tonlarında olmalı.
- Tüm ekranlarda infinite-scroll listeler için liste sonunda küçük bir "yükleniyor" göstergesi olmalı.
