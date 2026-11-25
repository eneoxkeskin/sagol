import { test } from "node:test";
import assert from "node:assert/strict";
import { TEPKI_D_MAX, decodeTepki, encodeTepki, type Tepki } from "./tepki.ts";

const enc = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");

test("gidiş-dönüş", () => {
  const t: Tepki = { v: 1, to: "Mert", from: "Ayşe Işık", e: "duygulandim", t: 1700000000 };
  assert.deepEqual(decodeTepki(encodeTepki(t)), t);
  assert.deepEqual(decodeTepki(encodeTepki({ v: 1, e: "kalp", t: 1 })), { v: 1, e: "kalp", t: 1 });
});

test("geçersizler null", () => {
  assert.equal(decodeTepki(""), null);
  assert.equal(decodeTepki("abc"), null);
  assert.equal(decodeTepki("A".repeat(TEPKI_D_MAX + 1)), null);
  assert.equal(decodeTepki(enc({ v: 1, e: "<script>", t: 1 })), null);
  assert.equal(decodeTepki(enc({ v: 2, e: "kalp", t: 1 })), null);
  assert.equal(decodeTepki(enc({ v: 1, e: "kalp", t: "x" })), null);
  assert.equal(decodeTepki(enc({ v: 1, e: "kalp", t: 1, to: 5 })), null);
});

test("adlar temizlenir ve kısaltılır; metin olduğu gibi kalır", () => {
  const t = decodeTepki(enc({ v: 1, e: "kalp", t: 1, from: "<b>x</b>\u0000" + "a".repeat(60) }));
  assert.ok(t?.from?.startsWith("<b>x</b>"));
  assert.ok([...(t?.from ?? "")].length <= 40);
});
