import { Point, Polyline } from "@arcgis/core/geometry";
import { LiftType } from "./liftType";

const LINE_WEIGHT_PER_UNIT_LENGTH = 1; // lb/ft
const COUNT = 50; // number of vertices per sag

const vectorFromTwoPoints = (from: Point, to: Point) =>
  new Point({
    spatialReference: from.spatialReference,
    x: to.x - from.x,
    y: to.y - from.y,
    z: to.z - from.z
  });

const magnitude = (point: Point) => Math.sqrt(Math.pow(point.x, 2) + Math.pow(point.y, 2) + Math.pow(point.z, 2));

const setVectorMagnitude = (A: Point, magnitude: number) => {
  const unit = unitizeVector(A);
  return new Point({
    spatialReference: A.spatialReference,
    x: unit.x * magnitude,
    y: unit.y * magnitude,
    z: unit.z * magnitude
  });
};

const addVectors = (A: Point, B: Point) => {
  return new Point({
    spatialReference: A.spatialReference,
    x: A.x + B.x,
    y: A.y + B.y,
    z: A.z + B.z
  });
};

const unitizeVector = (A: Point) => {
  const mag = magnitude(A);
  return new Point({
    spatialReference: A.spatialReference,
    x: A.x / mag,
    y: A.y / mag,
    z: A.z / mag
  });
};

const zAsAFunctionOfX = (_x: number, _h: number, _w: number) => {
  const a = _h / _w;
  const coshXoverA = Math.cosh(_x / a);
  const coshXoverA_MinusOne = coshXoverA - 1;
  const a_times_coshXoverA_MinusOne = a * coshXoverA_MinusOne;
  const z = a_times_coshXoverA_MinusOne;
  return z;
};

const createSagLine = (from: Point, to: Point, sagToSpanRatio: number) => {
  const spanVector3D = vectorFromTwoPoints(from, to);
  // const spanLength3D = magnitude(spanVector3D);
  const spanVector2D = new Point({
    spatialReference: spanVector3D.spatialReference,
    x: spanVector3D.x,
    y: spanVector3D.y,
    z: 0
  });
  const spanLength2D = magnitude(spanVector2D);
  const attachmentPointHeightDifference = Math.abs(to.z - from.z);

  const D = sagToSpanRatio * spanLength2D;
  const S = spanLength2D;
  const h = attachmentPointHeightDifference;
  const w = LINE_WEIGHT_PER_UNIT_LENGTH;

  const xHigh = (S / 2) * (1 + h / (4 * D));
  const xLow = (S / 2) * (1 - h / (4 * D));

  const dHigh = D * Math.pow(1 + h / (4 * D), 2); // D sub L in book.
  const dLow = D * Math.pow(1 - h / (4 * D), 2); // # D sub R in book. # XX This is reversed, because the book
  //chose left and right, rather than high and low.

  const hLow = (w * Math.pow(xLow, 2)) / (2 * dLow);
  // hHigh = (w * pow(xHigh, 2)) / (2 * dHigh)
  const H = hLow; // or hHigh, because they must be equal.

  // Make a list of values along the length of the span.
  // listZ holds the calculated z-values of each point on the line (relative to a flat 2D line between the towers).
  const listZ: number[] = [];
  // listT
  const listT: number[] = [];

  let sagOriginDrop, xAsFunctionOfT;
  const count = Math.ceil(spanLength2D / 20);
  for (let xStep = 0; xStep <= count; xStep++) {
    const T = (xStep * spanLength2D) / count;
    listT.push(T);
    // X origin is at lowest point in span, and x is positive in both directions.

    if (from.z > to.z) {
      sagOriginDrop = dHigh;
      // XX This condition is to handle a condition when an X value is negative... not sure about it. (uplift)
      if (xHigh < 0) {
        xAsFunctionOfT = Math.abs(xHigh) + T;
      } else {
        xAsFunctionOfT = Math.abs(T - xHigh);
      }
    } else {
      sagOriginDrop = dLow;
      // XX This condition is to handle a condition when an X value is negative... not sure about it. (uplift)
      if (xLow < 0) {
        xAsFunctionOfT = Math.abs(xLow) + T;
      } else {
        xAsFunctionOfT = Math.abs(T - xLow);
      }
    }
    const x = xAsFunctionOfT;
    const zValue = zAsAFunctionOfX(x, H, w);
    listZ.push(zValue);
  }

  const firstZCalced = listZ.at(0); // z-relative to sag origin
  const lastZCalced = listZ.at(-1); // z-relative to sag origin
  const fromPointZ = from.z; // feature z-value
  const toPointZ = to.z; // feature z-value
  const firstZCalcedPlusSagOriginDrop = firstZCalced + sagOriginDrop;
  const firstFixZ = sagOriginDrop - firstZCalced;
  const firstElevDiff = fromPointZ - firstZCalcedPlusSagOriginDrop;
  const lastZCalcedPlusSagOriginDrop = lastZCalced + sagOriginDrop;
  const lastElevDiff = toPointZ - lastZCalcedPlusSagOriginDrop;
  const totalShearZ = lastElevDiff - firstElevDiff;
  const shearZIncrement = totalShearZ / count;

  // This is where we are calculating the line shape based on the known z-values determined above.
  // Start at fromPoint, and drop it by sag.
  const spatialReference = from.spatialReference;
  const sagDropVector = new Point({
    spatialReference,
    x: 0,
    y: 0,
    z: -sagOriginDrop
  });
  const sagOriginPoint = addVectors(from, sagDropVector);
  const path: number[][] = [];

  for (let index = 0; index < listT.length; index++) {
    const xAlongSpanVector = setVectorMagnitude(spanVector2D, listT[index]);
    const shearZ = shearZIncrement * index; // shearZ is part of visual fix
    const zMoveUpValue = listZ[index] + firstFixZ + shearZ; // firstFixZ is part of visual fix.
    const zMoveUpVector = new Point({
      spatialReference,
      x: 0,
      y: 0,
      z: zMoveUpValue
    });
    const originPointMoveVector = addVectors(xAlongSpanVector, zMoveUpVector);
    const thisPoint = addVectors(sagOriginPoint, originPointMoveVector);
    path.push([thisPoint.x, thisPoint.y, thisPoint.z]);
  }

  return path;
};

export function createSag(line: Polyline, sagToSpanRatio: number) {
  const paths: number[][][] = [];
  line.paths.forEach((path, index) => {
    for (let i = 0; i < path.length - 1; i++) {
      const fromPoint = line.getPoint(index, i);
      const toPoint = line.getPoint(index, i + 1);
      paths.push(createSagLine(fromPoint, toPoint, sagToSpanRatio));
    }
  });

  return new Polyline({
    spatialReference: line.spatialReference,
    paths
  });
}

export function sagToSpanRatio(liftType: LiftType): number {
  switch (liftType) {
    case LiftType.CableCar:
      return 0.03;
    case LiftType.Chair:
      return 0.01;
    case LiftType.TBar:
      return 0.005;
  }
}
