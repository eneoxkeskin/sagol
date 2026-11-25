import Link from "next/link";
import { Suspense } from "react";
import YaziFormu from "@/components/YaziFormu";
import { temizleAd } from "@/lib/card";

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
  return <YaziFormu h={h} baslangicKime={kime} />;
}

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
      <h1 className="text-3xl font-extrabold leading-tight">
        Bugün kime teşekkür etmek istersin?
      </h1>
      <Suspense fallback={null}>
        <ParametreliForm searchParams={searchParams} />
      </Suspense>
      <Link
        href="/defter"
        className="mt-8 inline-block font-semibold underline underline-offset-4"
      >
        Defterim
      </Link>
    </main>
  );
}
