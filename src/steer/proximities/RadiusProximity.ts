import Vector from '../../math/Vector';
import { ProximityCallback } from '../Proximity';
import Steerable from '../Steerable';
import ProximityBase from './ProximityBase';

/**
 * A {@code RadiusProximity} elaborates any agents contained in the specified list that are within the radius of the owner.
 * <p>
 * Note that this implementation checks the AI time of the current frame through the {@link Timepiece#getTime()
 * GdxAI.getTimepiece().getTime()} method in order to calculate neighbors only once per frame (assuming delta time is always
 * greater than 0, if time has changed the frame has changed too). This means that
 * <ul>
 * <li>if you forget to {@link Timepiece#update(float) update the timepiece} on each frame the proximity instance will be
 * calculated only the very first time, which is not what you want of course.</li>
 * <li>ideally the timepiece should be updated before the proximity is updated by the {@link #findNeighbors(ProximityCallback)}
 * method.</li>
 * </ul>
 *
 * @param <T> Type of vector, either 2D or 3D, implementing the {@link Vector} interface
 *
 * @author davebaol
 */
class RadiusProximity<T extends Vector<T>> extends ProximityBase<T> {

  /** The radius of this proximity. */
  protected radius: number;

  private lastTime: number;

  private getTickId: () => number;

  /**
   * Creates a {@code RadiusProximity} for the specified owner, agents and radius.
   * @param owner the owner of this proximity
   * @param agents the agents
   * @param radius the radius of the cone area
   */
  public constructor(owner: Steerable<T>, agents: Steerable<T>[], radius: number, getTickId: () => number) {
    super(owner, agents);
    this.radius = radius;
    this.lastTime = 0;
    this.getTickId = getTickId;
  }

  /** Returns the radius of this proximity. */
  public getRadius(): number {
    return this.radius;
  }

  /** Sets the radius of this proximity. */
  public setRadius (radius: number): void {
    this.radius = radius;
  }

  public findNeighbors(callback: ProximityCallback<T>): number {
    let neighborCount = 0;

    // If the frame is new then avoid repeating calculations
    // when this proximity is used by multiple group behaviors.
    const currentTime = this.getTickId();
    if (this.lastTime !== currentTime) {
      // Save the current time
      this.lastTime = currentTime;

      const ownerPosition = this.owner.getPosition();

      // Scan the agents searching for neighbors
      for (const currentAgent of this.agents) {
        // Make sure the agent being examined isn't the owner
        if (currentAgent !== this.owner) {
          const squareDistance = ownerPosition.dst2(currentAgent.getPosition());

          // The bounding radius of the current agent is taken into account
          // by adding it to the range
          const range = this.radius + currentAgent.getBoundingRadius();

          // If the current agent is within the range, report it to the callback
          // and tag it for further consideration.
          if (squareDistance < range * range) {
            if (callback.reportNeighbor(currentAgent)) {
              currentAgent.setTagged(true);
              neighborCount++;
              continue;
            }
          }
        }

        // Clear the tag
        currentAgent.setTagged(false);
      }
    } else {
      // Scan the agents searching for tagged neighbors
      for (const currentAgent of this.agents) {
        // Make sure the agent being examined isn't the owner and that
        // it's tagged.
        if (currentAgent !== this.owner && currentAgent.isTagged()) {

          if (callback.reportNeighbor(currentAgent)) {
            neighborCount++;
          }
        }
      }
    }

    return neighborCount;
  }
}

export default RadiusProximity;
