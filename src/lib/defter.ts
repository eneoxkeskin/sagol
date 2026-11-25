import { decodeCard, type Kart } from "./card.ts";

export const DEFTER_ANAHTAR = "sagol:v1:defter";
export const DEFTER_ENFAZLA = 200;
const OLAY = "sagol:defter-degisti";

export type DefterKaydi = {
  id: string;
  tur: "gonderilen" | "alinan";
  d: string;
  kart: Kart;
  at: number;
  /** Ses kaydının silineceği an (unix sn), varsa. */
  sesBitis?: number;
  /** Gönderenin ses silme linki; yalnızca bu cihazda tutulur. */
  silLink?: string;
};

const SIL_LINK = /^https?:\/\/[A-Za-z0-9.:-]+\/sil#[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{20,64}$/;

/** localStorage'daki ham metin; erişilemezse boş dizi metni. Sabit (primitive) döner. */
export function hamOku(): string {
  try {
    return window.localStorage.getItem(DEFTER_ANAHTAR) ?? "[]";
  } catch {
    return "[]";
  }
}

export function hamSunucu(): string {
  return "[]";
}

/** Ham metni şema kontrolüyle ayrıştırır. Bozuksa boş liste; kartlar decodeCard ile yeniden doğrulanır. */
export function ayristir(ham: string): DefterKaydi[] {
  try {
    const veri: unknown = JSON.parse(ham);
    if (!Array.isArray(veri)) return [];
    const sonuc: DefterKaydi[] = [];
    for (const o of veri) {
      if (typeof o !== "object" || o === null) continue;
      const r = o as Record<string, unknown>;
      if (typeof r.id !== "string" || typeof r.d !== "string") continue;
      if (r.tur !== "gonderilen" && r.tur !== "alinan") continue;
      if (typeof r.at !== "number" || !Number.isFinite(r.at)) continue;
      const kart = decodeCard(r.d);
      if (!kart) continue;
      const kayit: DefterKaydi = { id: r.id, tur: r.tur, d: r.d, kart, at: r.at };
      if (typeof r.sesBitis === "number" && Number.isFinite(r.sesBitis)) {
        kayit.sesBitis = r.sesBitis;
      }
      if (typeof r.silLink === "string" && SIL_LINK.test(r.silLink)) kayit.silLink = r.silLink;
      sonuc.push(kayit);
    }
    return sonuc.slice(0, DEFTER_ENFAZLA);
  } catch {
    return [];
  }
}

export function abone(cb: () => void): () => void {
  const f = (e: Event) => {
    if (!(e instanceof StorageEvent) || e.key === null || e.key === DEFTER_ANAHTAR) cb();
  };
  window.addEventListener("storage", f);
  window.addEventListener(OLAY, cb);
  return () => {
    window.removeEventListener("storage", f);
    window.removeEventListener(OLAY, cb);
  };
}

function yaz(liste: DefterKaydi[]): boolean {
  try {
    const sade = liste
      .slice(0, DEFTER_ENFAZLA)
      .map(({ id, tur, d, kart, at, sesBitis, silLink }) => ({
        id,
        tur,
        d,
        kart,
        at,
        sesBitis,
        silLink,
      }));
    window.localStorage.setItem(DEFTER_ANAHTAR, JSON.stringify(sade));
    window.dispatchEvent(new Event(OLAY));
    return true;
  } catch {
    return false;
  }
}

/** Aynı `d` tekrar eklenmez. Eklendiyse true. */
export function ekle(
  tur: DefterKaydi["tur"],
  d: string,
  sesBitis?: number,
  silLink?: string,
): boolean {
  const kart = decodeCard(d);
  if (!kart) return false;
  const liste = ayristir(hamOku());
  if (liste.some((k) => k.d === d)) return false;
  const kayit: DefterKaydi = { id: d, tur, d, kart, at: Math.floor(Date.now() / 1000) };
  if (sesBitis !== undefined) kayit.sesBitis = sesBitis;
  if (silLink !== undefined && SIL_LINK.test(silLink)) kayit.silLink = silLink;
  return yaz([kayit, ...liste]);
}

export function sil(id: string): void {
  yaz(ayristir(hamOku()).filter((k) => k.id !== id));
}

export function tumunuSil(): void {
  yaz([]);
}
