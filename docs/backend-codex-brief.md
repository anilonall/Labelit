# Labelit Backend Brief

Bu dokuman, mevcut frontend'i inceleyerek backend tarafinda nelerin yapilmasi gerektigini netlestirmek icin hazirlandi.
Amac: backend gelistiren kisi veya Codex bu belgeyi okuyup API, entity, auth ve saklama yapisini hizli kurabilsin.

## 1. Mevcut Frontend'de Su Ana Kadar Neler Var

Frontend tarafinda aktif olarak bulunan davranislar:

- Uygulama acilisinda login ekrani gosteriliyor.
- Email ile giris formu var.
- Google ve GitHub butonlari var ama su an sadece UI hazir, gercek OAuth baglantisi yok.
- Frontend su an auth icin sadece local mock kullaniyor.
- Hazir etiket sablonlari var:
  - `shipping`
  - `cargo`
  - `receiving`
  - `return`
  - `transfer`
  - `pallet`
- Kullanici bos etiketle baslayabiliyor.
- Kullanici etiket stil ayarlarini degistirebiliyor:
  - renkler
  - font
  - kenarlik
  - boyutlar
  - gorunurluk alanlari
  - layout pozisyonlari
- Etiket icerik alanlari duzenlenebiliyor:
  - gonderen
  - alici
  - siparis no
  - referans
  - agirlik
  - mesafe
  - teslimat zamani
  - teslimat tipi
  - barkod
  - not
  - ozel alanlar
- Ozel alanlar hem manuel hem de hesaplanan kaynaklardan gelebiliyor.
- Kullanici sablonu local library'ye kaydedebiliyor.
- Kullanici JSON olarak sablon export/import yapabiliyor.
- PDF export var.
- ZPL output uretiliyor.
- Canli preview var.
- Dil destegi var: `tr`, `en`
- Tema destegi var.

## 2. Frontend'de Simdiye Kadar Gercekten Backend Gerektiren Alanlar

Su anda backend'e tasinmasi gereken ana konular:

- Gercek kullanici auth
- Kullanici oturumu / token yonetimi
- Yetki kontrolu
- Kaydedilen sablonlarin veritabaninda tutulmasi
- JSON import/export icin kalici saklama veya dosya kayit akisi
- Logo dosyasi yukleme ve saklama
- Istege bagli olarak PDF/ZPL server-side uretimi
- Audit log / kim neyi ne zaman kaydetti takibi
- Organizasyon / takim bazli erisim kontrolu

## 3. Backend Icin Onerilen Entity'ler

Minimum gerekli entity seti:

### 3.1 `users`

Amac: kullanici hesabini tutmak.

Onerilen alanlar:

- `id`
- `email` unique
- `name`
- `avatar_url` nullable
- `status` enum
  - `active`
  - `invited`
  - `disabled`
- `last_login_at`
- `created_at`
- `updated_at`

### 3.2 `organizations`

Amac: ileride tek kullanicidan cikip ekip yapisina gecmek.

Alanlar:

- `id`
- `name`
- `slug`
- `created_at`
- `updated_at`

### 3.3 `organization_members`

Amac: kullanicinin hangi organizasyonda hangi role sahip oldugunu tutmak.

Alanlar:

- `id`
- `organization_id`
- `user_id`
- `role` enum
  - `owner`
  - `admin`
  - `editor`
  - `viewer`
- `created_at`

### 3.4 `auth_accounts`

Amac: OAuth provider baglantilarini tutmak.

Alanlar:

- `id`
- `user_id`
- `provider` enum
  - `google`
  - `github`
- `provider_user_id`
- `access_token_encrypted` nullable
- `refresh_token_encrypted` nullable
- `token_expires_at` nullable
- `created_at`
- `updated_at`

Not: Eger sadece JWT + tek provider yeterliyse bu tablo ilk fazda opsiyonel olabilir. Ama OAuth dusunuluyorsa tavsiye edilir.

### 3.5 `sessions`

Amac: aktif oturumlari ve refresh token mantigini tutmak.

Alanlar:

- `id`
- `user_id`
- `refresh_token_hash`
- `user_agent`
- `ip_address`
- `expires_at`
- `revoked_at` nullable
- `created_at`

