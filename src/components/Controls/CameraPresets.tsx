"use client";

import { MutableRefObject } from "react";
import { Cartesian3, Math as CesiumMath } from "cesium";
import { CAMERA_PRESETS } from "@/lib/camera-presets";
import type { Viewer } from "cesium";

interface CameraPresetsProps {
  viewerRef: MutableRefObject<Viewer | null>;
}

export default function CameraPresets({ viewerRef }: CameraPresetsProps) {
  const flyTo = (preset: (typeof CAMERA_PRESETS)[number]) => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(
        preset.longitude,
        preset.latitude,
        preset.height
      ),
      orientation: {
        heading: CesiumMath.toRadians(preset.heading),
        pitch: CesiumMath.toRadians(preset.pitch),
        roll: 0,
      },
      duration: 2.0,
    });
  };

  return (
    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 flex gap-1 pointer-events-auto">
      {CAMERA_PRESETS.map((preset) => (
        <button
          key={preset.name}
          onClick={() => flyTo(preset)}
          className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider
            bg-black/60 border border-green-400/30 text-green-400/80
            hover:bg-green-400/10 hover:border-green-400/60 hover:text-green-400
            transition-all duration-200"
        >
          {preset.name}
        </button>
      ))}
    </div>
  );
}
