import Vector from 'gdx-ai/lib/math/Vector';
const MAX_SAFE_INTEGER: number = require('max-safe-integer');
import SteeringActor from './SteeringActor';

const MAX_DT = 1 / 60; // ms

/**
 * Base class for cross-engine steering behavior tests.
 *
 * @author davebaol
 */
abstract class SteeringTestBase<T extends Vector<T>> {
  static CANVAS_WIDTH = 800;
  static CANVAS_HEIGHT = 600;
  static CANVAS_BG_COLOR = 0x9E9E9E;

  private then: number;

  private tickId: number;
  private deltaTime: number;

  private actors: SteeringActor<T>[];

  constructor() {
    this.actors = [];
  }

  public create(): void {
    this.onCreate();
    this.then = Date.now();

    this.tickId = 0;
    this.deltaTime = 0;
  }

  public render() {
    const now = Date.now();
    const dt = now - this.then;
    this.then = now;
    this.onUpdate(Math.min(dt / 1000, MAX_DT));
    this.onRender();
  }

  public destroy(): void {
    this.onDestroy();
  }

  public abstract onDestroy(): void;

  protected abstract onCreate(): void;

  protected onUpdate(dt: number): void {
    this.tickId = this.tickId < MAX_SAFE_INTEGER ? this.tickId + 1 : 1;
    this.deltaTime = dt;

    for (const actor of this.actors) {
      actor.update(dt);
    }
  }

  protected addActor(actor: SteeringActor<T>) {
    this.actors.push(actor);
  }

  protected getTickId = () => this.tickId;

  protected getDeltaTime = () => this.deltaTime;

  protected abstract onRender(): void;
}

export default SteeringTestBase;
