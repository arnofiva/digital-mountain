import { Point } from "@arcgis/core/geometry";

const delta = (a: number, b: number, modulo?: number): number => {
  let d = b - a;
  if (modulo) {
    if (d > modulo / 2) {
      d = -d + modulo;
    } else if (d < -modulo / 2) {
      d = d + modulo;
    }
  }
  return d;
};

const numberLerp = (a: number, b: number, t: number, total?: number, modulo?: number): number => {
  if (!total) {
    total = 1.0;
  } else if (total === 0) {
    throw new Error("Can not interpolate between two values where the distance is 0");
  }

  // Vector
  const d = delta(a as number, b as number, modulo);

  // Length
  const s = t / total;

  return ((a as number) + d * s) as any;
};

export const headingBetweenPoints = (a: Point, b: Point) => {
  const atan2 = Math.atan2(b.y - a.y, b.x - a.x);
  return 90 - (atan2 * 180) / Math.PI;
};

export const tiltBetweenPoints = (a: Point, b: Point) => {
  const x = Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
  const y = b.z - a.z;
  const atan2 = Math.atan2(x, y);

  const angle = 90 - (atan2 * 180) / Math.PI;

  
  return angle;
};

export const pointLerp = (pointA: Point, pointB: Point, t: number): Point => {
  const spatialReference = pointA.spatialReference;
  return new Point({
    spatialReference,
    x: numberLerp(pointA.x, pointB.x, t),
    y: numberLerp(pointA.y, pointB.y, t),
    z: 2550
    // z: numberLerp(pointA.z, pointB.z, t)
  });
};