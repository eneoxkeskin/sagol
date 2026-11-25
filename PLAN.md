# SağOl — Plan

**Çekirdek döngü:** Birini düşün → 20 sn'de teşekkür yaz → kart linkini paylaş → alan kişi kartı açar, iyi hisseder → "Sen de birine teşekkür et" ile zincirin bir sonraki halkası olur.

## İlk 60 saniye
1. `/` açılır: başlık "Bugün kime teşekkür etmek istersin?" + hemen form (onboarding yok).
2. "Kime" yazar → ipucu çipine dokunur ("Zor günümde yanımda olduğun için…") → mesaj hazır, düzenler.
3. Canlı önizlemede kartı görür, tema seçer (isteğe bağlı), "Kartı oluştur".
4. Paylaş adımı: "Paylaş" (Web Share) / "WhatsApp" / "Linki kopyala" + kısa sıcak cümle ("Birinin gününü güzelleştirdin.").
5. Kart otomatik olarak Defter'e (yerel) eklenir. Toplam ≈ 40 sn.

## Paylaşım mekaniği
- Link: `/k/<d>`. WhatsApp/sosyal önizlemede OG görseli kartın kendisidir (alıcı adı + mesajın başı) → tıklanma sebebi.
- Kart sayfası: zarf açılır gibi tek seferlik küçük animasyon (sürpriz), sonra "Bu teşekkür zincirin **3.** halkası".
- Alıcıya iki seçenek, ikisi de baskısız: "Defterime kaydet" ve "Sen de birine teşekkür et" (`/?z=<n+1>`).
- Geri dönme nedeni: Defter. Haftalık özet + "Geçmişten bir kart" (rastgele eski bir teşekkürü yeniden gösterir: minnet hatırlatması, ceza değil).

## Veri modeli
```ts
type Tema = "sabah" | "cay" | "deniz" | "lavanta";
type Kart = { v: 1; to: string; msg: string; from?: string; th: Tema; z: number; t: number };
// to ≤40, msg 1..200, from ≤40 (kod noktası), z 1..999 zincir halkası, t = oluşturma (unix sn)
type DefterKaydi = { id: string; tur: "gonderilen" | "alinan"; d: string; kart: Kart; at: number };
// localStorage "sagol:v1:defter" = DefterKaydi[] (en yeni başta, en fazla 200)
```
`d` = base64url(UTF-8(JSON)); `d` en fazla 1200 karakter, regex `^[A-Za-z0-9_-]+$`.

## Ekranlar
1. **Yaz** `/` — form, ipucu çipleri, tema, canlı önizleme. 2. **Paylaş** — `/` içinde 2. adım.
3. **Kart** `/k/[d]` — kart, zincir halkası, CTA'lar. 4. **Bozuk link** — `/k/[d]` içinde nazik hata + "Yeni kart yaz".
5. **Defter** `/defter` — haftalık özet, gönderdiklerim/aldıklarım, geçmişten bir kart, sil.

## Milestone'lar
- [x] **M1 — Kart çekirdeği (45 dk)**: `src/lib/card.ts` (`encodeCard`, `decodeCard`, `TEMALAR`, limitler), `src/lib/card.test.ts`, `package.json`'a `"test": "node --test src/**/*.test.ts"`, tsconfig'e `"allowImportingTsExtensions": true`.
  Bitti sayılır: `npm test` geçer; "ğşıİöüç 🙏" gidiş-dönüş eşit; bozuk base64, boş, 1201+ karakter, yanlış şema, `v≠1` → `null`.
  Not: `TextEncoder`+`btoa` kullan (tarayıcı ve sunucuda aynı). Test dosyası `./card.ts` uzantılı import eder. Decode'da NFC normalize, trim, kontrol karakterlerini (\n hariç) sil, 3+ satır boşluğunu 2'ye indir; bilinmeyen tema → "sabah"; `z` sınır dışı → 1.
- [x] **M2 — Yaz + Paylaş ekranı (60 dk)**: `src/components/Kart.tsx` (saf görünüm, 4 tema), `src/app/page.tsx` + istemci form bileşeni. Çipler (6): boş mesajı doldurur, doluysa sona ekler. Kalan karakter sayacı. `?z=` okunur. Paylaş adımı: `navigator.share` (yoksa gizle), `https://wa.me/?text=`, panoya kopyala (`aria-live` "Kopyalandı").
  Bitti sayılır: 20 sn'de kart linki üretilir; boş "Kime"/mesajla buton pasif; mobil 360px'te taşma yok.
  Not: layout'ta `lang="tr"`, metadata Türkçe, font `subsets: ["latin","latin-ext"]` (şu an sadece latin → ğşı yedek fonta düşer).
