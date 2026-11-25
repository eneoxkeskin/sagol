import { test } from "node:test";
import assert from "node:assert/strict";
import { decodeCard, encodeCard, yonelmeEki, type Kart } from "./card.ts";

const enc = (o: unknown) =>
  Buffer.from(JSON.stringify(o)).toString("base64url");
const base: Kart = { v: 1, to: "Ayşe", msg: "Teşekkürler", th: "cay", h: 2, t: 1700000000 };

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

test("eski z ve yeni h alanı", () => {
  assert.equal(decodeCard(enc({ v: 1, to: "a", msg: "b", th: "cay", z: 4, t: 1 }))?.h, 4);
  assert.equal(decodeCard(enc({ v: 1, to: "a", msg: "b", th: "cay", h: 7, z: 4, t: 1 }))?.h, 7);
  assert.equal(decodeCard(enc({ ...base, h: 0 }))?.h, 1);
  assert.equal(decodeCard(enc({ ...base, h: 1000 }))?.h, 1);
  assert.equal(decodeCard(enc({ ...base, h: "abc" }))?.h, 1);
});

test("ses id yalnızca geçerliyse taşınır", () => {
  const id = "A".repeat(22);
  assert.equal(decodeCard(enc({ ...base, s: id }))?.s, id);
  assert.equal(decodeCard(enc({ ...base, s: "kisa" }))?.s, undefined);
});

test("yönelme eki", () => {
  assert.equal(yonelmeEki("Ayşe"), "Ayşe'ye");
  assert.equal(yonelmeEki("Mert"), "Mert'e");
  assert.equal(yonelmeEki("Işık"), "Işık'a");
  assert.equal(yonelmeEki("Ümit"), "Ümit'e");
  assert.equal(yonelmeEki("Gül"), "Gül'e");
  assert.equal(yonelmeEki("Annem"), "Annem'e");
  assert.equal(yonelmeEki("Ali Can"), "Ali Can'a");
  assert.equal(yonelmeEki("123"), null);
  assert.equal(yonelmeEki("BCD"), null);
});

test("normalize ve varsayılanlar", () => {
  const k = decodeCard(enc({ ...base, th: "x", h: 5000, msg: "a\u0000b\n\n\n\n\nc" }));
  assert.equal(k?.th, "sabah");
  assert.equal(k?.h, 1);
  assert.equal(k?.msg, "ab\n\nc");
});
