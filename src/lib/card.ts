import { cikartmalariCoz, cikartmalariKodla, type Cikartma } from "./cikartma.ts";

export const TEMALAR = ["sabah", "cay", "deniz", "lavanta"] as const;
export type Tema = (typeof TEMALAR)[number];

export type Kart = {
  /** 1: eski linkler; 2: `p` (genlikler) ve `st` (çıkartmalar) taşıyabilir. */
  v: 1 | 2;
  to: string;
  msg: string;
  from?: string;
  th: Tema;
  /** Zincir halkası 1-999 (eski linklerde `z`). */
  h: number;
  /** Ses kaydı id'si (22 karakter base64url), opsiyonel. */
  s?: string;
  /** v:2 — 48 ses genliği, base64url 64 karakter (bkz. halka.ts peaksKodla). */
  p?: string;
  /** v:2 — çıkartmalar (URL'de sıkıştırılmış demet; bkz. cikartma.ts). */
  st?: Cikartma[];
  t: number;
};

export const SES_ID_REGEX = /^[A-Za-z0-9_-]{22}$/;
export const PEAKS_REGEX = /^[A-Za-z0-9_-]{64}$/;

/** Ad alanı temizleyici (form `?to=` için): NFC, kontrol karakteri yok, ≤40 kod noktası. */
export function temizleAd(s: string): string {
  return kes(temizle(s).replace(/\n/g, " "), 40).trim();
}

function halka(v: unknown): number | null {
  return typeof v === "number" && Number.isInteger(v) && v >= 1 && v <= 999 ? v : null;
}

/** "Ayşe" → "Ayşe'ye", "Mert" → "Mert'e", "Işık" → "Işık'a". Emin olunamazsa null. */
export function yonelmeEki(ad: string): string | null {
  const kelime = temizle(ad).split(/\s+/).pop() ?? "";
  const k = kelime.toLocaleLowerCase("tr");
  if (!k || !/^\p{L}+$/u.test(k)) return null;
  const unluler = "aeıioöuü";
  let son: string | null = null;
  for (const c of k) if (unluler.includes(c)) son = c;
  if (!son) return null;
  const kalin = "aıou".includes(son);
  const unluyleBitiyor = unluler.includes([...k].pop() as string);
  const ek = (unluyleBitiyor ? "y" : "") + (kalin ? "a" : "e");
  return `${temizle(ad)}'${ek}`;
}

/** "Mert" → "Mert'ten", "Ayşe" → "Ayşe'den", "Işık" → "Işık'tan" (ünsüz sertleşmesi: f s t k ç ş h p). Emin olunamazsa null. */
export function ayrilmaEki(ad: string): string | null {
  const kelime = temizle(ad).split(/\s+/).pop() ?? "";
  const k = kelime.toLocaleLowerCase("tr");
  if (!k || !/^\p{L}+$/u.test(k)) return null;
  const unluler = "aeıioöuü";
  let son: string | null = null;
  for (const c of k) if (unluler.includes(c)) son = c;
  if (!son) return null;
  const sonHarf = [...k].pop() as string;
  const sert = "fstkçşhp".includes(sonHarf);
  return `${temizle(ad)}'${sert ? "t" : "d"}${"aıou".includes(son) ? "an" : "en"}`;
}

export const LIMITLER = {
  to: 40,
  msg: 200,
  from: 40,
  zMax: 999,
  dMax: 1600,
} as const;

const D_REGEX = /^[A-Za-z0-9_-]+$/;
// \n hariç kontrol karakterleri (\r dahil)
const KONTROL = /[\u0000-\u0009\u000B-\u001F\u007F-\u009F]/g;

const uzunluk = (s: string) => [...s].length;
const kes = (s: string, n: number) => [...s].slice(0, n).join("");

function temizle(s: string): string {
  return s
    .normalize("NFC")
    .replace(KONTROL, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(d: string): Uint8Array | null {
  try {
    const b64 = d.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
    return Uint8Array.from(bin, (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

export function encodeCard(kart: Kart): string {
  const { st, ...geri } = kart;
  const ham = st && st.length > 0 && kart.v === 2 ? { ...geri, st: cikartmalariKodla(st) } : geri;
  return toBase64Url(new TextEncoder().encode(JSON.stringify(ham)));
}

export function decodeCard(d: unknown): Kart | null {
  if (typeof d !== "string" || d.length === 0 || d.length > LIMITLER.dMax) return null;
  if (!D_REGEX.test(d)) return null;
  const bytes = fromBase64Url(d);
  if (!bytes) return null;
  let raw: unknown;
  try {
    raw = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    return null;
  }
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  if (o.v !== 1 && o.v !== 2) return null;
  if (typeof o.to !== "string" || typeof o.msg !== "string") return null;
  if (typeof o.t !== "number" || !Number.isFinite(o.t)) return null;

  const to = temizle(o.to);
  const msg = temizle(o.msg);
  if (to.length === 0 || msg.length === 0) return null;
  if (uzunluk(to) > LIMITLER.to || uzunluk(msg) > LIMITLER.msg) return null;

  let from: string | undefined;
  if (o.from !== undefined) {
    if (typeof o.from !== "string") return null;
    const f = temizle(o.from);
    if (uzunluk(f) > LIMITLER.from) return null;
    from = f || undefined;
  }

  const th: Tema = (TEMALAR as readonly unknown[]).includes(o.th) ? (o.th as Tema) : "sabah";
  const h = halka(o.h) ?? halka(o.z) ?? 1;

  const kart: Kart = { v: o.v, to, msg, th, h, t: Math.floor(o.t) };
  if (from) kart.from = from;
  if (typeof o.s === "string" && SES_ID_REGEX.test(o.s)) kart.s = o.s;
  if (o.v === 2 && typeof o.p === "string" && PEAKS_REGEX.test(o.p)) kart.p = o.p;
  if (o.v === 2) {
    const st = cikartmalariCoz(o.st);
    if (st.length > 0) kart.st = st;
  }
  return kart;
}

export { kes as kesKodNoktasi, uzunluk as kodNoktasiUzunlugu };
