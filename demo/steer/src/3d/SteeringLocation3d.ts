import Vector3 from 'gdx-ai/lib/math/Vector3';
import Location from 'gdx-ai/lib/utils/Location';
import * as SteeringUtils3d from './SteeringUtils3d';

class SteeringLocation3d implements Location<Vector3> {
  position: Vector3;
  orientation: number;

  constructor() {
    this.position = new Vector3();
    this.orientation = 0;
  }

  public getPosition(): Vector3 {
    return this.position;
  }

  public getOrientation(): number {
    return this.orientation;
  }

  public setOrientation(orientation: number): void {
    this.orientation = orientation;
  }

  public newLocation(): Location<Vector3>  {
    return new SteeringLocation3d();
  }

  public vectorToAngle(vector: Vector3): number {
    return SteeringUtils3d.vectorToAngle(vector);
  }

  public angleToVector(outVector: Vector3, angle: number): Vector3 {
    return SteeringUtils3d.angleToVector(outVector, angle);
  }
}

export default SteeringLocation3d;
