import { connection } from "next/server";
import { Suspense } from "react";
import YaziFormu from "@/components/YaziFormu";
import { temizleAd } from "@/lib/card";
import { sayacAcik, sesAcik } from "@/lib/ozellik";
import { bugunSayisi } from "@/lib/sayac";

function ilk(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

async function BugunSayaci() {
  if (!sayacAcik()) return null;
  await connection();
  const n = await bugunSayisi();
  if (n === null || n < 1) return null;
  return <p>Bugün {n.toLocaleString("tr-TR")} teşekkür edildi.</p>;
}

async function ParametreliForm({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const sp = await searchParams;
  // `h` yeni, `z` eski linkler için
  const n = Number(ilk(sp.h) ?? ilk(sp.z));
  const h = Number.isInteger(n) && n >= 1 && n <= 999 ? n : 1;
  const kime = temizleAd(ilk(sp.to) ?? "");
  return (
    <YaziFormu
      h={h}
      baslangicKime={kime}
      sayac={sayacAcik()}
      ses={sesAcik()}
      sesBaslangicAcik={ilk(sp.ses) === "1"}
      ust={
        <Suspense fallback={null}>
          <BugunSayaci />
        </Suspense>
      }
    />
  );
}

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <main className="flex flex-1 flex-col">
      <Suspense fallback={<div data-tema="sabah" className="min-h-dvh flex-1" />}>
        <ParametreliForm searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
