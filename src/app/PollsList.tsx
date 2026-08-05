"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search, Flame, ArrowRight, BookOpen, GraduationCap, Trophy,
  Gavel, HelpCircle, SlidersHorizontal, Clock, Laptop, HeartPulse,
  X, Filter,
} from "lucide-react";

interface Option { id: string; text: string }

interface PollItem {
  id: string;
  question: string;
  description: string | null;
  category: string;
  status: string;
  closesAt?: Date | string | null;
  createdAt: Date | string;
  creator: { name: string | null };
  options: Option[];
  _count: { votes: number };
}

interface PollsListProps { initialPolls: PollItem[] }

// ---------------------------------------------------------------------------
// Category config (extended to match schema)
// ---------------------------------------------------------------------------
const CATEGORY_MAP: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  EDUCATION:  { label: "Education",  icon: GraduationCap, color: "text-indigo-600",  bg: "bg-indigo-50 border-indigo-100" },
  SPORTS:     { label: "Sports",     icon: Trophy,        color: "text-amber-600",   bg: "bg-amber-50 border-amber-100" },
  POLITICS:   { label: "Politics",   icon: Gavel,         color: "text-red-600",     bg: "bg-red-50 border-red-100" },
  BOOKS:      { label: "Books",      icon: BookOpen,      color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
  TECHNOLOGY: { label: "Technology", icon: Laptop,        color: "text-blue-600",    bg: "bg-blue-50 border-blue-100" },
  HEALTH:     { label: "Health",     icon: HeartPulse,    color: "text-pink-600",    bg: "bg-pink-50 border-pink-100" },
  OTHER:      { label: "Other",      icon: HelpCircle,    color: "text-slate-600",   bg: "bg-slate-50 border-slate-100" },
};

type SortKey = "newest" | "most_active" | "closing_soon";

const STATUS_STYLES: Record<string, string> = {
  PUBLISHED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  DRAFT:     "bg-slate-100 text-slate-500 border-slate-200",
  CLOSED:    "bg-red-50 text-red-600 border-red-100",
};

