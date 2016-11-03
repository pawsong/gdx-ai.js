import Vector from '../math/Vector';
import Location from '../utils/Location';
import Steerable from './Steerable';

/**
 * An adapter class for {@link Steerable}. You can derive from this and only override what you are interested in. For example,
 * this comes in handy when you have to create on the fly a target for a particular behavior.
 *
 * @param <T> Type of vector, either 2D or 3D, implementing the {@link Vector} interface
 *
 * @author davebaol
 */
class SteerableAdapter<T extends Vector<T>> implements Steerable<T> {
  public getZeroLinearSpeedThreshold(): number {
    return 0.001;
  }

  public setZeroLinearSpeedThreshold(value: number): void {
    return undefined;
  }

  public getMaxLinearSpeed(): number {
    return 0;
  }

  public setMaxLinearSpeed (maxLinearSpeed: number): void {
    return undefined;
  }

  public getMaxLinearAcceleration(): number {
    return 0;
  }

  public setMaxLinearAcceleration (maxLinearAcceleration: number): void {
    return undefined;
  }

  public getMaxAngularSpeed(): number {
    return 0;
  }

  public setMaxAngularSpeed (maxAngularSpeed: number): void {
    return undefined;
  }

  public getMaxAngularAcceleration(): number {
    return 0;
  }

  public setMaxAngularAcceleration (maxAngularAcceleration: number): void {
    return undefined;
  }

  public getPosition(): T {
    return null;
  }

  public getOrientation(): number {
    return 0;
  }

  public setOrientation(orientation: number): void {
    return undefined;
  }

  public getLinearVelocity(): T {
    return null;
  }

  public getAngularVelocity(): number {
    return 0;
  }

  public getBoundingRadius(): number {
    return 0;
  }

  public isTagged(): boolean {
    return false;
  }

  public setTagged(tagged: boolean): void {
    return undefined;
  }

  public newLocation(): Location<T> {
    return null;
  }

  public vectorToAngle(vector: T): number {
    return 0;
  }

  public angleToVector (outVector: T, angle: number): T {
    return null;
  }
}

export default SteerableAdapter;
