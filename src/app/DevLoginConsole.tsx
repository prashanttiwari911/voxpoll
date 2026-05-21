"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Lock, Sparkles, User, MapPin, Calendar, HelpCircle } from "lucide-react";

const DEMO_PROFILES = [
  { name: "Aria Sharma 🎓", email: "aria@demo.com", age: "22", address: "Delhi" },
  { name: "Kabir Patil ⚽", email: "kabir@demo.com", age: "34", address: "Mumbai" },
  { name: "Siya Mishra ⚖️", email: "siya@demo.com", age: "45", address: "Lucknow" },
  { name: "Rohan Das 📖", email: "rohan@demo.com", age: "19", address: "Bangalore" },
];

export default function DevLoginConsole() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  // Trigger login via Credentials Provider
  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;

    setLoading(true);
    await signIn("credentials", {
      email,
      name,
      age,
      address,
      callbackUrl: "/dashboard",
    });
    setLoading(false);
  };

  // Quick Login using one of the demo presets
  const handleQuickLogin = async (profile: typeof DEMO_PROFILES[0]) => {
    setLoading(true);
    await signIn("credentials", {
      email: profile.email,
      name: profile.name.split(" ")[0] + " " + profile.name.split(" ")[1],
      age: profile.age,
      address: profile.address,
      callbackUrl: "/dashboard",
    });
    setLoading(false);
  };

  return (
    <div id="auth-section" className="bg-white border border-indigo-50 rounded-3xl p-6 sm:p-8 shadow-xl max-w-lg mx-auto scroll-mt-20">
      <div className="text-center mb-6">
        <div className="inline-flex bg-indigo-100 text-indigo-700 p-2.5 rounded-2xl mb-3">
          <Lock className="h-5 w-5" />
        </div>
        <h3 className="text-xl font-black text-slate-800">Access VoxPoll</h3>
        <p className="text-slate-500 text-xs mt-1 leading-relaxed">
          Sign in to cast your ballot, launch new polls, and analyze live demographics!
        </p>
      </div>

      <div className="space-y-4">
        {/* Google Authentication Option */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3 px-4 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
        >
          <svg className="h-5 w-5 mr-1" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center my-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
          <div className="flex-1 border-t border-slate-100" />
          <span className="px-3">or test locally</span>
          <div className="flex-1 border-t border-slate-100" />
        </div>

        {/* Credentials Authentication Form */}
        <form onSubmit={handleCredentialsLogin} className="space-y-3.5">
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-black text-indigo-700 uppercase tracking-wider flex items-center">
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              Developer Quick Sign-In
            </h4>
            <p className="text-[10px] text-slate-500 leading-normal">
              No credentials needed. Sign in with any dummy email to test local SQLite database flows!
            </p>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
              />
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Age"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
              />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="City/Region"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !name || !email}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-xs shadow-md transition-colors disabled:opacity-50"
            >
              Sign In as Test User
            </button>
          </div>
        </form>

        {/* Preset Profiles Buttons */}
        <div className="space-y-2">
          <span className="block text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
            One-Click Test Accounts:
          </span>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_PROFILES.map((profile) => (
              <button
                key={profile.email}
                type="button"
                onClick={() => handleQuickLogin(profile)}
                disabled={loading}
                className="py-2.5 px-3 rounded-xl border border-slate-100 hover:border-indigo-200 text-left bg-slate-50 hover:bg-white text-xs font-bold text-slate-700 flex flex-col justify-between transition-all hover:shadow-sm"
              >
                <span>{profile.name}</span>
                <span className="text-[9px] text-slate-400 font-semibold mt-0.5">
                  Age {profile.age} • {profile.address}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
