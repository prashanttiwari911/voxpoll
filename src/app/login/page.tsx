"use client";

import { signIn } from "next-auth/react";
import { Sparkles, Mail, KeyRound, Shield } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-indigo-50 dark:from-indigo-950/20 to-transparent"></div>
      
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl mb-6 shadow-inner">
            <KeyRound className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white flex justify-center items-center gap-2">
            Sign In <Sparkles className="h-5 w-5 text-amber-400" />
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">Choose a method to access your VoTI dashboard.</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-zinc-800 dark:text-zinc-100 font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-3 transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <div className="relative py-3 flex items-center">
            <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
            <span className="flex-shrink-0 mx-4 text-zinc-400 text-sm font-semibold uppercase tracking-wider">or</span>
            <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
          </div>

          {/* Quick Demo Logins for MCA Evaluation */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => signIn("credentials", { email: "admin@voti.com", name: "Evaluator Admin", age: 35, address: "Delhi", callbackUrl: "/admin" })}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all shadow-md shadow-indigo-200 dark:shadow-none"
            >
              <Shield className="h-5 w-5" />
              <span className="text-xs">Demo Admin</span>
            </button>
            <button
              onClick={() => signIn("credentials", { email: "user@voti.com", name: "Demo User", age: 24, address: "Maharashtra", callbackUrl: "/dashboard" })}
              className="bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-bold py-3 px-4 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all shadow-md shadow-zinc-200 dark:shadow-none"
            >
              <Mail className="h-5 w-5" />
              <span className="text-xs">Demo User</span>
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-zinc-400 font-medium">
          VoTI MCA Submission Project &bull; 2026
        </p>
      </div>
    </div>
  );
}
