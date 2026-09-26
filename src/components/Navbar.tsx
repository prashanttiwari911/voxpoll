"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Vote, PlusCircle, LogOut, User, LayoutDashboard, Menu, X, Bell, Bookmark, Shield, KeyRound, ChevronDown, HelpCircle } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isProfileIncomplete = session?.user && (!session.user.age || !session.user.address);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-4 z-50 mx-4 sm:mx-8 lg:mx-auto max-w-7xl bg-white/70 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/40 dark:border-zinc-700/50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 w-full">
          {/* Left Side: Logo & Main Links */}
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-2 rounded-2xl text-white shadow-lg shadow-indigo-500/30 transform group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
                <Vote className="h-6 w-6" />
              </div>
              <span className="text-2xl font-black text-zinc-900 dark:text-white group-hover:opacity-85 transition-opacity">
                VoTI
              </span>
            </Link>

            {/* Desktop Navigation (Center/Left) */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-sm transition-colors">
                Explore
              </Link>

              <Link href="/polls/new" className="text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-sm flex items-center gap-1.5 transition-colors">
                <PlusCircle className="h-4 w-4" />
                Create
              </Link>

              <Link href="/help" className="text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-sm transition-colors">
                Help
              </Link>
            </div>
          </div>

          {/* Right Side: Actions */}
          <div className="hidden md:flex items-center space-x-5">
            <ThemeToggle />

            {session && (
              <Link
                href="/polls/new"
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-400 text-white font-black px-5 py-2.5 rounded-2xl flex items-center space-x-2 text-sm transition-all shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 border border-indigo-400/20"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Create Poll</span>
              </Link>
            )}

            {/* Profile / Auth Button */}
            {session ? (
              <div className="relative border-l border-zinc-200 pl-6" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 group relative py-1 rounded-full transition-all focus:outline-none"
                  aria-expanded={dropdownOpen}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={session.user.image || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${session.user.name || "user"}`}
                    alt="Avatar"
                    className="h-9 w-9 rounded-full border-2 border-white shadow-sm group-hover:border-indigo-100 transition-colors object-cover"
                  />
                  <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  
                  {isProfileIncomplete && (
                    <span className="absolute -top-0 -right-0 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 border border-white"></span>
                    </span>
                  )}
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-zinc-100 overflow-hidden transform origin-top-right transition-all animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-zinc-50 bg-zinc-50/50">
                      <p className="text-sm font-bold text-zinc-900 truncate">
                        {session.user.name || "Anonymous User"}
                      </p>
                      <p className="text-xs text-zinc-500 truncate">
                        {session.user.email}
                      </p>
                    </div>
                    
                    <div className="p-2 space-y-0.5 text-sm font-semibold text-zinc-700">
                      <Link href="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-100 transition-colors">
                        <LayoutDashboard className="h-4 w-4 text-zinc-400" /> My Dashboard
                      </Link>
                      <Link href="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-100 transition-colors">
                        <User className="h-4 w-4 text-zinc-400" /> Edit Profile
                        {isProfileIncomplete && <span className="w-2 h-2 rounded-full bg-amber-500 ml-auto"></span>}
                      </Link>
                      <Link href="/bookmarks" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-100 transition-colors">
                        <Bookmark className="h-4 w-4 text-zinc-400" /> Bookmarks
                      </Link>
                      <Link href="/notifications" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-100 transition-colors">
                        <Bell className="h-4 w-4 text-zinc-400" /> Notifications
                      </Link>
                      {session.user.role === "ADMIN" && (
                        <Link href="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 transition-colors">
                          <Shield className="h-4 w-4" /> Admin Panel
                        </Link>
                      )}
                    </div>
                    <div className="p-2 border-t border-zinc-100">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="flex items-center gap-2.5 px-3 py-2 w-full text-left rounded-xl hover:bg-zinc-100 text-sm font-semibold text-zinc-700 transition-colors"
                      >
                        <LogOut className="h-4 w-4 text-zinc-400" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  signIn();
                }}
                className="bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-bold py-2.5 px-6 rounded-2xl shadow-lg shadow-zinc-900/20 hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95 transition-all text-sm border border-zinc-800 dark:border-white/20"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            {!session && (
              <Link href="/polls/new" className="text-zinc-700 font-bold text-sm">Create</Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-zinc-600 hover:text-indigo-600 p-2 rounded-xl focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-zinc-100 px-4 pt-2 pb-4 space-y-2 shadow-inner">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-base font-bold text-zinc-700 hover:bg-zinc-50">
            Explore Polls
          </Link>
          <Link href="/polls/new" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-base font-bold text-zinc-700 hover:bg-zinc-50">
              <PlusCircle className="h-5 w-5 text-zinc-400" /> Create Poll
            </Link>
          <Link href="/help" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-base font-bold text-zinc-700 hover:bg-zinc-50">
            <HelpCircle className="h-5 w-5 text-zinc-400" /> Help & Support
          </Link>

          {session ? (
            <>
              <Link href="/polls/new" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-base font-bold text-indigo-700 bg-indigo-50">
                <PlusCircle className="h-5 w-5" /> Create Poll
              </Link>
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-base font-bold text-zinc-700 hover:bg-zinc-50">
                <LayoutDashboard className="h-5 w-5 text-zinc-400" /> My Dashboard
              </Link>
              <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-base font-bold text-zinc-700 hover:bg-zinc-50">
                <User className="h-5 w-5 text-zinc-400" /> Edit Profile
                {isProfileIncomplete && <span className="text-xs text-amber-600 ml-auto bg-amber-100 px-2 py-0.5 rounded-full">Missing details</span>}
              </Link>
              <button
                onClick={() => { setMobileMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                className="flex items-center gap-2 w-full text-left px-3 py-2.5 rounded-xl text-base font-bold text-red-600 hover:bg-red-50 border-t border-zinc-100 mt-2 pt-4"
              >
                <LogOut className="h-5 w-5" /> Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2">
              <button
                onClick={() => { setMobileMenuOpen(false); signIn(); }}
                className="w-full bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-bold py-3 px-4 rounded-2xl text-center shadow-lg"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
