import { cubuklar, genlikler, varsayilanOlcu } from "@/lib/halka";

export type SoundRingProps = {
  size: number;
  n: number;
  strokeWidth: number;
  r0?: number;
  maxLen?: number;
  progress?: number;
  colorOn?: string;
  colorOff?: string;
  offOpacity?: number;
  peaks?: readonly number[] | null;
  seed?: number;
  /** Çizilerek belirme (yalnızca motion-safe). */
  ciz?: boolean;
  className?: string;
  /** Canlı kayıt için çubuk öğelerine erişim (yalnızca istemci bileşenlerinden). */
  cubukRef?: (i: number, el: SVGLineElement | null) => void;
  title?: string;
};

/** Ses halkası: docs/DESIGN-V3.md. Saf SVG; sunucu ve istemcide çalışır. */
export default function SoundRing({
  size,
  n,
  strokeWidth,
  r0,
  maxLen,
  progress = 0,
  colorOn = "currentColor",
  colorOff = "currentColor",
  offOpacity = 0.35,
  peaks,
  seed = 0,
  ciz = false,
  className = "",
  cubukRef,
  title,
}: SoundRingProps) {
  const olcu = varsayilanOlcu(size);
  const a = genlikler(n, { peaks, seed });
  const c = cubuklar({ size, r0: r0 ?? olcu.r0, maxLen: maxLen ?? olcu.maxLen, a });
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {c.map((k, i) => {
        const acik = i / n < progress;
        return (
          <line
            key={i}
            ref={cubukRef ? (el) => cubukRef(i, el) : undefined}
            x1={k.x1}
            y1={k.y1}
            x2={k.x2}
            y2={k.y2}
            stroke={acik ? colorOn : colorOff}
            strokeOpacity={acik ? 1 : offOpacity}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className={ciz ? "motion-safe:animate-[halka-belir_300ms_ease-out_backwards]" : undefined}
            style={ciz ? { animationDelay: `${Math.round((i / n) * 300)}ms` } : undefined}
          />
        );
      })}
    </svg>
  );
}
