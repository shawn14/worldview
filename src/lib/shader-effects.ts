"use client";

import * as Cesium from "cesium";
import type { Viewer } from "cesium";
import type { FilterMode } from "@/types";

// Import shader sources (loaded as raw strings via webpack config)
import nightVisionShader from "@/shaders/nightVision.glsl";
import crtShader from "@/shaders/crt.glsl";
import thermalShader from "@/shaders/thermal.glsl";

let currentStage: any = null;
let startTime = Date.now();

function createPostProcessStage(
  fragmentShader: string,
  uniforms: Record<string, any> = {}
) {
  return new Cesium.PostProcessStage({
    fragmentShader,
    uniforms: {
      time: () => (Date.now() - startTime) / 1000.0,
      ...uniforms,
    },
  });
}

export function applyFilterMode(viewer: Viewer, mode: FilterMode) {
  const stages = viewer.scene.postProcessStages;

  // Remove existing custom filter
  if (currentStage) {
    stages.remove(currentStage);
    currentStage = null;
  }

  if (mode === "normal") return;

  startTime = Date.now();

  switch (mode) {
    case "nvg":
      currentStage = createPostProcessStage(nightVisionShader);
      break;

    case "crt":
      currentStage = createPostProcessStage(crtShader);
      break;

    case "flir": {
      // Create thermal LUT texture
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 1;
      const ctx = canvas.getContext("2d")!;
      const gradient = ctx.createLinearGradient(0, 0, 256, 0);
      // FLIR Iron palette: black → blue → purple → red → orange → yellow → white
      gradient.addColorStop(0.0, "#000004");
      gradient.addColorStop(0.15, "#1b0c41");
      gradient.addColorStop(0.3, "#4a0c6b");
      gradient.addColorStop(0.45, "#781c6d");
      gradient.addColorStop(0.55, "#a52c60");
      gradient.addColorStop(0.65, "#cf4446");
      gradient.addColorStop(0.75, "#ed6925");
      gradient.addColorStop(0.85, "#fb9b06");
      gradient.addColorStop(0.95, "#f7d13d");
      gradient.addColorStop(1.0, "#fcffa4");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 256, 1);

      const lutTexture = new Cesium.Texture({
        context: (viewer.scene as any).context || (viewer.scene as any)._context,
        source: canvas,
        sampler: new Cesium.Sampler({
          wrapS: Cesium.TextureWrap.CLAMP_TO_EDGE,
          wrapT: Cesium.TextureWrap.CLAMP_TO_EDGE,
          minificationFilter: Cesium.TextureMinificationFilter.LINEAR,
          magnificationFilter: Cesium.TextureMagnificationFilter.LINEAR,
        }),
      });

      currentStage = createPostProcessStage(thermalShader, {
        thermalLUT: lutTexture,
      });
      break;
    }
  }

  if (currentStage) {
    stages.add(currentStage);
  }
}
