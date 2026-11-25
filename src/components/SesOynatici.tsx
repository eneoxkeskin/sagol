"use client";

import { useEffect, useRef, useState } from "react";

const CUBUK = 64;

type Durum =
  | { t: "yukleniyor" }
  | { t: "hazir"; url: string; tepeler: number[] }
  | { t: "doldu" }
  | { t: "hata" };

async function tepeleriCikar(buf: ArrayBuffer): Promise<number[]> {
  const ctx = new OfflineAudioContext(1, 1, 44100);
  const ses = await ctx.decodeAudioData(buf.slice(0));
  const veri = ses.getChannelData(0);
  const adim = Math.max(1, Math.floor(veri.length / CUBUK));
  const tepeler: number[] = [];
  for (let i = 0; i < CUBUK; i++) {
    let m = 0;
    for (let j = i * adim; j < Math.min(veri.length, (i + 1) * adim); j++) {
      m = Math.max(m, Math.abs(veri[j]));
    }
    tepeler.push(m);
  }
  const en = Math.max(...tepeler, 0.0001);
  return tepeler.map((v) => v / en);
}

export default function SesOynatici({ id }: { id: string }) {
  const [durum, setDurum] = useState<Durum>({ t: "yukleniyor" });
  const [caliyor, setCaliyor] = useState(false);
  const [ilerleme, setIlerleme] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    let iptal = false;
    let url: string | null = null;
    (async () => {
      try {
        const r = await fetch(`/api/ses/${id}`);
        if (r.status === 404) return !iptal && setDurum({ t: "doldu" });
        if (!r.ok) return !iptal && setDurum({ t: "hata" });
        const buf = await r.arrayBuffer();
        const blob = new Blob([buf], { type: r.headers.get("content-type") ?? "audio/mp4" });
        url = URL.createObjectURL(blob);
        let tepeler: number[];
        try {
          tepeler = await tepeleriCikar(buf);
        } catch {
          tepeler = Array.from({ length: CUBUK }, () => 0.35); // çözülemezse düz çubuklar
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
  }, [id]);

  useEffect(() => {
    if (!caliyor) return;
    let raf = 0;
    const ciz = () => {
      const a = audioRef.current;
      if (a && a.duration) setIlerleme(a.currentTime / a.duration);
      raf = requestAnimationFrame(ciz);
    };
    raf = requestAnimationFrame(ciz);
    return () => cancelAnimationFrame(raf);
  }, [caliyor]);

  if (durum.t === "yukleniyor") return <p className="mt-6 text-base">Ses hazırlanıyor…</p>;
  if (durum.t === "doldu") {
    return <p className="mt-6 text-base">Bu ses kaydının süresi dolmuş; yazılı teşekkür burada.</p>;
  }
  if (durum.t === "hata") {
    return <p className="mt-6 text-base">Ses şu an açılamadı; yazılı teşekkür burada.</p>;
  }

  const a = () => audioRef.current;
  async function oynatDurdur() {
    const el = a();
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
    const el = a();
    if (!el || !el.duration) return;
    el.currentTime = Math.min(el.duration, Math.max(0, el.currentTime + sn));
    setIlerleme(el.currentTime / el.duration);
  }

  return (
    <div className="mt-6 flex items-center gap-4">
      <audio
        ref={audioRef}
        src={durum.url}
        preload="auto"
        onPlay={() => setCaliyor(true)}
        onPause={() => setCaliyor(false)}
        onEnded={() => {
          setCaliyor(false);
          setIlerleme(0);
        }}
        onError={() => setDurum({ t: "hata" })}
      />
      <button
        type="button"
        onClick={oynatDurdur}
        aria-label={caliyor ? "Duraklat" : "Sesi dinle"}
        className="flex size-14 shrink-0 items-center justify-center rounded-full bg-stone-900 text-white"
      >
        <span aria-hidden="true" className="text-xl">{caliyor ? "❚❚" : "▶"}</span>
      </button>
      <div
        role="slider"
        tabIndex={0}
        aria-label="Ses ilerlemesi"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(ilerleme * 100)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") { e.preventDefault(); atla(2); }
          else if (e.key === "ArrowLeft") { e.preventDefault(); atla(-2); }
          else if (e.key === " ") { e.preventDefault(); void oynatDurdur(); }
        }}
        className="flex h-14 flex-1 items-center gap-[2px]"
      >
        {durum.tepeler.map((v, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="w-full rounded-full bg-current"
            style={{
              height: `${Math.max(8, v * 100)}%`,
              opacity: i / CUBUK <= ilerleme ? 1 : 0.3,
            }}
          />
        ))}
      </div>
    </div>
  );
}
