"use client";

import type { AlertZone } from "@/types";

interface AlertInfoPanelProps {
  zone: AlertZone;
  onClose: () => void;
}

const TYPE_LABELS: Record<AlertZone["type"], string> = {
  "active-conflict": "ACTIVE CONFLICT",
  "tension-zone": "TENSION ZONE",
  "disputed-territory": "DISPUTED TERRITORY",
};

export default function AlertInfoPanel({ zone, onClose }: AlertInfoPanelProps) {
  const isRed = zone.severity === "red";

  return (
    <div className="absolute bottom-20 left-4 z-50 pointer-events-auto w-72 font-mono">
      <div
        className={`bg-black/90 border backdrop-blur-sm ${
          isRed ? "border-red-500/40" : "border-amber-500/40"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-3 py-2 border-b ${
            isRed
              ? "border-red-500/20 bg-red-500/10"
              : "border-amber-500/20 bg-amber-500/10"
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full animate-pulse ${
                isRed ? "bg-red-500" : "bg-amber-500"
              }`}
            />
            <span
              className={`text-[10px] tracking-wider ${
                isRed ? "text-red-400" : "text-amber-400"
              }`}
            >
              {TYPE_LABELS[zone.type]}
            </span>
          </div>
          <button
            onClick={onClose}
            className={`text-xs px-1.5 py-0.5 border transition-colors ${
              isRed
                ? "text-red-400/60 hover:text-red-400 border-red-400/20 hover:border-red-400/50"
                : "text-amber-400/60 hover:text-amber-400 border-amber-400/20 hover:border-amber-400/50"
            }`}
          >
            [X]
          </button>
        </div>

        {/* Zone name */}
        <div
          className={`px-3 py-2 border-b ${
            isRed ? "border-red-500/10" : "border-amber-500/10"
          }`}
        >
          <div
            className={`text-sm font-bold tracking-wide ${
              isRed ? "text-red-400" : "text-amber-400"
            }`}
          >
            {zone.name}
          </div>
        </div>

        {/* Description */}
        <div className="px-3 py-2">
          <p
            className={`text-[10px] leading-relaxed ${
              isRed ? "text-red-400/70" : "text-amber-400/70"
            }`}
          >
            {zone.description}
          </p>
        </div>

        {/* Footer */}
        <div
          className={`px-3 py-1.5 text-[8px] border-t ${
            isRed
              ? "text-red-400/30 border-red-500/10"
              : "text-amber-400/30 border-amber-500/10"
          }`}
        >
          ID: {zone.id} | SEVERITY: {zone.severity.toUpperCase()} | SRC: CURATED
          INTEL
        </div>
      </div>
    </div>
  );
}
