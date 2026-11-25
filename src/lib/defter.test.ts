import { test } from "node:test";
import assert from "node:assert/strict";
import { ayristir } from "./defter.ts";
import { encodeCard } from "./card.ts";

const d = encodeCard({ v: 1, to: "Ayşe", msg: "Sağ ol", th: "cay", h: 1, t: 1 });

test("bozuk ham veri boş liste verir", () => {
  assert.deepEqual(ayristir("{bozuk"), []);
  assert.deepEqual(ayristir('{"a":1}'), []);
  assert.deepEqual(ayristir("null"), []);
});

test("sesBitis opsiyonel; eski kayıtlar etkilenmez", () => {
  const r = ayristir(
    JSON.stringify([
      { id: "1", tur: "gonderilen", d, at: 5, sesBitis: 99 },
      { id: "2", tur: "alinan", d, at: 5 },
      { id: "3", tur: "alinan", d, at: 5, sesBitis: "x" },
    ]),
  );
  assert.equal(r.length, 3);
  assert.equal(r[0].sesBitis, 99);
  assert.equal(r[1].sesBitis, undefined);
  assert.equal(r[2].sesBitis, undefined);
});

test("geçersiz kayıtlar elenir, geçerli kalır", () => {
  const ham = JSON.stringify([
    { id: "1", tur: "gonderilen", d, at: 5 },
    { id: "2", tur: "x", d, at: 5 },
    { id: "3", tur: "alinan", d: "abc", at: 5 },
    null,
    { id: "4", tur: "alinan", d, at: "5" },
  ]);
  const r = ayristir(ham);
  assert.equal(r.length, 1);
  assert.equal(r[0].kart.to, "Ayşe");
});
