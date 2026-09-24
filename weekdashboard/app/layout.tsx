import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Kořenový layout Next.js aplikace: nastavuje fonty, metadata a výchozí HTML kostru.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata pro title/description a PWA nastavení (manifest, chování na iOS).
export const metadata: Metadata = {
  title: "Můj týden",
  description: "Týdenní přehled úkolů pro děti",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Můj týden",
  },
};

// Barva stavového pruhu prohlížeče/PWA a chování zoomu na mobilu.
export const viewport: Viewport = {
  themeColor: "#f5f2e9",
  width: "device-width",
  initialScale: 1,
};

// Obaluje každou stránku aplikace, nastavuje jazyk a třídy fontu na <html>.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="cs"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
