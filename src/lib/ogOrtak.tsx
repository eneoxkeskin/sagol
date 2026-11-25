import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import CikartmaSekli from "@/components/CikartmaSekli";
import { ayrilmaEki, kesKodNoktasi, kodNoktasiUzunlugu, yonelmeEki, type Kart } from "./card";
import { CIKARTMA_TABAN, KART_HALKA, KART_ORAN, emojiBul, type Cikartma } from "./cikartma";
import { peaksCoz } from "./halka";
import { sesAcik } from "./ozellik";
import { sesPeaks } from "./sesMeta";

// Türkçe alfabeye alt kümelenmiş statik TTF'ler (src/assets, toplam ~140KB; next/og sınırı 500KB).
const fontlar = Promise.all([
  readFile(join(process.cwd(), "src/assets/fraunces-600.ttf")),
  readFile(join(process.cwd(), "src/assets/fraunces-italic-400.ttf")),
  readFile(join(process.cwd(), "src/assets/dmsans-500.ttf")),
]);

export async function ogFontlari() {
  const [baslik, italik, arayuz] = await fontlar;
  return [
    { name: "Fraunces", data: baslik, weight: 600 as const, style: "normal" as const },
    { name: "Fraunces", data: italik, weight: 400 as const, style: "italic" as const },
    { name: "DM Sans", data: arayuz, weight: 500 as const, style: "normal" as const },
  ];
}

/** Görsel genlik kaynağı: karttaki p, yoksa (ses açıksa) voices.peaks, yoksa null (tohum). */
export async function kartPeaks(kart: Kart): Promise<number[] | null> {
  return peaksCoz(kart.p) ?? (kart.s && sesAcik() ? await sesPeaks(kart.s) : null);
}

export const tarihBicimi = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", timeZone: "Europe/Istanbul" });

export function alinti(msg: string, n: number): string {
  return kodNoktasiUzunlugu(msg) > n ? `${kesKodNoktasi(msg, n).trimEnd()}…` : msg;
}

/** "Mert'ten Ayşe'ye" · ek kurulamazsa "Mert · Ayşe" · gönderen yoksa "Ayşe için". */
export function kimdenKime(kart: Kart): string {
  if (!kart.from) return `${kart.to} için`;
  const a = ayrilmaEki(kart.from);
  const y = yonelmeEki(kart.to);
  return a && y ? `${a} ${y}` : `${kart.from} · ${kart.to}`;
}

/** Ada göre punto: uzun adlar küçülür. */
export function adPuntosu(ad: string, buyuk: number): number {
  const n = kodNoktasiUzunlugu(ad);
  return n <= 8 ? buyuk : n <= 14 ? Math.round(buyuk * 0.75) : n <= 24 ? Math.round(buyuk * 0.55) : Math.round(buyuk * 0.42);
}

/**
 * Çıkartmaları, kart kutusunun halkası verilen halkayla çakışacak biçimde mutlak konumlu öğeler olarak döndürür.
 * halkaSol/halkaUst/halkaBoy: görseldeki halkanın sol üst köşesi ve boyu (px).
 */
export function cikartmaOgeleri(
  st: readonly Cikartma[] | undefined,
  halkaSol: number,
  halkaUst: number,
  halkaBoy: number,
  murekkep: string,
  /** Verilirse çıkartma merkezleri bu alanın içine (24px pay) sıkıştırılır: görselden taşmaz. */
  sinir?: { w: number; h: number },
) {
  if (!st || st.length === 0) return null;
  const kutuG = halkaBoy / KART_HALKA.w;
  const kutuY = kutuG * KART_ORAN;
  const kutuSol = halkaSol - KART_HALKA.x * kutuG;
  const kutuUst = halkaUst - KART_HALKA.y * kutuY;
  return st.map((c, i) => {
    const boy = Math.round(CIKARTMA_TABAN * c.s * kutuG);
    const emoji = emojiBul(c.k);
    const sikistir = (v: number, ust: number) => Math.min(ust - boy / 2 - 24, Math.max(boy / 2 + 24, v));
    let cx = kutuSol + c.x * kutuG;
    let cy = kutuUst + c.y * kutuY;
    if (sinir) {
      cx = sikistir(cx, sinir.w);
      cy = sikistir(cy, sinir.h);
    }
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          left: Math.round(cx - boy / 2),
          top: Math.round(cy - boy / 2),
          width: boy,
          height: boy,
          transform: `rotate(${c.r}deg)`,
        }}
      >
        {emoji ? <div style={{ display: "flex", fontSize: Math.round(boy * 0.8) }}>{emoji}</div> : <CikartmaSekli k={c.k} murekkep={murekkep} boyut={boy} />}
      </div>
    );
  });
}
