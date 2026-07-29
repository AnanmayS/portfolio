import type { Metadata } from "next";
import "./globals.css";

const basePath = process.env.PAGES_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "Ananmay Som Singh",
  description:
    "Computer Engineering student, software engineer, and AI automation builder.",
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
