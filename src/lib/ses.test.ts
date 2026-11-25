import { test } from "node:test";
import assert from "node:assert/strict";
import {
  aralikAyristir,
  mimeTemizle,
  ozetEsit,
  peaksAyristir,
  sihirliBayt,
  sinirliOku,
  sureGecerli,
  tokenOzeti,
  yeniId,
  yeniToken,
} from "./ses.ts";
import { SES_ID_REGEX } from "./card.ts";

const mp4 = new Uint8Array([0, 0, 0, 24, 0x66, 0x74, 0x79, 0x70, 1, 2, 3, 4, 5]);
const webm = new Uint8Array([0x1a, 0x45, 0xdf, 0xa3, 0, 0, 0, 0, 0, 0, 0, 0]);

test("mime allowlist", () => {
  assert.equal(mimeTemizle("audio/webm;codecs=opus"), "audio/webm");
  assert.equal(mimeTemizle("AUDIO/MP4"), "audio/mp4");
  assert.equal(mimeTemizle("text/html"), null);
  assert.equal(mimeTemizle("image/svg+xml"), null);
  assert.equal(mimeTemizle(null), null);
});

test("sihirli bayt eşleşmeli", () => {
  assert.equal(sihirliBayt("audio/mp4", mp4), true);
  assert.equal(sihirliBayt("audio/webm", webm), true);
  assert.equal(sihirliBayt("audio/mp4", webm), false);
  assert.equal(sihirliBayt("audio/ogg", mp4), false);
  assert.equal(sihirliBayt("audio/mp4", new Uint8Array(3)), false);
});

test("süre", () => {
  assert.equal(sureGecerli("12000"), 12000);
  assert.equal(sureGecerli("20500"), 20500);
  assert.equal(sureGecerli("20501"), null);
  assert.equal(sureGecerli("0"), null);
  assert.equal(sureGecerli("-5"), null);
  assert.equal(sureGecerli("abc"), null);
  assert.equal(sureGecerli(null), null);
});

test("id ve token tahmin edilemez biçimde üretilir", () => {
  const a = yeniId();
  assert.match(a, SES_ID_REGEX);
  assert.notEqual(a, yeniId());
  assert.ok(yeniToken().length >= 43);
  assert.ok(ozetEsit(tokenOzeti("x"), tokenOzeti("x")));
  assert.ok(!ozetEsit(tokenOzeti("x"), tokenOzeti("y")));
});

test("X-Peaks ayrıştırma", () => {
  assert.deepEqual(peaksAyristir(null), { ok: true, bayt: null });
  const ok = peaksAyristir(Buffer.alloc(48, 200).toString("base64url"));
  assert.ok(ok.ok && ok.bayt?.length === 48);
  assert.equal(peaksAyristir("kisa").ok, false);
  assert.equal(peaksAyristir("!".repeat(64)).ok, false);
});

test("range ayrıştırma", () => {
  assert.deepEqual(aralikAyristir("bytes=0-9", 100), [0, 9]);
  assert.deepEqual(aralikAyristir("bytes=90-", 100), [90, 99]);
  assert.deepEqual(aralikAyristir("bytes=-10", 100), [90, 99]);
  assert.deepEqual(aralikAyristir("bytes=0-500", 100), [0, 99]);
  assert.equal(aralikAyristir("bytes=200-300", 100), null);
  assert.equal(aralikAyristir("bytes=5-2", 100), null);
  assert.equal(aralikAyristir("kotu", 100), null);
  assert.equal(aralikAyristir(null, 100), null);
});

test("sınırlı okuma: sınırı aşan null döner", async () => {
  const akis = (n: number) =>
    new Response(new Uint8Array(n)).body as ReadableStream<Uint8Array>;
  assert.equal((await sinirliOku(akis(100), 100))?.length, 100);
  assert.equal(await sinirliOku(akis(101), 100), null);
});
