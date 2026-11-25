import Link from "next/link";
import CikartmaKatmani from "@/components/CikartmaKatmani";
import HalkaOynatici from "@/components/HalkaOynatici";
import { KART_HALKA, KART_ORAN } from "@/lib/cikartma";
import KaydetDugmesi from "@/components/KaydetDugmesi";
import TepkiSatiri from "@/components/TepkiSatiri";
import { yonelmeEki, type Kart } from "@/lib/card";
import { tohum } from "@/lib/halka";

const tarihBicimi = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  timeZone: "Europe/Istanbul",
});

const HALKA = 220;
const KUTU_G = HALKA / KART_HALKA.w;
const KUTU_Y = KUTU_G * KART_ORAN;
const HALKA_MERKEZ_Y = KART_HALKA.y * KUTU_Y + (KART_HALKA.w * KUTU_G) / 2;

const kucukLink ="inline-flex min-h-11 items-center text-[15px] font-medium underline underline-offset-4";

/** Alıcı ekranı (docs/DESIGN-V3.md · D). */
export default function AliciEkrani({
  kart,
  d,
  ses = false,
  peaks = null,
}: {
  kart: Kart;
  d: string;
  ses?: boolean;
  peaks?: number[] | null;
}) {
  const tarih = tarihBicimi.format(new Date(kart.t * 1000));
  const sonraki = Math.min(kart.h + 1, 999);
  const gonderenEki = kart.from ? yonelmeEki(kart.from) : null;
  const karsilikHref = kart.from
    ? `/?to=${encodeURIComponent(kart.from)}&h=${sonraki}`
    : `/?h=${sonraki}`;

  return (
    <main data-tema={kart.th} className="flex min-h-dvh flex-1 flex-col overflow-x-clip px-6 pb-10 pt-6">
      <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col">
        <header className="flex items-baseline justify-between">
          <Link href="/" className="font-baslik text-xl font-semibold">
            SağOl
          </Link>
          <span className="text-sm text-ikincil">{tarih}</span>
        </header>

        <h1 className="mt-8 font-baslik text-[clamp(2rem,9vw,2.5rem)] font-semibold leading-[1.1] [text-wrap:balance] [overflow-wrap:anywhere]">
          {kart.from ? `${kart.from} sana teşekkür ediyor.` : "Biri sana teşekkür ediyor."}
        </h1>

        <div className="mt-8 flex justify-center">
          <div className="relative">
            <HalkaOynatici
              id={ses ? kart.s : undefined}
              peaks={peaks}
              seed={tohum(kart.to, kart.msg)}
              size={HALKA}
            />
            {kart.st ? (
              // Çıkartmalar kart kutusuna oransal: kutuyu, içindeki halka bu halkayla çakışacak şekilde yerleştir.
              <div
                className="pointer-events-none absolute"
                style={{ width: KUTU_G, height: KUTU_Y, left: HALKA / 2 - KUTU_G / 2, top: HALKA / 2 - HALKA_MERKEZ_Y }}
              >
                <CikartmaKatmani st={kart.st} />
              </div>
            ) : null}
          </div>
        </div>

        <figure className="mt-8 text-center">
          <p className="text-[15px] text-ikincil">Sevgili {kart.to},</p>
          <blockquote className="mt-2 whitespace-pre-line font-baslik text-xl italic leading-snug [overflow-wrap:anywhere]">
            {kart.msg}
          </blockquote>
          {kart.from ? <figcaption className="mt-3 font-baslik italic text-ikincil">— {kart.from}</figcaption> : null}
        </figure>

        <TepkiSatiri gonderenEki={gonderenEki} />

        {ses ? (
          <p className="mt-3 text-center">
            <Link href={`${karsilikHref}&ses=1`} className={kucukLink}>
              Sesle karşılık ver
            </Link>
          </p>
        ) : null}

        <div className="mt-8 flex flex-col items-center gap-1 text-center">
          {kart.h > 1 ? (
            <p className="text-sm text-ikincil">
              Bu teşekkür bir zincirin <strong>{kart.h}.</strong> halkası.
            </p>
          ) : null}
          <div className="flex flex-wrap justify-center gap-x-5">
            <Link href={karsilikHref} className={kucukLink}>
              Yazıyla karşılık ver
            </Link>
            <KaydetDugmesi d={d} />
            <Link href="/hakkinda" className={kucukLink}>
              Hakkında
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
