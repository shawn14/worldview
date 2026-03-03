"use client";

import { useEffect, useRef, MutableRefObject } from "react";
import type { Viewer } from "cesium";
import type { AlertZone } from "@/types";
import { ALERT_ZONES } from "@/lib/alert-zones";

interface AlertZoneLayerProps {
  viewerRef: MutableRefObject<Viewer | null>;
  enabled: boolean;
  onSelect: (zone: AlertZone) => void;
}

function getSeverityColor(severity: "red" | "amber") {
  return severity === "red"
    ? { red: 1.0, green: 0.15, blue: 0.1 }
    : { red: 1.0, green: 0.7, blue: 0.0 };
}

export default function AlertZoneLayer({
  viewerRef,
  enabled,
  onSelect,
}: AlertZoneLayerProps) {
  const entityIdsRef = useRef<string[]>([]);
  const animationRef = useRef<number | null>(null);
  const handlerRef = useRef<any>(null);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

    // Clean up previous entities
    for (const id of entityIdsRef.current) {
      const entity = viewer.entities.getById(id);
      if (entity) viewer.entities.remove(entity);
    }
    entityIdsRef.current = [];

    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (handlerRef.current) {
      handlerRef.current.destroy();
      handlerRef.current = null;
    }

    if (!enabled) return;

    let cancelled = false;

    (async () => {
      const Cesium = await import("cesium");
      if (viewer.isDestroyed() || cancelled) return;

      const ids: string[] = [];
      const pulsingEntities: Array<{
        entity: any;
        outlineEntity: any;
        color: { red: number; green: number; blue: number };
      }> = [];

      for (const zone of ALERT_ZONES) {
        const entityId = `alert-${zone.id}`;
        const outlineId = `alert-outline-${zone.id}`;
        const color = getSeverityColor(zone.severity);

        // Flatten polygon: [lat, lon][] → [lon, lat, lon, lat, ...]
        const positions = Cesium.Cartesian3.fromDegreesArray(
          zone.polygon.flatMap(([lat, lon]) => [lon, lat])
        );

        // Fill polygon
        const entity = viewer.entities.add({
          id: entityId,
          polygon: {
            hierarchy: new Cesium.PolygonHierarchy(positions),
            material: new Cesium.ColorMaterialProperty(
              new Cesium.Color(color.red, color.green, color.blue, 0.15)
            ),
            height: 0,
            classificationType: Cesium.ClassificationType.BOTH,
          },
          properties: {
            alertZone: zone,
          },
        });

        // Outline polyline (closed loop)
        const outlinePositions = [...positions, positions[0]];
        const outlineEntity = viewer.entities.add({
          id: outlineId,
          polyline: {
            positions: outlinePositions,
            material: new Cesium.ColorMaterialProperty(
              new Cesium.Color(color.red, color.green, color.blue, 0.7)
            ),
            width: 2,
            clampToGround: true,
          },
        });

        // Label at centroid
        const centroidLat =
          zone.polygon.reduce((s, p) => s + p[0], 0) / zone.polygon.length;
        const centroidLon =
          zone.polygon.reduce((s, p) => s + p[1], 0) / zone.polygon.length;

        const labelId = `alert-label-${zone.id}`;
        viewer.entities.add({
          id: labelId,
          position: Cesium.Cartesian3.fromDegrees(centroidLon, centroidLat),
          label: {
            text: zone.name.toUpperCase(),
            font: "bold 10px monospace",
            fillColor: new Cesium.Color(color.red, color.green, color.blue, 0.9),
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 3,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
              500_000,
              20_000_000
            ),
            scaleByDistance: new Cesium.NearFarScalar(
              1_000_000,
              1.0,
              15_000_000,
              0.4
            ),
          },
        });

        ids.push(entityId, outlineId, labelId);
        pulsingEntities.push({ entity, outlineEntity, color });
      }

      entityIdsRef.current = ids;

      // Pulse animation
      const startTime = Date.now();
      function animate() {
        if (cancelled || !viewer || viewer.isDestroyed()) return;

        const elapsed = (Date.now() - startTime) / 1000;
        const alphaPulse = 0.1 + 0.1 * Math.sin(elapsed * 2.0);
        const outlinePulse = 0.5 + 0.3 * Math.sin(elapsed * 2.0);

        for (const { entity, outlineEntity, color } of pulsingEntities) {
          if (entity.polygon) {
            entity.polygon.material = new Cesium.ColorMaterialProperty(
              new Cesium.Color(color.red, color.green, color.blue, alphaPulse)
            );
          }
          if (outlineEntity.polyline) {
            outlineEntity.polyline.material = new Cesium.ColorMaterialProperty(
              new Cesium.Color(
                color.red,
                color.green,
                color.blue,
                outlinePulse
              )
            );
          }
        }

        animationRef.current = requestAnimationFrame(animate);
      }

      animationRef.current = requestAnimationFrame(animate);

      // Click handler
      const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction(
        (click: { position: InstanceType<typeof Cesium.Cartesian2> }) => {
          const picked = viewer.scene.pick(click.position);
          if (
            Cesium.defined(picked) &&
            picked.id &&
            picked.id.id &&
            (picked.id.id as string).startsWith("alert-") &&
            !(picked.id.id as string).startsWith("alert-outline-") &&
            !(picked.id.id as string).startsWith("alert-label-")
          ) {
            const zoneData = picked.id.properties?.alertZone?.getValue(
              Cesium.JulianDate.now()
            );
            if (zoneData) {
              onSelect(zoneData);
            }
          }
        },
        Cesium.ScreenSpaceEventType.LEFT_CLICK
      );
      handlerRef.current = handler;
    })();

    return () => {
      cancelled = true;
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (handlerRef.current) {
        handlerRef.current.destroy();
        handlerRef.current = null;
      }
      if (viewer && !viewer.isDestroyed()) {
        for (const id of entityIdsRef.current) {
          const entity = viewer.entities.getById(id);
          if (entity) viewer.entities.remove(entity);
        }
      }
      entityIdsRef.current = [];
    };
  }, [viewerRef, enabled, onSelect]);

  return null;
}
