import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Interval — build & run interval workouts",
  description:
    "The easiest way to build, save and run interval training sessions. No fiddly watch menus.",
};

export const viewport: Viewport = {
  themeColor: "#12bb62",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
