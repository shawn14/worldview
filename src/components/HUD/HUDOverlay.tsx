"use client";

import { useEffect, useState, MutableRefObject } from "react";
import type { Viewer } from "cesium";

interface HUDOverlayProps {
  viewerRef: MutableRefObject<Viewer | null>;
}

export default function HUDOverlay({ viewerRef }: HUDOverlayProps) {
  const [lat, setLat] = useState(0);
  const [lon, setLon] = useState(0);
  const [alt, setAlt] = useState(0);
  const [heading, setHeading] = useState(0);
  const [utc, setUtc] = useState("");
  const [resolution, setResolution] = useState("");

  useEffect(() => {
    setResolution(`${window.innerWidth}x${window.innerHeight}`);
    const onResize = () => setResolution(`${window.innerWidth}x${window.innerHeight}`);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    let cancelled = false;

    import("cesium").then((CesiumModule) => {
      if (cancelled) return;
      const CesiumMath = CesiumModule.Math;
      interval = setInterval(() => {
        const viewer = viewerRef.current;
        if (!viewer || viewer.isDestroyed()) return;

        const camera = viewer.camera;
        const carto = camera.positionCartographic;

        if (carto && CesiumMath) {
          setLat(CesiumMath.toDegrees(carto.latitude));
          setLon(CesiumMath.toDegrees(carto.longitude));
          setAlt(carto.height);
          setHeading(CesiumMath.toDegrees(camera.heading));
        }

        setUtc(new Date().toISOString().replace("T", " ").slice(0, 19) + "Z");
      }, 100);
    });

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [viewerRef]);

  const formatCoord = (val: number, posLabel: string, negLabel: string) => {
    const dir = val >= 0 ? posLabel : negLabel;
    return `${Math.abs(val).toFixed(6)}°${dir}`;
  };

  const formatAlt = (meters: number) => {
    if (meters > 1000000) return `${(meters / 1000).toFixed(0)} km`;
    if (meters > 10000) return `${(meters / 1000).toFixed(1)} km`;
    return `${meters.toFixed(0)} m`;
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30 font-mono text-xs">
      {/* Classification Banner */}
      <div className="absolute top-0 left-0 right-0 text-center py-1 bg-red-900/80 text-red-300 text-[10px] tracking-[0.3em] uppercase blink">
        TOP SECRET // SI // NOFORN — WORLDVIEW SPATIAL INTELLIGENCE
      </div>

      {/* Top-left: Coordinates */}
      <div className="absolute top-8 left-4 space-y-1">
        <div className="text-green-400/80 text-[10px] tracking-wider">
          CAMERA POSITION
        </div>
        <div className="text-green-400">
          LAT {formatCoord(lat, "N", "S")}
        </div>
        <div className="text-green-400">
          LON {formatCoord(lon, "E", "W")}
        </div>
        <div className="text-green-400">ALT {formatAlt(alt)}</div>
        <div className="text-green-400">HDG {heading.toFixed(1)}°</div>
      </div>

      {/* Top-right: System status */}
      <div className="absolute top-8 right-4 text-right space-y-1">
        <div className="text-green-400/80 text-[10px] tracking-wider">
          SYSTEM STATUS
        </div>
        <div className="text-green-400">{utc}</div>
        <div className="text-green-400/60 text-[10px]">FEED: ACTIVE</div>
        <div className="text-green-400/60 text-[10px]">
          RES: {resolution}
        </div>
      </div>

      {/* Bottom-left: System info */}
      <div className="absolute bottom-4 left-4 space-y-0.5">
        <div className="text-green-400/40 text-[9px]">
          WORLDVIEW v1.0 // UNCLASSIFIED DEMO
        </div>
        <div className="text-green-400/40 text-[9px]">
          POWERED BY CESIUM + GOOGLE 3D TILES
        </div>
      </div>

      {/* Corner decorations */}
      <svg className="absolute top-6 left-0 w-16 h-16 text-green-400/30">
        <line x1="0" y1="16" x2="16" y2="16" stroke="currentColor" strokeWidth="1" />
        <line x1="16" y1="0" x2="16" y2="16" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg className="absolute top-6 right-0 w-16 h-16 text-green-400/30">
        <line x1="48" y1="16" x2="64" y2="16" stroke="currentColor" strokeWidth="1" />
        <line x1="48" y1="0" x2="48" y2="16" stroke="currentColor" strokeWidth="1" />
      </svg>
    </div>
  );
}
