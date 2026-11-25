// Tema renkleri (docs/DESIGN-V3.md). CSS karşılığı globals.css; OG/story ve kontrast testi buradan okur.
import type { Tema } from "./card.ts";

export type TemaRenk = {
  zemin: string;
  murekkep: string;
  ikincil: string;
  vurgu: string;
  vurguYazi: string;
  kutu: string;
};

export const TEMA_RENK: Record<Tema | "krem", TemaRenk> = {
  sabah: { zemin: "#FFD23F", murekkep: "#1B1306", ikincil: "#4A3A0C", vurgu: "#1B1306", vurguYazi: "#FFD23F", kutu: "#FFF4C2" },
  cay: { zemin: "#12372A", murekkep: "#F6EBD3", ikincil: "#BFD0C4", vurgu: "#F2C14E", vurguYazi: "#12372A", kutu: "#1C4A3A" },
  deniz: { zemin: "#BFE0F5", murekkep: "#0F2A3F", ikincil: "#35566F", vurgu: "#0F2A3F", vurguYazi: "#BFE0F5", kutu: "#F4FAFF" },
  lavanta: { zemin: "#D8CCF7", murekkep: "#22123F", ikincil: "#4A3A78", vurgu: "#22123F", vurguYazi: "#D8CCF7", kutu: "#F3EFFD" },
  krem: { zemin: "#FFF8EA", murekkep: "#2B1D12", ikincil: "#6B5A48", vurgu: "#2B1D12", vurguYazi: "#FFF8EA", kutu: "#FFFFFF" },
};

export const TEMA_AD: Record<Tema, string> = {
  sabah: "Sabah",
  cay: "Çay",
  deniz: "Deniz",
  lavanta: "Lavanta",
};
