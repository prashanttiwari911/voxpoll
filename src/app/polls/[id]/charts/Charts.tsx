"use client";

import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
  PieChart, Pie, Cell,
  LineChart, Line,
} from "recharts";
import type { OptionResult, AgeDataPoint, RegionDataPoint, TrendDataPoint } from "../PollResults";

const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ec4899", "#8b5cf6", "#06b6d4", "#f97316", "#14b8a6"];

export function OverviewPieChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius="50%"
          outerRadius="80%"
          paddingAngle={3}
          dataKey="value"
          stroke="none"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          itemStyle={{ color: '#1e293b', fontWeight: 600 }}
          formatter={(val: any) => [`${val} votes`, '']}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          wrapperStyle={{ fontSize: 12, fontWeight: 600, paddingTop: '10px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function AgeBarChart({ ageData, options }: { ageData: AgeDataPoint[]; options: OptionResult[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={ageData} barCategoryGap="30%" margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
        <YAxis allowDecimals={false} stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: '10px' }} />
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
  );
}

export function RegionBarChart({ regionData }: { regionData: RegionDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={regionData} barCategoryGap="30%" margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
        <Bar dataKey="value" name="Votes" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TrendLineChart({ trendData }: { trendData: TrendDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
        <YAxis allowDecimals={false} stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: '10px' }} />
        <Line type="monotone" dataKey="newVotes" name="New Votes" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
        <Line type="monotone" dataKey="cumulative" name="Total Votes" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
