import Vector from '../../math/Vector';
import Location from '../../utils/Location';
import Limiter from '../Limiter';
import Steerable from '../Steerable';
import SteeringAcceleration from '../SteeringAcceleration';
import ReachOrientation from './ReachOrientation';

/**
 * The entire steering framework assumes that the direction a character is facing does not have to be its direction of motion. In
 * many cases, however, you would like the character to face in the direction it is moving. To do this you can manually align the
 * orientation of the character to its linear velocity on each frame update or you can use the {@code LookWhereYouAreGoing}
 * behavior.
 * <p>
 * {@code LookWhereYouAreGoing} behavior gives the owner angular acceleration to make it face in the direction it is moving. In
 * this way the owner changes facing gradually, which can look more natural, especially for aerial vehicles such as helicopters or
 * for human characters that can move sideways.
 * <p>
 * This is a process similar to the {@code Face} behavior. The target orientation is calculated using the current velocity of the
 * owner. If there is no velocity, then the target orientation is set to the current orientation. We have no preference in this
 * situation for any orientation.
 *
 * @param <T> Type of vector, either 2D or 3D, implementing the {@link Vector} interface
 *
 * @author davebaol
 */
class LookWhereYouAreGoing<T extends Vector<T>> extends ReachOrientation<T> {

  /**
   * Creates a {@code LookWhereYouAreGoing} behavior for the specified owner.
   * @param owner the owner of this behavior.
   */
  constructor(owner: Steerable<T>) {
    super(owner);
  }

  //
  // Setters overridden in order to fix the correct return type for chaining
  //

  public setOwner(owner: Steerable<T>): LookWhereYouAreGoing<T> {
    this.owner = owner;
    return this;
  }

  public setEnabled(enabled: boolean): LookWhereYouAreGoing<T> {
    this.enabled = enabled;
    return this;
  }

  /**
   * Sets the limiter of this steering behavior. The given limiter must at least take care of the maximum angular speed and
   * acceleration.
   * @return this behavior for chaining.
   */
  public setLimiter(limiter: Limiter): LookWhereYouAreGoing<T> {
    this.limiter = limiter;
    return this;
  }

  /**
   * Sets the target to align to. Notice that this method is inherited from {@link ReachOrientation}, but is completely useless
   * for {@code LookWhereYouAreGoing} because the target orientation is determined by the velocity of the owner itself.
   * @return this behavior for chaining.
   */
  public setTarget(target: Location<T>): LookWhereYouAreGoing<T> {
    this.target = target;
    return this;
  }

  public setAlignTolerance(alignTolerance: number): LookWhereYouAreGoing<T> {
    this.alignTolerance = alignTolerance;
    return this;
  }

  public setDecelerationRadius(decelerationRadius: number): LookWhereYouAreGoing<T> {
    this.decelerationRadius = decelerationRadius;
    return this;
  }

  public setTimeToTarget (timeToTarget: number): LookWhereYouAreGoing<T> {
    this.timeToTarget = timeToTarget;
    return this;
  }

  protected calculateRealSteering(steering: SteeringAcceleration<T>): SteeringAcceleration<T> {
    // Check for a zero direction, and return no steering if so
    if (this.owner.getLinearVelocity().sqrLen() < this.getActualLimiter().getZeroLinearSpeedThreshold()) {
      return steering.setZero();
    }

    // Calculate the orientation based on the velocity of the owner
    const orientation = this.owner.vectorToAngle(this.owner.getLinearVelocity());

    // Delegate to ReachOrientation
    return this.reachOrientation(steering, orientation);
  }
}

export default LookWhereYouAreGoing;
