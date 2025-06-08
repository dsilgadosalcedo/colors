import type React from "react";
import { Toaster } from "@/components/ui/toaster";
import "@/styles/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
