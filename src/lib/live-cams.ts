import type { LiveCam } from "@/types";

export const ISS_CAM: LiveCam = {
  id: "iss-hdev",
  name: "ISS HD Earth Viewing",
  city: "Low Earth Orbit",
  latitude: 0,
  longitude: 0,
  youtubeId: "86YLFOog4GM",
};

export const LIVE_CAMS: LiveCam[] = [
  {
    id: "nyc-timessquare",
    name: "Times Square",
    city: "New York",
    latitude: 40.758,
    longitude: -73.9855,
    youtubeId: "rnXIjl_Rzy4",
  },
  {
    id: "tokyo-shibuya",
    name: "Shibuya Crossing",
    city: "Tokyo",
    latitude: 35.6595,
    longitude: 139.7004,
    youtubeId: "dfVK7ld38Ys",
  },
  {
    id: "london-abbeyroad",
    name: "Abbey Road",
    city: "London",
    latitude: 51.5320,
    longitude: -0.1778,
    youtubeId: "M3EYAY2MftI",
  },
  {
    id: "paris-eiffel",
    name: "Eiffel Tower",
    city: "Paris",
    latitude: 48.8584,
    longitude: 2.2945,
    youtubeId: "OzYp4NRZlwQ",
  },
  {
    id: "dubai-marina",
    name: "Marina Walk",
    city: "Dubai",
    latitude: 25.0803,
    longitude: 55.1403,
    youtubeId: "Lu9CvrAEG_U",
  },
  {
    id: "miami-beach",
    name: "Beach / Collins Ave",
    city: "Miami",
    latitude: 25.7907,
    longitude: -80.1300,
    youtubeId: "P_AgMoBZFzQ",
  },
  {
    id: "lasvegas-strip",
    name: "Strip",
    city: "Las Vegas",
    latitude: 36.1147,
    longitude: -115.1728,
    youtubeId: "sLvdnemX2Ag",
  },
  {
    id: "rome-capitoline",
    name: "Capitoline Hill",
    city: "Rome",
    latitude: 41.8932,
    longitude: 12.4828,
    youtubeId: "RDqrx6S2z20",
  },
  {
    id: "hongkong-skyline",
    name: "Skyline",
    city: "Hong Kong",
    latitude: 22.2855,
    longitude: 114.1577,
    youtubeId: "jttO_OKVWsU",
  },
  {
    id: "sydney-harbour",
    name: "Harbour",
    city: "Sydney",
    latitude: -33.8568,
    longitude: 151.2153,
    youtubeId: "5uZa3-RMFos",
  },
];

/** Haversine distance in km between two lat/lon points */
function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Find the closest live cam within radiusKm, or null */
export function findNearbyCam(
  lat: number,
  lon: number,
  radiusKm = 50
): LiveCam | null {
  let closest: LiveCam | null = null;
  let minDist = Infinity;

  for (const cam of LIVE_CAMS) {
    const dist = haversineKm(lat, lon, cam.latitude, cam.longitude);
    if (dist < radiusKm && dist < minDist) {
      minDist = dist;
      closest = cam;
    }
  }

  return closest;
}
