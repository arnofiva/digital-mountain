import { isAbortError } from "@arcgis/core/core/promiseUtils";
import { MeasurementSystem } from "@arcgis/core/core/units";
import Portal from "@arcgis/core/portal/Portal";
import SceneView from "@arcgis/core/views/SceneView";
import WebScene from "@arcgis/core/WebScene";

export async function ignoreAbortErrors<T>(promise: Promise<T>): Promise<T | undefined> {
  try {
    return await promise;
  } catch (error: any) {
    if (!isAbortError(error)) {
      throw error;
    }
    return undefined;
  }
}

export function abortNullable<T extends { abort: () => void }>(obj: T | null): null {
  if (obj) {
    obj.abort();
  }
  return null;
}

export function removeNullable<T extends { remove: () => void }>(obj: T | null): null {
  if (obj) {
    obj.remove();
  }
  return null;
}

export function getDefaultMeasurementSystem(view: SceneView): MeasurementSystem {
  const scene = view.map as WebScene;
  const portal = (scene && "portalItem" in scene ? scene.portalItem?.portal : null) ?? Portal.getDefault();
  const units = portal.user?.units ?? portal.units;
  return units === "english" ? "imperial" : "metric";
}
