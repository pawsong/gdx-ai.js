import Vector from '../../math/Vector';
import randomTriangular from '../../math/randomTriangular';
import Location from '../../utils/Location';
import Limiter from '../Limiter';
import Steerable from '../Steerable';
import SteeringAcceleration from '../SteeringAcceleration';
import Face from './Face';

/**
 * {@code Wander} behavior is designed to produce a steering acceleration that will give the impression of a random walk through
 * the agent's environment. You'll often find it a useful ingredient when creating an agent's behavior.
 * <p>
 * There is a circle in front of the owner (where front is determined by its current facing direction) on which the target is
 * constrained. Each time the behavior is run, we move the target around the circle a little, by a random amount. Now there are 2
 * ways to implement wander behavior:
 * <ul>
 * <li>The owner seeks the target, using the {@link Seek} behavior, and performs a {@link LookWhereYouAreGoing} behavior to
 * correct its orientation.</li>
 * <li>The owner tries to face the target in each frame, using the {@link Face} behavior to align to the target, and applies full
 * linear acceleration in the direction of its current orientation.</li>
 * </ul>
 * In either case, the orientation of the owner is retained between calls (so smoothing the changes in orientation). The angles
 * that the edges of the circle subtend to the owner determine how fast it will turn. If the target is on one of these extreme
 * points, it will turn quickly. The target will twitch and jitter around the edge of the circle, but the owner's orientation will
 * change smoothly.
 * <p>
 * This implementation uses the second approach. However, if you manually align owner's orientation to its linear velocity on each
 * time step, {@link Face} behavior should not be used (which is the default case). On the other hand, if the owner has
 * independent facing you should explicitly call {@link #setFaceEnabled(boolean) setFaceEnabled(true)} before using Wander
 * behavior.
 * <p>
 * Note that this behavior internally calls the {@link Timepiece#getTime() GdxAI.getTimepiece().getTime()} method to get the
 * current AI time and make the {@link #wanderRate} FPS independent. This means that
 * <ul>
 * <li>if you forget to {@link Timepiece#update(float) update the timepiece} the wander orientation won't change.</li>
 * <li>ideally the timepiece should be always updated before this steering behavior runs.</li>
 * </ul>
 * <p>
 * This steering behavior can be used to produce a whole range of random motion, from very smooth undulating turns to wild
 * Strictly Ballroom type whirls and pirouettes depending on the size of the circle, its distance from the agent, and the amount
 * of random displacement each frame.
 *
 * @param <T> Type of vector, either 2D or 3D, implementing the {@link Vector} interface
 *
 * @author davebaol
 */
class Wander<T extends Vector<T>> extends Face<T> {

  /** The forward offset of the wander circle */
  protected wanderOffset: number;

  /** The radius of the wander circle */
  protected wanderRadius: number;

  /** The rate, expressed in radian per second, at which the wander orientation can change */
  protected wanderRate: number;

  /** The last time the orientation of the wander target has been updated */
  protected lastTime: number;

  /** The current orientation of the wander target */
  protected wanderOrientation: number;

  /**
   * The flag indicating whether to use {@link Face} behavior or not. This should be set to {@code true} when independent facing
   * is used.
   */
  protected faceEnabled: boolean;

  private internalTargetPosition: T;
  private wanderCenter: T;

  private getDeltaTime: () => number;

  /**
   * Creates a {@code Wander} behavior for the specified owner.
   * @param owner the owner of this behavior.
   */
  public constructor(owner: Steerable<T>, getDeltaTime: () => number) {
    super(owner);
    this.getDeltaTime = getDeltaTime;

    this.internalTargetPosition = this.newVector(owner);
    this.wanderCenter = this.newVector(owner);
  }

  /** Returns the forward offset of the wander circle. */
  public getWanderOffset(): number {
    return this.wanderOffset;
  }

  /**
   * Sets the forward offset of the wander circle.
   * @return this behavior for chaining.
   */
  public setWanderOffset(wanderOffset: number): Wander<T> {
    this.wanderOffset = wanderOffset;
    return this;
  }

  /** Returns the radius of the wander circle. */
  public getWanderRadius(): number {
    return this.wanderRadius;
  }

  /**
   * Sets the radius of the wander circle.
   * @return this behavior for chaining.
   */
  public setWanderRadius(wanderRadius: number): Wander<T> {
    this.wanderRadius = wanderRadius;
    return this;
  }

