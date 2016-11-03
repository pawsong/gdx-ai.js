import * as THREE from 'three';
import Vector2 from 'gdx-ai/lib/math/Vector2';
import Vector3 from 'gdx-ai/lib/math/Vector3';
import SteeringAcceleration from 'gdx-ai/lib/steer/SteeringAcceleration';
import Location from 'gdx-ai/lib/utils/Location';
import SteeringBehavior from 'gdx-ai/lib/steer/SteeringBehavior';
import SteeringActor from '../SteeringActor';
import SteeringLocation3d from './SteeringLocation3d';
import * as SteeringUtils3d from './SteeringUtils3d';

const steeringOutput = new SteeringAcceleration<Vector3>(new Vector3());

// Gravity
export const gravity = new Vector3();
gravity.set(0, -9, 0);

const _a = new Vector3();
const _delta = new Vector3();

const _position = new THREE.Vector3();
const _velocity = new THREE.Vector3();
const _direction = new THREE.Vector3();

const _normal = new THREE.Vector3();

const _v0 = new Vector3();
const _m0 = new THREE.Matrix3();

const _v2 = new Vector2();

export interface SteeringActor3dOptions {
  geometry: THREE.Geometry;
  material: THREE.Material;
  mass: number;
  collisionDistance?: number;
  collidables?: THREE.Object3D[];
  independentFacing?: boolean;
}

class SteeringActor3d extends SteeringActor<Vector3> {
  mesh: THREE.Mesh;
  independentFacing: boolean;
  mass: number;
  linearVelocity: Vector3;
  protected steeringBehavior: SteeringBehavior<Vector3> ;
  private force: Vector3;
  private angularVelocity: number;
  private position: Vector3;
  private collisionDistance: number;
  private collidables: THREE.Object3D[];
  private raycaster: THREE.Raycaster;

  constructor(options: SteeringActor3dOptions) {
    super();

    this.mesh = new THREE.Mesh(options.geometry, options.material);
    this.mesh.rotation.reorder('YZX');
    this.mesh.castShadow = true;

    this.independentFacing = options.independentFacing === true;

    this.linearVelocity = new Vector3();

    this.maxAngularSpeed = 0;

    this.linearVelocity = new Vector3();
    this.angularVelocity = 0;
    this.force = new Vector3();
    this.position = new Vector3();

    this.mass = options.mass;

    this.collisionDistance = options.collisionDistance || 0;
    this.collidables = options.collidables;

    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = this.collisionDistance;
  }

  public update(deltaTime: number): void {
    this.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);

    if (this.steeringBehavior) {
      // Calculate steering acceleration
      this.steeringBehavior.calculateSteering(steeringOutput);

      /*
       * Here you might want to add a motor control layer filtering steering accelerations.
       *
       * For instance, a car in a driving game has physical constraints on its movement: it cannot turn while stationary; the
       * faster it moves, the slower it can turn (without going into a skid); it can brake much more quickly than it can
       * accelerate; and it only moves in the direction it is facing (ignoring power slides).
       */

      // Apply steering acceleration
      this.applySteering(steeringOutput, deltaTime);
    }

