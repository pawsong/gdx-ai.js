import Vector from '../math/Vector';

/**
 * {@code SteeringAcceleration} is a movement requested by the steering system. It is made up of two components, linear and angular
 * acceleration.
 *
 * @param <T> Type of vector, either 2D or 3D, implementing the {@link Vector} interface
 *
 * @author davebaol
 */
class SteeringAcceleration<T extends Vector<T>> {
  /** The linear component of this steering acceleration. */
  public linear: T;

  /** The angular component of this steering acceleration. */
  public angular: number;

  /**
   * Creates a {@code SteeringAcceleration} with the given linear and angular components.
   *
   * @param linear The initial linear acceleration to give this SteeringAcceleration.
   * @param angular The initial angular acceleration to give this SteeringAcceleration.
   */
  constructor(linear: T, angular = 0) {
    if (linear == null) throw new Error('Linear acceleration cannot be null');
    this.linear = linear;
    this.angular = angular;
  }

  /** Returns {@code true} if both linear and angular components of this steering acceleration are zero; {@code false} otherwise. */
  public isZero(): boolean {
    return this.angular === 0 && this.linear.isZero();
  }

  /**
   * Zeros the linear and angular components of this steering acceleration.
   * @return this steering acceleration for chaining
   */
  public setZero(): SteeringAcceleration<T> {
    this.linear.setZero();
    this.angular = 0;
    return this;
  }

  /**
   * Adds the given steering acceleration to this steering acceleration.
   *
   * @param steering the steering acceleration
   * @return this steering acceleration for chaining
   */
  public add(steering: SteeringAcceleration<T> ): SteeringAcceleration<T> {
    this.linear.add(steering.linear);
    this.angular += steering.angular;
    return this;
  }

  /**
   * Scales this steering acceleration by the specified scalar.
   *
   * @param scalar the scalar
   * @return this steering acceleration for chaining
   */
  public scl(scalar: number): SteeringAcceleration<T>  {
    this.linear.scale(scalar);
    this.angular *= scalar;
    return this;
  }

  /**
   * First scale a supplied steering acceleration, then add it to this steering acceleration.
   *
   * @param steering the steering acceleration
   * @param scalar the scalar
   * @return this steering acceleration for chaining
   */
  public mulAdd(steering: SteeringAcceleration<T>, scalar: number): SteeringAcceleration<T>  {
    this.linear.scaleAndAdd(steering.linear, scalar);
    this.angular += steering.angular * scalar;
    return this;
  }

  /** Returns the square of the magnitude of this steering acceleration. This includes the angular component. */
  public calculateSquareMagnitude(): number {
    return this.linear.sqrLen() + this.angular * this.angular;
  }

  /** Returns the magnitude of this steering acceleration. This includes the angular component. */
  public calculateMagnitude(): number {
    return Math.sqrt(this.calculateSquareMagnitude());
  }
}

export default SteeringAcceleration;
