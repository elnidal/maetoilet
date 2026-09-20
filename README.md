# 🚽 Taharet (MAE Tuvalet)

MAE okulundaki tek erkek öğretmen tuvaletinin anlık doluluk durumunu takip eden, kim
girdiğinde/çıktığında herkese **push bildirimi** gönderen, telefonun ana ekranına
**uygulama gibi** eklenebilen (PWA) bir mini proje.

## Neler var?

- **Gerçek zamanlı durum** — Convex'in reaktif sorguları ile, polling yok.
- **Push bildirimleri** — tuvalet dolduğunda/boşaldığında, ve "8 dakikadır içeridesin,
  hâlâ orada mısın?" dürtmesi (unutma koruması).
- **30 dakika sonra otomatik sıfırlama** — biri çıkışı yapmayı unutursa.
- **Bekleme sırası** — dolu iken sıraya gir, boşalınca öncelikli bildirim al.
- **Şakacı liderlik tablosu** (`/istatistik`) — en uzun kalan, en çok giren.
- **PWA** — Android ve iOS'ta "Ana Ekrana Ekle" ile gerçek bir uygulama gibi açılır.

## Teknoloji

Next.js 16 (App Router) + TypeScript + Tailwind, **Convex** (veritabanı + gerçek
zamanlı senkronizasyon + zamanlanmış görevler, hepsi tek yerde), `web-push` ile Web
Push bildirimleri, Vercel'de host.

Neden Convex? Supabase'i denedik ama hesabın ücretsiz proje limiti dolmuştu (org
başına değil, hesap başına 2 proje hakkı var). Convex'te böyle bir kısıt yok, üstelik
zamanlanmış görevler (dürtme/oto-sıfırlama) için Supabase'de pg_cron+pg_net gibi bir
dolanmaya gerek kalmıyor — Convex'in kendi `crons.ts`'i bunu native destekliyor.

---

## Kurulum

### 1) Yerelde çalıştır (hesap gerekmez)

```bash
npm install
npm run dev
```

Bu komut **hem Convex'i hem Next.js'i** birlikte başlatır (`scripts/dev.sh`
üzerinden). İlk çalıştırmada Convex, hesap gerektirmeyen bir **yerel/anonim
deployment** kurar ve `.env.local`'a gerekli değişkenleri otomatik yazar. Tarayıcıda
`http://localhost:3000` adresini aç.

> Bu makineye özgü iki not (başka bir bilgisayarda gerekmeyebilir):
> - Convex'in `"use node"` action'ları (push gönderimi, `convex/push.ts`) **Node
>   20/22/24** istiyor; bu makinede varsayılan Node v23 olduğu için `scripts/dev.sh`
>   otomatik olarak `brew install node@22` ile kurulan sürümü öne alıyor.
> - Bu makinede `NODE_USE_SYSTEM_CA=1` ortam değişkeni Convex'e bağlanırken
>   "self-signed certificate" hatası veriyordu; `scripts/dev.sh` bunu görev süresince
>   `0` yapıyor.

### 2) Push bildirimleri için VAPID anahtarlarını Convex'e tanıt

VAPID anahtarları zaten üretildi ve `NEXT_PUBLIC_VAPID_PUBLIC_KEY` olarak
`.env.local`'a yazıldı (tarayıcı tarafı için). Ama **Convex fonksiyonları
`.env.local`'ı görmez** — kendi ortam değişkenlerine ihtiyaç duyar. Bir kere şunu
çalıştır:

```bash
npx convex env set VAPID_PUBLIC_KEY BOft0CxaB100iDZyqDVUTH9iZ4yvjgz2koJQm5c0LOk-7Y4at5INTm82q6Puy33gjtd5QWD7rk2kjw5SPwQPles
npx convex env set VAPID_PRIVATE_KEY JwuNtKXkGd3qP_hsIG4_jLgb-oVjmgBoDcdpC1w50gI
npx convex env set VAPID_SUBJECT mailto:murat3773@gmail.com
```

### 3) Vercel'e deploy et

1. Convex'te bulut hesabına geçmek için: `npx convex login` (tarayıcıda onay ister),
   sonra `npx convex deploy` — bu sana gerçek bir bulut deployment URL'i verir
   (yerel `http://127.0.0.1:3210` yerine).
2. Bu klasörü GitHub'a push'la, Vercel'de "Import Project" ile bağla.
3. Vercel → Project Settings → Environment Variables'a şunları ekle:
   - `NEXT_PUBLIC_CONVEX_URL` (bulut deploy'unun verdiği URL)
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
4. Convex Dashboard'da (bulut projende) `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`,
   `VAPID_SUBJECT` ortam değişkenlerini de aynı şekilde gir (Settings →
   Environment Variables).
5. Deploy et, sana bir domain verecek (örn. `mae-tuvalet.vercel.app`).

Zamanlayıcı (dürtme + oto-sıfırlama) `convex/crons.ts` içinde tanımlı ve Convex
tarafında otomatik çalışır — ayrıca bir cron servisi kurmana gerek yok.

---

## Telefona "uygulama" olarak ekleme

**Android (Chrome):** Siteyi aç → sağ üstteki ⋮ menü → "Ana ekrana ekle".

**iOS (Safari, zorunlu — Chrome'da çalışmaz):** Siteyi aç → paylaş ikonu →
"Ana Ekrana Ekle". Push bildirimleri için **iOS 16.4+** gerekiyor, ve bildirim izni
**ana ekrandan açılan uygulama içinden** verilmeli (Safari sekmesinden değil).

Kurulumdan sonra uygulamayı aç, 🔔 ikonuna basıp bildirimlere izin ver.

---

## Klasör yapısı (özet)

```
app/
  page.tsx               → ana ekran (ToiletApp bileşeni)
  istatistik/page.tsx    → liderlik tablosu
  manifest.ts            → PWA manifest
convex/
  schema.ts               → tablo tanımları
  toilet.ts                → durum sorgusu, giriş/çıkış, zamanlayıcı kontrolü
  push.ts                  → web-push gönderimi ("use node")
  pushSubscriptions.ts      → bildirim abonelikleri
  queue.ts                  → bekleme sırası
  usageLogs.ts               → istatistik sorgusu
  crons.ts                    → her dakika çalışan zamanlayıcı
components/
  ConvexClientProvider.tsx   → Convex bağlantısı (yoksa kurulum ekranı gösterir)
  ToiletApp.tsx                → ana ekran mantığı
lib/
  push-client.ts                → tarayıcı push izni/abonelik mekaniği
public/
  sw.js                          → service worker (push + basit önbellek)
  icons/                          → PWA ikonları
scripts/
  dev.sh                          → `npm run dev` — Convex + Next.js birlikte
```

## Sırada ne var? (fikir listesi)

- Fiziksel sensör (ESP32 + manyetik kapı sensörü) ile tamamen otomatik algılama —
  insan hatasını (girişi/çıkışı işaretlemeyi unutma) tamamen ortadan kaldırır.
- Haftalık/aylık özet bildirimi ("bu hafta en uzun kalan: ...").
