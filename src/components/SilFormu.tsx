"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

const abone = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};
const hashOku = () => window.location.hash.slice(1);

export default function SilFormu() {
  // Silme bilgisi URL fragment'inde: sunucuya, loglara ve Referer'a gitmez.
  const hash = useSyncExternalStore(abone, hashOku, () => "");
  const [durum, setDurum] = useState("");
  const [bitti, setBitti] = useState(false);

  const [id, token] = hash.split(".");
  const gecerli = /^[A-Za-z0-9_-]{22}$/.test(id ?? "") && /^[A-Za-z0-9_-]{20,64}$/.test(token ?? "");

  async function sil() {
    setDurum("Siliniyor…");
    try {
      const r = await fetch(`/api/ses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.status === 204) {
        setBitti(true);
        setDurum("Ses kaydın silindi.");
      } else if (r.status === 404) {
        setBitti(true);
        setDurum("Bu ses kaydı zaten yok: silinmiş ya da süresi dolmuş.");
      } else {
        setDurum("Silinemedi. Linki eksiksiz kopyaladığından emin olup tekrar dene.");
      }
    } catch {
      setDurum("Bağlantı kurulamadı. Biraz sonra tekrar dene.");
    }
  }

  return (
    <div className="mt-6">
      {gecerli ? (
        <>
          <p className="text-lg">Bu linkle ses kaydını istediğin an silebilirsin. Yazılı kartın etkilenmez.</p>
          <button
            type="button"
            onClick={sil}
            disabled={bitti}
            className="mt-5 rounded-full bg-stone-800 px-5 py-3 text-lg font-bold text-white disabled:bg-stone-300 disabled:text-stone-700"
          >
            Sesi sil
          </button>
        </>
      ) : (
        <p className="text-lg">Silme linki eksik ya da bozuk görünüyor. Paylaşırken kopyaladığın silme linkini kullan.</p>
      )}
      <p role="status" aria-live="polite" className="mt-4 min-h-6 font-semibold">
        {durum}
      </p>
      <Link href="/" className="mt-6 inline-block font-semibold underline underline-offset-4">
        SağOl&apos;a dön
      </Link>
    </div>
  );
}