  /** Returns the rate, expressed in radian per second, at which the wander orientation can change. */
  public getWanderRate(): number {
    return this.wanderRate;
  }

  /**
   * Sets the rate, expressed in radian per second, at which the wander orientation can change.
   * @return this behavior for chaining.
   */
  public setWanderRate(wanderRate: number): Wander<T> {
    this.wanderRate = wanderRate;
    return this;
  }

  /** Returns the current orientation of the wander target. */
  public getWanderOrientation(): number {
    return this.wanderOrientation;
  }

  /**
   * Sets the current orientation of the wander target.
   * @return this behavior for chaining.
   */
  public setWanderOrientation(wanderOrientation: number): Wander<T> {
    this.wanderOrientation = wanderOrientation;
    return this;
  }

  /** Returns the flag indicating whether to use {@link Face} behavior or not. */
  public isFaceEnabled(): boolean {
    return this.faceEnabled;
  }

  /**
   * Sets the flag indicating whether to use {@link Face} behavior or not. This should be set to {@code true} when independent
   * facing is used.
   * @return this behavior for chaining.
   */
  public setFaceEnabled(faceEnabled: boolean): Wander<T> {
    this.faceEnabled = faceEnabled;
    return this;
  }

  /** Returns the current position of the wander target. This method is useful for debug purpose. */
  public getInternalTargetPosition(): T {
    return this.internalTargetPosition;
  }

  /** Returns the current center of the wander circle. This method is useful for debug purpose. */
  public getWanderCenter(): T {
    return this.wanderCenter;
  }

  //
  // Setters overridden in order to fix the correct return type for chaining
  //

  public setOwner(owner: Steerable<T>): Wander<T> {
    this.owner = owner;
    return this;
  }

  public setEnabled(enabled: boolean): Wander<T> {
    this.enabled = enabled;
    return this;
  }

  /**
   * Sets the limiter of this steering behavior. The given limiter must at least take care of the maximum linear acceleration;
   * additionally, if the flag {@code faceEnabled} is true, it must take care of the maximum angular speed and acceleration.
   * @return this behavior for chaining.
   */
  public setLimiter(limiter: Limiter): Wander<T> {
    this.limiter = limiter;
    return this;
  }

  /**
   * Sets the target to align to. Notice that this method is inherited from {@link ReachOrientation}, but is completely useless
   * for {@code Wander} because owner's orientation is determined by the internal target, which is moving on the wander circle.
   * @return this behavior for chaining.
   */
  public setTarget(target: Location<T>): Wander<T> {
    this.target = target;
    return this;
  }

  public setAlignTolerance(alignTolerance: number): Wander<T> {
    this.alignTolerance = alignTolerance;
    return this;
  }

  public setDecelerationRadius(decelerationRadius: number): Wander<T> {
    this.decelerationRadius = decelerationRadius;
    return this;
  }

  public setTimeToTarget (timeToTarget: number): Wander<T> {
    this.timeToTarget = timeToTarget;
    return this;
  }

  protected calculateRealSteering(steering: SteeringAcceleration<T>): SteeringAcceleration<T> {
    const delta = this.getDeltaTime();
    this.wanderOrientation += randomTriangular(this.wanderRate * delta);

    // Calculate the combined target orientation
    const targetOrientation = this.wanderOrientation + this.owner.getOrientation();

    // Calculate the center of the wander circle
    this.wanderCenter
      .copy(this.owner.getPosition())
      .scaleAndAdd(this.owner.angleToVector(steering.linear, this.owner.getOrientation()), this.wanderOffset);

    // Calculate the target location
    // Notice that we're using steering.linear as temporary vector
    this.internalTargetPosition
      .copy(this.wanderCenter)
      .scaleAndAdd(this.owner.angleToVector(steering.linear, targetOrientation), this.wanderRadius);

    const maxLinearAcceleration = this.getActualLimiter().getMaxLinearAcceleration();

    if (this.faceEnabled) {
      // Delegate to face
      this.face(steering, this.internalTargetPosition);

      // Set the linear acceleration to be at full
      // acceleration in the direction of the orientation
      this.owner.angleToVector(steering.linear, this.owner.getOrientation()).scale(maxLinearAcceleration);
    } else {
      // Seek the internal target position
      steering.linear
        .copy(this.internalTargetPosition)
        .sub(this.owner.getPosition())
        .nor()
        .scale(maxLinearAcceleration);

      // No angular acceleration
      steering.angular = 0;
    }

    return steering;
  }
}

export default Wander;
