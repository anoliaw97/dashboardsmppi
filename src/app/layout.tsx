import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SMPPI Data Extractor",
  description:
    "Dashboard untuk mengekstrak dan memaparkan data dari pelbagai pangkalan data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ms">
      <body className="antialiased">{children}</body>
    </html>
  );
}
