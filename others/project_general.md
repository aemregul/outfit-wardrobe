# Project General - Outfit Combine

## 0. Doküman Amacı

Bu doküman, **Outfit Combine** isimli AI tabanlı kombin ve sosyal stil uygulamasının genel proje dokümanıdır.

Bu dosya Claude, Cursor, Windsurf, GitHub Copilot veya başka bir AI kod asistanına verilerek projeyi adım adım geliştirmek için kullanılabilir.

Amaç, uygulamayı tek seferde karmaşık hale getirmeden şu sırayla geliştirmektir:

1. Backend
2. Frontend Web
3. AI modülü
4. Frontend Mobile

İlk aşamada backend ve web uygulaması yapılacaktır. AI tarafı ileride gerekirse ayrı bir 4. proje/servis olarak ayrılacaktır. Mobile uygulama en son geliştirilecektir.

---

# 1. Proje Tanımı

Outfit Combine, kullanıcıların kıyafetlerini dijital dolaba ekleyebildiği, bu kıyafetlerden AI yardımıyla kombin oluşturabildiği, kombinleri kaydedebildiği, hangi kombini ne zaman ve nerede giydiğini takip edebildiği ve isterse sosyal medya kısmında paylaşabildiği bir uygulamadır.

Uygulama hem kişisel stil asistanı hem de sosyal medya platformu olarak çalışacaktır.

---

# 2. Ana Hedef

Kullanıcı şu sorulara cevap alabilmelidir:

- Bugün ne giysem?
- Bu pantolonla ne kombinleyebilirim?
- İş toplantısı için ne giymeliyim?
- Düğünde ne giyebilirim?
- Bu kombini daha önce nerede giymiştim?
- Bu kıyafeti en son ne zaman giymiştim?
- Dolabımda en az kullandığım parçalar hangileri?
- Başkaları bu kombini nasıl kullanıyor?
- Kombinimi sosyal medya gibi paylaşabilir miyim?

---

# 3. Repository Yapısı

Ana proje klasörü altında 3 ana repo/alt proje olacaktır.

```txt
outfit-combine/
├── project_general.md
├── docker-compose.yml
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── .env.example
├── README.md
├── k8s/
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secrets.example.yaml
│   ├── postgres/
│   │   ├── postgres-deployment.yaml
│   │   ├── postgres-service.yaml
│   │   └── postgres-pvc.yaml
│   ├── keycloak/
│   │   ├── keycloak-deployment.yaml
│   │   ├── keycloak-service.yaml
│   │   └── keycloak-ingress.yaml
│   ├── backend/
│   │   ├── backend-deployment.yaml
│   │   ├── backend-service.yaml
│   │   └── backend-ingress.yaml
│   ├── frontend-web/
│   │   ├── frontend-web-deployment.yaml
│   │   ├── frontend-web-service.yaml
│   │   └── frontend-web-ingress.yaml
│   └── monitoring/
│       ├── prometheus.yaml
│       └── grafana.yaml
├── outfit-combine_backend/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── pom.xml
│   ├── README.md
│   └── src/
├── outfit-combine_frontend_web/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── package.json
│   ├── README.md
│   └── src/
└── outfit-combine_frontend_mobile/
    ├── Dockerfile
    ├── docker-compose.yml
    ├── package.json
    ├── README.md
    └── src/
```

İleride AI ayrı servis olursa şu klasör eklenebilir:

```txt
outfit-combine_ai/
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── README.md
└── src/
```

---

# 4. Teknoloji Kararları

## 4.1 Backend

Backend teknolojisi:

```txt
Java 21
Spring Boot 3.x
Spring Security
Spring Data JPA
PostgreSQL
Flyway
Keycloak
OpenAPI / Swagger
Docker
```

Backend repo adı:

```txt
outfit-combine_backend
```

Backend ana görevleri:

- Kullanıcı profil yönetimi
- Kıyafet yönetimi
- Kombin yönetimi
- Giyilme geçmişi
- Sosyal medya postları
- Like / comment / follow işlemleri
- AI servislerine istek atma
- Dosya yükleme yönetimi
- Auth / role kontrolü
- API sunma

