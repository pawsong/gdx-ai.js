import * as THREE from 'three';
import Face from 'gdx-ai/lib/steer/behaviors/Face';
import Vector3 from 'gdx-ai/lib/math/Vector3';
import PI2 from 'gdx-ai/lib/math/PI2';
import SteeringTest3d from '../SteeringTest3d';
import SteeringActor3d from '../SteeringActor3d';

class FaceTest3d extends SteeringTest3d {
  target: SteeringActor3d;

  onCreate() {
    super.onCreate();

    const character = this.addCharacter({ independentFacing: true });
    character.setMaxAngularAcceleration(20);
    character.setMaxAngularSpeed(10);

    const target = this.target = this.addTarget();

    const faceSB = new Face<Vector3>(character, target)
      .setAlignTolerance(.01)
      .setDecelerationRadius(Math.PI)
      .setTimeToTarget(.18);

    character.setSteeringBehavior(faceSB);

    this.detailTable.add(character, 'maxAngularAcceleration', 0, 100);
    this.detailTable.add(character, 'maxAngularSpeed', 0, 30);

    const faceSBProps = {
      decelerationRadius: faceSB.getDecelerationRadius(),
      alignTolerance: faceSB.getAlignTolerance(),
      timeToTarget: faceSB.getTimeToTarget(),
    };

    this.detailTable.add(faceSBProps, 'decelerationRadius', 0, PI2).onChange((val: number) => {
      faceSB.setDecelerationRadius(val);
    });
    this.detailTable.add(faceSBProps, 'alignTolerance', 0, 1).onChange((val: number) => {
      faceSB.setAlignTolerance(val);
    });
    this.detailTable.add(faceSBProps, 'timeToTarget', 0, 1).onChange((val: number) => {
      faceSB.setTimeToTarget(val);
    });
  }

  onClick(intersect: THREE.Intersection) {
    this.target.setPosition(intersect.point.x, 0, intersect.point.z);
  }
}

export default FaceTest3d;