### 3.6 `template_presets`

Amac: sistemin verdigi built-in sablonlari backend tarafindan sunmak.

Alanlar:

- `id`
- `key` unique
- `name`
- `description`
- `is_system` boolean
- `definition_json`
- `created_at`
- `updated_at`

Not: Frontend'deki built-in sablonlar backend'e alinacaksa bu tablo kullanilir. Ilk fazda kod icinde de kalabilir.

### 3.7 `label_templates`

Amac: kullanicinin kaydettigi ozel sablonlari tutmak.

Alanlar:

- `id`
- `organization_id` nullable
- `user_id`
- `name`
- `slug`
- `description` nullable
- `source_template_key` nullable
- `definition_json`
- `is_archived` boolean
- `created_at`
- `updated_at`

Bu tablonun en kritik alani:

- `definition_json`
  - frontend'deki gorunum ve stil konfigurasyonunun tamami burada saklanir

### 3.8 `label_template_contents`

Amac: kullanicinin sablon stili ile etiket icerigini ayri saklayabilmesi.

Alanlar:

- `id`
- `template_id`
- `name`
- `content_json`
- `created_at`
- `updated_at`

Not: Bu tablo opsiyonel. Eger "sadece stil kaydet" yeterliyse olmayabilir. Ama frontend su an `template` ve `content` bloklarini ayiriyor, o nedenle uzun vadede faydali.

### 3.9 `assets`

Amac: yuklenen logo dosyalarini saklamak.

Alanlar:

- `id`
- `user_id`
- `organization_id` nullable
- `storage_key`
- `original_name`
- `mime_type`
- `size_bytes`
- `width` nullable
- `height` nullable
- `created_at`

### 3.10 `exports`

Amac: PDF/ZPL export gecmisi ve async job takibi.

Alanlar:

- `id`
- `user_id`
- `template_id` nullable
- `type` enum
  - `pdf`
  - `zpl`
  - `json`
- `status` enum
  - `queued`
  - `processing`
  - `completed`
  - `failed`
- `request_json`
- `result_url` nullable
- `error_message` nullable
- `created_at`
- `completed_at` nullable

### 3.11 `audit_logs`

Amac: kritik islemleri izlemek.

Alanlar:

- `id`
- `user_id`
- `organization_id` nullable
- `action`
- `entity_type`
- `entity_id`
- `metadata_json`
- `created_at`

## 4. Frontend Veri Modelinden Cikan Ana JSON Yapilari

Backend'in anlayacagi iki ana veri grubu var:

### 4.1 Template Definition

Bu kisim gorunum ve layout ayarlarini temsil eder.

Icerdigi alanlar:

- `name`
- `description`
- `brandName`
- `labelTitle`
- `accentColor`
- `backgroundColor`
- `textColor`
- `borderColor`
- `borderWidth`
- `fontFamily`
- `brandFontSize`
- `titleFontSize`
- `headingFontSize`
- `bodyFontSize`
- `density`
- `showQr`
- `showNote`
- `highlightRecipient`
- `showSender`
- `showSenderAddress`
- `showRecipient`
- `showRecipientAddress`
- `showOrderNo`
- `showReference`
- `showWeight`
- `showDistance`
- `showDeliveryTime`
- `showDeliveryType`
- `showBarcode`
- `showBarcodeValue`
- `showRulers`
- `showCenterGuides`
- `showGridOverlay`
- `gridStepMm`
- `uiLanguage`
- `printMode`
- `sheetLayout`
- `sizeCategory`
- `sizePreset`
- `labelWidthMm`
- `labelHeightMm`
- `pageMarginTop`
- `pageMarginSide`
- `sheetGap`
- `layoutItems`
- `logoDataUrl` veya bunun yerine `logoAssetId`
- `customFields`

Backend notu:

- `logoDataUrl` dogrudan DB'de tutmak yerine dosya olarak `assets` tablosuna alman daha dogru olur.
- DB'ye `logoAssetId` yazmak daha saglikli.

### 4.2 Label Content

Bu kisim etiketin is verisini temsil eder.

Alanlar:

