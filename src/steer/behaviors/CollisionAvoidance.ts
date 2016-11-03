import Vector from '../../math/Vector';
import GroupBehavior from '../GroupBehavior';
import Proximity, { ProximityCallback } from '../Proximity';
import Limiter from '../Limiter';
import Steerable from '../Steerable';
import SteeringAcceleration from '../SteeringAcceleration';

/**
 * {@code CollisionAvoidance} behavior steers the owner to avoid obstacles lying in its path. An obstacle is any object that can be
 * approximated by a circle (or sphere, if you are working in 3D).
 * <p>
 * This implementation uses collision prediction working out the closest approach of two agents and determining if their distance
 * at this point is less than the sum of their bounding radius. For avoiding groups of characters, averaging positions and
 * velocities do not work well with this approach. Instead, the algorithm needs to search for the character whose closest approach
 * will occur first and to react to this character only. Once this imminent collision is avoided, the steering behavior can then
 * react to more distant characters.
 * <p>
 * This algorithm works well with small and/or moving obstacles whose shape can be approximately represented by a center and a
 * radius.
 *
 * @param <T> Type of vector, either 2D or 3D, implementing the {@link Vector} interface
 *
 * @author davebaol
 */
class CollisionAvoidance<T extends Vector<T>> extends GroupBehavior<T> implements ProximityCallback<T> {

  private shortestTime: number;
  private firstNeighbor: Steerable<T>;
  private firstMinSeparation: number;
  private firstDistance: number;
  private firstRelativePosition: T;
  private firstRelativeVelocity: T;
  private relativePosition: T;
  private relativeVelocity: T;

  /**
   * Creates a {@code CollisionAvoidance} behavior for the specified owner and proximity.
   * @param owner the owner of this behavior
   * @param proximity the proximity of this behavior.
   */
  public constructor(owner: Steerable<T>, proximity: Proximity<T>) {
    super(owner, proximity);

    this.firstRelativePosition = this.newVector(owner);
    this.firstRelativeVelocity = this.newVector(owner);

    this.relativeVelocity = this.newVector(owner);
  }

  public reportNeighbor(neighbor: Steerable<T>): boolean {
    // Calculate the time to collision
    this.relativePosition.copy(neighbor.getPosition()).sub(this.owner.getPosition());
    this.relativeVelocity.copy(neighbor.getLinearVelocity()).sub(this.owner.getLinearVelocity());
    const relativeSpeed2 = this.relativeVelocity.sqrLen();

    // Collision can't happen when the agents have the same linear velocity.
    // Also, note that timeToCollision would be NaN due to the indeterminate form 0/0 and,
    // since any comparison involving NaN returns false, it would become the shortestTime,
    // so defeating the algorithm.
    if (relativeSpeed2 === 0) return false;

    const timeToCollision = - this.relativePosition.dot(this.relativeVelocity) / relativeSpeed2;

    // If timeToCollision is negative, i.e. the owner is already moving away from the the neighbor,
    // or it's not the most imminent collision then no action needs to be taken.
    if (timeToCollision <= 0 || timeToCollision >= this.shortestTime) return false;

    // Check if it is going to be a collision at all
    const distance = this.relativePosition.len();
    const minSeparation = distance - Math.sqrt(relativeSpeed2) * timeToCollision /* shortestTime */;
    if (minSeparation > this.owner.getBoundingRadius() + neighbor.getBoundingRadius()) return false;

    // Store most imminent collision data
    this.shortestTime = timeToCollision;
    this.firstNeighbor = neighbor;
    this.firstMinSeparation = minSeparation;
    this.firstDistance = distance;
    this.firstRelativePosition.copy(this.relativePosition);
    this.firstRelativeVelocity.copy(this.relativeVelocity);

    return true;
  }

  //
  // Setters overridden in order to fix the correct return type for chaining
  //

  public setOwner(owner: Steerable<T>): CollisionAvoidance<T> {
    this.owner = owner;
    return this;
  }

  public setEnabled(enabled: boolean): CollisionAvoidance<T> {
    this.enabled = enabled;
    return this;
  }

  /**
   * Sets the limiter of this steering behavior. The given limiter must at least take care of the maximum linear acceleration.
   * @return this behavior for chaining.
   */
  public setLimiter(limiter: Limiter): CollisionAvoidance<T> {
    this.limiter = limiter;
    return this;
  }

  protected calculateRealSteering (steering: SteeringAcceleration<T>): SteeringAcceleration<T> {
    this.shortestTime = Infinity;
    this.firstNeighbor = null;
    this.firstMinSeparation = 0;
    this.firstDistance = 0;
    this.relativePosition = steering.linear;

    // Take into consideration each neighbor to find the most imminent collision.
    const neighborCount = this.proximity.findNeighbors(this);

    // If we have no target, then return no steering acceleration
    //
    // NOTE: You might think that the condition below always evaluates to true since
    // firstNeighbor has been set to null when entering this method. In fact, we have just
    // executed findNeighbors(this) that has possibly set firstNeighbor to a non null value
    // through the method reportNeighbor defined below.
    if (neighborCount === 0 || this.firstNeighbor == null) return steering.setZero();

    // If we're going to hit exactly, or if we're already
    // colliding, then do the steering based on current position.
    if (this.firstMinSeparation <= 0 ||
      this.firstDistance < this.owner.getBoundingRadius() + this.firstNeighbor.getBoundingRadius()
    ) {
      this.relativePosition.copy(this.firstNeighbor.getPosition()).sub(this.owner.getPosition());
    } else {
      // Otherwise calculate the future relative position
      this.relativePosition.copy(this.firstRelativePosition).scaleAndAdd(this.firstRelativeVelocity, this.shortestTime);
    }

    // Avoid the target
    // Notice that steerling.linear and relativePosition are the same vector
    this.relativePosition.nor().scale(-this.getActualLimiter().getMaxLinearAcceleration());

    // No angular acceleration
    steering.angular = 0;

    // Output the steering
    return steering;
  }
}

export default CollisionAvoidance;
