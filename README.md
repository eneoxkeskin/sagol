# SağOl

Birine 20 saniyede teşekkür yaz, paylaşılabilir bir kart linki al. Kartı açan kişi isterse zinciri sürdürür.

## Neden
Teşekkür etmek kolay ve iyi hissettirir ama çoğu zaman ertelenir. SağOl, bunu kısa bir forma ve tek bir linke indirir. Baskı, sayaç ya da kıyas yok.

## Mimari
- Next.js (App Router), TypeScript, Tailwind. Veritabanı, giriş ve ücretli API yok.
- Kart verisi URL'dedir: `/k/[d]`, `d` = JSON → UTF-8 → base64url. Her okuma `src/lib/card.ts` içindeki `decodeCard` ile doğrulanır; bozuk link nazik hata ekranı gösterir.
- Geçmiş ("Defter") yalnızca tarayıcının localStorage'ında durur (`sagol:v1:defter`).
- Paylaşım önizlemesi için `/k/[d]/opengraph-image` kartı PNG olarak çizer.

## Etik ilkeler
- Sahte aciliyet, suçluluk, kayıp korkusu, seri, sıralama, bildirim yok.
- Sayılar yalnızca kutlar; hiçbir zaman eksik göstermez.
- Sunucuda kullanıcı verisi saklanmaz ya da loglanmaz; analitik betiği yok.
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
