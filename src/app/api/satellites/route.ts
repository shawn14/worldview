import { NextResponse } from "next/server";
import type { SatelliteData } from "@/types";

const GROUPS = ["stations", "active", "visual", "weather"] as const;
const CACHE_TTL = 2 * 60 * 60 * 1000; // 2 hours

let cache: { data: SatelliteData[]; timestamp: number } | null = null;

function parseTLE(raw: string, group: string): SatelliteData[] {
  const lines = raw.trim().split("\n").map((l) => l.trim()).filter(Boolean);
  const results: SatelliteData[] = [];

  for (let i = 0; i < lines.length - 2; i += 3) {
    const name = lines[i];
    const tle1 = lines[i + 1];
    const tle2 = lines[i + 2];

    // Validate TLE format
    if (!tle1.startsWith("1 ") || !tle2.startsWith("2 ")) continue;

    const noradId = parseInt(tle1.substring(2, 7).trim(), 10);
    if (isNaN(noradId)) continue;

    results.push({ name, noradId, tle1, tle2, group });
  }

  return results;
}

async function fetchAllGroups(): Promise<SatelliteData[]> {
  const allSatellites: SatelliteData[] = [];
  const seen = new Set<number>();

  const results = await Promise.allSettled(
    GROUPS.map(async (group) => {
      const res = await fetch(
        `https://celestrak.org/NORAD/elements/gp.php?GROUP=${group}&FORMAT=tle`,
        { signal: AbortSignal.timeout(15000) }
      );
      if (!res.ok) throw new Error(`CelesTrak ${group}: ${res.status}`);
      const text = await res.text();
      return parseTLE(text, group);
    })
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      for (const sat of result.value) {
        if (!seen.has(sat.noradId)) {
          seen.add(sat.noradId);
          allSatellites.push(sat);
        }
      }
    } else {
      console.error("Failed to fetch satellite group:", result.reason);
    }
  }

  return allSatellites;
}

export async function GET() {
  try {
    const now = Date.now();

    if (cache && now - cache.timestamp < CACHE_TTL) {
      return NextResponse.json(cache.data, {
        headers: {
          "Cache-Control": "public, s-maxage=7200, stale-while-revalidate=3600",
          "X-Cache": "HIT",
        },
      });
    }

    const data = await fetchAllGroups();
    cache = { data, timestamp: now };

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=7200, stale-while-revalidate=3600",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("Satellite API error:", error);

    // Return stale cache if available
    if (cache) {
      return NextResponse.json(cache.data, {
        headers: {
          "Cache-Control": "public, s-maxage=60",
          "X-Cache": "STALE",
        },
      });
    }

    return NextResponse.json(
      { error: "Failed to fetch satellite data" },
      { status: 502 }
    );
  }
}
