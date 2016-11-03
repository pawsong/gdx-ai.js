import Vector from '../../../math/Vector';
import Ray from '../../../utils/Ray';
import Steerable from '../../Steerable';
import RayConfigurationBase from './RayConfigurationBase';

/**
 * As the name suggests, a {@code SingleRayConfiguration} uses just one ray cast.
 * <p>
 * This configuration is useful in concave environments but grazes convex obstacles. It is not susceptible to the <a
 * href="../behaviors/RaycastObstacleAvoidance.html#cornerTrap">corner trap</a>, though.
 *
 * @param <T> Type of vector, either 2D or 3D, implementing the {@link Vector} interface
 *
 * @author davebaol
 */
class SingleRayConfiguration<T extends Vector<T>> extends RayConfigurationBase<T> {

  private length: number;

  /**
   * Creates a {@code SingleRayConfiguration} for the given owner where the ray has the specified length.
   * @param owner the owner of this configuration
   * @param length the length of the ray
   */
  public constructor(owner: Steerable<T>, length: number) {
    super(owner, 1);
    this.length = length;
  }

  public updateRays(): Ray<T>[] {
    this.rays[0].start.copy(this.owner.getPosition());
    this.rays[0].end.copy(this.owner.getLinearVelocity()).nor().scale(this.length).add(this.rays[0].start);
    return this.rays;
  }

  /** Returns the length of the ray. */
  public getLength(): number {
    return this.length;
  }

  /** Sets the length of the ray. */
  public setLength(length: number): void {
    this.length = length;
  }

}

export default SingleRayConfiguration;
