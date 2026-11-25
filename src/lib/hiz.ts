// Bellek içi hız sınırı. IP yalnızca RAM'de, tuzlu SHA-256 özeti olarak tutulur; asla
// diske, veritabanına ya da loga yazılmaz. Serverless'ta örnek başınadır (en iyi çaba).
import { createHash, randomUUID } from "node:crypto";

type Kova = { sayi: number; bitis: number };

const TUZ = randomUUID();
const TTL_MS = 10 * 60 * 1000;
const kovalar = new Map<string, Kova>();

export function istemciAnahtari(basliklar: Pick<Headers, "get">): string {
  const xff = basliklar.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = xff || basliklar.get("x-real-ip") || "bilinmiyor";
  return createHash("sha256").update(TUZ).update(ip).digest("hex");
}

/** Pencere içinde `limit` isteğe kadar true. `simdi` testler için. */
export function izinVer(
  anahtar: string,
  limit: number,
  pencereMs: number,
  simdi: number = Date.now(),
  depo: Map<string, Kova> = kovalar,
): boolean {
  if (depo.size > 5000) {
    for (const [k, v] of depo) if (v.bitis <= simdi) depo.delete(k);
  }
  const k = depo.get(anahtar);
  if (!k || k.bitis <= simdi) {
    depo.set(anahtar, { sayi: 1, bitis: simdi + Math.min(pencereMs, TTL_MS) });
    return true;
  }
  if (k.sayi >= limit) return false;
  k.sayi += 1;
  return true;
}
