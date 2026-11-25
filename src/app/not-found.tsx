import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-12 text-center">
      <h1 className="text-2xl font-extrabold">Bu sayfayı bulamadık</h1>
      <p className="mt-3 text-lg text-muted">
        Adres yanlış olabilir. İstersen birine teşekkür yazarak başlayalım.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-full bg-stone-800 px-5 py-3 font-bold text-white"
      >
        Yeni kart yaz
      </Link>
    </main>
  );
}
