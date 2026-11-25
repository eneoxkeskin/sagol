import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import Kart from "@/components/Kart";
import KaydetDugmesi from "@/components/KaydetDugmesi";
import { decodeCard } from "@/lib/card";

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
    );
  }

  const sonraki = Math.min(kart.z + 1, 999);
  return (
    <section className="mt-6">
      <Kart
        to={kart.to}
        msg={kart.msg}
        from={kart.from}
        th={kart.th}
        className="motion-safe:animate-[zarf-ac_700ms_ease-out]"
      />
      {kart.z > 1 ? (
        <p className="mt-5 text-center text-lg">
          Bu teşekkür zincirin <strong>{kart.z}.</strong> halkası.
        </p>
      ) : null}
      <div className="mt-6 flex flex-col gap-3">
        <Link
          href={`/?z=${sonraki}`}
          className="rounded-full bg-stone-800 px-5 py-3 text-center font-bold text-white"
        >
          Sen de birine teşekkür et
        </Link>
        <KaydetDugmesi d={d} />
      </div>
    </section>
  );
}

export default function KartSayfasi({ params }: PageProps<"/k/[d]">) {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
      <Suspense fallback={null}>
        <KartGorunumu params={params} />
      </Suspense>
    </main>
  );
}