---

## 4.2 Frontend Web

Frontend web teknolojisi:

```txt
React Native for Web
Expo
TypeScript
React Navigation
React Query
Zustand veya Redux Toolkit
Axios
Tailwind benzeri NativeWind
```

Web repo adı:

```txt
outfit-combine_frontend_web
```

Not:

Web için React Native kullanılacaktır. React Native Web veya Expo Web ile çalışacaktır.

---

## 4.3 Frontend Mobile

Mobile teknolojisi:

```txt
React Native
Expo
TypeScript
React Navigation
React Query
Zustand veya Redux Toolkit
Axios
NativeWind
```

Mobile repo adı:

```txt
outfit-combine_frontend_mobile
```

Mobile ilk aşamada yapılmayacaktır. Backend ve web tamamlandıktan sonra başlanacaktır.

---

## 4.4 Database

Database:

```txt
PostgreSQL
```

Kullanım alanları:

- User profile
- Wardrobe items
- Outfits
- Wear logs
- Posts
- Comments
- Likes
- Follows
- Product links
- AI analysis results

---

## 4.5 Authentication

Auth sistemi open source olmalıdır.

Tercih edilen çözüm:

```txt
Keycloak
```

Keycloak kullanılma sebepleri:

- Open source
- OAuth2 / OpenID Connect desteği
- Role-based access control
- Social login desteği
- Admin paneli
- Enterprise seviyesinde güvenlik
- Spring Boot ile kolay entegrasyon

Alternatifler:

- Authentik
- Ory Kratos
- SuperTokens

Bu projede varsayılan auth sistemi Keycloak olacaktır.

---

## 4.6 File Storage

İlk aşamada lokal dosya sistemi kullanılabilir.

Production için öneriler:

```txt
MinIO
AWS S3
Google Cloud Storage
Azure Blob Storage
```

Open source uyumlu olması için ilk tercih:

```txt
MinIO
```

Dosya türleri:

- Kıyafet fotoğrafları
- Kombin fotoğrafları
- Kullanıcı profil fotoğrafları
- Post görselleri
- AI analiz görselleri

---

## 4.7 AI

İlk aşamada AI backend içinde servis katmanı olarak soyutlanacaktır.

İleride gerekirse ayrı servis açılacaktır:

```txt
outfit-combine_ai
```

AI görevleri:

- Kıyafet fotoğrafından kategori çıkarma
- Renk tahmini
- Stil tahmini
- Mevsim tahmini
- Kombin önerme
- Kombin açıklaması üretme
- Kullanıcı stilini öğrenme
- Kullanıcının geçmişine göre öneri yapma

İlk MVP’de AI kısmı basit/mock çalışabilir.

---

# 5. Uygulama Modülleri

## 5.1 Auth Modülü

Kullanıcılar Keycloak ile giriş yapacaktır.

Özellikler:

- Register
- Login
- Logout
- Token refresh
- Role kontrolü
- Kullanıcı profil eşleştirme
- Public/private profil ayarı

Roller:

```txt
USER
ADMIN
MODERATOR
```

---

## 5.2 User Profile Modülü

Kullanıcı profili uygulama içinde tutulacaktır.

Alanlar:

- id
- keycloakUserId
- username
- displayName
- email
- profileImageUrl
- bio
- gender optional
- stylePreferences
- bodyInfo optional
- isPrivate
- createdAt
- updatedAt

---

## 5.3 Wardrobe / Digital Closet Modülü

Kullanıcı tüm kıyafetlerini dijital dolaba ekler.

Kıyafet ekleme yöntemleri:

1. Fotoğraf çekerek
2. Galeriden yükleyerek
3. Mağaza linki koyarak
4. Manuel ekleyerek

Her kıyafet için bilgiler:

- Kıyafet adı
- Fotoğraf
- Kategori
- Alt kategori
- Renk
- Marka
- Beden
- Mevsim
- Stil
- Materyal
- Desen
- Temiz/kirli durumu
- Kullanım sayısı
- Son giyilme tarihi
- Satın alma linki
- Notlar

