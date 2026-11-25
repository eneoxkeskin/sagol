import { test } from "node:test";
import assert from "node:assert/strict";
import { kontrastOrani } from "./kontrast.ts";
import { TEMA_RENK } from "./tema.ts";

test("tüm temalarda metin kontrastı ≥ 4.5", () => {
  for (const [ad, r] of Object.entries(TEMA_RENK)) {
    const ciftler: [string, string, string][] = [
      ["mürekkep/zemin", r.murekkep, r.zemin],
      ["ikincil/zemin", r.ikincil, r.zemin],
      ["düğme yazısı/vurgu", r.vurguYazi, r.vurgu],
      ["mürekkep/kutu", r.murekkep, r.kutu],
    ];
    for (const [etiket, on, arka] of ciftler) {
      const o = kontrastOrani(on, arka);
      assert.ok(o >= 4.5, `${ad} ${etiket}: ${o.toFixed(2)}`);
    }
  }
});

test("bilinen oran", () => {
  assert.equal(Math.round(kontrastOrani("#000000", "#ffffff")), 21);
});