- [x] **M3 — Kart sayfası (45 dk)**: `src/app/k/[d]/page.tsx` (sunucu, `await params`, `decodeCard`), `generateMetadata` (başlık: "<Kime> için bir teşekkür"), açılış animasyonu (`motion-safe:`), zincir halkası metni, "Defterime kaydet" (istemci), "Sen de birine teşekkür et" → `/?z=n+1`, bozuk link durumu.
  Bitti sayılır: M2 linki açılır; `/k/abc`, `/k/<3000 karakter>` nazik hata verir; `<script>` metni düz yazı görünür.
  Not: `z=1` ise zincir cümlesi hiç gösterilmez. Mesaj `whitespace-pre-line` ile düz metin; URL'ler link yapılmaz.
- [x] **M4 — OG görseli (45 dk)**: `src/app/k/[d]/opengraph-image.tsx` (`ImageResponse` from `next/og`, 1200×630, yalnızca flexbox), tema renkleri, mesaj ilk ~120 karakter + "…", bozuk veride genel SağOl görseli.
  Bitti sayılır: `/k/<d>/opengraph-image` PNG döner, "ğşıİöüç" kutucuk değil harf olarak görünür; build temiz.
  Not: **Türkçe karakter riski.** Önce varsayılan fontla dene; eksik glif varsa `curl -sL "https://fonts.googleapis.com/css2?family=Nunito:wght@800"` (UA'sız istek .ttf URL'si döner) ile statik TTF'yi `src/assets/og-font.ttf` olarak indir, modül seviyesinde `readFile` ile yükle. Toplam paket < 500KB. Emoji görsellerde atlanabilir.
- [ ] **M5 — Defter (60 dk)**: `src/lib/defter.ts` (oku/yaz/sil, şema kontrolü, 200 sınırı, aynı `d` tekrar eklenmez), gönderince otomatik "gonderilen" kaydı, `src/app/defter/page.tsx`: haftalık özet, iki sekme, "Geçmişten bir kart" (≥3 kayıt varsa), tek tek sil + "Tümünü sil" (onaylı), ana sayfada sade "Defterim" linki.
  Bitti sayılır: yenilemeden sonra kayıtlar duruyor; bozuk localStorage → boş defter, crash yok; lint temiz.
  Özet biçimi: "Bu hafta 3 kişiye teşekkür ettin: Ayşe, Mert, Annem." + aldıysan "1 teşekkür aldın." Hafta boşsa sayı yok: "Aklına biri gelirse burası hazır."
  Not: localStorage'ı `useSyncExternalStore` ile oku (effect içinde setState lint hatası verir; SSR'da boş liste).
- [ ] **M6 — Cila + README + deploy hazırlığı (60 dk)**: `ethics-check` skill'ini çalıştır, bulguları düzelt; favicon/ikon, `not-found.tsx`, boş durumlar, odak stilleri, kontrast; gizlilik notu (formda: "Link kimdeyse kartı o görür. Hiçbir şey sunucuda saklanmaz."); README (ne, neden, mimari, etik ilkeler, yerel çalıştırma, canlı URL); Deploy kuralını uygula.
  Bitti sayılır: ethics-check 0 kritik bulgu; lint+build+test temiz; README tamam; deploy kuralı uygulandı.

## Deploy kuralı
`npx vercel whoami` çalıştır. Giriş varsa: `npx vercel --prod --yes`, canlı URL'yi README'ye yaz, commit at. Giriş yoksa deploy etme; bitiş mesajına `npx vercel login` ve `npx vercel --prod --yes` komutlarını yaz.

## Kararlar
- (plan) Veri `?d=` yerine yol parçasında (`/k/[d]`): `opengraph-image` yalnızca `params` alır, query alamaz.
- (plan) Zincir sayacı `z` kartın içinde taşınır; sunucu gerekmez, yalnızca kutlayıcı bilgi, sıralama yok.
- (plan) Alıcı da kartı Defter'e kaydedebilir: geri dönme nedeni "aldığım teşekkürler", streak değil.
- (plan) Test için ek paket yok: Node 26 yerleşik TS + `node:test` (scratch'te doğrulandı).
- (M1) kesKodNoktasi/kodNoktasiUzunlugu yardımcıları card.ts içinde dışa açıldı (M2 formu kullanır). Node MODULE_TYPELESS uyarısı zararsız; "type":"module" Next config dosyalarını etkileyebileceği için eklenmedi.
- (M2) Açık/koyu tema yerine tek sıcak açık tema (AA kontrast garantisi için). `?z=` okuması Suspense içinde (cacheComponents prerender hatası). Link 1200 karakteri aşarsa form nazik uyarı verir. Defter kaydı M5.
- (M3) "Defterime kaydet" düğmesi M5e bırakıldı: defter.ts henüz yok, M5 düğmeyi kart sayfasına ekler. Kart sayfası Suspense içinde params okur (cacheComponents). Geçersiz link 200 ile nazik hata ekranı gösterir.
- (M4) Varsayılan ImageResponse fontu ğşıİöüç glifleri doğru çiziyor (gözle doğrulandı); özel TTF indirilmedi, paket küçük kaldı. Bozuk veri: genel SağOl görseli.
