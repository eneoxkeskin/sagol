import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import AliciEkrani from "@/components/AliciEkrani";
import { decodeCard } from "@/lib/card";
import { peaksCoz } from "@/lib/halka";
import { sesAcik } from "@/lib/ozellik";
import { sesPeaks } from "@/lib/sesMeta";

export async function generateMetadata({
  params,
}: PageProps<"/k/[d]">): Promise<Metadata> {
  const { d } = await params;
  const kart = decodeCard(d);
  if (!kart) return { title: "SağOl" };
  return {
    title: `${kart.to} için bir teşekkür`,
    description: "Biri senin için kısa bir teşekkür yazdı.",
  };
}

async function KartGorunumu({ params }: Pick<PageProps<"/k/[d]">, "params">) {
  const { d } = await params;
  const kart = decodeCard(d);

  if (!kart) {
    return (
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
        <section className="mt-8 text-center">
          <h1 className="text-2xl font-extrabold">Bu kartı açamadık</h1>
          <p className="mt-3 text-lg text-muted">
            Link eksik ya da bozulmuş olabilir. İstersen yeni bir teşekkür yaz.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-full bg-stone-800 px-5 py-3 font-bold text-white"
          >
            Yeni kart yaz
          </Link>
        </section>
      </main>
    );
  }

  const ses = sesAcik();
  // Genlik kaynağı: karttaki p; yoksa (ve ses varsa) voices.peaks; o da yoksa tohum.
  const peaks = peaksCoz(kart.p) ?? (ses && kart.s ? await sesPeaks(kart.s) : null);
  return <AliciEkrani kart={kart} d={d} ses={ses} peaks={peaks} />;
}

export default function KartSayfasi({ params }: PageProps<"/k/[d]">) {
  return (
    <Suspense fallback={null}>
      <KartGorunumu params={params} />
    </Suspense>
  );
}
