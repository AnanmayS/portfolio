import type { Metadata, Viewport } from "next";
import { Caveat, Geist_Mono, Public_Sans } from "next/font/google";
import "./globals.css";

const sans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans-face",
  display: "swap",
});

const hand = Caveat({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-hand-face",
  display: "swap",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-geist-mono",
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
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#131313" },
    { media: "(prefers-color-scheme: light)", color: "#fbfbfb" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${hand.variable} ${mono.variable}`}>
      <head>
        {/* Apply a stored theme choice before first paint; otherwise follow the system. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var a=localStorage.getItem('appearance');" +
              "if(a==='light'||a==='dark')document.documentElement.dataset.appearance=a}catch(e){}",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
