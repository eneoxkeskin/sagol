---
name: ethics-check
description: SağOl için etik, güvenlik, gizlilik (KVKK) ve erişilebilirlik denetimi (karanlık desenler, XSS, URL doğrulama, bozuk linkler, ses depolama güvenliği, veritabanı sorguları, veri sızıntısı, çıkartma/tepki doğrulaması, story görseli, Türkçe karakter, a11y). M6, M12, M20'de, deploy öncesi ya da kullanıcı "etik kontrol", "güvenlik kontrolü", "/ethics-check" dediğinde kullan. Sadece raporlar; düzeltmeyi çağıran yapar.
---

# ethics-check

Kodu değiştirme, yalnızca raporla. Soru sorma.

## Tarama
`src/` altında `rg` ile ara, şüpheli satırları oku.

**1. Karanlık desenler** (metinler ve UI)
- Aciliyet/sayaç: `rg -n "hemen|son şans|acele|kaçırma|sadece bugün|geri sayım|countdown" src`
- Suçluluk/kayıp korkusu: `rg -n "unuttun|kaybed|bozuldu|seri|streak|henüz hiç|0 teşekkür" src`
- Ceza/kıyas: sıralama, rozet kaybı, "arkadaşların senden fazla" türü metin.
- Sonsuz akış: otomatik yükleme, `IntersectionObserver` ile sayfalama.
- Bildirim: `rg -n "Notification|serviceWorker|PushManager|setInterval" src`
- Sayılar yalnızca kutlar mı? Boş durum suçlamadan mı yazılmış? Topluluk sayacı 0 ya da hata durumunda hiç görünmüyor mu, kişisel kıyas ("sen bugün hiç…") yok mu?
- Zorlayıcı duyusal etki: `rg -n "vibrate|autoplay|autoPlay|\.play\(\)" src` → `navigator.vibrate` hiç olmamalı; `play()` yalnızca kullanıcı tıklama/tuş işleyicisinde; otomatik ses/oynatma yok.
- Ses kaydı sırasında süre göstergesi nötr mü ("0:12 / 0:20"), aciliyet dili ya da kırmızı yanıp sönen geri sayım yok mu?
- "Karşılık ver" metinleri baskısız mı (borç/zorunluluk dili yok: "karşılık vermelisin", "bekliyor" vb.)?

**2. Güvenlik**
- `rg -n "dangerouslySetInnerHTML|innerHTML|eval\(|new Function" src` → bulgu olmamalı.
- Kullanıcı metni `href`, `src`, `style` içine giriyor mu? (`wa.me` linkinde `encodeURIComponent` şart.)
- URL verisi yalnızca `decodeCard` ile mi okunuyor? Regex, 1200 sınırı, try/catch, şema ve uzunluk kontrolü var mı?
- localStorage okuması try/catch + şema kontrolü yapıyor mu?
- Sunucuda kart verisi `console.log`/dosyaya yazılıyor mu? Harici izleme betiği var mı? `rg -n "console\.(log|info|warn|error)" src/app/api src/lib`
- Veritabanı: `rg -n "sql\.unsafe|sql\.query|\.query\(|\+ *['\"\`].*(SELECT|INSERT|DELETE|UPDATE)" src` → bulgu olmamalı; tüm sorgular `` sql`…${x}` `` etiketli şablon. `db.ts` `import "server-only"` ile başlıyor mu? İstemci bileşenlerinde (`"use client"`) `process.env` ya da `@/lib/db` importu var mı?
- Sızıntı: `DATABASE_URL`, token ya da IP hiçbir yanıtta, hata mesajında, logda, `NEXT_PUBLIC_*` değişkeninde veya repoda (`git ls-files | rg "\.env"`) yer alıyor mu? Hata yanıtları iç ayrıntı (stack, SQL) içeriyor mu?

