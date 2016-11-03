/**
 * Returns true if the value is zero.
 * @param tolerance represent an upper bound below which the value is considered zero.
 */
function isZero(value: number, tolerance: number) {
  return Math.abs(value) <= tolerance;
}

export default isZero;
