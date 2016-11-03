import PIXI = require('pixi.js');
import dat = require('dat.gui/build/dat.gui');
import Vector2 from 'gdx-ai/lib/math/Vector2';

import * as MathUtils from '../MathUtils';
import SteeringTestBase from '../SteeringTestBase';
import SteeringActor2d from './SteeringActor2d';

const badlogicSmall = require('file!../../../data/badlogicsmall.jpg');
const greenFish = require('file!../../../data/green_fish.png');
const target = require('file!../../../data/target.png');

// Singleton PIXI renderer
const renderer = PIXI.autoDetectRenderer(SteeringTestBase.CANVAS_WIDTH, SteeringTestBase.CANVAS_HEIGHT, {
  backgroundColor : SteeringTestBase.CANVAS_BG_COLOR,
});
renderer.view.classList.add('canvas');
renderer.view.classList.add('hide');
document.body.appendChild(renderer.view);

/**
 * Base class for scene2d steering behavior tests.
 *
 * @author davebaol
 */
abstract class SteeringTest2d extends SteeringTestBase<Vector2> {
  static renderer = renderer;

  protected stage: PIXI.Container;
  protected detailTable: dat.GUI;

  private _target: SteeringActor2d;

  constructor() {
    super();
    this.stage = new PIXI.Container();
  }

  onCreate() {
    renderer.view.classList.remove('hide');
    renderer.view.addEventListener('mousedown', this.handleMoveDown);
    this.detailTable = new dat.GUI({ width: 350 });
    this.detailTable.domElement.style.marginRight = '0';
  }

  add(actor: SteeringActor2d) {
    this.addActor(actor);
    this.stage.addChild(actor.sprite);
  }

  onRender() {
    renderer.render(this.stage);
  }

  onDestroy() {
    this.detailTable.destroy();
    renderer.view.removeEventListener('mousedown', this.handleMoveDown);
    renderer.view.classList.add('hide');
  }

  addBadlogicActor(independentFacing?: boolean) {
    const actor = new SteeringActor2d(32, 32, PIXI.Texture.fromImage(badlogicSmall), independentFacing);
    actor.setPosition(SteeringTest2d.renderer.width / 2, SteeringTest2d.renderer.height / 2);

    this.add(actor);
    return actor;
  }

  addGreenFishActor(independentFacing?: boolean) {
    const actor = new SteeringActor2d(32, 32, PIXI.Texture.fromImage(greenFish), independentFacing);
    actor.setPosition(SteeringTest2d.renderer.width / 2, SteeringTest2d.renderer.height / 2);

    this.add(actor);
    return actor;
  }

  addTargetActor() {
    const actor = new SteeringActor2d(40, 40, PIXI.Texture.fromImage(target), false);
    this._target = actor;

    this._target.setPosition(
      MathUtils.random(0, SteeringTest2d.renderer.width),
      MathUtils.random(0, SteeringTest2d.renderer.height)
    );

    this.add(actor);
    return actor;
  }

  protected setRandomNonOverlappingPosition(
    character: SteeringActor2d, others: Array<SteeringActor2d>, minDistanceFromBoundary: number
  ): void {
    let maxTries = Math.max(100, others.length * others.length);
    SET_NEW_POS:
    while (--maxTries >= 0) {
      character.setPosition(Math.random() * renderer.width, Math.random() * renderer.height);
      character.position.set(character.sprite.position.x, character.sprite.position.y);

      for (let i = 0; i < others.length; i++) {
        const other = others[i];

        if (character.getPosition().dst(other.getPosition()) <=
          character.getBoundingRadius() + other.getBoundingRadius() + minDistanceFromBoundary
        ) {
          continue SET_NEW_POS;
        }
      }
      return;
    }
    throw new Error('Probable infinite loop detected');
  }

  protected setRandomOrientation(character: SteeringActor2d): void {
    const orientation = MathUtils.random(- Math.PI, Math.PI);
    character.setOrientation(orientation);
    if (!character.isIndependentFacing()) {
      // Set random initial non-zero linear velocity since independent facing is off
      character.angleToVector(character.getLinearVelocity(), orientation).scale(character.getMaxLinearSpeed() / 5);
    }
  }

  private handleMoveDown = (e: MouseEvent) => {
    if (this._target) {
      this._target.setPosition(e.offsetX, e.offsetY);
    }
  }
}

export default SteeringTest2d;
