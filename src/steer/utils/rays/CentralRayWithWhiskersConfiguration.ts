import Vector from '../../../math/Vector';
import Ray from '../../../utils/Ray';
import Steerable from '../../Steerable';
import RayConfigurationBase from './RayConfigurationBase';

/**
 * A {@code CentralRayWithWhiskersConfiguration} uses a long central ray and two shorter whiskers.
 * <p>
 * A central ray with short whiskers is often the best initial configuration to try but can make it impossible for the character
 * to move down tight passages. Also, it is still susceptible to the <a
 * href="../behaviors/RaycastObstacleAvoidance.html#cornerTrap">corner trap</a>, far less than the parallel configuration though.
 *
 * @param <T> Type of vector, either 2D or 3D, implementing the {@link Vector} interface
 *
 * @author davebaol
 */
class CentralRayWithWhiskersConfiguration<T extends Vector<T>> extends RayConfigurationBase<T> {

  private rayLength: number;
  private whiskerLength: number;
  private whiskerAngle: number;

  /**
   * Creates a {@code CentralRayWithWhiskersConfiguration} for the given owner where the central ray has the specified length and
   * the two whiskers have the specified length and angle.
   * @param owner the owner of this configuration
   * @param rayLength the length of the central ray
   * @param whiskerLength the length of the two whiskers (usually shorter than the central ray)
   * @param whiskerAngle the angle in radians of the whiskers from the central ray
   */
  public constructor(owner: Steerable<T>, rayLength: number, whiskerLength: number, whiskerAngle: number) {
    super(owner, 3);
    this.rayLength = rayLength;
    this.whiskerLength = whiskerLength;
    this.whiskerAngle = whiskerAngle;
  }

  public updateRays(): Ray<T>[] {
    const ownerPosition = this.owner.getPosition();
    const ownerVelocity = this.owner.getLinearVelocity();

    const velocityAngle = this.owner.vectorToAngle(ownerVelocity);

    // Update central ray
    this.rays[0].start.copy(ownerPosition);
    this.rays[0].end.copy(ownerVelocity).nor().scale(this.rayLength).add(ownerPosition);

    // Update left ray
    this.rays[1].start.copy(ownerPosition);
    this.owner.angleToVector(this.rays[1].end, velocityAngle - this.whiskerAngle).scale(this.whiskerLength).add(ownerPosition);

    // Update right ray
    this.rays[2].start.copy(ownerPosition);
    this.owner.angleToVector(this.rays[2].end, velocityAngle + this.whiskerAngle).scale(this.whiskerLength).add(ownerPosition);

    return this.rays;
  }

  /** Returns the length of the central ray. */
  public getRayLength(): number {
    return this.rayLength;
  }

  /** Sets the length of the central ray. */
  public setRayLength(rayLength: number): void {
    this.rayLength = rayLength;
  }

  /** Returns the length of the two whiskers. */
  public getWhiskerLength(): number {
    return this.whiskerLength;
  }

  /** Sets the length of the two whiskers. */
  public setWhiskerLength(whiskerLength: number): void {
    this.whiskerLength = whiskerLength;
  }

  /** Returns the angle in radians of the whiskers from the central ray. */
  public getWhiskerAngle(): number {
    return this.whiskerAngle;
  }

  /** Sets the angle in radians of the whiskers from the central ray. */
  public setWhiskerAngle(whiskerAngle: number): void {
    this.whiskerAngle = whiskerAngle;
  }
}

export default CentralRayWithWhiskersConfiguration;
