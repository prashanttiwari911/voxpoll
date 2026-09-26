"use client";

import React, { useMemo } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleLinear } from "d3-scale";

const geoUrl = "https://raw.githubusercontent.com/Anujarya300/bubble_maps/master/data/geography-data/india.topo.json";

const STATE_CODES: Record<string, string> = {
  "AN": "Andaman and Nicobar Islands",
  "AP": "Andhra Pradesh",
  "AR": "Arunachal Pradesh",
  "AS": "Assam",
  "BR": "Bihar",
  "CH": "Chandigarh",
  "CT": "Chhattisgarh",
  "DN": "Dadra and Nagar Haveli",
  "DD": "Daman and Diu",
  "DL": "Delhi",
  "GA": "Goa",
  "GJ": "Gujarat",
  "HR": "Haryana",
  "HP": "Himachal Pradesh",
  "JK": "Jammu and Kashmir",
  "JH": "Jharkhand",
  "KA": "Karnataka",
  "KL": "Kerala",
  "LD": "Lakshadweep",
  "MP": "Madhya Pradesh",
  "MH": "Maharashtra",
  "MN": "Manipur",
  "ML": "Meghalaya",
  "MZ": "Mizoram",
  "NL": "Nagaland",
  "OD": "Odisha",
  "PY": "Puducherry",
  "PB": "Punjab",
  "RJ": "Rajasthan",
  "SK": "Sikkim",
  "TN": "Tamil Nadu",
  "TS": "Telangana",
  "TR": "Tripura",
  "UP": "Uttar Pradesh",
  "UK": "Uttarakhand",
  "WB": "West Bengal"
};

interface RegionDataPoint {
  name: string;
  value: number;
}

interface IndiaMapProps {
  data: RegionDataPoint[];
}

export default function IndiaMap({ data }: IndiaMapProps) {
  // Compute max value for color scale
  const maxValue = useMemo(() => {
    return Math.max(...data.map((d) => d.value), 1);
  }, [data]);

  // Color scale: from light emerald to dark emerald
  const colorScale = scaleLinear<string>()
    .domain([0, maxValue])
    .range(["#ecfdf5", "#059669"]);

  // Create a lookup dictionary for quick access (lowercase name -> value)
  const dataMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((d) => map.set(d.name.toLowerCase(), d.value));
    return map;
  }, [data]);

  return (
    <div className="w-full h-full relative" style={{ minHeight: "300px" }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 1000,
          center: [80, 22] // Center of India
        }}
        width={800}
        height={600}
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              // The TopoJSON uses 2-letter codes for geo.id
              const geoId = String(geo.id);
              const stateName = STATE_CODES[geoId as keyof typeof STATE_CODES] || geoId;
              const value = dataMap.get(stateName.toLowerCase()) || 0;
              
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={value > 0 ? colorScale(value) : "#f1f5f9"}
                  stroke="#cbd5e1"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#34d399", outline: "none", cursor: "pointer" },
                    pressed: { outline: "none" },
                  } as any}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
      
      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm p-3 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm text-xs font-bold text-slate-600 dark:text-zinc-300">
        <div className="flex items-center justify-between mb-1">
          <span>0</span>
          <span>{maxValue}</span>
        </div>
        <div className="h-2 w-32 rounded-full bg-gradient-to-r from-emerald-50 to-emerald-600" />
      </div>
    </div>
  );
}
