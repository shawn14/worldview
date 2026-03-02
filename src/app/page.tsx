"use client";

import { useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import type { Viewer } from "cesium";
import type { FilterMode, DataLayer, FlightData, CameraData } from "@/types";
import HUDOverlay from "@/components/HUD/HUDOverlay";
import Crosshair from "@/components/HUD/Crosshair";
import StatusIndicators from "@/components/HUD/StatusIndicators";
import FilterModeSelector from "@/components/Controls/FilterModeSelector";
import DataLayerToggles from "@/components/Controls/DataLayerToggles";
import CameraPresets from "@/components/Controls/CameraPresets";

// Dynamic imports for Cesium-dependent components (no SSR)
const CesiumViewer = dynamic(() => import("@/components/CesiumViewer"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-black">
      <div className="text-green-400 font-mono text-sm animate-pulse">
        INITIALIZING WORLDVIEW...
      </div>
    </div>
  ),
});

const FlightLayer = dynamic(
  () => import("@/components/DataLayers/FlightLayer"),
  { ssr: false }
);
const SatelliteLayer = dynamic(
  () => import("@/components/DataLayers/SatelliteLayer"),
  { ssr: false }
);
const SeismicLayer = dynamic(
  () => import("@/components/DataLayers/SeismicLayer"),
  { ssr: false }
);
const TrafficLayer = dynamic(
  () => import("@/components/DataLayers/TrafficLayer"),
  { ssr: false }
);
const CCTVLayer = dynamic(
  () => import("@/components/DataLayers/CCTVLayer"),
  { ssr: false }
);
const EntityInfoPanel = dynamic(
  () => import("@/components/Panels/EntityInfoPanel"),
  { ssr: false }
);
const CameraFeedPanel = dynamic(
  () => import("@/components/Panels/CameraFeedPanel"),
  { ssr: false }
);

const DEFAULT_LAYERS = new Set<DataLayer>(["flights", "satellites"]);

export default function WorldViewPage() {
  const viewerRef = useRef<Viewer | null>(null);
  const [filterMode, setFilterMode] = useState<FilterMode>("normal");
  const [activeLayers, setActiveLayers] = useState<Set<DataLayer>>(DEFAULT_LAYERS);
  const [selectedFlight, setSelectedFlight] = useState<FlightData | null>(null);
  const [selectedCamera, setSelectedCamera] = useState<CameraData | null>(null);

  const toggleLayer = useCallback((layer: DataLayer) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layer)) {
        next.delete(layer);
      } else {
        next.add(layer);
      }
      return next;
    });
  }, []);

  const feedStatuses = [
    {
      layer: "flights" as DataLayer,
      label: "AIR TRAFFIC",
      status: activeLayers.has("flights") ? ("active" as const) : ("disabled" as const),
    },
    {
      layer: "military" as DataLayer,
      label: "MILITARY",
      status: activeLayers.has("military") ? ("active" as const) : ("disabled" as const),
    },
    {
      layer: "satellites" as DataLayer,
      label: "SATELLITES",
      status: activeLayers.has("satellites") ? ("active" as const) : ("disabled" as const),
    },
    {
      layer: "seismic" as DataLayer,
      label: "SEISMIC",
      status: activeLayers.has("seismic") ? ("active" as const) : ("disabled" as const),
    },
    {
      layer: "traffic" as DataLayer,
      label: "TRAFFIC",
      status: activeLayers.has("traffic") ? ("active" as const) : ("disabled" as const),
    },
    {
      layer: "cameras" as DataLayer,
      label: "CCTV",
      status: activeLayers.has("cameras") ? ("active" as const) : ("disabled" as const),
    },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* 3D Globe */}
      <CesiumViewer viewerRef={viewerRef} />

      {/* HUD Overlay */}
      <HUDOverlay viewerRef={viewerRef} />
      <Crosshair />
      <StatusIndicators feeds={feedStatuses} />

      {/* Controls */}
      <FilterModeSelector
        viewerRef={viewerRef}
        activeMode={filterMode}
        onModeChange={setFilterMode}
      />
      <DataLayerToggles activeLayers={activeLayers} onToggle={toggleLayer} />
      <CameraPresets viewerRef={viewerRef} />

      {/* Data Layers */}
      <FlightLayer
        viewerRef={viewerRef}
        enabled={activeLayers.has("flights")}
        showMilitary={activeLayers.has("military")}
        onSelect={setSelectedFlight}
      />
      <SatelliteLayer
        viewerRef={viewerRef}
        enabled={activeLayers.has("satellites")}
      />
      <SeismicLayer
        viewerRef={viewerRef}
        enabled={activeLayers.has("seismic")}
      />
      <TrafficLayer
        viewerRef={viewerRef}
        enabled={activeLayers.has("traffic")}
      />
      <CCTVLayer
        viewerRef={viewerRef}
        enabled={activeLayers.has("cameras")}
        onSelect={setSelectedCamera}
      />

      {/* Info Panels */}
      {selectedFlight && (
        <EntityInfoPanel
          flight={selectedFlight}
          onClose={() => setSelectedFlight(null)}
        />
      )}
      {selectedCamera && (
        <CameraFeedPanel
          camera={selectedCamera}
          onClose={() => setSelectedCamera(null)}
        />
      )}
    </div>
  );
}
