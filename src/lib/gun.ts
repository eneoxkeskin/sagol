const bicim = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Istanbul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** "YYYY-MM-DD", Europe/Istanbul gününe göre. */
export function gunAnahtari(tarih: Date): string {
  return bicim.format(tarih);
}
