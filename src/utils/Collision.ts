import Vector from '../math/Vector';

/**
 * A {@code Collision} is made up of a collision point and the normal at that point of collision.
 *
 * @param <T> Type of vector, either 2D or 3D, implementing the {@link Vector} interface
 *
 * @author davebaol
 */
class Collision<T extends Vector<T>> {

  /** The collision point. */
  public point: T;

  /** The normal of this collision. */
  public normal: T;

  /**
   * Creates a {@code Collision} with the given {@code point} and {@code normal}.
   * @param point the point where this collision occurred
   * @param normal the normal of this collision
   */
  public constructor(point: T, normal: T) {
    this.point = point;
    this.normal = normal;
  }

  /**
   * Sets this collision from the given collision.
   * @param collision The collision
   * @return this collision for chaining.
   */
  public copy(collision: Collision<T>): Collision<T> {
    this.point.copy(collision.point);
    this.normal.copy(collision.normal);
    return this;
  }

  /**
   * Sets this collision from the given point and normal.
   * @param point the collision point
   * @param normal the normal of this collision
   * @return this collision for chaining.
   */
  public set(point: T, normal: T): Collision<T> {
    this.point.copy(point);
    this.normal.copy(normal);
    return this;
  }
}

export default Collision;
