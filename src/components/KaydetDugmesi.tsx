"use client";

import { ekle } from "@/lib/defter";
import { useDefter } from "@/lib/useDefter";

export default function KaydetDugmesi({ d }: { d: string }) {
  const liste = useDefter();
  const kayitli = liste.some((k) => k.d === d);

  return (
    <>
      <button
        type="button"
        disabled={kayitli}
        onClick={() => ekle("alinan", d)}
        className="rounded-full border-2 border-stone-800 px-5 py-3 text-center font-bold disabled:border-stone-600 disabled:text-stone-800"
      >
        {kayitli ? "Sakladıklarında" : "Sakladıklarım'a ekle"}
      </button>
      <p role="status" aria-live="polite" className="min-h-6 text-center font-semibold">
        {kayitli ? "Sakladıklarına eklendi." : ""}
      </p>
    </>
  );
}
