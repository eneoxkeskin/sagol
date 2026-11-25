"use client";

import { useEffect, useRef, useState } from "react";
import SoundRing from "@/components/SoundRing";

type Durum =
  | { t: "yukleniyor" }
  | { t: "hazir"; url: string; tepeler: number[] | null }
  | { t: "doldu" }
  | { t: "hata" };

async function tepeleriCikar(buf: ArrayBuffer): Promise<number[]> {
  const ctx = new OfflineAudioContext(1, 1, 44100);
  const ses = await ctx.decodeAudioData(buf.slice(0));
  const veri = ses.getChannelData(0);
  const n = 48;
  const adim = Math.max(1, Math.floor(veri.length / n));
  const tepeler: number[] = [];
  for (let i = 0; i < n; i++) {
    let m = 0;
    for (let j = i * adim; j < Math.min(veri.length, (i + 1) * adim); j++) m = Math.max(m, Math.abs(veri[j]));
    tepeler.push(m);
  }
  const en = Math.max(...tepeler, 0.0001);
  return tepeler.map((v) => v / en);
}

const sure = (sn: number) =>
  `${Math.floor(sn / 60)}:${String(Math.floor(sn % 60)).padStart(2, "0")}`;

function OynatIkonu({ caliyor }: { caliyor: boolean }) {
  return caliyor ? (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
      <rect x="4" y="3" width="5" height="16" rx="1.5" fill="currentColor" />
      <rect x="13" y="3" width="5" height="16" rx="1.5" fill="currentColor" />
    </svg>
  ) : (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
      <path d="M6 3.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 6 3.5Z" fill="currentColor" />
    </svg>
  );
}

/** Alıcı ekranının ortasındaki halka. Ses varsa oynatıcı; yoksa "Teşekkür". Ses asla kendiliğinden çalmaz. */
export default function HalkaOynatici({
  id,
  peaks,
  seed,
  size = 220,
}: {
  id?: string;
  peaks: number[] | null;
  seed: number;
  size?: number;
}) {
  const [durum, setDurum] = useState<Durum>(id ? { t: "yukleniyor" } : { t: "doldu" });
  const [caliyor, setCaliyor] = useState(false);
  const [ilerleme, setIlerleme] = useState(0);
  const [toplam, setToplam] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const peaksYok = !peaks;

  useEffect(() => {
    if (!id) return;
    let iptal = false;
    let url: string | null = null;
    (async () => {
      try {
        const r = await fetch(`/api/ses/${id}`);
        if (r.status === 404) return void (!iptal && setDurum({ t: "doldu" }));
        if (!r.ok) return void (!iptal && setDurum({ t: "hata" }));
        const buf = await r.arrayBuffer();
        url = URL.createObjectURL(new Blob([buf], { type: r.headers.get("content-type") ?? "audio/mp4" }));
        let tepeler: number[] | null = null;
        if (peaksYok) {
          try {
            tepeler = await tepeleriCikar(buf);
          } catch {
            tepeler = null;
          }
        }
        if (!iptal) setDurum({ t: "hazir", url, tepeler });
      } catch {
        if (!iptal) setDurum({ t: "hata" });
      }
    })();
    return () => {
      iptal = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [id, peaksYok]);

  useEffect(() => {
    if (!caliyor) return;
    let raf = 0;
    const adim = () => {
      const a = audioRef.current;
      if (a && a.duration) setIlerleme(a.currentTime / a.duration);
      raf = requestAnimationFrame(adim);
    };
    raf = requestAnimationFrame(adim);
    return () => cancelAnimationFrame(raf);
  }, [caliyor]);

  const halkaPeaks = peaks ?? (durum.t === "hazir" ? durum.tepeler : null);
  const n = halkaPeaks ? 48 : 52;

  async function oynatDurdur() {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      try {
        await el.play();
      } catch {
        setDurum({ t: "hata" });
      }
    } else {
      el.pause();
    }
  }

  function atla(sn: number) {
    const el = audioRef.current;
    if (!el || !el.duration) return;
    el.currentTime = Math.min(el.duration, Math.max(0, el.currentTime + sn));
    setIlerleme(el.currentTime / el.duration);
  }

  const sesVar = id && durum.t !== "doldu" && durum.t !== "hata";

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
      {/* Slider ve oynat düğmesi kardeş öğeler: iç içe etkileşimli öğe yok. */}
      <div
        className="absolute inset-0 rounded-full"
        {...(sesVar && durum.t === "hazir"
          ? {
              role: "slider",
              tabIndex: 0,
              "aria-label": "Ses ilerlemesi",
              "aria-valuemin": 0,
              "aria-valuemax": 100,
              "aria-valuenow": Math.round(ilerleme * 100),
              "aria-valuetext": `${sure(ilerleme * toplam)} / ${sure(toplam)}`,
              onKeyDown: (e: React.KeyboardEvent) => {
                if (e.key === "ArrowRight") {
                  e.preventDefault();
                  atla(2);
                } else if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  atla(-2);
                } else if (e.key === " ") {
                  e.preventDefault();
                  void oynatDurdur();
                }
              },
            }
          : {})}
      >
        <SoundRing
          size={size}
          n={n}
          strokeWidth={4}
          peaks={halkaPeaks}
          seed={seed}
          progress={sesVar ? ilerleme : 1}
          colorOn="var(--murekkep)"
          colorOff="var(--murekkep)"
          offOpacity={0.3}
          ciz
        />
      </div>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1">
          {sesVar ? (
            <>
              <button
                className="pointer-events-auto flex size-16 items-center justify-center rounded-full bg-vurgu text-vurgu-yazi disabled:opacity-60"
                type="button"
                onClick={oynatDurdur}
                disabled={durum.t !== "hazir"}
                aria-label={caliyor ? "Duraklat" : "Sesi dinle"}
              >
                <OynatIkonu caliyor={caliyor} />
              </button>
              <span className="text-[13px] font-medium tabular-nums text-ikincil" aria-hidden="true">
                {durum.t === "yukleniyor" ? "…" : caliyor || ilerleme > 0 ? sure(ilerleme * toplam) : sure(toplam)}
              </span>
            </>
          ) : (
            <span className="font-baslik text-2xl font-semibold">Teşekkür</span>
          )}
        </div>
        {durum.t === "hazir" ? (
          <audio
            ref={audioRef}
            src={durum.url}
            preload="auto"
            onLoadedMetadata={(e) => {
              const d = e.currentTarget.duration;
              if (Number.isFinite(d)) setToplam(d);
            }}
            onPlay={() => setCaliyor(true)}
            onPause={() => setCaliyor(false)}
            onEnded={() => {
              setCaliyor(false);
              setIlerleme(0);
            }}
            onError={() => setDurum({ t: "hata" })}
          />
        ) : null}
      </div>
      {id && durum.t === "doldu" ? (
        <p className="mt-2 text-sm text-ikincil">Bu ses kaydının süresi dolmuş; yazılı teşekkür burada.</p>
      ) : null}
      {id && durum.t === "hata" ? (
        <p className="mt-2 text-sm text-ikincil">Ses şu an açılamadı; yazılı teşekkür burada.</p>
      ) : null}
    </div>
  );
}
