---
name: run-milestone
description: SağOl'da PLAN.md'deki sıradaki milestone'u baştan sona uygular (uygula → lint/build/test → kutuyu işaretle → commit → kısa özet). Kullanıcı "milestone", "sıradaki adım", "M3'ü yap", "devam et" ya da "/run-milestone" dediğinde kullan.
---

# run-milestone

Soru sorma, onay isteme. Belirsizlikte makul varsayımı seç, PLAN.md "Kararlar"a 1 satır yaz, devam et.

## Adımlar
1. `PLAN.md`'yi oku. Argüman verildiyse (ör. `M3`) onu, yoksa ilk `[ ]` milestone'u seç. Hepsi `[x]` ise "Tüm milestone'lar bitti." de ve dur.
2. Yalnızca milestone'da adı geçen dosyaları ve bunların doğrudan import ettiklerini oku. Klasör taraması, README/doküman okuma yok. Next API'sinden emin değilsen `node_modules/next/dist/docs/` içinde tek hedefli grep.
3. Uygula. Mevcut dosyalarda Edit kullan, baştan yazma. Kapsam dışına çıkma; aklına gelen ek fikirleri Kararlar'a "(sonra)" diye yaz.
4. Doğrula, temiz olana kadar düzelt:
   - `npm run lint`
   - `npm run build`
   - `npm test` (script varsa)
5. "Bitti sayılır" ölçütlerini tek tek kontrol et (gerekirse build sonrası `npm run start` + `curl` ile).
6. `PLAN.md`'de milestone kutusunu `[x]` yap.
7. Tek commit: `git add -A && git commit -m "M<n>: <kısa özet>"`.
8. En fazla 5 satır Türkçe özet: ne yapıldı, alınan kararlar, kalan risk (varsa).

## Takılma kuralı
- Aynı hata 2 denemede çözülmezse dur, en basit çalışan alternatifi seç (özelliği sadeleştir, bağımlılıksız yolu kullan), Kararlar'a 1 satır yaz, devam et.
- Asla lint kuralını kapatarak, `// @ts-ignore` ya da `any` ile "geçirme". Tek istisna: satır bazlı, gerekçeli `eslint-disable-next-line` ve Kararlar'a not.
- Build kırık bırakılarak commit atılmaz.

## Her milestone'da değişmeyenler
- Etik ve güvenlik kuralları `CLAUDE.md`'de; ihlal eden kod yazma.
- Kullanıcı metni düz metin; URL verisi yalnızca `decodeCard` ile okunur.
- Türkçe metin, `[...s].length` ile uzunluk, `latin-ext` font.
