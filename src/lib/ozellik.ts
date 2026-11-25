import "server-only";

/** Ses ve sayaç yalnızca veritabanı bağlantısı varsa açıktır. Yalnızca sunucuda okunur. */
export function veritabaniVar(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export const sesAcik = veritabaniVar;
export const sayacAcik = veritabaniVar;
