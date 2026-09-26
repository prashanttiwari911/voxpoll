"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Sparkles, Mail, Shield, ChevronDown, ChevronUp, ArrowRight, User } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [step, setStep] = useState(1); // 1 = Email, 2 = Profile completion
  const [email, setEmail] = useState("");
  const [showDevConsole, setShowDevConsole] = useState(false);
  const [loading, setLoading] = useState(false);

  // Profile data state
  const [profile, setProfile] = useState({
    name: "",
    age: "",
    address: "",
    gender: "",
    occupation: "",
    image: "",
  });

  const handleEmailCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      
      if (isRegister) {
        if (data.exists) {
          toast.error("Email already exists. Please select 'Existing User' to log in.");
        } else {
          setStep(2); // Proceed to complete profile
        }
      } else {
        if (!data.exists) {
          toast.error("Account not found. Please select 'New User' to register.");
        } else {
          // Existing user -> Send OTP
          await signIn("email", { email, callbackUrl: "/dashboard" });
          toast.success("Magic link sent to your email!");
        }
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ...profile }),
      });
      
      if (!res.ok) throw new Error("Registration failed");
      
      toast.success("Profile created! Sending login link...");
      await signIn("email", { email, callbackUrl: "/dashboard" });
    } catch (err) {
      toast.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-indigo-50 dark:from-indigo-950/20 to-transparent"></div>
      
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl mb-6 shadow-inner">
            <Sparkles className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white flex justify-center items-center gap-2">
            {step === 2 ? "Complete Profile" : isRegister ? "Create an Account" : "Welcome Back"}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">
            {step === 2 
              ? "Tell us a bit about yourself." 
              : isRegister 
                ? "Join VoTI to start creating polls." 
                : "Sign in to access your VoTI dashboard."}
          </p>
        </div>

        {/* Only show toggle if we are on step 1 */}
        {step === 1 && (
          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl mb-8">
            <button
              onClick={() => setIsRegister(false)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isRegister ? "bg-white dark:bg-zinc-700 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700"}`}
            >
              Existing User
            </button>
            <button
              onClick={() => setIsRegister(true)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isRegister ? "bg-white dark:bg-zinc-700 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700"}`}
            >
              New User
            </button>
          </div>
        )}

        <div className="space-y-4">
          {step === 1 ? (
            <>
              <form onSubmit={handleEmailCheck} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                >
                  <Mail className="h-4 w-4" />
                  {loading ? "Processing..." : isRegister ? "Continue" : "Continue with Email (OTP)"}
                </button>
              </form>

              <div className="relative py-2 flex items-center">
                <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
                <span className="flex-shrink-0 mx-4 text-zinc-400 text-xs font-semibold uppercase tracking-wider">or</span>
                <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
              </div>

              <button
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="w-full bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-zinc-800 dark:text-zinc-100 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>
            </>
          ) : (
            <form onSubmit={handleProfileSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} placeholder="Jane Doe" className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Age</label>
                  <input type="number" min="13" max="120" value={profile.age} onChange={e => setProfile({...profile, age: e.target.value})} placeholder="25" className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Gender</label>
                  <select value={profile.gender} onChange={e => setProfile({...profile, gender: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none" required>
                    <option value="">Select...</option>
                    <option value="FEMALE">Female</option>
                    <option value="MALE">Male</option>
                    <option value="OTHER">Other</option>
                    <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">State / UT</label>
                  <input type="text" value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} placeholder="e.g. Maharashtra" className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none" required />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Occupation</label>
                  <input type="text" value={profile.occupation} onChange={e => setProfile({...profile, occupation: e.target.value})} placeholder="e.g. Student, Software Engineer" className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none" required />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Image URL (Optional)</label>
                  <input type="url" value={profile.image} onChange={e => setProfile({...profile, image: e.target.value})} placeholder="https://example.com/photo.jpg" className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70"
              >
                <User className="h-4 w-4" />
                {loading ? "Creating..." : "Create Account & Send Magic Link"}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full py-2 text-sm text-zinc-500 font-semibold hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                Back
              </button>
            </form>
          )}
        </div>

        {/* Developer Console Accordion */}
        {step === 1 && (
          <div className="mt-8 border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl overflow-hidden transition-all">
            <button
              onClick={() => setShowDevConsole(!showDevConsole)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-amber-800 dark:text-amber-500 hover:bg-amber-100/50 dark:hover:bg-amber-900/20 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Developer Console
              </span>
              {showDevConsole ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            
            {showDevConsole && (
              <div className="p-4 border-t border-amber-200/50 dark:border-amber-900/50 space-y-3 animate-in slide-in-from-top-2">
                <p className="text-xs text-amber-700/70 dark:text-amber-500/70 font-medium pb-1">
                  Bypass real authentication for MCA demo evaluation.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => signIn("credentials", { email: "admin@voti.com", name: "Evaluator Admin", age: 35, address: "Delhi", callbackUrl: "/admin" })}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm text-xs"
                  >
                    Demo Admin <ArrowRight className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => signIn("credentials", { email: "user@voti.com", name: "Demo User", age: 24, address: "Maharashtra", callbackUrl: "/dashboard" })}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm text-xs"
                  >
                    Demo User <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
