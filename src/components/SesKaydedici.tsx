"use client";

import { useEffect, useRef, useState } from "react";

export type SesKaydi = { blob: Blob; mime: string; sureMs: number };

const MAX_MS = 20_000;
const MIMELER = [
  "audio/mp4;codecs=mp4a.40.2",
  "audio/mp4",
  "audio/webm;codecs=opus",
  "audio/webm",
];

function mimeSec(): string | null {
  if (typeof MediaRecorder === "undefined") return null;
  return MIMELER.find((m) => MediaRecorder.isTypeSupported(m)) ?? null;
}

const sn = (ms: number) => `0:${String(Math.min(20, Math.floor(ms / 1000))).padStart(2, "0")}`;
const dugme = "rounded-full border-2 border-stone-700 bg-white px-4 py-2 font-bold";

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
  const [mesaj, setMesaj] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nesne = useRef<{
    rec?: MediaRecorder;
    stream?: MediaStream;
    ctx?: AudioContext;
    raf?: number;
    zaman?: ReturnType<typeof setTimeout>;
    tik?: ReturnType<typeof setTimeout>;
    tepe: number;
    onizlemeUrl?: string;
  }>({ tepe: 0 });

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
    const n = nesne.current;
    n.stream = stream;
    n.tepe = 0;
    const parcalar: BlobPart[] = [];
    const rec = new MediaRecorder(stream, { mimeType: mime, audioBitsPerSecond: 32000 });
    n.rec = rec;
    const baslangic = performance.now();

    rec.ondataavailable = (e) => {
      if (e.data.size > 0) parcalar.push(e.data);
    };
    rec.onstop = () => {
      const sureMs = Math.min(MAX_MS, Math.round(performance.now() - baslangic));
      const tepe = n.tepe;
      temizle();
      setKayitta(false);
      if (tepe < 0.02) {
        setMesaj("Sesin gelmedi gibi. Tekrar dener misin?");
        onDegis(null);
        return;
      }
      const blob = new Blob(parcalar, { type: mime.split(";")[0] });
      const url = URL.createObjectURL(blob);
      if (n.onizlemeUrl) URL.revokeObjectURL(n.onizlemeUrl);
      n.onizlemeUrl = url;
      const kayit = { blob, mime: mime.split(";")[0], sureMs };
      setOnizleme({ url, kayit });
      onDegis(kayit);
    };

    // Canlı dalga formu (hareket azaltma açıksa çizilmez)
    const azalt = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    try {
      const ctx = new AudioContext();
      n.ctx = ctx;
      const analiz = ctx.createAnalyser();
      analiz.fftSize = 256;
      ctx.createMediaStreamSource(stream).connect(analiz);
      const veri = new Uint8Array(analiz.fftSize);
      const ciz = () => {
        analiz.getByteTimeDomainData(veri);
        let tepe = 0;
        for (const v of veri) tepe = Math.max(tepe, Math.abs(v - 128) / 128);
        n.tepe = Math.max(n.tepe, tepe);
        const c = canvasRef.current;
        if (c && !azalt) {
          const g = c.getContext("2d");
          if (g) {
            g.clearRect(0, 0, c.width, c.height);
            g.fillStyle = "#292524";
            const cubuk = 32;
            for (let i = 0; i < cubuk; i++) {
              const v = Math.abs(veri[Math.floor((i / cubuk) * veri.length)] - 128) / 128;
              const yuk = Math.max(3, v * c.height);
              g.fillRect(i * (c.width / cubuk), (c.height - yuk) / 2, c.width / cubuk - 2, yuk);
            }
          }
        }
        n.raf = requestAnimationFrame(ciz);
      };
      n.raf = requestAnimationFrame(ciz);
    } catch {
      n.tepe = 1; // analiz kurulamadı; sessizlik denetimini atla
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

  function sil() {
    setOnizleme(null);
    setMesaj("");
    onDegis(null);
  }

  if (!acik) {
    return (
      <div>
        <button type="button" onClick={() => setAcik(true)} className={dugme}>
          Sesini de ekle (isteğe bağlı)
        </button>
      </div>
    );
  }

  return (
    <section aria-label="Sesli teşekkür" className="rounded-2xl border-2 border-stone-300 bg-white p-4">
      <p className="font-bold">Sesli teşekkür</p>
      <p className="mt-1 text-sm">
        Sesin 7 gün saklanır, sonra silinir; istersen daha önce silebilirsin.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        {kayitta ? (
          <>
            <canvas ref={canvasRef} width={240} height={48} aria-hidden="true" className="max-w-full" />
            <span className="font-semibold tabular-nums">{sn(gecen)} / 0:20</span>
            <button type="button" onClick={dur} className={dugme}>
              Bitir
            </button>
          </>
        ) : onizleme ? (
          <>
            <audio controls src={onizleme.url} aria-label="Kaydını dinle" className="max-w-full" />
            <button type="button" onClick={basla} className={dugme}>
              Yeniden kaydet
            </button>
            <button type="button" onClick={sil} className={dugme}>
              Sil
            </button>
          </>
        ) : (
          <button type="button" onClick={basla} className={dugme}>
            Kayda başla
          </button>
        )}
      </div>
      <p role="status" aria-live="polite" className="mt-2 min-h-6 text-sm font-semibold">
        {mesaj}
      </p>
    </section>
  );
}
