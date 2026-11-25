import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "SağOl — birine 20 saniyede teşekkür et",
  description:
    "Kısa bir teşekkür yaz, kart linkini paylaş. Hiçbir şey sunucuda saklanmaz.",
};

export const viewport: Viewport = {
  themeColor: "#fffaf0",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
