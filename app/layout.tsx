import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";

import { AppProviders } from "@/components/providers/AppProviders";
import { RouteStateGuard } from "@/components/RouteStateGuard";

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
  title: "目覚ましクソコード",
  description: "Alarm challenge skeleton app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense fallback={null}>
          <AppProviders>
            <RouteStateGuard />
            {children}
          </AppProviders>
        </Suspense>
      </body>
    </html>
  );
}
