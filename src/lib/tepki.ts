// Tepkiler: sabit allowlist. URL'de yalnızca anahtar taşınır.
export const TEPKILER = [
  { k: "kalp", e: "💛", ad: "Sarı kalp" },
  { k: "duygulandim", e: "🥹", ad: "Duygulandım" },
  { k: "guldum", e: "😂", ad: "Güldüm" },
  { k: "sevgi", e: "🫶", ad: "Sevgi" },
  { k: "tesekkur", e: "🙏", ad: "Teşekkür" },
] as const;

export type TepkiAnahtar = (typeof TEPKILER)[number]["k"];

export function tepkiBul(k: unknown) {
  return TEPKILER.find((t) => t.k === k) ?? null;
}
