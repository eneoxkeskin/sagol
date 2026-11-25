"use client";

import { useState, useSyncExternalStore } from "react";
import Kart from "@/components/Kart";
import {
  LIMITLER,
  TEMALAR,
  encodeCard,
  kesKodNoktasi,
  kodNoktasiUzunlugu,
  type Tema,
} from "@/lib/card";
import SesKaydedici, { type SesKaydi } from "@/components/SesKaydedici";
import TaslakYardimcisi from "@/components/TaslakYardimcisi";
import { ekle } from "@/lib/defter";

const IPUCLARI = [
  "Zor günümde yanımda olduğun için…",
  "Bana zaman ayırdığın için…",
  "Beni güldürdüğün için…",
  "Her zaman dinlediğin için…",
  "Küçük bir iyilik yaptığın için…",
  "Bana inandığın için…",
];

const TEMA_ETIKET: Record<Tema, string> = {
  sabah: "Sabah",
  cay: "Çay",
  deniz: "Deniz",
  lavanta: "Lavanta",
};

const TEMA_NOKTA: Record<Tema, string> = {
  sabah: "bg-amber-300",
  cay: "bg-emerald-300",
  deniz: "bg-sky-300",
  lavanta: "bg-violet-300",
};

const bosAbone = () => () => {};
const canShare = () => typeof navigator !== "undefined" && "share" in navigator;

const alan =
  "mt-1 w-full rounded-xl border-2 border-stone-400 bg-white px-3 py-2 text-base";

