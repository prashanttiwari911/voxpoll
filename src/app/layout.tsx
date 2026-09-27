import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Providers } from "@/components/Providers";
import SessionTimeout from "@/components/SessionTimeout";
import { Toaster } from "sonner";

const fontJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta-sans",
});

export const metadata: Metadata = {
  title: "VoTI 🗳️ | Joyful Online Polling & Real-time Analytics",
  description: "Create interactive polls, cast your vote, and analyze real-time demographics including age and location. Simple, joyful, and user-friendly!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontJakarta.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[#f8fafc] dark:bg-[#09090b] text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]">
        <Providers>
          <Toaster position="bottom-right" richColors closeButton />
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
          </div>
          <SessionTimeout />
          <footer className="bg-zinc-900 border-t border-zinc-800 text-zinc-400">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                {/* Brand */}
                <div className="col-span-2 md:col-span-1 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-zinc-800 text-white shadow-md">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        </svg>
                      </div>
                      <span className="text-xl font-black text-white tracking-tight">VoTI</span>
                  </div>
                  <p className="text-sm leading-relaxed font-medium">Cast your vote. Make your voice heard. Real-time polls for everyone.</p>
                  <p className="text-xs font-bold text-zinc-600">© {new Date().getFullYear()} VoTI. All rights reserved.</p>
                </div>

                {/* Platform */}
                <div className="space-y-4">
                  <h4 className="text-white font-black text-sm uppercase tracking-widest">Platform</h4>
                  <ul className="space-y-3 text-sm font-semibold">
                    <li><a href="/" className="hover:text-white transition-colors">Explore Polls</a></li>
                    <li><a href="/polls/new" className="hover:text-white transition-colors">Create a Poll</a></li>
                    <li><a href="/dashboard" className="hover:text-white transition-colors">My Dashboard</a></li>
                  </ul>
                </div>

                {/* Support */}
                <div className="space-y-4">
                  <h4 className="text-white font-black text-sm uppercase tracking-widest">Support</h4>
                  <ul className="space-y-3 text-sm font-semibold">
                    <li><a href="/help" className="hover:text-white transition-colors">Help Center</a></li>
                    <li><a href="/help#contact" className="hover:text-white transition-colors">Contact Us</a></li>
                    <li><a href="/help#feedback" className="hover:text-white transition-colors">Give Feedback</a></li>
                    <li><a href="/help" className="hover:text-white transition-colors">FAQs</a></li>
                  </ul>
                </div>

                {/* Legal */}
                <div className="space-y-4">
                  <h4 className="text-white font-black text-sm uppercase tracking-widest">Company</h4>
                  <ul className="space-y-3 text-sm font-semibold">
                    <li><a href="#" className="hover:text-white transition-colors">About VoTI</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                  </ul>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-zinc-600">
                <p>Made with 💖 by prashant tiwari 2253197781</p>
                <div className="flex items-center gap-6">
                  <a href="/help" className="hover:text-zinc-400 transition-colors">Help</a>
                  <a href="/help" className="hover:text-zinc-400 transition-colors">Contact</a>
                  <a href="/help" className="hover:text-zinc-400 transition-colors">Feedback</a>
                </div>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
