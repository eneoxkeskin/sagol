"use client";

import { useEffect, useRef, useState, type Dispatch, type PointerEvent as RPointerEvent, type SetStateAction } from "react";
import CikartmaSekli from "@/components/CikartmaSekli";
import KartOnizleme from "@/components/KartOnizleme";
import type { Tema } from "@/lib/card";
import {
  CIKARTMA_MAX,
  CIKARTMA_TABAN,
  EMOJILER,
  SEKILLER,
  cikartmaAdi,
  sinirla,
  type Cikartma,
  type CikartmaTuru,
} from "@/lib/cikartma";

type Nokta = { x: number; y: number };
type Jest =
  | { mod: "tasi"; i: number; c: Cikartma; p0: Nokta }
  | { mod: "iki"; i: number; c: Cikartma; aci0: number; mesafe0: number }
  | { mod: "tutamac"; i: number; c: Cikartma; merkez: Nokta; aci0: number; mesafe0: number };

const aci = (a: Nokta, b: Nokta) => Math.atan2(b.y - a.y, b.x - a.x);
const mesafe = (a: Nokta, b: Nokta) => Math.max(1, Math.hypot(b.x - a.x, b.y - a.y));
const DERECE = 180 / Math.PI;
const dugme52 = "flex size-[52px] items-center justify-center rounded-[22px] bg-kutu";

