declare const require: any;

import { vec3 as Vec3 } from 'gl-matrix';
const vec3: typeof Vec3 = require('gl-matrix/src/gl-matrix/vec3');

import Vector from './Vector';

/**
 * Encapsulates a 3D vector. Allows chaining operations by returning a reference to itself in all modification methods.
 * @author badlogicgames@gmail.com
 */
class Vector3 implements Vector<Vector3> {
  public data: Vec3;

  /**
   * Creates a vector from the given vector
   * @param vector The vector
   */
  constructor(data?: Vec3) {
    this.data = data || vec3.create();
  }

  get x() {
    return this.data[0];
  }

  set x(val: number) {
    this.data[0] = val;
  }

  get y() {
    return this.data[1];
  }

  set y(val: number) {
    this.data[1] = val;
  }

  get z() {
    return this.data[2];
  }

  set z(val: number) {
    this.data[2] = val;
  }

  /**
   * Sets the vector to the given components
   *
   * @param x The x-component
   * @param y The y-component
   * @param z The z-component
   * @return this vector for chaining
   */
  public set(x: number, y: number, z: number): Vector3 {
    vec3.set(this.data, x, y, z);
    return this;
  }

  public copy(vector: Vector3): Vector3 {
    vec3.copy(this.data, vector.data);
    return this;
  }

  public clone(): Vector3 {
    return new Vector3(vec3.clone(this.data));
  }

  public add(vector: Vector3): Vector3 {
    vec3.add(this.data, this.data, vector.data);
    return this;
  }

  public sub(a: Vector3): Vector3 {
    vec3.sub(this.data, this.data, a.data);
    return this;
  }

  public scale(scalar: number): Vector3 {
    vec3.scale(this.data, this.data, scalar);
    return this;
  }

  public scaleAndAdd(vec: Vector3, scalar: number): Vector3 {
    vec3.scaleAndAdd(this.data, this.data, vec.data, scalar);
    return this;
  }

  public len(): number {
    return vec3.length(this.data);
  }

  public sqrLen(): number {
    return vec3.squaredLength(this.data);
  }

  public dst(vector: Vector3): number {
    return vec3.distance(this.data, vector.data);
  }

  public dst2(point: Vector3) {
    return vec3.squaredDistance(this.data, point.data);
  }

  public nor(): Vector3 {
    vec3.normalize(this.data, this.data);
    return this;
  }

  public dot(vector: Vector3): number {
    return vec3.dot(this.data, vector.data);
  }

  public isZero(): boolean {
    return this.data[0] === 0 && this.data[1] === 0 && this.data[2] === 0;
  }

  public limit(limit: number): Vector3 {
    return this.limit2(limit * limit);
  }

  public limit2(limit2: number): Vector3 {
    const len2 = this.sqrLen();
    if (len2 > limit2) {
      this.scale(Math.sqrt(limit2 / len2));
    }
    return this;
  }

  public epsilonEquals(other: Vector3, epsilon: number): boolean {
    if (other == null) return false;
    if (Math.abs(other.data[0] - this.data[0]) > epsilon) return false;
    if (Math.abs(other.data[1] - this.data[1]) > epsilon) return false;
    if (Math.abs(other.data[2] - this.data[2]) > epsilon) return false;
    return true;
  }

  public setZero(): Vector3 {
    vec3.set(this.data, 0, 0, 0);
    return this;
  }
}

export default Vector3;
