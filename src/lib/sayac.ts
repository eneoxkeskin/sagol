import "server-only";
import { gunAnahtari } from "./gun";
import { semaHazir } from "./db";

export const SAYAC_GUNLUK_TAVAN = 20000;

/** Bugünün sayısı; veritabanı yok/hata → null (arayüz hiçbir şey göstermez). */
export async function bugunSayisi(): Promise<number | null> {
  try {
    const sql = await semaHazir();
    if (!sql) return null;
    const gun = gunAnahtari(new Date());
    const satirlar = (await sql`SELECT count FROM stats WHERE day = ${gun}::date`) as {
      count: number;
    }[];
    return satirlar[0]?.count ?? 0;
  } catch {
    return null;
  }
}

/** Bugünün sayacını 1 artırır (günlük tavana kadar). */
export async function sayaciArtir(): Promise<void> {
  const sql = await semaHazir();
  if (!sql) return;
  const gun = gunAnahtari(new Date());
  await sql`INSERT INTO stats (day, count) VALUES (${gun}::date, 1)
    ON CONFLICT (day) DO UPDATE SET count = stats.count + 1
    WHERE stats.count < ${SAYAC_GUNLUK_TAVAN}`;
}