Kategoriler:

```txt
TOP
BOTTOM
OUTERWEAR
SHOES
BAG
ACCESSORY
JEWELRY
DRESS
SUIT
SPORTSWEAR
SPECIAL_OCCASION
UNDERWEAR
OTHER
```

Stil seçenekleri:

```txt
CASUAL
FORMAL
BUSINESS
SPORT
STREETWEAR
CHIC
MINIMAL
VINTAGE
ELEGANT
PARTY
TRAVEL
HOME
```

Mevsim seçenekleri:

```txt
SPRING
SUMMER
AUTUMN
WINTER
ALL_SEASON
```

---

## 5.4 AI Kıyafet Analizi

Kullanıcı kıyafet fotoğrafı yüklediğinde sistem şu bilgileri tahmin eder:

- category
- subCategory
- colors
- style
- season
- material
- pattern
- suitableOccasions
- confidenceScore

Kullanıcı AI sonucunu düzenleyebilir.

Örnek AI JSON çıktısı:

```json
{
  "category": "OUTERWEAR",
  "subCategory": "Blazer",
  "colors": ["Black"],
  "style": ["BUSINESS", "ELEGANT"],
  "season": ["SPRING", "AUTUMN", "WINTER"],
  "material": "Cotton blend",
  "pattern": "Plain",
  "suitableOccasions": ["Business meeting", "Dinner", "Office"],
  "confidenceScore": 0.91
}
```

---

## 5.5 Outfit / Kombin Modülü

AI veya kullanıcı tarafından kombin oluşturulabilir.

Kombin türleri:

- Manuel kombin
- AI generated kombin
- Günlük kombin
- Özel gün kombini
- Seyahat kombini
- İş kombini
- Sosyal paylaşım kombini

Kombin alanları:

- id
- userId
- name
- description
- clothingItems
- occasion
- season
- style
- aiGenerated
- aiReason
- aiScore
- isFavorite
- createdAt
- updatedAt

Kombin oluşturma kuralları:

- En az bir üst giyim olmalı
- En az bir alt giyim veya elbise olmalı
- Ayakkabı önerilmeli
- Hava soğuksa dış giyim önerilmeli
- Kirli kıyafet önerilmemeli
- Aynı parça çok sık önerilmemeli
- Etkinlik tipine göre stil uyumu olmalı
- Renk uyumu dikkate alınmalı

---

## 5.6 Wear Log / Giyilme Takibi

Kullanıcı bir kombini giyildi olarak işaretleyebilir.

Kayıt alanları:

- id
- userId
- outfitId
- wornAt
- location optional
- occasion
- note
- rating
- photoUrl
- wouldWearAgain
- createdAt

Bu özellik sayesinde kullanıcı:

- Bir kombini en son ne zaman giydiğini görür
- Nerede giydiğini görür
- Özel günlerde ne giydiğini kaydeder
- Aynı kombini kısa sürede tekrar giymekten kaçınabilir

---

## 5.7 Social Media Modülü

Uygulama sosyal medya gibi çalışacaktır.

Özellikler:

- Kombin paylaşma
- Üstümde böyle durdu fotoğrafı paylaşma
- Kombindeki ürün linklerini gösterme
- Like
- Comment
- Save
- Follow
- Profile
- Feed
- Explore
- Hashtag
- Trend kombinler

Post alanları:

- id
- userId
- outfitId
- imageUrl
- caption
- productLinks
- visibility
- likesCount
- commentsCount
- createdAt

Visibility:

```txt
PUBLIC
FOLLOWERS
PRIVATE
```

---

## 5.8 Product Link Modülü

Kullanıcı kıyafeti mağaza linki ile ekleyebilir.

İlk MVP’de link manuel kaydedilir.

İleride otomatik parse yapılabilir.

Tutulacak bilgiler:

- originalUrl
- storeName
- productName
- productImageUrl
- price
- currency
- brand
- detectedCategory
- lastCheckedAt

Desteklenebilecek mağazalar:

