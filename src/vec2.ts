export function add(vecA: number[], vecB: number[]) {
  return [vecA[0] + vecB[0], vecA[1] + vecB[1]];
}

export function subtract(vecA: number[], vecB: number[]) {
  return [vecA[0] - vecB[0], vecA[1] - vecB[1]];
}

export function scale(vec: number[], factor: number) {
  return [vec[0] * factor, vec[1] * factor];
}

export function length(vec: number[]) {
  return Math.sqrt(vec[0] ** 2 + vec[1] ** 2);
}

export function distance(vecA: number[], vecB: number[]) {
  const dx = vecB[0] - vecA[0];
  const dy = vecB[1] - vecA[1];
  return Math.sqrt(dx ** 2 + dy ** 2);
}

export function dot(vecA: number[], vecB: number[]) {
  return vecA[0] * vecB[0] + vecA[1] * vecB[1];
}
