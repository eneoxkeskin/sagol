"use client";

import { useEffect, useRef, useState } from "react";
import SoundRing from "@/components/SoundRing";
import { cubuklar, varsayilanOlcu } from "@/lib/halka";

export type SesKaydi = { blob: Blob; mime: string; sureMs: number; peaks: number[] };

const MAX_MS = 20_000;
const N = 48;
const BOYUT = 220;
const OLCU = varsayilanOlcu(BOYUT);
const BOS_HALKA: readonly number[] = Array.from({ length: N }, () => 0.16);
const MIMELER = ["audio/mp4;codecs=mp4a.40.2", "audio/mp4", "audio/webm;codecs=opus", "audio/webm"];

function mimeSec(): string | null {
  if (typeof MediaRecorder === "undefined") return null;
  return MIMELER.find((m) => MediaRecorder.isTypeSupported(m)) ?? null;
}

const sn = (ms: number) => `0:${String(Math.min(20, Math.floor(ms / 1000))).padStart(2, "0")}`;
const ikincilDugme =
  "inline-flex min-h-11 items-center rounded-[22px] px-4 text-[15px] font-medium underline underline-offset-4";

function MerkezIkon({ tur }: { tur: "kayit" | "dur" | "oynat" | "duraklat" }) {
  if (tur === "kayit") return <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="currentColor" /></svg>;
  if (tur === "dur") return <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><rect x="5" y="5" width="12" height="12" rx="2" fill="currentColor" /></svg>;
  if (tur === "duraklat")
    return (
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
        <rect x="4" y="3" width="5" height="16" rx="1.5" fill="currentColor" />
        <rect x="13" y="3" width="5" height="16" rx="1.5" fill="currentColor" />
      </svg>
    );
  return <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><path d="M6 3.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 6 3.5Z" fill="currentColor" /></svg>;
}

