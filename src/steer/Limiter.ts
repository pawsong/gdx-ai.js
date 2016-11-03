/**
 * A {@code Limiter} provides the maximum magnitudes of speed and acceleration for both linear and angular components.
 *
 * @author davebaol
 */
interface Limiter {

  /**
   * Returns the threshold below which the linear speed can be considered zero. It must be a small positive value near to zero.
   * Usually it is used to avoid updating the orientation when the velocity vector has a negligible length.
   */
  getZeroLinearSpeedThreshold(): number;

  /**
   * Sets the threshold below which the linear speed can be considered zero. It must be a small positive value near to zero.
   * Usually it is used to avoid updating the orientation when the velocity vector has a negligible length.
   */
  setZeroLinearSpeedThreshold(value: number): void;

  /** Returns the maximum linear speed. */
  getMaxLinearSpeed(): number;

  /** Sets the maximum linear speed. */
  setMaxLinearSpeed(maxLinearSpeed: number): void;

  /** Returns the maximum linear acceleration. */
  getMaxLinearAcceleration(): number;

  /** Sets the maximum linear acceleration. */
  setMaxLinearAcceleration(maxLinearAcceleration: number): void;

  /** Returns the maximum angular speed. */
  getMaxAngularSpeed(): number;

  /** Sets the maximum angular speed. */
  setMaxAngularSpeed(maxAngularSpeed: number): void;

  /** Returns the maximum angular acceleration. */
  getMaxAngularAcceleration(): number;

  /** Sets the maximum angular acceleration. */
  setMaxAngularAcceleration(maxAngularAcceleration: number): void;
}

export default Limiter;
