import * as THREE from 'three';
import LookWhereYouAreGoing from 'gdx-ai/lib/steer/behaviors/LookWhereYouAreGoing';
import Arrive from 'gdx-ai/lib/steer/behaviors/Arrive';
import BlendedSteering from 'gdx-ai/lib/steer/behaviors/BlendedSteering';
import Vector3 from 'gdx-ai/lib/math/Vector3';
import { NEUTRAL_LIMITER } from 'gdx-ai/lib/steer/limiters/NullLimiter';
import SteeringTest3d from '../SteeringTest3d';
import SteeringActor3d from '../SteeringActor3d';

/**
 * A class to test and experiment with the {@link LookWhereYouAreGoing} behavior.
 *
 * @autor davebaol
 */
class LookWhereYouAreGoing3d extends SteeringTest3d {
  target: SteeringActor3d;

  onCreate() {
    super.onCreate();

    // Create character
    const character = this.addCharacter({ independentFacing: true });
    character.setMaxLinearAcceleration(500);
    character.setMaxLinearSpeed(5);
    character.setMaxAngularAcceleration(50);
    character.setMaxAngularSpeed(10);

    const target = this.target = this.addTarget();

    const lookWhereYouAreGoingSB = new LookWhereYouAreGoing<Vector3>(character)
      .setAlignTolerance(.005)
      .setDecelerationRadius(Math.PI)
      .setTimeToTarget(.1);

    const arriveSB = new Arrive<Vector3>(character, target)
      .setTimeToTarget(0.1)
      .setArrivalTolerance(0.0002)
      .setDecelerationRadius(3);

    const blendedSteering = new BlendedSteering<Vector3>(character) //
      .setLimiter(NEUTRAL_LIMITER) //
      .add(arriveSB, 1) //
      .add(lookWhereYouAreGoingSB, 1);

    character.setSteeringBehavior(blendedSteering);
  }

  protected onClick(intersect: THREE.Intersection) {
    this.target.setPosition(intersect.point.x, 0, intersect.point.z);
  }
}

export default LookWhereYouAreGoing3d;
