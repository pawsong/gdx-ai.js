import PIXI = require('pixi.js');
import Vector2 from 'gdx-ai/lib/math/Vector2';
import Location from 'gdx-ai/lib/utils/Location';
import SteeringAcceleration from 'gdx-ai/lib/steer/SteeringAcceleration';
import SteeringBehavior from 'gdx-ai/lib/steer/SteeringBehavior';
import SteeringActor from '../SteeringActor';
import SteeringTest2d from './SteeringTest2d';
import SteeringLocation2d from './SteeringLocation2d';
import * as SteeringUtils2d from './SteeringUtils2d';

const steeringOutput = new SteeringAcceleration<Vector2>(new Vector2());

// the display area is considered to wrap around from top to bottom
// and from left to right
function wrapAround (pos: Vector2, maxX: number, maxY: number): void {
  if (pos.data[0] > maxX) pos.data[0] = 0.0;

  if (pos.data[0] < 0) pos.data[0] = maxX;

  if (pos.data[1] < 0) pos.data[1] = maxY;

  if (pos.data[1] > maxY) pos.data[1] = 0.0;
}

/**
 * A SteeringActor is a scene2d {@link Actor} implementing the {@link Steerable} interface.
 *
 * @autor davebaol
 */
class SteeringActor2d extends SteeringActor<Vector2> {
  position: Vector2;  // like scene2d centerX and centerY, but we need a vector to implement Steerable
  sprite: PIXI.Sprite;

  linearVelocity: Vector2;
  angularVelocity: number;
  boundingRadius: number;

  independentFacing: boolean;

  steeringBehavior: SteeringBehavior<Vector2>;

  constructor(width: number, height: number, texture: PIXI.Texture, independentFacing = false) {
    super();

    this.independentFacing = independentFacing;
    this.sprite = new PIXI.Sprite(texture);
    this.sprite.width = width;
    this.sprite.height = height;
    this.sprite.anchor.x = 0.5;
    this.sprite.anchor.y = 0.5;

    this.position = new Vector2();
    this.linearVelocity = new Vector2();
    this.angularVelocity = 0;
    this.boundingRadius = (width + height) / 4;
    this.steeringBehavior = null;
  }

  // // @Override
  public getPosition(): Vector2 {
    return this.position;
  }

  public setPosition(x: number, y: number) {
    this.sprite.position.x = x;
    this.sprite.position.y = y;
  }

  // @Override
  public getOrientation(): number {
    return this.sprite.rotation;
  }

  // @Override
  public setOrientation(orientation: number): void {
    this.sprite.rotation = orientation;
  }

  public getLinearVelocity(): Vector2 {
    return this.linearVelocity;
  }

  public getAngularVelocity(): number {
    return this.angularVelocity;
  }

  // @Override
  public getBoundingRadius(): number {
    return this.boundingRadius;
  }

  // @Override
  public newLocation(): Location<Vector2> {
    return new SteeringLocation2d();
  }

  // @Override
  public vectorToAngle(vector: Vector2): number {
    return SteeringUtils2d.vectorToAngle(vector);
  }

  // @Override
  public angleToVector(outVector: Vector2, angle: number): Vector2 {
    return SteeringUtils2d.angleToVector(outVector, angle);
  }

  public isIndependentFacing(): boolean {
    return this.independentFacing;
  }

  // @Override
  public update(delta: number): void {
    this.position.data[0] = this.sprite.x;
    this.position.data[1] = this.sprite.y;

    if (this.steeringBehavior) {

      // Calculate steering acceleration
      this.steeringBehavior.calculateSteering(steeringOutput);

      /*
       * Here you might want to add a motor control layer filtering steering accelerations.
       *
       * For instance, a car in a driving game has physical constraints on its movement: it cannot turn while stationary; the
       * faster it moves, the slower it can turn (without going into a skid); it can brake much more quickly than it can
       * accelerate; and it only moves in the direction it is facing (ignoring power slides).
       */

      // Apply steering acceleration
      this.applySteering(steeringOutput, delta);
    }

    wrapAround(this.position, SteeringTest2d.renderer.width, SteeringTest2d.renderer.height);
    this.setPosition(this.position.data[0], this.position.data[1]);
  }

  protected applySteering(steering: SteeringAcceleration<Vector2>, time: number): void {
    // Update position and linear velocity. Velocity is trimmed to maximum speed
    this.position.scaleAndAdd(this.linearVelocity, time);
    this.linearVelocity.scaleAndAdd(steering.linear, time).limit(this.getMaxLinearSpeed());

    // Update orientation and angular velocity
    if (this.independentFacing) {
      this.sprite.rotation = this.sprite.rotation + this.angularVelocity * time;
      this.angularVelocity += steering.angular * time;
    } else {
      // If we haven't got any velocity, then we can do nothing.
      if (this.linearVelocity.sqrLen() >= this.getZeroLinearSpeedThreshold()) {
        const newOrientation = this.vectorToAngle(this.linearVelocity);
        this.angularVelocity = (newOrientation - this.sprite.rotation) / time; // this is superfluous if independentFacing is always true
        this.sprite.rotation = newOrientation;
      }
    }
  }
}

export default SteeringActor2d;