**2b. Ses depolama** (`src/app/api/ses/**`, `src/lib/ses*`)
- Boyut: `Content-Length` VE gerçekten okunan bayt ≤ 150 KB, aşınca 413; gövde tamamen belleğe alınmadan önce sınır uygulanıyor mu?
- MIME: allowlist (`audio/mp4`, `audio/webm`, `audio/ogg`) + sihirli bayt kontrolü; yanıtta kayıtlı mime + `X-Content-Type-Options: nosniff`; `text/html`/`image/svg+xml` asla sunulamıyor mu?
- Süre: istemci süresi ≤ 20,5 sn doğrulanıyor mu; kayıt arayüzü 20 sn'de duruyor mu?
- Id: `crypto.getRandomValues`/`randomBytes` ile ≥16 bayt, base64url; `Math.random`, sıralı id, zaman damgası türevi YOK. GET/DELETE'te id regex kontrolü var mı?
- Liste/arama endpoint'i yok mu (`rg -n "SELECT .* FROM voices" src` → yalnızca `WHERE id =` ile)?
- Süre dolumu: `expires_at` her GET'te kontrol ediliyor, süresi dolan erişimde siliniyor, POST öncesi toplu temizlik var mı? Saklama 7 günü aşamıyor mu?
- Silme: token yalnızca SHA-256 özeti olarak saklanıyor, `timingSafeEqual` ile karşılaştırılıyor, silme linki URL fragment'inde (`#`) mi (sunucuya/Referer'a gitmez)?
- Hız sınırı: POST `/api/ses` ve `/api/sayac` sınırlı mı, IP yalnızca bellekte tuzlu özet mi (DB'ye yazılmıyor)? Günlük global tavan var mı?
- Bayrak: `DATABASE_URL` yokken tüm ses/sayaç rotaları 404 ve arayüz gizli mi?

**2c. KVKK / açık bilgilendirme**
- Mikrofon izni yalnızca kullanıcı "Kayda başla"ya basınca isteniyor mu (sayfa açılışında `getUserMedia` yok)?
- Kayıttan ÖNCE görünür tek cümle: ne saklanır (ses), ne kadar (7 gün), nasıl silinir (silme linki). Kayıt öncesi açık bilgilendirme atlanamıyor mu?
- `/hakkinda` metni gerçek davranışla birebir tutarlı mı (saklama süresi, sayaçta yalnızca gün+sayı, mesaj metni sunucuda yok, IP saklanmaz)? Tutarsızlık KRİTİK.
- Gönderene silme linki gösteriliyor ve cihazda saklanıyor mu; alıcıya silme yetkisi verilmiyor mu?
- Kopyalanabilir sızıntı: paylaşılan kart linki/OG görseli/`<title>` silme token'ı, ses id'si dışında başka bir sunucu verisi ya da gönderenin bilmediği bilgi içeriyor mu? Kopyalanan metinlere token karışıyor mu (yalnızca bilinçli "silme linkini kopyala" düğmesi hariç)?

**2d. v3: halka, çıkartma, tepki, story**
- Ses otomatik oynamıyor: `rg -n "autoPlay|autoplay|\.play\(\)" src` → `play()` yalnızca tıklama/tuş işleyicisinde; sayfa yüklenince, halka görününce ya da story/OG'de ses yok.
- Hareket kapatılabilir: halka çizilerek belirme, çıkartma pop'u, satır animasyonları yalnızca `motion-safe:` ya da `prefers-reduced-motion` kontrolü arkasında; `navigator.vibrate` hiç yok.
- Çıkartma doğrulaması (`src/lib/cikartma.ts`, `decodeCard`): tür allowlist (`kalp|yildiz|parilti|cicek|gunes|yaprak|e1..e12`), sayı ≤ 8, x/y 0..1 (URL'de 0..1000), r −180..180, s 0.5..2 (URL'de 50..200); tamsayı olmayan/bilinmeyen öğe atılıyor; testi var mı? Çıkartma türü asla `href`, `src`, `className` ya da `dangerouslySetInnerHTML`'e doğrudan girmiyor (yalnızca tablo üzerinden eşleniyor).
- Tepki (`/t/[d]`, `src/lib/tepki.ts`): emoji allowlist (5 anahtar), adlar `decodeCard` ile aynı temizleyiciden, ≤40 kod noktası, düz metin; tepki verisi sunucuda saklanmıyor/loglanmıyor; `/t/xxx` nazik hata.
- XSS/URL sızıntısı: kart ya da tepki verisinden gelen hiçbir değer `href`/`src`'ye ham girmiyor; paylaşım linklerinde `encodeURIComponent`; `p` alanı yalnızca regex'li base64url (64 karakter).
- Story ve OG görseli (`/k/[d]/story`, `opengraph-image`): yalnızca kartta zaten görünenleri içeriyor (alıcı, gönderen, tarih, alıntı, halka, çıkartmalar); ses id'si, silme token'ı, URL'nin tamamı, IP ya da sayaç bilgisi YOK. Bozuk `d` → genel görsel, crash yok.
- Arayüz ikon/metinlerinde emoji yok (yalnızca kullanıcının seçtiği çıkartma/tepki); tepki düğmelerinin Türkçe `aria-label`'ı var.
- Dokunma hedefleri ≥44px (`min-h-11 min-w-11` ya da eşdeğeri); 4 temada metin/ikincil/düğme kontrastı ≥4.5:1 (`src/lib/kontrast.test.ts` varsa geçiyor mu?).
- Klişe denetimi: `rg -n -i "konfeti|confetti|zarf|envelope|gradient" src` → bulgu olmamalı (yalnızca CSS'te bilinçli kullanım gerekçeli olabilir).

**3. Kenar durumlar** (`npm run build && npm run start` sonrası `curl -s -o /dev/null -w "%{http_code}"`)
- `/k/`, `/k/abc`, `/k/%%%`, 3000 karakterlik `d`, geçerli base64 ama yanlış JSON, `v:2` → crash yok, nazik hata.
- Mesajı `<script>alert(1)</script>` olan kart düz metin görünüyor mu?
- Eski `z`'li linkler ve yeni `h`'li linkler açılıyor mu; `h=0`, `h=1000`, `h=abc` → 1'e düşüyor mu? `s` alanı bozuk/yabancı id ise oynatıcı nazik "süresi dolmuş" durumuna mı düşüyor?
- `DATABASE_URL` yoksa: `curl -X POST /api/ses` ve `/api/sayac` → 404.
- v3: `/k/<v:1 z'li>`, `/k/<v:2, 8 çıkartma, p>` 200; 9 çıkartmalı/aralık dışı/bilinmeyen türlü v:2 → açılır, fazlalar atılmış; `/k/<d>/story` ve `/k/xxx/story` → 200 `image/png`; `/t/xxx` nazik hata; `POST /api/ses` bozuk `X-Peaks` → 400, `X-Peaks`'siz → 201.

**4. Türkçe karakter**
- `lang="tr"`, fontlarda `latin-ext`, OG görselinde "ğşıİöüç" doğru mu? `toUpperCase()` yerine `toLocaleUpperCase('tr')`.

**5. Erişilebilirlik**
- Metin/arka plan kontrastı AA (4.5:1) — 4 temanın hepsi.
- Görünür odak (`focus-visible:`), tüm butonlar klavyeyle erişilebilir, ikon butonlarda `aria-label`.
- "Kopyalandı" gibi geri bildirimler `aria-live="polite"`.
- Animasyonlar `motion-safe:` / `prefers-reduced-motion` ile kapanabiliyor.
- Form alanlarında `<label>`.
- Ses oynatıcı klavyeyle kullanılabiliyor (boşluk/oklar), `aria-label` ve ilerleme değeri var; dalga formu yalnızca süs, bilgi tek başına renkle verilmiyor; ses yoksa yazı her zaman görünür.

## Çıktı formatı
En fazla 10 madde, önem sırasına göre. Her madde tek satır:
`[KRİTİK|ORTA|DÜŞÜK] dosya:satır — tek cümle sorun ve öneri`
Sorun yoksa: `Bulgu yok.` Sonunda tek satır: `Kritik: <n>, Orta: <n>, Düşük: <n>`.
