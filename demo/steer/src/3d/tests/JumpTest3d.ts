import * as THREE from 'three';
import Set = require('core-js/es6/set');
import vec2 = require('gl-matrix/src/gl-matrix/vec2');
import mat3 = require('gl-matrix/src/gl-matrix/mat3');
import FollowPath from 'gdx-ai/lib/steer/behaviors/FollowPath';
import Jump, {
  JumpDescriptor,
  JumpCallback,
  GravityComponentHandler,
} from 'gdx-ai/lib/steer/behaviors/Jump';
import Vector3 from 'gdx-ai/lib/math/Vector3';
import * as MathUtils from '../../MathUtils';
import LinePath, { LinePathParam } from 'gdx-ai/lib/steer/utils/paths/LinePath';
import LinearLimiter from 'gdx-ai/lib/steer/limiters/LinearLimiter';
import SteeringTest3d from '../SteeringTest3d';
import SteeringActor3d, { gravity } from '../SteeringActor3d';

const AB_VELOCITY_ON_TAKEOFF = 'Velocity on Takeoff';
const AB_PREDICTED_VELOCITY = 'Predicted Velocity';
const AB_CALCULATE_EXACT_VELOCITY = 'Calculate Exact Velocity';

const tmpVector2 = vec2.create();
const tmpMatrix3 = mat3.create();

const tv0 = new Vector3();

/** Creates a random path which is bound by rectangle described by the min/max values */
function createRandomPath(
  numWaypoints: number, minX: number, minY: number, maxX: number, maxY: number, height: number
): Array<Vector3> {
  const wayPoints = new Array<Vector3>(numWaypoints);

  const midX = (maxX + minX) / 2;
  const midY = (maxY + minY) / 2;

  const smaller = Math.min(midX, midY);

  const spacing = MathUtils.PI2 / (numWaypoints - 0);

  for (let i = 0; i < numWaypoints - 2; i++) {
    const radialDist = MathUtils.random(smaller * 0.2, smaller);
    vec2.set(tmpVector2, radialDist, 0.0);

    // rotates the specified vector angle rads around the origin
    // init and rotate the transformation matrix
    mat3.fromRotation(tmpMatrix3, i * spacing);
    // now transform the object's vertices
    vec2.transformMat3(tmpVector2, tmpVector2, tmpMatrix3);

    const point = new Vector3();
    point.set(tmpVector2[0], height, tmpVector2[1]);

    wayPoints[i + 1] = point;
  }

  const midpoint = wayPoints[1].clone().add(wayPoints[numWaypoints - 2]).scale(0.5);

  // Set the landing point
  wayPoints[0] = wayPoints[1].clone().add(midpoint).scale(1 / 3);
  wayPoints[0].y = height;

  // Set the takeoff point
  wayPoints[numWaypoints - 1] = midpoint.clone().add(wayPoints[numWaypoints - 2]).scale(1 / 3);
  wayPoints[numWaypoints - 1].y = height;

  return wayPoints;
}

const PATH_Y_OFFSET = 0.1;

function createPathMesh(wayPoints: Vector3[]) {
  const plen = wayPoints.length;

  // add points in an arbitrary shape
  const geometry = new THREE.Geometry();
  for (let i = 1; i < plen; ++i) {
    const p0 = wayPoints[i - 1];
    geometry.vertices[2 * i - 1] = new THREE.Vector3(p0.x, p0.y, p0.z);
    geometry.vertices[2 * i    ] = geometry.vertices[2 * i - 1];
  }

  const pf = wayPoints[0];
  const pl = wayPoints[plen - 1];
  geometry.vertices[0           ] = new THREE.Vector3(pf.x, pf.y, pf.z);
  geometry.vertices[2 * plen - 1] = new THREE.Vector3(pl.x, pl.y, pl.z);

  geometry.vertices[2 * plen    ] = new THREE.Vector3(pl.x, pl.y, pl.z);
  geometry.vertices[2 * plen + 1] = new THREE.Vector3(pf.x, pf.y, pf.z);

  for (const vertex of geometry.vertices) {
    vertex.y += PATH_Y_OFFSET;
  }

  const r = new THREE.Color(1, 0, 0);
  const g = new THREE.Color(0, 1, 0);

  for (let i = 0, len = geometry.vertices.length - 1; i < len; i += 2) {
    geometry.colors[i  ] = g;
    geometry.colors[i + 1] = g;
  }
  geometry.colors[geometry.vertices.length - 2] = r;
  geometry.colors[geometry.vertices.length - 1] = r;

  return new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({
    linewidth: 3,
    color: 0xffffff,
    vertexColors: THREE.VertexColors,
  }));
}

