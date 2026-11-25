import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-12 text-center">
      <h1 className="text-2xl font-baslik font-semibold">Bu sayfayı bulamadık</h1>
      <p className="mt-3 text-lg text-ikincil">
        Adres yanlış olabilir. İstersen birine teşekkür yazarak başlayalım.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-14 items-center justify-center rounded-[28px] bg-vurgu px-6 text-lg font-bold text-vurgu-yazi"
      >
        Yeni kart yaz
      </Link>
    </main>
  );
}
