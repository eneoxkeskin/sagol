// Ses halkası geometrisi (docs/DESIGN-V3.md). DOM (SoundRing), OG ve story aynı fonksiyonları kullanır.

/** FNV-1a 32 bit. */
export function tohum(...parcalar: string[]): number {
  let h = 0x811c9dc5;
  for (const p of parcalar) {
    for (const ch of p.normalize("NFC")) {
      const k = ch.codePointAt(0) ?? 0;
      h ^= k;
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    h ^= 0x1f;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** mulberry32: tohumdan [0,1) dizisi üreten üreteç. */
export function uretec(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const kirp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** peaks'i n çubuğa indirir (max-pool) ya da genişletir (en yakın). */
export function peaksYenidenOrnekle(peaks: readonly number[], n: number): number[] {
  if (peaks.length === 0) return Array.from({ length: n }, () => 0.16);
  if (peaks.length === n) return peaks.map((v) => kirp(v, 0, 1));
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const bas = Math.floor((i * peaks.length) / n);
    const son = Math.max(bas + 1, Math.floor(((i + 1) * peaks.length) / n));
    let m = 0;
    for (let j = bas; j < son && j < peaks.length; j++) m = Math.max(m, peaks[j]);
    out.push(kirp(m, 0, 1));
  }
  return out;
}

/** n çubuğun genliği: peaks varsa onlar (0..1), yoksa tohumlu formül, [0.16, 1]. */
export function genlikler(n: number, { peaks, seed = 0 }: { peaks?: readonly number[] | null; seed?: number }): number[] {
  if (peaks && peaks.length > 0) {
    return peaksYenidenOrnekle(peaks, n).map((v) => kirp(v, 0.16, 1));
  }
  const r = uretec(seed);
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const temel = 0.42 + 0.58 * Math.abs(Math.sin(i * 0.37) * Math.cos(i * 0.11) + 0.35 * Math.sin(i * 1.3));
    out.push(kirp(temel * (0.8 + 0.4 * r()), 0.16, 1));
  }
  return out;
}

export type Cubuk = { x1: number; y1: number; x2: number; y2: number };

/**
 * Çubuk geometrisi. Açı t = 2π·i/n − π/2 (tepeden, saat yönü).
 * Çubuk r0'dan başlar; dış uç r0 + 4 + (maxLen − r0 − 4)·a (maxLen dış yarıçap üst sınırı).
 */
export function cubuklar({ size, r0, maxLen, a }: { size: number; r0: number; maxLen: number; a: readonly number[] }): Cubuk[] {
  const c = size / 2;
  const n = a.length;
  const uzunluk = Math.max(0, maxLen - r0 - 4);
  return a.map((ai, i) => {
    const t = (2 * Math.PI * i) / n - Math.PI / 2;
    const r2 = r0 + 4 + uzunluk * ai;
    const cos = Math.cos(t);
    const sin = Math.sin(t);
    const yuvarla = (v: number) => Math.round(v * 100) / 100;
    return {
      x1: yuvarla(c + r0 * cos),
      y1: yuvarla(c + r0 * sin),
      x2: yuvarla(c + r2 * cos),
      y2: yuvarla(c + r2 * sin),
    };
  });
}

/** Önerilen oranlar: r0 ≈ 0.29·size, maxLen ≈ 0.49·size. */
export function varsayilanOlcu(size: number) {
  return { r0: Math.round(size * 0.29), maxLen: Math.round(size * 0.49) };
}

const B64 = /^[A-Za-z0-9_-]{64}$/;

/** 48 genlik (0..1) → 64 karakter base64url. */
export function peaksKodla(peaks: readonly number[]): string {
  const b = peaksYenidenOrnekle(peaks, 48).map((v) => Math.round(kirp(v, 0, 1) * 255));
  let bin = "";
  for (const x of b) bin += String.fromCharCode(x);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** 64 karakter base64url → 48 genlik; geçersizse null. */
export function peaksCoz(p: unknown): number[] | null {
  if (typeof p !== "string" || !B64.test(p)) return null;
  try {
    const bin = atob(p.replace(/-/g, "+").replace(/_/g, "/"));
    if (bin.length !== 48) return null;
    return Array.from(bin, (c) => c.charCodeAt(0) / 255);
  } catch {
    return null;
  }
}
