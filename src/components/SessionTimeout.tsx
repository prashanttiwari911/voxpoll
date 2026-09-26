"use client";

import { useEffect, useState, useCallback } from "react";
import { signOut, useSession } from "next-auth/react";
import { LogOut, AlertTriangle } from "lucide-react";

// 15 minutes of inactivity before auto-logout (for demo/security purposes)
const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
// Show warning 1 minute before timeout
const WARNING_BEFORE_MS = 60 * 1000;

export default function SessionTimeout() {
  const { status } = useSession();
  const [lastActive, setLastActive] = useState<number>(() => Date.now());
  const [showWarning, setShowWarning] = useState(false);

  const resetTimer = useCallback(() => {
    setLastActive(Date.now());
    if (showWarning) setShowWarning(false);
  }, [showWarning]);

  useEffect(() => {
    // Only track if logged in
    if (status !== "authenticated") return;

    // Attach listeners for user activity
    const events = ["mousemove", "keydown", "scroll", "click", "touchstart"];
    const handleActivity = () => {
      // Throttle state updates to once per second max
      if (Date.now() - lastActive > 1000) {
        resetTimer();
      }
    };

    events.forEach((event) => window.addEventListener(event, handleActivity));

    // Check timer periodically
    const intervalId = setInterval(() => {
      const idleTime = Date.now() - lastActive;

      // If idle time > timeout, log out
      if (idleTime >= IDLE_TIMEOUT_MS) {
        signOut({ callbackUrl: "/" });
      } 
      // If idle time is approaching timeout, show warning
      else if (idleTime >= IDLE_TIMEOUT_MS - WARNING_BEFORE_MS && !showWarning) {
        setShowWarning(true);
      }
    }, 10000); // Check every 10s

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      clearInterval(intervalId);
    };
  }, [lastActive, status, showWarning, resetTimer]);

  if (!showWarning || status !== "authenticated") return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full text-center space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-800">Are you still there?</h3>
          <p className="text-sm text-slate-500 mt-1">
            For your security, you will be automatically logged out in less than a minute due to inactivity.
          </p>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
          >
            <LogOut className="h-4 w-4" /> Log Out
          </button>
          <button
            onClick={resetTimer}
            className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
          >
            I&apos;m still here
          </button>
        </div>
      </div>
    </div>
  );
}
