import Vector from '../../math/Vector';
import Location from '../../utils/Location';
import Steerable from '../Steerable';
import SteeringAcceleration from '../SteeringAcceleration';
import Limiter from '../Limiter';
import Arrive from './Arrive';
import Path, { PathParam } from '../utils/Path';

/**
 * {@code FollowPath} behavior produces a linear acceleration that moves the agent along the given path. First it calculates the
 * agent location based on the specified prediction time. Then it works out the position of the internal target based on the
 * location just calculated and the shape of the path. It finally uses {@link Seek seek} behavior to move the owner towards the
 * internal target position. However, if the path is open {@link Arrive arrive} behavior is used to approach path's extremities
 * when they are far less than the {@link FollowPath#decelerationRadius deceleration radius} from the internal target position.
 * <p>
 * For complex paths with sudden changes of direction the predictive behavior (i.e., with prediction time greater than 0) can
 * appear smoother than the non-predictive one (i.e., with no prediction time). However, predictive path following has the
 * downside of cutting corners when some sections of the path come close together. This cutting-corner attitude can make the
 * character miss a whole section of the path. This might not be what you want if, for example, the path represents a patrol
 * route.
 *
 * @param <T> Type of vector, either 2D or 3D, implementing the {@link Vector} interface
 * @param <P> Type of path parameter implementing the {@link PathParam} interface
 *
 * @author davebaol
 */
class FollowPath<T extends Vector<T>, P extends PathParam> extends Arrive<T> {

  /** The path to follow */
  protected path: Path<T, P>;

  /** The distance along the path to generate the target. Can be negative if the owner has to move along the reverse direction. */
  protected pathOffset: number;

  /** The current position on the path */
  protected pathParam: P;

  /** The flag indicating whether to use {@link Arrive} behavior to approach the end of an open path. It defaults to {@code true}. */
  protected arriveEnabled: boolean;

  /** The time in the future to predict the owner's position. Set it to 0 for non-predictive path following. */
  protected predictionTime: number;

  private internalTargetPosition: T;

  /**
   * Creates a {@code FollowPath} behavior for the specified owner, path, path offset, maximum linear acceleration and prediction
   * time.
   * @param owner the owner of this behavior
   * @param path the path to be followed by the owner
   * @param pathOffset the distance along the path to generate the target. Can be negative if the owner is to move along the
   *           reverse direction.
   * @param predictionTime the time in the future to predict the owner's position. Can be 0 for non-predictive path following.
   */
  constructor(owner: Steerable<T> , path: Path<T, P>, pathOffset = 0, predictionTime = 0) {
    super(owner);

    this.path = path;
    this.pathParam = path.createParam();
    this.pathOffset = pathOffset;
    this.predictionTime = predictionTime;

    this.arriveEnabled = true;

    this.internalTargetPosition = this.newVector(owner);
  }

  /** Returns the path to follow */
  public getPath(): Path<T, P> {
    return this.path;
  }

  /**
   * Sets the path followed by this behavior.
   * @param path the path to set
   * @return this behavior for chaining.
   */
  public setPath(path: Path<T, P>): FollowPath<T, P> {
    this.path = path;
    return this;
  }

  /** Returns the path offset. */
  public getPathOffset(): number {
    return this.pathOffset;
  }

  /** Returns the flag indicating whether to use {@link Arrive} behavior to approach the end of an open path. */
  public isArriveEnabled(): boolean {
    return this.arriveEnabled;
  }

  /** Returns the prediction time. */
  public getPredictionTime(): number {
    return this.predictionTime;
  }

  /**
   * Sets the prediction time. Set it to 0 for non-predictive path following.
   * @param predictionTime the predictionTime to set
   * @return this behavior for chaining.
   */
  public setPredictionTime(predictionTime: number): FollowPath<T, P>  {
    this.predictionTime = predictionTime;
    return this;
  }

  /**
   * Sets the flag indicating whether to use {@link Arrive} behavior to approach the end of an open path. It defaults to
   * {@code true}.
   * @param arriveEnabled the flag value to set
   * @return this behavior for chaining.
   */
  public setArriveEnabled(arriveEnabled: boolean): FollowPath<T, P>  {
    this.arriveEnabled = arriveEnabled;
    return this;
  }

  /**
   * Sets the path offset to generate the target. Can be negative if the owner has to move along the reverse direction.
   * @param pathOffset the pathOffset to set
   * @return this behavior for chaining.
   */
  public setPathOffset(pathOffset: number): FollowPath<T, P> {
    this.pathOffset = pathOffset;
    return this;
  }

  /** Returns the current path parameter. */
  public getPathParam(): P {
    return this.pathParam;
  }

  /** Returns the current position of the internal target. This method is useful for debug purpose. */
  public getInternalTargetPosition(): T {
    return this.internalTargetPosition;
  }

  //
  // Setters overridden in order to fix the correct return type for chaining
  //

  public setOwner(owner: Steerable<T>): FollowPath<T, P> {
    this.owner = owner;
    return this;
  }

  public setEnabled(enabled: boolean): FollowPath<T, P> {
    this.enabled = enabled;
    return this;
  }

  /**
   * Sets the limiter of this steering behavior. The given limiter must at least take care of the maximum linear speed and
   * acceleration. However the maximum linear speed is not required for a closed path.
   * @return this behavior for chaining.
   */
  public setLimiter(limiter: Limiter): FollowPath<T, P> {
    this.limiter = limiter;
    return this;
  }

  public setTarget (target: Location<T>): FollowPath<T, P> {
    this.target = target;
    return this;
  }

  public setArrivalTolerance(arrivalTolerance: number): FollowPath<T, P> {
    this.arrivalTolerance = arrivalTolerance;
    return this;
  }

  public setDecelerationRadius(decelerationRadius: number): FollowPath<T, P>  {
    this.decelerationRadius = decelerationRadius;
    return this;
  }

  public setTimeToTarget(timeToTarget: number): FollowPath<T, P> {
    this.timeToTarget = timeToTarget;
    return this;
  }

  protected calculateRealSteering(steering: SteeringAcceleration<T>): SteeringAcceleration<T>  {

    // Predictive or non-predictive behavior?
    const location = (this.predictionTime === 0) ?
      // Use the current position of the owner
      this.owner.getPosition() :
      // Calculate the predicted future position of the owner. We're reusing steering.linear here.
      steering.linear
        .copy(this.owner.getPosition())
        .scaleAndAdd(this.owner.getLinearVelocity(), this.predictionTime);

    // Find the distance from the start of the path
    const distance = this.path.calculateDistance(location, this.pathParam);

    // Offset it
    const targetDistance = distance + this.pathOffset;

    // Calculate the target position
    this.path.calculateTargetPosition(this.internalTargetPosition, this.pathParam, targetDistance);

    if (this.arriveEnabled && this.path.isOpen()) {
      if (this.pathOffset >= 0) {
        // Use Arrive to approach the last point of the path
        if (targetDistance > this.path.getLength() - this.decelerationRadius) {
          return this.arrive(steering, this.internalTargetPosition);
        }
      } else {
        // Use Arrive to approach the first point of the path
        if (targetDistance < this.decelerationRadius) {
          return this.arrive(steering, this.internalTargetPosition);
        }
      }
    }

    // Seek the target position
    steering.linear
      .copy(this.internalTargetPosition)
      .sub(this.owner.getPosition())
      .nor()
      .scale(this.getActualLimiter().getMaxLinearAcceleration());

    // No angular acceleration
    steering.angular = 0;

    // Output steering acceleration
    return steering;
  }
}

export default FollowPath;
