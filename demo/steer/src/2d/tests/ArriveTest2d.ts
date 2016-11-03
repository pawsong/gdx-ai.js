import Arrive from 'gdx-ai/lib/steer/behaviors/Arrive';
import Vector2 from 'gdx-ai/lib/math/Vector2';
import SteeringTest2d from '../SteeringTest2d';

/**
 * A class to test and experiment with the {@link Arrive} behavior.
 *
 * @autor davebaol
 */
class ArriveTest2d extends SteeringTest2d {

  public onCreate(): void {
    super.onCreate();

    const character = this.addBadlogicActor();
    character.setMaxLinearSpeed(100);
    character.setMaxLinearAcceleration(300);

    const target = this.addTargetActor();

    const arriveSB = new Arrive<Vector2>(character, target)
      .setTimeToTarget(0.1)
      .setArrivalTolerance(0.001)
      .setDecelerationRadius(80);
    character.setSteeringBehavior(arriveSB);

    const arriveSBProps = {
      decelerationRadius: arriveSB.getDecelerationRadius(),
      arrivalTolerance: arriveSB.getArrivalTolerance(),
      timeToTarget: arriveSB.getTimeToTarget(),
    };

    this.detailTable.add(character, 'maxLinearAcceleration', 0, 2000);
    this.detailTable.add(character, 'maxLinearSpeed', 0, 300);

    this.detailTable.add(arriveSBProps, 'decelerationRadius', 0, 150).onChange((val: number) => {
      arriveSB.setDecelerationRadius(val);
    });

    this.detailTable.add(arriveSBProps, 'arrivalTolerance', 0, 1).onChange((val: number) => {
      arriveSB.setArrivalTolerance(val);
    });

    this.detailTable.add(arriveSBProps, 'timeToTarget', 0, 3).onChange((val: number) => {
      arriveSB.setTimeToTarget(val);
    });
  }
}

export default ArriveTest2d;
