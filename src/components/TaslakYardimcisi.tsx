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
        className="inline-flex min-h-11 items-center text-[15px] font-medium underline underline-offset-4"
      >
        Nasıl başlayacağımı bilmiyorum
      </button>
    );
  }

  return (
    <section className="rounded-[22px] bg-kutu p-4">
      <label className="block font-bold">
        Ne hissettiğini kendi kelimelerinle yaz
        <input
          className="mt-1 min-h-11 w-full rounded-[22px] border-2 border-murekkep bg-transparent px-3 py-2 text-base font-normal"
          value={ham}
          onChange={(e) => setHam(e.target.value)}
        />
      </label>
      <button
        type="button"
        onClick={oner}
        disabled={!ham.trim() || bekliyor}
        className="mt-3 inline-flex min-h-11 items-center rounded-[22px] border-2 border-murekkep px-4 font-bold disabled:opacity-50"
      >
        Taslak öner
      </button>
      <p className="mt-2 text-sm text-ikincil">Yazdıkların cihazından çıkmaz.</p>
      <ul className="mt-3 flex flex-col gap-2" aria-live="polite">
        {oneriler.map((s) => (
          <li key={s}>
            <button
              type="button"
              onClick={() => onSec(s)}
              className="min-h-11 w-full rounded-[22px] border-2 border-murekkep px-3 py-2 text-left"
            >
              {s}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
