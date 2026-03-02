"use client";

import useSWR from "swr";
import type { CameraData } from "@/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useCameraData() {
  const { data, error, isLoading } = useSWR<CameraData[]>(
    "/api/cameras",
    fetcher,
    {
      refreshInterval: 3600_000, // 1 hour — camera list is static
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
    }
  );

  return {
    cameras: data ?? [],
    error,
    isLoading,
  };
}
