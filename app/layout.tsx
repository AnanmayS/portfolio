import type { Metadata } from "next";
import "./globals.css";

const basePath = process.env.PAGES_BASE_PATH ?? "";
const siteUrl = "https://ananmays.github.io/portfolio/";
const siteDescription =
  "Computer Engineering student, software engineer, and AI automation builder.";

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
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
