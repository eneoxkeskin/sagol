# SağOl — proje kuralları

Birine 20 sn'de teşekkür yaz → paylaşılabilir kart linki → alan kişi zinciri sürdürür. Plan: `PLAN.md`.

## Yığın
- Next.js 16 (App Router, `src/`), TypeScript strict, Tailwind v4. `params`/`searchParams` Promise'tir (`await`).
- Veritabanı, giriş, ücretli API yok. Kart verisi URL'de: `/k/[d]`, `d` = JSON → UTF-8 → base64url.
- Geçmiş yalnızca localStorage (`sagol:v1:defter`). Yeni bağımlılık ekleme (gerekirse önce Kararlar'a yaz).
- Test: `npm test` (= `node --test src/**/*.test.ts`, Node'un yerleşik TS desteği; ek paket yok).
- Next API'sinden emin değilsen yalnızca ilgili dosyayı `node_modules/next/dist/docs/` içinde grep'le.

## Çalışma kuralları
- Türkçe ve kısa yaz. Soru sorma, onay isteme; belirsizlikte makul varsayım + PLAN.md "Kararlar"a 1 satır.
- Sadece aktif milestone (PLAN.md'de ilk `[ ]`). Kapsam dışı fikirleri yapma, Kararlar'a not düş.
- Dosyayı baştan yazma; mevcut dosyada Edit kullan. Gereksiz keşif yok: yalnızca ilgili dosyaları oku.
- Bitirmeden `npm run lint` ve `npm run build` temiz olmalı (varsa `npm test` de).
- Milestone sonunda tek commit: `M<n>: <kısa özet>`.
- Aynı hata 2 denemede çözülmezse en basit çalışan alternatifi seç, Kararlar'a yaz, devam et.

## Etik (ihlal edilemez)
- Sahte aciliyet, suçluluk yaratan metin, kayıp korkusu, seri/streak ve "bozuldu" cezası, sonsuz kaydırma, push/bildirim, kıyaslama/sıralama YOK.
- Sayılar yalnızca kutlar, hiçbir zaman eksik göstermez ("0 teşekkür" yazma). Kullanıcı kapattığında iyi hissetmeli.
- Paylaşım gerçek bir sebebe dayanır; gönderene ya da alana baskı yapan metin yok.

## Güvenlik ve gizlilik
- Sunucuda kullanıcı verisi saklanmaz, loglanmaz. Analitik/izleme betiği yok.
- Kullanıcı metni her zaman düz metin olarak render edilir: `dangerouslySetInnerHTML` yasak, linkler tıklanabilir yapılmaz.
- URL verisi her zaman `src/lib/card.ts` içindeki `decodeCard` ile doğrulanır; bozuk/uzun/boş → nazik hata ekranı, asla crash.
- localStorage okuması try/catch + şema kontrolü ile yapılır.

## Dil ve ton
- Arayüz Türkçe, sıcak, kısa; "sen" diliyle. Ünlem ve emoji ölçülü.
- Türkçe karakterler (ğ ş ı İ ö ü ç) her yerde çalışmalı: fontlarda `latin-ext`, `lang="tr"`, `toLocaleUpperCase('tr')`, uzunluk `[...s].length` ile.
- Erişilebilirlik: AA kontrast, görünür odak, `aria-live` geri bildirim, `prefers-reduced-motion` saygısı.
