import NullLimiter from './NullLimiter';

/**
 * A {@code LinearLimiter} provides the maximum magnitudes of linear speed and linear acceleration. Angular methods throw an
 * {@link UnsupportedOperationException}.
 *
 * @author davebaol
 */
class LinearLimiter extends NullLimiter {

  private maxLinearAcceleration: number;
  private maxLinearSpeed: number;

  /**
   * Creates a {@code LinearLimiter}.
   * @param maxLinearAcceleration the maximum linear acceleration
   * @param maxLinearSpeed the maximum linear speed
   */
  constructor(maxLinearAcceleration: number, maxLinearSpeed: number) {
    super();
    this.maxLinearAcceleration = maxLinearAcceleration;
    this.maxLinearSpeed = maxLinearSpeed;
  }

  /** Returns the maximum linear speed. */
  public getMaxLinearSpeed(): number {
    return this.maxLinearSpeed;
  }

  /** Sets the maximum linear speed. */
  public setMaxLinearSpeed(maxLinearSpeed: number): void {
    this.maxLinearSpeed = maxLinearSpeed;
  }

  /** Returns the maximum linear acceleration. */
  public getMaxLinearAcceleration(): number {
    return this.maxLinearAcceleration;
  }

  /** Sets the maximum linear acceleration. */
  public setMaxLinearAcceleration(maxLinearAcceleration: number): void {
    this.maxLinearAcceleration = maxLinearAcceleration;
  }
}

export default LinearLimiter;
