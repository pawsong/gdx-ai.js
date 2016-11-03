import * as THREE from 'three';
import Vector3 from 'gdx-ai/lib/math/Vector3';
import PrioritySteering from 'gdx-ai/lib/steer/behaviors/PrioritySteering';
import RaycastObstacleAvoidance from 'gdx-ai/lib/steer/behaviors/RaycastObstacleAvoidance';
import Wander from 'gdx-ai/lib/steer/behaviors/Wander';
import RayConfigurationBase from 'gdx-ai/lib/steer/utils/rays/RayConfigurationBase';
import SingleRayConfiguration from 'gdx-ai/lib/steer/utils/rays/SingleRayConfiguration';
import ParallelSideRayConfiguration from 'gdx-ai/lib/steer/utils/rays/ParallelSideRayConfiguration';
import CentralRayWithWhiskersConfiguration from 'gdx-ai/lib/steer/utils/rays/CentralRayWithWhiskersConfiguration';
import LinearAccelerationLimiter from 'gdx-ai/lib/steer/limiters/LinearAccelerationLimiter';
import * as MathUtils from '../../MathUtils';
import RaycastCollisionDetector3d from './RaycastCollisionDetector3d';
import SteeringTest3d from '../SteeringTest3d';
import SteeringActor3d from '../SteeringActor3d';

const pz = new THREE.Vector3(0, 0, 1);
const v0 = new THREE.Vector3(0, 0, 1);

/**
 * A class to test and experiment with the {@link RaycastObstacleAvoidance} behavior.
 * @author Daniel Holderbaum
 * @author davebaol
 */
class RaycastObstacleAvoidanceTest3d extends SteeringTest3d {
  rayConfigurationIndex: number;
  rayConfigurations: RayConfigurationBase<Vector3>[];
  raycastObstacleAvoidanceSB: RaycastObstacleAvoidance<Vector3>;
  wanderSB: Wander<Vector3>;

  drawDebug: boolean;

  character: SteeringActor3d;

  private rayLines: THREE.Line[];

  private rayGeometry: THREE.Geometry;
  private rayMaterial: THREE.LineBasicMaterial;

  onCreate() {
    super.onCreate();
    this.drawDebug = true;

    const walls = createWalls();
    walls.forEach(wall => this.scene.add(wall));

    const character = this.addCharacter({ collidables: walls });
    character.setMaxLinearAcceleration(100);
    character.setMaxLinearSpeed(10);

    const rayLength = 6;
    this.rayConfigurations = [
      new SingleRayConfiguration<Vector3>(character, rayLength),
      new ParallelSideRayConfiguration<Vector3>(character, rayLength, character.getBoundingRadius()),
      new CentralRayWithWhiskersConfiguration<Vector3>(character, rayLength, rayLength / 2, 35 * MathUtils.degreesToRadians),
    ];

    this.rayConfigurationIndex = 0;
    const raycastCollisionDetector = new RaycastCollisionDetector3d(walls);
    const raycastObstacleAvoidanceSB = new RaycastObstacleAvoidance<Vector3>(
      character, this.rayConfigurations[this.rayConfigurationIndex], raycastCollisionDetector, 7,
    );

    const wanderSB = this.wanderSB = new Wander<Vector3>(character, this.getDeltaTime)
      // Don't use Face internally because independent facing is off
      .setFaceEnabled(false)
      // We don't need a limiter supporting angular components because Face is disabled
      // No need to call setAlignTolerance, setDecelerationRadius and setTimeToTarget for the same reason
      .setLimiter(new LinearAccelerationLimiter(10))
      .setWanderOffset(10)
      .setWanderOrientation(1)
      .setWanderRadius(8)
      .setWanderRate(MathUtils.PI2 * 3.5);

    const prioritySteeringSB = new PrioritySteering<Vector3>(character, 0.00001)
      .add(raycastObstacleAvoidanceSB)
      .add(wanderSB);

    character.setSteeringBehavior(prioritySteeringSB);

    this.rayGeometry = new THREE.Geometry();
    this.rayGeometry.vertices.push(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 1),
    );
    this.rayMaterial = new THREE.LineBasicMaterial({ linewidth: 3, color: 0xffff00 });

    this.detailTable.add(this, 'rayConfigurationIndex', {
      'Single Ray': 0,
      'Parallel Side Rays': 1,
      'Central Ray with Whiskers': 2,
    }).onChange((val: number) => {
      raycastObstacleAvoidanceSB.setRayConfiguration(this.rayConfigurations[this.rayConfigurationIndex]);
      this.resetRayLines();
    });

    this.rayLines = [];
    this.resetRayLines();

    this.character = character;
  }

  onRender() {
    this.updateRayLines();
    super.onRender();
  }

  private resetRayLines() {
    this.rayLines.forEach(line => this.scene.remove(line));

    const rays = this.rayConfigurations[this.rayConfigurationIndex].getRays();
    this.rayLines = rays.map(ray => {
      const line = new THREE.Line(this.rayGeometry, this.rayMaterial);
      this.scene.add(line);
      return line;
    });
  }

  private updateRayLines() {
    const rays = this.rayConfigurations[this.rayConfigurationIndex].getRays();

    for (let i = 0, len = rays.length; i < len; ++i) {
      const ray = rays[i];
      const dst = ray.start.dst(ray.end);
      if (dst === 0) continue;

      const line = this.rayLines[i];
      line.scale.set(1, 1, dst);
      line.quaternion.setFromUnitVectors(pz, v0.set(
        ray.end.x - ray.start.x,
        ray.end.y - ray.start.y,
        ray.end.z - ray.start.z,
      ).normalize());
      line.position.set(ray.start.x, ray.start.y, ray.start.z);
    }
  }
}

function createWalls(): THREE.Mesh[] {
  const sides = Math.floor(MathUtils.random(4, 12));
  const angle = MathUtils.PI2 / sides;

  const radius = 20;
  const width = 2 * radius * Math.tan(angle / 2);

  const walls: THREE.Mesh[] = [];
  const geometry = new THREE.BoxGeometry(width, 10, 1);
  geometry.translate(0, 0, radius);

  for (let i = 0; i < sides; i++) {
    const material = new THREE.MeshBasicMaterial();
    material.color.setRGB(MathUtils.random(0.25, 0.75), MathUtils.random(0.25, 0.75), MathUtils.random(0.25, 0.75));
    const wall = new THREE.Mesh(geometry, material);
    wall.rotateY(angle * i);
    walls.push(wall);
  }
  return walls;
}

export default RaycastObstacleAvoidanceTest3d;
