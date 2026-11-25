import CikartmaSekli from "@/components/CikartmaSekli";
import { CIKARTMA_TABAN, type Cikartma } from "@/lib/cikartma";

/** Salt gösterim: kart oranlı kutunun üstüne çıkartmaları yerleştirir (konumlar kutuya oransal). */
export default function CikartmaKatmani({ st, className = "" }: { st: readonly Cikartma[]; className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${className}`}>
      {st.map((c, i) => (
        <div
          key={i}
          className="absolute aspect-square"
          style={{
            left: `${c.x * 100}%`,
            top: `${c.y * 100}%`,
            width: `${CIKARTMA_TABAN * c.s * 100}%`,
            transform: `translate(-50%, -50%) rotate(${c.r}deg)`,
          }}
        >
          <CikartmaSekli k={c.k} murekkep="var(--murekkep)" />
        </div>
      ))}
    </div>
  );
}