/** Yaz-ve-kaydet ekranındaki halka (docs/DESIGN-V3.md · F). Kayıt sırasında halka sesin şekliyle dolar. */
export default function SesKaydedici({
  onDegis,
  baslangicAcik = false,
}: {
  onDegis: (k: SesKaydi | null) => void;
  baslangicAcik?: boolean;
}) {
  const [acik, setAcik] = useState(baslangicAcik);
  const [kayitta, setKayitta] = useState(false);
  const [gecen, setGecen] = useState(0);
  const [onizleme, setOnizleme] = useState<{ url: string; kayit: SesKaydi } | null>(null);
  const [caliyor, setCaliyor] = useState(false);
  const [mesaj, setMesaj] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);
  const cizgiler = useRef<(SVGLineElement | null)[]>([]);
  const nesne = useRef<{
    rec?: MediaRecorder;
    stream?: MediaStream;
    ctx?: AudioContext;
    raf?: number;
    zaman?: ReturnType<typeof setTimeout>;
    tik?: ReturnType<typeof setTimeout>;
    tepeler: number[];
    hamTepe: number;
    onizlemeUrl?: string;
  }>({ tepeler: [], hamTepe: 0 });

  function temizle() {
    const n = nesne.current;
    if (n.raf) cancelAnimationFrame(n.raf);
    if (n.zaman) clearTimeout(n.zaman);
    if (n.tik) clearTimeout(n.tik);
    n.stream?.getTracks().forEach((t) => t.stop());
    n.ctx?.close().catch(() => {});
    n.raf = n.zaman = n.tik = undefined;
    n.stream = n.ctx = undefined;
  }

  useEffect(() => {
    const n = nesne.current;
    return () => {
      temizle();
      if (n.onizlemeUrl) URL.revokeObjectURL(n.onizlemeUrl);
    };
  }, []);

  /** Canlı halka: React'e dokunmadan çubukları günceller. */
  function halkayiCiz(tepeler: number[], ilerleme: number) {
    const a = Array.from({ length: N }, (_, i) => Math.min(1, Math.max(0.16, tepeler[i] ?? 0.16)));
    const c = cubuklar({ size: BOYUT, r0: OLCU.r0, maxLen: OLCU.maxLen, a });
    c.forEach((k, i) => {
      const el = cizgiler.current[i];
      if (!el) return;
      el.setAttribute("x2", String(k.x2));
      el.setAttribute("y2", String(k.y2));
      el.setAttribute("stroke-opacity", i / N < ilerleme ? "1" : "0.35");
    });
  }

  async function basla() {
    setMesaj("");
    const mime = mimeSec();
    if (!mime || !navigator.mediaDevices?.getUserMedia) {
      setMesaj("Bu tarayıcı ses kaydını desteklemiyor. Yazılı teşekkür yine de gider.");
      return;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setMesaj("Mikrofona erişemedik. Dilersen yalnızca yazıyla devam edebilirsin.");
      return;
    }
    setOnizleme(null);
    const n = nesne.current;
    n.stream = stream;
    n.tepeler = Array.from({ length: N }, () => 0);
    n.hamTepe = 0;
    const parcalar: BlobPart[] = [];
    const rec = new MediaRecorder(stream, { mimeType: mime, audioBitsPerSecond: 32000 });
    n.rec = rec;
    const baslangic = performance.now();
    const temelMime = mime.split(";")[0];

    rec.ondataavailable = (e) => {
      if (e.data.size > 0) parcalar.push(e.data);
    };
    rec.onstop = () => {
      const sureMs = Math.min(MAX_MS, Math.round(performance.now() - baslangic));
      const ham = n.hamTepe;
      // Kaydedilmemiş dilimler (erken bitirme) en kısa çubuk kalır; normalize 0..1.
      const dolu = Math.max(1, Math.ceil((sureMs / MAX_MS) * N));
      const en = Math.max(...n.tepeler.slice(0, dolu), 0.0001);
      const peaks = n.tepeler.map((v, i) => (i < dolu ? Math.min(1, v / en) : 0));
      temizle();
      setKayitta(false);
      if (ham < 0.02) {
        setMesaj("Sesin gelmedi gibi. Tekrar dener misin?");
        onDegis(null);
        return;
      }
      const blob = new Blob(parcalar, { type: temelMime });
      const url = URL.createObjectURL(blob);
      if (n.onizlemeUrl) URL.revokeObjectURL(n.onizlemeUrl);
      n.onizlemeUrl = url;
      const kayit: SesKaydi = { blob, mime: temelMime, sureMs, peaks };
      setOnizleme({ url, kayit });
      onDegis(kayit);
    };

    const azalt = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let sonCizim = 0;
    try {
      const ctx = new AudioContext();
      n.ctx = ctx;
      const analiz = ctx.createAnalyser();
      analiz.fftSize = 512;
      ctx.createMediaStreamSource(stream).connect(analiz);
      const veri = new Uint8Array(analiz.fftSize);
      const adim = (zaman: number) => {
        analiz.getByteTimeDomainData(veri);
        let tepe = 0;
        for (const v of veri) tepe = Math.max(tepe, Math.abs(v - 128) / 128);
        n.hamTepe = Math.max(n.hamTepe, tepe);
        const gecenMs = performance.now() - baslangic;
        const idx = Math.min(N - 1, Math.floor((gecenMs / MAX_MS) * N));
        n.tepeler[idx] = Math.max(n.tepeler[idx], tepe);
        // Hareket azaltılmışsa saniyede 4 kez, değilse her karede çiz.
        if (!azalt || zaman - sonCizim > 250) {
          sonCizim = zaman;
          const goster = n.tepeler.map((v) => Math.min(1, v * 2.2));
          halkayiCiz(goster, gecenMs / MAX_MS);
        }
        n.raf = requestAnimationFrame(adim);
      };
      n.raf = requestAnimationFrame(adim);
    } catch {
      n.hamTepe = 1; // analiz kurulamadı; sessizlik denetimini atla
      n.tepeler = Array.from({ length: N }, () => 0.5);
    }

    const tikla = () => {
      setGecen(performance.now() - baslangic);
      n.tik = setTimeout(tikla, 250);
    };
    tikla();
    n.zaman = setTimeout(() => rec.state !== "inactive" && rec.stop(), MAX_MS);
    rec.start();
    setKayitta(true);
  }

  function dur() {
    const rec = nesne.current.rec;
    if (rec && rec.state !== "inactive") rec.stop();
  }

  async function dinle() {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      try {
        await el.play();
      } catch {
        setMesaj("Önizleme çalınamadı.");
      }
    } else el.pause();
  }

  function sil() {
    audioRef.current?.pause();
    setOnizleme(null);
    setMesaj("");
    onDegis(null);
  }

  if (!acik) {
    return (
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setAcik(true)}
          className="inline-flex h-14 items-center rounded-[28px] border-2 border-murekkep px-6 text-base font-bold"
        >
          Sesle ekle
        </button>
      </div>
    );
  }

  const merkez = kayitta
    ? { tur: "dur" as const, etiket: "Kaydı bitir", tik: dur }
    : onizleme
      ? { tur: caliyor ? ("duraklat" as const) : ("oynat" as const), etiket: caliyor ? "Duraklat" : "Kaydını dinle", tik: dinle }
      : { tur: "kayit" as const, etiket: "Kayda başla", tik: basla };

  return (
    <section aria-label="Sesli teşekkür" className="flex flex-col items-center">
      <p className="mb-3 text-center text-[15px] text-ikincil">
        Ses 7 gün saklanır, istediğin zaman silebilirsin.
      </p>
      <div className="relative" style={{ width: BOYUT, height: BOYUT }}>
        <SoundRing
          size={BOYUT}
          n={N}
          strokeWidth={4}
          peaks={onizleme ? onizleme.kayit.peaks : BOS_HALKA}
          progress={onizleme ? 1 : 0}
          colorOn="var(--murekkep)"
          colorOff="var(--murekkep)"
          offOpacity={0.35}
          cubukRef={onizleme ? undefined : (i, el) => (cizgiler.current[i] = el)}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <button
            type="button"
            onClick={merkez.tik}
            aria-label={merkez.etiket}
            className="flex size-16 items-center justify-center rounded-full bg-vurgu text-vurgu-yazi"
          >
            <MerkezIkon tur={merkez.tur} />
          </button>
          <span className="text-[13px] font-medium tabular-nums text-ikincil" aria-hidden={!kayitta}>
            {kayitta ? `${sn(gecen)} / 0:20` : onizleme ? sn(onizleme.kayit.sureMs) : "0:00 / 0:20"}
          </span>
        </div>
      </div>
      {onizleme ? (
        <>
          <audio
            ref={audioRef}
            src={onizleme.url}
            onPlay={() => setCaliyor(true)}
            onPause={() => setCaliyor(false)}
            onEnded={() => setCaliyor(false)}
          />
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={basla} className={ikincilDugme}>
              Yeniden kaydet
            </button>
            <button type="button" onClick={sil} className={ikincilDugme}>
              Sesi kaldır
            </button>
          </div>
        </>
      ) : null}
      <p role="status" aria-live="polite" className="mt-2 min-h-6 text-center text-sm font-medium">
        {mesaj}
      </p>
    </section>
  );
}
