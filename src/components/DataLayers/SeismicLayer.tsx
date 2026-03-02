"use client";

import { useEffect, useRef, MutableRefObject } from "react";
import type { Viewer } from "cesium";
import { useSeismicData } from "@/hooks/useSeismicData";

interface SeismicLayerProps {
  viewerRef: MutableRefObject<Viewer | null>;
  enabled: boolean;
}

function getMagnitudeColor(mag: number): { red: number; green: number; blue: number } {
  if (mag >= 5) return { red: 1.0, green: 0.15, blue: 0.15 }; // Red
  if (mag >= 4) return { red: 1.0, green: 0.55, blue: 0.0 };  // Orange
  return { red: 1.0, green: 0.9, blue: 0.2 };                  // Yellow
}

function getMagnitudeRadius(mag: number): number {
  // Scale radius by magnitude: M2.5 = 15km, M5 = 80km, M7+ = 200km
  return Math.pow(2, mag - 1) * 5000;
}

export default function SeismicLayer({
  viewerRef,
  enabled,
}: SeismicLayerProps) {
  const events = useSeismicData();
  const entityIdsRef = useRef<string[]>([]);
  const animationRef = useRef<number | null>(null);

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

    if (!enabled || events.length === 0) return;

    let cancelled = false;

    (async () => {
      const Cesium = await import("cesium");
      if (viewer.isDestroyed() || cancelled) return;

      const ids: string[] = [];
      const pulsingEntities: Array<{
        entity: any;
        baseRadius: number;
        color: { red: number; green: number; blue: number };
      }> = [];

      for (const quake of events) {
        const entityId = `seismic-${quake.id}`;
        const color = getMagnitudeColor(quake.magnitude);
        const baseRadius = getMagnitudeRadius(quake.magnitude);

        const entity = viewer.entities.add({
          id: entityId,
          position: Cesium.Cartesian3.fromDegrees(
            quake.longitude,
            quake.latitude
          ),
          ellipse: {
            semiMajorAxis: baseRadius,
            semiMinorAxis: baseRadius,
            material: new Cesium.ColorMaterialProperty(
              new Cesium.Color(color.red, color.green, color.blue, 0.4)
            ),
            outline: true,
            outlineColor: new Cesium.Color(color.red, color.green, color.blue, 0.8),
            outlineWidth: 1.5,
            height: 0,
            classificationType: Cesium.ClassificationType.BOTH,
          },
          description: `M${quake.magnitude.toFixed(1)} - ${quake.place}<br/>Depth: ${quake.depth.toFixed(1)} km`,
        });

        ids.push(entityId);
        pulsingEntities.push({ entity, baseRadius, color });
      }

      entityIdsRef.current = ids;

      // Pulse animation
      const startTime = Date.now();
      function animate() {
        if (cancelled || !viewer || viewer.isDestroyed()) return;

        const elapsed = (Date.now() - startTime) / 1000;
        const pulse = 0.8 + 0.4 * Math.sin(elapsed * 2.5); // oscillate 0.8-1.2
        const alphaPulse = 0.25 + 0.2 * Math.sin(elapsed * 2.5);

        for (const { entity, baseRadius, color } of pulsingEntities) {
          if (entity.ellipse) {
            entity.ellipse.semiMajorAxis = new Cesium.ConstantProperty(
              baseRadius * pulse
            );
            entity.ellipse.semiMinorAxis = new Cesium.ConstantProperty(
              baseRadius * pulse
            );
            entity.ellipse.material = new Cesium.ColorMaterialProperty(
              new Cesium.Color(color.red, color.green, color.blue, alphaPulse)
            );
          }
        }

        animationRef.current = requestAnimationFrame(animate);
      }

      animationRef.current = requestAnimationFrame(animate);
    })();

    return () => {
      cancelled = true;
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (viewer && !viewer.isDestroyed()) {
        for (const id of entityIdsRef.current) {
          const entity = viewer.entities.getById(id);
          if (entity) viewer.entities.remove(entity);
        }
      }
      entityIdsRef.current = [];
    };
  }, [viewerRef, enabled, events]);

  return null;
}
