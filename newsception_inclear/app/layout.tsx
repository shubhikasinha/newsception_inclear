import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";
import { ColorSchemeWatcher } from "@/components/color-scheme-watcher";
import ThemeToggle from "./components/shared/ThemeToggle";

// @ts-ignore - allow importing global CSS without type declarations
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InClear - Live Audio Debates",
  description: "Join anonymous real-time audio debates on trending topics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ColorSchemeWatcher />
          <ThemeToggle className="fixed bottom-6 right-6 z-50 shadow-lg" />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
