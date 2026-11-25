import "server-only";
import { SES_ID_REGEX } from "./card";
import { semaHazir } from "./db";

/** Kartta `p` yoksa yedek: süresi dolmamış ses kaydının 48 genliği (0..1). Yoksa/hata → null. */
export async function sesPeaks(id: string): Promise<number[] | null> {
  if (!SES_ID_REGEX.test(id)) return null;
  try {
    const sql = await semaHazir();
    if (!sql) return null;
    const r = (await sql`SELECT peaks FROM voices
      WHERE id = ${id} AND expires_at > now() AND peaks IS NOT NULL`) as { peaks: unknown }[];
    const v = r[0]?.peaks;
    const b = Buffer.isBuffer(v)
      ? v
      : v instanceof Uint8Array
        ? Buffer.from(v)
        : typeof v === "string" && v.startsWith("\\x")
          ? Buffer.from(v.slice(2), "hex")
          : null;
    if (!b || b.length !== 48) return null;
    return Array.from(b, (x) => x / 255);
  } catch {
    return null;
  }
}
