"use client";

import { useState, useEffect } from "react";
import { MonitorPlay, X, Users, QrCode } from "lucide-react";
import QRCode from "react-qr-code";
import type { OptionResult } from "./PollResults";

interface PresenterModeProps {
  pollId: string;
  question: string;
  shortCode?: string | null;
  totalVotes: number;
  options: OptionResult[];
}

export default function PresenterMode({ pollId, question, shortCode, totalVotes, options }: PresenterModeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/polls/${pollId}` : "";
  const joinUrl = typeof window !== "undefined" ? `${window.location.origin}/join` : "";

  // Sort options by count
  const sortedOptions = [...options].sort((a, b) => b.count - a.count);
  const maxCount = sortedOptions.length > 0 ? sortedOptions[0].count : 0;

  // Toggle body scroll and fullscreen
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        title="Present"
        className="inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-all"
      >
        <MonitorPlay className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Present</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-zinc-900 text-white flex flex-col animate-in fade-in">
      {/* Header */}
      <header className="flex justify-between items-center p-6 lg:p-10 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            VoTI
          </span>
          <div className="h-6 w-px bg-zinc-700"></div>
          <div className="flex items-center gap-2 text-zinc-300 font-bold">
            <Users className="h-5 w-5" />
            <span className="text-xl">{totalVotes.toLocaleString()}</span>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
        >
          <X className="h-8 w-8" />
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Results */}
        <div className="flex-1 p-6 lg:p-16 flex flex-col justify-center overflow-y-auto">
          <h1 className="text-4xl lg:text-6xl font-black text-white mb-16 leading-tight">
            {question}
          </h1>

          <div className="space-y-8 w-full max-w-4xl">
            {totalVotes === 0 ? (
              <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                <p className="text-2xl text-zinc-400 font-bold">Waiting for responses...</p>
              </div>
            ) : (
              sortedOptions.map((opt, i) => {
                const isLeader = maxCount > 0 && opt.count === maxCount;
                return (
                  <div key={opt.id} className="relative group">
                    <div className="flex justify-between items-end mb-3">
                      <span className="text-2xl lg:text-3xl font-bold text-zinc-100 group-hover:text-white transition-colors">
                        {opt.text}
                      </span>
                      <span className="text-2xl lg:text-3xl font-black text-zinc-300">
                        {opt.percentage}%
                      </span>
                    </div>
                    <div className="w-full h-12 lg:h-16 bg-white/10 rounded-2xl overflow-hidden relative">
                      <div
                        className={`h-full rounded-2xl transition-all duration-1000 ease-out ${
                          isLeader ? "bg-indigo-500" : "bg-zinc-600"
                        }`}
                        style={{ width: `${opt.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Join Info */}
        <div className="w-full lg:w-96 bg-zinc-950 p-6 lg:p-12 border-t lg:border-t-0 lg:border-l border-zinc-800 flex flex-col justify-center items-center text-center">
          <h3 className="text-xl font-bold text-zinc-400 mb-8">Join the poll at</h3>
          <p className="text-3xl font-black text-indigo-400 break-all mb-8">{joinUrl.replace(/^https?:\/\//, '')}</p>
          
          {shortCode && (
            <>
              <p className="text-zinc-500 font-semibold mb-2 uppercase tracking-widest text-sm">Use Code</p>
              <div className="bg-white/10 px-8 py-4 rounded-3xl mb-12">
                <span className="text-5xl lg:text-6xl font-black text-white tracking-widest">{shortCode.split('').join(' ')}</span>
              </div>
            </>
          )}

          <div className="p-4 bg-white rounded-3xl">
            {url && <QRCode value={url} size={200} />}
          </div>
          <p className="mt-6 font-bold text-zinc-500 flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Scan to vote instantly
          </p>
        </div>
      </div>
    </div>
  );
}
