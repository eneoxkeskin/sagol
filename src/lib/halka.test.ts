import { test } from "node:test";
import assert from "node:assert/strict";
import { cubuklar, genlikler, peaksCoz, peaksKodla, peaksYenidenOrnekle, tohum } from "./halka.ts";

test("tohum deterministik, farklı içerik farklı", () => {
  assert.equal(tohum("Annem", "Sağ ol"), tohum("Annem", "Sağ ol"));
  assert.notEqual(tohum("Annem", "Sağ ol"), tohum("Babam", "Sağ ol"));
  assert.notEqual(tohum("ab", "c"), tohum("a", "bc"));
});

test("tohumlu genlikler [0.16,1] ve kartlar farklı", () => {
  const a = genlikler(52, { seed: tohum("Ayşe", "Teşekkürler") });
  const b = genlikler(52, { seed: tohum("Mert", "Teşekkürler") });
  assert.equal(a.length, 52);
  for (const v of a) assert.ok(v >= 0.16 && v <= 1);
  assert.notDeepEqual(a, b);
  assert.deepEqual(a, genlikler(52, { seed: tohum("Ayşe", "Teşekkürler") }));
});

test("peaks verilince birebir kullanılır (alt sınır 0.16)", () => {
  const p = Array.from({ length: 48 }, (_, i) => i / 47);
  const g = genlikler(48, { peaks: p });
  assert.equal(g[47], 1);
  assert.equal(g[0], 0.16);
  assert.equal(g[24], p[24]);
});

test("yeniden örnekleme", () => {
  const p = Array.from({ length: 48 }, (_, i) => (i === 10 ? 1 : 0.2));
  const k = peaksYenidenOrnekle(p, 22);
  assert.equal(k.length, 22);
  assert.ok(k.includes(1));
  assert.equal(peaksYenidenOrnekle(p, 60).length, 60);
});

test("ilk çubuk tepede, dış uç maxLen'i aşmaz", () => {
  const c = cubuklar({ size: 200, r0: 58, maxLen: 98, a: genlikler(40, { seed: 1 }) });
  assert.equal(c[0].x1, 100);
  assert.ok(c[0].y1 < 100);
  for (const k of c) {
    const r = Math.hypot(k.x2 - 100, k.y2 - 100);
    assert.ok(r <= 98.01);
  }
});

test("peaks kodla/çöz gidiş-dönüş", () => {
  const p = Array.from({ length: 48 }, (_, i) => (i % 5) / 4);
  const s = peaksKodla(p);
  assert.equal(s.length, 64);
  const geri = peaksCoz(s);
  assert.ok(geri);
  for (let i = 0; i < 48; i++) assert.ok(Math.abs(geri[i] - p[i]) < 0.01);
  assert.equal(peaksCoz("kisa"), null);
  assert.equal(peaksCoz(5), null);
});
