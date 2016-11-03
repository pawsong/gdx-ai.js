import Vector from '../../math/Vector';
import Limiter from '../Limiter';
import Steerable from '../Steerable';
import SteerableAdapter from '../SteerableAdapter';
import SteeringAcceleration from '../SteeringAcceleration';
import MatchVelocity from './MatchVelocity';

/**
 * First the {@code Jump} behavior calculates the linear velocity required to achieve the jump. If the calculated velocity doesn't
 * exceed the maximum linear velocity the jump is achievable; otherwise it's not. In either cases, the given callback gets
 * informed through the {@link JumpCallback#reportAchievability(boolean) reportAchievability} method. Also, if the jump is
 * achievable the run up phase begins and the {@code Jump} behavior will start to produce the linear acceleration required to match
 * the calculated velocity. Once the jump point and the linear velocity are reached with a precision within the given tolerance
 * the callback is told to jump through the {@link JumpCallback#takeoff(float, float) takeoff} method.
 *
 * @param <T> Type of vector, either 2D or 3D, implementing the {@link Vector} interface
 *
 * @author davebaol
 */
class Jump<T extends Vector<T>> extends MatchVelocity<T> {
  public static DEBUG_ENABLED = false;

  /** The jump descriptor to use */
  protected jumpDescriptor: JumpDescriptor<T>;

  /**
   * The gravity vector to use. Notice that this behavior only supports gravity along a single axis, which must be the one
   * returned by the {@link GravityComponentHandler#getComponent(Vector)} method.
   */
  protected gravity: T;

  protected gravityComponentHandler: GravityComponentHandler<T>;

  protected callback: JumpCallback;

  protected takeoffPositionTolerance: number;
  protected takeoffVelocityTolerance: number;

  /** The maximum vertical component of jump velocity, where "vertical" stands for the axis where gravity operates. */
  protected maxVerticalVelocity: number;

  protected airborneTime = 0;

  /** Keeps track of whether the jump is achievable */
  private isJumpAchievable: boolean;

  private jumpTarget: JumpTarget<T>;
  private planarVelocity: T;

  /**
   * Creates a {@code Jump} behavior.
   * @param owner the owner of this behavior
   * @param jumpDescriptor the descriptor of the jump to make
   * @param gravity the gravity vector
   * @param gravityComponentHandler the handler giving access to the vertical axis
   * @param callback the callback that gets informed about jump achievability and when to jump
   */
  constructor(owner: Steerable<T>, jumpDescriptor: JumpDescriptor<T>, gravity: T,
              gravityComponentHandler: GravityComponentHandler<T>, callback: JumpCallback
  ) {
    super(owner);
    this.gravity = gravity;
    this.gravityComponentHandler = gravityComponentHandler;
    this.setJumpDescriptor(jumpDescriptor);
    this.callback = callback;

    this.jumpTarget = new JumpTarget<T>(owner);
    this.planarVelocity = this.newVector(owner);
  }

  public calculateRealSteering(steering: SteeringAcceleration<T> ): SteeringAcceleration<T> {
    // Check if we have a trajectory, and create one if not.
    if (this.target == null) {
      this.target = this.calculateTarget();
      this.callback.reportAchievability(this.isJumpAchievable);
    }

    // If the trajectory is zero, return no steering acceleration
    if (!this.isJumpAchievable) return steering.setZero();

    // Check if the owner has reached target position and velocity with acceptable tolerance
    if (this.owner.getPosition().epsilonEquals(this.target.getPosition(), this.takeoffPositionTolerance)) {
      // if (DEBUG_ENABLED) GdxAI.getLogger().info("Jump", "Good position!!!");
      if (this.owner.getLinearVelocity().epsilonEquals(this.target.getLinearVelocity(), this.takeoffVelocityTolerance)) {
        // if (DEBUG_ENABLED) GdxAI.getLogger().info("Jump", "Good Velocity!!!");
        this.isJumpAchievable = false;
        // Perform the jump, and return no steering (the owner is airborne, no need to steer).
        this.callback.takeoff(this.maxVerticalVelocity, this.airborneTime);
        return steering.setZero();
      } else {
        // if (DEBUG_ENABLED)
        //   GdxAI.getLogger().info("Jump",
        //     "Bad Velocity: Speed diff. = "
        //       + planarVelocity.set(target.getLinearVelocity()).sub(owner.getLinearVelocity()).len() + ", diff = ("
        //       + planarVelocity + ")");
      }
    }

    // Delegate to MatchVelocity
    return super.calculateRealSteering(steering);
  }

