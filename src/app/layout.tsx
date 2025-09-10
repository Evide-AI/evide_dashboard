import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Evide Dashboard",
  description: "Evide dashboard for managing buses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