function isPollClosed(poll: PollItem): boolean {
  if (poll.status === "CLOSED") return true;
  if (!poll.closesAt) return false;
  return new Date(poll.closesAt) <= new Date();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function PollsList({ initialPolls }: PollsListProps) {
  const [search, setSearch]               = useState("");
  const [selectedCategory, setCategory]   = useState("ALL");
  const [selectedStatus, setStatus]       = useState("ALL");
  const [sort, setSort]                   = useState<SortKey>("newest");
  const [showFilters, setShowFilters]     = useState(false);

  const hasActiveFilters =
    search !== "" || selectedCategory !== "ALL" || selectedStatus !== "ALL" || sort !== "newest";

  const clearFilters = () => {
    setSearch(""); setCategory("ALL"); setStatus("ALL"); setSort("newest");
  };

  // Filter
  const filtered = useMemo(() => initialPolls.filter((poll) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      poll.question.toLowerCase().includes(q) ||
      (poll.description?.toLowerCase().includes(q) ?? false);
    const matchCat = selectedCategory === "ALL" || poll.category === selectedCategory;
    const matchStatus = selectedStatus === "ALL" || poll.status === selectedStatus;
    return matchSearch && matchCat && matchStatus;
  }), [initialPolls, search, selectedCategory, selectedStatus]);

  // Sort
  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    if (sort === "most_active")   return b._count.votes - a._count.votes;
    if (sort === "closing_soon") {
      const aT = a.closesAt ? new Date(a.closesAt).getTime() : Infinity;
      const bT = b.closesAt ? new Date(b.closesAt).getTime() : Infinity;
      return aT - bT;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }), [filtered, sort]);

  return (
    <div className="space-y-6">
      {/* ── Filter Panel ── */}
      <div className="bg-white border border-indigo-50 p-5 rounded-3xl shadow-sm space-y-4">
        {/* Top row: search + sort + toggle */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              id="polls-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search polls…"
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm text-slate-800 transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-2xl p-1 shrink-0">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400 ml-1.5" />
            {(["newest", "most_active", "closing_soon"] as SortKey[]).map((s) => (
              <button
                key={s}
                id={`sort-${s}-btn`}
                onClick={() => setSort(s)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  sort === s ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {s === "newest" ? "Newest" : s === "most_active" ? "Most Active" : "Closing Soon"}
              </button>
            ))}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              showFilters || selectedCategory !== "ALL" || selectedStatus !== "ALL"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
            {(selectedCategory !== "ALL" || selectedStatus !== "ALL") && (
              <span className="bg-white/30 text-white text-[9px] font-black px-1 rounded-full">
                {[selectedCategory !== "ALL", selectedStatus !== "ALL"].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Expandable filter panel */}
        {showFilters && (
          <div className="space-y-3 pt-3 border-t border-slate-100">
            {/* Category chips */}
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 block">Category</span>
              <div className="flex flex-wrap gap-2">
                <button
                  id="category-all-btn"
                  onClick={() => setCategory("ALL")}
                  className={`py-1.5 px-3 rounded-xl text-xs font-black transition-all ${
                    selectedCategory === "ALL"
                      ? "bg-slate-800 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All
                </button>
                {Object.entries(CATEGORY_MAP).map(([key, val]) => {
                  const Icon = val.icon;
                  return (
                    <button
                      key={key}
                      id={`category-${key.toLowerCase()}-btn`}
                      onClick={() => setCategory(key)}
                      className={`py-1.5 px-3 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                        selectedCategory === key
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      {val.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status chips */}
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 block">Status</span>
              <div className="flex flex-wrap gap-2">
                {["ALL", "PUBLISHED", "CLOSED", "DRAFT"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                      selectedStatus === s
                        ? "bg-indigo-600 text-white shadow-sm"
                        : s === "ALL"
                          ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          : `border ${STATUS_STYLES[s]} hover:opacity-80`
                    }`}
                  >
                    {s === "ALL" ? "All Statuses" : s}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear */}
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1">
                <X className="h-3 w-3" /> Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Result count */}
        <div className="flex items-center justify-between pt-1 text-xs text-slate-400">
          <span>
            {sorted.length === initialPolls.length
              ? `${sorted.length} polls`
              : `${sorted.length} of ${initialPolls.length} polls`}
          </span>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-indigo-500 hover:text-indigo-700 font-bold flex items-center gap-1">
              <X className="h-3 w-3" /> Reset
            </button>
          )}
        </div>
      </div>

      {/* ── Poll Cards ── */}
      {sorted.length === 0 ? (
        <div className="text-center py-16 bg-white border border-indigo-50 rounded-3xl shadow-sm text-slate-400">
          <HelpCircle className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <span className="block font-bold">No polls match your filters.</span>
          <span className="text-xs">Try adjusting the search or category.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sorted.map((poll) => {
            const cat = CATEGORY_MAP[poll.category] ?? CATEGORY_MAP.OTHER;
            const Icon = cat.icon;
            const closed = isPollClosed(poll);

            return (
              <div
                key={poll.id}
                className={`bg-white border rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group ${
                  closed ? "border-slate-200 opacity-80" : "border-indigo-50 hover:border-indigo-200"
                }`}
              >
                <div>
                  {/* Top row: category + status */}
                  <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                    <span className={`inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-[10px] font-black border uppercase tracking-wider ${cat.color} ${cat.bg}`}>
                      <Icon className="h-3 w-3" />
                      {cat.label}
                    </span>

                    {closed ? (
                      <span className="inline-flex items-center gap-1 py-0.5 px-2.5 rounded-full text-[10px] font-black bg-red-50 text-red-600 border border-red-100">
                        <Clock className="h-2.5 w-2.5" /> CLOSED
                      </span>
                    ) : poll.status === "DRAFT" ? (
                      <span className="inline-flex items-center gap-1 py-0.5 px-2.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-500 border border-slate-200">
                        DRAFT
                      </span>
                    ) : poll.closesAt ? (
                      <span className="inline-flex items-center gap-1 py-0.5 px-2.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-600 border border-amber-100">
                        <Clock className="h-2.5 w-2.5" />
                        Closes {new Date(poll.closesAt).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {new Date(poll.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Question */}
                  <h4 className="font-extrabold text-slate-800 text-base group-hover:text-indigo-600 transition-colors leading-tight mb-2">
                    {poll.question}
                  </h4>

                  {poll.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                      {poll.description}
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-4 text-xs font-semibold text-slate-500">
                  <div className="flex items-center gap-1">
                    <Flame className="h-4 w-4 text-orange-500 animate-pulse" />
                    <span>{poll._count.votes} {poll._count.votes === 1 ? "vote" : "votes"}</span>
                    {poll.creator.name && (
                      <span className="text-slate-300 ml-2">· {poll.creator.name}</span>
                    )}
                  </div>
                  <Link
                    href={`/polls/${poll.id}`}
                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold transition-all"
                  >
                    <span>{closed ? "View Results" : "Participate"}</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
