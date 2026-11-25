import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import YaziFormu from "@/components/YaziFormu";
import { temizleAd } from "@/lib/card";
import { sayacAcik, sesAcik } from "@/lib/ozellik";
import { bugunSayisi } from "@/lib/sayac";

function ilk(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

async function ParametreliForm({
  searchParams,
}: Pick<PageProps<"/">, "searchParams">) {
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
    />
  );
}

async function BugunSayaci() {
  if (!sayacAcik()) return null;
  await connection();
  const n = await bugunSayisi();
  if (n === null || n < 1) return null;
  return (
    <p className="mt-2 text-base text-muted sm:text-center">
      Bugün {n.toLocaleString("tr-TR")} teşekkür edildi.
    </p>
  );
}

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
      <h1 className="text-3xl font-extrabold leading-tight sm:text-center">
        Bugün kime teşekkür etmek istersin?
      </h1>
      <Suspense fallback={null}>
        <BugunSayaci />
      </Suspense>
      <Suspense fallback={null}>
        <ParametreliForm searchParams={searchParams} />
      </Suspense>
      <Link
        href="/sakladiklarim"
        className="mt-8 inline-block font-semibold underline underline-offset-4"
      >
        Sakladıklarım
      </Link>
      <Link
        href="/hakkinda"
        className="mt-8 ml-6 inline-block font-semibold underline underline-offset-4"
      >
        Hakkında
      </Link>
    </main>
  );
}
