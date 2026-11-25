// Yerel taslak motoru: ham düşünceden 3 içten öneri. Sunucuya hiçbir şey gitmez.
const MAX = 200;

const uzunluk = (s: string) => [...s].length;
const kes = (s: string, n: number) => [...s].slice(0, n).join("");

function sigdir(oncesi: string, ham: string, sonrasi: string): string {
  const bos = uzunluk(oncesi) + uzunluk(sonrasi);
  const govde = uzunluk(ham) > MAX - bos ? `${kes(ham, MAX - bos - 1).trimEnd()}…` : ham;
  return `${oncesi}${govde}${sonrasi}`;
}

/** Ham düşünce → 3 taslak (sade, sıcak, kısa). Her biri ≤200 kod noktası. Boşsa []. */
export function taslaklar(girdi: string): string[] {
  const ham = girdi
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .replace(/[.!…\s]+$/u, "")
    .trim();
  if (!ham) return [];
  const icinle = /\bi[çc]in$/iu.test(ham);
  if (icinle) {
    return [
      sigdir("", ham, " çok teşekkür ederim."),
      sigdir("", ham, " minnettarım. İyi ki varsın, sağ ol."),
      sigdir("Sağ ol; ", ham, "."),
    ];
  }
  return [
    sigdir("", ham, ". Çok teşekkür ederim."),
    sigdir("", ham, ". Bunu sana söylemek istedim: iyi ki varsın, sağ ol."),
    sigdir("Kısaca: ", ham, ". Sağ ol."),
  ];
}

type DilModeli = {
  availability: () => Promise<string>;
  create: () => Promise<{ prompt: (s: string) => Promise<string>; destroy?: () => void }>;
};

const TURKCE_IPUCU = /[ğşıçöüĞŞİÇÖÜ]|teşekkür|sağ ol|için/;

/** Chrome yerleşik Prompt API (cihaz üstü). Yalnızca model ZATEN indirilmişse; 4 sn'de gelmezse null. */
export async function modelTaslaklari(girdi: string): Promise<string[] | null> {
  const LM = (globalThis as unknown as { LanguageModel?: DilModeli }).LanguageModel;
  if (!LM) return null;
  const ham = girdi.trim().slice(0, 300);
  if (!ham) return null;
  const is = (async () => {
    if ((await LM.availability()) !== "available") return null; // indirmeyi asla tetikleme
    const oturum = await LM.create();
    try {
      const yanit = await oturum.prompt(
        `Aşağıdaki düşünceden, Türkçe, içten, kısa (en çok 150 karakter) 3 farklı teşekkür mesajı yaz. Her mesajı ayrı satıra yaz, numara ya da tırnak kullanma.\nDüşünce: ${ham}`,
      );
      const satirlar = yanit
        .split("\n")
        .map((s) => s.replace(/^[\s\-*\d.)]+/, "").trim())
        .filter((s) => s && uzunluk(s) <= MAX)
        .slice(0, 3);
      return satirlar.length === 3 && satirlar.every((s) => TURKCE_IPUCU.test(s)) ? satirlar : null;
    } finally {
      oturum.destroy?.();
    }
  })().catch(() => null);
  const zaman = new Promise<null>((r) => setTimeout(() => r(null), 4000));
  return Promise.race([is, zaman]);
}
