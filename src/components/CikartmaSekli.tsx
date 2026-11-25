import { emojiBul, type CikartmaTuru } from "@/lib/cikartma";

const KONTUR = "#1B1306";
const SW = 1.5;

/**
 * Çıkartma çizimi (32×32 viewBox). Yalnızca path/circle/line/text: hem DOM'da hem next/og'de (Satori) çalışır.
 * `murekkep`: parıltının rengi (temanın mürekkebi).
 */
export default function CikartmaSekli({
  k,
  murekkep = "currentColor",
  boyut,
}: {
  k: CikartmaTuru;
  murekkep?: string;
  boyut?: number | string;
}) {
  const ortak = { width: boyut ?? "100%", height: boyut ?? "100%", viewBox: "0 0 32 32" } as const;
  const emoji = emojiBul(k);
  if (emoji) {
    return (
      <svg {...ortak} aria-hidden="true">
        <text x="16" y="25" fontSize="24" textAnchor="middle">
          {emoji}
        </text>
      </svg>
    );
  }
  switch (k) {
    case "kalp":
      return (
        <svg {...ortak} aria-hidden="true">
          <path d="M16 27.5s-10.5-6.3-10.5-13.6A5.7 5.7 0 0 1 16 10.6a5.7 5.7 0 0 1 10.5 3.3c0 7.3-10.5 13.6-10.5 13.6Z" fill="#E5484D" stroke={KONTUR} strokeWidth={SW} strokeLinejoin="round" />
        </svg>
      );
    case "yildiz":
      return (
        <svg {...ortak} aria-hidden="true">
          <path d="M16 3.5l3.7 7.8 8.5 1-6.3 5.8 1.7 8.4L16 22.3l-7.6 4.2 1.7-8.4-6.3-5.8 8.5-1Z" fill="#FFFFFF" stroke={KONTUR} strokeWidth={SW} strokeLinejoin="round" />
        </svg>
      );
    case "parilti":
      return (
        <svg {...ortak} aria-hidden="true">
          <path d="M16 3c1.3 7.4 5.6 11.7 13 13-7.4 1.3-11.7 5.6-13 13-1.3-7.4-5.6-11.7-13-13 7.4-1.3 11.7-5.6 13-13Z" fill={murekkep} />
        </svg>
      );
    case "cicek": {
      const yapraklar = [0, 72, 144, 216, 288].map((a) => {
        const t = ((a - 90) * Math.PI) / 180;
        return { cx: 16 + 7 * Math.cos(t), cy: 16 + 7 * Math.sin(t) };
      });
      return (
        <svg {...ortak} aria-hidden="true">
          {yapraklar.map((p, i) => (
            <circle key={i} cx={p.cx.toFixed(2)} cy={p.cy.toFixed(2)} r="5.6" fill="#FF8FB1" stroke={KONTUR} strokeWidth={SW} />
          ))}
          <circle cx="16" cy="16" r="4.2" fill="#FFD23F" stroke={KONTUR} strokeWidth={SW} />
        </svg>
      );
    }
    case "gunes": {
      const isinlar = Array.from({ length: 8 }, (_, i) => {
        const t = (i * Math.PI) / 4;
        return { x1: 16 + 10 * Math.cos(t), y1: 16 + 10 * Math.sin(t), x2: 16 + 14 * Math.cos(t), y2: 16 + 14 * Math.sin(t) };
      });
      return (
        <svg {...ortak} aria-hidden="true">
          {isinlar.map((l, i) => (
            <line key={i} x1={l.x1.toFixed(2)} y1={l.y1.toFixed(2)} x2={l.x2.toFixed(2)} y2={l.y2.toFixed(2)} stroke={KONTUR} strokeWidth={2} strokeLinecap="round" />
          ))}
          <circle cx="16" cy="16" r="7.5" fill="#FF9F1C" stroke={KONTUR} strokeWidth={SW} />
        </svg>
      );
    }
    case "yaprak":
      return (
        <svg {...ortak} aria-hidden="true">
          <path d="M5.5 26.5C5.5 14.5 13.5 5.8 27 5c-.8 13.5-9.5 21.5-21.5 21.5Z" fill="#2E7D4F" stroke={KONTUR} strokeWidth={SW} strokeLinejoin="round" />
          <path d="M6.5 25.5 20 12" stroke={KONTUR} strokeWidth={SW} strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}
