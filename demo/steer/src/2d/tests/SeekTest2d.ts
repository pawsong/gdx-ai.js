import Seek from 'gdx-ai/lib/steer/behaviors/Seek';
import Vector2 from 'gdx-ai/lib/math/Vector2';
import SteeringTest2d from '../SteeringTest2d';

/**
 * A class to test and experiment with the {@link Seek} behavior.
 *
 * @autor davebaol
 */
class SeekTest2d extends SteeringTest2d {

  public onCreate() {
    super.onCreate();

    const character = this.addBadlogicActor();
    character.setMaxLinearSpeed(250);
    character.setMaxLinearAcceleration(2000);

    const target =this.addTargetActor();

    const seekSB = new Seek<Vector2>(character, target);
    character.setSteeringBehavior(seekSB);
  }
}

export default SeekTest2d;
