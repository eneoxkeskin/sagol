import { ImageResponse } from "next/og";
import HalkaOg from "@/components/og/HalkaOg";
import { decodeCard } from "@/lib/card";
import { tohum } from "@/lib/halka";
import { adPuntosu, alinti, cikartmaOgeleri, kartPeaks, kimdenKime, ogFontlari, tarihBicimi } from "@/lib/ogOrtak";
import { TEMA_RENK } from "@/lib/tema";

const G = 1080;
const Y = 1920;
const HALKA = 830;
const HALKA_SOL = (G - HALKA) / 2;
const HALKA_UST = 470;

/** Story görseli 1080×1920 (docs/DESIGN-V3.md · E). Yalnızca kartta görünenleri içerir. */
export async function GET(_istek: Request, { params }: { params: Promise<{ d: string }> }) {
  const { d } = await params;
  const kart = decodeCard(d);
  const r = TEMA_RENK[kart?.th ?? "krem"];
  const fonts = await ogFontlari();
  const peaks = kart ? await kartPeaks(kart) : null;

  const govde = kart ? (
    <>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "absolute", top: 150, left: 96, width: G - 192 }}>
        <div style={{ display: "flex", fontFamily: "Fraunces", fontWeight: 600, fontSize: 60, textAlign: "center", lineHeight: 1.15 }}>
          {kimdenKime(kart)}
        </div>
        <div style={{ display: "flex", fontFamily: "DM Sans", fontSize: 36, color: r.ikincil, marginTop: 16 }}>
          {tarihBicimi.format(new Date(kart.t * 1000))}
        </div>
      </div>
      <div style={{ display: "flex", position: "absolute", left: HALKA_SOL, top: HALKA_UST, width: HALKA, height: HALKA, alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", position: "absolute", left: 0, top: 0 }}>
          <HalkaOg size={HALKA} n={peaks ? 48 : 52} strokeWidth={13} renk={r.murekkep} peaks={peaks} seed={tohum(kart.to, kart.msg)} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 420 }}>
          <div style={{ display: "flex", fontFamily: "Fraunces", fontStyle: "italic", fontSize: 48, color: r.ikincil }}>Sevgili</div>
          <div style={{ display: "flex", fontFamily: "Fraunces", fontWeight: 600, fontSize: adPuntosu(kart.to, 104), textAlign: "center", lineHeight: 1.05 }}>
            {kart.to}
          </div>
        </div>
      </div>
      {cikartmaOgeleri(kart.st, HALKA_SOL, HALKA_UST, HALKA, r.murekkep, { w: G, h: Y - 260 })}
      <div style={{ display: "flex", position: "absolute", top: HALKA_UST + HALKA + 60, left: 110, width: G - 220, justifyContent: "center" }}>
        <div style={{ display: "flex", fontFamily: "Fraunces", fontStyle: "italic", fontSize: 46, lineHeight: 1.3, textAlign: "center" }}>
          {alinti(kart.msg, 140)}
        </div>
      </div>
    </>
  ) : (
    <div style={{ display: "flex", position: "absolute", left: HALKA_SOL, top: HALKA_UST, width: HALKA, height: HALKA, alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", position: "absolute", left: 0, top: 0 }}>
        <HalkaOg size={HALKA} n={52} strokeWidth={13} renk={r.murekkep} seed={tohum("SağOl")} />
      </div>
      <div style={{ display: "flex", fontFamily: "Fraunces", fontWeight: 600, fontSize: 120 }}>SağOl</div>
    </div>
  );

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: r.zemin, color: r.murekkep, fontFamily: "DM Sans" }}>
        {govde}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "absolute", top: Y - 230, left: 0, width: G }}>
          <div style={{ display: "flex", fontSize: 40 }}>Sen de birine teşekkür et</div>
          <div style={{ display: "flex", fontSize: 32, color: r.ikincil, marginTop: 12 }}>sagol-theta.vercel.app</div>
        </div>
      </div>
    ),
    {
      width: G,
      height: Y,
      fonts,
      emoji: "twemoji",
      headers: {
        "Content-Disposition": 'inline; filename="sagol.png"',
        "Cache-Control": "public, max-age=86400, immutable",
      },
    },
  );
}
