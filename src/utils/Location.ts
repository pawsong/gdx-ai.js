import Vector from '../math/Vector';

/**
 * The {@code Location} interface represents any game object having a position and an orientation.
 *
 * @param <T> Type of vector, either 2D or 3D, implementing the {@link Vector} interface
 *
 * @author davebaol
 */
interface Location<T extends Vector<T>> {

  /** Returns the vector indicating the position of this location. */
  getPosition(): T;

  /**
   * Returns the float value indicating the orientation of this location. The orientation is the angle in radians representing
   * the direction that this location is facing.
   */
  getOrientation(): number;

  /**
   * Sets the orientation of this location, i.e. the angle in radians representing the direction that this location is facing.
   * @param orientation the orientation in radians
   */
  setOrientation (orientation: number): void;

  /**
   * Returns the angle in radians pointing along the specified vector.
   * @param vector the vector
   */
  vectorToAngle(vector: T): number;

  /**
   * Returns the unit vector in the direction of the specified angle expressed in radians.
   * @param outVector the output vector.
   * @param angle the angle in radians.
   * @return the output vector for chaining.
   */
  angleToVector(outVector: T, angle: number): T;

  /**
   * Creates a new location.
   * <p>
   * This method is used internally to instantiate locations of the correct type parameter {@code T}. This technique keeps the API
   * simple and makes the API easier to use with the GWT backend because avoids the use of reflection.
   * @return the newly created location.
   */
  newLocation (): Location<T> ;
}

export default Location;
