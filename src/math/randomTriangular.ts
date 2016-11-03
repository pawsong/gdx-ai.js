/**
 * Returns a triangularly distributed random number between {@code -max} (exclusive) and {@code max} (exclusive), where values
 * around zero are more likely.
 * <p>
 * This is an optimized version of {@link #randomTriangular(float, float, float) randomTriangular(-max, max, 0)}
 * @param max the upper limit
 */
function randomTriangular(max: number) {
  return (Math.random() - Math.random()) * max;
}

export default randomTriangular;
