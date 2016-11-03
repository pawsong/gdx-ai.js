/**
 * Encapsulates a general vector. Allows chaining operations by returning a reference to itself in all modification methods. See
 * {@link Vector2} and {@link Vector3} for specific implementations.
 * @author Xoppa
 */
interface Vector<T extends Vector<T>> {
  /** @return a copy of this vector */
  clone(): T;

  /** @return The euclidean length */
  len(): number;

  /**
   * This method is faster than {@link Vector#len()} because it avoids calculating a square root. It is useful for comparisons,
   * but not for getting exact lengths, as the return value is the square of the actual length.
   * @return The squared euclidean length
   */
  sqrLen(): number;

  /**
   * Limits the length of this vector, based on the desired maximum length.
   * @param limit desired maximum length for this vector
   * @return this vector for chaining
   */
  limit(limit: number): T;

  /**
   * Sets this vector from the given vector
   * @param v The vector
   * @return This vector for chaining
   */
  copy(v: T): T;

  /**
   * Subtracts the given vector from this vector.
   * @param v The vector
   * @return This vector for chaining
   */
  sub(v: T): T;

  /**
   * Normalizes this vector. Does nothing if it is zero.
   * @return This vector for chaining
   */
  nor(): T;

  /**
   * Adds the given vector to this vector
   * @param v The vector
   * @return This vector for chaining
   */
  add(v: T): T;

  /**
   * @param v The other vector
   * @return The dot product between this and the other vector
   */
  dot(v: T): number;

  /**
   * Scales this vector by a scalar
   * @param scalar The scalar
   * @return This vector for chaining
   */
  scale(scalar: number): T;

  /**
   * @param v The other vector
   * @return the distance between this and the other vector
   */
  dst(v: T): number;

  /**
   * This method is faster than {@link Vector#dst(Vector)} because it avoids calculating a square root. It is useful for
   * comparisons, but not for getting accurate distances, as the return value is the square of the actual distance.
   * @param v The other vector
   * @return the squared distance between this and the other vector
   */
  dst2(v: T): number;

  /** @return Whether this vector is a zero vector */
  isZero(): boolean;

  /**
   * Compares this vector with the other vector, using the supplied epsilon for fuzzy equality testing.
   * @param other
   * @param epsilon
   * @return whether the vectors have fuzzy equality.
   */
  epsilonEquals(other: T, epsilon: number): boolean;

  /**
   * First scale a supplied vector, then add it to this vector.
   * @param v addition vector
   * @param scalar for scaling the addition vector
   */
  scaleAndAdd(v: T, scalar: number): T;

  /**
   * Sets the components of this vector to 0
   * @return This vector for chaining
   */
  setZero(): T;
}

export default Vector;
