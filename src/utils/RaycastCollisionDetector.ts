import Vector from '../math/Vector';
import Ray from './Ray';
import Collision from './Collision';

/**
 * A {@code RaycastCollisionDetector} finds the closest intersection between a ray and any object in the game world.
 *
 * @param <T> Type of vector, either 2D or 3D, implementing the {@link Vector} interface
 *
 * @author davebaol
 */
interface RaycastCollisionDetector<T extends Vector<T>> {

  /**
   * Casts the given ray to test if it collides with any objects in the game world.
   * @param ray the ray to cast.
   * @return {@code true} in case of collision; {@code false} otherwise.
   */
  collides(ray: Ray<T>): boolean;

  /**
   * Find the closest collision between the given input ray and the objects in the game world. In case of collision,
   * {@code outputCollision} will contain the collision point and the normal vector of the obstacle at the point of collision.
   * @param outputCollision the output collision.
   * @param inputRay the ray to cast.
   * @return {@code true} in case of collision; {@code false} otherwise.
   */
  findCollision(outputCollision: Collision<T>, inputRay: Ray<T>): boolean;
}

export default RaycastCollisionDetector;
