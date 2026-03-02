"use client";

import { useEffect, useRef, MutableRefObject } from "react";
import type { Viewer } from "cesium";

interface TrafficLayerProps {
  viewerRef: MutableRefObject<Viewer | null>;
  enabled: boolean;
}

interface Vehicle {
  lon: number;
  lat: number;
  heading: number; // radians
  speed: number; // degrees per second (converted from km/h)
}

const MAX_VEHICLES = 500;
const ALTITUDE_THRESHOLD = 5000; // meters — only show when camera is below this

/** Convert km/h to approximate degrees/second at a given latitude */
function kmhToDegPerSec(kmh: number, lat: number): number {
  const mPerDeg = 111_320 * Math.cos((lat * Math.PI) / 180);
  return kmh / 3.6 / mPerDeg;
}

/** Generate vehicles scattered around a center point */
function generateVehicles(
  centerLon: number,
  centerLat: number,
  count: number
): Vehicle[] {
  const vehicles: Vehicle[] = [];
  const radiusDeg = 0.02; // ~2km
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * radiusDeg;
    const speed = 30 + Math.random() * 30; // 30-60 km/h
    // Snap headings to cardinal/ordinal for road-like movement
    const headingOptions = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    const heading =
      headingOptions[Math.floor(Math.random() * headingOptions.length)] +
      (Math.random() - 0.5) * 0.15; // slight jitter

    vehicles.push({
      lon: centerLon + Math.cos(angle) * dist,
      lat: centerLat + Math.sin(angle) * dist,
      heading,
      speed: kmhToDegPerSec(speed, centerLat),
    });
  }
  return vehicles;
}

export default function TrafficLayer({ viewerRef, enabled }: TrafficLayerProps) {
  const vehiclesRef = useRef<Vehicle[]>([]);
  const collectionRef = useRef<any>(null);
  const lastCenterRef = useRef<{ lon: number; lat: number } | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

    let Cesium: any;
    let CesiumMath: any;
    let collection: any;

    (async () => {
      Cesium = await import("cesium");
      CesiumMath = Cesium.Math;

      collection = new Cesium.PointPrimitiveCollection();
      viewer.scene.primitives.add(collection);
      collectionRef.current = collection;

      if (!enabled) {
        collection.show = false;
        return;
      }

      collection.show = true;

      const lastTime = { value: Date.now() };

      const tick = () => {
        if (!viewer || viewer.isDestroyed()) return;

        const cam = viewer.camera;
        const carto = cam.positionCartographic;
        if (!carto) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        const altMeters = carto.height;
        const camLon = CesiumMath.toDegrees(carto.longitude);
        const camLat = CesiumMath.toDegrees(carto.latitude);

        // Hide when camera is too high
        if (altMeters > ALTITUDE_THRESHOLD) {
          collection.show = false;
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
        collection.show = true;

        // Regenerate vehicles if camera moved significantly or first time
        const last = lastCenterRef.current;
        const needsRegen =
          !last ||
          Math.abs(last.lon - camLon) > 0.01 ||
          Math.abs(last.lat - camLat) > 0.01;

        if (needsRegen) {
          vehiclesRef.current = generateVehicles(camLon, camLat, MAX_VEHICLES);
          lastCenterRef.current = { lon: camLon, lat: camLat };

          // Rebuild point primitives
          collection.removeAll();
          for (let i = 0; i < vehiclesRef.current.length; i++) {
            const v = vehiclesRef.current[i];
            collection.add({
              position: Cesium.Cartesian3.fromDegrees(v.lon, v.lat, 1),
              pixelSize: 4,
              color: Cesium.Color.fromCssColorString("#FFD700").withAlpha(0.85),
            });
          }
        }

        // Animate positions
        const now = Date.now();
        const dt = (now - lastTime.value) / 1000;
        lastTime.value = now;

        const vehicles = vehiclesRef.current;
        const radiusDeg = 0.025;
        for (let i = 0; i < vehicles.length; i++) {
          const v = vehicles[i];
          v.lon += Math.cos(v.heading) * v.speed * dt;
          v.lat += Math.sin(v.heading) * v.speed * dt;

          // Wrap around if vehicle goes too far from camera center
          const dx = v.lon - camLon;
          const dy = v.lat - camLat;
          if (Math.abs(dx) > radiusDeg || Math.abs(dy) > radiusDeg) {
            // Re-enter from opposite side
            v.lon = camLon - dx * 0.5 + (Math.random() - 0.5) * 0.005;
            v.lat = camLat - dy * 0.5 + (Math.random() - 0.5) * 0.005;
          }

          const pt = collection.get(i);
          if (pt) {
            pt.position = Cesium.Cartesian3.fromDegrees(v.lon, v.lat, 1);
          }
        }

        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    })();

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (
        collectionRef.current &&
        viewer &&
        !viewer.isDestroyed()
      ) {
        viewer.scene.primitives.remove(collectionRef.current);
        collectionRef.current = null;
      }
      vehiclesRef.current = [];
      lastCenterRef.current = null;
    };
  }, [viewerRef, enabled]);

  return null;
}
