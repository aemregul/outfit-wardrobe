# Outfit Combine — Faz 6: AI Service

**Planlama Tarihi:** 2026-05-14  
**Durum:** PLANLANMIŞ — Faz 5 Mobile tamamlandıktan sonra başlanacak  
**Bağımlılık:** Faz 5 QA kriterleri karşılanmış olmalı  
**Hedef:** Mock AI'ı gerçek AI ile değiştirme — kıyafet görsel analizi + akıllı kombin önerisi

---

## Mevcut Durum (Mock)

Şu anda `/api/v1/outfits/generate` endpoint'i hardcoded bir mock döndürüyor:
- Rastgele kıyafet seçimi
- Sabit reason metni
- aiScore: 0.75 (sabit)

Bu faz bu mock'u gerçek bir AI servisi ile değiştirir.

---

## AI Mimarisi Seçenekleri

### Seçenek A: Backend İçinde (Başlangıç Önerisi)

```
Spring Boot Backend
└── ai/ paketi
    ├── AiService.java (interface)
    ├── ClaudeAiService.java (implementation)
    └── AiConfig.java (API key, model config)
```

**Avantaj:** Ekstra servis yok, deployment basit  
**Dezavantaj:** Java'da Python AI kütüphaneleri yok; sadece HTTP API kullanılabilir (Claude/OpenAI REST)

### Seçenek B: Ayrı Python Servisi (Gelişmiş)

```
outfit-combine_ai_service/
├── main.py            FastAPI
├── clothing_analyzer.py
├── outfit_recommender.py
├── Dockerfile
└── requirements.txt
```

```
Backend → HTTP → AI Service (FastAPI :8000)
AI Service → Anthropic API / OpenAI API
```

**Avantaj:** Python ML ekosistemi (transformers, CLIP, etc.), bağımsız scale  
**Dezavantaj:** Ek Docker servisi, ağ gecikmesi

**Öneri:** Faz 6 başlangıcında Seçenek A (Spring Boot içinde REST çağrısı), büyüdükçe Seçenek B'ye geçiş.

---

## Modül 1: Kıyafet Görsel Analizi

### Amaç

Kullanıcı kıyafet fotoğrafı yüklediğinde AI otomatik doldurur:
- category, subCategory
- colors[]
- style[]
- season[]
- material
- pattern
- suitableOccasions[]
- confidenceScore

### Backend Endpoint

```
POST /api/v1/clothing/analyze
Body: { imageUrl: string }
Response: ClothingAnalysisResponse {
  category, subCategory, colors, styles, seasons,
  material, pattern, occasions, confidenceScore
}
```

### Claude Vision Prompt

```
Analyze this clothing item image and respond in JSON format:
{
  "category": "TOPS|BOTTOMS|DRESSES|OUTERWEAR|SHOES|ACCESSORIES|BAGS|UNDERWEAR|SPORTSWEAR|SWIMWEAR|SLEEPWEAR|SUITS|OTHER",
  "subCategory": "string",
  "colors": ["string"],
  "styles": ["CASUAL|FORMAL|BUSINESS|SPORTY|ELEGANT|BOHEMIAN|STREETWEAR|MINIMALIST|VINTAGE|ROMANTIC|EDGY|PREPPY"],
  "seasons": ["SPRING|SUMMER|AUTUMN|WINTER|ALL_SEASON"],
  "material": "string",
  "pattern": "string",
  "occasions": ["string"],
  "confidenceScore": 0.0-1.0
}
Return ONLY the JSON, no explanation.
```

### Frontend Entegrasyon

```typescript
// AddClothingScreen — fotoğraf yüklendikten sonra
const imageUrl = await upload(file, 'clothing');
const analysis = await clothingApi.analyze({ imageUrl });
// Form alanlarını otomatik doldur — kullanıcı düzenleyebilir
setCategory(analysis.category);
setColors(analysis.colors);
setSeasons(analysis.seasons);
// ...
```

---

## Modül 2: Akıllı Kombin Önerisi

### Mevcut Mock

```java
// OutfitGenerateService.java — şimdiki mock
List<ClothingItem> allItems = clothingItemRepository.findByUserId(userId);
// Rastgele seç, hardcoded reason döndür
```

### Hedef AI Akışı

```
1. Kullanıcı: occasion + season seçer
2. Backend: kullanıcının tüm temiz kıyafetlerini çeker
3. Backend → AI: kıyafet listesi + occasion + season + hava durumu (opsiyonel)
4. AI: uyumlu kombinasyonu JSON olarak döndürür
5. Backend: clothingItemId'leri doğrular, Outfit entity oluşturur
```

### AI'ya Gönderilecek Prompt Yapısı

