import * as THREE from 'three';
import Vector3 from 'gdx-ai/lib/math/Vector3';
import Collision from 'gdx-ai/lib/utils/Collision';
import Ray from 'gdx-ai/lib/utils/Ray';
import RaycastCollisionDetector from 'gdx-ai/lib/utils/RaycastCollisionDetector';

const origin = new THREE.Vector3();
const direction = new THREE.Vector3();

/**
 * A 3D {@link RaycastCollisionDetector} to be used with bullet physics. It reports the closest collision which is not the
 * supplied "me" collision object.
 * @author Daniel Holderbaum
 * @author davebaol
 */
class RaycastCollisionDetector3d implements RaycastCollisionDetector<Vector3> {
  private collidables: THREE.Object3D[];
  private raycaster: THREE.Raycaster;

  public constructor(collidables: THREE.Object3D[]) {
    this.collidables = collidables;
    this.raycaster = new THREE.Raycaster();
  }

  public collides(ray: Ray<Vector3>): boolean {
    return this.findCollision(null, ray);
  }

  public findCollision(outputCollision: Collision<Vector3>, inputRay: Ray<Vector3>): boolean {
    this.raycaster.set(
      origin.set(inputRay.start.x, inputRay.start.y, inputRay.start.z),
      direction.set(
        inputRay.end.x - inputRay.start.x,
        inputRay.end.y - inputRay.start.y,
        inputRay.end.z - inputRay.start.z,
      ).normalize(),
    );
    this.raycaster.far = inputRay.start.dst(inputRay.end);

    const [intersect] = this.raycaster.intersectObjects(this.collidables);
    if (!intersect) return false;

    if (outputCollision != null) {
      outputCollision.point.set(
        intersect.point.x,
        intersect.point.y,
        intersect.point.z,
      );
      outputCollision.normal.set(
        intersect.face.normal.x,
        intersect.face.normal.y,
        intersect.face.normal.z,
      );
    }

    return true;
  }
}

export default RaycastCollisionDetector3d;
