import { test } from "node:test";
import assert from "node:assert/strict";
import { decodeCard, encodeCard, type Kart } from "./card.ts";

const enc = (o: unknown) =>
  Buffer.from(JSON.stringify(o)).toString("base64url");
const base: Kart = { v: 1, to: "Ayşe", msg: "Teşekkürler", th: "cay", z: 2, t: 1700000000 };

test("Türkçe + emoji gidiş-dönüş", () => {
  const k: Kart = { ...base, to: "ĞŞİÖÜÇ", msg: "ğşıİöüç 🙏", from: "Işık" };
  assert.deepEqual(decodeCard(encodeCard(k)), k);
});

test("geçersiz girdiler null", () => {
  assert.equal(decodeCard(""), null);
  assert.equal(decodeCard(undefined), null);
  assert.equal(decodeCard("abc"), null);
  assert.equal(decodeCard("!!!!"), null);
  assert.equal(decodeCard("A".repeat(1201)), null);
  assert.equal(decodeCard(enc({ ...base, v: 2 })), null);
  assert.equal(decodeCard(enc({ ...base, to: 5 })), null);
  assert.equal(decodeCard(enc({ ...base, msg: "  " })), null);
  assert.equal(decodeCard(enc({ ...base, msg: "a".repeat(201) })), null);
  assert.equal(decodeCard(enc([1, 2])), null);
});

test("normalize ve varsayılanlar", () => {
  const k = decodeCard(enc({ ...base, th: "x", z: 5000, msg: "a\u0000b\n\n\n\n\nc" }));
  assert.equal(k?.th, "sabah");
  assert.equal(k?.z, 1);
  assert.equal(k?.msg, "ab\n\nc");
});