- `senderName`
- `senderAddress`
- `recipientName`
- `recipientAddress`
- `orderNo`
- `reference`
- `weightValue`
- `weightUnit`
- `distanceValue`
- `distanceUnit`
- `deliveryTime`
- `deliveryType`
- `deliveryWindow`
- `barcodeText`
- `note`
- `customFields`

## 5. Custom Field Yapisi

Frontend'e gore bir custom field su sekilde:

- `id`
- `label`
- `value`
- `visible`
- `sourceType`

Su an desteklenen `sourceType` degerleri:

- `manual`
- `currentDate`
- `currentTime`
- `currentDateTime`
- `barcode`
- `orderNo`
- `reference`
- `senderName`
- `recipientName`
- `weight`
- `distance`
- `deliveryTime`
- `deliveryType`

Backend karari:

- Eger export server-side yapilacaksa backend de bu sourceType mantigini birebir bilmeli.
- Eger export tamamen frontend'de kalacaksa backend sadece ham field bilgisini saklayabilir.

## 6. Auth Tarafinda Ne Yapilmali

Frontend'de su an:

- localStorage tabanli sahte session var
- izinli email listesi frontend kodunda
- OAuth butonlari gercek degil

Backend'de minimum yapilmasi gerekenler:

### Faz 1

- `POST /auth/login` email magic link veya passwordless login
- `POST /auth/logout`
- `POST /auth/refresh`
- `GET /auth/me`
- allowlist veya organization membership kontrolu

### Faz 2

- `GET /auth/google/start`
- `GET /auth/google/callback`
- `GET /auth/github/start`
- `GET /auth/github/callback`

### Faz 3

- invite sistemi
- role-based authorization
- multi-organization support

## 7. Onerilen Auth Akisi

En pratik kurulum:

1. Kullanici email girer.
2. Backend email'in izinli olup olmadigini kontrol eder.
3. Izinliyse magic link veya OTP uretir.
4. Kullanici dogrulaninca access token + refresh token verilir.
5. Frontend `GET /auth/me` ile kullaniciyi ceker.
6. Tum template endpoint'leri authenticated olur.

Alternatif:

- Direkt Google OAuth + GitHub OAuth
- Sadece kurumsal domain'e izin verme

## 8. Onerilen API Taslagi

### Auth

- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh`
- `GET /auth/me`
- `GET /auth/google/start`
- `GET /auth/google/callback`
- `GET /auth/github/start`
- `GET /auth/github/callback`

### Users

- `GET /users/me`
- `PATCH /users/me`

### Templates

- `GET /templates`
- `GET /templates/:id`
- `POST /templates`
- `PATCH /templates/:id`
- `DELETE /templates/:id`
- `POST /templates/:id/duplicate`
- `POST /templates/import`
- `GET /templates/:id/export`

### System Presets

- `GET /template-presets`
- `GET /template-presets/:key`

### Assets

- `POST /assets/logo`
- `GET /assets/:id`
- `DELETE /assets/:id`

### Exports

- `POST /exports/pdf`
- `POST /exports/zpl`
- `POST /exports/json`
- `GET /exports/:id`

### Membership / Admin

- `GET /organization-members`
- `POST /organization-members/invite`
- `PATCH /organization-members/:id`
- `DELETE /organization-members/:id`

## 9. Endpoint Payload Onerileri

### `POST /templates`

Request:

```json
{
  "name": "Trendyol XL Etiketi",
  "description": "Pazar yeri sevkiyat etiketi",
  "sourceTemplateKey": "shipping",
  "definition": {},
  "content": {}
}
```

Response:

```json
{
  "id": "tpl_123",
  "name": "Trendyol XL Etiketi",
  "description": "Pazar yeri sevkiyat etiketi",
  "sourceTemplateKey": "shipping",
  "definition": {},
  "content": {},
  "createdAt": "2026-06-22T10:00:00.000Z",
  "updatedAt": "2026-06-22T10:00:00.000Z"
}
```

### `GET /auth/me`

Response:

```json
{
  "id": "usr_123",
  "email": "user@company.com",
  "name": "User Name",
  "organizations": [
    {
      "id": "org_1",
      "name": "My Company",
      "role": "editor"
    }
  ]
}
```

## 10. Backend Validation Kurallari

Backend'de mutlaka validate edilmesi gerekenler:

- email format
- template ownership
- organization access
- renk alanlari hex formatinda mi
- boyut alanlari numeric mi
- `labelWidthMm`, `labelHeightMm`, `pageMarginTop`, `pageMarginSide`, `sheetGap` mantikli aralikta mi
- `printMode` yalnizca izinli enum degerlerinden biri mi
- `uiLanguage` yalnizca desteklenen dillerden biri mi
- `customFields[].sourceType` tanimli enum mu
- buyuk `logoDataUrl` payload'lari reject edilmeli

## 11. Backend Tarafinda Hangi Isler Frontend'den Tasinabilir

Opsiyonel ama faydali alanlar:

- PDF uretimini backend'e almak
- ZPL uretimini backend'e almak
- logo optimizasyonu ve thumbnail uretimi
- sablon versiyonlama
- paylasilabilir template linkleri
- template favorileme
- son kullanilan template listesi

## 12. Onceliklendirme

### MVP

- gercek auth
- `GET /auth/me`
- template CRUD
- logo upload
- template import/export
- DB persistence

### Ikinci Faz

- OAuth
- organization ve roller
- server-side export history
- audit logs

### Ucuncu Faz

- versioning
- collaboration
- shared templates
- queue tabanli agir export islemleri

## 13. Backend Stack Icin Kisa Oneri

Iyi bir hizli kurulum:

- Node.js
- NestJS veya Express/Fastify
- PostgreSQL
- Prisma
- Redis opsiyonel
- S3 uyumlu obje saklama
- JWT access + refresh token

## 14. Codex'e Verilecek Net Gorev Metni

Asagidaki metni backend Codex'e dogrudan verebilirsin:

```text
Bu projede React tabanli bir label editor frontend'i var. Backend tarafinda gercek auth, kullanici session yonetimi, kaydedilen label template'leri, logo upload ve template import/export altyapisini kur.

Gereksinimler:
- PostgreSQL + Prisma kullan
- users, organizations, organization_members, auth_accounts, sessions, label_templates, assets, exports, audit_logs tablolarini tasarla
- JWT access token + refresh token auth akisini kur
- /auth/me, /auth/login, /auth/logout, /auth/refresh endpointlerini yaz
- Google ve GitHub OAuth icin genisletilebilir altyapi hazirla
- Template CRUD endpointlerini yaz
- Template definition ve content alanlarini JSON olarak sakla
- Logo upload endpointi ekle
- Ownership ve authorization middleware ekle
- Input validation ekle
- OpenAPI/Swagger dokumani uret
- Temel unit/integration test iskeleti kur

Template JSON yapisi frontend ile uyumlu olmali. Mevcut frontend alanlari:
brandName, labelTitle, accentColor, backgroundColor, textColor, borderColor, borderWidth, fontFamily, brandFontSize, titleFontSize, headingFontSize, bodyFontSize, density, showQr, showNote, highlightRecipient, showSender, showSenderAddress, showRecipient, showRecipientAddress, showOrderNo, showReference, showWeight, showDistance, showDeliveryTime, showDeliveryType, showBarcode, showBarcodeValue, showRulers, showCenterGuides, showGridOverlay, gridStepMm, uiLanguage, printMode, sheetLayout, sizeCategory, sizePreset, labelWidthMm, labelHeightMm, pageMarginTop, pageMarginSide, sheetGap, layoutItems, customFields.

Content JSON yapisi:
senderName, senderAddress, recipientName, recipientAddress, orderNo, reference, weightValue, weightUnit, distanceValue, distanceUnit, deliveryTime, deliveryType, deliveryWindow, barcodeText, note, customFields.
```

## 15. Kisa Sonuc

Bu frontend'e gore backend'in omurgasi su:

- auth
- user/session
- template persistence
- asset storage
- export history
- role/ownership

Ilk kurulum icin en kritik iki konu:

1. Mock auth'i gercek auth ile degistirmek
2. localStorage'daki template kutuphanesini veritabanina tasimak
