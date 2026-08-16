import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Providers } from "@/components/Providers";
import SessionTimeout from "@/components/SessionTimeout";

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
    <html lang="en" className={`${fontJakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-800 font-sans">
        <Providers>
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
                    <div className="bg-gradient-to-tr from-indigo-500 to-violet-600 p-2 rounded-xl text-white shadow-md">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 12 2 2 4-4"/><path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z"/><path d="M22 19H2"/></svg>
                    </div>
                    <span className="text-xl font-black text-white">VoTI</span>
                  </div>
                  <p className="text-sm leading-relaxed font-medium">Cast your vote. Make your voice heard. Real-time polls for everyone.</p>
                  <p className="text-xs font-bold text-zinc-600">© {new Date().getFullYear()} VoTI. All rights reserved.</p>
                </div>

                {/* Platform */}
                <div className="space-y-4">
                  <h4 className="text-white font-black text-sm uppercase tracking-widest">Platform</h4>
                  <ul className="space-y-3 text-sm font-semibold">
                    <li><a href="/" className="hover:text-white transition-colors">Explore Polls</a></li>
                    <li><a href="/join" className="hover:text-white transition-colors">Join a Poll</a></li>
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
                <p>Made with 💖 for India and beyond.</p>
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
