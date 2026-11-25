import "server-only";
import { neon } from "@neondatabase/serverless";

type Sql = ReturnType<typeof neon>;

let sql: Sql | null = null;
let hazir: Promise<void> | null = null;

/** DATABASE_URL yoksa null. Yalnızca etiketli şablonla (parametreli) kullan. */
export function getSql(): Sql | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  sql ??= neon(url);
  return sql;
}

/** Tabloları örnek başına bir kez kurar (CREATE TABLE IF NOT EXISTS). */
export async function semaHazir(): Promise<Sql | null> {
  const s = getSql();
  if (!s) return null;
  hazir ??= (async () => {
    await s`CREATE TABLE IF NOT EXISTS voices (
      id text PRIMARY KEY,
      audio bytea NOT NULL,
      mime text NOT NULL,
      duration_ms integer NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      expires_at timestamptz NOT NULL,
      delete_token_hash text NOT NULL
    )`;
    await s`CREATE TABLE IF NOT EXISTS stats (
      day date PRIMARY KEY,
      count integer NOT NULL DEFAULT 0
    )`;
  })().catch((e) => {
    hazir = null;
    throw e;
  });
  await hazir;
  return s;
}
