import { SES_ID_REGEX } from "@/lib/card";
import { semaHazir } from "@/lib/db";
import { sesAcik } from "@/lib/ozellik";
import { aralikAyristir, ozetEsit, tokenOzeti } from "@/lib/ses";

type Ctx = { params: Promise<{ id: string }> };

const hata = (durum: number) =>
  new Response(null, { status: durum, headers: { "Cache-Control": "no-store" } });

function baytlaraCevir(v: unknown): Buffer | null {
  if (Buffer.isBuffer(v)) return v;
  if (v instanceof Uint8Array) return Buffer.from(v);
  if (typeof v === "string" && v.startsWith("\\x")) return Buffer.from(v.slice(2), "hex");
  return null;
}

export async function GET(istek: Request, { params }: Ctx) {
  if (!sesAcik()) return hata(404);
  const { id } = await params;
  if (!SES_ID_REGEX.test(id)) return hata(404);

  try {
    const sql = await semaHazir();
    if (!sql) return hata(404);
    const satirlar = (await sql`SELECT audio, mime, (expires_at < now()) AS doldu
      FROM voices WHERE id = ${id}`) as { audio: unknown; mime: string; doldu: boolean }[];
    const s = satirlar[0];
    if (!s) return hata(404);
    if (s.doldu) {
      await sql`DELETE FROM voices WHERE id = ${id}`;
      return hata(404);
    }
    const ses = baytlaraCevir(s.audio);
    if (!ses) return hata(500);

    const ortak = {
      "Content-Type": s.mime,
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
      "Cache-Control": "private, max-age=3600",
      "Accept-Ranges": "bytes",
    };
    const aralik = aralikAyristir(istek.headers.get("range"), ses.length);
    if (istek.headers.has("range") && !aralik) {
      return new Response(null, {
        status: 416,
        headers: { ...ortak, "Content-Range": `bytes */${ses.length}` },
      });
    }
    if (aralik) {
      const [bas, son] = aralik;
      return new Response(new Uint8Array(ses.subarray(bas, son + 1)), {
        status: 206,
        headers: {
          ...ortak,
          "Content-Range": `bytes ${bas}-${son}/${ses.length}`,
          "Content-Length": String(son - bas + 1),
        },
      });
    }
    return new Response(new Uint8Array(ses), {
      headers: { ...ortak, "Content-Length": String(ses.length) },
    });
  } catch {
    return hata(503);
  }
}

export async function DELETE(istek: Request, { params }: Ctx) {
  if (!sesAcik()) return hata(404);
  const { id } = await params;
  if (!SES_ID_REGEX.test(id)) return hata(404);
  const m = /^Bearer ([A-Za-z0-9_-]{20,64})$/.exec(istek.headers.get("authorization") ?? "");
  if (!m) return hata(403);

  try {
    const sql = await semaHazir();
    if (!sql) return hata(404);
    const satirlar = (await sql`SELECT delete_token_hash FROM voices WHERE id = ${id}`) as {
      delete_token_hash: string;
    }[];
    const s = satirlar[0];
    if (!s) return hata(404);
    if (!ozetEsit(s.delete_token_hash, tokenOzeti(m[1]))) return hata(403);
    await sql`DELETE FROM voices WHERE id = ${id}`;
    return hata(204);
  } catch {
    return hata(503);
  }
}
