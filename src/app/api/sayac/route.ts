import { istemciAnahtari, izinVer } from "@/lib/hiz";
import { sayacAcik } from "@/lib/ozellik";
import { sayaciArtir } from "@/lib/sayac";

export async function POST(istek: Request) {
  if (!sayacAcik()) return new Response(null, { status: 404 });
  if (!izinVer(`sayac:${istemciAnahtari(istek.headers)}`, 10, 60_000)) {
    return new Response(null, { status: 429 });
  }
  try {
    await sayaciArtir();
  } catch {
    return new Response(null, { status: 503 });
  }
  return new Response(null, { status: 204 });
}
