import Vector from 'gdx-ai/lib/math/Vector';
import Steerable from 'gdx-ai/lib/steer/Steerable';
import Location from 'gdx-ai/lib/utils/Location';
import SteeringAcceleration from 'gdx-ai/lib/steer/SteeringAcceleration';
import SteeringBehavior from 'gdx-ai/lib/steer/SteeringBehavior';
import PIXI = require('pixi.js');

/**
 * A SteeringActor is a scene2d {@link Actor} implementing the {@link Steerable} interface.
 *
 * @autor davebaol
 */
abstract class SteeringActor<T extends Vector<T>> implements Steerable<T> {
  protected maxLinearSpeed: number;
  protected maxLinearAcceleration: number;
  protected maxAngularSpeed: number;
  protected maxAngularAcceleration: number;

  protected independentFacing: boolean;
  protected steeringBehavior: SteeringBehavior<T>;

  private tagged: boolean;

  constructor() {
    this.tagged = false;
    this.maxLinearSpeed = 0;
    this.maxLinearAcceleration = 0;
    this.maxAngularSpeed = 0;
    this.maxAngularAcceleration = 0;

    this.independentFacing = false;
    this.steeringBehavior = null;
  }

  public getSteeringBehavior(): SteeringBehavior<T> {
    return this.steeringBehavior;
  }

  public setSteeringBehavior(steeringBehavior: SteeringBehavior<T>): void {
    this.steeringBehavior = steeringBehavior;
  }

  public abstract update(delta: number): void;

  /** Returns the vector indicating the position of this location. */
  abstract getPosition(): T;

  /**
   * Returns the float value indicating the orientation of this location. The orientation is the angle in radians representing
   * the direction that this location is facing.
   */
  abstract getOrientation(): number;

  /**
   * Sets the orientation of this location, i.e. the angle in radians representing the direction that this location is facing.
   * @param orientation the orientation in radians
   */
  abstract setOrientation(orientation: number): void;

  /**
   * Returns the angle in radians pointing along the specified vector.
   * @param vector the vector
   */
  abstract vectorToAngle(vector: T): number;

  /**
   * Returns the unit vector in the direction of the specified angle expressed in radians.
   * @param outVector the output vector.
   * @param angle the angle in radians.
   * @return the output vector for chaining.
   */
  abstract angleToVector(outVector: T, angle: number): T;

  /**
   * Creates a new location.
   * <p>
   * This method is used internally to instantiate locations of the correct type parameter {@code T}. This technique keeps the API
   * simple and makes the API easier to use with the GWT backend because avoids the use of reflection.
   * @return the newly created location.
   */
  abstract newLocation (): Location<T> ;

  /** Returns the vector indicating the linear velocity of this Steerable. */
  abstract getLinearVelocity(): T;

  /** Returns the float value indicating the the angular velocity in radians of this Steerable. */
  abstract getAngularVelocity(): number;

  /** Returns the bounding radius of this Steerable. */
  abstract getBoundingRadius(): number;

  public isIndependentFacing(): boolean {
    return this.independentFacing;
  }

  public setIndependentFacing (independentFacing: boolean): void {
    this.independentFacing = independentFacing;
  }

  // @Override
  public isTagged(): boolean {
    return this.tagged;
  }

  // @Override
  public setTagged(tagged: boolean): void {
    this.tagged = tagged;
  }

  // @Override
  public getZeroLinearSpeedThreshold() {
    return 0.001;
  }

  // @Override
  public setZeroLinearSpeedThreshold(value: number) {
    throw new Error('Unsupported');
  }

  public getMaxLinearSpeed(): number {
    return this.maxLinearSpeed;
  }

  public setMaxLinearSpeed(maxLinearSpeed: number): void {
    this.maxLinearSpeed = maxLinearSpeed;
  }

  // @Override
  public getMaxLinearAcceleration(): number {
    return this.maxLinearAcceleration;
  }

  // @Override
  public setMaxLinearAcceleration(maxLinearAcceleration: number): void {
    this.maxLinearAcceleration = maxLinearAcceleration;
  }

  // @Override
  public getMaxAngularSpeed(): number {
    return this.maxAngularSpeed;
  }

  // @Override
  public setMaxAngularSpeed(maxAngularSpeed: number) {
    this.maxAngularSpeed = maxAngularSpeed;
  }

  // @Override
  public getMaxAngularAcceleration () {
    return this.maxAngularAcceleration;
  }

  // @Override
  public setMaxAngularAcceleration(maxAngularAcceleration: number) {
    this.maxAngularAcceleration = maxAngularAcceleration;
  }

  protected abstract applySteering(steering: SteeringAcceleration<T>, deltaTime: number): void;
}

export default SteeringActor;
