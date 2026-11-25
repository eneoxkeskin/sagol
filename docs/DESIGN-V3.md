# SağOl v3 — Tasarım Spesifikasyonu

## İlkeler
- Kartın kimliği: sesin dalga formundan üretilen dairesel "ses halkası". Ses yoksa halka mesaj+isim hash'inden üretilir. İki kart aynı görünmez.
- Klişe yok: zarf, konfeti, gradyan dalgalar, sol kenarlıklı kartlar. Arayüz ikonlarında emoji yok (yalnızca kullanıcının seçtiği emoji çıkartmaları ve tepkiler emoji olabilir).
- Tipografi: başlık/isim/alıntı Fraunces (600; alıntı italic 400), arayüz DM Sans (400/500/700). next/font ile, latin + latin-ext (ğ ş ı İ ö ü ç).
- Dokunma hedefi ≥44px, metin kontrastı ≥4.5:1, hareket `prefers-reduced-motion`'a saygılı, ses asla otomatik çalmaz.
- Köşeler: kart 28, birincil buton 28 (yükseklik 56), çip/sekme 22. Telefon temel genişlik 390; geniş ekranda içerik ortalı, en çok 440px.

## Temalar (4)
- Sabah: zemin #FFD23F, mürekkep #1B1306, ikincil #4A3A0C
- Çay: zemin #12372A, yazı #F6EBD3, vurgu #F2C14E, ikincil #BFD0C4
- Deniz: zemin #BFE0F5, mürekkep #0F2A3F, kutu #F4FAFF, ikincil #35566F
- Lavanta: zemin #D8CCF7, mürekkep #22123F, ikincil #4A3A78
- Uygulama zemini (tema dışı sayfalar): krem #FFF8EA, mürekkep #2B1D12, ikincil #6B5A48

## Ses halkası (`SoundRing`, SVG)
Props: size, r0, maxLen, n (çubuk sayısı), strokeWidth, progress (0..1), colorOn, colorOff, offOpacity, peaks?: number[] (0..1, uzunluk n), seed?: number.
Çizim: i = 0..n-1, açı t = 2π·i/n − π/2 (tepeden, saat yönü). Genlik a: peaks varsa peaks[i]; yoksa tohumlu: a = 0.42 + 0.58·|sin(i·0.37)·cos(i·0.11) + 0.35·sin(i·1.3)| çarpı (0.8 + 0.4·rnd(seed)), [0.16, 1] aralığına kırp. Çubuk: (r0 → r0 + 4 + (maxLen − 4)·a) çizgisi, stroke-linecap round. i/n < progress ise colorOn, aksi hâlde colorOff (offOpacity ile).
Örnek boyutlar: alıcı ekranı size 170-230 (r0 ≈ 0.29·size, maxLen ≈ 0.49·size, n 44-56, strokeWidth 3.5-4); story görseli size ≈ 830 (1080 genişlikte); küçük sürüm size 56 (n 22, strokeWidth 2.5).
Oynatma: progress = audio.currentTime / duration (rAF). Kayıt: AnalyserNode genliği halkanın çubuklarını canlı büyütür; ilerleme = süre / 20 sn; kayıt bitince 48 genlik örneği (0..1) kartla birlikte saklanır (`voices.peaks`). Metin kartı: seed = (isim + mesaj) hash'i; yalnızca sakin bir "çizilerek belirme" (≈600 ms, reduced-motion'da yok).

## D — Alıcı ekranı (`/k/[d]`)
Tema zemini tam ekran. Üst: "SağOl" (Fraunces 20/600) solda, tarih sağda (14px, ikincil). Başlık: "<Gönderen> sana teşekkür ediyor." (Fraunces 36-40/600, 2 satır). Ortada halka; merkezde 56-68px yuvarlak oynat butonu + süre (13-14px). Gönderenin çıkartmaları halkanın çevresinde, kartta kaydedilen konumlarda. Altında alıntı (Fraunces italic 18-22, ortalı). "<Gönderen>'e bir tepki bırak" (15px, ikincil) + 5 tepki butonu (💛 🥹 😂 🫶 🙏; 56px yuvarlak; seçili olan vurgu halkalı). Birincil buton "<Gönderen>'e gönder" (vurgu rengi, 56px). İkincil: "Sesle karşılık ver" (altı çizili metin). Ses yoksa halka mesaj tohumundan çizilir, merkezde oynat yerine "Teşekkür" yazısı.

## F — Yaz ve kaydet (`/`)
Tema zeminli, form değil "sayfaya yaz" hissi. Üst: "SağOl" solda, tema seçici sağda (4 nokta, seçili olan kalın çerçeveli, 44px dokunma alanı). "Sevgili" (Fraunces italic 24, ikincil) + dev isim alanı (Fraunces 64/600, örnek "Annem,"), mesaj alanı (DM Sans 24/1.35, ~3 satır), "— <Gönderen>" (Fraunces italic 22, sağa). Altta halka (220px): merkezde 64px durdur/kaydet butonu ve "0:12 / 0:20"; altında "Ses 7 gün saklanır, istediğin zaman silebilirsin." En altta "Kartı oluştur" (56px). Ses opsiyonel; kayıt yoksa halka yerine "Sesle ekle" butonu görünür.

## G — Çıkartma ("Kartını süsle" adımı)
342×380 kart önizlemesi (tema zemini, merkezde halka 200px, isim, alıntı, imza). Çıkartmalar kartın üstüne serbest yerleşir; seçili olanın etrafında kesikli çerçeve, sil (×) ve döndür/büyüt tutamaçları (44px dokunma alanı). Altta sekmeler "Çıkartmalar | Emoji". Tepsi: Kalp, Yıldız, Parıltı, Çiçek, Güneş, Yaprak (52px düğme, 32px SVG; ince koyu çizgili düz şekiller: kalp #E5484D, yıldız beyaz, parıltı mürekkep, çiçek #FF8FB1 + sarı merkez, güneş #FF9F1C, yaprak #2E7D4F). İpucu: "Sürükle · iki parmakla döndür ve büyüt". En çok 8 çıkartma. Kart verisi: her çıkartma `{k: tür, x: 0..1, y: 0..1, r: derece, s: 0.5..2}`; kart verisi v:2, v:1 linkleri çalışmaya devam eder. Sürükleme/döndürme/büyütme pointer event'leriyle, kütüphanesiz.

## H — Tepki
Alıcı ekranında (D) tepki satırı. "Gönder" göndericiye gidecek mini bir tepki kartı linki üretir (`/t/[d]`: gönderenin adı, tepki emojisi, OG görseli) ve paylaşım menüsünü (Web Share / WhatsApp) açar. Sunucuda saklanmaz.

## E — Story görseli (9:16)
`/k/[d]/story` (next/og), 1080×1920. Tema zemini; üstte "<Gönderen>'ten <Alıcı>'ya" + tarih; ortada dev halka (~830px), merkezde "Sevgili / <Alıcı>" (Fraunces); altta alıntı (Fraunces italic); en altta "sagol-theta.vercel.app" ve "Sen de birine teşekkür et". Çıkartmalar da görselde. Kartta "Görsel olarak paylaş" butonu: görseli indirir veya Web Share (files) ile paylaşır. OG görseli (1200×630) aynı halka kimliğini kullanır. Emoji çıkartmaları için next/og emoji ayarı.

## Hareket
Halka çizilerek belirme ~600 ms ease-out (çubuklar hafif kademeli); oynatmada ilerleme; çıkartma yerleşirken 200 ms ölçek pop'u. Hepsi reduced-motion'da kapalı veya anlık.
