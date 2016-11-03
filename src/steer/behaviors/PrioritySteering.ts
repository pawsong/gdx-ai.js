import Vector from '../../math/Vector';
import Limiter from '../Limiter';
import Steerable from '../Steerable';
import SteeringAcceleration from '../SteeringAcceleration';
import SteeringBehavior from '../SteeringBehavior';

/**
 * The {@code PrioritySteering} behavior iterates through the behaviors and returns the first non zero steering. It makes sense
 * since certain steering behaviors only request an acceleration in particular conditions. Unlike {@link Seek} or {@link Evade},
 * which always produce an acceleration, {@link RaycastObstacleAvoidance}, {@link CollisionAvoidance}, {@link Separation},
 * {@link Hide} and {@link Arrive} will suggest no acceleration in many cases. But when these behaviors do suggest an
 * acceleration, it is unwise to ignore it. An obstacle avoidance behavior, for example, should be honored immediately to avoid
 * the crash.
 * <p>
 * Typically the behaviors of a {@code PrioritySteering} are arranged in groups with regular blending weights, see
 * {@link BlendedSteering}. These groups are then placed in priority order to let the steering system consider each group in turn.
 * It blends the steering behaviors in the current group together. If the total result is very small (less than some small, but
 * adjustable, parameter), then it is ignored and the next group is considered. It is best not to check against zero directly,
 * because numerical instability in calculations can mean that a zero value is never reached for some steering behaviors. Using a
 * small constant value (conventionally called {@code epsilon}) avoids this problem. When a group is found with a result that isn't
 * small, its result is used to steer the agent.
 * <p>
 * For instance, a pursuing agent working in a team may have three priorities:
 * <ul>
 * <li>a collision avoidance group that contains behaviors for obstacle avoidance, wall avoidance, and avoiding other characters.</li>
 * <li>a separation behavior used to avoid getting too close to other members of the chasing pack.</li>
 * <li>a pursuit behavior to chase the target.</li>
 * </ul>
 * If the character is far from any interference, the collision avoidance group will return with no desired acceleration. The
 * separation behavior will then be considered but will also return with no action. Finally, the pursuit behavior will be
 * considered, and the acceleration needed to continue the chase will be used. If the current motion of the character is perfect
 * for the pursuit, this behavior may also return with no acceleration. In this case, there are no more behaviors to consider, so
 * the character will have no acceleration, just as if they'd been exclusively controlled by the pursuit behavior.
 * <p>
 * In a different scenario, if the character is about to crash into a wall, the first group will return an acceleration that will
 * help avoid the crash. The character will carry out this acceleration immediately, and the steering behaviors in the other
 * groups won't be considered.
 * <p>
 * Usually {@code PrioritySteering} gives you a good compromise between speed and accuracy.
 *
 * @param <T> Type of vector, either 2D or 3D, implementing the {@link Vector} interface
 *
 * @author davebaol
 */
class PrioritySteering<T extends Vector<T>> extends SteeringBehavior<T> {

  /** The threshold of the steering acceleration magnitude below which a steering behavior is considered to have given no output. */
  protected epsilon: number;

  /**
   * The list of steering behaviors in priority order. The first item in the list is tried first, the subsequent entries are only
   * considered if the first one does not return a result.
   */
  protected behaviors: Array<SteeringBehavior<T>> = new Array<SteeringBehavior<T>>();

  /** The index of the behavior whose acceleration has been returned by the last evaluation of this priority steering. */
  protected selectedBehaviorIndex: number;

  /**
   * Creates a {@code PrioritySteering} behavior for the specified owner and threshold.
   * @param owner the owner of this behavior
   * @param epsilon the threshold of the steering acceleration magnitude below which a steering behavior is considered to have
   *           given no output
   */
  constructor(owner: Steerable<T>, epsilon = 0.001) {
    super(owner);
    this.epsilon = epsilon;
  }

  /**
   * Adds the specified behavior to the priority list.
   * @param behavior the behavior to add
   * @return this behavior for chaining.
   */
  public add(behavior: SteeringBehavior<T>): PrioritySteering<T> {
    this.behaviors.push(behavior);
    return this;
  }

  /**
   * Returns the index of the behavior whose acceleration has been returned by the last evaluation of this priority steering; -1
   * otherwise.
   */
  public getSelectedBehaviorIndex(): number {
    return this.selectedBehaviorIndex;
  }

  /**
   * Returns the threshold of the steering acceleration magnitude below which a steering behavior is considered to have given no
   * output.
   */
  public getEpsilon(): number {
    return this.epsilon;
  }

  /**
   * Sets the threshold of the steering acceleration magnitude below which a steering behavior is considered to have given no
   * output.
   * @param epsilon the epsilon to set
   * @return this behavior for chaining.
   */
  public setEpsilon(epsilon: number): PrioritySteering<T> {
    this.epsilon = epsilon;
    return this;
  }

  //
  // Setters overridden in order to fix the correct return type for chaining
  //

  public setOwner(owner: Steerable<T>): PrioritySteering<T> {
    this.owner = owner;
    return this;
  }

  public setEnabled(enabled: boolean): PrioritySteering<T> {
    this.enabled = enabled;
    return this;
  }

  /**
   * Sets the limiter of this steering behavior. However, {@code PrioritySteering} needs no limiter at all as it simply returns
   * the first non zero steering acceleration.
   * @return this behavior for chaining.
   */
  public setLimiter(limiter: Limiter): PrioritySteering<T> {
    this.limiter = limiter;
    return this;
  }

  protected calculateRealSteering(steering: SteeringAcceleration<T>): SteeringAcceleration<T> {
    // We'll need epsilon squared later.
    const epsilonSquared = this.epsilon * this.epsilon;

    // Go through the behaviors until one has a large enough acceleration
    const n = this.behaviors.length;
    this.selectedBehaviorIndex = -1;
    for (let i = 0; i < n; i++) {
      this.selectedBehaviorIndex = i;

      const behavior = this.behaviors[i];

      // Calculate the behavior's steering
      behavior.calculateSteering(steering);

      // If we're above the threshold return the current steering
      if (steering.calculateSquareMagnitude() > epsilonSquared) return steering;
    }

    // If we get here, it means that no behavior had a large enough acceleration,
    // so return the small acceleration from the final behavior or zero if there are
    // no behaviors in the list.
    return n > 0 ? steering : steering.setZero();
  }
}

export default PrioritySteering;
