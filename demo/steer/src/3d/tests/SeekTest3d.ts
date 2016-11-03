import * as THREE from 'three';
import Seek from 'gdx-ai/lib/steer/behaviors/Seek';
import Vector3 from 'gdx-ai/lib/math/Vector3';
import dat = require('dat.gui/build/dat.gui');
import SteeringTest3d from '../SteeringTest3d';
import SteeringActor3d from '../SteeringActor3d';

class SeekTest3d extends SteeringTest3d {
  target: SteeringActor3d;
  detailTable: dat.GUI;

  onCreate() {
    super.onCreate();

    const character = this.addCharacter();
    character.setMaxLinearSpeed(50);
    character.setMaxLinearAcceleration(200);

    const target = this.target = this.addTarget();

    const seekSB = new Seek<Vector3>(character, target);
    character.setSteeringBehavior(seekSB);

    this.detailTable.add(character, 'maxLinearAcceleration', 0, 2000);
    this.detailTable.add(character, 'maxLinearSpeed', 0, 200);
  }

  protected onClick(intersect: THREE.Intersection) {
    this.target.setPosition(intersect.point.x, 0, intersect.point.z);
  }
}

export default SeekTest3d;
