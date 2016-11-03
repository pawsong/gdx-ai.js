import { vec2, mat3 } from 'gl-matrix';
import FollowPath from 'gdx-ai/lib/steer/behaviors/FollowPath';
import Vector2 from 'gdx-ai/lib/math/Vector2';
import Vector3 from 'gdx-ai/lib/math/Vector3';
import LinePath, { LinePathParam } from 'gdx-ai/lib/steer/utils/paths/LinePath';
import dat = require('dat.gui/build/dat.gui');
import SteeringTest3d from '../SteeringTest3d';
import SteeringActor3d from '../SteeringActor3d';
import * as MathUtils from '../../MathUtils';

const tmpVector2 = vec2.create();
const tmpMatrix3 = mat3.create();

/** Creates a random path which is bound by rectangle described by the min/max values */
function createRandomPath(
  numWaypoints: number, minX: number, minY: number, maxX: number, maxY: number, height: number
): Array<Vector3> {
  const wayPoints = new Array<Vector3>();

  const midX = (maxX + minX) / 2;
  const midY = (maxY + minY) / 2;

  const smaller = Math.min(midX, midY);

  const spacing = MathUtils.PI2 / numWaypoints;

  for (let i = 0; i < numWaypoints; i++) {
    const radialDist = MathUtils.random(smaller * 0.2, smaller);
    vec2.set(tmpVector2, radialDist, 0.0);

    // rotates the specified vector angle rads around the origin
    // init and rotate the transformation matrix
    mat3.fromRotation(tmpMatrix3, i * spacing);
    // now transform the object's vertices
    vec2.transformMat3(tmpVector2, tmpVector2, tmpMatrix3);

    const point = new Vector3();
    point.set(tmpVector2[0], height, tmpVector2[1]);
    wayPoints.push(point);
  }

  return wayPoints;
}

function createPathMesh(wayPoints: Vector3[], closed: boolean) {
  const pathPoints = [];
  for (const point of wayPoints) {
    pathPoints.push(new THREE.Vector2(point.z, point.x));
  }

  if (closed) {
    const point = wayPoints[0];
    pathPoints.push(new THREE.Vector2(point.z, point.x));
  }

  const shape = new THREE.Shape(pathPoints);
  const geometry = shape.createPointsGeometry(12);
  geometry.rotateY(- Math.PI / 2);
  geometry.rotateZ(- Math.PI / 2);

  const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xf08000, linewidth: 3 }));
  line.position.set(0, 1, 0);

  return line;
}

interface FollowPathProps {
  pathOffset: number;
  predictionTime: number;
  drawPath: boolean;
  decelerationRadius: number;
  arrivalTolerance: number;
}

/**
 * A class to test and experiment with the {@link FollowPath} behavior.
 * @author Daniel Holderbaum
 */
class FollowPathTest3d extends SteeringTest3d {
  openPath: boolean;
  detailTable: dat.GUI;
  linePath: LinePath<Vector3>;
  followPathSB: FollowPath<Vector3, LinePathParam>;
  character: SteeringActor3d;
  pathOffsetController: dat.GUIController;
  followPathSBProps: FollowPathProps;

  constructor(openPath: boolean) {
    super();
    this.openPath = openPath;
  }

  onCreate() {
    super.onCreate();

    const character = this.character = this.addCharacter();

    character.setMaxLinearAcceleration(100);
    character.setMaxLinearSpeed(15);

    const wayPoints = createRandomPath(MathUtils.random(4, 16), 20, 20, 30, 30, 0);

    this.linePath = new LinePath<Vector3>(wayPoints, this.openPath);
    const followPathSB = this.followPathSB = new FollowPath<Vector3, LinePathParam>(character, this.linePath, 3)
      // Setters below are only useful to arrive at the end of an open path
      .setTimeToTarget(0.1) //
      .setArrivalTolerance(0.5) //
      .setDecelerationRadius(3);
    character.setSteeringBehavior(followPathSB);

    const firstPoint = wayPoints[0];
    character.setPosition(firstPoint.x, 0, firstPoint.z);

    const pathMesh = createPathMesh(wayPoints, !this.openPath);
    this.scene.add(pathMesh);

    const followPathSBProps = this.followPathSBProps = {
      pathOffset: followPathSB.getPathOffset(),
      predictionTime: followPathSB.getPredictionTime(),
      drawPath: true,
      decelerationRadius: followPathSB.getDecelerationRadius(),
      arrivalTolerance: followPathSB.getArrivalTolerance(),
    };

    this.pathOffsetController = this.detailTable.add(followPathSBProps, 'pathOffset', -15, +15);
    this.pathOffsetController.onChange((val: number) => {
      followPathSB.setPathOffset(val);
    });

    this.detailTable.add(character, 'maxLinearSpeed', 0, 50);
    this.detailTable.add(character, 'maxLinearAcceleration', 0, 200);

    this.detailTable.add(followPathSBProps, 'predictionTime', 0, 3).onChange((val: number) => {
      followPathSB.setPredictionTime(val);
    });

    this.detailTable.add(followPathSBProps, 'drawPath').onChange((val: number) => {
      if (val) {
        this.scene.add(pathMesh);
      } else {
        this.scene.remove(pathMesh);
      }
    });

    // Add controls to arrive at the end of an open path
    if (this.openPath) {
      this.detailTable.add(followPathSBProps, 'decelerationRadius', 0, 15).onChange((val: number) => {
        followPathSB.setDecelerationRadius(val);
      });

      this.detailTable.add(followPathSBProps, 'arrivalTolerance', 0, 1).onChange((val: number) => {
        followPathSB.setArrivalTolerance(val);
      });
    }
  }

  onUpdate(dt: number) {
    super.onUpdate(dt);

    if (this.openPath) {
      // Once arrived at an extremity of the path we want to go the other way around
      const extremity = this.followPathSB.getPathOffset() >= 0
        ? this.linePath.getEndPoint() : this.linePath.getStartPoint();

      const tolerance = this.followPathSB.getArrivalTolerance();
      if (this.character.getPosition().dst2(extremity) < tolerance * tolerance) {
        const nextPathOffset = - this.followPathSB.getPathOffset();
        this.followPathSB.setPathOffset(nextPathOffset);
        this.followPathSBProps.pathOffset = nextPathOffset;
        this.pathOffsetController.updateDisplay();
      }
    }
  }
}

export default FollowPathTest3d;
