import Vector from '../../math/Vector';
import Limiter from '../Limiter';
import Steerable from '../Steerable';
import SteeringAcceleration from '../SteeringAcceleration';
import SteeringBehavior from '../SteeringBehavior';

/**
 * This combination behavior simply sums up all the behaviors, applies their weights, and truncates the result before returning.
 * There are no constraints on the blending weights; they don't have to sum to one, for example, and rarely do. Don't think of
 * {@code BlendedSteering} as a weighted mean, because it's not.
 * <p>
 * With {@code BlendedSteering} you can combine multiple behaviors to get a more complex behavior. It can work fine, but the
 * trade-off is that it comes with a few problems:
 * <ul>
 * <li>Since every active behavior is calculated every time step, it can be a costly method to process.</li>
 * <li>Behavior weights can be difficult to tweak. There have been research projects that have tried to evolve the steering
 * weights using genetic algorithms or neural networks. Results have not been encouraging, however, and manual experimentation
 * still seems to be the most sensible approach.</li>
 * <li>It's problematic with conflicting forces. For instance, a common scenario is where an agent is backed up against a wall by
 * several other agents. In this example, the separating forces from the neighboring agents can be greater than the repulsive
 * force from the wall and the agent can end up being pushed through the wall boundary. This is almost certainly not going to be
 * favorable. Sure you can make the weights for the wall avoidance huge, but then your agent may behave strangely next time it
 * finds itself alone and next to a wall.</li>
 * </ul>
 *
 * @param <T> Type of vector, either 2D or 3D, implementing the {@link Vector} interface
 *
 * @author davebaol
 */
class BlendedSteering<T extends Vector<T>> extends SteeringBehavior<T> {

  /** The list of behaviors and their corresponding blending weights. */
  protected list: Array<BehaviorAndWeight<T>>;

  private steering: SteeringAcceleration<T>;

  /**
   * Creates a {@code BlendedSteering} for the specified {@code owner}, {@code maxLinearAcceleration} and
   * {@code maxAngularAcceleration}.
   * @param owner the owner of this behavior.
   */
  constructor(owner: Steerable<T>) {
    super(owner);

    this.list = new Array<BehaviorAndWeight<T>>();
    this.steering = new SteeringAcceleration<T>(this.newVector(owner));
  }

  /**
   * Adds a steering behavior and its weight to the list.
   * @param behavior the steering behavior to add
   * @param weight the weight of the behavior
   * @return this behavior for chaining.
   */
  public add(behavior: SteeringBehavior<T>, weight: number): BlendedSteering<T> {
    return this.addBehavior(new BehaviorAndWeight<T>(behavior, weight));
  }

  /**
   * Adds a steering behavior and its weight to the list.
   * @param item the steering behavior and its weight
   * @return this behavior for chaining.
   */
  public addBehavior(item: BehaviorAndWeight<T>): BlendedSteering<T> {
    item.behavior.setOwner(this.owner);
    this.list.push(item);
    return this;
  }

  /**
   * Returns the weighted behavior at the specified index.
   * @param index the index of the weighted behavior to return
   */
  public get(index: number): BehaviorAndWeight<T> {
    return this.list[index];
  }

  //
  // Setters overridden in order to fix the correct return type for chaining
  //

  public setOwner(owner: Steerable<T>): BlendedSteering<T> {
    this.owner = owner;
    return this;
  }

  public setEnabled(enabled: boolean): BlendedSteering<T> {
    this.enabled = enabled;
    return this;
  }

  /**
   * Sets the limiter of this steering behavior. The given limiter must at least take care of the maximum linear and angular
   * accelerations. You can use {@link NullLimiter#NEUTRAL_LIMITER} to avoid all truncations.
   * @return this behavior for chaining.
   */
  public setLimiter(limiter: Limiter): BlendedSteering<T> {
    this.limiter = limiter;
    return this;
  }

  protected calculateRealSteering(blendedSteering: SteeringAcceleration<T>): SteeringAcceleration<T> {
    // Clear the output to start with
    blendedSteering.setZero();

    // Go through all the behaviors
    for (let i = 0, len = this.list.length; i < len; i++) {
      const bw = this.list[i];

      // Calculate the behavior's steering
      bw.behavior.calculateSteering(this.steering);

      // Scale and add the steering to the accumulator
      blendedSteering.mulAdd(this.steering, bw.weight);
    }

    const actualLimiter = this.getActualLimiter();

    // Crop the result
    blendedSteering.linear.limit(actualLimiter.getMaxLinearAcceleration());
    if (blendedSteering.angular > actualLimiter.getMaxAngularAcceleration())
      blendedSteering.angular = actualLimiter.getMaxAngularAcceleration();

    return blendedSteering;
  }
}

export class BehaviorAndWeight<T extends Vector<T>> {
  public behavior: SteeringBehavior<T>;
  public weight: number;

  constructor(behavior: SteeringBehavior<T>, weight: number) {
    this.behavior = behavior;
    this.weight = weight;
  }

  public getBehavior(): SteeringBehavior<T> {
    return this.behavior;
  }

  public setBehavior (behavior: SteeringBehavior<T>): void {
    this.behavior = behavior;
  }

  public getWeight(): number {
    return this.weight;
  }

  public setWeight (weight: number): void {
    this.weight = weight;
  }
}

export default BlendedSteering;
