import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SilFormu from "@/components/SilFormu";
import { sesAcik } from "@/lib/ozellik";

export const metadata: Metadata = {
  title: "Ses kaydını sil — SağOl",
  robots: { index: false, follow: false },
};

export default function SilSayfasi() {
  if (!sesAcik()) notFound();
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
      <h1 className="text-3xl font-baslik font-semibold leading-tight">Ses kaydını sil</h1>
      <SilFormu />
    </main>
  );
}
