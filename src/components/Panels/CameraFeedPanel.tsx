"use client";

import type { CameraData } from "@/types";

interface CameraFeedPanelProps {
  camera: CameraData;
  onClose: () => void;
}

export default function CameraFeedPanel({
  camera,
  onClose,
}: CameraFeedPanelProps) {
  return (
    <div
      className="absolute bottom-6 left-6 z-50 w-[420px] bg-black/90 border border-green-400/30
        font-mono text-green-400 shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-green-400/20 bg-green-400/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] tracking-wider uppercase">
            LIVE FEED
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-green-400/60 hover:text-green-400 text-xs px-1.5 py-0.5
            border border-green-400/20 hover:border-green-400/50 transition-colors"
        >
          CLOSE
        </button>
      </div>

      {/* Camera info */}
      <div className="px-3 py-2 border-b border-green-400/10">
        <div className="text-[11px] font-bold tracking-wide">{camera.name}</div>
        <div className="text-[9px] text-green-400/50 mt-0.5">
          {camera.source} | {camera.latitude.toFixed(4)},{" "}
          {camera.longitude.toFixed(4)}
        </div>
      </div>

      {/* Feed image */}
      <div className="relative w-full aspect-video bg-black flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={camera.streamUrl}
          alt={`Live feed: ${camera.name}`}
          className="w-full h-full object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            const parent = target.parentElement;
            if (parent && !parent.querySelector(".feed-error")) {
              const div = document.createElement("div");
              div.className =
                "feed-error text-[10px] text-red-400/70 font-mono";
              div.textContent = "FEED UNAVAILABLE";
              parent.appendChild(div);
            }
          }}
        />
        {/* Scanline overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.03) 2px, rgba(0,255,0,0.03) 4px)",
          }}
        />
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 text-[8px] text-green-400/30 border-t border-green-400/10">
        ID: {camera.id} | REFRESH: AUTO
      </div>
    </div>
  );
}
