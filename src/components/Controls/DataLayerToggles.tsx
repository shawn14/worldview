"use client";

import type { DataLayer } from "@/types";

interface LayerConfig {
  id: DataLayer;
  label: string;
  description: string;
}

const LAYERS: LayerConfig[] = [
  { id: "flights", label: "AIR TRAFFIC", description: "Live aircraft positions" },
  { id: "military", label: "MILITARY", description: "Military aircraft filter" },
  { id: "satellites", label: "SATELLITES", description: "Orbital assets" },
  { id: "seismic", label: "SEISMIC", description: "Earthquake activity" },
  { id: "traffic", label: "TRAFFIC", description: "Ground vehicle simulation" },
  { id: "cameras", label: "CCTV", description: "Surveillance cameras" },
];

interface DataLayerTogglesProps {
  activeLayers: Set<DataLayer>;
  onToggle: (layer: DataLayer) => void;
}

export default function DataLayerToggles({
  activeLayers,
  onToggle,
}: DataLayerTogglesProps) {
  return (
    <div className="absolute top-20 right-4 z-40 pointer-events-auto space-y-1 w-44">
      <div className="text-[9px] font-mono text-green-400/50 tracking-wider mb-2">
        DATA LAYERS
      </div>
      {LAYERS.map(({ id, label, description }) => {
        const active = activeLayers.has(id);
        return (
          <button
            key={id}
            onClick={() => onToggle(id)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 text-left
              border transition-all duration-200 font-mono
              ${
                active
                  ? "bg-green-400/10 border-green-400/40 text-green-400"
                  : "bg-black/60 border-green-400/15 text-green-400/40 hover:border-green-400/30"
              }`}
          >
            <div
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                active ? "bg-green-500" : "bg-gray-700"
              }`}
            />
            <div>
              <div className="text-[10px] tracking-wider uppercase">{label}</div>
              <div className="text-[8px] opacity-50">{description}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
