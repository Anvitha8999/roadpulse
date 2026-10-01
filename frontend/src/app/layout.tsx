import type { Metadata } from "next";
import { Overpass } from "next/font/google";
import Link from "next/link";
import type { ReactNode } from "react";
import NavLinks from "@/components/NavLinks";
import "./globals.css";

const overpass = Overpass({ subsets: ["latin"], variable: "--font-overpass", display: "swap" });

export const metadata: Metadata = {
  title: "RoadPulse",
  description: "Road damage reports from residents, scored by a computer vision model",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={overpass.variable}>
      <body className="min-h-screen bg-concrete font-sans text-ink antialiased">
        <header className="bg-asphalt text-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
            <Link
              href="/"
              aria-label="RoadPulse home"
              className="rounded-lg bg-sign p-1 shadow-[0_3px_0_rgba(0,0,0,0.45)] hover:bg-sign-dark"
            >
              <span className="block rounded-md border-2 border-white px-3.5 pt-1.5 pb-1 text-2xl font-extrabold tracking-tight">
                RoadPulse
              </span>
            </Link>
            <NavLinks />
          </div>
          <div className="lane-line" aria-hidden="true" />
        </header>
        {children}
      </body>
    </html>
  );
}
