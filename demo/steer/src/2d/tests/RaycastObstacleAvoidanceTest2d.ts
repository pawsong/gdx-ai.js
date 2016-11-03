import PIXI = require('pixi.js');
import Vector2 from 'gdx-ai/lib/math/Vector2';
import randomTriangular from 'gdx-ai/lib/math/randomTriangular';
import RayConfigurationBase from 'gdx-ai/lib/steer/utils/rays/RayConfigurationBase';
import SingleRayConfiguration from 'gdx-ai/lib/steer/utils/rays/SingleRayConfiguration';
import ParallelSideRayConfiguration from 'gdx-ai/lib/steer/utils/rays/ParallelSideRayConfiguration';
import CentralRayWithWhiskersConfiguration from 'gdx-ai/lib/steer/utils/rays/CentralRayWithWhiskersConfiguration';
import PrioritySteering from 'gdx-ai/lib/steer/behaviors/PrioritySteering';
import Wander from 'gdx-ai/lib/steer/behaviors/Wander';
import RaycastObstacleAvoidance from 'gdx-ai/lib/steer/behaviors/RaycastObstacleAvoidance';
import LinearAccelerationLimiter from 'gdx-ai/lib/steer/limiters/LinearAccelerationLimiter';
import * as MathUtils from '../../MathUtils';
import createRandomWalls from '../utils/createRandomWalls';
import SteeringTest2d from '../SteeringTest2d';
import RaycastCollisionDetector2d from './RaycastCollisionDetector2d';

/**
 * A class to test and experiment with the {@link RaycastObstacleAvoidance} behavior.
 *
 * @autor davebaol
 */
class Scene2dRaycastObstacleAvoidanceTest extends SteeringTest2d {
  rayConfigurationIndex: number;
  rayConfigurations: RayConfigurationBase<Vector2>[];

  graphicsRays: PIXI.Graphics[];

  public onCreate() {
    super.onCreate();

    this.graphicsRays = [];

    const walls = createRandomWalls(8);
    walls.forEach(wall => this.stage.addChild(wall));

    const character = this.addGreenFishActor();
    character.setPosition(30, 30);
    character.setMaxLinearSpeed(100);
    character.setMaxLinearAcceleration(350);

    const localRayConfigurations = [
      new SingleRayConfiguration<Vector2>(character, 100),
      new ParallelSideRayConfiguration<Vector2>(character, 100, character.getBoundingRadius()),
      new CentralRayWithWhiskersConfiguration<Vector2>(character, 100, 40, 35 * MathUtils.degreesToRadians),
    ];

    this.rayConfigurations = localRayConfigurations;
    this.rayConfigurationIndex = 0;
    const raycastCollisionDetector = new RaycastCollisionDetector2d(walls);
    const raycastObstacleAvoidanceSB = new RaycastObstacleAvoidance<Vector2>(
      character, this.rayConfigurations[this.rayConfigurationIndex], raycastCollisionDetector, 40
    );

    const wanderSB = new Wander<Vector2>(character, this.getDeltaTime)
      // Don't use Face internally because independent facing is off
      .setFaceEnabled(false) //
      // We don't need a limiter supporting angular components because Face is not used
      // No need to call setAlignTolerance, setDecelerationRadius and setTimeToTarget for the same reason
      .setLimiter(new LinearAccelerationLimiter(30)) //
      .setWanderOffset(60) //
      .setWanderOrientation(10) //
      .setWanderRadius(40) //
      .setWanderRate(MathUtils.PI2 * 4);

    const prioritySteeringSB = new PrioritySteering<Vector2>(character, 0.0001) //
      .add(raycastObstacleAvoidanceSB) //
      .add(wanderSB);

    character.setSteeringBehavior(prioritySteeringSB);

    this.detailTable.add(this, 'rayConfigurationIndex', {
      'Single Ray': 0,
      'Parallel Side Rays': 1,
      'Central Ray with Whiskers': 2,
    }).onChange((val: number) => {
      raycastObstacleAvoidanceSB.setRayConfiguration(this.rayConfigurations[this.rayConfigurationIndex]);
      this.resetRays();
    });
    this.resetRays();
  }

  onRender() {
    this.updateRays();
    super.onRender();
  }

  private resetRays() {
    this.graphicsRays.forEach(graphics => graphics.destroy());

    const rays = this.rayConfigurations[this.rayConfigurationIndex].getRays();

    this.graphicsRays = rays.map(() => {
      const graphics = new PIXI.Graphics();
      this.stage.addChild(graphics);
      return graphics;
    });
  }

  private updateRays() {
    const rays = this.rayConfigurations[this.rayConfigurationIndex].getRays();
    for (let i = 0, len = rays.length; i < len; ++i) {
      const ray = rays[i];
      const graphics = this.graphicsRays[i];
      graphics.clear();
      graphics.lineStyle(2, 0xFF0000, 1);
      graphics.moveTo(ray.start.x, ray.start.y);
      graphics.lineTo(ray.end.x, ray.end.y);
    }
  }
}

export default Scene2dRaycastObstacleAvoidanceTest;
