export const PI2 = Math.PI * 2;

/** Returns a random number between start (inclusive) and end (exclusive). */
export function random(start: number, end: number) {
  return start + Math.random() * (end - start);
}

export const degreesToRadians = Math.PI / 180;
