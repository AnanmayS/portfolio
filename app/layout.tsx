import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ananmay Som Singh | Portfolio",
  description:
    "Computer Engineering student building software projects across machine learning, backend systems, DevOps, and data analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
