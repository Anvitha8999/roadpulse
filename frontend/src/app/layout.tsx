import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "RoadPulse",
  description: "Road damage reports scored by computer vision",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <header className="border-b bg-white">
          <nav className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
            <Link href="/" className="font-semibold">
              RoadPulse
            </Link>
            <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">
              Dashboard
            </Link>
            <Link href="/report" className="text-sm text-slate-600 hover:text-slate-900">
              Report damage
            </Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
