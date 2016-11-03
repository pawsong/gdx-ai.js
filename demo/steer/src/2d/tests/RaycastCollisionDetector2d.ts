import PIXI = require('pixi.js');
import Vector2 from 'gdx-ai/lib/math/Vector2';
import Collision from 'gdx-ai/lib/utils/Collision';
import Ray from 'gdx-ai/lib/utils/Ray';
import RaycastCollisionDetector from 'gdx-ai/lib/utils/RaycastCollisionDetector';
const createRay: CreateRayAABB = require('ray-aabb');

type Point = [number, number];
type AABB = [Point, Point];

interface RayAABB {
  update(rayOrigin: Point, rayDirection: Point): this;
  intersects(aabb: AABB, normal?: Point): number | boolean;
}

interface CreateRayAABB {
  (rayOrigin: Point, rayDirection: Point): RayAABB;
}

const _origin: Point = [0, 0];
const _direction: Point = [1, 0];
const _ray = createRay(_origin, _direction);
const _v0 = new Vector2();
const _normal: Point = [0, 0];

/**
 * A raycast collision detector for box2d.
 *
 * @author davebaol
 */
class RaycastCollisionDetector2d implements RaycastCollisionDetector<Vector2> {
  collidables: AABB[];

  public constructor(collidables: PIXI.Graphics[]) {
    this.collidables = collidables.map(c => <AABB> [
      [c.position.x - c.width / 2, c.position.y - c.height / 2],
      [c.position.x + c.width / 2, c.position.y + c.height / 2],
    ]);
  }

  public collides(ray: Ray<Vector2>): boolean {
    return this.findCollision(null, ray);
  }

  public findCollision(outputCollision: Collision<Vector2>, inputRay: Ray<Vector2>): boolean {
    _origin[0] = inputRay.start.x;
    _origin[1] = inputRay.start.y;

    _v0.copy(inputRay.end).sub(inputRay.start).nor();
    _direction[0] = _v0.x;
    _direction[1] = _v0.y;

    _ray.update(_origin, _direction);

    const rayDist = inputRay.start.dst(inputRay.end);
    let minDist = rayDist;

    for (const aabb of this.collidables) {
      const dist = <number> _ray.intersects(aabb, _normal);
      if (dist && minDist > dist) {
        minDist = dist;
        outputCollision.normal.x = _normal[0];
        outputCollision.normal.y = _normal[1];
      }
    }

    if (minDist === rayDist) return false;

    outputCollision.point.x = _origin[0] + minDist * _direction[0];
    outputCollision.point.y = _origin[1] + minDist * _direction[1];

    return true;
  }
}

export default RaycastCollisionDetector2d;
