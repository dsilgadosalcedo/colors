import type React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Geist } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import { Metadata } from "next";
import { Viewport } from "next";
import "@/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Color Palettes",
  description: "Generate and edit color palettes. A tool by Arrecifes",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`flex flex-col min-h-screen ${geistSans.variable} ${geistMono.variable} antialiased bg-[#193824] bg-gradient-to-br from-[#193824] to-[#2f6441]`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
