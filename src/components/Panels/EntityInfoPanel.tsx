"use client";

import type { FlightData } from "@/types";

interface EntityInfoPanelProps {
  flight: FlightData;
  onClose: () => void;
}

function formatAltitude(meters: number): string {
  const feet = Math.round(meters * 3.28084);
  return `${feet.toLocaleString()} ft`;
}

function formatSpeed(ms: number): string {
  const knots = Math.round(ms * 1.94384);
  return `${knots} kts`;
}

function formatHeading(degrees: number): string {
  return `${Math.round(degrees)}°`;
}

function formatVerticalRate(ms: number): string {
  const fpm = Math.round(ms * 196.85);
  if (fpm > 0) return `+${fpm} fpm`;
  if (fpm < 0) return `${fpm} fpm`;
  return "0 fpm";
}

export default function EntityInfoPanel({
  flight,
  onClose,
}: EntityInfoPanelProps) {
  const rows = [
    { label: "CALLSIGN", value: flight.callsign || "N/A" },
    { label: "ICAO24", value: flight.icao24.toUpperCase() },
    { label: "ORIGIN", value: flight.originCountry },
    { label: "ALTITUDE", value: formatAltitude(flight.altitude) },
    { label: "SPEED", value: formatSpeed(flight.velocity) },
    { label: "HEADING", value: formatHeading(flight.heading) },
    { label: "V/S", value: formatVerticalRate(flight.verticalRate) },
    { label: "SQUAWK", value: flight.squawk ?? "N/A" },
    { label: "STATUS", value: flight.onGround ? "ON GROUND" : "AIRBORNE" },
  ];

  return (
    <div className="absolute bottom-20 left-4 z-50 pointer-events-auto w-64 font-mono">
      <div className="bg-black/85 border border-green-400/30 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-green-400/20">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                flight.isMilitary ? "bg-red-500" : "bg-green-500"
              }`}
            />
            <span
              className={`text-xs tracking-wider ${
                flight.isMilitary ? "text-red-400" : "text-green-400"
              }`}
            >
              {flight.isMilitary ? "MILITARY" : "CIVILIAN"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-green-400/50 hover:text-green-400 text-xs"
          >
            [X]
          </button>
        </div>

        {/* Data rows */}
        <div className="px-3 py-2 space-y-1">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex justify-between text-[10px]">
              <span className="text-green-400/50">{label}</span>
              <span className="text-green-400">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
