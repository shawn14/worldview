"use client";

import { useEffect, useRef, MutableRefObject } from "react";
import type { Viewer } from "cesium";
import type { CameraData } from "@/types";
import { useCameraData } from "@/hooks/useCameraData";

interface CCTVLayerProps {
  viewerRef: MutableRefObject<Viewer | null>;
  enabled: boolean;
  onSelect: (camera: CameraData) => void;
}

export default function CCTVLayer({
  viewerRef,
  enabled,
  onSelect,
}: CCTVLayerProps) {
  const { cameras } = useCameraData();
  const dataSourceRef = useRef<any>(null);
  const handlerRef = useRef<any>(null);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

    let Cesium: typeof import("cesium");
    let dataSource: any;
    let handler: any;

    (async () => {
      Cesium = await import("cesium");

      dataSource = new Cesium.CustomDataSource("cctv-cameras");
      viewer.dataSources.add(dataSource);
      dataSourceRef.current = dataSource;

      if (!enabled || cameras.length === 0) {
        dataSource.show = false;
        return;
      }

      dataSource.show = true;
      dataSource.entities.removeAll();

      for (const cam of cameras) {
        dataSource.entities.add({
          id: `cctv-${cam.id}`,
          position: Cesium.Cartesian3.fromDegrees(
            cam.longitude,
            cam.latitude,
            30
          ),
          billboard: {
            image: "/icons/camera.svg",
            width: 28,
            height: 28,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            scaleByDistance: new Cesium.NearFarScalar(500, 1.2, 50_000, 0.4),
          },
          label: {
            text: cam.name,
            font: "10px monospace",
            fillColor: Cesium.Color.fromCssColorString("#00FF88"),
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.TOP,
            pixelOffset: new Cesium.Cartesian2(0, 8),
            scaleByDistance: new Cesium.NearFarScalar(500, 1.0, 30_000, 0.0),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          properties: {
            cameraData: cam,
          },
        });
      }

      // Click handler
      handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction(
        (click: { position: InstanceType<typeof Cesium.Cartesian2> }) => {
          const picked = viewer.scene.pick(click.position);
          if (
            Cesium.defined(picked) &&
            picked.id &&
            picked.id.id &&
            (picked.id.id as string).startsWith("cctv-")
          ) {
            const camData = picked.id.properties?.cameraData?.getValue(
              Cesium.JulianDate.now()
            );
            if (camData) {
              onSelect(camData);
            }
          }
        },
        Cesium.ScreenSpaceEventType.LEFT_CLICK
      );
      handlerRef.current = handler;
    })();

    return () => {
      if (handlerRef.current) {
        handlerRef.current.destroy();
        handlerRef.current = null;
      }
      if (
        dataSourceRef.current &&
        viewer &&
        !viewer.isDestroyed()
      ) {
        viewer.dataSources.remove(dataSourceRef.current, true);
        dataSourceRef.current = null;
      }
    };
  }, [viewerRef, enabled, cameras, onSelect]);

  return null;
}
