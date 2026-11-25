import { ImageResponse } from "next/og";
import HalkaOg from "@/components/og/HalkaOg";
import { tohum } from "@/lib/halka";
import { TEMA_RENK } from "@/lib/tema";
import { decodeTepki, tepkiBul } from "@/lib/tepki";

export const alt = "SağOl tepki kartı";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ d: string }> }) {
  const { d } = await params;
  const t = decodeTepki(d);
  const r = TEMA_RENK.krem;
  const tepki = t ? tepkiBul(t.e) : null;
  const baslik = t ? `${t.from ?? "Biri"} teşekkürüne tepki bıraktı` : "SağOl";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", padding: 72, background: r.zemin, color: r.murekkep }}>
        <div style={{ display: "flex", position: "relative", width: 420, height: 420, alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", position: "absolute", left: 0, top: 0 }}>
            <HalkaOg size={420} n={44} strokeWidth={7} renk={r.murekkep} seed={tohum(t?.from ?? "", t?.e ?? "")} />
          </div>
          <div style={{ display: "flex", fontSize: 150 }}>{tepki?.e ?? "🙏"}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginLeft: 64, flex: 1 }}>
          {t?.to ? <div style={{ display: "flex", fontSize: 40, color: r.ikincil }}>{`Sevgili ${t.to},`}</div> : null}
          <div style={{ display: "flex", fontSize: 60, fontWeight: 700, lineHeight: 1.15, marginTop: 12 }}>{baslik}</div>
          <div style={{ display: "flex", fontSize: 30, marginTop: 32, color: r.ikincil }}>SağOl</div>
        </div>
      </div>
    ),
    { ...size, emoji: "twemoji" },
  );
}