/** "Kartını süsle" adımı (docs/DESIGN-V3.md · G). */
export default function KartSusle({
  to,
  msg,
  from,
  th,
  peaks,
  st,
  setSt,
  onBitti,
  onAtla,
  mesgul = false,
}: {
  to: string;
  msg: string;
  from?: string;
  th: Tema;
  peaks: number[] | null;
  st: Cikartma[];
  setSt: Dispatch<SetStateAction<Cikartma[]>>;
  onBitti: () => void;
  onAtla: () => void;
  mesgul?: boolean;
}) {
  const [secili, setSecili] = useState<number | null>(null);
  const [sekme, setSekme] = useState<"sekil" | "emoji">("sekil");
  const [mesaj, setMesaj] = useState("");
  const [yeni, setYeni] = useState<number | null>(null);
  const katman = useRef<HTMLDivElement>(null);
  const isaretciler = useRef(new Map<number, Nokta>());
  const jest = useRef<Jest | null>(null);
  const stRef = useRef(st);
  useEffect(() => {
    stRef.current = st;
  }, [st]);

  const guncelle = (i: number, c: Cikartma) => setSt((onceki) => onceki.map((x, j) => (j === i ? sinirla(c) : x)));

  function ekle(k: CikartmaTuru) {
    if (st.length >= CIKARTMA_MAX) {
      setMesaj(`En çok ${CIKARTMA_MAX} çıkartma ekleyebilirsin.`);
      return;
    }
    const n = st.length;
    // Halkanın çevresine sırayla yerleş: ilk konumlar halkayı kapatmasın.
    const yerler: Nokta[] = [
      { x: 0.15, y: 0.12 }, { x: 0.85, y: 0.12 }, { x: 0.12, y: 0.42 }, { x: 0.88, y: 0.42 },
      { x: 0.2, y: 0.88 }, { x: 0.8, y: 0.88 }, { x: 0.5, y: 0.08 }, { x: 0.5, y: 0.62 },
    ];
    const y = yerler[n % yerler.length];
    setSt([...st, sinirla({ k, x: y.x, y: y.y, r: 0, s: 1 })]);
    setSecili(n);
    setYeni(n);
    setMesaj(`${cikartmaAdi(k)} eklendi.`);
  }

  function sil(i: number) {
    setSt(st.filter((_, j) => j !== i));
    setSecili(null);
    setMesaj("Çıkartma kaldırıldı.");
  }

  function konum(e: RPointerEvent): Nokta {
    return { x: e.clientX, y: e.clientY };
  }

  function jestiBaslat(i: number) {
    const c = stRef.current[i];
    if (!c) return;
    const noktalar = [...isaretciler.current.values()];
    if (noktalar.length >= 2) {
      jest.current = { mod: "iki", i, c, aci0: aci(noktalar[0], noktalar[1]), mesafe0: mesafe(noktalar[0], noktalar[1]) };
    } else if (noktalar.length === 1) {
      jest.current = { mod: "tasi", i, c, p0: noktalar[0] };
    }
  }

  function cikartmaBasti(e: RPointerEvent, i: number) {
    e.stopPropagation();
    e.preventDefault();
    katman.current?.setPointerCapture(e.pointerId);
    isaretciler.current.set(e.pointerId, konum(e));
    setSecili(i);
    jestiBaslat(i);
  }

  function tutamacBasti(e: RPointerEvent, i: number) {
    e.stopPropagation();
    e.preventDefault();
    const kutu = katman.current?.getBoundingClientRect();
    const c = stRef.current[i];
    if (!kutu || !c) return;
    katman.current?.setPointerCapture(e.pointerId);
    isaretciler.current.set(e.pointerId, konum(e));
    const merkez = { x: kutu.left + c.x * kutu.width, y: kutu.top + c.y * kutu.height };
    const p = konum(e);
    jest.current = { mod: "tutamac", i, c, merkez, aci0: aci(merkez, p), mesafe0: mesafe(merkez, p) };
  }

  function katmanBasti(e: RPointerEvent) {
    // İkinci parmak (seçili çıkartma varken) → döndür/büyüt; aksi hâlde seçimi kaldır.
    if (secili !== null && isaretciler.current.size === 1) {
      katman.current?.setPointerCapture(e.pointerId);
      isaretciler.current.set(e.pointerId, konum(e));
      jestiBaslat(secili);
      return;
    }
    if (isaretciler.current.size === 0) setSecili(null);
  }

  function hareket(e: RPointerEvent) {
    if (!isaretciler.current.has(e.pointerId)) return;
    isaretciler.current.set(e.pointerId, konum(e));
    const j = jest.current;
    const kutu = katman.current?.getBoundingClientRect();
    if (!j || !kutu) return;
    if (j.mod === "tasi") {
      const p = konum(e);
      guncelle(j.i, { ...j.c, x: j.c.x + (p.x - j.p0.x) / kutu.width, y: j.c.y + (p.y - j.p0.y) / kutu.height });
    } else if (j.mod === "iki") {
      const [a, b] = [...isaretciler.current.values()];
      if (!a || !b) return;
      guncelle(j.i, { ...j.c, r: j.c.r + (aci(a, b) - j.aci0) * DERECE, s: (j.c.s * mesafe(a, b)) / j.mesafe0 });
    } else {
      const p = konum(e);
      guncelle(j.i, { ...j.c, r: j.c.r + (aci(j.merkez, p) - j.aci0) * DERECE, s: (j.c.s * mesafe(j.merkez, p)) / j.mesafe0 });
    }
  }

  function birakti(e: RPointerEvent) {
    isaretciler.current.delete(e.pointerId);
    const j = jest.current;
    if (j && isaretciler.current.size === 1) jestiBaslat(j.i);
    else if (isaretciler.current.size === 0) jest.current = null;
  }

  function tus(e: React.KeyboardEvent, i: number) {
    const c = st[i];
    if (!c) return;
    const adim = e.shiftKey ? 0.05 : 0.01;
    const yeniC: Partial<Cikartma> | null =
      e.key === "ArrowLeft" ? { x: c.x - adim }
      : e.key === "ArrowRight" ? { x: c.x + adim }
      : e.key === "ArrowUp" ? { y: c.y - adim }
      : e.key === "ArrowDown" ? { y: c.y + adim }
      : e.key === "[" ? { r: c.r - 15 }
      : e.key === "]" ? { r: c.r + 15 }
      : e.key === "+" || e.key === "=" ? { s: c.s + 0.1 }
      : e.key === "-" ? { s: c.s - 0.1 }
      : null;
    if (yeniC) {
      e.preventDefault();
      guncelle(i, { ...c, ...yeniC });
    } else if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      sil(i);
    }
  }

  const tepsi = sekme === "sekil" ? SEKILLER : EMOJILER;

  return (
    <section className="mt-6" aria-labelledby="susle-baslik">
      <h1 id="susle-baslik" className="mb-4 text-center font-baslik text-3xl font-semibold">
        Kartını süsle
      </h1>
      <KartOnizleme to={to} msg={msg} from={from} th={th} peaks={peaks}>
        <div
          ref={katman}
          className="absolute inset-0 touch-none"
          onPointerDown={katmanBasti}
          onPointerMove={hareket}
          onPointerUp={birakti}
          onPointerCancel={birakti}
        >
          {st.map((c, i) => (
            <div
              key={i}
              className="absolute aspect-square"
              style={{
                left: `${c.x * 100}%`,
                top: `${c.y * 100}%`,
                width: `${CIKARTMA_TABAN * c.s * 100}%`,
                transform: `translate(-50%, -50%) rotate(${c.r}deg)`,
              }}
            >
              {/* Çıkartma, sil düğmesi ve tutamaç kardeş öğeler: iç içe etkileşimli öğe yok. */}
              <div
                role="button"
                tabIndex={0}
                aria-label={`${cikartmaAdi(c.k)} çıkartması`}
                aria-describedby="susle-ipucu-klavye"
                aria-pressed={secili === i}
                onPointerDown={(e) => cikartmaBasti(e, i)}
                onFocus={() => setSecili(i)}
                onKeyDown={(e) => tus(e, i)}
                className={`h-full w-full cursor-grab touch-none ${yeni === i ? "motion-safe:animate-[pop_200ms_ease-out]" : ""}`}
              >
                <CikartmaSekli k={c.k} murekkep="var(--murekkep)" />
              </div>
              {secili === i ? (
                <>
                  <span className="pointer-events-none absolute -inset-1.5 rounded-md border-2 border-dashed border-murekkep" />
                  <button
                    type="button"
                    aria-label={`${cikartmaAdi(c.k)} çıkartmasını sil`}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => sil(i)}
                    className="absolute -right-[22px] -top-[22px] flex size-11 items-center justify-center"
                  >
                    <span className="flex size-6 items-center justify-center rounded-full bg-vurgu text-vurgu-yazi">
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </span>
                  </button>
                  <span
                    aria-hidden="true"
                    onPointerDown={(e) => tutamacBasti(e, i)}
                    className="absolute -bottom-[22px] -right-[22px] flex size-11 cursor-nwse-resize items-center justify-center"
                  >
                    <span className="flex size-6 items-center justify-center rounded-full border-2 border-murekkep bg-kutu">
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <path d="M10 6a4 4 0 1 1-1.2-2.8M10 1.5v2.5H7.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    </span>
                  </span>
                </>
              ) : null}
            </div>
          ))}
        </div>
      </KartOnizleme>

      <p id="susle-ipucu" className="mt-3 text-center text-sm text-ikincil">
        Sürükle · iki parmakla döndür ve büyüt
      </p>
      <p id="susle-ipucu-klavye" className="sr-only">
        Klavyeyle: oklar taşır, köşeli parantezler döndürür, artı ve eksi büyütür, Delete siler.
      </p>

      <div className="mt-4 flex justify-center gap-2" role="tablist" aria-label="Çıkartma türü">
        {(
          [
            ["sekil", "Çıkartmalar"],
            ["emoji", "Emoji"],
          ] as const
        ).map(([s, ad]) => (
          <button
            key={s}
            id={`susle-sekme-${s}`}
            type="button"
            role="tab"
            aria-selected={sekme === s}
            aria-controls="susle-tepsi"
            tabIndex={sekme === s ? 0 : -1}
            onClick={() => setSekme(s)}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                e.preventDefault();
                const diger = s === "sekil" ? "emoji" : "sekil";
                setSekme(diger);
                document.getElementById(`susle-sekme-${diger}`)?.focus();
              }
            }}
            className={`min-h-11 rounded-[22px] px-5 text-[15px] font-medium ${sekme === s ? "bg-vurgu text-vurgu-yazi" : "bg-kutu"}`}
          >
            {ad}
          </button>
        ))}
      </div>
      <div id="susle-tepsi" role="tabpanel" aria-labelledby={`susle-sekme-${sekme}`} className="mt-3 flex flex-wrap justify-center gap-2">
        {tepsi.map((t) => (
          <button
            key={t.k}
            type="button"
            aria-label={`${t.ad} ekle`}
            onClick={() => ekle(t.k)}
            disabled={st.length >= CIKARTMA_MAX}
            className={`${dugme52} disabled:opacity-50`}
          >
            <CikartmaSekli k={t.k} murekkep="var(--murekkep)" boyut={32} />
          </button>
        ))}
      </div>
      <p role="status" aria-live="polite" className="mt-2 min-h-6 text-center text-sm">
        {mesaj}
      </p>

      <div className="mt-4 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={onBitti}
          disabled={mesgul}
          className="inline-flex h-14 w-full items-center justify-center rounded-[28px] bg-vurgu px-6 text-lg font-bold text-vurgu-yazi disabled:opacity-50"
        >
          Bitti
        </button>
        <button
          type="button"
          onClick={onAtla}
          disabled={mesgul}
          className="inline-flex min-h-11 items-center text-[15px] font-medium underline underline-offset-4"
        >
          Atla
        </button>
      </div>
    </section>
  );
}
