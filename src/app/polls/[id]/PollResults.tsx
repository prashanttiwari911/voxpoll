"use client";

import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
  PieChart, Pie, Cell,
  LineChart, Line,
} from "recharts";
import { useState } from "react";
import {
  Trophy, Users, Globe, TrendingUp, PieChart as PieIcon,
  BarChart2, Sparkles, Award,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface OptionResult {
  id: string;
  text: string;
  count: number;
  percentage: number;
}

export interface AgeDataPoint {
  name: string; // "Under 25" | "25-45" | "45+"
  [optionText: string]: string | number;
}

export interface RegionDataPoint {
  name: string;
  value: number;
}

export interface TrendDataPoint {
  date: string; // "Jan 1", "Jan 2" …
  votes: number;
  cumulative: number;
}

interface PollResultsProps {
  options: OptionResult[];
  totalVotes: number;
  ageData: AgeDataPoint[];
  regionData: RegionDataPoint[];
  trendData: TrendDataPoint[];
}

// ---------------------------------------------------------------------------
// Color palette
// ---------------------------------------------------------------------------
const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ec4899", "#8b5cf6", "#06b6d4", "#f97316", "#14b8a6"];

// Active shape removed — Recharts v3 Pie type doesn't accept activeIndex/activeShape
// Use Tooltip + Legend for interactivity instead.

type TabKey = "standing" | "pie" | "age" | "region" | "trend";
const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "standing", label: "Standing", icon: <Trophy className="h-3.5 w-3.5" /> },
  { key: "pie",      label: "Vote Share", icon: <PieIcon className="h-3.5 w-3.5" /> },
  { key: "age",      label: "Age",        icon: <Users className="h-3.5 w-3.5" /> },
  { key: "region",   label: "Region",     icon: <Globe className="h-3.5 w-3.5" /> },
  { key: "trend",    label: "Trend",      icon: <TrendingUp className="h-3.5 w-3.5" /> },
];

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function PollResults({
  options, totalVotes, ageData, regionData, trendData,
}: PollResultsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("standing");

  const sortedOptions = [...options].sort((a, b) => b.count - a.count);
  const leader = sortedOptions[0];

  // Pie chart data
  const pieData = options.map((o) => ({ name: o.text, value: o.count }));

  // Region bar data (horizontal) — top 8
  const regionBarData = regionData.slice(0, 8);

  const noVotes = totalVotes === 0;

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-indigo-50 rounded-2xl py-3 px-2">
          <span className="block text-2xl font-black text-indigo-600">{totalVotes}</span>
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-400">Total Votes</span>
        </div>
        <div className="bg-amber-50 rounded-2xl py-3 px-2">
          <span className="block text-2xl font-black text-amber-600">{options.length}</span>
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-400">Options</span>
        </div>
        <div className="bg-emerald-50 rounded-2xl py-3 px-2">
          <span className="block text-2xl font-black text-emerald-600">{regionData.length}</span>
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400">Regions</span>
        </div>
      </div>

      {/* Tab strip */}
      <div className="flex gap-1 bg-slate-100 rounded-2xl p-1 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === t.key
                ? "bg-white shadow text-indigo-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm min-h-[280px]">

        {/* ── Standing ── */}
        {activeTab === "standing" && (
          <div className="space-y-3.5">
            <h3 className="text-sm font-black text-slate-700 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" /> Live Standing
            </h3>
            {options.map((opt) => {
              const isLeader = leader.count > 0 && leader.id === opt.id;
              return (
                <div key={opt.id} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-700">{opt.text}</span>
                      {isLeader && (
                        <span className="inline-flex items-center gap-0.5 bg-amber-100 text-amber-700 text-[9px] font-black px-2 py-0.5 rounded-full">
                          <Sparkles className="h-2.5 w-2.5" /> Leader
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-black text-indigo-600">
                      {opt.count} vote{opt.count !== 1 ? "s" : ""} · {opt.percentage}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isLeader
                          ? "bg-gradient-to-r from-amber-400 to-amber-500"
                          : "bg-gradient-to-r from-indigo-500 to-violet-500"
                      }`}
                      style={{ width: `${opt.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {noVotes && (
              <p className="text-center text-slate-400 text-sm py-6">No votes yet.</p>
            )}
          </div>
        )}

        {/* ── Vote Share Pie ── */}
        {activeTab === "pie" && (
          <div className="space-y-2">
            <h3 className="text-sm font-black text-slate-700 flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-indigo-500" /> Vote Share
            </h3>
            {noVotes ? (
              <p className="text-center text-slate-400 text-sm py-10">No votes cast yet.</p>
            ) : (
              <>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((_, i) => (
                          <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => [`${v} votes`]} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center">
                  {options.map((o, i) => (
                    <div key={o.id} className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-[11px] text-slate-600 font-semibold">{o.text}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Age Breakdown ── */}
        {activeTab === "age" && (
          <div className="space-y-2">
            <h3 className="text-sm font-black text-slate-700 flex items-center gap-2">
              <Users className="h-4 w-4 text-pink-500" /> Votes by Age Group
            </h3>
            {noVotes ? (
              <p className="text-center text-slate-400 text-sm py-10">No votes cast yet.</p>
            ) : (
              <div className="h-56 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ageData} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <Tooltip cursor={{ fill: "#f8fafc" }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    {options.map((opt, i) => (
                      <Bar
                        key={opt.id}
                        dataKey={opt.text}
                        stackId="a"
                        fill={COLORS[i % COLORS.length]}
                        radius={i === options.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* ── Region Horizontal Bar ── */}
        {activeTab === "region" && (
          <div className="space-y-2">
            <h3 className="text-sm font-black text-slate-700 flex items-center gap-2">
              <Globe className="h-4 w-4 text-emerald-500" /> Votes by Region
            </h3>
            {regionBarData.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-10">No regional data yet.</p>
            ) : (
              <div className="h-56 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={regionBarData}
                    margin={{ left: 8, right: 16 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} stroke="#94a3b8" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} width={64} />
                    <Tooltip cursor={{ fill: "#f8fafc" }} />
                    <Bar dataKey="value" name="Votes" radius={[0, 4, 4, 0]}>
                      {regionBarData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* ── Vote Trend Line ── */}
        {activeTab === "trend" && (
          <div className="space-y-2">
            <h3 className="text-sm font-black text-slate-700 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-violet-500" /> Vote Trend
            </h3>
            {trendData.length < 2 ? (
              <p className="text-center text-slate-400 text-sm py-10">
                Not enough data yet — trend appears once 2+ days of votes are recorded.
              </p>
            ) : (
              <div className="h-56 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} stroke="#94a3b8" tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line
                      type="monotone"
                      dataKey="votes"
                      name="Daily Votes"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "#6366f1" }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cumulative"
                      name="Cumulative"
                      stroke="#10b981"
                      strokeWidth={2}
                      strokeDasharray="4 2"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Leading option callout */}
      {!noVotes && leader && leader.count > 0 && (
        <div className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl px-4 py-3">
          <Award className="h-5 w-5 text-amber-500 shrink-0" />
          <p className="text-sm font-bold text-amber-800">
            <span className="text-amber-600">"{leader.text}"</span> is leading with{" "}
            {leader.percentage}% of votes
          </p>
        </div>
      )}
    </div>
  );
}
