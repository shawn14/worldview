"use client";

import useSWR from "swr";
import type { SeismicEvent } from "@/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useSeismicData() {
  const { data } = useSWR<SeismicEvent[]>("/api/seismic", fetcher, {
    refreshInterval: 5 * 60 * 1000, // 5 minutes — matches API cache TTL
    revalidateOnFocus: false,
  });

  return data ?? [];
}
