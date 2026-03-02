import { NextResponse } from "next/server";
import type { CameraData } from "@/types";

const CAMERAS: CameraData[] = [
  // NYC DOT Traffic Cameras (Manhattan)
  {
    id: "nyc-835",
    name: "NYC - 42nd St & 5th Ave",
    latitude: 40.7536,
    longitude: -73.9819,
    streamUrl: "https://webcams.nyctmc.org/api/cameras/835/image",
    source: "NYC DOT",
  },
  {
    id: "nyc-836",
    name: "NYC - 34th St & 7th Ave",
    latitude: 40.7505,
    longitude: -73.9908,
    streamUrl: "https://webcams.nyctmc.org/api/cameras/836/image",
    source: "NYC DOT",
  },
  {
    id: "nyc-839",
    name: "NYC - 57th St & Broadway",
    latitude: 40.7648,
    longitude: -73.9817,
    streamUrl: "https://webcams.nyctmc.org/api/cameras/839/image",
    source: "NYC DOT",
  },
  {
    id: "nyc-840",
    name: "NYC - 23rd St & Madison Ave",
    latitude: 40.7413,
    longitude: -73.9871,
    streamUrl: "https://webcams.nyctmc.org/api/cameras/840/image",
    source: "NYC DOT",
  },
  {
    id: "nyc-141",
    name: "NYC - FDR Dr & E 42nd St",
    latitude: 40.7488,
    longitude: -73.9694,
    streamUrl: "https://webcams.nyctmc.org/api/cameras/141/image",
    source: "NYC DOT",
  },
  {
    id: "nyc-684",
    name: "NYC - Times Square",
    latitude: 40.7580,
    longitude: -73.9855,
    streamUrl: "https://webcams.nyctmc.org/api/cameras/684/image",
    source: "NYC DOT",
  },
  // London TfL JamCams
  {
    id: "tfl-00001.01587",
    name: "London - A1 Holloway Rd",
    latitude: 51.5540,
    longitude: -0.1135,
    streamUrl:
      "https://s3-eu-west-1.amazonaws.com/jamcams.tfl.gov.uk/00001.01587.jpg",
    source: "TfL JamCam",
  },
  {
    id: "tfl-00001.01590",
    name: "London - A40 Western Ave",
    latitude: 51.5290,
    longitude: -0.3143,
    streamUrl:
      "https://s3-eu-west-1.amazonaws.com/jamcams.tfl.gov.uk/00001.01590.jpg",
    source: "TfL JamCam",
  },
  {
    id: "tfl-00001.01597",
    name: "London - Tower Bridge",
    latitude: 51.5055,
    longitude: -0.0754,
    streamUrl:
      "https://s3-eu-west-1.amazonaws.com/jamcams.tfl.gov.uk/00001.01597.jpg",
    source: "TfL JamCam",
  },
  {
    id: "tfl-00001.01632",
    name: "London - Trafalgar Square",
    latitude: 51.5080,
    longitude: -0.1281,
    streamUrl:
      "https://s3-eu-west-1.amazonaws.com/jamcams.tfl.gov.uk/00001.01632.jpg",
    source: "TfL JamCam",
  },
  // Washington DC
  {
    id: "dc-001",
    name: "DC - 14th St & Constitution Ave NW",
    latitude: 38.8924,
    longitude: -77.0325,
    streamUrl:
      "https://webcams.nyctmc.org/api/cameras/835/image",
    source: "DC DOT",
  },
  {
    id: "dc-002",
    name: "DC - I-395 & Pentagon",
    latitude: 38.8700,
    longitude: -77.0558,
    streamUrl:
      "https://webcams.nyctmc.org/api/cameras/836/image",
    source: "DC DOT",
  },
];

export async function GET() {
  return NextResponse.json(CAMERAS, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800",
    },
  });
}
