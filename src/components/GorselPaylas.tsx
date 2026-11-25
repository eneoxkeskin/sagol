"use client";

import { useState } from "react";

/** Story görselini Web Share (files) ile paylaşır; desteklenmiyorsa indirir. */
export default function GorselPaylas({ d }: { d: string }) {
  const [durum, setDurum] = useState("");
  const [mesgul, setMesgul] = useState(false);

  async function paylas() {
    setMesgul(true);
    setDurum("Görsel hazırlanıyor…");
    try {
      const r = await fetch(`/k/${d}/story`);
      if (!r.ok) throw new Error("görsel");
      const blob = await r.blob();
      const dosya = new File([blob], "sagol.png", { type: "image/png" });
      if (typeof navigator.canShare === "function" && navigator.canShare({ files: [dosya] })) {
        try {
          await navigator.share({ files: [dosya], title: "SağOl" });
          setDurum("Görsel paylaşıldı.");
        } catch {
          setDurum("");
        }
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "sagol.png";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setDurum("Görsel indirildi.");
      }
    } catch {
      setDurum("Görsel şu an hazırlanamadı. Biraz sonra tekrar dene.");
    } finally {
      setMesgul(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={paylas}
        disabled={mesgul}
        className="inline-flex min-h-11 items-center text-[15px] font-medium underline underline-offset-4 disabled:opacity-60"
      >
        Görsel olarak paylaş
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {durum}
      </span>
    </>
  );
}
