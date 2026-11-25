import type { Metadata } from "next";
import Link from "next/link";
import DefterSayfasi from "@/components/DefterSayfasi";

export const metadata: Metadata = {
  title: "Sakladıklarım — SağOl",
  description: "Yazdığın ve aldığın teşekkürler, yalnızca bu cihazda.",
};

export default function DefterPage() {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
      <h1 className="text-3xl font-extrabold leading-tight">Sakladıklarım</h1>
      <p className="mt-2 text-sm text-muted">
        Bu liste yalnızca bu cihazda durur.
      </p>
      <DefterSayfasi />
      <Link href="/" className="mt-8 inline-block font-semibold underline underline-offset-4">
        Yeni kart yaz
      </Link>
      <Link
        href="/hakkinda"
        className="mt-8 ml-6 inline-block font-semibold underline underline-offset-4"
      >
        Hakkında
      </Link>
    </main>
  );
}
