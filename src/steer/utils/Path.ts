import Vector from '../../math/Vector';

/**
 * A path parameter used by path following behaviors to keep the path status.
 *
 * @author davebaol
 */
export interface PathParam {

  /** Returns the distance from the start of the path */
  getDistance(): number;

  /**
   * Sets the distance from the start of the path
   * @param distance the distance to set
   */
  setDistance(distance: number): void;
}

/**
 * The {@code Path} for an agent having path following behavior. A path can be shared by multiple path following behaviors because
 * its status is maintained in a {@link PathParam} local to each behavior.
 * <p>
 * The most common type of path is made up of straight line segments, which usually gives reasonably good results while keeping
 * the math simple. However, some driving games use splines to get smoother curved paths, which makes the math more complex.
 *
 * @param <T> Type of vector, either 2D or 3D, implementing the {@link Vector} interface
 * @param <P> Type of path parameter implementing the {@link PathParam} interface
 *
 * @author davebaol
 */
interface Path<T extends Vector<T>, P extends PathParam> {

  /** Returns a new instance of the path parameter. */
  createParam(): P;

  /** Returns {@code true} if this path is open; {@code false} otherwise. */
  isOpen(): boolean;

  /** Returns the length of this path. */
  getLength(): number;

  /** Returns the first point of this path. */
  getStartPoint(): T;

  /** Returns the last point of this path. */
  getEndPoint(): T;

  /**
   * Maps the given position to the nearest point along the path using the path parameter to ensure coherence and returns the
   * distance of that nearest point from the start of the path.
   * @param position a location in game space
   * @param param the path parameter
   * @return the distance of the nearest point along the path from the start of the path itself.
   */
  calculateDistance(position: T, param: P): number;

  /**
   * Calculates the target position on the path based on its distance from the start and the path parameter.
   * @param out the target position to calculate
   * @param param the path parameter
   * @param targetDistance the distance of the target position from the start of the path
   */
  calculateTargetPosition(out: T, param: P, targetDistance: number): void;
}

export default Path;
