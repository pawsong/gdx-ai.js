import Vector from '../math/Vector';

/**
 * A {@code Ray} is made up of a starting point and an ending point.
 *
 * @param <T> Type of vector, either 2D or 3D, implementing the {@link Vector} interface
 *
 * @author davebaol
 */
class Ray<T extends Vector<T>> {

  /** The starting point of this ray. */
  public start: T;

  /** The ending point of this ray. */
  public end: T;

  /**
   * Creates a {@code Ray} with the given {@code start} and {@code end} points.
   * @param start the starting point of this ray
   * @param end the starting point of this ray
   */
  public constructor(start: T, end: T) {
    this.start = start;
    this.end = end;
  }

  /**
   * Sets this ray from the given ray.
   * @param ray The ray
   * @return this ray for chaining.
   */
  public copy(ray: Ray<T>): Ray<T> {
    this.start.copy(ray.start);
    this.end.copy(ray.end);
    return this;
  }

  /**
   * Sets this Ray from the given start and end points.
   * @param start the starting point of this ray
   * @param end the starting point of this ray
   * @return this ray for chaining.
   */
  public set(start: T, end: T): Ray<T> {
    this.start.copy(start);
    this.end.copy(end);
    return this;
  }
}

export default Ray;
