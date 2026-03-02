"use client";

import * as Cesium from "cesium";
import type { Viewer } from "cesium";
import type { FilterMode } from "@/types";

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
    case "flir":
      currentStage = createPostProcessStage(thermalShader);
      break;
  }

  if (currentStage) {
    stages.add(currentStage);
  }
}
