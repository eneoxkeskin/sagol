import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import SoundRing from "@/components/SoundRing";
import { tohum } from "@/lib/halka";
import { decodeTepki, tepkiBul } from "@/lib/tepki";

export async function generateMetadata({ params }: PageProps<"/t/[d]">): Promise<Metadata> {
  const { d } = await params;
  const t = decodeTepki(d);
  if (!t) return { title: "SağOl" };
  return {
    title: `${t.from ?? "Biri"} teşekkürüne tepki bıraktı`,
    description: "Teşekkürün ulaştı.",
  };
}

const link = "inline-flex min-h-11 items-center text-[15px] font-medium underline underline-offset-4";

async function TepkiGorunumu({ params }: Pick<PageProps<"/t/[d]">, "params">) {
  const { d } = await params;
  const t = decodeTepki(d);
  if (!t) {
    return (
      <section className="mt-16 text-center">
        <h1 className="font-baslik text-3xl font-semibold">Bu tepkiyi açamadık</h1>
        <p className="mt-3 text-lg text-ikincil">Link eksik ya da bozulmuş olabilir.</p>
        <Link
          href="/"
          className="mt-6 inline-flex h-14 items-center rounded-[28px] bg-vurgu px-6 text-lg font-bold text-vurgu-yazi"
        >
          Yeni kart yaz
        </Link>
      </section>
    );
  }
  const tepki = tepkiBul(t.e);
  return (
    <section className="mt-10 flex flex-col items-center text-center">
      {t.to ? <p className="font-baslik text-xl italic text-ikincil">Sevgili {t.to},</p> : null}
      <h1 className="mt-2 font-baslik text-[clamp(1.75rem,8vw,2.25rem)] font-semibold leading-tight [overflow-wrap:anywhere]">
        {t.from ?? "Biri"} teşekkürünü gördü ve bir tepki bıraktı.
      </h1>
      <div className="relative mt-8 flex size-[200px] items-center justify-center">
        <SoundRing size={200} n={44} strokeWidth={3.5} seed={tohum(t.from ?? "", t.e)} progress={1} colorOn="var(--murekkep)" ciz className="absolute inset-0" />
        <span className="text-6xl" role="img" aria-label={tepki?.ad ?? "Tepki"}>
          {tepki?.e}
        </span>
      </div>
      <p className="mt-6 text-ikincil">{tepki?.ad}</p>
      <Link
        href="/"
        className="mt-10 inline-flex h-14 w-full items-center justify-center rounded-[28px] bg-vurgu px-6 text-lg font-bold text-vurgu-yazi"
      >
        Sen de birine teşekkür et
      </Link>
      <p className="mt-4">
        <Link href="/hakkinda" className={link}>
          Hakkında
        </Link>
      </p>
    </section>
  );
}

export default function TepkiSayfasi({ params }: PageProps<"/t/[d]">) {
  return (
    <main className="flex min-h-dvh flex-1 flex-col px-6 pb-10 pt-6">
      <div className="mx-auto w-full max-w-[440px]">
        <header>
          <Link href="/" className="inline-flex min-h-11 items-center font-baslik text-xl font-semibold">
            SağOl
          </Link>
        </header>
        <Suspense fallback={null}>
          <TepkiGorunumu params={params} />
        </Suspense>
      </div>
    </main>
  );
}
