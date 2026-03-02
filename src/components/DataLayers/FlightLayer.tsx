"use client";

import { useEffect, useRef, useMemo, MutableRefObject } from "react";
import type { Viewer } from "cesium";
import { useFlightData } from "@/hooks/useFlightData";
import type { FlightData } from "@/types";

interface FlightLayerProps {
  viewerRef: MutableRefObject<Viewer | null>;
  enabled: boolean;
  showMilitary: boolean;
  onSelect?: (flight: FlightData | null) => void;
}

export default function FlightLayer({
  viewerRef,
  enabled,
  showMilitary,
  onSelect,
}: FlightLayerProps) {
  const { flights } = useFlightData(enabled || showMilitary);
  const collectionRef = useRef<any>(null);
  const handlerRef = useRef<any>(null);
  const flightMapRef = useRef<Map<number, FlightData>>(new Map());

  const activeFlights = useMemo(() => {
    if (enabled) {
      return showMilitary ? flights : flights.filter((f) => !f.isMilitary);
    }
    return showMilitary ? flights.filter((f) => f.isMilitary) : [];
  }, [flights, enabled, showMilitary]);

  // Update billboards when data changes
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

    let cancelled = false;

    (async () => {
      const Cesium = await import("cesium");
      const CesiumMath = Cesium.Math;
      if (cancelled || viewer.isDestroyed()) return;

      // Remove old collection
      if (collectionRef.current) {
        viewer.scene.primitives.remove(collectionRef.current);
        collectionRef.current = null;
      }

      if (activeFlights.length === 0) return;

      const collection = new Cesium.BillboardCollection({ scene: viewer.scene });
      const flightMap = new Map<number, FlightData>();

      for (let i = 0; i < activeFlights.length; i++) {
        const f = activeFlights[i];
        collection.add({
          position: Cesium.Cartesian3.fromDegrees(f.longitude, f.latitude, f.altitude),
          image: f.isMilitary ? "/icons/aircraft-military.svg" : "/icons/aircraft.svg",
          width: f.isMilitary ? 20 : 16,
          height: f.isMilitary ? 20 : 16,
          rotation: -CesiumMath.toRadians(f.heading),
          alignedAxis: Cesium.Cartesian3.UNIT_Z,
          color: f.isMilitary ? Cesium.Color.RED : Cesium.Color.fromCssColorString("#00ff88"),
          heightReference: f.onGround ? Cesium.HeightReference.CLAMP_TO_GROUND : Cesium.HeightReference.NONE,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          id: i,
        });
        flightMap.set(i, f);
      }

      viewer.scene.primitives.add(collection);
      collectionRef.current = collection;
      flightMapRef.current = flightMap;
    })();

    return () => {
      cancelled = true;
      if (viewer && !viewer.isDestroyed() && collectionRef.current) {
        viewer.scene.primitives.remove(collectionRef.current);
        collectionRef.current = null;
      }
    };
  }, [activeFlights, viewerRef]);

  // Click handler
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed() || !onSelect) return;

    let handler: any;

    import("cesium").then((Cesium) => {
      if (viewer.isDestroyed()) return;

      handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction((click: any) => {
        const picked = viewer.scene.pick(click.position);
        if (
          Cesium.defined(picked) &&
          picked.primitive === collectionRef.current &&
          typeof picked.id === "number"
        ) {
          onSelect(flightMapRef.current.get(picked.id) ?? null);
        } else {
          onSelect(null);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      handlerRef.current = handler;
    });

    return () => {
      if (handlerRef.current && !handlerRef.current.isDestroyed()) {
        handlerRef.current.destroy();
        handlerRef.current = null;
      }
    };
  }, [viewerRef, onSelect]);

  return null;
}
