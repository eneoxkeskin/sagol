import type { ReactNode } from "react";
import SoundRing from "@/components/SoundRing";
import type { Tema } from "@/lib/card";
import { tohum } from "@/lib/halka";

/** 342×380 oranlı kart (docs/DESIGN-V3.md · G). Çıkartma katmanı `children` ile üstüne gelir. */
export default function KartOnizleme({
  to,
  msg,
  from,
  th,
  peaks,
  children,
  className = "",
}: {
  to: string;
  msg: string;
  from?: string;
  th: Tema;
  peaks?: number[] | null;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      data-tema={th}
      className={`relative mx-auto aspect-[342/380] w-full max-w-[342px] overflow-hidden rounded-[28px] shadow-[0_1px_0_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.12)] ${className}`}
    >
      <div className="flex h-full flex-col items-center px-5 pb-5 pt-4 text-center">
        <div className="relative w-[58%]">
          <SoundRing
            size={200}
            n={peaks ? 48 : 52}
            strokeWidth={3.5}
            peaks={peaks}
            seed={tohum(to, msg)}
            progress={1}
            colorOn="var(--murekkep)"
            className="h-auto w-full"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8">
            <span className="font-baslik text-[13px] italic text-ikincil">Sevgili</span>
            <span className="line-clamp-2 font-baslik text-lg font-semibold leading-tight [overflow-wrap:anywhere]">
              {to || "…"}
            </span>
          </div>
        </div>
        <p className="mt-3 line-clamp-4 whitespace-pre-line font-baslik text-[15px] italic leading-snug [overflow-wrap:anywhere]">
          {msg || "Teşekkürün burada görünecek."}
        </p>
        {from ? (
          <p className="mt-auto self-end font-baslik text-sm italic text-ikincil [overflow-wrap:anywhere]">— {from}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}
