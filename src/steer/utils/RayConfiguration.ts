import Vector from '../../math/Vector';
import Ray from '../../utils/Ray';

/**
 * A {@code RayConfiguration} is a collection of rays typically used for collision avoidance.
 *
 * @param <T> Type of vector, either 2D or 3D, implementing the {@link Vector} interface
 *
 * @author davebaol
 */
interface RayConfiguration<T extends Vector<T>> {
  updateRays(): Ray<T>[];
}

export default RayConfiguration;
