import type { Tema } from "@/lib/card";

type Props = {
  to: string;
  msg: string;
  from?: string;
  th: Tema;
  className?: string;
};

const TEMA_SINIF: Record<Tema, string> = {
  sabah: "bg-amber-100 border-amber-300 text-amber-950",
  cay: "bg-emerald-100 border-emerald-300 text-emerald-950",
  deniz: "bg-sky-100 border-sky-300 text-sky-950",
  lavanta: "bg-violet-100 border-violet-300 text-violet-950",
};

export default function Kart({ to, msg, from, th, className = "" }: Props) {
  return (
    <article
      className={`rounded-3xl border-2 p-6 shadow-sm ${TEMA_SINIF[th]} ${className}`}
    >
      <p className="text-sm font-semibold opacity-80">Sevgili</p>
      <h2 className="mt-1 break-words text-2xl font-extrabold">{to || "…"}</h2>
      <p className="mt-4 whitespace-pre-line break-words text-lg leading-relaxed">
        {msg || "Teşekkürün burada görünecek."}
      </p>
      {from ? (
        <p className="mt-5 break-words text-right text-sm font-semibold">
          — {from}
        </p>
      ) : null}
    </article>
  );
}
