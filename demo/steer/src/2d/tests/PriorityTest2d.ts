import PIXI = require('pixi.js');
import RayConfigurationBase from 'gdx-ai/lib/steer/utils/rays/RayConfigurationBase';
import SingleRayConfiguration from 'gdx-ai/lib/steer/utils/rays/SingleRayConfiguration';
import ParallelSideRayConfiguration from 'gdx-ai/lib/steer/utils/rays/ParallelSideRayConfiguration';
import CentralRayWithWhiskersConfiguration from 'gdx-ai/lib/steer/utils/rays/CentralRayWithWhiskersConfiguration';
import Seek from 'gdx-ai/lib/steer/behaviors/Seek';
import PrioritySteering from 'gdx-ai/lib/steer/behaviors/PrioritySteering';
import Vector2 from 'gdx-ai/lib/math/Vector2';
import RaycastObstacleAvoidance from 'gdx-ai/lib/steer/behaviors/RaycastObstacleAvoidance';
import * as MathUtils from '../../MathUtils';
import createRandomWalls from '../utils/createRandomWalls';
import SteeringTest2d from '../SteeringTest2d';
import RaycastCollisionDetector2d from './RaycastCollisionDetector2d';

/**
 * A class to test and experiment with the {@link Seek} behavior.
 *
 * @autor davebaol
 */
class PriorityTest2d extends SteeringTest2d {

  rayConfigurationIndex: number;
  rayConfigurations: RayConfigurationBase<Vector2>[];

  graphicsRays: PIXI.Graphics[];

  public onCreate() {
    super.onCreate();

    this.graphicsRays = [];

    const character = this.addBadlogicActor();
    character.setPosition(30, 30);
    character.setMaxLinearSpeed(100);
    character.setMaxLinearAcceleration(350);

    const target = this.addTargetActor();

    const walls = createRandomWalls(8);
    walls.forEach(wall => this.stage.addChild(wall));

    const seekSB = new Seek<Vector2>(character, target);

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

    const prioritySteeringSB = new PrioritySteering<Vector2>(character, 0.0001);
    prioritySteeringSB.add(raycastObstacleAvoidanceSB);
    prioritySteeringSB.add(seekSB);

    character.setSteeringBehavior(prioritySteeringSB);

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

export default PriorityTest2d;
