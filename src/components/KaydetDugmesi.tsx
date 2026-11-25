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
        className="inline-flex min-h-11 items-center text-[15px] font-medium underline underline-offset-4 disabled:no-underline"
      >
        {kayitli ? "Sakladıklarında" : "Sakladıklarım'a ekle"}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {kayitli ? "Sakladıklarına eklendi." : ""}
      </span>
    </>
  );
}