const GRAVITY_COMPONENT_HANDLER: GravityComponentHandler<Vector3> = {
  getComponent(vector: Vector3): number {
    return vector.y;
  },

  setComponent(vector: Vector3, value: number): void {
    vector.y = value;
  },
};

/**
 * A class to test and experiment with the {@link Jump} behavior.
 * @author davebaol
 */
class JumpTest3d extends SteeringTest3d {

  character: SteeringActor3d;
  wayPoints: Array<Vector3>;
  linePath: LinePath<Vector3>;
  followPathSB: FollowPath<Vector3, LinePathParam>;

  jumpSB: Jump<Vector3>;

  airbornePlanarVelocity = AB_VELOCITY_ON_TAKEOFF;
  runUpLength = 3.5;

  private pendingTakeoffs: Set<number>;

  onCreate() {
    super.onCreate();
    this.pendingTakeoffs = new Set<number>();

    const character = this.character = this.addCharacter();

    character.setMaxLinearAcceleration(100);
    character.setMaxLinearSpeed(5);

    const wayPoints = this.wayPoints = createRandomPath(6, 20, 20, 30, 30, 0);
    const mesh = createPathMesh(this.wayPoints);
    this.scene.add(mesh);

    this.setCharacterPositionOnPath();

    const linePath = this.linePath = new LinePath<Vector3>(wayPoints, false);
    const followPathSB = this.followPathSB = new FollowPath<Vector3, LinePathParam>(character, linePath, 0.5)
      // Setters below are only useful to arrive at the end of an open path
      .setArriveEnabled(false)
      .setTimeToTarget(0.1)
      .setArrivalTolerance(0.5)
      .setDecelerationRadius(3);

    character.setSteeringBehavior(followPathSB);

    const takeoffPoint = wayPoints[wayPoints.length - 1];
    const landingPoint = wayPoints[0];

    const jumpDescriptor = new JumpDescriptor<Vector3>(takeoffPoint, landingPoint);

    const newJumpDescriptor = new JumpDescriptor<Vector3>(new Vector3(), new Vector3());
    const jumpCallback: JumpCallback = {
      reportAchievability(achievable: boolean): void {
        // System.out.println("Jump Achievability = " + achievable);
      },

      takeoff: (maxVerticalVelocity: number, time: number): void => {
        // console.log('takeoff');
        // console.log("Take off!!!");
        // console.log("Character Velocity = " + character.getLinearVelocity().data + "; Speed = "
        //   + character.getLinearVelocity().len());
        // const h = maxVerticalVelocity * maxVerticalVelocity / (-2 * jumpSB.getGravity().y);
        // console.log("jump height = " + h);
        switch (this.airbornePlanarVelocity) {
          case AB_VELOCITY_ON_TAKEOFF: { // Use character velocity on takeoff
            character.linearVelocity.set(
              character.linearVelocity.x,
              character.linearVelocity.y + maxVerticalVelocity,
              character.linearVelocity.z,
            );
            // character.body.setLinearVelocity(character.body.getLinearVelocity().add(0, maxVerticalVelocity, 0));
            break;
          }
          case AB_PREDICTED_VELOCITY: {// Use predicted velocity. We are cheating!!!
            const targetLinearVelocity = jumpSB.getTarget().getLinearVelocity();
            character.linearVelocity.copy(
              newJumpDescriptor.takeoffPosition.set(
                targetLinearVelocity.x,
                maxVerticalVelocity,
                targetLinearVelocity.z
              )
            );
            break;
          }
          case AB_CALCULATE_EXACT_VELOCITY: {// Calculate and use exact velocity. We are shamelessly cheating!!!
            const newLinearVelocity = tv0.copy(character.linearVelocity);
            newJumpDescriptor.set(character.getPosition(), jumpSB.getJumpDescriptor().landingPosition);
            time = jumpSB.calculateAirborneTimeAndVelocity(
              newLinearVelocity, newJumpDescriptor, jumpSB.getLimiter().getMaxLinearSpeed()
            );
            newLinearVelocity.y += maxVerticalVelocity;
            character.linearVelocity.copy(newLinearVelocity);
            break;
          }
          default: {
            break;
          }
        }

        const handle = setTimeout(() => {
          this.pendingTakeoffs.delete(handle);
          // System.out.println("Switching to FollowPath");
          // System.out.println("owner.linearVelocity = " + character.getLinearVelocity() + "; owner.linearSpeed = "
          //   + character.getLinearVelocity().len());
          character.setSteeringBehavior(followPathSB);
          jumpSB.setJumpDescriptor(jumpDescriptor); // prepare for a new jump
        }, time * 1000);
        this.pendingTakeoffs.add(handle);
      },
    };

    const jumpSB = this.jumpSB = new Jump<Vector3>(character, jumpDescriptor, gravity, GRAVITY_COMPONENT_HANDLER, jumpCallback) //
      .setMaxVerticalVelocity(9) //
      .setTakeoffPositionTolerance(.3) //
      .setTakeoffVelocityTolerance(2) //
      .setTimeToTarget(.1);

    // Setup the limiter for the run up
    jumpSB.setLimiter(new LinearLimiter(Infinity, character.getMaxLinearSpeed() * 3));

    const jumbSBProps = {
      takeoffPositionTolerance: jumpSB.getTakeoffPositionTolerance(),
      takeoffVelocityTolerance: jumpSB.getTakeoffVelocityTolerance(),
      maxVerticalVelocity: jumpSB.getMaxVerticalVelocity(),
      restart: () => {
        this.setCharacterPositionOnPath();
        character.setSteeringBehavior(followPathSB);
      },
    };

    this.detailTable.add(this, 'runUpLength', 0.1, 4);

    this.detailTable.add(jumbSBProps, 'takeoffPositionTolerance', 0.1, 5).onChange((val: number) => {
      this.jumpSB.setTakeoffPositionTolerance(val);
    });

    this.detailTable.add(jumbSBProps, 'takeoffVelocityTolerance', 0.1, 5).onChange((val: number) => {
      this.jumpSB.setTakeoffVelocityTolerance(val);
    });

    this.detailTable.add(jumbSBProps, 'maxVerticalVelocity', 1, 15).step(0.5).onChange((val: number) => {
      this.jumpSB.setMaxVerticalVelocity(val);
    });

    this.detailTable.add(this, 'airbornePlanarVelocity', [
      AB_VELOCITY_ON_TAKEOFF,
      AB_PREDICTED_VELOCITY,
      AB_CALCULATE_EXACT_VELOCITY,
    ]);

    this.detailTable.add(jumbSBProps, 'restart');
  }