export default function YaziFormu({
  h,
  baslangicKime = "",
  sayac = false,
  ses = false,
  sesBaslangicAcik = false,
}: {
  h: number;
  baslangicKime?: string;
  sayac?: boolean;
  ses?: boolean;
  sesBaslangicAcik?: boolean;
}) {
  const [kayit, setKayit] = useState<SesKaydi | null>(null);
  const [yuklenen, setYuklenen] = useState<{ id: string; token: string; bitis: number } | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [silLink, setSilLink] = useState<string | null>(null);
  const [to, setTo] = useState(baslangicKime);
  const [msg, setMsg] = useState("");
  const [from, setFrom] = useState("");
  const [th, setTh] = useState<Tema>("sabah");
  const [link, setLink] = useState<string | null>(null);
  const [durum, setDurum] = useState("");
  const paylasilabilir = useSyncExternalStore(bosAbone, canShare, () => false);

  const hazir = to.trim().length > 0 && msg.trim().length > 0;
  const kalan = LIMITLER.msg - kodNoktasiUzunlugu(msg);

  function ipucu(s: string) {
    const yeni = msg.trim() ? `${msg.trimEnd()} ${s}` : s;
    setMsg(kesKodNoktasi(yeni, LIMITLER.msg));
  }

  async function sesiYukle(k: SesKaydi) {
    try {
      const r = await fetch("/api/ses", {
        method: "POST",
        headers: { "Content-Type": k.mime, "X-Sure-Ms": String(k.sureMs) },
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
        return j as { id: string; token: string; bitis: number };
      }
      return null;
    } catch {
      return null;
    }
  }

  async function olustur() {
    if (!hazir || yukleniyor) return;
    let ek = yuklenen;
    let not = "";
    if (ses && kayit && !ek) {
      setYukleniyor(true);
      setDurum("Ses hazırlanıyor…");
      ek = await sesiYukle(kayit);
      setYukleniyor(false);
      if (ek) setYuklenen(ek);
      else not = "Ses yüklenemedi; kartın yazılı olarak hazır.";
    }
    const d = encodeCard({
      v: 1,
      to: to.trim(),
      msg: msg.trim(),
      ...(from.trim() ? { from: from.trim() } : {}),
      th,
      h,
      ...(ek ? { s: ek.id } : {}),
      t: Math.floor(Date.now() / 1000),
    });
    if (d.length > LIMITLER.dMax) {
      setDurum("Kart biraz uzun oldu. Mesajı ya da adları kısaltır mısın?");
      return;
    }
    setDurum(not);
    setSilLink(ek ? `${window.location.origin}/sil#${ek.id}.${ek.token}` : null);
    ekle("gonderilen", d, ek?.bitis);
    if (sayac) {
      // Anonim günlük sayaç; gövde yok. Hata akışı etkilemez.
      fetch("/api/sayac", { method: "POST", keepalive: true }).catch(() => {});
    }
    setLink(`${window.location.origin}/k/${d}`);
  }

  async function kopyala() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setDurum("Kopyalandı");
    } catch {
      setDurum("Kopyalanamadı; linki elle seçip kopyalayabilirsin.");
    }
  }

  async function paylas() {
    if (!link) return;
    try {
      await navigator.share({
        title: `${to.trim()} için bir teşekkür`,
        url: link,
      });
    } catch {
      // kullanıcı vazgeçti; sorun yok
    }
  }

  if (link) {
    const wa = `https://wa.me/?text=${encodeURIComponent(
      `${to.trim()} için bir teşekkür yazdım: ${link}`,
    )}`;
    const dugme =
      "rounded-full border-2 border-stone-700 px-5 py-3 text-center font-bold";
    return (
      <section className="mt-6">
        <Kart to={to.trim()} msg={msg.trim()} from={from.trim()} th={th} />
        <p className="mt-6 text-lg font-bold">Birinin gününü güzelleştirdin.</p>
        <div className="mt-4 flex flex-col gap-3">
          {paylasilabilir ? (
            <button
              type="button"
              onClick={paylas}
              className={`${dugme} bg-stone-800 text-white`}
            >
              Paylaş
            </button>
          ) : null}
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className={dugme}
          >
            WhatsApp
          </a>
          <button type="button" onClick={kopyala} className={dugme}>
            Linki kopyala
          </button>
        </div>
        {silLink ? (
          <div className="mt-4 rounded-2xl border-2 border-stone-300 bg-white p-4">
            <p className="font-semibold">
              Bu linkle sesi istediğin an silebilirsin. Yalnızca sende kalsın.
            </p>
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
              className="mt-2 font-semibold underline underline-offset-4"
            >
              Silme linkini kopyala
            </button>
            <p className="mt-2 break-all text-sm">{silLink}</p>
          </div>
        ) : null}
        <p
          role="status"
          aria-live="polite"
          className="mt-3 min-h-6 font-semibold"
        >
          {durum}
        </p>
        <button
          type="button"
          onClick={() => {
            setLink(null);
            setDurum("");
          }}
          className="mt-2 font-semibold underline underline-offset-4"
        >
          Kartı düzenle
        </button>
      </section>
    );
  }

  return (
    <form
      className="mt-6 flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        olustur();
      }}
    >
      <label className="block font-bold">
        Kime
        <input
          className={alan}
          value={to}
          onChange={(e) => setTo(kesKodNoktasi(e.target.value, LIMITLER.to))}
          autoComplete="off"
        />
      </label>

      <TaslakYardimcisi onSec={(s) => setMsg(kesKodNoktasi(s, LIMITLER.msg))} />

      <div>
        <p className="font-bold">Bir başlangıç ister misin?</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {IPUCLARI.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => ipucu(s)}
              className="rounded-full border-2 border-stone-400 bg-white px-3 py-1 text-sm"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <label className="block font-bold">
        Mesajın
        <textarea
          className={`${alan} min-h-32`}
          value={msg}
          onChange={(e) => setMsg(kesKodNoktasi(e.target.value, LIMITLER.msg))}
        />
        <span className="block text-right text-sm font-normal text-muted">
          {kalan} karakter kaldı
        </span>
      </label>

      <label className="block font-bold">
        Kimden <span className="font-normal text-muted">(isteğe bağlı)</span>
        <input
          className={alan}
          value={from}
          onChange={(e) =>
            setFrom(kesKodNoktasi(e.target.value, LIMITLER.from))
          }
          autoComplete="off"
        />
      </label>

      <fieldset>
        <legend className="font-bold">Tema</legend>
        <div className="mt-2 flex flex-wrap gap-4">
          {TEMALAR.map((t) => (
            <label key={t} className="flex items-center gap-2">
              <input
                type="radio"
                name="tema"
                value={t}
                checked={th === t}
                onChange={() => setTh(t)}
              />
              <span
                className={`inline-block size-4 rounded-full border border-stone-600 ${TEMA_NOKTA[t]}`}
              />
              {TEMA_ETIKET[t]}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        {ses ? (
          <div className="mb-5">
            <SesKaydedici
              baslangicAcik={sesBaslangicAcik}
              onDegis={(k) => {
                setKayit(k);
                setYuklenen(null);
              }}
            />
          </div>
        ) : null}
        <p className="mb-2 font-bold">Önizleme</p>
        <Kart to={to.trim()} msg={msg.trim()} from={from.trim()} th={th} />
      </div>

      <p className="text-sm text-muted">
        {ses
          ? "Yazdığın metin sunucuya gitmez. Ses eklersen 7 gün saklanır, sonra silinir."
          : "Link kimdeyse kartı o görür. Hiçbir şey sunucuda saklanmaz."}
      </p>

      <button
        type="submit"
        disabled={!hazir || yukleniyor}
        className="rounded-full bg-stone-800 px-5 py-3 text-lg font-bold text-white disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-700"
      >
        Kartı oluştur
      </button>
      <p role="status" aria-live="polite" className="min-h-6 font-semibold">
        {durum}
      </p>
    </form>
  );
}
