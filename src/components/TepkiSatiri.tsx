"use client";

import { useState } from "react";
import { TEPKILER, encodeTepki, tepkiBul, type TepkiAnahtar } from "@/lib/tepki";

/** Alıcı ekranındaki tepki satırı (docs/DESIGN-V3.md · H). Tepki sunucuya gitmez; bir link olarak paylaşılır. */
export default function TepkiSatiri({
  gonderen,
  gonderenEki,
  alici,
}: {
  gonderen?: string;
  gonderenEki: string | null;
  alici: string;
}) {
  const [secili, setSecili] = useState<TepkiAnahtar | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [durum, setDurum] = useState("");

  function linkUret(e: TepkiAnahtar) {
    const d = encodeTepki({
      v: 1,
      e,
      t: Math.floor(Date.now() / 1000),
      ...(gonderen ? { to: gonderen } : {}),
      from: alici,
    });
    return `${window.location.origin}/t/${d}`;
  }

  async function gonder() {
    if (!secili) return;
    const url = linkUret(secili);
    setLink(url);
    const tepki = tepkiBul(secili);
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: "Teşekkürüne bir tepki", text: `Teşekkürüne ${tepki?.e ?? ""} ile karşılık verdim:`, url });
        setDurum("Tepkin paylaşıldı.");
      } catch {
        // vazgeçildi; aşağıdaki seçenekler duruyor
      }
    }
  }

  async function kopyala() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setDurum("Kopyalandı");
    } catch {
      setDurum("Kopyalanamadı; linki elle seçip kopyalayabilirsin.");
    }
  }

  const tepki = tepkiBul(secili);
  const wa = link ? `https://wa.me/?text=${encodeURIComponent(`Teşekkürüne ${tepki?.e ?? ""} ile karşılık verdim: ${link}`)}` : null;

  return (
    <section aria-labelledby="tepki-baslik" className="mt-8 flex flex-col items-center">
      <p id="tepki-baslik" className="text-[15px] text-ikincil">
        {gonderenEki ? `${gonderenEki} bir tepki bırak` : "Bir tepki bırak"}
      </p>
      <div className="mt-3 flex gap-2" role="group" aria-labelledby="tepki-baslik">
        {TEPKILER.map((t) => (
          <button
            key={t.k}
            type="button"
            aria-pressed={secili === t.k}
            aria-label={t.ad}
            onClick={() => {
              setSecili(secili === t.k ? null : t.k);
              setLink(null);
              setDurum("");
            }}
            className={`flex size-14 items-center justify-center rounded-full bg-kutu text-2xl ${
              secili === t.k ? "ring-[3px] ring-vurgu ring-offset-2 ring-offset-zemin" : ""
            }`}
          >
            <span aria-hidden="true">{t.e}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        disabled={!secili}
        onClick={gonder}
        aria-describedby={secili ? undefined : "tepki-ipucu"}
        className="mt-6 h-14 w-full rounded-[28px] bg-vurgu px-6 text-lg font-bold text-vurgu-yazi disabled:opacity-50"
      >
        {gonderenEki ? `${gonderenEki} gönder` : "Gönder"}
      </button>
      {!secili ? (
        <p id="tepki-ipucu" className="mt-2 text-sm text-ikincil">
          Önce bir tepki seç.
        </p>
      ) : null}
      {link && wa ? (
        <div className="mt-3 flex flex-wrap justify-center gap-x-5">
          <p className="w-full text-center text-sm text-ikincil">
            {gonderen ? `Linki ${gonderenEki ?? gonderen} gönder:` : "Linki teşekkür edene gönder:"}
          </p>
          <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-[15px] font-medium underline underline-offset-4">
            WhatsApp
          </a>
          <button type="button" onClick={kopyala} className="inline-flex min-h-11 items-center text-[15px] font-medium underline underline-offset-4">
            Linki kopyala
          </button>
        </div>
      ) : null}
      <p role="status" aria-live="polite" className="mt-1 min-h-6 text-sm font-medium">
        {durum}
      </p>
    </section>
  );
}
