import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GlobalHeader } from "@/app/components/layout/GlobalHeader";
import { GlobalFooter } from "@/app/components/layout/GlobalFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IPS RS Menur - Sistem Inventaris & CMMS",
  description:
    "Sistem Manajemen Pemeliharaan dan Inventaris Alat Medis RS Menur Jawa Timur",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-slate-100">
        <GlobalHeader />
        <main className="flex-grow flex flex-col">
          {children}
        </main>
        <GlobalFooter />
      </body>
    </html>
  );
}
