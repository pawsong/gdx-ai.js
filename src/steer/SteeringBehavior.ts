import Vector from '../math/Vector';
import Location from '../utils/Location';
import Limiter from './Limiter';
import Steerable from './Steerable';
import SteeringAcceleration from './SteeringAcceleration';

/**
 * A {@code SteeringBehavior} calculates the linear and/or angular accelerations to be applied to its owner.
 *
 * @param <T> Type of vector, either 2D or 3D, implementing the {@link Vector} interface
 *
 * @author davebaol
 */
abstract class SteeringBehavior<T extends Vector<T>> {

  /** The owner of this steering behavior */
  protected owner: Steerable<T>;

  /** The limiter of this steering behavior */
  protected limiter: Limiter;

  /** A flag indicating whether this steering behavior is enabled or not. */
  protected enabled: boolean;

  /**
   * Creates a {@code SteeringBehavior} for the specified owner, limiter and activation flag.
   *
   * @param owner the owner of this steering behavior
   * @param limiter the limiter of this steering behavior
   * @param enabled a flag indicating whether this steering behavior is enabled or not
   */
  constructor(owner: Steerable<T>, limiter: Limiter = null, enabled: boolean = true) {
    this.owner = owner;
    this.limiter = limiter;
    this.enabled = enabled;
  }

  /**
   * If this behavior is enabled calculates the steering acceleration and writes it to the given steering output. If it is
   * disabled the steering output is set to zero.
   * @param steering the steering acceleration to be calculated.
   * @return the calculated steering acceleration for chaining.
   */
  public calculateSteering(steering: SteeringAcceleration<T>): SteeringAcceleration<T> {
    return this.isEnabled() ? this.calculateRealSteering(steering) : steering.setZero();
  }

  /** Returns the owner of this steering behavior. */
  public getOwner(): Steerable<T>  {
    return this.owner;
  }

  /**
   * Sets the owner of this steering behavior.
   * @return this behavior for chaining.
   */
  public setOwner(owner: Steerable<T>): SteeringBehavior<T> {
    this.owner = owner;
    return this;
  }

  /** Returns the limiter of this steering behavior. */
  public getLimiter(): Limiter {
    return this.limiter;
  }

  /**
   * Sets the limiter of this steering behavior.
   * @return this behavior for chaining.
   */
  public setLimiter(limiter: Limiter): SteeringBehavior<T>  {
    this.limiter = limiter;
    return this;
  }

  /** Returns true if this steering behavior is enabled; false otherwise. */
  public isEnabled(): boolean  {
    return this.enabled;
  }

  /**
   * Sets this steering behavior on/off.
   * @return this behavior for chaining.
   */
  public setEnabled(enabled: boolean): SteeringBehavior<T> {
    this.enabled = enabled;
    return this;
  }

  /**
   * Calculates the steering acceleration produced by this behavior and writes it to the given steering output.
   * <p>
   * This method is called by {@link #calculateSteering(SteeringAcceleration)} when this steering behavior is enabled.
   * @param steering the steering acceleration to be calculated.
   * @return the calculated steering acceleration for chaining.
   */
  protected abstract calculateRealSteering(steering: SteeringAcceleration<T>): SteeringAcceleration<T>;

  /** Returns the actual limiter of this steering behavior. */
  protected getActualLimiter(): Limiter  {
    return this.limiter == null ? this.owner : this.limiter;
  }

  /**
   * Utility method that creates a new vector.
   * <p>
   * This method is used internally to instantiate vectors of the correct type parameter {@code T}. This technique keeps the API
   * simple and makes the API easier to use with the GWT backend because avoids the use of reflection.
   *
   * @param location the location whose position is used to create the new vector
   * @return the newly created vector
   */
  protected newVector(location: Location<T>): T {
    return location.getPosition().clone().setZero();
  }
}

export default SteeringBehavior;
