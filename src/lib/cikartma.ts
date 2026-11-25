// Çıkartmalar (docs/DESIGN-V3.md · G). URL'de yalnızca allowlist anahtarı ve tamsayılar taşınır.

export const SEKILLER = [
  { k: "kalp", ad: "Kalp" },
  { k: "yildiz", ad: "Yıldız" },
  { k: "parilti", ad: "Parıltı" },
  { k: "cicek", ad: "Çiçek" },
  { k: "gunes", ad: "Güneş" },
  { k: "yaprak", ad: "Yaprak" },
] as const;

export const EMOJILER = [
  { k: "e1", e: "💛", ad: "Sarı kalp" },
  { k: "e2", e: "🫶", ad: "Kalp eller" },
  { k: "e3", e: "🙏", ad: "Teşekkür" },
  { k: "e4", e: "🥹", ad: "Duygulanmış yüz" },
  { k: "e5", e: "😊", ad: "Gülümseyen yüz" },
  { k: "e6", e: "🌸", ad: "Kiraz çiçeği" },
  { k: "e7", e: "🌻", ad: "Ayçiçeği" },
  { k: "e8", e: "🍀", ad: "Yonca" },
  { k: "e9", e: "☕", ad: "Sıcak içecek" },
  { k: "e10", e: "🌙", ad: "Hilal" },
  { k: "e11", e: "⭐", ad: "Yıldız" },
  { k: "e12", e: "🎶", ad: "Notalar" },
] as const;

export type SekilTuru = (typeof SEKILLER)[number]["k"];
export type EmojiTuru = (typeof EMOJILER)[number]["k"];
export type CikartmaTuru = SekilTuru | EmojiTuru;

/** Bellekteki biçim: x,y kart içinde 0..1; r derece; s ölçek 0.5..2. */
export type Cikartma = { k: CikartmaTuru; x: number; y: number; r: number; s: number };
/** URL biçimi: [tür, x‰ 0..1000, y‰ 0..1000, r −180..180, s% 50..200] (hepsi tamsayı). */
export type CikartmaDemet = [CikartmaTuru, number, number, number, number];

export const CIKARTMA_MAX = 8;
/** Çıkartmanın ölçek 1'deki genişliği, kart genişliğine oranla (342 px kartta ≈44 px). */
export const CIKARTMA_TABAN = 0.13;
/** 342×380 kartta halkanın yeri (KartOnizleme, OG ve alıcı ekranı aynı oranları kullanır). */
export const KART_ORAN = 380 / 342;
export const KART_HALKA = { x: 0.21, y: 0.04, w: 0.58 } as const;

const TURLER = new Set<string>([...SEKILLER.map((s) => s.k), ...EMOJILER.map((e) => e.k)]);

export function turGecerli(k: unknown): k is CikartmaTuru {
  return typeof k === "string" && TURLER.has(k);
}

export function cikartmaAdi(k: CikartmaTuru): string {
  return SEKILLER.find((s) => s.k === k)?.ad ?? EMOJILER.find((e) => e.k === k)?.ad ?? "Çıkartma";
}

export function emojiBul(k: CikartmaTuru): string | null {
  return EMOJILER.find((e) => e.k === k)?.e ?? null;
}

const kirp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** Bellekteki değerleri geçerli aralığa çeker. */
export function sinirla(c: Cikartma): Cikartma {
  return {
    k: c.k,
    x: Math.round(kirp(c.x, 0, 1) * 1000) / 1000,
    y: Math.round(kirp(c.y, 0, 1) * 1000) / 1000,
    r: Math.round(((((c.r + 180) % 360) + 360) % 360) - 180),
    s: Math.round(kirp(c.s, 0.5, 2) * 100) / 100,
  };
}

export function cikartmalariKodla(liste: readonly Cikartma[]): CikartmaDemet[] {
  return liste.slice(0, CIKARTMA_MAX).map((c) => {
    const s = sinirla(c);
    return [s.k, Math.round(s.x * 1000), Math.round(s.y * 1000), s.r, Math.round(s.s * 100)];
  });
}

/** URL'den gelen ham değer → doğrulanmış liste. Bilinmeyen tür / tamsayı olmayan öğe atılır, fazlası kesilir. */
export function cikartmalariCoz(ham: unknown): Cikartma[] {
  if (!Array.isArray(ham)) return [];
  const out: Cikartma[] = [];
  for (const o of ham) {
    if (out.length >= CIKARTMA_MAX) break;
    if (!Array.isArray(o) || o.length !== 5) continue;
    const [k, x, y, r, s] = o as unknown[];
    if (!turGecerli(k)) continue;
    if (![x, y, r, s].every((v) => typeof v === "number" && Number.isInteger(v))) continue;
    out.push({
      k,
      x: kirp(x as number, 0, 1000) / 1000,
      y: kirp(y as number, 0, 1000) / 1000,
      r: kirp(r as number, -180, 180),
      s: kirp(s as number, 50, 200) / 100,
    });
  }
  return out;
}
