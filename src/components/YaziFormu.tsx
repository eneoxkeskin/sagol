"use client";

import Link from "next/link";
import { useState, useSyncExternalStore, type ReactNode } from "react";
import KartOnizleme from "@/components/KartOnizleme";
import SesKaydedici, { type SesKaydi } from "@/components/SesKaydedici";
import TaslakYardimcisi from "@/components/TaslakYardimcisi";
import {
  LIMITLER,
  TEMALAR,
  encodeCard,
  kesKodNoktasi,
  kodNoktasiUzunlugu,
  type Kart,
  type Tema,
} from "@/lib/card";
import type { Cikartma } from "@/lib/cikartma";
import { ekle } from "@/lib/defter";
import CikartmaKatmani from "@/components/CikartmaKatmani";
import KartSusle from "@/components/KartSusle";
import { peaksKodla } from "@/lib/halka";
import { TEMA_AD, TEMA_RENK } from "@/lib/tema";

const IPUCLARI = [
  "Zor günümde yanımda olduğun için…",
  "Bana zaman ayırdığın için…",
  "Beni güldürdüğün için…",
  "Her zaman dinlediğin için…",
  "Küçük bir iyilik yaptığın için…",
  "Bana inandığın için…",
];

const bosAbone = () => () => {};
const canShare = () => typeof navigator !== "undefined" && "share" in navigator;

const birincil =
  "inline-flex h-14 w-full items-center justify-center rounded-[28px] bg-vurgu px-6 text-lg font-bold text-vurgu-yazi disabled:cursor-not-allowed disabled:opacity-50";
const ikincil =
  "inline-flex h-14 w-full items-center justify-center rounded-[28px] border-2 border-murekkep px-6 text-base font-bold";
const metinLink = "inline-flex min-h-11 items-center text-[15px] font-medium underline underline-offset-4";

type Yuklenen = { id: string; token: string; bitis: number };

/** Sonda virgül/boşluk (yer tutucu "Annem," alışkanlığı) adın parçası sayılmaz. */
const adTemizle = (s: string) => s.trim().replace(/[\s,]+$/u, "");

function TemaSecici({ th, setTh }: { th: Tema; setTh: (t: Tema) => void }) {
  return (
    <div role="radiogroup" aria-label="Tema" className="flex">
      {TEMALAR.map((t, i) => (
        <button
          key={t}
          id={`tema-${t}`}
          type="button"
          role="radio"
          aria-checked={th === t}
          aria-label={`${TEMA_AD[t]} teması`}
          tabIndex={th === t ? 0 : -1}
          onClick={() => setTh(t)}
          onKeyDown={(e) => {
            const yon = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
            if (!yon) return;
            e.preventDefault();
            const yeni = TEMALAR[(i + yon + TEMALAR.length) % TEMALAR.length];
            setTh(yeni);
            document.getElementById(`tema-${yeni}`)?.focus();
          }}
          className="flex size-11 items-center justify-center rounded-full"
        >
          <span
            className={`block size-6 rounded-full border-murekkep ${th === t ? "border-[3px]" : "border"}`}
            style={{ backgroundColor: TEMA_RENK[t].zemin }}
          />
        </button>
      ))}
    </div>
  );
}

