import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CRM",
  description: "Contact relationship manager",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="h-full flex flex-col bg-zinc-50 font-[var(--font-geist-sans)] antialiased">
        <nav className="h-14 border-b border-zinc-200 bg-white flex items-center px-6 gap-6 shrink-0">
          <span className="font-semibold text-zinc-900 tracking-tight">CRM</span>
          <div className="h-4 w-px bg-zinc-200" />
          <a href="/" className="text-sm font-medium text-zinc-900">Contacts</a>
        </nav>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </body>
    </html>
  );
}
