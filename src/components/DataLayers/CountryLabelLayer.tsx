"use client";

import { useEffect, useRef, MutableRefObject } from "react";
import type { Viewer } from "cesium";
import { COUNTRY_CENTROIDS } from "@/lib/country-labels";

interface CountryLabelLayerProps {
  viewerRef: MutableRefObject<Viewer | null>;
  enabled: boolean;
}

export default function CountryLabelLayer({
  viewerRef,
  enabled,
}: CountryLabelLayerProps) {
  const entityIdsRef = useRef<string[]>([]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

    // Clean up previous entities
    for (const id of entityIdsRef.current) {
      const entity = viewer.entities.getById(id);
      if (entity) viewer.entities.remove(entity);
    }
    entityIdsRef.current = [];

    if (!enabled) return;

    let cancelled = false;

    (async () => {
      const Cesium = await import("cesium");
      if (viewer.isDestroyed() || cancelled) return;

      const ids: string[] = [];

      for (const country of COUNTRY_CENTROIDS) {
        const entityId = `label-${country.name}`;

        viewer.entities.add({
          id: entityId,
          position: Cesium.Cartesian3.fromDegrees(country.lon, country.lat),
          label: {
            text: country.name.toUpperCase(),
            font: "bold 16px monospace",
            fillColor: new Cesium.Color(0.0, 1.0, 0.255, 1.0), // #00ff41
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 4,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            showBackground: true,
            backgroundColor: new Cesium.Color(0, 0, 0, 0.6),
            backgroundPadding: new Cesium.Cartesian2(6, 4),
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            scaleByDistance: new Cesium.NearFarScalar(
              1_000_000,
              1.0,
              20_000_000,
              0.6
            ),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
              100_000,
              50_000_000
            ),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
        });

        ids.push(entityId);
      }

      entityIdsRef.current = ids;
    })();

    return () => {
      cancelled = true;
      if (viewer && !viewer.isDestroyed()) {
        for (const id of entityIdsRef.current) {
          const entity = viewer.entities.getById(id);
          if (entity) viewer.entities.remove(entity);
        }
      }
      entityIdsRef.current = [];
    };
  }, [viewerRef, enabled]);

  return null;
}
