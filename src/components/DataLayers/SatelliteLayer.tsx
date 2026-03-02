"use client";

import { useEffect, useRef, MutableRefObject } from "react";
import type { Viewer } from "cesium";
import { useSatelliteData } from "@/hooks/useSatelliteData";

interface SatelliteLayerProps {
  viewerRef: MutableRefObject<Viewer | null>;
  enabled: boolean;
}

export default function SatelliteLayer({
  viewerRef,
  enabled,
}: SatelliteLayerProps) {
  const positions = useSatelliteData();
  const collectionRef = useRef<any>(null);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

    // Remove existing collection
    if (collectionRef.current) {
      viewer.scene.primitives.remove(collectionRef.current);
      collectionRef.current = null;
    }

    if (!enabled || positions.length === 0) return;

    let cancelled = false;

    (async () => {
      const Cesium = await import("cesium");
      if (cancelled || viewer.isDestroyed()) return;

      const collection = new Cesium.PointPrimitiveCollection();

      for (const sat of positions) {
        collection.add({
          position: Cesium.Cartesian3.fromDegrees(
            sat.longitude,
            sat.latitude,
            sat.altitude * 1000
          ),
          pixelSize: 2.5,
          color: Cesium.Color.CYAN.withAlpha(0.85),
          outlineColor: Cesium.Color.CYAN.withAlpha(0.3),
          outlineWidth: 1,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          id: `sat-${sat.noradId}`,
        });
      }

      viewer.scene.primitives.add(collection);
      collectionRef.current = collection;
    })();

    return () => {
      cancelled = true;
      if (viewer && !viewer.isDestroyed() && collectionRef.current) {
        viewer.scene.primitives.remove(collectionRef.current);
        collectionRef.current = null;
      }
    };
  }, [viewerRef, enabled, positions]);

  return null;
}
