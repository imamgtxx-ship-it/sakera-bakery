import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sakera Bakery",
  description: "Sistem manajemen Sakera Bakery",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <div className="flex min-h-screen bg-slate-50">
          <Sidebar />
          <main className="flex-1 ml-64">{children}</main>
        </div>
      </body>
    </html>
  );
}