  /**
   * Returns the airborne time and sets the {@code outVelocity} vector to the airborne planar velocity required to achieve the
   * jump. If the jump is not achievable -1 is returned and the {@code outVelocity} vector remains unchanged.
   * <p>
   * Be aware that you should avoid using unlimited or very high max velocity, because this might produce a time of flight close
   * to 0. Actually, the motion equation for T has 2 solutions and Jump always try to use the fastest time.
   * @param outVelocity the output vector where the airborne planar velocity is calculated
   * @param jumpDescriptor the jump descriptor
   * @param maxLinearSpeed the maximum linear speed that can be used to achieve the jump
   * @return the time of flight or -1 if the jump is not achievable using the given max linear speed.
   */
  public calculateAirborneTimeAndVelocity(outVelocity: T, jumpDescriptor: JumpDescriptor<T>, maxLinearSpeed: number): number {
    const g = this.gravityComponentHandler.getComponent(this.gravity);

    // Calculate the first jump time, see time of flight at http://hyperphysics.phy-astr.gsu.edu/hbase/traj.html
    // Notice that the equation has 2 solutions. We'd ideally like to achieve the jump in the fastest time
    // possible, so we want to use the smaller of the two values. However, this time value might give us
    // an impossible launch velocity (required speed greater than the max), so we need to check and
    // use the higher value if necessary.
    const sqrtTerm = Math.sqrt(
      2 * g * this.gravityComponentHandler.getComponent(jumpDescriptor.delta) +
      this.maxVerticalVelocity * this.maxVerticalVelocity
    );
    let time = (-this.maxVerticalVelocity + sqrtTerm) / g;
    // if (DEBUG_ENABLED) GdxAI.getLogger().info("Jump", "1st jump time = " + time);

    // Check if we can use it
    if (!this.checkAirborneTimeAndCalculateVelocity(outVelocity, time, jumpDescriptor, maxLinearSpeed)) {
      // Otherwise try the other time
      time = (-this.maxVerticalVelocity - sqrtTerm) / g;
      // if (DEBUG_ENABLED) GdxAI.getLogger().info("Jump", "2nd jump time = " + time);
      if (!this.checkAirborneTimeAndCalculateVelocity(outVelocity, time, jumpDescriptor, maxLinearSpeed)) {
        return -1; // Unachievable jump
      }
    }
    return time; // Achievable jump
  }

  /** Returns the jump descriptor. */
  public getJumpDescriptor(): JumpDescriptor<T> {
    return this.jumpDescriptor;
  }

  /**
   * Sets the jump descriptor to use.
   * @param jumpDescriptor the jump descriptor to set
   * @return this behavior for chaining.
   */
  public setJumpDescriptor(jumpDescriptor: JumpDescriptor<T>): Jump<T> {
    this.jumpDescriptor = jumpDescriptor;
    this.target = null;
    this.isJumpAchievable = false;
    return this;
  }

  /** Returns the gravity vector. */
  public getGravity(): T {
    return this.gravity;
  }

  /**
   * Sets the gravity vector.
   * @param gravity the gravity to set
   * @return this behavior for chaining.
   */
  public setGravity(gravity: T): Jump<T> {
    this.gravity = gravity;
    return this;
  }

  /** Returns the maximum vertical component of jump velocity, where "vertical" stands for the axis where gravity operates. */
  public getMaxVerticalVelocity(): number {
    return this.maxVerticalVelocity;
  }

  /**
   * Sets the maximum vertical component of jump velocity, where "vertical" stands for the axis where gravity operates.
   * @param maxVerticalVelocity the maximum vertical velocity to set
   * @return this behavior for chaining.
   */
  public setMaxVerticalVelocity (maxVerticalVelocity: number): Jump<T> {
    this.maxVerticalVelocity = maxVerticalVelocity;
    return this;
  }

