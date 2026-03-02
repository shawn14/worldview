"use client";

import { MutableRefObject } from "react";
import type { FilterMode } from "@/types";
import type { Viewer } from "cesium";
import { applyFilterMode } from "@/lib/shader-effects";

interface FilterModeSelectorProps {
  viewerRef: MutableRefObject<Viewer | null>;
  activeMode: FilterMode;
  onModeChange: (mode: FilterMode) => void;
}

const MODES: { mode: FilterMode; label: string; color: string }[] = [
  { mode: "normal", label: "NORM", color: "text-white" },
  { mode: "nvg", label: "NVG", color: "text-green-400" },
  { mode: "crt", label: "CRT", color: "text-amber-400" },
  { mode: "flir", label: "FLIR", color: "text-red-400" },
];

export default function FilterModeSelector({
  viewerRef,
  activeMode,
  onModeChange,
}: FilterModeSelectorProps) {
  const handleSelect = (mode: FilterMode) => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;
    applyFilterMode(viewer, mode);
    onModeChange(mode);
  };

  return (
    <div className="absolute top-8 left-1/2 -translate-x-1/2 z-40 flex gap-1 pointer-events-auto">
      <div className="text-[9px] font-mono text-green-400/50 tracking-wider self-center mr-2">
        FILTER
      </div>
      {MODES.map(({ mode, label, color }) => (
        <button
          key={mode}
          onClick={() => handleSelect(mode)}
          className={`px-3 py-1 text-[11px] font-mono uppercase tracking-wider
            border transition-all duration-200
            ${
              activeMode === mode
                ? `bg-green-400/20 border-green-400/60 ${color}`
                : "bg-black/60 border-green-400/20 text-green-400/50 hover:border-green-400/40 hover:text-green-400/80"
            }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
