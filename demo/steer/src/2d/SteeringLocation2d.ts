import Vector2 from 'gdx-ai/lib/math/Vector2';
import Location from 'gdx-ai/lib/utils/Location';
import * as SteeringUtils2d from './SteeringUtils2d';

class SteeringLocation2d implements Location<Vector2> {
  position: Vector2;
  orientation: number;

  constructor() {
    this.position = new Vector2();
    this.orientation = 0;
  }

  public getPosition(): Vector2 {
    return this.position;
  }

  public getOrientation() {
    return this.orientation;
  }

  public setOrientation(orientation: number) {
    this.orientation = orientation;
  }

  public newLocation(): Location<Vector2> {
    return new SteeringLocation2d();
  }

  public vectorToAngle(vector: Vector2): number {
    return SteeringUtils2d.vectorToAngle(vector);
  }

  public angleToVector (outVector: Vector2, angle: number): Vector2 {
    return SteeringUtils2d.angleToVector(outVector, angle);
  }
}

export default SteeringLocation2d;
