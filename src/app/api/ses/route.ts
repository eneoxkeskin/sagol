import { SES_ID_REGEX } from "@/lib/card";
import { semaHazir } from "@/lib/db";
import { istemciAnahtari, izinVer } from "@/lib/hiz";
import { sesAcik } from "@/lib/ozellik";
import {
  SES_MAX_BAYT,
  SES_SAKLAMA_GUN,
  mimeTemizle,
  sihirliBayt,
  sinirliOku,
  sureGecerli,
  tokenOzeti,
  yeniId,
  yeniToken,
} from "@/lib/ses";

const GUNLUK_GLOBAL_TAVAN = 2000;

const hata = (durum: number) =>
  new Response(null, { status: durum, headers: { "Cache-Control": "no-store" } });

export async function POST(istek: Request) {
  if (!sesAcik()) return hata(404);
  if (!izinVer(`ses:${istemciAnahtari(istek.headers)}`, 5, 10 * 60_000)) return hata(429);

  const mime = mimeTemizle(istek.headers.get("content-type"));
  if (!mime) return hata(415);
  const sure = sureGecerli(istek.headers.get("x-sure-ms"));
  if (sure === null) return hata(400);

  const bildirilen = Number(istek.headers.get("content-length"));
  if (Number.isFinite(bildirilen) && bildirilen > SES_MAX_BAYT) return hata(413);

  const bayt = await sinirliOku(istek.body, SES_MAX_BAYT);
  if (bayt === null) return hata(413);
  if (!sihirliBayt(mime, bayt)) return hata(415);

  try {
    const sql = await semaHazir();
    if (!sql) return hata(404);
    // Cron yok: yazma sırasında süresi dolanları temizle.
    await sql`DELETE FROM voices WHERE expires_at < now()`;
    const son = (await sql`SELECT count(*)::int AS n FROM voices
      WHERE created_at > now() - interval '1 day'`) as { n: number }[];
    if ((son[0]?.n ?? 0) >= GUNLUK_GLOBAL_TAVAN) return hata(429);

    const id = yeniId();
    const token = yeniToken();
    const ozet = tokenOzeti(token);
    const sakla = (await sql`INSERT INTO voices
      (id, audio, mime, duration_ms, expires_at, delete_token_hash)
      VALUES (${id}, ${Buffer.from(bayt)}, ${mime}, ${sure},
        now() + (${SES_SAKLAMA_GUN} * interval '1 day'), ${ozet})
      RETURNING extract(epoch from expires_at)::bigint AS bitis`) as { bitis: string | number }[];

    if (!SES_ID_REGEX.test(id)) return hata(500);
    return Response.json(
      { id, token, bitis: Number(sakla[0]?.bitis) },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return hata(503);
  }
}