  /** Returns the tolerance used to check if the owner has reached the takeoff location. */
  public getTakeoffPositionTolerance(): number {
    return this.takeoffPositionTolerance;
  }

  /**
   * Sets the tolerance used to check if the owner has reached the takeoff location.
   * @param takeoffPositionTolerance the takeoff position tolerance to set
   * @return this behavior for chaining.
   */
  public setTakeoffPositionTolerance (takeoffPositionTolerance: number): Jump<T> {
    this.takeoffPositionTolerance = takeoffPositionTolerance;
    return this;
  }

  /** Returns the tolerance used to check if the owner has reached the takeoff velocity. */
  public getTakeoffVelocityTolerance(): number {
    return this.takeoffVelocityTolerance;
  }

  /**
   * Sets the tolerance used to check if the owner has reached the takeoff velocity.
   * @param takeoffVelocityTolerance the takeoff velocity tolerance to set
   * @return this behavior for chaining.
   */
  public setTakeoffVelocityTolerance (takeoffVelocityTolerance: number): Jump<T> {
    this.takeoffVelocityTolerance = takeoffVelocityTolerance;
    return this;
  }

  /**
   * Sets the the tolerance used to check if the owner has reached the takeoff location with the required velocity.
   * @param takeoffTolerance the takeoff tolerance for both position and velocity
   * @return this behavior for chaining.
   */
  public setTakeoffTolerance(takeoffTolerance: number): Jump<T> {
    this.setTakeoffPositionTolerance(takeoffTolerance);
    this.setTakeoffVelocityTolerance(takeoffTolerance);
    return this;
  }

  //
  // Setters overridden in order to fix the correct return type for chaining
  //

  public setOwner(owner: Steerable<T>): Jump<T> {
    this.owner = owner;
    return this;
  }

  public setEnabled(enabled: boolean): Jump<T> {
    this.enabled = enabled;
    return this;
  }

  /**
   * Sets the limiter of this steering behavior. The given limiter must at least take care of the maximum linear acceleration and
   * speed.
   * @return this behavior for chaining.
   */
  public setLimiter(limiter: Limiter): Jump<T> {
    this.limiter = limiter;
    return this;
  }

  /**
   * Sets the target whose velocity should be matched. Notice that this method is inherited from {@link MatchVelocity}. Usually
   * with {@code Jump} you should never call it because a specialized internal target has already been created implicitly.
   * @param target the target to set
   * @return this behavior for chaining.
   */
  public setTarget(target: Steerable<T>): Jump<T> {
    this.target = target;
    return this;
  }

  public setTimeToTarget (timeToTarget: number): Jump<T> {
    this.timeToTarget = timeToTarget;
    return this;
  }

  /** Works out the trajectory calculation. */
  private calculateTarget(): Steerable<T> {
    this.jumpTarget.position = this.jumpDescriptor.takeoffPosition;
    this.airborneTime = this.calculateAirborneTimeAndVelocity(
      this.jumpTarget.linearVelocity, this.jumpDescriptor, this.getActualLimiter().getMaxLinearSpeed()
    );
    this.isJumpAchievable = this.airborneTime >= 0;
    return this.jumpTarget;
  }

  private checkAirborneTimeAndCalculateVelocity (
    outVelocity: T, time: number, jumpDescriptor: JumpDescriptor<T>, maxLinearSpeed: number
  ): boolean {
    // Calculate the planar velocity
    this.planarVelocity.copy(jumpDescriptor.delta).scale(1 / time);
    this.gravityComponentHandler.setComponent(this.planarVelocity, 0);

    // Check the planar linear speed
    if (this.planarVelocity.sqrLen() < maxLinearSpeed * maxLinearSpeed) {
      // We have a valid solution, so store it by merging vertical and non-vertical axes
      const verticalValue = this.gravityComponentHandler.getComponent(outVelocity);
      this.gravityComponentHandler.setComponent(outVelocity.copy(this.planarVelocity), verticalValue);
      // if (DEBUG_ENABLED)
      //   GdxAI.getLogger().info("Jump", "targetLinearVelocity = " + outVelocity + "; targetLinearSpeed = " + outVelocity.len());
      return true;
    }
    return false;
  }
}

