import type { Metadata } from "next";
import Link from "next/link";
import { sesAcik } from "@/lib/ozellik";

export const metadata: Metadata = {
  title: "Hakkında — SağOl",
  description: "Neleri saklıyoruz, neleri saklamıyoruz, nasıl yapıldı.",
};

const h2 = "mt-10 text-xl font-baslik font-semibold";
const liste = "mt-3 list-disc space-y-2 pl-6 text-lg leading-relaxed";

export default function Hakkinda() {
  const ses = sesAcik();
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
      <h1 className="text-3xl font-baslik font-semibold leading-tight">Hakkında</h1>
      <p className="mt-3 text-lg leading-relaxed">
        SağOl, birine kısa bir teşekkür yazmanın (ya da söylemenin) en az
        sürtünmeli yolu olmaya çalışıyor. Bu sayfa, bunun için neyi nasıl
        yaptığımızı açıkça anlatıyor.
      </p>

      <h2 className={h2}>Neleri saklıyoruz</h2>
      <ul className={liste}>
        <li>
          <strong>Ses kaydı:</strong>{" "}
          {ses
            ? "Sesli teşekkür eklersen kayıt 7 gün saklanır, sonra kalıcı olarak silinir. Gönderen olarak sen, silme linkiyle istediğin an silebilirsin."
            : "Sesli teşekkür henüz etkin değil. Açıldığında kayıt 7 gün saklanacak, sonra kalıcı olarak silinecek ve gönderen istediği an silebilecek."}
        </li>
        <li>
          <strong>Günlük sayaç:</strong>{" "}
          {ses
            ? "Ana sayfadaki “Bugün N teşekkür edildi” için yalnızca tarih ve bir sayı tutulur. Kimin, kime, ne yazdığı yoktur."
            : "Günlük teşekkür sayacı henüz etkin değil. Açıldığında yalnızca tarih ve bir sayı tutulacak."}
        </li>
        <li>
          <strong>Cihazında:</strong> Sakladıklarım listesi yalnızca tarayıcının
          yerel deposunda durur. İstediğin zaman tek tek ya da toptan silebilirsin.
        </li>
      </ul>

      <h2 className={h2}>Neleri saklamıyoruz</h2>
      <ul className={liste}>
        <li>Yazdığın mesaj, kimden/kime adları. Bunlar yalnızca paylaştığın linkin içindedir, sunucuya gitmez.</li>
        <li>IP adresi, konum, çerez, analitik ya da izleme betiği.</li>
        <li>Seri, sıralama, bildirim: seni geri çağıran hiçbir mekanizma yok.</li>
      </ul>

      <h2 className={h2}>Silme hakkın ve aydınlatma</h2>
      <p className="mt-3 text-lg leading-relaxed">
        Saklanan tek kişisel veri türü, istersen eklediğin ses kaydıdır. Amaç, kaydı
        alıcıya iletmektir; süre 7 gündür. Kaydı oluşturduğunda aldığın silme
        linkiyle (KVKK kapsamındaki silme talebin dahil) sen silebilirsin. Soruların için{" "}
        <a
          href="https://github.com/eneoxkeskin/sagol/issues"
          className="font-semibold underline underline-offset-4"
          rel="noopener noreferrer"
        >
          GitHub’da bir konu açabilirsin
        </a>
        .
      </p>

      <h2 className={h2}>Nasıl yapıldı</h2>
      <ul className={liste}>
        <li>Kartın tamamı linkin içinde: mesaj sunucuya değil, URL’ye kodlanır. Linki alan kartı görür.</li>
        <li>Geçmiş cihazda: hesap yok, liste yalnızca tarayıcında durur. Eski kayıtlar şema kontrolüyle okunur, bozuksa boş liste.</li>
        <li>Ses ve sayaç, veritabanı bağlantısı varsa açılan bir özellik; yoksa arayüzde hiç görünmez, gerisi çalışır.</li>
        <li>Ses: en çok 20 sn, küçük boyut, tahmin edilemez id, listeleme yok, süre dolunca silinir.</li>
        <li>Hareket yalnızca anlam taşıyorsa var ve “hareketi azalt” ayarına uyar; otomatik ses ya da titreşim yok.</li>
        <li>
          Ses halkası: kaydın 20 saniyesi 48 dilime bölünür, her dilimin en yüksek sesi bir çubuk olur. Bu 48 sayı
          kartın linkinde taşınır; ses 7 gün sonra silinse de kartın halkası aynı kalır. Sesi olmayan kartlarda halka,
          isim ve mesajdan üretilir: iki kart aynı görünmez.
        </li>
        <li>
          Story ve paylaşım görseli yalnızca kartta zaten görünenleri içerir: isimler, tarih, mesajın başı, halka ve
          çıkartmalar. Ses kaydı, silme linki ya da başka bir bilgi görselde yer almaz.
        </li>
        <li>Tepkiler de bir linktir: seçtiğin tepki yalnızca linkin içinde durur, sunucuda saklanmaz.</li>
      </ul>

      <p className="mt-10 flex gap-6">
        <Link href="/" className="inline-flex min-h-11 items-center font-medium underline underline-offset-4">
          Yeni kart yaz
        </Link>
        <Link href="/sakladiklarim" className="inline-flex min-h-11 items-center font-medium underline underline-offset-4">
          Sakladıklarım
        </Link>
      </p>
    </main>
  );
}
