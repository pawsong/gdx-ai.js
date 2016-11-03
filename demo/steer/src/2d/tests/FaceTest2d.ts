import Face from 'gdx-ai/lib/steer/behaviors/Face';
import Vector2 from 'gdx-ai/lib/math/Vector2';
import SteeringTest2d from '../SteeringTest2d';
import * as MathUtils from '../../MathUtils';

/**
 * A class to test and experiment with the {@link Face} behavior.
 *
 * @autor davebaol
 */
class FaceTest2d extends SteeringTest2d {

  onCreate() {
    super.onCreate();

    const character = this.addBadlogicActor(true);
    character.setMaxAngularAcceleration(100);
    character.setMaxAngularSpeed(15);

    const target = this.addTargetActor();

    const faceSB = new Face<Vector2>(character, target)
      .setTimeToTarget(0.1)
      .setAlignTolerance(0.001)
      .setDecelerationRadius(MathUtils.degreesToRadians * 180);
    character.setSteeringBehavior(faceSB);
  }
}

export default FaceTest2d;
