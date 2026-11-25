// Tepkiler (docs/DESIGN-V3.md · H): sabit allowlist; tepki linki /t/[d] sunucuda saklanmaz.
import { temizleAd } from "./card.ts";

export const TEPKILER = [
  { k: "kalp", e: "💛", ad: "Sarı kalp" },
  { k: "duygulandim", e: "🥹", ad: "Duygulandım" },
  { k: "guldum", e: "😂", ad: "Güldüm" },
  { k: "sevgi", e: "🫶", ad: "Sevgi" },
  { k: "tesekkur", e: "🙏", ad: "Teşekkür" },
] as const;

export type TepkiAnahtar = (typeof TEPKILER)[number]["k"];

export function tepkiBul(k: unknown) {
  return TEPKILER.find((t) => t.k === k) ?? null;
}

/** to: tepkiyi alacak kişi (kartı gönderen); from: tepkiyi veren (kartın alıcısı). */
export type Tepki = { v: 1; to?: string; from?: string; e: TepkiAnahtar; t: number };

export const TEPKI_D_MAX = 400;
const D_REGEX = /^[A-Za-z0-9_-]+$/;

export function encodeTepki(t: Tepki): string {
  const bayt = new TextEncoder().encode(JSON.stringify(t));
  let bin = "";
  for (const b of bayt) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeTepki(d: unknown): Tepki | null {
  if (typeof d !== "string" || d.length === 0 || d.length > TEPKI_D_MAX || !D_REGEX.test(d)) return null;
  try {
    const b64 = d.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
    const ham: unknown = JSON.parse(
      new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))),
    );
    if (typeof ham !== "object" || ham === null || Array.isArray(ham)) return null;
    const o = ham as Record<string, unknown>;
    if (o.v !== 1 || !tepkiBul(o.e)) return null;
    if (typeof o.t !== "number" || !Number.isFinite(o.t)) return null;
    const t: Tepki = { v: 1, e: o.e as TepkiAnahtar, t: Math.floor(o.t) };
    for (const alan of ["to", "from"] as const) {
      if (o[alan] === undefined) continue;
      if (typeof o[alan] !== "string") return null;
      const ad = temizleAd(o[alan] as string);
      if (ad) t[alan] = ad;
    }
    return t;
  } catch {
    return null;
  }
}
