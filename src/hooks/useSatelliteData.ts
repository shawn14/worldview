"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import type { SatelliteData, SatellitePosition } from "@/types";
import { propagateAll } from "@/lib/satellite-propagator";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useSatelliteData() {
  const { data: tles } = useSWR<SatelliteData[]>("/api/satellites", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 0, // TLEs don't change frequently; fetch once
  });

  const [positions, setPositions] = useState<SatellitePosition[]>([]);
  const tlesRef = useRef(tles);
  tlesRef.current = tles;

  useEffect(() => {
    if (!tles || tles.length === 0) return;

    // Propagate immediately
    setPositions(propagateAll(tles));

    // Re-propagate every 2 seconds
    const interval = setInterval(() => {
      if (tlesRef.current) {
        setPositions(propagateAll(tlesRef.current));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [tles]);

  return positions;
}
