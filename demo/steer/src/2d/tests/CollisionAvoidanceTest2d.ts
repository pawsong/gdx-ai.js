import PIXI = require('pixi.js');
import Vector2 from 'gdx-ai/lib/math/Vector2';
import Wander from 'gdx-ai/lib/steer/behaviors/Wander';
import PrioritySteering from 'gdx-ai/lib/steer/behaviors/PrioritySteering';
import CollisionAvoidance from 'gdx-ai/lib/steer/behaviors/CollisionAvoidance';
import LinearAccelerationLimiter from 'gdx-ai/lib/steer/limiters/LinearAccelerationLimiter';
import RadiusProximity from 'gdx-ai/lib/steer/proximities/RadiusProximity';
import * as MathUtils from '../../MathUtils';
import SteeringTest2d from '../SteeringTest2d';
import SteeringActor2d from '../SteeringActor2d';

/**
 * A class to test and experiment with the {@link CollisionAvoidance} behavior.
 *
 * @autor davebaol
 */
class CollisionAvoidanceTest2d extends SteeringTest2d {
  char0: SteeringActor2d;

  graphicsCircle: PIXI.Graphics;

  onCreate () {
    super.onCreate();

    const characters = new Array<SteeringActor2d>();
    const proximities = new Array<RadiusProximity<Vector2>>();

    for (let i = 0; i < 60; i++) {
      const character = this.addGreenFishActor();
      character.setMaxLinearSpeed(50);
      character.setMaxLinearAcceleration(100);

      const proximity = new RadiusProximity<Vector2>(
        character, characters, character.getBoundingRadius() * 4, this.getTickId,
      );
      proximities.push(proximity);

      const collisionAvoidanceSB = new CollisionAvoidance<Vector2>(character, proximity);

      const wanderSB = new Wander<Vector2>(character, this.getDeltaTime)
        // Don't use Face internally because independent facing is off
        .setFaceEnabled(false)
        // We don't need a limiter supporting angular components because Face is not used
        // No need to call setAlignTolerance, setDecelerationRadius and setTimeToTarget for the same reason
        .setLimiter(new LinearAccelerationLimiter(30))
        .setWanderOffset(60)
        .setWanderOrientation(0)
        .setWanderRadius(40)
        .setWanderRate(MathUtils.PI2 * 4);

      const prioritySteeringSB = new PrioritySteering<Vector2>(character, 0.0001);
      prioritySteeringSB.add(collisionAvoidanceSB);
      prioritySteeringSB.add(wanderSB);

      character.setSteeringBehavior(prioritySteeringSB);

      this.setRandomNonOverlappingPosition(character, characters, 5);
      this.setRandomOrientation(character);

      characters.push(character);
    }

    this.char0 = characters[0];
    const char0Proximity = proximities[0];

    this.graphicsCircle = new PIXI.Graphics();
    this.graphicsCircle.lineStyle(2, 0x00FF00, 1);
    this.graphicsCircle.drawCircle(0, 0, char0Proximity.getRadius());
    this.stage.addChild(this.graphicsCircle);
  }

  onRender() {
    this.graphicsCircle.position.x = this.char0.position.x;
    this.graphicsCircle.position.y = this.char0.position.y;
    super.onRender();
  }
}

export default CollisionAvoidanceTest2d;