```
User wants an outfit for: {occasion}
Season: {season}
Available clean clothing items:
{items_json}

Select appropriate items and return:
{
  "itemIds": ["uuid1", "uuid2", ...],
  "reason": "Why this combination works",
  "score": 0.0-1.0,
  "tips": ["styling tip 1", "styling tip 2"]
}

Rules:
- Include at least one top, one bottom (or dress)
- Suggest shoes if available
- Consider color harmony
- Match style to occasion
- Do NOT include dirty items
- Do NOT select more than 6 items total
```

---

## Modül 3: Kullanıcı Tercih Öğrenimi

### Veri Kaynakları

| Kaynak | Sinyal |
|--------|--------|
| WearLog.rating (1-5) | Yüksek rating = beğenilen kombinler |
| WearLog.wouldWearAgain | true/false tercih sinyali |
| Favori kombinler | isFavorite = true |
| Like geçmişi | Beğenilen post stilleri |

### Kullanım Senaryosu

AI kombin önerisi sırasında geçmiş veriler bağlam olarak eklenir:
```
This user typically prefers: {style_preferences}
Their top-rated outfits were: {top_rated_outfits}
Avoid styles from low-rated outfits: {low_rated_styles}
```

---

## Modül 4: Hava Durumu Entegrasyonu (Opsiyonel)

### Kaynak

OpenWeatherMap API (ücretsiz tier: 60 çağrı/dakika)

### Backend Endpoint

```
GET /api/v1/weather?lat={lat}&lon={lon}
Response: { temperature, condition, feelsLike, humidity }
```

### Kombin Önerisine Entegrasyon

```
Today's weather: 8°C, rainy
→ AI prompt'a eklenir: "Prefer waterproof or warm clothing, avoid light fabrics"
```

**app.json izni:**
```json
{ "android": { "permissions": ["ACCESS_FINE_LOCATION"] } }
```

---

## Yeni Backend Endpoint'leri (Faz 6)

| Method | Path | Açıklama |
|--------|------|---------|
| POST | `/api/v1/clothing/analyze` | Görsel analiz → kıyafet metadata |
| GET | `/api/v1/weather` | Hava durumu (opsiyonel) |

---

## Yeni Flyway Migration'ları

| Migration | İçerik |
|-----------|--------|
| V7__add_ai_analysis.sql | clothing_items'a ai_analysis_json JSONB sütunu (opsiyonel cache) |
| V8__add_weather_cache.sql | weather_cache tablosu (lat/lon → cache, TTL: 1 saat) |

---

## HIGH Öncelikli Görevler

| # | Görev |
|---|-------|
| H1 | ClaudeAiService.java — Anthropic API HTTP client (Spring Boot) |
| H2 | POST /api/v1/clothing/analyze endpoint |
| H3 | AddClothingScreen — analiz sonucu form auto-fill |
| H4 | Outfit generate mock → gerçek AI ile değiştirme |
| H5 | AI API key yönetimi (application.yml + Docker secret) |

## MEDIUM Öncelikli Görevler

| # | Görev |
|---|-------|
| M1 | WearLog verisinden kullanıcı tercih bağlamı |
| M2 | Hava durumu entegrasyonu (OpenWeatherMap) |
| M3 | AI analiz sonuçlarını cache'leme (clothing_items tablosunda) |
| M4 | Outfit öneri kalite skoru UI'da gösterme |

## LOW Öncelikli Görevler

| # | Görev |
|---|-------|
| L1 | Ayrı Python AI servisi (FastAPI) — yüksek talep durumunda |
| L2 | CLIP model ile görsel benzerlik (dolaptaki en çok benzeyen kıyafet) |
| L3 | Günlük otomatik kombin önerisi (scheduled job) |
| L4 | Trend analizi (sosyal feed'den popüler stiller) |

---

## Güvenlik Notları

- Anthropic API key **asla** frontend'e gönderilmez
- Rate limiting: AI analiz endpoint'ine `@RateLimiter(10 req/dakika/kullanıcı)`
- AI çıktısı her zaman backend'de validate edilir — frontend'den gelen ham AI çıktısı kabul edilmez
- ImageUrl doğrulaması: sadece MinIO bucket URL'leri kabul edilir (SSRF koruması)

---

## QA Kriterleri

- [ ] Kıyafet fotoğrafı → analyze endpoint → category/colors doğru tahmin etti
- [ ] Form auto-fill → kullanıcı düzenleyebiliyor
- [ ] Generate outfit → AI response → gerçek itemId'ler → Outfit kaydedildi
- [ ] AI rate limit → 10+ istek → 429 döndü
- [ ] İnvalid imageUrl → 400 döndü (SSRF koruması)
- [ ] API key environment variable'dan okunuyor, hardcoded değil
