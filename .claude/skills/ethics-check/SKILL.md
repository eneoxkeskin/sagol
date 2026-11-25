---
name: ethics-check
description: SağOl için etik, güvenlik ve erişilebilirlik denetimi (karanlık desenler, XSS, URL doğrulama, bozuk linkler, Türkçe karakter, a11y). M6'da, deploy öncesi ya da kullanıcı "etik kontrol", "güvenlik kontrolü", "/ethics-check" dediğinde kullan. Sadece raporlar; düzeltmeyi çağıran yapar.
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
- Sayılar yalnızca kutlar mı? Boş durum suçlamadan mı yazılmış?

**2. Güvenlik**
- `rg -n "dangerouslySetInnerHTML|innerHTML|eval\(|new Function" src` → bulgu olmamalı.
- Kullanıcı metni `href`, `src`, `style` içine giriyor mu? (`wa.me` linkinde `encodeURIComponent` şart.)
- URL verisi yalnızca `decodeCard` ile mi okunuyor? Regex, 1200 sınırı, try/catch, şema ve uzunluk kontrolü var mı?
- localStorage okuması try/catch + şema kontrolü yapıyor mu?
- Sunucuda kart verisi `console.log`/dosyaya yazılıyor mu? Harici izleme betiği var mı?

**3. Kenar durumlar** (`npm run build && npm run start` sonrası `curl -s -o /dev/null -w "%{http_code}"`)
- `/k/`, `/k/abc`, `/k/%%%`, 3000 karakterlik `d`, geçerli base64 ama yanlış JSON, `v:2` → crash yok, nazik hata.
- Mesajı `<script>alert(1)</script>` olan kart düz metin görünüyor mu?

**4. Türkçe karakter**
- `lang="tr"`, fontlarda `latin-ext`, OG görselinde "ğşıİöüç" doğru mu? `toUpperCase()` yerine `toLocaleUpperCase('tr')`.

**5. Erişilebilirlik**
- Metin/arka plan kontrastı AA (4.5:1) — 4 temanın hepsi.
- Görünür odak (`focus-visible:`), tüm butonlar klavyeyle erişilebilir, ikon butonlarda `aria-label`.
- "Kopyalandı" gibi geri bildirimler `aria-live="polite"`.
- Animasyonlar `motion-safe:` / `prefers-reduced-motion` ile kapanabiliyor.
- Form alanlarında `<label>`.

## Çıktı formatı
En fazla 10 madde, önem sırasına göre. Her madde tek satır:
`[KRİTİK|ORTA|DÜŞÜK] dosya:satır — tek cümle sorun ve öneri`
Sorun yoksa: `Bulgu yok.` Sonunda tek satır: `Kritik: <n>, Orta: <n>, Düşük: <n>`.
