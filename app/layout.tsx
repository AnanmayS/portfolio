import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Compose } from "./compose";
import { basePath } from "./paths";
import "./globals.css";

/* The faces live in app/fonts (Latin, variable, all SIL OFL) rather than
   being fetched from Google at build time, which failed often enough to
   break deploys. Newsreader is the gallery-label serif; Instrument Sans
   carries everything else; Geist Mono sets the numbers that tick. */
const serif = localFont({
  src: [
    { path: "./fonts/newsreader.woff2", style: "normal" },
    { path: "./fonts/newsreader-italic.woff2", style: "italic" },
  ],
  weight: "200 800",
  variable: "--font-serif-face",
  display: "swap",
});

const sans = localFont({
  src: "./fonts/instrument-sans.woff2",
  weight: "400 700",
  variable: "--font-sans-face",
  display: "swap",
});

const mono = localFont({
  src: "./fonts/geist-mono.woff2",
  weight: "400 500",
  variable: "--font-geist-mono",
  display: "swap",
});

const siteUrl = "https://ananmays.github.io/portfolio/";
const siteDescription =
  "Computer engineering student at UMD building backend, distributed systems, and applied ML software.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Ananmay Som Singh",
  description: siteDescription,
  alternates: { canonical: siteUrl },
  openGraph: {
    title: "Ananmay Som Singh",
    description: siteDescription,
    url: siteUrl,
    type: "website",
  },
  icons: { icon: `${basePath}/favicon.svg` },
};

export const viewport: Viewport = {
  themeColor: "#131312",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        {children}
        <Compose />
      </body>
    </html>
  );
}
