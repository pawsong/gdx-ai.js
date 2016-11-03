import Vector from '../../math/Vector';
import Location from '../../utils/Location';
import Limiter from '../Limiter';
import Steerable from '../Steerable';
import SteeringAcceleration from '../SteeringAcceleration';
import ReachOrientation from './ReachOrientation';

/**
 * {@code Face} behavior makes the owner look at its target. It delegates to the {@link ReachOrientation} behavior to perform the
 * rotation but calculates the target orientation first based on target and owner position.
 *
 * @param <T> Type of vector, either 2D or 3D, implementing the {@link Vector} interface
 *
 * @author davebaol
 */
class Face<T extends Vector<T>> extends ReachOrientation<T> {
  /**
   * Creates a {@code Face} behavior for the specified owner and target.
   * @param owner the owner of this behavior
   * @param target the target of this behavior.
   */
  constructor(owner: Steerable<T>, target: Location<T> = null) {
    super(owner, target);
  }

  //
  // Setters overridden in order to fix the correct return type for chaining
  //

  public setOwner(owner: Steerable<T>): Face<T>  {
    this.owner = owner;
    return this;
  }

  public setEnabled (enabled: boolean): Face<T> {
    this.enabled = enabled;
    return this;
  }

  /**
   * Sets the limiter of this steering behavior. The given limiter must at least take care of the maximum angular speed and
   * acceleration.
   * @return this behavior for chaining.
   */
  public setLimiter(limiter: Limiter): Face<T> {
    this.limiter = limiter;
    return this;
  }

  public setTarget(target: Location<T>): Face<T> {
    this.target = target;
    return this;
  }

  public setAlignTolerance(alignTolerance: number): Face<T> {
    this.alignTolerance = alignTolerance;
    return this;
  }

  public setDecelerationRadius(decelerationRadius: number): Face<T> {
    this.decelerationRadius = decelerationRadius;
    return this;
  }

  public setTimeToTarget(timeToTarget: number): Face<T>  {
    this.timeToTarget = timeToTarget;
    return this;
  }

  protected calculateRealSteering (steering: SteeringAcceleration<T>): SteeringAcceleration<T> {
    return this.face(steering, this.target.getPosition());
  }

  protected face(steering: SteeringAcceleration<T>, targetPosition: T): SteeringAcceleration<T> {
    // Get the direction to target
    const toTarget = steering.linear.copy(targetPosition).sub(this.owner.getPosition());

    // Check for a zero direction, and return no steering if so
    if (toTarget.sqrLen() < this.getActualLimiter().getZeroLinearSpeedThreshold()) {
      return steering.setZero();
    }

    // Calculate the orientation to face the target
    const orientation = this.owner.vectorToAngle(toTarget);

    // Delegate to ReachOrientation
    return this.reachOrientation(steering, orientation);
  }
}

export default Face;
