import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { GeistSans } from "geist/font/sans";
import { Compose } from "./compose";
import { basePath } from "./paths";
import "./globals.css";

/* The faces live in app/fonts (Latin, variable, all SIL OFL) or in the
   geist package, rather than being fetched from Google at build time, which
   failed often enough to break deploys. Geist Sans carries everything;
   Newsreader is the serif the inner pages' titles still use; Geist Mono
   sets labels, dates and the numbers that tick. */
const serif = localFont({
  src: [
    { path: "./fonts/newsreader.woff2", style: "normal" },
    { path: "./fonts/newsreader-italic.woff2", style: "italic" },
  ],
  weight: "200 800",
  variable: "--font-serif-face",
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
  "Computer engineering student at UMD who builds backend systems and full-stack apps.";

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
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${serif.variable} ${GeistSans.variable} ${mono.variable}`}>
      <body>
        {children}
        <Compose />
      </body>
    </html>
  );
}
