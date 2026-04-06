import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kepler Jobs Dashboard",
  description: "Premium job intelligence dashboard",
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
