import Vector from '../../math/Vector';
import Proximity, { ProximityCallback } from '../Proximity';
import Steerable from '../Steerable';

/**
 * {@code ProximityBase} is the base class for any concrete proximity based on an iterable collection of agents.
 *
 * @param <T> Type of vector, either 2D or 3D, implementing the {@link Vector} interface
 *
 * @author davebaol
 */
abstract class ProximityBase<T extends Vector<T>> implements Proximity<T> {

  /** The owner of  this proximity. */
  protected owner: Steerable<T>;

  /**
   * The collection of the agents handled by this proximity.
   * <p>
   * Note that, being this field of type {@code Iterable}, you can either use java or libgdx collections. See
   * https://github.com/libgdx/gdx-ai/issues/65
   */

  protected agents: Steerable<T>[];

  /**
   * Creates a {@code ProximityBase} for the specified owner and list of agents.
   * @param owner the owner of this proximity
   * @param agents the list of agents
   */
  public constructor(owner: Steerable<T>, agents: Steerable<T>[]) {
    this.owner = owner;
    this.agents = agents;
  }

  public getOwner(): Steerable<T> {
    return this.owner;
  }

  public setOwner(owner: Steerable<T>): void {
    this.owner = owner;
  }

  /** Returns the the agents that represent potential neighbors. */
  public getAgents(): Steerable<T>[] {
    return this.agents;
  }

  /** Sets the agents that represent potential neighbors. */
  public setAgents(agents: Steerable<T>[]): void {
    this.agents = agents;
  }

  abstract findNeighbors(callback: ProximityCallback<T>): number;
}

export default ProximityBase;
