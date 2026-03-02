"use client";

import {
  createContext,
  useContext,
  useRef,
  MutableRefObject,
} from "react";
import type { Viewer } from "cesium";

// Context to share the Cesium Viewer instance across components
export const CesiumViewerContext = createContext<
  MutableRefObject<Viewer | null>
>({ current: null } as MutableRefObject<Viewer | null>);

export function useCesiumViewer() {
  return useContext(CesiumViewerContext);
}

export function useCesiumViewerRef() {
  return useRef<Viewer | null>(null);
}
