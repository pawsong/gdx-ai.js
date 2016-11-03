import NullLimiter from './NullLimiter';

/**
 * A {@code LinearAccelerationLimiter} provides the maximum magnitude of linear acceleration. All other methods throw an
 * {@link UnsupportedOperationException}.
 *
 * @author davebaol
 */
class LinearAccelerationLimiter extends NullLimiter {

  private maxLinearAcceleration: number;

  /**
   * Creates a {@code LinearAccelerationLimiter}.
   * @param maxLinearAcceleration the maximum linear acceleration
   */
  public constructor(maxLinearAcceleration: number) {
    super();
    this.maxLinearAcceleration = maxLinearAcceleration;
  }

  /** Returns the maximum linear acceleration. */
  public getMaxLinearAcceleration(): number {
    return this.maxLinearAcceleration;
  }

  /** Sets the maximum linear acceleration. */
  public setMaxLinearAcceleration (maxLinearAcceleration: number): void {
    this.maxLinearAcceleration = maxLinearAcceleration;
  }
}

export default LinearAccelerationLimiter;
