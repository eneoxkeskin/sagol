import Link from "next/link";
import KaydetDugmesi from "@/components/KaydetDugmesi";
import SesOynatici from "@/components/SesOynatici";
import { yonelmeEki, type Kart, type Tema } from "@/lib/card";

const ZEMIN: Record<Tema, string> = {
  sabah: "bg-amber-100 text-amber-950",
  cay: "bg-emerald-100 text-emerald-950",
  deniz: "bg-sky-100 text-sky-950",
  lavanta: "bg-violet-100 text-violet-950",
};

const tarihBicimi = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  timeZone: "Europe/Istanbul",
});

export default function AliciEkrani({
  kart,
  d,
  ses = false,
}: {
  kart: Kart;
  d: string;
  ses?: boolean;
}) {
  const satirlar = kart.msg.split("\n").filter((s) => s.trim() !== "");
  const tarih = tarihBicimi.format(new Date(kart.t * 1000));
  const baglam = kart.from ? `${kart.from} · ${tarih}` : tarih;
  const sonraki = Math.min(kart.h + 1, 999);
  const geriDon = kart.from ? yonelmeEki(kart.from) : null;
  const karsilikHref = kart.from
    ? `/?to=${encodeURIComponent(kart.from)}&h=${sonraki}`
    : `/?h=${sonraki}`;

  return (
    <main
      className={`flex min-h-dvh flex-1 flex-col justify-between px-6 py-10 sm:px-12 ${ZEMIN[kart.th]}`}
    >
      <p className="text-base font-semibold sm:text-lg">
        {kart.to} için
      </p>

      <div className="mx-auto my-10 w-full max-w-4xl">
        <div className="text-[clamp(2rem,6vw+0.5rem,5rem)] font-extrabold leading-[1.1] [text-wrap:balance] [overflow-wrap:anywhere] hyphens-auto">
          {satirlar.map((s, i) => (
            <p
              key={i}
              className="mt-[0.4em] first:mt-0 motion-safe:animate-[belir_450ms_ease-out_backwards]"
              style={{ animationDelay: `${Math.min(i, 3) * 150}ms` }}
            >
              {s}
            </p>
          ))}
        </div>
        <p className="mt-8 text-lg font-semibold sm:text-xl">{baglam}</p>
        {ses && kart.s ? <SesOynatici id={kart.s} /> : null}
      </div>

      <div className="mx-auto w-full max-w-md">
        {kart.h > 1 ? (
          <p className="mb-4 text-center text-base">
            Bu teşekkür bir zincirin <strong>{kart.h}.</strong> halkası.
          </p>
        ) : null}
        <div className="flex flex-col gap-3">
          <Link
            href={karsilikHref}
            className="rounded-full bg-stone-900 px-5 py-4 text-center text-lg font-bold text-white"
          >
            {geriDon ? `${geriDon} karşılık ver` : "Karşılık ver"}
          </Link>
          {ses ? (
            <Link
              href={`${karsilikHref}${karsilikHref.includes("?") ? "&" : "?"}ses=1`}
              className="rounded-full border-2 border-stone-800 px-5 py-3 text-center font-bold"
            >
              Sesle karşılık ver
            </Link>
          ) : null}
          <KaydetDugmesi d={d} />
        </div>
        <p className="mt-6 flex justify-center gap-6">
          <Link href="/" className="text-sm font-semibold underline underline-offset-4">
            SağOl
          </Link>
          <Link href="/hakkinda" className="text-sm font-semibold underline underline-offset-4">
            Hakkında
          </Link>
        </p>
      </div>
    </main>
  );
}
