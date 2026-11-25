# SağOl

Birine 20 saniyede teşekkür yaz, paylaşılabilir bir kart linki al. Kartı açan kişi isterse zinciri sürdürür.

## Neden
Teşekkür etmek kolay ve iyi hissettirir ama çoğu zaman ertelenir. SağOl, bunu kısa bir forma ve tek bir linke indirir. Baskı, sayaç ya da kıyas yok.

## Mimari
- Next.js (App Router), TypeScript, Tailwind. Giriş ve ücretli API yok. Veritabanı (Neon Postgres) yalnızca isteğe bağlı sesli teşekkür ve anonim günlük sayaç içindir; `DATABASE_URL` yoksa bu özellikler kapalıdır.
- Kart verisi URL'dedir: `/k/[d]`, `d` = JSON → UTF-8 → base64url. Her okuma `src/lib/card.ts` içindeki `decodeCard` ile doğrulanır; bozuk link nazik hata ekranı gösterir.
- Geçmiş ("Sakladıklarım") yalnızca tarayıcının localStorage'ında durur (`sagol:v1:defter`).
- Paylaşım önizlemesi için `/k/[d]/opengraph-image` kartı PNG olarak çizer; `/k/[d]/story` 1080×1920 story görselidir.
- Kartın kimliği "ses halkası" (`src/lib/halka.ts` + `SoundRing`): sesli kartta 48 gerçek genlik (`p`), sessizde isim+mesaj tohumu. Aynı saf geometri DOM'da, OG'de ve story'de kullanılır.
- Kart verisi v:2: `p` (genlikler) ve `st` (en çok 8 çıkartma, allowlist + aralık kontrolü). v:1 linkleri aynen açılır.
- Tepki linki `/t/[d]`: seçilen tepki ve isimler linkin içinde, sunucuda saklanmaz.
- Tasarım: `docs/DESIGN-V3.md` (Fraunces + DM Sans, 4 tema token'ı, ≥44px dokunma, ≥4.5:1 kontrast, `prefers-reduced-motion`).

## Etik ilkeler
- Sahte aciliyet, suçluluk, kayıp korkusu, seri, sıralama, bildirim yok.
- Sayılar yalnızca kutlar; hiçbir zaman eksik göstermez.
- Sunucuda yalnızca 7 gün saklanan ses kayıtları ve anonim günlük sayaç tutulur; mesaj metni, ad, IP ya da konum saklanmaz. Analitik betiği yok.
- Kullanıcı metni her zaman düz metin olarak gösterilir.

## Yerel çalıştırma
```
npm install
npm run dev     # http://localhost:3000
npm test
npm run lint
npm run build
```

## Canlı URL
- Canlı: https://sagol-theta.vercel.app
- Kod: https://github.com/eneoxkeskin/sagol
