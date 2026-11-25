import { test } from "node:test";
import assert from "node:assert/strict";
import { modelTaslaklari, taslaklar } from "./taslak.ts";

test("üç taslak üretir, her biri ≤200 ve girdiyi içerir", () => {
  const t = taslaklar("Zor günümde yanımda olduğun için");
  assert.equal(t.length, 3);
  for (const s of t) {
    assert.ok([...s].length <= 200);
    assert.ok(s.includes("Zor günümde yanımda olduğun için"));
  }
  assert.equal(new Set(t).size, 3);
});

test("uzun girdi 200 kod noktasına sığar; boş girdi boş döner", () => {
  for (const s of taslaklar("ğ".repeat(500))) assert.ok([...s].length <= 200);
  assert.deepEqual(taslaklar("   "), []);
});

test("Prompt API yoksa null (şablona düşülür), ağ yok", async () => {
  assert.equal(await modelTaslaklari("merhaba"), null);
});
