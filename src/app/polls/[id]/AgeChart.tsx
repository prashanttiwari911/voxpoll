"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { Users } from "lucide-react";

import { AgeDataPoint, OptionResult } from "./PollResults";

const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ec4899", "#8b5cf6", "#06b6d4", "#f97316", "#14b8a6"];

export default function AgeChart({ ageData, options, noVotes }: { ageData: AgeDataPoint[], options: OptionResult[], noVotes: boolean }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-black text-slate-700 flex items-center gap-2">
        <Users className="h-4 w-4 text-pink-500" /> Responses by Age Group
      </h3>
      {noVotes ? (
        <p className="text-center text-slate-400 text-sm py-10">No votes cast yet.</p>
      ) : (
        <div className="h-64 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ageData} barCategoryGap="30%" margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
              <YAxis allowDecimals={false} stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: '10px' }} />
              {options.map((opt, i: number) => (
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
  );
}
