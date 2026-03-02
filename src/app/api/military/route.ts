import { NextResponse } from "next/server";
import type { FlightData } from "@/types";

const OPENSKY_URL = "https://opensky-network.org/api/states/all";
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

const MILITARY_PREFIXES = [
  "RCH", "EVAC", "REACH", "JAKE", "DUKE", "TOPCAT", "NCHO", "GORDO",
  "SPAR", "SAM", "EXEC", "VENUS", "MARKY", "DEATH", "ORDER", "CHAOS",
  "HAVOC", "SHADY", "BISON", "IRON",
];

function isMilitarySquawk(squawk: string | null): boolean {
  if (!squawk) return false;
  const code = parseInt(squawk, 10);
  return (code >= 100 && code <= 400) || code === 7777;
}

function isMilitaryCallsign(callsign: string): boolean {
  const trimmed = callsign.trim().toUpperCase();
  return MILITARY_PREFIXES.some((prefix) => trimmed.startsWith(prefix));
}

let cache: { data: FlightData[]; timestamp: number } | null = null;

function transformAndFilter(states: unknown[][]): FlightData[] {
  const flights: FlightData[] = [];
  for (const s of states) {
    const lon = s[5] as number | null;
    const lat = s[6] as number | null;
    if (lon == null || lat == null) continue;

    const callsign = ((s[1] as string) ?? "").trim();
    const squawk = (s[14] as string) ?? null;
    const isMil = isMilitaryCallsign(callsign) || isMilitarySquawk(squawk);
    if (!isMil) continue;

    flights.push({
      icao24: s[0] as string,
      callsign,
      originCountry: s[2] as string,
      longitude: lon,
      latitude: lat,
      altitude: (s[7] as number) ?? 0,
      velocity: (s[9] as number) ?? 0,
      heading: (s[10] as number) ?? 0,
      verticalRate: (s[11] as number) ?? 0,
      onGround: (s[8] as boolean) ?? false,
      squawk,
      isMilitary: true,
    });
  }
  return flights;
}

async function fetchMilitary(): Promise<FlightData[]> {
  const now = Date.now();
  if (cache && now - cache.timestamp < CACHE_TTL_MS) {
    return cache.data;
  }

  const res = await fetch(OPENSKY_URL, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) {
    if (cache) return cache.data;
    throw new Error(`OpenSky responded with ${res.status}`);
  }

  const json = await res.json();
  const states: unknown[][] = json.states ?? [];
  const flights = transformAndFilter(states);

  cache = { data: flights, timestamp: now };
  return flights;
}

export async function GET() {
  try {
    const flights = await fetchMilitary();
    return NextResponse.json(flights, {
      headers: {
        "Cache-Control": "s-maxage=120, stale-while-revalidate=60",
      },
    });
  } catch (err) {
    console.error("Military API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch military flight data" },
      { status: 502 }
    );
  }
}