/**
 * A {@code GravityComponentHandler} is aware of the axis along which the gravity acts.
 *
 * @param <T> Type of vector, either 2D or 3D, implementing the {@link Vector} interface
 *
 * @author davebaol
 */
export interface GravityComponentHandler<T extends Vector<T>> {

  /**
   * Returns the component of the given vector along which the gravity operates.
   * <p>
   * Assuming a 3D coordinate system where the gravity is acting along the y-axis, this method will be implemented as follows:
   *
   * <pre>
   * public float getComponent (Vector3 vector) {
   *   return vector.y;
   * }
   * </pre>
   *
   * Of course, the equivalent 2D implementation will use Vector2 instead of Vector3.
   * @param vector the vector
   * @return the value of the component affected by gravity.
   */
  getComponent(vector: T): number;

  /**
   * Sets the component of the given vector along which the gravity operates.
   * <p>
   * Assuming a 3D coordinate system where the gravity is acting along the y-axis, this method will be implemented as follows:
   *
   * <pre>
   * public void setComponent (Vector3 vector, float value) {
   *   vector.y = value;
   * }
   * </pre>
   *
   * Of course, the equivalent 2D implementation will use Vector2 instead of Vector3.
   * @param vector the vector
   * @param value the value of the component affected by gravity
   */
  setComponent(vector: T, value: number): void;
}

/**
 * A {@code JumpDescriptor} contains jump information like the take-off and the landing position.
 *
 * @param <T> Type of vector, either 2D or 3D, implementing the {@link Vector} interface
 *
 * @author davebaol
 */
export class JumpDescriptor<T extends Vector<T>> {
  /** The position of the takeoff pad */
  public takeoffPosition: T;

  /** The position of the landing pad */
  public landingPosition: T;

  /** The change in position from takeoff to landing. This is calculated from the other values. */
  public delta: T;

  /**
   * Creates a {@code JumpDescriptor} with the given takeoff and landing positions.
   * @param takeoffPosition the position of the takeoff pad
   * @param landingPosition the position of the landing pad
   */
  constructor(takeoffPosition: T, landingPosition: T) {
    this.takeoffPosition = takeoffPosition;
    this.landingPosition = landingPosition;
    this.delta = landingPosition.clone();
    this.set(takeoffPosition, landingPosition);
  }

  /**
   * Sets this {@code JumpDescriptor} from the given takeoff and landing positions.
   * @param takeoffPosition the position of the takeoff pad
   * @param landingPosition the position of the landing pad
   */
  public set(takeoffPosition: T, landingPosition: T): void {
    this.takeoffPosition.copy(takeoffPosition);
    this.landingPosition.copy(landingPosition);
    this.delta.copy(landingPosition).sub(takeoffPosition);
  }
}

/**
 * The {@code JumpCallback} allows you to know whether a jump is achievable and when to jump.
 *
 * @author davebaol
 */
export interface JumpCallback {

  /**
   * Reports whether the jump is achievable or not.
   * <p>
   * A jump is not achievable when the character's maximum linear velocity is not enough, in which case the jump behavior
   * won't produce any acceleration; you might want to use pathfinding to plan a new path.
   * <p>
   * If the jump is achievable the run up phase will start immediately and the character will try to match the target velocity
   * toward the takeoff point. This is the right moment to start the run up animation, if needed.
   * @param achievable whether the jump is achievable or not.
   */
  reportAchievability(achievable: boolean): void;

  /**
   * This method is called to notify that both the position and velocity of the character are good enough to jump.
   * @param maxVerticalVelocity the velocity to set along the vertical axis to achieve the jump
   * @param time the duration of the jump
   */
  takeoff(maxVerticalVelocity: number, time: number): void;
}

//
// Nested classes and interfaces
//

export class JumpTarget<T extends Vector<T>> extends SteerableAdapter<T> {
  position: T;
  linearVelocity: T;

  constructor(other: Steerable<T>) {
    super();
    this.position = null;
    this.linearVelocity = other.getPosition().clone().setZero();
  }

  public getPosition(): T {
    return this.position;
  }

  public getLinearVelocity(): T {
    return this.linearVelocity;
  }
}

export default Jump;
