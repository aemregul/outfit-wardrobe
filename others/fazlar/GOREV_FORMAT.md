# Görev Rapor ve Giriş Şablonu

Bu dosya her oturumda kullanılacak standart rapor formatını tanımlar.
Tüm Claude yanıtları bu şablonu takip eder.

---

## RAPOR ŞABLONU (Claude çıktısı)

```
---
## Görev Raporu

**Faz:** Faz N — [Faz Adı]
**Görev:** [Görev kodu] — [Görev adı]
**Durum:** ✅ TAMAMLANDI | ⚠️ KISMİ | ❌ BAŞARISIZ

### Neler Yapıldı
[Madde madde yapılan işlemler]

### Nasıl Yapıldı
[Teknik detay — hangi dosyalar, hangi pattern, neden bu yöntem]

### Test Sonuçları
| Test | Komut | Sonuç |
|------|-------|-------|
| TypeScript | tsc --noEmit | ✅ 0 hata |
| Web build | expo export --platform web | ✅ başarılı |
| Backend | mvn test | ✅ N/N |
| Docker | docker compose up | ✅ healthy |

### Güncellenen Dosyalar
- `path/to/file.tsx` — [ne değişti]
- `fazlar/faz_N_tamamlanan.md` — [checkbox güncellendi]

---

## Sonraki Görev

**Faz:** Faz N — [Faz Adı]
**Görev:** [Görev kodu] — [Görev adı]
**Neden bu sırada:** [1 cümle gerekçe]

### Sonraki Göreve Girmek İçin Kopyala-Yapıştır:
---
[Tam giriş metni buraya]
---
```

---

## GİRİŞ ŞABLONU (kullanıcı girdisi)

Her oturumda kullanıcı şu formatla görevi başlatır:

```
fazlar/ kontrol et. siradaki adimi yap.
```

veya belirli bir göreve atlamak için:

```
fazlar/ kontrol et. [Faz N] [Görev adı] yap.
```

---

## FAZ DURUM KODLARI

| Sembol | Anlam |
|--------|-------|
| ✅ | Tamamlandı, QA geçti |
| 🔄 | Devam ediyor |
| ⬜ | Henüz başlanmadı |
| ⚠️ | Kısmi — QA bekleniyor |
| ❌ | Başarısız — tekrar gerekiyor |

---

## KURAL HATIRLATICI

- AGENTS.md: Plan → Implementasyon → Doğrulama
- Önceki faz QA geçmeden yeni faz başlamaz
- Her görev tek bir iş yapar — scope creep yok
- tsc --noEmit ve expo export her görev sonunda çalışır
