// Ses kaydı doğrulayıcıları (saf, testlenebilir). Sunucuya özel veri tutmaz.
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export const SES_MAX_BAYT = 150 * 1024;
export const SES_MAX_SURE_MS = 20_500;
export const SES_SAKLAMA_GUN = 7;
export const SES_MIMELAR = ["audio/mp4", "audio/webm", "audio/ogg"] as const;
export type SesMime = (typeof SES_MIMELAR)[number];

/** "audio/webm;codecs=opus" → "audio/webm"; allowlist dışı → null. */
export function mimeTemizle(contentType: string | null): SesMime | null {
  const ana = contentType?.split(";")[0]?.trim().toLowerCase();
  return (SES_MIMELAR as readonly string[]).includes(ana ?? "") ? (ana as SesMime) : null;
}

/** Dosya başlığı bildirilen mime ile uyuşuyor mu? */
export function sihirliBayt(mime: SesMime, b: Uint8Array): boolean {
  if (b.length < 12) return false;
  switch (mime) {
    case "audio/mp4":
      return b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70; // "ftyp"
    case "audio/webm":
      return b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3;
    case "audio/ogg":
      return b[0] === 0x4f && b[1] === 0x67 && b[2] === 0x67 && b[3] === 0x53; // "OggS"
  }
}

export function sureGecerli(ms: string | null): number | null {
  if (!ms || !/^\d{1,6}$/.test(ms)) return null;
  const n = Number(ms);
  return n >= 1 && n <= SES_MAX_SURE_MS ? n : null;
}

/** `X-Peaks`: yoksa {ok, bayt:null}; 64 karakter base64url ve 48 bayt değilse {ok:false}. */
export function peaksAyristir(baslik: string | null): { ok: true; bayt: Buffer | null } | { ok: false } {
  if (baslik === null || baslik === "") return { ok: true, bayt: null };
  if (!/^[A-Za-z0-9_-]{64}$/.test(baslik)) return { ok: false };
  const bayt = Buffer.from(baslik, "base64url");
  return bayt.length === 48 ? { ok: true, bayt } : { ok: false };
}

export function yeniId(): string {
  return randomBytes(16).toString("base64url"); // 22 karakter
}

export function yeniToken(): string {
  return randomBytes(32).toString("base64url");
}

export function tokenOzeti(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function ozetEsit(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** "bytes=0-99" → [0, 99]; geçersiz → null. Boyut dışına taşan bitiş kırpılır. */
export function aralikAyristir(baslik: string | null, boyut: number): [number, number] | null {
  const m = /^bytes=(\d*)-(\d*)$/.exec(baslik ?? "");
  if (!m || (m[1] === "" && m[2] === "")) return null;
  let bas: number;
  let son: number;
  if (m[1] === "") {
    const n = Number(m[2]);
    bas = Math.max(0, boyut - n);
    son = boyut - 1;
  } else {
    bas = Number(m[1]);
    son = m[2] === "" ? boyut - 1 : Math.min(Number(m[2]), boyut - 1);
  }
  return bas <= son && bas < boyut ? [bas, son] : null;
}

/** Gövdeyi en fazla `max` bayt okur; aşarsa null (kalanı okunmaz). */
export async function sinirliOku(gövde: ReadableStream<Uint8Array> | null, max: number): Promise<Uint8Array | null> {
  if (!gövde) return null;
  const okuyucu = gövde.getReader();
  const parcalar: Uint8Array[] = [];
  let toplam = 0;
  for (;;) {
    const { done, value } = await okuyucu.read();
    if (done) break;
    toplam += value.length;
    if (toplam > max) {
      await okuyucu.cancel();
      return null;
    }
    parcalar.push(value);
  }
  const cikti = new Uint8Array(toplam);
  let ofset = 0;
  for (const p of parcalar) {
    cikti.set(p, ofset);
    ofset += p.length;
  }
  return cikti;
}