    this.updatePhysics(deltaTime);
    this.mesh.position.set(this.position.x, this.position.y, this.position.z);
  }

  updatePhysics(dt: number) {
    _a.setZero()
      .scaleAndAdd(this.force, 1 / this.mass)
      .add(gravity);
    this.force.setZero();

    this.linearVelocity.scaleAndAdd(_a, dt);

    if (this.collidables) {
      _position.set(this.position.x, this.position.y, this.position.z);
      _velocity.set(this.linearVelocity.x, this.linearVelocity.y, this.linearVelocity.z);

      for (const collidable of this.collidables) {
        _direction.copy(_velocity).normalize();
        this.raycaster.set(_position, _direction);
        const [intersect] = this.raycaster.intersectObject(collidable);
        if (intersect) {
          const { normal } = intersect.face;
          const normalMatrix = _m0.getNormalMatrix(intersect.object.matrixWorld);
          _normal.copy(normal).applyMatrix3(normalMatrix).normalize();

          const dot = _normal.dot(_velocity);
          this.linearVelocity.scaleAndAdd(_v0.set(_normal.x, _normal.y, _normal.z), - dot);
        }
      }
    }

    _delta.copy(this.linearVelocity).scale(dt);

    this.position.add(_delta);

    if (this.position.y < 0) {
      this.position.y = 0;
      this.linearVelocity.y = 0;
    }
  }

  setPosition(x: number, y: number, z: number) {
    this.mesh.position.set(x, y, z);
  }

  public getLinearVelocity(): Vector3 {
    return this.linearVelocity;
  }

  public getAngularVelocity(): number {
    return this.angularVelocity;
  }

  public getBoundingRadius(): number {
    return this.collisionDistance;
  }

  public getPosition(): Vector3 {
    return this.position;
  }

  public getOrientation(): number {
    return this.mesh.rotation.y;
  }

  public setOrientation(orientation: number): void {
    this.mesh.rotation.set(0, orientation, 0);
  }

  public vectorToAngle(vector: Vector3): number {
    return SteeringUtils3d.vectorToAngle(vector);
  }

  public angleToVector (outVector: Vector3, angle: number): Vector3 {
    return SteeringUtils3d.angleToVector(outVector, angle);
  }

  public newLocation(): Location<Vector3> {
    return new SteeringLocation3d();
  }

  protected applySteering(steering: SteeringAcceleration<Vector3>, deltaTime: number): void {
    let anyAccelerations = false;

    // Update position and linear velocity
    if (!steeringOutput.linear.isZero()) {
      // this method internally scales the force by deltaTime
      // this.body.applyCentralForce(steeringOutput.linear);
      this.force.scaleAndAdd(steeringOutput.linear, deltaTime);
      anyAccelerations = true;
    }

    // Update orientation and angular velocity
    if (this.isIndependentFacing()) {
      this.mesh.rotateY(this.angularVelocity * deltaTime);
      if (steeringOutput.angular !== 0) {
        // this method internally scales the torque by deltaTime
        // this.body.applyTorque(tmpVector3.set(0, steeringOutput.angular, 0));
        this.angularVelocity += steeringOutput.angular * deltaTime;
        anyAccelerations = true;
      }
    } else {
      // If we haven't got any velocity, then we can do nothing.
      const linVel = this.getLinearVelocity();
      if (linVel.sqrLen() >= this.getZeroLinearSpeedThreshold()) {
        //
        // TODO: Commented out!!!
        // Looks like the code below creates troubles in combination with the applyCentralForce above
        // Maybe we should be more consistent by only applying forces or setting velocities.
        //
        const newOrientation = this.vectorToAngle(linVel);
        this.angularVelocity = (newOrientation - this.mesh.rotation.y) / deltaTime;
        this.mesh.rotation.y = newOrientation;
        anyAccelerations = true;
      }
    }

    if (anyAccelerations) {

      // TODO:
      // Looks like truncating speeds here after applying forces doesn't work as expected.
      // We should likely cap speeds form inside an InternalTickCallback, see
      // http://www.bulletphysics.org/mediawiki-1.5.8/index.php/Simulation_Tick_Callbacks

      // TODO: Do we have to do this?
      // Cap the linear speed
      // const velocity = this.body.velocity;
      const planarVelocity = _v2.set(this.linearVelocity.x, this.linearVelocity.z);
      const currentSpeedSquare = planarVelocity.sqrLen();
      const maxLinearSpeed = this.getMaxLinearSpeed();
      if (currentSpeedSquare > maxLinearSpeed * maxLinearSpeed) {
        planarVelocity.scale(maxLinearSpeed / Math.sqrt(currentSpeedSquare));
        this.linearVelocity.x = planarVelocity.x;
        this.linearVelocity.z = planarVelocity.y;
      }

      // Cap the angular speed
      if (this.angularVelocity > this.maxAngularSpeed) {
        this.angularVelocity = this.maxAngularSpeed;
      } else if (this.angularVelocity < - this.maxAngularSpeed) {
        this.angularVelocity = - this.maxAngularSpeed;
      }
    }
  }
}

export default SteeringActor3d;
