import { isAbortError } from "@arcgis/core/core/promiseUtils";
import { MeasurementSystem } from "@arcgis/core/core/units";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Portal from "@arcgis/core/portal/Portal";
import SceneView from "@arcgis/core/views/SceneView";
import WebScene from "@arcgis/core/WebScene";

/**
 * Suppress errors about uncaught abort errors in promises, for cases where we expect them to be thrown.
 */
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

/**
 * Set a new definition expression on a layer, combining it with any existing expression if one exists.
 */
export function appendDefinitionExpression(layer: FeatureLayer, operator: "AND" | "OR", expression: string): void {
  layer.definitionExpression = layer.definitionExpression
    ? `(${layer.definitionExpression}) ${operator} ${expression}`
    : expression;
}
