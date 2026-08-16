"use client";

import { useState, useEffect } from "react";
import { CheckCircle, BarChart3, Users, TrendingUp, ChevronRight } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
type Step = "browse" | "vote" | "results";

const STEPS: { key: Step; label: string; icon: string }[] = [
  { key: "browse", label: "Browse & Join", icon: "🔍" },
  { key: "vote",   label: "Cast Your Vote", icon: "🗳️" },
  { key: "results",label: "See Results",    icon: "📊" },
];

const OPTIONS = [
  { label: "Artificial Intelligence", color: "bg-indigo-500", pct: 44 },
  { label: "Climate Tech",            color: "bg-emerald-500", pct: 29 },
  { label: "Bioinformatics",          color: "bg-violet-500",  pct: 17 },
  { label: "Digital Humanities",      color: "bg-amber-500",   pct: 10 },
];

// ── Browse Step ───────────────────────────────────────────────────────────────
function BrowseStep() {
  const [typed, setTyped] = useState("");
  const target = "84216";

  useEffect(() => {
    let i = 0;
    setTyped("");
    const t = setInterval(() => {
      if (i < target.length) {
        setTyped(target.slice(0, i + 1));
        i++;
      } else {
        clearInterval(t);
      }
    }, 300);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <p className="text-zinc-400 text-sm font-semibold mb-4">Entering a poll code…</p>
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-xs mx-auto border border-zinc-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-xs font-black">V</span>
            </div>
            <span className="font-black text-zinc-900">VoTI</span>
            <span className="text-zinc-400 text-sm ml-auto">Join a Poll</span>
          </div>
          <div className="text-center bg-zinc-50 rounded-xl p-4 border-2 border-zinc-100">
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-2">Enter Poll Code</p>
            <div className="text-4xl font-black tracking-[0.4em] text-indigo-700 h-10 flex items-center justify-center">
              {typed || <span className="text-zinc-200">_____</span>}
            </div>
          </div>
          <div className={`mt-4 bg-indigo-600 text-white rounded-xl py-3 text-center font-bold text-sm transition-all ${typed.length === 5 ? "opacity-100 scale-100" : "opacity-40 scale-95"}`}>
            Join Poll →
          </div>
        </div>
      </div>

      {/* Poll card preview */}
      {typed.length === 5 && (
        <div className="bg-white rounded-2xl shadow-lg p-4 max-w-xs mx-auto border border-indigo-100 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Education</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">● Live</span>
          </div>
          <h4 className="font-black text-zinc-900 text-sm leading-snug">Which educational path will shape the next decade?</h4>
        </div>
      )}
    </div>
  );
}

// ── Vote Step ─────────────────────────────────────────────────────────────────
function VoteStep() {
  const [selected, setSelected] = useState<number | null>(null);
  const [voted, setVoted] = useState(false);

  const handleVote = () => {
    if (selected === null) return;
    setVoted(true);
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm mx-auto overflow-hidden border border-zinc-100">
        {/* Poll header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-4">
          <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">Education</span>
          <h4 className="font-black text-white text-sm mt-1 leading-snug">Which educational path will shape the next decade?</h4>
        </div>

        <div className="p-4 space-y-2">
          {!voted ? (
            <>
              <p className="text-[10px] font-bold text-zinc-400 mb-3">Select one answer</p>
              {OPTIONS.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left text-sm font-bold transition-all ${
                    selected === i
                      ? "border-indigo-500 bg-indigo-50 text-indigo-800"
                      : "border-zinc-100 hover:border-zinc-200 text-zinc-700"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selected === i ? "border-indigo-600 bg-indigo-600" : "border-zinc-300"}`}>
                    {selected === i && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  {opt.label}
                </button>
              ))}
              <button
                onClick={handleVote}
                disabled={selected === null}
                className={`w-full mt-3 py-3 rounded-xl font-black text-sm transition-all ${
                  selected !== null
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md"
                    : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                }`}
              >
                Submit Vote
              </button>
            </>
          ) : (
            <div className="text-center py-4 animate-in zoom-in-95 fade-in">
              <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
              <p className="font-black text-zinc-900">Vote Recorded!</p>
              <p className="text-xs text-zinc-500 font-medium mt-1">Your response is anonymous and secure.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Results Step ──────────────────────────────────────────────────────────────
function ResultsStep() {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm mx-auto overflow-hidden border border-zinc-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-white" />
          <span className="font-black text-white text-sm">Live Results</span>
          <span className="ml-auto flex items-center gap-1 text-white/70 text-[10px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            247 votes
          </span>
        </div>

        {/* Bars */}
        <div className="p-4 space-y-4">
          {OPTIONS.map((opt, i) => (
            <div key={i}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-zinc-700">{opt.label}</span>
                <span className="text-xs font-black text-zinc-900">{opt.pct}%</span>
              </div>
              <div className="h-8 bg-zinc-100 rounded-xl overflow-hidden">
                <div
                  className={`h-full ${opt.color} rounded-xl flex items-center px-3 transition-all duration-1000 ease-out`}
                  style={{ width: animated ? `${opt.pct}%` : "4%" }}
                >
                  {animated && opt.pct > 12 && (
                    <span className="text-white text-xs font-black drop-shadow-sm">{opt.pct}%</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Demographics mini-bar */}
        <div className="px-4 pb-4 grid grid-cols-3 gap-2 border-t border-zinc-100 pt-4">
          {[
            { icon: Users, label: "247", sub: "Voters" },
            { icon: TrendingUp, label: "4", sub: "Regions" },
            { icon: BarChart3, label: "3", sub: "Age groups" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={sub} className="bg-zinc-50 rounded-xl p-2 text-center">
              <Icon className="h-4 w-4 text-indigo-400 mx-auto mb-1" />
              <span className="block font-black text-sm text-zinc-900">{label}</span>
              <span className="block text-[9px] text-zinc-400 font-semibold">{sub}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function LiveDemo() {
  const [step, setStep] = useState<Step>("browse");

  const currentIndex = STEPS.findIndex((s) => s.key === step);

  const advance = () => {
    if (currentIndex < STEPS.length - 1) {
      setStep(STEPS[currentIndex + 1].key);
    } else {
      setStep("browse");
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-zinc-50 to-white border-y border-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-xs font-black px-3 py-1.5 rounded-full mb-4 border border-indigo-100">
            ✦ INTERACTIVE DEMO
          </div>
          <h2 className="text-4xl font-black text-zinc-900">See how it works</h2>
          <p className="text-zinc-500 font-medium mt-2 text-lg">Click through the steps below to experience VoTI.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Step Selector — Left */}
          <div className="space-y-4">
            {STEPS.map((s, i) => (
              <button
                key={s.key}
                onClick={() => setStep(s.key)}
                className={`w-full flex items-center gap-5 p-5 rounded-2xl border-2 text-left transition-all duration-300 group ${
                  step === s.key
                    ? "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100"
                    : "border-zinc-200 hover:border-zinc-300 bg-white"
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-colors ${step === s.key ? "bg-indigo-100" : "bg-zinc-100"}`}>
                  {s.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black uppercase tracking-widest ${step === s.key ? "text-indigo-500" : "text-zinc-400"}`}>
                      Step {i + 1}
                    </span>
                    {step === s.key && <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />}
                  </div>
                  <h3 className={`font-black text-lg mt-0.5 ${step === s.key ? "text-indigo-900" : "text-zinc-700"}`}>{s.label}</h3>
                </div>
                <ChevronRight className={`h-5 w-5 shrink-0 transition-all ${step === s.key ? "text-indigo-500 translate-x-1" : "text-zinc-300"}`} />
              </button>
            ))}

            <button
              onClick={advance}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-2"
            >
              {currentIndex < STEPS.length - 1 ? (
                <><span>Next Step</span><ChevronRight className="h-5 w-5" /></>
              ) : (
                <span>↺ Restart Demo</span>
              )}
            </button>
          </div>

          {/* Animated Demo — Right */}
          <div className="bg-zinc-100 rounded-3xl p-6 min-h-[400px] flex items-center justify-center border border-zinc-200 shadow-inner">
            {step === "browse"  && <BrowseStep  key="browse"  />}
            {step === "vote"    && <VoteStep    key="vote"    />}
            {step === "results" && <ResultsStep key="results" />}
          </div>
        </div>
      </div>
    </section>
  );
}
