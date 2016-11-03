import Vector3 from 'gdx-ai/lib/math/Vector3';

export function vectorToAngle(vector: Vector3): number {
  return Math.atan2(-vector.data[2], vector.data[0]);
}

export function angleToVector(outVector: Vector3, angle: number): Vector3 {
  outVector.data[2] = - Math.sin(angle);
  outVector.data[1] = 0;
  outVector.data[0] = Math.cos(angle);
  return outVector;
}
