import Vector from '../../math/Vector';
import wrapAngleAroundZero from '../../math/wrapAngleAroundZero';
import Location from '../../utils/Location';
import Limiter from '../Limiter';
import Steerable from '../Steerable';
import SteeringBehavior from '../SteeringBehavior';
import SteeringAcceleration from '../SteeringAcceleration';

/**
 * {@code ReachOrientation} tries to align the owner to the target. It pays no attention to the position or velocity of the owner
 * or target. This steering behavior does not produce any linear acceleration; it only responds by turning.
 * <p>
 * {@code ReachOrientation} behaves in a similar way to {@link Arrive} since it tries to reach the target orientation and tries to
 * have zero rotation when it gets there. Like arrive, it uses two radii: {@code decelerationRadius} for slowing down and
 * {@code alignTolerance} to make orientations near the target acceptable without letting small errors keep the owner swinging.
 * Because we are dealing with a single scalar value, rather than a 2D or 3D vector, the radius acts as an interval.
 * <p>
 * Similarly to {@code Arrive}, there is a {@code timeToTarget} that defaults to 0.1 seconds.
 *
 * @param <T> Type of vector, either 2D or 3D, implementing the {@link Vector} interface
 *
 * @author davebaol
 */
class ReachOrientation<T extends Vector<T>> extends SteeringBehavior<T> {

  /** The target to align to. */
  protected target: Location<T> ;

  /** The tolerance for aligning to the target without letting small errors keep the owner swinging. */
  protected alignTolerance: number;

  /** The radius for beginning to slow down */
  protected decelerationRadius: number;

  /** The time over which to achieve target rotation speed */
  protected timeToTarget = 0.1;

  /**
   * Creates a {@code ReachOrientation} behavior for the specified owner and target.
   * @param owner the owner of this behavior
   * @param target the target.
   */
  constructor (owner: Steerable<T>, target: Location<T> = null) {
    super(owner);
    this.target = target;
    this.alignTolerance = 0;
    this.decelerationRadius = 0;
  }

  /** Returns the target to align to. */
  public getTarget(): Location<T> {
    return this.target;
  }

  /**
   * Sets the target to align to.
   * @return this behavior for chaining.
   */
  public setTarget(target: Location<T>): ReachOrientation<T>  {
    this.target = target;
    return this;
  }

  /** Returns the tolerance for aligning to the target without letting small errors keep the owner swinging. */
  public getAlignTolerance() {
    return this.alignTolerance;
  }

  /**
   * Sets the tolerance for aligning to the target without letting small errors keep the owner swinging.
   * @return this behavior for chaining.
   */
  public setAlignTolerance(alignTolerance: number): ReachOrientation<T> {
    this.alignTolerance = alignTolerance;
    return this;
  }

  /** Returns the radius for beginning to slow down */
  public getDecelerationRadius(): number {
    return this.decelerationRadius;
  }

  /**
   * Sets the radius for beginning to slow down
   * @return this behavior for chaining.
   */
  public setDecelerationRadius(decelerationRadius: number): ReachOrientation<T> {
    this.decelerationRadius = decelerationRadius;
    return this;
  }

  /** Returns the time over which to achieve target rotation speed */
  public getTimeToTarget(): number {
    return this.timeToTarget;
  }

  /**
   * Sets the time over which to achieve target rotation speed
   * @return this behavior for chaining.
   */
  public setTimeToTarget(timeToTarget: number): ReachOrientation<T>  {
    this.timeToTarget = timeToTarget;
    return this;
  }

  //
  // Setters overridden in order to fix the correct return type for chaining
  //

  public setOwner(owner: Steerable<T>): ReachOrientation<T> {
    this.owner = owner;
    return this;
  }

  public setEnabled(enabled: boolean): ReachOrientation<T> {
    this.enabled = enabled;
    return this;
  }

  /**
   * Sets the limiter of this steering behavior. The given limiter must at least take care of the maximum angular speed and
   * acceleration.
   * @return this behavior for chaining.
   */
  public setLimiter(limiter: Limiter): ReachOrientation<T> {
    this.limiter = limiter;
    return this;
  }

  protected calculateRealSteering (steering: SteeringAcceleration<T>): SteeringAcceleration<T> {
    return this.reachOrientation(steering, this.target.getOrientation());
  }

  /**
   * Produces a steering that tries to align the owner to the target orientation. This method is called by subclasses that want
   * to align to a certain orientation.
   * @param steering the steering to be calculated.
   * @param targetOrientation the target orientation you want to align to.
   * @return the calculated steering for chaining.
   */
  protected reachOrientation(steering: SteeringAcceleration<T>, targetOrientation: number): SteeringAcceleration<T>  {
    // Get the rotation direction to the target wrapped to the range [-PI, PI]
    const rotation = wrapAngleAroundZero(targetOrientation - this.owner.getOrientation());

    // Absolute rotation
    const rotationSize = rotation < 0 ? -rotation : rotation;

    // Check if we are there, return no steering
    if (rotationSize <= this.alignTolerance) return steering.setZero();

    const actualLimiter = this.getActualLimiter();

    // Use maximum rotation
    let targetRotation = actualLimiter.getMaxAngularSpeed();

    // If we are inside the slow down radius, then calculate a scaled rotation
    if (rotationSize <= this.decelerationRadius) targetRotation *= rotationSize / this.decelerationRadius;

    // The final target rotation combines
    // speed (already in the variable) and direction
    targetRotation *= rotation / rotationSize;

    // Acceleration tries to get to the target rotation
    steering.angular = (targetRotation - this.owner.getAngularVelocity()) / this.timeToTarget;

    // Check if the absolute acceleration is too great
    const angularAcceleration = steering.angular < 0 ? -steering.angular : steering.angular;

    if (angularAcceleration > actualLimiter.getMaxAngularAcceleration())
      steering.angular *= actualLimiter.getMaxAngularAcceleration() / angularAcceleration;

    // No linear acceleration
    steering.linear.setZero();

    // Output the steering
    return steering;
  }
}

export default ReachOrientation;