- Zara
- H&M
- Mango
- Trendyol
- Nike
- Adidas
- Pull&Bear
- Bershka
- Stradivarius

---

## 5.9 Weather Modülü

Kombin önerileri hava durumuna göre yapılabilir.

İlk aşamada opsiyoneldir.

Kullanılabilecek veri:

- temperature
- condition
- rain
- snow
- wind
- humidity

Örnek:

```txt
Bugün hava 12 derece ve yağmurlu. Kapalı ayakkabı ve dış giyim öner.
```

---

# 6. MVP Kapsamı

## 6.1 İlk MVP’de olacaklar

İlk MVP backend + web odaklı olacaktır.

Olacak özellikler:

- Keycloak auth kurulumu
- Kullanıcı profil oluşturma
- Kıyafet ekleme
- Kıyafet listeleme
- Kıyafet detay
- Kıyafet düzenleme
- Kıyafet silme
- Görsel yükleme
- Basit AI/mock analiz
- Manuel kombin oluşturma
- Basit AI/mock kombin önerisi
- Kombin kaydetme
- Kombini giyildi olarak işaretleme
- Giyilme geçmişi
- Basit sosyal post oluşturma
- Feed listeleme
- Like
- Comment

---

## 6.2 İlk MVP’de olmayacaklar

- Gelişmiş AI modeli
- Gerçek otomatik ürün link parse
- Gelişmiş sosyal medya algoritması
- Takvim entegrasyonu
- Push notification
- Mobile app
- Influencer marketplace
- Reklam sistemi
- Ödeme sistemi
- Premium abonelik

---

# 7. Backend Detaylı Yapı

## 7.1 Backend Paket Yapısı

```txt
outfit-combine_backend/
└── src/
    └── main/
        ├── java/
        │   └── com/outfitcombine/backend/
        │       ├── OutfitCombineBackendApplication.java
        │       ├── config/
        │       │   ├── SecurityConfig.java
        │       │   ├── OpenApiConfig.java
        │       │   ├── CorsConfig.java
        │       │   └── StorageConfig.java
        │       ├── common/
        │       │   ├── exception/
        │       │   ├── response/
        │       │   └── util/
        │       ├── user/
        │       │   ├── UserProfile.java
        │       │   ├── UserProfileController.java
        │       │   ├── UserProfileService.java
        │       │   ├── UserProfileRepository.java
        │       │   └── dto/
        │       ├── wardrobe/
        │       │   ├── ClothingItem.java
        │       │   ├── ClothingItemController.java
        │       │   ├── ClothingItemService.java
        │       │   ├── ClothingItemRepository.java
        │       │   └── dto/
        │       ├── outfit/
        │       │   ├── Outfit.java
        │       │   ├── OutfitController.java
        │       │   ├── OutfitService.java
        │       │   ├── OutfitRepository.java
        │       │   └── dto/
        │       ├── wearlog/
        │       │   ├── WearLog.java
        │       │   ├── WearLogController.java
        │       │   ├── WearLogService.java
        │       │   ├── WearLogRepository.java
        │       │   └── dto/
        │       ├── social/
        │       │   ├── post/
        │       │   ├── comment/
        │       │   ├── like/
        │       │   └── follow/
        │       ├── ai/
        │       │   ├── AiController.java
        │       │   ├── AiService.java
        │       │   ├── MockAiService.java
        │       │   └── dto/
        │       └── storage/
        │           ├── StorageService.java
        │           ├── LocalStorageService.java
        │           └── MinioStorageService.java
        └── resources/
            ├── application.yml
            ├── application-dev.yml
            ├── application-prod.yml
            └── db/migration/
```

---

## 7.2 Backend API Endpoints

### Auth / Me

```http
GET /api/v1/me
PUT /api/v1/me
```

### Clothing

```http
POST /api/v1/clothing
GET /api/v1/clothing
GET /api/v1/clothing/{id}
PUT /api/v1/clothing/{id}
DELETE /api/v1/clothing/{id}
POST /api/v1/clothing/{id}/mark-clean
POST /api/v1/clothing/{id}/mark-dirty
POST /api/v1/clothing/upload
POST /api/v1/clothing/analyze
```

