"use client";

import { useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import { scaleLinear } from "d3-scale";

const geoUrl = "/maps/india.topo.json";

interface RegionDataPoint {
  name: string;
  value: number;
}

interface IndiaMapProps {
  data: RegionDataPoint[];
}

function normalizeStateName(name: string) {
  const aliases: Record<string, string> = {
    "andaman & nicobar island": "andaman and nicobar islands",
    "arunanchal pradesh": "arunachal pradesh",
    "dadara & nagar havelli": "dadra and nagar haveli",
    "daman & diu": "daman and diu",
    "jammu & kashmir": "jammu and kashmir",
    "nct of delhi": "delhi",
  };

  const value = name.trim().toLowerCase();

  return aliases[value] || value;
}

export default function IndiaMap({ data }: IndiaMapProps) {
  const maxValue = useMemo(() => {
    return Math.max(...data.map((item) => item.value), 1);
  }, [data]);

  const colorScale = scaleLinear<string>()
    .domain([0, maxValue])
    .range(["#ecfdf5", "#059669"]);

  const voteByState = useMemo(() => {
    const map = new Map<string, number>();

    for (const item of data) {
      map.set(normalizeStateName(item.name), item.value);
    }

    return map;
  }, [data]);

  return (
    <div className="relative w-full h-full min-h-[300px]">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 1050,
          center: [82, 23],
        }}
        width={800}
        height={600}
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const stateName = geo.properties?.name || "";
              const value =
                voteByState.get(normalizeStateName(stateName)) || 0;

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={value > 0 ? colorScale(value) : "#f1f5f9"}
                  stroke="#ffffff"
                  strokeWidth={0.7}
                  style={
                    // @types/react-simple-maps is missing the correct structure for interactive states
                    {
                      default: { outline: "none" },
                      hover: { fill: "#10b981", outline: "none", cursor: "pointer" },
                      pressed: { outline: "none" },
                    } as React.CSSProperties
                  }
                >
                  <title>
                    {stateName}: {value} {value === 1 ? "vote" : "votes"}
                  </title>
                </Geography>
              );
            })
          }
        </Geographies>
      </ComposableMap>

      <div className="absolute bottom-4 right-4 rounded-lg border bg-white/90 p-3 text-xs shadow-sm">
        <div className="mb-1 flex justify-between font-bold">
          <span className="text-zinc-500">0</span>
          <span className="text-zinc-800">{maxValue}</span>
        </div>

        <div className="h-2 w-32 rounded bg-gradient-to-r from-[#ecfdf5] to-[#059669]" />

        <p className="mt-1 text-slate-500 font-medium text-center">
          Number of votes
        </p>
      </div>
    </div>
  );
}
