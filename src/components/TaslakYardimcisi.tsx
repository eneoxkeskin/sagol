"use client";

import { useState } from "react";
import { modelTaslaklari, taslaklar } from "@/lib/taslak";

export default function TaslakYardimcisi({ onSec }: { onSec: (metin: string) => void }) {
  const [acik, setAcik] = useState(false);
  const [ham, setHam] = useState("");
  const [oneriler, setOneriler] = useState<string[]>([]);
  const [bekliyor, setBekliyor] = useState(false);

  async function oner() {
    const sablon = taslaklar(ham);
    setOneriler(sablon);
    if (sablon.length === 0) return;
    setBekliyor(true);
    const model = await modelTaslaklari(ham);
    if (model) setOneriler(model);
    setBekliyor(false);
  }

  if (!acik) {
    return (
      <button
        type="button"
        onClick={() => setAcik(true)}
        className="rounded-full border-2 border-stone-400 bg-white px-3 py-1 text-sm font-semibold"
      >
        Nasıl başlayacağımı bilmiyorum
      </button>
    );
  }

  return (
    <section className="rounded-2xl border-2 border-stone-300 bg-white p-4">
      <label className="block font-bold">
        Ne hissettiğini kendi kelimelerinle yaz
        <input
          className="mt-1 w-full rounded-xl border-2 border-stone-400 bg-white px-3 py-2 text-base font-normal"
          value={ham}
          onChange={(e) => setHam(e.target.value)}
        />
      </label>
      <button
        type="button"
        onClick={oner}
        disabled={!ham.trim() || bekliyor}
        className="mt-3 rounded-full border-2 border-stone-700 px-4 py-2 font-bold disabled:border-stone-400 disabled:text-stone-700"
      >
        Taslak öner
      </button>
      <p className="mt-2 text-sm text-muted">Yazdıkların cihazından çıkmaz.</p>
      <ul className="mt-3 flex flex-col gap-2" aria-live="polite">
        {oneriler.map((s) => (
          <li key={s}>
            <button
              type="button"
              onClick={() => onSec(s)}
              className="w-full rounded-xl border-2 border-stone-300 px-3 py-2 text-left"
            >
              {s}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
