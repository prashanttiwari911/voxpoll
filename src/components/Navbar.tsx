"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { Vote, PlusCircle, LogOut, User, LayoutDashboard, Menu, X, HelpCircle } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if profile is complete (needs name, age, and address)
  const isProfileIncomplete = session?.user && (!session.user.age || !session.user.address);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-indigo-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="bg-gradient-to-tr from-indigo-500 to-violet-600 p-2 rounded-xl text-white shadow-md transform group-hover:scale-105 transition-transform duration-200">
                <Vote className="h-6 w-6" />
              </div>
              <span className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:opacity-85 transition-opacity">
                VoxPoll
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
            >
              Explore Polls
            </Link>

            {session && (
              <>
                <Link
                  href="/polls/new"
                  className="flex items-center space-x-1.5 text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Create Poll</span>
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-1.5 text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </>
            )}

            {/* Profile / Auth Button */}
            {session ? (
              <div className="flex items-center space-x-4 border-l border-indigo-100 pl-4">
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 group relative py-1 px-2 rounded-lg hover:bg-indigo-50 transition-all"
                  title="Edit Profile"
                >
                  {/* Avatar */}
                  <img
                    src={session.user.image || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${session.user.name || "user"}`}
                    alt="Avatar"
                    className="h-8 w-8 rounded-full border border-indigo-200"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold text-gray-800 leading-none group-hover:text-indigo-600">
                      {session.user.name || "Anonymous User"}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {session.user.address || "No Address Set"}
                    </span>
                  </div>
                  
                  {/* Warning Badge for incomplete profile */}
                  {isProfileIncomplete && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    </span>
                  )}
                </Link>

                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-gray-500 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  const el = document.getElementById("auth-section");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                  } else {
                    signIn();
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-xl shadow-md shadow-indigo-100 transform active:scale-95 transition-all"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-indigo-600 p-2 rounded-xl focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-indigo-50 px-4 pt-2 pb-4 space-y-2 shadow-inner">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
          >
            Explore Polls
          </Link>

          {session ? (
            <>
              <Link
                href="/polls/new"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl text-base font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
              >
                <PlusCircle className="h-5 w-5" />
                <span>Create Poll</span>
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl text-base font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
              >
                <LayoutDashboard className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl text-base font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border-t border-indigo-50 mt-2"
              >
                <img
                  src={session.user.image || ""}
                  alt="Avatar"
                  className="h-7 w-7 rounded-full border"
                />
                <div className="flex flex-col">
                  <span>{session.user.name || "My Profile"}</span>
                  {isProfileIncomplete && (
                    <span className="text-xs text-amber-500 font-semibold">
                      ⚠️ Complete Profile (Add Age/Address)
                    </span>
                  )}
                </div>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-xl text-base font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                signIn();
              }}
              className="w-full bg-indigo-600 text-white font-semibold py-2.5 px-4 rounded-xl text-center shadow-md shadow-indigo-100 hover:bg-indigo-700"
            >
              Sign In
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
