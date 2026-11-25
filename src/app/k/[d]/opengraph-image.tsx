import { ImageResponse } from "next/og";
import HalkaOg from "@/components/og/HalkaOg";
import { decodeCard } from "@/lib/card";
import { tohum } from "@/lib/halka";
import { adPuntosu, alinti, kartPeaks, ogFontlari } from "@/lib/ogOrtak";
import { TEMA_RENK } from "@/lib/tema";

export const alt = "SağOl teşekkür kartı";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const HALKA = 520;

/** OG 1200×630: story ile aynı halka kimliği (docs/DESIGN-V3.md · E). */
export default async function Image({ params }: { params: Promise<{ d: string }> }) {
  const { d } = await params;
  const kart = decodeCard(d);
  const r = TEMA_RENK[kart?.th ?? "krem"];
  const fonts = await ogFontlari();
  const peaks = kart ? await kartPeaks(kart) : null;
  const ad = kart?.to ?? "SağOl";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", padding: "0 64px", background: r.zemin, color: r.murekkep, fontFamily: "DM Sans" }}>
        <div style={{ display: "flex", position: "relative", width: HALKA, height: HALKA, alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", position: "absolute", left: 0, top: 0 }}>
            <HalkaOg size={HALKA} n={peaks ? 48 : 52} strokeWidth={8} renk={r.murekkep} peaks={peaks} seed={kart ? tohum(kart.to, kart.msg) : tohum("SağOl")} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 260 }}>
            {kart ? <div style={{ display: "flex", fontFamily: "Fraunces", fontStyle: "italic", fontSize: 30, color: r.ikincil }}>Sevgili</div> : null}
            <div style={{ display: "flex", fontFamily: "Fraunces", fontWeight: 600, fontSize: adPuntosu(ad, 64), textAlign: "center", lineHeight: 1.05 }}>{ad}</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, marginLeft: 56 }}>
          <div style={{ display: "flex", fontFamily: "Fraunces", fontWeight: 600, fontSize: 54, lineHeight: 1.12 }}>
            {kart ? (kart.from ? `${kart.from} sana teşekkür ediyor.` : "Biri sana teşekkür ediyor.") : "Birine 20 saniyede teşekkür et."}
          </div>
          {kart ? (
            <div style={{ display: "flex", fontFamily: "Fraunces", fontStyle: "italic", fontSize: 32, lineHeight: 1.3, marginTop: 24, color: r.ikincil }}>
              {alinti(kart.msg, 110)}
            </div>
          ) : null}
          <div style={{ display: "flex", fontSize: 26, marginTop: 32, color: r.ikincil }}>SağOl</div>
        </div>
      </div>
    ),
    { ...size, fonts, emoji: "twemoji" },
  );
}
