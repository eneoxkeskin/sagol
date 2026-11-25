"use client";

import { useState } from "react";
import { TEPKILER, type TepkiAnahtar } from "@/lib/tepki";

export default function TepkiSatiri({ gonderenEki }: { gonderenEki: string | null }) {
  const [secili, setSecili] = useState<TepkiAnahtar | null>(null);

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
            onClick={() => setSecili(secili === t.k ? null : t.k)}
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
    </section>
  );
}
