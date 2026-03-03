"use client";

import { useEffect, useRef, MutableRefObject } from "react";
import type { Viewer } from "cesium";
import { useSatelliteData } from "@/hooks/useSatelliteData";

const ISS_NORAD_ID = 25544;

interface SatelliteLayerProps {
  viewerRef: MutableRefObject<Viewer | null>;
  enabled: boolean;
  onISSClick?: () => void;
}

export default function SatelliteLayer({
  viewerRef,
  enabled,
  onISSClick,
}: SatelliteLayerProps) {
  const positions = useSatelliteData();
  const collectionRef = useRef<any>(null);
  const issLabelRef = useRef<any>(null);
  const handlerRef = useRef<any>(null);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

    // Remove existing collection
    if (collectionRef.current) {
      viewer.scene.primitives.remove(collectionRef.current);
      collectionRef.current = null;
    }

    // Remove ISS label entity
    if (issLabelRef.current) {
      viewer.entities.remove(issLabelRef.current);
      issLabelRef.current = null;
    }

    // Remove click handler
    if (handlerRef.current) {
      handlerRef.current.destroy();
      handlerRef.current = null;
    }

    if (!enabled || positions.length === 0) return;

    let cancelled = false;

    (async () => {
      const Cesium = await import("cesium");
      if (cancelled || viewer.isDestroyed()) return;

      const collection = new Cesium.PointPrimitiveCollection();

      for (const sat of positions) {
        const isISS = sat.noradId === ISS_NORAD_ID;

        collection.add({
          position: Cesium.Cartesian3.fromDegrees(
            sat.longitude,
            sat.latitude,
            sat.altitude * 1000
          ),
          pixelSize: isISS ? 6 : 2.5,
          color: isISS
            ? Cesium.Color.WHITE
            : Cesium.Color.CYAN.withAlpha(0.85),
          outlineColor: isISS
            ? Cesium.Color.WHITE.withAlpha(0.5)
            : Cesium.Color.CYAN.withAlpha(0.3),
          outlineWidth: isISS ? 2 : 1,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          id: `sat-${sat.noradId}`,
        });

        // Add a label entity for ISS
        if (isISS) {
          const labelEntity = viewer.entities.add({
            id: "iss-label",
            position: Cesium.Cartesian3.fromDegrees(
              sat.longitude,
              sat.latitude,
              sat.altitude * 1000
            ),
            label: {
              text: "ISS",
              font: "bold 11px monospace",
              fillColor: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 3,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -10),
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
              scaleByDistance: new Cesium.NearFarScalar(
                1_000_000,
                1.0,
                50_000_000,
                0.4
              ),
            },
          });
          issLabelRef.current = labelEntity;
        }
      }

      viewer.scene.primitives.add(collection);
      collectionRef.current = collection;

      // Click handler for ISS
      if (onISSClick) {
        const handler = new Cesium.ScreenSpaceEventHandler(
          viewer.scene.canvas
        );
        handler.setInputAction(
          (click: { position: InstanceType<typeof Cesium.Cartesian2> }) => {
            const picked = viewer.scene.pick(click.position);
            if (!picked) return;

            // PointPrimitive picks return the primitive directly with an id property
            const pickedId =
              picked?.id?.id || picked?.primitive?.id || picked?.id;
            if (pickedId === `sat-${ISS_NORAD_ID}` || pickedId === "iss-label") {
              onISSClick();
            }
          },
          Cesium.ScreenSpaceEventType.LEFT_CLICK
        );
        handlerRef.current = handler;
      }
    })();

    return () => {
      cancelled = true;
      if (handlerRef.current) {
        handlerRef.current.destroy();
        handlerRef.current = null;
      }
      if (viewer && !viewer.isDestroyed()) {
        if (collectionRef.current) {
          viewer.scene.primitives.remove(collectionRef.current);
          collectionRef.current = null;
        }
        if (issLabelRef.current) {
          viewer.entities.remove(issLabelRef.current);
          issLabelRef.current = null;
        }
      }
    };
  }, [viewerRef, enabled, positions, onISSClick]);

  return null;
}
