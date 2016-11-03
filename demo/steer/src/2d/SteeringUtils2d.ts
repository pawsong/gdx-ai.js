import Vector2 from 'gdx-ai/lib/math/Vector2';

export function vectorToAngle(vector: Vector2) {
  return Math.atan2(-vector.data[0], vector.data[1]);
}

export function angleToVector(outVector: Vector2, angle: number) {
  outVector.data[0] = - Math.sin(angle);
  outVector.data[1] = Math.cos(angle);
  return outVector;
}
