import * as Cesium from "cesium";

export function configureCesium() {
  // Ion token for Google 3D Tiles access
  const token = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;
  if (token) {
    Cesium.Ion.defaultAccessToken = token;
  } else {
    console.warn(
      "NEXT_PUBLIC_CESIUM_ION_TOKEN not set — 3D Tiles will not load. " +
      "Get a free token at https://ion.cesium.com/"
    );
  }

  // Point static asset paths to our copied public/cesium/ folder
  (window as any).CESIUM_BASE_URL = "/cesium/";
}
