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
      <body className="h-full flex flex-col bg-slate-950 font-[var(--font-geist-sans)] antialiased">
        <nav className="h-14 border-b border-slate-800 bg-slate-900 flex items-center px-6 gap-6 shrink-0">
          <span className="font-bold text-indigo-400 tracking-tight text-lg">CRM</span>
          <div className="h-4 w-px bg-slate-700" />
          <a href="/" className="text-sm font-medium text-slate-300 hover:text-indigo-400 transition-colors">Contacts</a>
        </nav>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </body>
    </html>
  );
}
