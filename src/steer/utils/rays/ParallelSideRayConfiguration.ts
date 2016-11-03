import Vector from '../../../math/Vector';
import Ray from '../../../utils/Ray';
import Steerable from '../../Steerable';
import RayConfigurationBase from './RayConfigurationBase';

const HALF_PI = Math.PI * 0.5;

/**
 * A {@code ParallelSideRayConfiguration} uses two rays parallel to the direction of motion. The rays have the same length and
 * opposite side offset.
 * <p>
 * The parallel configuration works well in areas where corners are highly obtuse but is very susceptible to the <a
 * href="../behaviors/RaycastObstacleAvoidance.html">corner trap</a>.
 *
 * @param <T> Type of vector, either 2D or 3D, implementing the {@link Vector} interface
 *
 * @author davebaol
 */
class ParallelSideRayConfiguration<T extends Vector<T>> extends RayConfigurationBase<T> {

  private length: number;
  private sideOffset: number;

  /**
   * Creates a {@code ParallelSideRayConfiguration} for the given owner where the two rays have the specified length and side
   * offset.
   * @param owner the owner of this ray configuration
   * @param length the length of the rays.
   * @param sideOffset the side offset of the rays.
   */
  public constructor(owner: Steerable<T>, length: number, sideOffset: number) {
    super(owner, 2);
    this.length = length;
    this.sideOffset = sideOffset;
  }

  public updateRays(): Ray<T>[] {
    const velocityAngle = this.owner.vectorToAngle(this.owner.getLinearVelocity());

    // Update ray 0
    this.owner.angleToVector(this.rays[0].start, velocityAngle - HALF_PI).scale(this.sideOffset).add(this.owner.getPosition());
    this.rays[0].end.copy(this.owner.getLinearVelocity()).nor().scale(this.length); // later we'll add rays[0].start;

    // Update ray 1
    this.owner.angleToVector(this.rays[1].start, velocityAngle + HALF_PI).scale(this.sideOffset).add(this.owner.getPosition());
    this.rays[1].end.copy(this.rays[0].end).add(this.rays[1].start);

    // add start position to ray 0
    this.rays[0].end.add(this.rays[0].start);

    return this.rays;
  }

  /** Returns the length of the rays. */
  public getLength(): number {
    return this.length;
  }

  /** Sets the length of the rays. */
  public setLength(length: number): void {
    this.length = length;
  }

  /** Returns the side offset of the rays. */
  public getSideOffset(): number {
    return this.sideOffset;
  }

  /** Sets the side offset of the rays. */
  public setSideOffset(sideOffset: number): void {
    this.sideOffset = sideOffset;
  }
}

export default ParallelSideRayConfiguration;
