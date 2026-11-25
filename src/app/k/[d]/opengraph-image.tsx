import { ImageResponse } from "next/og";
import { decodeCard, kesKodNoktasi, kodNoktasiUzunlugu, type Tema } from "@/lib/card";

export const alt = "SağOl teşekkür kartı";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const RENK: Record<Tema, { bg: string; fg: string }> = {
  sabah: { bg: "#fef3c7", fg: "#451a03" },
  cay: { bg: "#d1fae5", fg: "#022c22" },
  deniz: { bg: "#e0f2fe", fg: "#082f49" },
  lavanta: { bg: "#ede9fe", fg: "#2e1065" },
};

export default async function Image({
  params,
}: {
  params: Promise<{ d: string }>;
}) {
  const { d } = await params;
  const kart = decodeCard(d);
  const renk = kart ? RENK[kart.th] : RENK.sabah;

  const baslik = kart ? `Sevgili ${kart.to}` : "SağOl";
  const govde = kart
    ? kodNoktasiUzunlugu(kart.msg) > 120
      ? `${kesKodNoktasi(kart.msg, 120)}…`
      : kart.msg
    : "Birine 20 saniyede teşekkür et.";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: renk.bg,
          color: renk.fg,
        }}
      >
        <div style={{ display: "flex", fontSize: 64, fontWeight: 800 }}>
          {baslik}
        </div>
        <div style={{ display: "flex", fontSize: 44, lineHeight: 1.3 }}>
          {govde}
        </div>
        <div style={{ display: "flex", fontSize: 32 }}>SağOl</div>
      </div>
    ),
    { ...size },
  );
}
