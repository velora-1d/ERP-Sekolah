import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-heading" });

export const metadata: Metadata = {
  title: "ERP Sekolah | MI As-Saodah",
  description: "Sistem Informasi Terintegrasi Madrasah Ibtidaiyah As-Saodah",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${outfit.variable} antialiased text-gray-800 min-h-screen`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
