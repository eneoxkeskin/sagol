import { test } from "node:test";
import assert from "node:assert/strict";
import { izinVer } from "./hiz.ts";
import { gunAnahtari } from "./gun.ts";

test("hız sınırı pencere içinde keser, sonra açar", () => {
  const depo = new Map();
  for (let i = 0; i < 3; i++) assert.equal(izinVer("a", 3, 1000, 0, depo), true);
  assert.equal(izinVer("a", 3, 1000, 500, depo), false);
  assert.equal(izinVer("b", 3, 1000, 500, depo), true);
  assert.equal(izinVer("a", 3, 1000, 1001, depo), true);
});

test("gün anahtarı İstanbul saatine göre", () => {
  // 2026-11-25 21:30 UTC = 2026-11-26 00:30 İstanbul (UTC+3)
  assert.equal(gunAnahtari(new Date("2026-11-25T21:30:00Z")), "2026-11-26");
  assert.equal(gunAnahtari(new Date("2026-11-25T20:30:00Z")), "2026-11-25");
});
