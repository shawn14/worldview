import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WORLDVIEW — Spatial Intelligence Dashboard",
  description: "Real-time geospatial intelligence overlay on 3D globe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-black text-green-400 overflow-hidden">
        {children}
      </body>
    </html>
  );
}
