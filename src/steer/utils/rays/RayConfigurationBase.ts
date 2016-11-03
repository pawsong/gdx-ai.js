import Vector from '../../../math/Vector';
import Ray from '../../../utils/Ray';
import Steerable from '../../Steerable';
import RayConfiguration from '../RayConfiguration';

/**
 * {@code RayConfigurationBase} is the base class for concrete ray configurations having a fixed number of rays.
 *
 * @param <T> Type of vector, either 2D or 3D, implementing the {@link Vector} interface
 *
 * @author davebaol
 */
abstract class RayConfigurationBase<T extends Vector<T>> implements RayConfiguration<T> {

  protected owner: Steerable<T>;
  protected rays: Ray<T>[];

  /**
   * Creates a {@code RayConfigurationBase} for the given owner and the specified number of rays.
   * @param owner the owner of this configuration
   * @param numRays the number of rays used by this configuration
   */
  public constructor(owner: Steerable<T>, numRays: number) {
    this.owner = owner;
    this.rays = [];
    for (let i = 0; i < numRays; i++)
      this.rays.push(
        new Ray<T>(owner.getPosition().clone().setZero(), owner.getPosition().clone().setZero())
      );
  }

  /** Returns the owner of this configuration. */
  public getOwner(): Steerable<T> {
    return this.owner;
  }

  /** Sets the owner of this configuration. */
  public setOwner(owner: Steerable<T> ): void {
    this.owner = owner;
  }

  /** Returns the rays of this configuration. */
  public getRays(): Ray<T>[] {
    return this.rays;
  }

  /** Sets the rays of this configuration. */
  public setRays(rays: Ray<T>[]): void {
    this.rays = rays;
  }

  abstract updateRays(): Ray<T>[];
}

export default RayConfigurationBase;
