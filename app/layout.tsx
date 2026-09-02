import type { Metadata } from "next";
import { Public_Sans, Space_Mono, Zilla_Slab } from "next/font/google";
import "./globals.css";

const display = Zilla_Slab({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = Public_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-body",
  display: "swap",
});

const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

const basePath = process.env.PAGES_BASE_PATH ?? "";
const siteUrl = "https://ananmays.github.io/portfolio/";
const siteDescription =
  "Computer engineering student at UMD building backend, distributed systems, and applied ML software.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Ananmay Som Singh",
  description: siteDescription,
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "Ananmay Som Singh",
    description: siteDescription,
    url: siteUrl,
    type: "website",
  },
  icons: {
    icon: `${basePath}/favicon.svg`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
