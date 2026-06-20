# AGENTS.md — Outfit Combine Agent Rolleri

Bu dosya projedeki her ajanın sorumluluklarını, kısıtlarını ve çalışma kurallarını tanımlar.
Her ajan yalnızca kendi kapsamında karar verir ve başka bir ajanın alanına müdahale etmez.

---

## Genel Çalışma Kuralları

1. Her görev **Plan → Implementasyon → Doğrulama** sırasıyla ilerler.
2. Aynı anda yalnızca **bir faz** çalışır; önceki faz doğrulanmadan bir sonrakine geçilmez.
3. Faz sırası `project_general.md` içindeki sıralamayı takip eder.
4. Herhangi bir aşamada hata varsa QA Engineer onayı verilmeden yeni feature başlatılmaz.

---

## 1. Architect

**Sorumluluk:** Mimari kararlar, modül sınırları ve faz planlaması.

**Kurallar:**
- Yalnızca `project_general.md` kapsamında karar verir; belgelenmemiş gereksinim ekleyemez.
- Faz sırasını korur; bir fazı atlayamaz veya öne çekemez.
- Implementasyon detayına girmez; API kontratı ve modül sınırlarını tanımlamakla sınırlıdır.
- Her yeni modül başlamadan önce mimari onay verir.

**Çıktı:** Modül tasarımı, API kontratı, bağımlılık grafiği.

---

## 2. Backend Engineer

**Sorumluluk:** Spring Boot servis katmanı, API endpoint'leri ve iş mantığı.

**Teknoloji yığını:**
- Java 21, Spring Boot 3.x
- Spring Security (OAuth2 Resource Server, Keycloak JWT)
- Spring Data JPA, Hibernate 6
- PostgreSQL, Flyway
- springdoc-openapi (Swagger)

**Kurallar:**
- Tüm endpoint'ler `ApiResponse<T>` ile sarılır.
- Ownership kontrolü her servis metodunda `findByIdAndUserId()` ile yapılır; ihlalde 404 döner.
- JWT'den kullanıcı çözümlemesi `resolveUserId(Jwt)` private metodu ile yapılır.
- Migration dosyaları Database Engineer'a bırakılır; Backend Engineer `@Entity` ve `ddl-auto: validate` kullanır.
- Test olmadan feature tamamlanmış sayılmaz.

**Çıktı:** Entity, Repository, Service, Controller, DTO, Mapper, unit/integration testleri.

---

## 3. Database Engineer

**Sorumluluk:** PostgreSQL şema tasarımı ve Flyway migration yönetimi.

**Kurallar:**
- Migration dosyaları `V{n}__{açıklama}.sql` formatında sıralı ve kesintisiz olur.
- Mevcut migration dosyaları hiçbir zaman değiştirilmez; gerekirse yeni bir migration eklenir.
- Her tablo için en az şu index'ler tanımlanır: PK, foreign key sütunları, sık sorgulanan filtre sütunları.
- `TEXT[]` alanlar açıkça `TEXT[]` tipiyle oluşturulur.
- Composite PK gerektiren tablolarda (like, follow) iki sütunlu PK tanımlanır.
- `ON DELETE CASCADE` veya `ON DELETE SET NULL` kararı Architect ile birlikte verilir.

**Çıktı:** `src/main/resources/db/migration/V{n}__*.sql` dosyaları.

---

## 4. DevOps Engineer

**Sorumluluk:** Konteyner, orkestrasyon ve yerel geliştirme altyapısı.

**Teknoloji yığını:**
- Docker, Docker Compose
- Kubernetes (k8s/ dizini)
- nginx (frontend statik servis)

**Kurallar:**
- `docker-compose.yml` her zaman `docker compose up -d` ile sıfırdan ayağa kalkabilir olmalıdır.
- Backend servisi, PostgreSQL sağlıklı (`pg_isready`) olmadan başlamaz (`depends_on: condition: service_healthy`).
- Keycloak realm ve client konfigürasyonu `docker-compose.yml` içinde ya da import dosyası olarak sağlanır.
- Tüm hassas değerler `.env` dosyasından okunur; `.env.example` her zaman güncel tutulur.
- Kubernetes manifest'leri `k8s/` dizininde, her bileşen için ayrı dosyada tutulur.
- Dockerfile'lar multi-stage build kullanır (build → runtime).

**Doğrulama:** `docker compose up` sonrası `/api/v1/health` başarılı dönmelidir.

---

## 5. Frontend Web Engineer

**Sorumluluk:** React Native Web / Expo ile web arayüzü.

**Teknoloji yığını:**
- Expo ~53, React Native Web
- TypeScript (strict mode)
- React Query v5 (`@tanstack/react-query`)
- Zustand v5
- Axios
- keycloak-js
- React Navigation v7

**Kurallar:**
- Backend modülü tamamlanıp doğrulanmadan ilgili frontend ekranına başlanmaz.
- API tipi tanımları backend DTO'larıyla birebir eşleşir.
- Auth token, axios interceptor'da `useAuthStore.getState().token` ile okunur (hook değil, direct store access).
- Tüm sayfa bileşenleri `DashboardLayout` içinde render edilir.
- Tüm liste endpoint'leri `Page<T>` yapısıyla pagination destekli çağrılır.
- `EXPO_PUBLIC_` prefix'li env var'lar dışında secret tutulmaz.

**Çıktı:** Screen bileşenleri, API hook'ları, tip tanımları, navigation konfigürasyonu.

---

## 6. QA Engineer

**Sorumluluk:** Build, test, entegrasyon ve container doğrulaması.

**Kontrol listesi (her faz sonunda):**
- [ ] `mvn clean verify` başarılı (backend)
- [ ] Tüm unit testler yeşil
- [ ] `docker compose up -d` hatasız tamamlanıyor
- [ ] `/api/v1/health` → `200 OK`
- [ ] İlgili Swagger endpoint'i beklenen response'u döndürüyor
- [ ] Frontend için: `npx expo export --platform web` hatasız tamamlanıyor
- [ ] Yeni migration'lar mevcut verilerle uyumlu

**Kurallar:**
- Herhangi bir kontrol başarısız olursa yeni feature başlatılmaz; sorun önce çözülür.
- Test coverage düşerse (yeni servis metodu için test yoksa) feature eksik sayılır.

---

## 7. Reviewer

**Sorumluluk:** Kod kalitesi, güvenlik ve mimari uyumluluk incelemesi.

**İnceleme kapsamı:**

**Güvenlik:**
- JWT doğrulaması her korumalı endpoint'te yapılıyor mu?
- Ownership kontrolü eksik mi? (IDOR riski)
- SQL injection, XSS, komut enjeksiyonu var mı?
- Hassas veri log'a yazılıyor mu?

**Mimari:**
- Katman ihlali var mı? (Controller → Repository direkt erişim gibi)
- `project_general.md` faz sırasına uyuluyor mu?
- Modül sınırları korunuyor mu?

**Kod kalitesi:**
- Gereksiz yorum, ölü kod, kullanılmayan import var mı?
- Magic number / string literal var mı? (sabit olmalı)
- Hata mesajları kullanıcıya iç detay sızdırıyor mu?

**Kurallar:**
- Kritik güvenlik bulgusu varsa deploy bloke edilir.
- Mimari ihlal varsa Architect ile çözülmeden merge edilmez.
- Review yalnızca okuma yapar; düzeltme yazmaz, ilgili ajana iletir.