export default function YaziFormu({
  h,
  baslangicKime = "",
  sayac = false,
  ses = false,
  sesBaslangicAcik = false,
  ust,
}: {
  h: number;
  baslangicKime?: string;
  sayac?: boolean;
  ses?: boolean;
  sesBaslangicAcik?: boolean;
  /** Sunucudan gelen küçük içerik (ör. "Bugün N teşekkür edildi"). */
  ust?: ReactNode;
}) {
  const [adim, setAdim] = useState<"yaz" | "susle" | "hazir">("yaz");
  const [st, setSt] = useState<Cikartma[]>([]);
  const [paylasildi, setPaylasildi] = useState(false);
  const [kayit, setKayit] = useState<SesKaydi | null>(null);
  const [yuklenen, setYuklenen] = useState<Yuklenen | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [silLink, setSilLink] = useState<string | null>(null);
  const [to, setTo] = useState(baslangicKime);
  const [msg, setMsg] = useState("");
  const [from, setFrom] = useState("");
  const [th, setTh] = useState<Tema>("sabah");
  const [link, setLink] = useState<string | null>(null);
  /** Hazır adımında gösterilen, karta gerçekten yazılan çıkartmalar ("Atla" ise boş). */
  const [kartSt, setKartSt] = useState<Cikartma[]>([]);
  const [durum, setDurum] = useState("");
  const paylasilabilir = useSyncExternalStore(bosAbone, canShare, () => false);

  const kime = adTemizle(to);
  const hazir = kime.length > 0 && msg.trim().length > 0;
  const kalan = LIMITLER.msg - kodNoktasiUzunlugu(msg);
  const sesPeaks = yuklenen && kayit ? kayit.peaks : null;

  function ipucu(s: string) {
    const yeni = msg.trim() ? `${msg.trimEnd()} ${s}` : s;
    setMsg(kesKodNoktasi(yeni, LIMITLER.msg));
  }

  async function sesiYukle(k: SesKaydi): Promise<Yuklenen | null> {
    try {
      const r = await fetch("/api/ses", {
        method: "POST",
        headers: { "Content-Type": k.mime, "X-Sure-Ms": String(k.sureMs), "X-Peaks": peaksKodla(k.peaks) },
        body: k.blob,
      });
      if (!r.ok) return null;
      const j: unknown = await r.json();
      if (
        typeof j === "object" && j !== null &&
        typeof (j as { id?: unknown }).id === "string" &&
        typeof (j as { token?: unknown }).token === "string" &&
        typeof (j as { bitis?: unknown }).bitis === "number"
      ) {
        return j as Yuklenen;
      }
      return null;
    } catch {
      return null;
    }
  }

  /** 1. adım: sesi (varsa) yükler, süsleme adımına geçer. */
  async function olustur() {
    if (!hazir || yukleniyor) return;
    if (ses && kayit && !yuklenen) {
      setYukleniyor(true);
      setDurum("Ses hazırlanıyor…");
      const ek = await sesiYukle(kayit);
      setYukleniyor(false);
      if (ek) {
        setYuklenen(ek);
        setDurum("");
      } else {
        setDurum("Ses yüklenemedi; kartın yazılı olarak gidecek.");
      }
    } else {
      setDurum("");
    }
    setAdim("susle");
  }

  /** 2. adım: kartı kodlar, deftere ekler, linki hazırlar. */
  function bitir(cikartmalar: Cikartma[]) {
    const ek = yuklenen;
    const kart: Kart = {
      v: 2,
      to: kime,
      msg: msg.trim(),
      ...(from.trim() ? { from: from.trim() } : {}),
      th,
      h,
      ...(ek ? { s: ek.id } : {}),
      ...(ek && kayit ? { p: peaksKodla(kayit.peaks) } : {}),
      ...(cikartmalar.length > 0 ? { st: cikartmalar } : {}),
      t: Math.floor(Date.now() / 1000),
    };
    const d = encodeCard(kart);
    if (d.length > LIMITLER.dMax) {
      setDurum("Kart biraz uzun oldu. Mesajı ya da adları kısaltır mısın?");
      return;
    }
    setDurum("");
    const sil = ek ? `${window.location.origin}/sil#${ek.id}.${ek.token}` : null;
    setSilLink(sil);
    ekle("gonderilen", d, ek?.bitis, sil ?? undefined);
    if (sayac) {
      // Anonim günlük sayaç; gövde yok. Hata akışı etkilemez.
      fetch("/api/sayac", { method: "POST", keepalive: true }).catch(() => {});
    }
    setKartSt(cikartmalar);
    setLink(`${window.location.origin}/k/${d}`);
    setAdim("hazir");
  }

  async function kopyala() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setDurum("Kopyalandı");
      setPaylasildi(true);
    } catch {
      setDurum("Kopyalanamadı; linki elle seçip kopyalayabilirsin.");
    }
  }

  async function paylas() {
    if (!link) return;
    try {
      await navigator.share({ title: `${kime} için bir teşekkür`, url: link });
      setPaylasildi(true);
    } catch {
      // kullanıcı vazgeçti; sorun yok
    }
  }

  const ustSerit = (
    <header className="flex items-center justify-between">
      <Link href="/" className="font-baslik text-xl font-semibold">
        SağOl
      </Link>
      {adim === "yaz" ? <TemaSecici th={th} setTh={setTh} /> : null}
    </header>
  );

  if (adim === "susle") {
    return (
      <div data-tema={th} className="flex min-h-dvh flex-1 flex-col px-6 pb-10 pt-6">
        <div className="mx-auto w-full max-w-[440px]">
          {ustSerit}
          <KartSusle
            to={kime}
            msg={msg.trim()}
            from={from.trim() || undefined}
            th={th}
            peaks={sesPeaks}
            st={st}
            setSt={setSt}
            onBitti={() => bitir(st)}
            onAtla={() => bitir([])}
          />
          <p role="status" aria-live="polite" className="mt-2 min-h-6 text-center font-medium">
            {durum}
          </p>
          <p className="text-center">
            <button type="button" onClick={() => setAdim("yaz")} className={metinLink}>
              Yazıya dön
            </button>
          </p>
        </div>
      </div>
    );
  }

  if (adim === "hazir" && link) {
    const wa = `https://wa.me/?text=${encodeURIComponent(`${kime} için bir teşekkür yazdım: ${link}`)}`;
    return (
      <div data-tema={th} className="flex min-h-dvh flex-1 flex-col px-6 pb-10 pt-6">
        <div className="mx-auto w-full max-w-[440px]">
          {ustSerit}
          <section className="mt-6 text-center">
            <h1 ref={(el) => el?.focus()} tabIndex={-1} className="mb-5 font-baslik text-3xl font-semibold outline-none">
              Kartın hazır
            </h1>
            <KartOnizleme to={kime} msg={msg.trim()} from={from.trim() || undefined} th={th} peaks={sesPeaks}>
              {kartSt.length > 0 ? <CikartmaKatmani st={kartSt} /> : null}
            </KartOnizleme>
            <p role="status" aria-live="polite" className="mt-6 min-h-7 font-baslik text-xl">
              {paylasildi ? "Birinin gününü güzelleştirdin." : ""}
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {paylasilabilir ? (
                <button type="button" onClick={paylas} className={birincil}>
                  Paylaş
                </button>
              ) : null}
              <a href={wa} onClick={() => setPaylasildi(true)} target="_blank" rel="noopener noreferrer" className={ikincil}>
                WhatsApp
              </a>
              <button type="button" onClick={kopyala} className={ikincil}>
                Linki kopyala
              </button>
            </div>
            {silLink ? (
              <div className="mt-5 rounded-[22px] bg-kutu p-4 text-left">
                <p className="font-medium">Bu linkle sesi istediğin an silebilirsin. Yalnızca sende kalsın.</p>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(silLink);
                      setDurum("Silme linki kopyalandı");
                    } catch {
                      setDurum("Kopyalanamadı; silme linkini elle seçip kopyalayabilirsin.");
                    }
                  }}
                  className={metinLink}
                >
                  Silme linkini kopyala
                </button>
                <p className="break-all text-sm text-ikincil">{silLink}</p>
              </div>
            ) : null}
            <p role="status" aria-live="polite" className="mt-3 min-h-6 font-medium">
              {durum}
            </p>
            <button
              type="button"
              onClick={() => {
                setAdim("yaz");
                setLink(null);
                setPaylasildi(false);
                setDurum("");
              }}
              className={metinLink}
            >
              Kartı düzenle
            </button>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div data-tema={th} className="flex min-h-dvh flex-1 flex-col px-6 pb-10 pt-6">
      <div className="mx-auto w-full max-w-[440px]">
        {ustSerit}
        <div className="mt-1 min-h-6 text-sm text-ikincil">{ust}</div>
        <h1 className="sr-only">Bugün kime teşekkür etmek istersin?</h1>

        <form
          className="mt-4 flex flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            void olustur();
          }}
        >
          <span className="font-baslik text-2xl italic text-ikincil" aria-hidden="true">
            Sevgili
          </span>
          <input
            aria-label="Kime teşekkür ediyorsun? (isim)"
            className="w-full bg-transparent font-baslik text-[clamp(2.5rem,15vw,4rem)] font-semibold leading-[1.05] placeholder:text-ikincil focus-visible:outline-offset-4"
            placeholder="Annem,"
            value={to}
            onChange={(e) => setTo(kesKodNoktasi(e.target.value, LIMITLER.to))}
            autoComplete="off"
          />
          <textarea
            aria-label="Mesajın"
            aria-describedby="kalan"
            rows={3}
            className="mt-4 min-h-[6.5em] w-full resize-none bg-transparent text-2xl leading-[1.35] placeholder:text-ikincil"
            placeholder="Bugün aklıma sen geldin…"
            value={msg}
            onChange={(e) => setMsg(kesKodNoktasi(e.target.value, LIMITLER.msg))}
          />
          <span id="kalan" className="text-right text-sm text-ikincil">
            {kalan} karakter kaldı
          </span>
          <div className="mt-2 flex items-baseline justify-end gap-1 font-baslik text-[22px] italic">
            <span aria-hidden="true">—</span>
            <input
              aria-label="Adın (isteğe bağlı)"
              className="w-1/2 min-w-0 bg-transparent text-right placeholder:text-ikincil"
              placeholder="adın"
              value={from}
              onChange={(e) => setFrom(kesKodNoktasi(e.target.value, LIMITLER.from))}
              autoComplete="off"
            />
          </div>

          <details className="mt-4">
            <summary className="inline-flex min-h-11 cursor-pointer items-center text-[15px] font-medium underline underline-offset-4">
              İlham al
            </summary>
            <div className="mt-2 flex flex-col gap-3">
              <TaslakYardimcisi onSec={(s) => setMsg(kesKodNoktasi(s, LIMITLER.msg))} />
              <div className="flex flex-wrap gap-2">
                {IPUCLARI.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => ipucu(s)}
                    className="min-h-11 rounded-[22px] bg-kutu px-4 text-left text-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </details>

          {ses ? (
            <div className="mt-6">
              <SesKaydedici
                baslangicAcik={sesBaslangicAcik}
                onDegis={(k) => {
                  setKayit(k);
                  setYuklenen(null);
                }}
              />
            </div>
          ) : null}

          <button type="submit" disabled={!hazir || yukleniyor} className={`mt-8 ${birincil}`}>
            Kartı oluştur
          </button>
          <p role="status" aria-live="polite" className="mt-2 min-h-6 text-center font-medium">
            {durum}
          </p>
          <p className="mt-2 text-center text-sm text-ikincil">
            {ses
              ? "Yazdığın metin sunucuya gitmez. Ses eklersen 7 gün saklanır, sonra silinir."
              : "Link kimdeyse kartı o görür. Hiçbir şey sunucuda saklanmaz."}
          </p>
        </form>

        <nav className="mt-6 flex justify-center gap-6" aria-label="Diğer sayfalar">
          <Link href="/sakladiklarim" className={metinLink}>
            Sakladıklarım
          </Link>
          <Link href="/hakkinda" className={metinLink}>
            Hakkında
          </Link>
        </nav>
      </div>
    </div>
  );
}
