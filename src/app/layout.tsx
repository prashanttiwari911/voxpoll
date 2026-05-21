import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Providers } from "@/components/Providers";

const fontJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta-sans",
});

export const metadata: Metadata = {
  title: "VoxPoll 🗳️ | Joyful Online Polling & Real-time Analytics",
  description: "Create interactive polls, cast your vote, and analyze real-time demographics including age and location. Simple, joyful, and user-friendly!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontJakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-800 font-sans">
        <Providers>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <footer className="bg-white border-t border-slate-100 py-8">
            <div className="max-w-7xl mx-auto px-4 text-center sm:px-6 lg:px-8">
              <p className="text-sm text-slate-400">
                Made with 💖 for VoxPoll. Cast your vote, make your voice heard!
              </p>
              <p className="text-xs text-slate-400 mt-1">
                © {new Date().getFullYear()} VoxPoll. All rights reserved.
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
