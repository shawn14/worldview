"use client";

import { useEffect, useRef, MutableRefObject } from "react";
import type { Viewer } from "cesium";

interface CesiumViewerProps {
  viewerRef: MutableRefObject<Viewer | null>;
}

export default function CesiumViewerComponent({ viewerRef }: CesiumViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || !containerRef.current) return;
    initialized.current = true;

    (async () => {
      const Cesium = await import("cesium");
      const CesiumMath = Cesium.Math;
      // @ts-expect-error — CSS import handled by webpack, no type declarations
      await import("cesium/Build/Cesium/Widgets/widgets.css");

      // Configure Cesium Ion and base URL
      const token = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;
      if (token) {
        Cesium.Ion.defaultAccessToken = token;
      } else {
        console.warn(
          "NEXT_PUBLIC_CESIUM_ION_TOKEN not set — 3D Tiles unavailable"
        );
      }
      (window as any).CESIUM_BASE_URL = "/cesium/";

      // Create viewer with minimal UI
      const viewer = new Cesium.Viewer(containerRef.current!, {
        timeline: false,
        animation: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        sceneModePicker: false,
        selectionIndicator: false,
        navigationHelpButton: false,
        navigationInstructionsInitiallyVisible: false,
        creditContainer: document.createElement("div"), // hide credits
        msaaSamples: 1,
        requestRenderMode: false,
        globe: false, // disable default globe — we use 3D Tiles
      });

      // Enable lighting for realism
      if (viewer.scene.globe) {
        viewer.scene.globe.enableLighting = true;
      }
      viewer.scene.highDynamicRange = false;
      viewer.scene.postProcessStages.fxaa.enabled = true;

      // Load Google Photorealistic 3D Tiles via Cesium Ion
      try {
        const tileset = await Cesium.createGooglePhotorealistic3DTileset();
        viewer.scene.primitives.add(tileset);
      } catch (err) {
        console.error("Failed to load Google 3D Tiles:", err);
        // Fallback: re-enable globe with default imagery
        viewer.scene.globe = new Cesium.Globe(Cesium.Ellipsoid.WGS84);
      }

      // Set initial camera — looking down at the Pentagon
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(-77.0558, 38.8711, 2500),
        orientation: {
          heading: CesiumMath.toRadians(0),
          pitch: CesiumMath.toRadians(-45),
          roll: 0,
        },
        duration: 0, // instant on load
      });

      viewerRef.current = viewer;
    })();

    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [viewerRef]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: "#000" }}
    />
  );
}
