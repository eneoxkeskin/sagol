import { cubuklar, genlikler, varsayilanOlcu } from "@/lib/halka";

/** next/og (Satori) için halka: CSS değişkeni yok, renkler açık hex. */
export default function HalkaOg({
  size,
  n,
  strokeWidth,
  renk,
  peaks,
  seed = 0,
}: {
  size: number;
  n: number;
  strokeWidth: number;
  renk: string;
  peaks?: readonly number[] | null;
  seed?: number;
}) {
  const { r0, maxLen } = varsayilanOlcu(size);
  const c = cubuklar({ size, r0, maxLen, a: genlikler(n, { peaks, seed }) });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {c.map((k, i) => (
        <line key={i} x1={k.x1} y1={k.y1} x2={k.x2} y2={k.y2} stroke={renk} strokeWidth={strokeWidth} strokeLinecap="round" />
      ))}
    </svg>
  );
}
