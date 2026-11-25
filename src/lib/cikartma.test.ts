import { test } from "node:test";
import assert from "node:assert/strict";
import { cikartmalariCoz, cikartmalariKodla, sinirla, type Cikartma } from "./cikartma.ts";
import { LIMITLER, decodeCard, encodeCard, type Kart } from "./card.ts";

const enc = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");
const base = { v: 2, to: "Ayşe", msg: "Sağ ol", th: "cay", h: 1, t: 1 };

test("çözme: aralıklar kırpılır, geçersizler atılır, en çok 8", () => {
  const c = cikartmalariCoz([
    ["kalp", 1400, -5, 500, 500],
    ["yildiz", 500, 500, -200, 10],
    ["<script>", 1, 1, 1, 100],
    ["e3", 1.5, 1, 1, 100],
    ["bilinmeyen", 1, 1, 1, 100],
    "kalp",
    ["kalp", 1, 1, 1],
  ]);
  assert.equal(c.length, 2);
  assert.deepEqual(c[0], { k: "kalp", x: 1, y: 0, r: 180, s: 2 });
  assert.deepEqual(c[1], { k: "yildiz", x: 0.5, y: 0.5, r: -180, s: 0.5 });
  const dokuz = Array.from({ length: 9 }, () => ["e1", 1, 1, 0, 100]);
  assert.equal(cikartmalariCoz(dokuz).length, 8);
  assert.deepEqual(cikartmalariCoz("kalp"), []);
});

test("sınırlama bellekte", () => {
  assert.deepEqual(sinirla({ k: "kalp", x: 1.4, y: 0.5, r: 500, s: 5 }), { k: "kalp", x: 1, y: 0.5, r: 140, s: 2 });
  assert.equal(sinirla({ k: "kalp", x: 0, y: 0, r: -190, s: 0.1 }).r, 170);
});

test("kart v:2 gidiş-dönüş; v:1'de st yok sayılır", () => {
  const st: Cikartma[] = [
    { k: "cicek", x: 0.25, y: 0.75, r: 15, s: 1.2 },
    { k: "e11", x: 0.9, y: 0.1, r: -30, s: 0.8 },
  ];
  const k: Kart = { ...(base as Kart), st };
  assert.deepEqual(decodeCard(encodeCard(k))?.st, st);
  assert.equal(decodeCard(enc({ ...base, v: 1, st: cikartmalariKodla(st) }))?.st, undefined);
  assert.equal(decodeCard(enc({ ...base, st: [] }))?.st, undefined);
});

test("en kötü durum 1600 sınırına sığar", () => {
  const msg = "ğ🙏".repeat(100); // 200 kod noktası
  const k: Kart = {
    v: 2,
    to: "Ğ".repeat(40),
    from: "Ş".repeat(40),
    msg,
    th: "lavanta",
    h: 999,
    s: "A".repeat(22),
    p: "B".repeat(64),
    t: 1_800_000_000,
    st: Array.from({ length: 8 }, () => ({ k: "e10" as const, x: 0.123, y: 0.456, r: -179, s: 1.99 })),
  };
  const d = encodeCard(k);
  assert.ok(d.length <= LIMITLER.dMax, `uzunluk ${d.length}`);
  assert.deepEqual(decodeCard(d)?.st?.length, 8);
});
