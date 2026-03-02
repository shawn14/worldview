"use client";

import useSWR from "swr";
import type { FlightData } from "@/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const REFRESH_INTERVAL = 2 * 60 * 1000; // 2 minutes

export function useFlightData(enabled: boolean) {
  const { data, error, isLoading } = useSWR<FlightData[]>(
    enabled ? "/api/flights" : null,
    fetcher,
    {
      refreshInterval: REFRESH_INTERVAL,
      revalidateOnFocus: false,
      dedupingInterval: REFRESH_INTERVAL,
    }
  );

  return {
    flights: data ?? [],
    error,
    isLoading,
  };
}
