import Vector from '../../math/Vector';
import Location from '../../utils/Location';
import Steerable from '../Steerable';
import Limiter from '../Limiter';
import SteeringAcceleration from '../SteeringAcceleration';
import SteeringBehavior from '../SteeringBehavior';

/**
 * {@code Seek} behavior moves the owner towards the target position. Given a target, this behavior calculates the linear steering
 * acceleration which will direct the agent towards the target as fast as possible.
 *
 * @param <T> Type of vector, either 2D or 3D, implementing the {@link Vector} interface
 *
 * @author davebaol
 */
class Seek<T extends Vector<T>> extends SteeringBehavior<T> {

  /** The target to seek */
  protected target: Location<T> ;

  /**
   * Creates a {@code Seek} behavior for the specified owner and target.
   * @param owner the owner of this behavior
   * @param target the target agent of this behavior.
   */
  public constructor(owner: Steerable<T>, target: Location<T>  = null) {
    super(owner);
    this.target = target;
  }

  /** Returns the target to seek. */
  public getTarget(): Location<T>  {
    return this.target;
  }

  /**
   * Sets the target to seek.
   * @return this behavior for chaining.
   */
  public setTarget(target: Location<T> ): Seek<T>  {
    this.target = target;
    return this;
  }

  //
  // Setters overridden in order to fix the correct return type for chaining
  //

  public setOwner(owner: Steerable<T>): Seek<T>  {
    this.owner = owner;
    return this;
  }

  public setEnabled(enabled: boolean): Seek<T>  {
    this.enabled = enabled;
    return this;
  }

  /**
   * Sets the limiter of this steering behavior. The given limiter must at least take care of the maximum linear acceleration.
   * @return this behavior for chaining.
   */
  public setLimiter(limiter: Limiter): Seek<T>  {
    this.limiter = limiter;
    return this;
  }

  protected calculateRealSteering(steering: SteeringAcceleration<T>): SteeringAcceleration<T>  {
    // Try to match the position of the character with the position of the target by calculating
    // the direction to the target and by moving toward it as fast as possible.
    steering.linear
      .copy(this.target.getPosition())
      .sub(this.owner.getPosition())
      .nor()
      .scale(this.getActualLimiter().getMaxLinearAcceleration());

    // No angular acceleration
    steering.angular = 0;

    // Output steering acceleration
    return steering;
  }
}

export default Seek;
