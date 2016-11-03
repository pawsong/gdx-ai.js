import Vector from '../../math/Vector';
import Location from '../../utils/Location';
import Limiter from '../Limiter';
import Steerable from '../Steerable';
import SteeringAcceleration from '../SteeringAcceleration';
import SteeringBehavior from '../SteeringBehavior';

/**
 * {@code Arrive} behavior moves the agent towards a target position. It is similar to seek but it attempts to arrive at the target
 * position with a zero velocity.
 * <p>
 * {@code Arrive} behavior uses two radii. The {@code arrivalTolerance} lets the owner get near enough to the target without
 * letting small errors keep it in motion. The {@code decelerationRadius}, usually much larger than the previous one, specifies
 * when the incoming character will begin to slow down. The algorithm calculates an ideal speed for the owner. At the slowing-down
 * radius, this is equal to its maximum linear speed. At the target point, it is zero (we want to have zero speed when we arrive).
 * In between, the desired speed is an interpolated intermediate value, controlled by the distance from the target.
 * <p>
 * The direction toward the target is calculated and combined with the desired speed to give a target velocity. The algorithm
 * looks at the current velocity of the character and works out the acceleration needed to turn it into the target velocity. We
 * can't immediately change velocity, however, so the acceleration is calculated based on reaching the target velocity in a fixed
 * time scale known as {@code timeToTarget}. This is usually a small value; it defaults to 0.1 seconds which is a good starting
 * point.
 *
 * @param <T> Type of vector, either 2D or 3D, implementing the {@link Vector} interface
 *
 * @author davebaol
 */
class Arrive<T extends Vector<T>> extends SteeringBehavior<T> {

  /** The target to arrive to. */
  protected target: Location<T>;

  /**
   * The tolerance for arriving at the target. It lets the owner get near enough to the target without letting small errors keep
   * it in motion.
   */
  protected arrivalTolerance: number = 0;

  /** The radius for beginning to slow down */
  protected decelerationRadius: number = 0;

  /** The time over which to achieve target speed */
  protected timeToTarget: number = 0.1;

  /**
   * Creates an {@code Arrive} behavior for the specified owner and target.
   * @param owner the owner of this behavior
   * @param target the target of this behavior
   */
  constructor(owner: Steerable<T>, target: Location<T> = null) {
    super(owner);
    this.target = target;
  }

  /** Returns the target to arrive to. */
  public getTarget(): Location<T> {
    return this.target;
  }

  /**
   * Sets the target to arrive to.
   * @return this behavior for chaining.
   */
  public setTarget(target: Location<T>): Arrive<T> {
    this.target = target;
    return this;
  }

  /**
   * Returns the tolerance for arriving at the target. It lets the owner get near enough to the target without letting small
   * errors keep it in motion.
   */
  public getArrivalTolerance(): number {
    return this.arrivalTolerance;
  }

  /**
   * Sets the tolerance for arriving at the target. It lets the owner get near enough to the target without letting small errors
   * keep it in motion.
   * @return this behavior for chaining.
   */
  public setArrivalTolerance(arrivalTolerance: number): Arrive<T> {
    this.arrivalTolerance = arrivalTolerance;
    return this;
  }

  /** Returns the radius for beginning to slow down. */
  public getDecelerationRadius(): number {
    return this.decelerationRadius;
  }

  /**
   * Sets the radius for beginning to slow down.
   * @return this behavior for chaining.
   */
  public setDecelerationRadius(decelerationRadius: number): Arrive<T>  {
    this.decelerationRadius = decelerationRadius;
    return this;
  }

  /** Returns the time over which to achieve target speed. */
  public getTimeToTarget(): number {
    return this.timeToTarget;
  }

  /**
   * Sets the time over which to achieve target speed.
   * @return this behavior for chaining.
   */
  public setTimeToTarget(timeToTarget: number): Arrive<T>  {
    this.timeToTarget = timeToTarget;
    return this;
  }

  //
  // Setters overridden in order to fix the correct return type for chaining
  //

  public setOwner(owner: Steerable<T>): Arrive<T> {
    this.owner = owner;
    return this;
  }

  public setEnabled(enabled: boolean): Arrive<T> {
    this.enabled = enabled;
    return this;
  }

  /**
   * Sets the limiter of this steering behavior. The given limiter must at least take care of the maximum linear speed and
   * acceleration.
   * @return this behavior for chaining.
   */
  public setLimiter(limiter: Limiter): Arrive<T> {
    this.limiter = limiter;
    return this;
  }

  protected calculateRealSteering(steering: SteeringAcceleration<T> ): SteeringAcceleration<T>  {
    return this.arrive(steering, this.target.getPosition());
  }

  protected arrive(steering: SteeringAcceleration<T>, targetPosition: T): SteeringAcceleration<T>  {
    // Get the direction and distance to the target
    const toTarget: T = steering.linear.copy(targetPosition).sub(this.owner.getPosition());
    const distance: number = toTarget.len();

    // Check if we are there, return no steering
    if (distance <= this.arrivalTolerance) return steering.setZero();

    const actualLimiter: Limiter = this.getActualLimiter();
    // Go max speed
    let targetSpeed: number = actualLimiter.getMaxLinearSpeed();

    // If we are inside the slow down radius calculate a scaled speed
    if (distance <= this.decelerationRadius) targetSpeed *= distance / this.decelerationRadius;

    // Target velocity combines speed and direction
    // Optimized code for: toTarget.nor().scl(targetSpeed)
    const targetVelocity: T = toTarget.scale(targetSpeed / distance);

    // Acceleration tries to get to the target velocity without exceeding max acceleration
    // Notice that steering.linear and targetVelocity are the same vector
    targetVelocity
      .sub(this.owner.getLinearVelocity())
      .scale(1 / this.timeToTarget)
      .limit(actualLimiter.getMaxLinearAcceleration());

    // No angular acceleration
    steering.angular = 0;

    // Output the steering
    return steering;
  }
}

export default Arrive;
