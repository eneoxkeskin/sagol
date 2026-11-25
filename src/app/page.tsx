import { Suspense } from "react";
import YaziFormu from "@/components/YaziFormu";

async function ZliForm({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const sp = await searchParams;
  const ham = Array.isArray(sp.z) ? sp.z[0] : sp.z;
  const n = Number(ham);
  const z = Number.isInteger(n) && n >= 1 && n <= 999 ? n : 1;
  return <YaziFormu z={z} />;
}

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
      <h1 className="text-3xl font-extrabold leading-tight">
        Bugün kime teşekkür etmek istersin?
      </h1>
      <Suspense fallback={null}>
        <ZliForm searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