### Outfit

```http
POST /api/v1/outfits
GET /api/v1/outfits
GET /api/v1/outfits/{id}
PUT /api/v1/outfits/{id}
DELETE /api/v1/outfits/{id}
POST /api/v1/outfits/generate
POST /api/v1/outfits/{id}/favorite
DELETE /api/v1/outfits/{id}/favorite
```

### Wear Log

```http
POST /api/v1/outfits/{id}/wear
GET /api/v1/wear-logs
GET /api/v1/wear-logs/{id}
DELETE /api/v1/wear-logs/{id}
```

### Social

```http
POST /api/v1/posts
GET /api/v1/feed
GET /api/v1/posts/{id}
DELETE /api/v1/posts/{id}
POST /api/v1/posts/{id}/like
DELETE /api/v1/posts/{id}/like
POST /api/v1/posts/{id}/comments
GET /api/v1/posts/{id}/comments
DELETE /api/v1/comments/{id}
POST /api/v1/users/{id}/follow
DELETE /api/v1/users/{id}/follow
```

### AI

```http
POST /api/v1/ai/analyze-clothing
POST /api/v1/ai/generate-outfit
POST /api/v1/ai/rate-outfit
```

---

# 8. Database Tasarımı

## 8.1 User Profile

```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY,
    keycloak_user_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    profile_image_url TEXT,
    bio TEXT,
    gender VARCHAR(50),
    style_preferences TEXT[],
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

---

## 8.2 Clothing Items

```sql
CREATE TABLE clothing_items (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_profiles(id),
    name VARCHAR(255) NOT NULL,
    image_url TEXT,
    category VARCHAR(100) NOT NULL,
    sub_category VARCHAR(100),
    colors TEXT[],
    brand VARCHAR(255),
    size VARCHAR(50),
    seasons TEXT[],
    styles TEXT[],
    material VARCHAR(255),
    pattern VARCHAR(255),
    product_url TEXT,
    is_clean BOOLEAN DEFAULT TRUE,
    wear_count INTEGER DEFAULT 0,
    last_worn_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

---

## 8.3 Outfits

```sql
CREATE TABLE outfits (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_profiles(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    occasion TEXT[],
    seasons TEXT[],
    styles TEXT[],
    ai_generated BOOLEAN DEFAULT FALSE,
    ai_reason TEXT,
    ai_score NUMERIC(4,2),
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

---

## 8.4 Outfit Items

```sql
CREATE TABLE outfit_items (
    outfit_id UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
    clothing_item_id UUID NOT NULL REFERENCES clothing_items(id),
    PRIMARY KEY (outfit_id, clothing_item_id)
);
```

---

## 8.5 Wear Logs

```sql
CREATE TABLE wear_logs (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_profiles(id),
    outfit_id UUID NOT NULL REFERENCES outfits(id),
    worn_at TIMESTAMP NOT NULL,
    location VARCHAR(255),
    occasion VARCHAR(255),
    rating INTEGER,
    photo_url TEXT,
    note TEXT,
    would_wear_again BOOLEAN,
    created_at TIMESTAMP NOT NULL
);
```

---

## 8.6 Posts

```sql
CREATE TABLE posts (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_profiles(id),
    outfit_id UUID REFERENCES outfits(id),
    image_url TEXT NOT NULL,
    caption TEXT,
    product_links TEXT[],
    visibility VARCHAR(50) DEFAULT 'PUBLIC',
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

---

## 8.7 Comments

```sql
CREATE TABLE comments (
    id UUID PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

---

## 8.8 Likes

```sql
CREATE TABLE post_likes (
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id),
    created_at TIMESTAMP NOT NULL,
    PRIMARY KEY (post_id, user_id)
);
```

---

## 8.9 Follows

```sql
CREATE TABLE follows (
    follower_id UUID NOT NULL REFERENCES user_profiles(id),
    following_id UUID NOT NULL REFERENCES user_profiles(id),
    created_at TIMESTAMP NOT NULL,
    PRIMARY KEY (follower_id, following_id)
);
```

---

# 9. Frontend Web Yapısı

## 9.1 Web Klasör Yapısı

```txt
outfit-combine_frontend_web/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── navigation/
│   │   └── providers/
│   ├── features/
│   │   ├── auth/
│   │   ├── wardrobe/
│   │   ├── outfits/
│   │   ├── wearlogs/
│   │   ├── social/
│   │   ├── profile/
│   │   └── settings/
│   ├── shared/
│   │   ├── api/
│   │   ├── components/
│   │   ├── constants/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── utils/
│   └── assets/
├── package.json
├── app.json
├── Dockerfile
└── docker-compose.yml
```

---

## 9.2 Web Ekranları

Auth:

- Login
- Register
- Forgot password

Ana:

- Dashboard
- Wardrobe
- Add Clothing
- Clothing Detail
- Outfits
- Generate Outfit
- Outfit Detail
- Wear History
- Feed
- Create Post
- Profile
- Settings

---

# 10. Frontend Mobile Yapısı

Mobile web ile benzer feature yapısına sahip olacaktır.

Mobile en son yapılacaktır.

Mobile öncelikleri:

- Kamera ile kıyafet ekleme
- Galeriden fotoğraf seçme
- Günlük kombin bildirimi
- Dolap yönetimi
- Kombin kaydetme
- Sosyal feed
- Profil

---

# 11. Docker Compose - Root

Ana dizinde tüm servisleri kaldırmak için compose dosyası olmalıdır.

```yaml
version: "3.9"

services:
  postgres:
    image: postgres:16
    container_name: outfit_postgres
    environment:
      POSTGRES_DB: outfit_combine
      POSTGRES_USER: outfit_user
      POSTGRES_PASSWORD: outfit_password
    ports:
      - "5432:5432"
    volumes:
      - outfit_postgres_data:/var/lib/postgresql/data

  keycloak:
    image: quay.io/keycloak/keycloak:25.0
    container_name: outfit_keycloak
    command: start-dev
    environment:
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/outfit_combine
      KC_DB_USERNAME: outfit_user
      KC_DB_PASSWORD: outfit_password
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
    ports:
      - "8081:8080"
    depends_on:
      - postgres

  minio:
    image: minio/minio
    container_name: outfit_minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minio
      MINIO_ROOT_PASSWORD: minio_password
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - outfit_minio_data:/data

  backend:
    build:
      context: ./outfit-combine_backend
    container_name: outfit_backend
    environment:
      SPRING_PROFILES_ACTIVE: dev
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: outfit_combine
      DB_USER: outfit_user
      DB_PASSWORD: outfit_password
      KEYCLOAK_ISSUER_URI: http://keycloak:8080/realms/outfit-combine
      MINIO_ENDPOINT: http://minio:9000
    ports:
      - "8080:8080"
    depends_on:
      - postgres
      - keycloak
      - minio

  frontend_web:
    build:
      context: ./outfit-combine_frontend_web
    container_name: outfit_frontend_web
    environment:
      API_BASE_URL: http://localhost:8080/api/v1
      KEYCLOAK_URL: http://localhost:8081
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  outfit_postgres_data:
  outfit_minio_data:
```

---

# 12. Backend Dockerfile

```dockerfile
FROM maven:3.9.8-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

# 13. Frontend Web Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "web"]
```

---

# 14. Frontend Mobile Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 19000
EXPOSE 19001
EXPOSE 19002
CMD ["npm", "start"]
```

---

# 15. Kubernetes Yapısı

Ana dizinde k8s klasörü olacaktır.

## 15.1 Namespace

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: outfit-combine
```

---

## 15.2 Backend Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: outfit-backend
  namespace: outfit-combine
spec:
  replicas: 2
  selector:
    matchLabels:
      app: outfit-backend
  template:
    metadata:
      labels:
        app: outfit-backend
    spec:
      containers:
        - name: outfit-backend
          image: outfit-combine-backend:latest
          ports:
            - containerPort: 8080
          env:
            - name: SPRING_PROFILES_ACTIVE
              value: prod
```

---

## 15.3 Backend Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: outfit-backend-service
  namespace: outfit-combine
spec:
  selector:
    app: outfit-backend
  ports:
    - port: 8080
      targetPort: 8080
```

---

## 15.4 Frontend Web Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: outfit-frontend-web
  namespace: outfit-combine
spec:
  replicas: 2
  selector:
    matchLabels:
      app: outfit-frontend-web
  template:
    metadata:
      labels:
        app: outfit-frontend-web
    spec:
      containers:
        - name: outfit-frontend-web
          image: outfit-combine-frontend-web:latest
          ports:
            - containerPort: 3000
```

---

## 15.5 PostgreSQL Deployment

Production için managed PostgreSQL önerilir. Local Kubernetes için StatefulSet kullanılabilir.

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: outfit-postgres
  namespace: outfit-combine
spec:
  serviceName: outfit-postgres
  replicas: 1
  selector:
    matchLabels:
      app: outfit-postgres
  template:
    metadata:
      labels:
        app: outfit-postgres
    spec:
      containers:
        - name: postgres
          image: postgres:16
          ports:
            - containerPort: 5432
          env:
            - name: POSTGRES_DB
              value: outfit_combine
            - name: POSTGRES_USER
              valueFrom:
                secretKeyRef:
                  name: outfit-secrets
                  key: postgres-user
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: outfit-secrets
                  key: postgres-password
```

---

# 16. AI Promptları

## 16.1 Kıyafet Analiz Promptu

```txt
You are a fashion analysis assistant.

Analyze the clothing item in the provided image.

Return only valid JSON.

Fields:
- category
- subCategory
- colors
- style
- season
- material
- pattern
- suitableOccasions
- confidenceScore

Do not include markdown.
```

---

## 16.2 Kombin Oluşturma Promptu

```txt
You are an AI fashion stylist.

Create an outfit using only the clothing items provided by the user.

Rules:
- Use clean items only.
- Match colors.
- Match season.
- Match occasion.
- Avoid items worn too recently.
- Explain why this outfit works.

Return only valid JSON.

Expected format:
{
  "outfitName": "",
  "itemIds": [],
  "reason": "",
  "occasion": [],
  "style": [],
  "season": [],
  "confidenceScore": 0
}
```

---

# 17. Claude İçin Geliştirme Talimatı

Bu projeyi adım adım geliştir.

Önce backend ve web yapılacak.

Mobile daha sonra yapılacak.

AI ayrı servis olarak ilk aşamada yapılmayacak. Backend içinde mock veya basit servis olarak başlayacak.

## 17.1 Öncelikli Sıra

1. Root repo yapısını oluştur.
2. Backend Spring Boot projesini oluştur.
3. PostgreSQL bağlantısını yap.
4. Flyway migration dosyalarını oluştur.
5. Keycloak entegrasyonunu yap.
6. User profile modülünü yap.
7. Wardrobe modülünü yap.
8. Outfit modülünü yap.
9. Wear log modülünü yap.
10. Social post modülünü yap.
11. Backend Dockerfile yaz.
12. Root docker-compose.yml ile backend, postgres, keycloak, minio çalıştır.
13. Web React Native projesini oluştur.
14. Web auth bağlantısını yap.
15. Web wardrobe ekranlarını yap.
16. Web outfit ekranlarını yap.
17. Web social feed ekranını yap.
18. Kubernetes dosyalarını oluştur.
19. AI entegrasyonu için ayrı servis ihtiyacı değerlendirilir.
20. Mobile app geliştirilir.

---

# 18. Claude’dan Beklenen Çalışma Şekli

Claude şunları yapmalıdır:

1. Tek seferde tüm projeyi yazmaya çalışma.
2. Her adımı küçük parçalara böl.
3. Önce dosya yapısını oluştur.
4. Sonra backend kodlarını yaz.
5. Sonra migration dosyalarını yaz.
6. Sonra API endpointlerini yaz.
7. Sonra Docker dosyalarını yaz.
8. Sonra web uygulamasını yaz.
9. Her adım sonunda ne yapıldığını özetle.
10. Eksik kalan yerleri açıkça belirt.

---

# 19. İlk Claude Komutu

Aşağıdaki komut Claude’a verilebilir:

```txt
Bu project_general.md dosyasına göre Outfit Combine projesini geliştir.

Önce sadece şu işleri yap:

1. Root klasör yapısını oluştur.
2. outfit-combine_backend Spring Boot projesini oluştur.
3. PostgreSQL, Flyway, Spring Security Resource Server ve Keycloak entegrasyonunu hazırla.
4. İlk entity olarak UserProfile entity, repository, service ve controller yaz.
5. Dockerfile ve root docker-compose.yml dosyasını oluştur.
6. Çalıştırma talimatlarını ver.

Henüz frontend, AI ve mobile kodlarına başlama.
```

---

# 20. Backend Başlangıç Bağımlılıkları

Spring Boot için önerilen bağımlılıklar:

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>

    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>

    <dependency>
        <groupId>org.flywaydb</groupId>
        <artifactId>flyway-core</artifactId>
    </dependency>

    <dependency>
        <groupId>org.flywaydb</groupId>
        <artifactId>flyway-database-postgresql</artifactId>
    </dependency>

    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
        <version>2.6.0</version>
    </dependency>

    <dependency>
        <groupId>io.minio</groupId>
        <artifactId>minio</artifactId>
        <version>8.5.12</version>
    </dependency>
</dependencies>
```

---

# 21. Backend application.yml Örneği

```yaml
server:
  port: 8080

spring:
  application:
    name: outfit-combine-backend

  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:outfit_combine}
    username: ${DB_USER:outfit_user}
    password: ${DB_PASSWORD:outfit_password}

  jpa:
    hibernate:
      ddl-auto: validate
    open-in-view: false

  flyway:
    enabled: true
    locations: classpath:db/migration

  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: ${KEYCLOAK_ISSUER_URI:http://localhost:8081/realms/outfit-combine}

springdoc:
  swagger-ui:
    path: /swagger-ui.html

app:
  storage:
    type: ${STORAGE_TYPE:local}
    local-path: ${LOCAL_STORAGE_PATH:uploads}
```

---

# 22. Frontend Web Başlangıç Komutu

Web için Expo + React Native Web kullanılabilir.

```bash
npx create-expo-app outfit-combine_frontend_web --template
cd outfit-combine_frontend_web
npm install axios @tanstack/react-query zustand nativewind
npm install react-native-web react-dom
npm run web
```

---

# 23. Mobile Başlangıç Komutu

Mobile daha sonra yapılacaktır.

```bash
npx create-expo-app outfit-combine_frontend_mobile --template
cd outfit-combine_frontend_mobile
npm install axios @tanstack/react-query zustand nativewind
npm start
```

---

# 24. Geliştirme Fazları

## Faz 1 - Backend Core

- Spring Boot proje
- PostgreSQL
- Flyway
- Keycloak
- UserProfile
- Wardrobe
- Outfit
- WearLog

## Faz 2 - Web MVP

- Auth
- Dashboard
- Wardrobe
- Outfit
- Wear history
- Basic social feed

## Faz 3 - Social Features

- Follow
- Like
- Comment
- Explore
- Profile pages

## Faz 4 - AI Service

- AI için ayrı repo açılması değerlendirilir
- Vision analysis
- Outfit recommendation
- User preference learning

## Faz 5 - Mobile

- React Native mobile
- Camera upload
- Push notification
- Daily outfit recommendation

## Faz 6 - Production

- Kubernetes
- CI/CD
- Monitoring
- Logging
- Backup
- Security hardening

---

# 25. Notlar

Bu proje büyük kapsamlıdır. Başarı için MVP küçük tutulmalıdır.

İlk hedef:

```txt
Kullanıcı giriş yapar.
Kıyafet ekler.
Kombin oluşturur.
Kombini kaydeder.
Giyildi olarak işaretler.
Basit şekilde paylaşır.
```

Bundan sonra AI ve sosyal medya tarafı güçlendirilmelidir.
