export const SAH = 0;
export const CENTER = 1;
export const AVERAGE = 2;

export function acceleratedRaycast() {}
export function computeBoundsTree() {}
export function disposeBoundsTree() {}
export function getBVHExtremes() {
  return [];
}
export function estimateMemoryInBytes() {
  return 0;
}
export function validateBounds() {
  return true;
}

export const shaderStructs = '';
export const shaderIntersectFunction = '';

export class MeshBVHUniformStruct {
  constructor() {}
  updateFrom() {}
  dispose() {}
}

export class MeshBVH {
  constructor() {}
  raycast() {
    return [];
  }
  intersectsSphere() {
    return false;
  }
  intersectsBox() {
    return false;
  }
  closestPointToPoint() {
    return null;
  }
}

export default {
  SAH,
  CENTER,
  AVERAGE,
  acceleratedRaycast,
  computeBoundsTree,
  disposeBoundsTree,
  getBVHExtremes,
  estimateMemoryInBytes,
  validateBounds,
  shaderStructs,
  shaderIntersectFunction,
  MeshBVHUniformStruct,
  MeshBVH,
};
