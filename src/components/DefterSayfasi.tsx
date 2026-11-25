"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import Kart from "@/components/Kart";
import { kesKodNoktasi, kodNoktasiUzunlugu } from "@/lib/card";
import { sil, tumunuSil, type DefterKaydi } from "@/lib/defter";
import { useDefter } from "@/lib/useDefter";

const HAFTA = 7 * 24 * 60 * 60;

function ozet(liste: DefterKaydi[], simdi: number): string {
  const hafta = liste.filter((k) => k.at >= simdi - HAFTA);
  const giden = hafta.filter((k) => k.tur === "gonderilen");
  const gelen = hafta.filter((k) => k.tur === "alinan");
  const parcalar: string[] = [];
  if (giden.length > 0) {
    const adlar = [...new Set(giden.map((k) => k.kart.to))];
    const goster = adlar.slice(0, 5).join(", ") + (adlar.length > 5 ? " ve diğerleri" : "");
    parcalar.push(`Bu hafta ${adlar.length} kişiye teşekkür ettin: ${goster}.`);
  }
  if (gelen.length > 0) parcalar.push(`${gelen.length} teşekkür aldın.`);
  return parcalar.length > 0 ? parcalar.join(" ") : "Aklına biri gelirse burası hazır.";
}

function onizleme(s: string): string {
  return kodNoktasiUzunlugu(s) > 80 ? `${kesKodNoktasi(s, 80)}…` : s;
}

// Saat başına yuvarlanmış "şimdi": sabit bir sayı döner, render sırasında Date.now çağrılmaz.
const bosAbone = () => () => {};
const saatSnapshot = () => Math.floor(Date.now() / 3600000) * 3600;

const SEKMELER = [
  ["gonderilen", "Gönderdiklerim"],
  ["alinan", "Aldıklarım"],
] as const;

const tarihBicimi = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  timeZone: "Europe/Istanbul",
});

const kucuk = "rounded-full border-2 border-stone-600 px-3 py-1 text-sm font-semibold";

export default function DefterSayfasi() {
  const liste = useDefter();
  const simdi = useSyncExternalStore(bosAbone, saatSnapshot, () => 0);
  const [sekme, setSekme] = useState<DefterKaydi["tur"]>("gonderilen");
  const [secilen, setSecilen] = useState<string | null>(null);
  const [onay, setOnay] = useState(false);

  const gorunen = liste.filter((k) => k.tur === sekme);
  const gecmis = liste.find((k) => k.id === secilen) ?? null;

  function rastgele() {
    const aday = liste.filter((k) => k.id !== secilen);
    if (aday.length === 0) return;
    setSecilen(aday[Math.floor(Math.random() * aday.length)].id);
  }

  return (
    <div className="mt-6">
      <p className="text-lg" aria-live="polite">
        {ozet(liste, simdi)}
      </p>

      {liste.length >= 1 ? (
        <section className="mt-6">
          <button type="button" onClick={rastgele} className={kucuk}>
            Rastgele bir güzel söz göster
          </button>
          {gecmis ? (
            <Kart
              className="mt-4"
              to={gecmis.kart.to}
              msg={gecmis.kart.msg}
              from={gecmis.kart.from}
              th={gecmis.kart.th}
            />
          ) : null}
        </section>
      ) : null}

      <div className="mt-8 flex gap-2" role="tablist" aria-label="Liste">
        {SEKMELER.map(([t, etiket]) => (
          <button
            key={t}
            id={`sekme-${t}`}
            type="button"
            role="tab"
            aria-selected={sekme === t}
            aria-controls="sekme-panel"
            tabIndex={sekme === t ? 0 : -1}
            onClick={() => setSekme(t)}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "Home" || e.key === "End") {
                e.preventDefault();
                const yeni = SEKMELER.find(([x]) => x !== t)?.[0] ?? t;
                setSekme(yeni);
                document.getElementById(`sekme-${yeni}`)?.focus();
              }
            }}
            className={`${kucuk} ${sekme === t ? "bg-stone-800 text-white" : "bg-white"}`}
          >
            {etiket}
          </button>
        ))}
      </div>

      <div id="sekme-panel" role="tabpanel" aria-labelledby={`sekme-${sekme}`}>
      {gorunen.length === 0 ? (
        <p className="mt-4 text-muted">
          {sekme === "gonderilen"
            ? "Yazdığın teşekkürler burada duracak."
            : "Kaydettiğin teşekkürler burada duracak."}
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {gorunen.map((k) => (
            <li key={k.id} className="rounded-2xl border-2 border-stone-300 bg-white p-4">
              <p className="break-words font-bold">{k.kart.to}</p>
              <p className="mt-1 whitespace-pre-line break-words">{onizleme(k.kart.msg)}</p>
              {k.sesBitis !== undefined ? (
                <p className="mt-1 text-sm text-muted">
                  {k.sesBitis > simdi
                    ? `Ses kaydı ${tarihBicimi.format(new Date(k.sesBitis * 1000))} tarihine kadar dinlenebilir.`
                    : "Ses süresi doldu; yazılı hali burada."}
                </p>
              ) : null}
              <div className="mt-3 flex gap-2">
                <Link href={`/k/${k.d}`} className={kucuk}>
                  Aç
                </Link>
                <button type="button" onClick={() => sil(k.id)} className={kucuk}>
                  Sil
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      </div>

      {liste.length > 0 ? (
        <div className="mt-8">
          {onay ? (
            <p className="flex flex-wrap items-center gap-2">
              <span>Tüm kayıtlar bu cihazdan silinsin mi?</span>
              <button
                type="button"
                onClick={() => {
                  tumunuSil();
                  setOnay(false);
                  setSecilen(null);
                }}
                className={kucuk}
              >
                Evet, sil
              </button>
              <button type="button" onClick={() => setOnay(false)} className={kucuk}>
                Vazgeç
              </button>
            </p>
          ) : (
            <button
              type="button"
              onClick={() => setOnay(true)}
              className="text-sm font-semibold underline underline-offset-4"
            >
              Tümünü sil
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
