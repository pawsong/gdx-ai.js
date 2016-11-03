import Vector from '../../math/Vector';
import Limiter from '../Limiter';
import Steerable from '../Steerable';
import SteeringAcceleration from '../SteeringAcceleration';
import SteeringBehavior from '../SteeringBehavior';

/**
 * This steering behavior produces a linear acceleration trying to match target's velocity. It does not produce any angular
 * acceleration.
 *
 * @param <T> Type of vector, either 2D or 3D, implementing the {@link Vector} interface
 *
 * @author davebaol
 */
class MatchVelocity<T extends Vector<T>> extends SteeringBehavior<T> {

  /** The target of this behavior */
  protected target: Steerable<T>;

  /** The time over which to achieve target speed */
  protected timeToTarget: number;

  /**
   * Creates a {@code MatchVelocity} behavior for the given owner, target and timeToTarget.
   * @param owner the owner of this behavior
   * @param target the target of this behavior
   * @param timeToTarget the time over which to achieve target speed.
   */
  public constructor(owner: Steerable<T>, target: Steerable<T> = null, timeToTarget: number = 0.1) {
    super(owner);
    this.target = target;
    this.timeToTarget = timeToTarget;
  }

  /** Returns the target whose velocity should be matched. */
  public getTarget(): Steerable<T> {
    return this.target;
  }

  /**
   * Sets the target whose velocity should be matched.
   * @param target the target to set
   * @return this behavior for chaining.
   */
  public setTarget(target: Steerable<T>): MatchVelocity<T> {
    this.target = target;
    return this;
  }

  /** Returns the time over which to achieve target speed. */
  public getTimeToTarget(): number {
    return this.timeToTarget;
  }

  /**
   * Sets the time over which to achieve target speed.
   * @param timeToTarget the time to set
   * @return this behavior for chaining.
   */
  public setTimeToTarget(timeToTarget: number): MatchVelocity<T> {
    this.timeToTarget = timeToTarget;
    return this;
  }

  //
  // Setters overridden in order to fix the correct return type for chaining
  //

  public setOwner(owner: Steerable<T>): MatchVelocity<T> {
    this.owner = owner;
    return this;
  }

  public setEnabled (enabled: boolean): MatchVelocity<T> {
    this.enabled = enabled;
    return this;
  }

  /**
   * Sets the limiter of this steering behavior. The given limiter must at least take care of the maximum linear acceleration.
   * @return this behavior for chaining.
   */
  public setLimiter(limiter: Limiter): MatchVelocity<T> {
    this.limiter = limiter;
    return this;
  }

  protected calculateRealSteering (steering: SteeringAcceleration<T>): SteeringAcceleration<T> {
    // Acceleration tries to get to the target velocity without exceeding max acceleration
    steering.linear
      .copy(this.target.getLinearVelocity())
      .sub(this.owner.getLinearVelocity())
      .scale(1 / this.timeToTarget)
      .limit(this.getActualLimiter().getMaxLinearAcceleration());

    // No angular acceleration
    steering.angular = 0;

    // Output steering acceleration
    return steering;
  }
}

export default MatchVelocity;
