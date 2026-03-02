import {
  twoline2satrec,
  propagate,
  gstime,
  eciToGeodetic,
  degreesLong,
  degreesLat,
} from "satellite.js";
import type { SatelliteData, SatellitePosition } from "@/types";

/**
 * Propagate all satellites to their current positions using SGP4.
 */
export function propagateAll(satellites: SatelliteData[]): SatellitePosition[] {
  const now = new Date();
  const gmst = gstime(now);
  const positions: SatellitePosition[] = [];

  for (const sat of satellites) {
    try {
      const satrec = twoline2satrec(sat.tle1, sat.tle2);
      const result = propagate(satrec, now);

      if (!result || typeof result.position === "boolean" || !result.position) {
        continue;
      }

      const positionEci = result.position as { x: number; y: number; z: number };
      const geodetic = eciToGeodetic(positionEci, gmst);

      const longitude = degreesLong(geodetic.longitude);
      const latitude = degreesLat(geodetic.latitude);
      const altitude = geodetic.height; // km

      // Skip invalid propagations
      if (
        isNaN(longitude) ||
        isNaN(latitude) ||
        isNaN(altitude) ||
        altitude < 0
      ) {
        continue;
      }

      positions.push({
        noradId: sat.noradId,
        name: sat.name,
        latitude,
        longitude,
        altitude,
        group: sat.group,
      });
    } catch {
      // Skip satellites with bad TLE data
      continue;
    }
  }

  return positions;
}
