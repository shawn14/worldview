// Flight data from OpenSky Network
export interface FlightData {
  icao24: string;
  callsign: string;
  originCountry: string;
  longitude: number;
  latitude: number;
  altitude: number; // meters (barometric)
  velocity: number; // m/s ground speed
  heading: number; // degrees from north
  verticalRate: number; // m/s
  onGround: boolean;
  squawk: string | null;
  isMilitary: boolean;
}

// Satellite data from CelesTrak TLEs
export interface SatelliteData {
  name: string;
  noradId: number;
  tle1: string;
  tle2: string;
  group: string;
}

// Propagated satellite position
export interface SatellitePosition {
  noradId: number;
  name: string;
  latitude: number;
  longitude: number;
  altitude: number; // km
  group: string;
}

// Earthquake data from USGS
export interface SeismicEvent {
  id: string;
  magnitude: number;
  place: string;
  time: number; // unix timestamp ms
  longitude: number;
  latitude: number;
  depth: number; // km
  url: string;
}

// CCTV camera metadata
export interface CameraData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  streamUrl: string;
  source: string;
}

// Visual filter modes
export type FilterMode = "normal" | "nvg" | "crt" | "flir";

// Data layer identifiers
export type DataLayer =
  | "flights"
  | "military"
  | "satellites"
  | "seismic"
  | "traffic"
  | "cameras"
  | "labels";

// Camera preset for fly-to locations
export interface CameraPreset {
  name: string;
  longitude: number;
  latitude: number;
  height: number;
  heading: number;
  pitch: number;
}
