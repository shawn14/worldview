import { NextResponse } from "next/server";
import type { SeismicEvent } from "@/types";

const USGS_FEED =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

let cache: { data: SeismicEvent[]; timestamp: number } | null = null;

function parseGeoJSON(geojson: any): SeismicEvent[] {
  if (!geojson?.features) return [];

  return geojson.features.map((f: any) => ({
    id: f.id,
    magnitude: f.properties.mag,
    place: f.properties.place,
    time: f.properties.time,
    longitude: f.geometry.coordinates[0],
    latitude: f.geometry.coordinates[1],
    depth: f.geometry.coordinates[2],
    url: f.properties.url,
  }));
}

export async function GET() {
  try {
    const now = Date.now();

    if (cache && now - cache.timestamp < CACHE_TTL) {
      return NextResponse.json(cache.data, {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=120",
          "X-Cache": "HIT",
        },
      });
    }

    const res = await fetch(USGS_FEED, {
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      throw new Error(`USGS feed returned ${res.status}`);
    }

    const geojson = await res.json();
    const data = parseGeoJSON(geojson);
    cache = { data, timestamp: now };

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=120",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("Seismic API error:", error);

    if (cache) {
      return NextResponse.json(cache.data, {
        headers: {
          "Cache-Control": "public, s-maxage=60",
          "X-Cache": "STALE",
        },
      });
    }

    return NextResponse.json(
      { error: "Failed to fetch seismic data" },
      { status: 502 }
    );
  }
}
