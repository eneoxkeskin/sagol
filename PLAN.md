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
- [x] **M5 — Defter (60 dk)**: `src/lib/defter.ts` (oku/yaz/sil, şema kontrolü, 200 sınırı, aynı `d` tekrar eklenmez), gönderince otomatik "gonderilen" kaydı, `src/app/defter/page.tsx`: haftalık özet, iki sekme, "Geçmişten bir kart" (≥3 kayıt varsa), tek tek sil + "Tümünü sil" (onaylı), ana sayfada sade "Defterim" linki.
  Bitti sayılır: yenilemeden sonra kayıtlar duruyor; bozuk localStorage → boş defter, crash yok; lint temiz.
  Özet biçimi: "Bu hafta 3 kişiye teşekkür ettin: Ayşe, Mert, Annem." + aldıysan "1 teşekkür aldın." Hafta boşsa sayı yok: "Aklına biri gelirse burası hazır."
  Not: localStorage'ı `useSyncExternalStore` ile oku (effect içinde setState lint hatası verir; SSR'da boş liste).
- [x] **M6 — Cila + README + deploy hazırlığı (60 dk)**: `ethics-check` skill'ini çalıştır, bulguları düzelt; favicon/ikon, `not-found.tsx`, boş durumlar, odak stilleri, kontrast; gizlilik notu (formda: "Link kimdeyse kartı o görür. Hiçbir şey sunucuda saklanmaz."); README (ne, neden, mimari, etik ilkeler, yerel çalıştırma, canlı URL); Deploy kuralını uygula.
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
- (M5) Defter kaydı `d` ile tekilleştirilir (id = d); okunurken her kayıt decodeCard ile yeniden doğrulanır. "Şimdi" saat başına yuvarlanan useSyncExternalStore değeri (prerender Date.now kısıtı). Haftalık özet adları tekilleştirir, 5ten fazlaysa "ve diğerleri". Kalıcılık/tarayıcı testi elle yapılmadı; ayrıştırma birim testli.
- (M6) ethics-check: 0 kritik. Bulgular: İngilizce varsayılan 404 → not-found.tsx; varsayılan ikon → icon.svg. Gizlilik notu M2 formunda zaten var.
- (v2 plan) 2026-11-25 `vercel env ls`: hiç ortam değişkeni yok → `DATABASE_URL` yok. Ses (A) ve sayaç (C) `DATABASE_URL` varlığına bağlı sunucu bayrağı arkasında; kapalıyken arayüzde hiç görünmez.
- (v2 plan) Kart şeması `v:1` kalır, geriye uyumlu genişler: yeni opsiyonel `h` (zincir halkası, 1-999), `s` (ses id). Eski linklerdeki `z` okunur ve `h`'ye eşlenir; yeni kartlar yalnızca `h` yazar. Eski linkler kırılmaz.
- (v2 plan) "Karşılık ver" ön doldurması `/?to=<ad>&h=<n+1>` ile; `to` sunucuda `decodeCard` ile aynı temizleyiciden geçer (≤40 kod noktası). Gönderen adı yoksa düğme yalnızca "Karşılık ver" der.
- (v2 plan) Türkçe yönelme eki ("Ayşe'ye", "Mert'e", "Işık'a") ünlü uyumu + kaynaştırma harfiyle küçük saf fonksiyonla üretilir, birim testli; emin olunamayan adlarda (son harf harf değilse) ek atılır: "Karşılık ver".
- (v2 plan) Hız sınırı: IP saklanmaz, loglanmaz. Bellek içi, örnek başına token bucket (IP yalnızca RAM'de, tuzlu SHA-256, 10 dk TTL) + veritabanında günlük global tavan (ses ≤ 2000/gün, sayaç ≤ 20000/gün). Serverless'ta örnek başına olduğu için "en iyi çaba"; risk olarak kabul.
- (v2 plan) Şema kurulumu: `CREATE TABLE IF NOT EXISTS` ilk istekte örnek başına bir kez (ayrı migration adımı yok) → kullanıcının tek adımı yalnızca `DATABASE_URL` eklemek.
- (v2 plan) Ses kaydında MIME sırası: `audio/mp4;codecs=mp4a.40.2` → `audio/mp4` → `audio/webm;codecs=opus` → `audio/webm`. mp4/aac en geniş oynatma uyumu (Safari + Chrome + Firefox). 32 kbps × 20 sn ≈ 80 KB < 150 KB.
- (v2 plan) Silme token'ı URL fragment'inde taşınır (`/sil#<id>.<token>`): fragment sunucuya, loglara ve Referer'a gitmez. Sunucuda yalnızca SHA-256 özeti.
- (v2 plan) `/defter` → `/sakladiklarim` (kalıcı yönlendirme `next.config`); localStorage anahtarı `sagol:v1:defter` değişmez, mevcut kayıtlar korunur.
- (v2 plan) F kararı: üçüncü taraf ücretsiz LLM API'leri (Groq, Gemini, OpenRouter) reddedildi: ham ve kişisel düşünce dışarı gider (gizlilik ilkesi), anahtar gerekir, limitler sık değişiyor/kaynaklar çelişkili. Seçilen: Chrome yerleşik Prompt API (Gemini Nano, cihaz üstü, ücretsiz, veri cihazdan çıkmaz) yalnızca `LanguageModel.availability()` uygun ve Türkçe çıktı makulse; diğer her durumda yerel şablon motoru. Türkçe desteği belirsiz → büyük olasılıkla çoğu kullanıcı şablonları görür.
- (v2 plan) Alıcı ekranı tasarım yönü: "mektup değil, an": tam ekran, tek odak, mesaj büyük değişken tipografiyle satır satır belirir (≤600 ms toplam, `motion-safe`), sonra bağlam satırı ve eylemler. Zarf, konfeti, parıltı yok. Tema rengi zemin olur, kart kutusu kalkar.
- (v2 plan) Formdaki gizlilik notu ses açıkken yanlış olur → M12'de bayrağa göre iki metin: kapalıyken mevcut not; açıkken "Yazdığın metin sunucuya gitmez. Ses eklersen 7 gün saklanır, sonra silinir." README "Etik ilkeler"i de M12'de güncellenir.

## v2 — "e-kart"tan "ses + topluluk"a

**Fikir:** Yazı unutulur, ses kalır. Bir teşekkürü duymak, okumaktan farklı hissettirir. v2'nin imza eylemi: 20 saniyelik sesli teşekkür. Alıcı ekranı bir "an" olarak tasarlanır. Topluluk sayacı yalnızca kutlar ("Bugün 128 teşekkür edildi"), kimseyi kıyaslamaz.

**Sıra:** veritabanı gerektirmeyenler önce (M7 B, M8 D, M9 E), sonra altyapı + sayaç (M10 C), sonra ses (M11-M12 A), en son opsiyonel F (M13).

**Bayrak:** `src/lib/ozellik.ts` → `sesAcik()` / `sayacAcik()` = sunucuda `Boolean(process.env.DATABASE_URL)`. Sunucu bileşeni değeri prop olarak geçirir; istemci `process.env` okumaz. Kapalıyken ses/sayaç arayüzü hiç render edilmez, API rotaları 404 döner, geri kalan her şey çalışır.

**Ortak kurallar:** kart şeması `v:1` geriye uyumlu (bkz. Kararlar); tüm sunucu girdileri doğrulanır; sorgular yalnızca parametreli (`` sql`...${x}` `` etiketli şablon); mesaj metni asla sunucuya gitmez. Yeni kararlar yukarıdaki "Kararlar" bölümüne eklenir.

- [x] **M7 — Alıcı ekranı yeniden (60 dk)** (B): `src/app/k/[d]/page.tsx` + `src/components/AliciEkrani.tsx`. Tam ekran (`min-h-dvh`), tema rengi zemin, kart kutusu yok. Üstte küçük "<Kime> için"; ortada mesaj büyük, akışkan tipografi (`clamp()`, Nunito 800, `text-wrap: balance`); altında bağlam "<gönderen> · <tarih>" (`Intl.DateTimeFormat('tr-TR', {day:'numeric', month:'long'})`, `from` yoksa yalnızca tarih). Ses yuvası (M12 doldurur) mesajın hemen altında, merkezde. Birincil düğme "<Gönderen>'e karşılık ver" → `/?to=<from>&h=<n+1>`; ikincil "Sakladıklarım'a ekle". Zincir: `h>1` ise küçük "Bu teşekkür bir zincirin <h>. halkası." `card.ts`: `h` alanı + `z` geriye uyum + `yonelmeEki(ad)` + testler. Form `?to=` ve `?h=` okur. Hareket: mesaj satırları sırayla `opacity/translate` (toplam ≤600 ms), yalnızca `motion-safe:`; titreşim/otomatik ses yok. OG görseli `h` ile uyumlu kalır.
  Bitti sayılır: eski (`z`'li) M2 linki açılır ve doğru halka gösterilir; 360px'te taşma yok, 1440px'te mesaj ekranın odağı; `from` yoksa düğme "Karşılık ver"; karşılık linki formu alıcı adıyla dolu ve `h=n+1` ile açar; `prefers-reduced-motion` ile hareketsiz; `<script>` düz metin; `yonelmeEki` testleri (Ayşe'ye, Mert'e, Işık'a, Ümit'e, Gül'e, Annem'e) geçer.
  Risk: Türkçe ek kuralı istisnalı (kısaltmalar, yabancı adlar) → emin olunmazsa eki atla. Çok uzun tek kelime mesaj → `break-words` + `hyphens-auto` (`lang="tr"`).

- [x] **M8 — Sakladıklarım (45 dk)** (D): `src/app/sakladiklarim/page.tsx`; `/defter` → `/sakladiklarim` 308 (`next.config.ts` `redirects`). İki sekme: Gönderdiklerim / Aldıklarım (gerçek `role="tablist"`, ok tuşlarıyla gezinme). "Rastgele bir güzel söz göster" düğmesi (yalnızca tıklayınca; ≥1 kayıt varsa görünür; aynı sözü arka arkaya göstermez). Haftalık özet korunur (sayılar yalnızca kutlar). `DefterKaydi`'na opsiyonel `sesBitis?: number` (unix sn): ses varsa liste "Ses kaydı <tarih>'e kadar dinlenebilir"; süre geçtiyse "Ses süresi doldu; yazılı hali burada." (suçlamasız). Ana sayfa linki "Sakladıklarım".
  Bitti sayılır: mevcut `sagol:v1:defter` kayıtları kayıpsız görünür; `/defter` yönlenir; klavye ile sekme değişir; bozuk localStorage → boş liste, crash yok; lint/build/test temiz.
  Risk: şema genişlemesi eski kayıtlarla uyumlu olmalı (yeni alan opsiyonel, `ayristir` testine eklenir).

- [x] **M9 — /hakkinda (30 dk)** (E): `src/app/hakkinda/page.tsx`, statik. Bölümler: "Neleri saklıyoruz" (ses: 7 gün, sonra kalıcı silinir; anonim günlük sayı); "Neleri saklamıyoruz" (mesaj metni, ad, IP, konum, çerez, analitik; bildirim ve seri yok); "Silme hakkın" (silme linki; KVKK kapsamında kısa aydınlatma: amaç, süre, saklanan veri türü, iletişim yolu olarak GitHub issues); "Nasıl yapıldı" (URL'de kart, cihazda defter, bayraklı ses, cihaz üstü asistan: portföy vaka çalışması tonunda 5-6 kısa madde). Bayrak kapalıyken ses/sayaç maddeleri "henüz etkin değil" notuyla kalır (dürüstlük). Footer'a "Hakkında" linki (ana sayfa, alıcı ekranı, Sakladıklarım).
  Bitti sayılır: sayfa 200, statik prerender; ethics-check "şeffaflık" maddesi metinle birebir tutarlı; AA kontrast.
  Risk: metin ile gerçek davranış ayrışabilir → M12 ölçütünde sayfa tekrar gözden geçirilir.

- [ ] **M10 — Veritabanı altyapısı + topluluk sayacı (60 dk)** (C): bağımlılık `@neondatabase/serverless` (tek izinli ek). `src/lib/db.ts` (`import "server-only"`; `neon(process.env.DATABASE_URL)`; `semaHazir()` örnek başına bir kez `CREATE TABLE IF NOT EXISTS voices(...)` ve `stats(day date primary key, count int not null default 0)`). `src/lib/ozellik.ts` bayraklar. `src/lib/hiz.ts` bellek içi token bucket (anahtar = tuzlu SHA-256(IP), yalnızca RAM, 10 dk TTL; tuz başlatmada `crypto.randomUUID()`). `POST /api/sayac`: gövde yok; `INSERT ... ON CONFLICT (day) DO UPDATE SET count = stats.count + 1 WHERE stats.count < 20000`; gün `Europe/Istanbul`; hız 10/dk/istemci; yanıt 204. Form kart oluşturunca bir kez çağırır (hata sessizce yutulur, akış etkilenmez). Ana sayfa sunucu bileşeni (Suspense içinde) bugünkü sayıyı okur: `N ≥ 1` ise "Bugün N teşekkür edildi." (`tr-TR` biçimli); 0, hata ya da bayrak kapalı → hiçbir şey gösterilmez. Hiçbir yerde istek verisi loglanmaz.
  Bitti sayılır: `DATABASE_URL` yokken build temiz, ana sayfada sayaç yok, `/api/sayac` 404; varken (yerelde `vercel env pull` sonrası) iki kart → sayı +2, 11. hızlı istek 429; `stats` tablosunda yalnızca `day,count`; lint/build/test temiz (hız sınırlayıcı ve gün hesabı birim testli).
  Risk: serverless örnekleri bellek paylaşmaz → hız sınırı kısmi; global günlük tavan ikinci savunma. Sayaç şişirilebilir (kimlik yok); yalnızca kutlayıcı olduğu için kabul. Neon soğuk başlangıç ~1 sn → sayaç Suspense içinde, sayfa beklemez.

- [ ] **M11 — Ses depolama API'si (60 dk)** (A, sunucu): `POST /api/ses`: ham gövde (multipart değil), `Content-Type` allowlist {`audio/mp4`, `audio/webm`, `audio/ogg`} (parametreler soyulup karşılaştırılır), `Content-Length` ve gerçekten okunan bayt ≤ 150 KB (akış sayılarak okunur, aşınca 413), sihirli bayt kontrolü (mp4 `ftyp`, webm `1A45DFA3`, ogg `OggS`), `X-Sure-Ms` ≤ 20500; hız 5/10 dk/istemci + günlük global ≤ 2000. `id` = 16 rastgele bayt base64url (22 karakter), `token` = 32 bayt base64url, DB'de `sha256(token)`. `expires_at = now() + 7 gün`. Yazma öncesi temizlik: `DELETE FROM voices WHERE expires_at < now()`. Yanıt `{id, token, bitis}`. `GET /api/ses/[id]`: id regex `^[A-Za-z0-9_-]{22}$`; süresi dolmuşsa sil + 404; başlıklar: kayıtlı `Content-Type`, `X-Content-Type-Options: nosniff`, `Content-Disposition: inline`, `Cache-Control: private, max-age=3600`, `Accept-Ranges: bytes` + `Range` desteği (Safari ister). `DELETE /api/ses/[id]`: `Authorization: Bearer <token>`, `timingSafeEqual`, 204. Liste endpoint'i yok. `card.ts`: opsiyonel `s` (aynı regex). `src/app/sil/page.tsx`: fragment'ten `id.token` okur, tek "Sesi sil" düğmesi, sonuç `aria-live`.
  Bitti sayılır: curl ile: 151 KB → 413; `text/html` → 415; sahte mp4 (yanlış sihirli bayt) → 415; geçerli yükleme → 201 + id; GET → 200 doğru mime; yanlış token DELETE → 403, doğru → 204, sonra GET → 404; `expires_at` geçmişe çekilmiş kayıt GET → 404 ve satır silinmiş; 6. hızlı yükleme → 429; bayrak kapalıyken tüm rotalar 404; doğrulayıcılar birim testli.
  Risk: Vercel fonksiyon gövde sınırı 4.5 MB (sorun değil); `bytea` dönüşümü sürücüde `Buffer`/hex → testte doğrula. `Range` olmadan Safari oynatmayabilir.

- [ ] **M12 — Sesli teşekkür arayüzü + alıcı oynatıcısı (60 dk)** (A, istemci): `src/components/SesKaydedici.tsx`: "Sesini de ekle (isteğe bağlı)" açılır bölümü; mikrofon izni yalnızca "Kayda başla"ya basınca istenir; kayıttan ÖNCE tek cümle: "Sesin 7 gün saklanır, sonra silinir; istersen daha önce silebilirsin." MIME seçimi `MediaRecorder.isTypeSupported` ile (Kararlar sırası), `audioBitsPerSecond: 32000`, 20 sn'de otomatik durur, süre nötr gösterilir ("0:12 / 0:20", geri sayım baskısı yok). Canlı dalga formu: `AnalyserNode` + `<canvas>` (rAF; reduced-motion'da statik seviye çubuğu). Dinle / yeniden kaydet / sil. "Kartı oluştur" önce sesi yükler, `s`'yi karta yazar; paylaş adımında silme linki ("Bu linkle sesi istediğin an silebilirsin" + kopyala); gönderilen Defter kaydına `sesBitis` + silme linki yalnızca cihazda saklanır. Yükleme başarısızsa kart sessiz oluşur, nazik not. `src/components/SesOynatici.tsx` (alıcı ekranında merkez): `fetch` → `decodeAudioData` → 64 tepe → çubuk dalga; `<audio>` ilerleyişiyle senkron (rAF); otomatik oynatma YOK; klavye: boşluk oynat/durdur, oklar ±2 sn; `aria-label`, ilerleme `aria-valuenow`. 404 → "Bu ses kaydının süresi dolmuş; yazılı teşekkür burada." Alıcıda ek olarak "Sesle karşılık ver" (`/?to=&h=&ses=1`, ses bölümü açık gelir).
  Bitti sayılır: Chrome (masaüstü+Android) ve Safari (iOS+macOS) arasında kaydet → gönder → diğer tarayıcıda oynat çapraz testi (elle; sonuç Kararlar'a); ses yokken akış aynen çalışır; izin reddi nazik mesaj; 20 sn sınırı; reduced-motion statik; /hakkinda metni gerçek davranışla yeniden karşılaştırıldı; ethics-check 0 kritik.
  Risk: **Tarayıcı uyumu.** Eski Chrome yalnızca webm/opus kaydeder; Safari < 18.4 webm/opus oynatamayabilir → oynatma hatasında "Bu tarayıcı sesi açamadı; başka bir tarayıcıda dene" ve yazı her zaman görünür. iOS'ta `AudioContext` yalnızca kullanıcı jestiyle başlar → dalga tepeleri `OfflineAudioContext` ile ya da ilk oynatmada hesaplanır. Sessiz kayıt (tepeler ~0) → "Sesin gelmedi gibi, tekrar dener misin?"

- [ ] **M13 — (opsiyonel) Yazma asistanı (45 dk)** (F): `src/lib/taslak.ts` yerel şablon motoru: ham düşünceden ad/olay/duygu ipuçları (basit kurallar) → 3 tonda taslak (sade, sıcak, kısa), her biri ≤200 kod noktası, birim testli. `src/components/TaslakYardimcisi.tsx`: "Ne hissettiğini kendi kelimelerinle yaz" → 3 öneri; seçilen mesaja yazılır, düzenlenebilir. İyileştirme: `'LanguageModel' in self` ve `availability()` "available" ise Chrome Prompt API (cihaz üstü) ile 3 taslak; ≤4 sn içinde gelmez, boş ya da Türkçe değilse şablona düş. Model indirmesi kullanıcı istemeden tetiklenmez. Sunucuya hiçbir şey gitmez.
  Bitti sayılır: Prompt API olmayan tarayıcıda şablonlar ≤50 ms; API varsa 3 taslak ya da sessiz geri düşüş; hiçbir ağ isteği yok (DevTools ile doğrulandı); ücretli/harici API yok.
  Risk: Gemini Nano Türkçe kalitesi belirsiz; yüksek donanım şartı (≥4 GB VRAM ya da 16 GB RAM) → çoğu kullanıcı şablon görür. Özellik "sihir" değil "başlangıç noktası" olarak sunulur.

### v2 Deploy kuralı
Her milestone commit'inden sonra `git push`. M12 (yapılırsa M13) bitince `npx vercel --prod --yes`, ardından canlı URL'de curl doğrulaması: `/` 200; Türkçe mesajlı, `h=3` örnek kart 200 ve `opengraph-image` `image/png`; eski `z`'li link 200; `/k/xxx` nazik hata; `/defter` → 308; `/hakkinda` 200; `DATABASE_URL` yoksa `/api/ses` ve `/api/sayac` 404, varsa M10/M11 curl senaryoları. Sonuçlar bitiş mesajında raporlanır.
- (M7) Kart.z -> Kart.h (decode zyi hye eşler); `s` (ses id) şimdiden decode edilir. Alıcı ekranı sunucu bileşeni; ses yuvası M12 için yorum olarak bırakıldı. Defter linkinin /sakladiklarima taşınması M8.
- (M8) "Rastgele güzel söz" kullanıcının kendi kayıtlarından seçer (≥1 kayıt, yalnızca tıklayınca). Sekmeler role=tablist, ok tuşları iki sekme arasında geçer. sesBitis opsiyonel alan; gerçek değeri M12 yazar.
- (M9) /hakkinda statik; ses/sayaç maddeleri build anındaki DATABASE_URLe göre "etkin"/"henüz etkin değil" der (env eklenince Vercel yeniden derler). `ozellik.ts` M9da oluşturuldu (server-only).
