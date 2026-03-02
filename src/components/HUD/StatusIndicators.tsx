"use client";

import type { DataLayer } from "@/types";

interface FeedStatus {
  layer: DataLayer;
  label: string;
  status: "active" | "stale" | "error" | "disabled";
}

interface StatusIndicatorsProps {
  feeds: FeedStatus[];
}

export default function StatusIndicators({ feeds }: StatusIndicatorsProps) {
  const statusColor = {
    active: "bg-green-500",
    stale: "bg-yellow-500",
    error: "bg-red-500",
    disabled: "bg-gray-600",
  };

  return (
    <div className="absolute bottom-4 right-4 pointer-events-none z-30 space-y-1">
      <div className="text-green-400/80 text-[10px] tracking-wider font-mono mb-1">
        DATA FEEDS
      </div>
      {feeds.map((feed) => (
        <div
          key={feed.layer}
          className="flex items-center gap-2 text-[10px] font-mono text-green-400/70"
        >
          <div
            className={`w-2 h-2 rounded-full ${statusColor[feed.status]} ${
              feed.status === "active" ? "animate-pulse" : ""
            }`}
          />
          <span className="uppercase tracking-wider">{feed.label}</span>
        </div>
      ))}
    </div>
  );
}
