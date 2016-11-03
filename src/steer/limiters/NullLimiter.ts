import Limiter from '../Limiter';

/**
 * A {@code NullLimiter} always throws {@link UnsupportedOperationException}. Typically it's used as the base class of partial or
 * immutable limiters.
 *
 * @author davebaol
 */
class NullLimiter implements Limiter {

  /**
   * Guaranteed to throw UnsupportedOperationException.
   * @throws UnsupportedOperationException always
   */
  public getMaxLinearSpeed(): number {
    throw new Error('UnsupportedOperationException');
  }

  /**
   * Guaranteed to throw UnsupportedOperationException.
   * @throws UnsupportedOperationException always
   */
  public setMaxLinearSpeed(maxLinearSpeed: number): void {
    throw new Error('UnsupportedOperationException');
  }

  /**
   * Guaranteed to throw UnsupportedOperationException.
   * @throws UnsupportedOperationException always
   */
  public getMaxLinearAcceleration(): number {
    throw new Error('UnsupportedOperationException');
  }

  /**
   * Guaranteed to throw UnsupportedOperationException.
   * @throws UnsupportedOperationException always
   */
  public setMaxLinearAcceleration(maxLinearAcceleration: number): void {
    throw new Error('UnsupportedOperationException');
  }

  /**
   * Guaranteed to throw UnsupportedOperationException.
   * @throws UnsupportedOperationException always
   */
  public getMaxAngularSpeed(): number {
    throw new Error('UnsupportedOperationException');
  }

  /**
   * Guaranteed to throw UnsupportedOperationException.
   * @throws UnsupportedOperationException always
   */
  public setMaxAngularSpeed(maxAngularSpeed: number): void {
    throw new Error('UnsupportedOperationException');
  }

  /**
   * Guaranteed to throw UnsupportedOperationException.
   * @throws UnsupportedOperationException always
   */
  public getMaxAngularAcceleration(): number {
    throw new Error('UnsupportedOperationException');
  }

  /**
   * Guaranteed to throw UnsupportedOperationException.
   * @throws UnsupportedOperationException always
   */
  public setMaxAngularAcceleration(maxAngularAcceleration: number): void {
    throw new Error('UnsupportedOperationException');
  }

  public getZeroLinearSpeedThreshold(): number {
    return 0.001;
  }

  /**
   * Guaranteed to throw UnsupportedOperationException.
   * @throws UnsupportedOperationException always
   */
  public setZeroLinearSpeedThreshold(zeroLinearSpeedThreshold: number): void {
    throw new Error('UnsupportedOperationException');
  }
}

export default NullLimiter;

export class NeutralLimiter extends NullLimiter {
  public getMaxLinearSpeed(): number {
    return Infinity;
  }

  public getMaxLinearAcceleration(): number {
    return Infinity;
  }

  public getMaxAngularSpeed(): number {
    return Infinity;
  }

  public getMaxAngularAcceleration(): number {
    return Infinity;
  }
}

/**
 * An immutable limiter whose getters return {@link Float#POSITIVE_INFINITY} and setters throw
 * {@link UnsupportedOperationException}.
 */
export const NEUTRAL_LIMITER = new NeutralLimiter();
