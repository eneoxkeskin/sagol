"use client";

import { useMemo, useSyncExternalStore } from "react";
import { abone, ayristir, hamOku, hamSunucu, type DefterKaydi } from "./defter.ts";

export function useDefter(): DefterKaydi[] {
  const ham = useSyncExternalStore(abone, hamOku, hamSunucu);
  return useMemo(() => ayristir(ham), [ham]);
}