  onUpdate(deltaTime: number) {
    super.onUpdate(deltaTime);
    // Should the character switch to Jump behavior?
    if (this.character.getSteeringBehavior() === this.followPathSB) {
      const d1 = this.followPathSB.getPathParam().getDistance();
      const d2 = this.linePath.getSegments()[this.linePath.getSegments().length - 2].getCumulativeLength();
      const distFromTakeoffPoint = Math.abs(d1 - d2);
      if (distFromTakeoffPoint < this.runUpLength) {
        // console.log('Switched to Jump behavior. Taking a run up...');
        // System.out.println("run up length = " + distFromTakeoffPoint);
        // this.character.body.setDamping(0, 0);
        // System.out.println("friction: " + character.body.getFriction());
        // this.character.body.setFriction(0);
        // System.out.println("owner.linearVelocity = " + character.getLinearVelocity() + "; owner.linearSpeed = "
        //   + character.getLinearVelocity().len());
        this.character.setSteeringBehavior(this.jumpSB);
      }
    }
  }

  onDestroy() {
    this.pendingTakeoffs.forEach(v => clearTimeout(v));
    super.onDestroy();
  }

  private setCharacterPositionOnPath(): void {
    const p = this.wayPoints[1];
    this.character.setPosition(p.x, p.y, p.z);
  }
}

export default JumpTest3d;
