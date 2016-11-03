import PIXI = require('pixi.js');
import Wander from 'gdx-ai/lib/steer/behaviors/Wander';
import Vector2 from 'gdx-ai/lib/math/Vector2';
import dat = require('dat.gui/build/dat.gui');
import SteeringTest2d from '../SteeringTest2d';
import SteeringActor2d from '../SteeringActor2d';
import * as MathUtils from '../../MathUtils';

/**
 * A class to test and experiment with the {@link Wander} behavior.
 *
 * @autor davebaol
 */
class WanderTest2d extends SteeringTest2d {
  character: SteeringActor2d;
  wanderSB: Wander<Vector2>;

  graphicsCircle: PIXI.Graphics;
  graphicsTarget: PIXI.Graphics;

  onCreate() {
    super.onCreate();

    const character = this.addGreenFishActor(true);
    character.setMaxLinearAcceleration(50);
    character.setMaxLinearSpeed(80);
    character.setMaxAngularAcceleration(10); // greater than 0 because independent facing is enabled
    character.setMaxAngularSpeed(5);

    this.wanderSB = new Wander<Vector2>(character, this.getDeltaTime) //
      .setFaceEnabled(true) // We want to use Face internally (independent facing is on)
      .setAlignTolerance(0.001) // Used by Face
      .setDecelerationRadius(5) // Used by Face
      .setTimeToTarget(0.1) // Used by Face
      .setWanderOffset(90) //
      .setWanderOrientation(10) //
      .setWanderRadius(40) //
      .setWanderRate(MathUtils.PI2 * 4);
    character.setSteeringBehavior(this.wanderSB);

    character.setPosition(
      SteeringTest2d.renderer.width / 2,
      SteeringTest2d.renderer.height / 2
    );

    this.graphicsCircle = new PIXI.Graphics();
    this.graphicsCircle.lineStyle(2, 0x00FF00, 1);
    this.graphicsCircle.drawCircle(0, 0, this.wanderSB.getWanderRadius());
    this.stage.addChild(this.graphicsCircle);

    this.graphicsTarget = new PIXI.Graphics();
    this.graphicsTarget.beginFill(0xFF0000); // Red
    this.graphicsTarget.drawCircle(0, 0, 4);
    this.graphicsTarget.endFill();
    this.stage.addChild(this.graphicsTarget);
  }

  onRender() {
    const center = this.wanderSB.getWanderCenter();
    this.graphicsCircle.position.x = center.x;
    this.graphicsCircle.position.y = center.y;

    const target = this.wanderSB.getInternalTargetPosition();
    this.graphicsTarget.position.x = target.x;
    this.graphicsTarget.position.y = target.y;

    super.onRender();
  }
}

export default WanderTest2d;
