declare const require: any;

import vec2 = require('gl-matrix/src/gl-matrix/vec2');

import Vector from './Vector';

/**
 * Encapsulates a 2D vector. Allows chaining methods by returning a reference to itself
 * @author badlogicgames@gmail.com
 */
class Vector2 implements Vector<Vector2> {
  public data: vec2;

  /**
   * Constructs a vector from the given vector
   * @param v The vector
   */
  constructor(data?: vec2) {
    this.data = data || vec2.create();
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

  public clone(): Vector2 {
    return new Vector2(vec2.clone(this.data));
  }

  public len(): number {
    return vec2.len(this.data);
  }

  public sqrLen(): number {
    return vec2.sqrLen(this.data);
  }

  public copy(v: Vector2): Vector2 {
    vec2.copy(this.data, v.data);
    return this;
  }

  /**
   * Sets the components of this vector
   * @param x The x-component
   * @param y The y-component
   * @return This vector for chaining
   */
  public set(x: number, y: number): Vector2 {
    vec2.set(this.data, x, y);
    return this;
  }

  public sub(v: Vector2): Vector2 {
    vec2.sub(this.data, this.data, v.data);
    return this;
  }

  public nor(): Vector2 {
    vec2.normalize(this.data, this.data);
    return this;
  }

  public add(v: Vector2) {
    vec2.add(this.data, this.data, v.data);
    return this;
  }

  public dot(v: Vector2): number {
    return vec2.dot(this.data, v.data);
  }

  public scale(scalar: number): Vector2 {
    vec2.scale(this.data, this.data, scalar);
    return this;
  }

  public scaleAndAdd(vec: Vector2, scalar: number): Vector2 {
    vec2.scaleAndAdd(this.data, this.data, vec.data, scalar);
    return this;
  }

  public dst(v: Vector2): number {
    return vec2.distance(this.data, v.data);
  }

  public dst2(v: Vector2): number {
    return vec2.squaredDistance(this.data, v.data);
  }

  public limit(limit: number): Vector2 {
    return this.limit2(limit * limit);
  }

  public limit2(limit2: number): Vector2 {
    const len2 = this.sqrLen();
    if (len2 > limit2) {
      return this.scale(Math.sqrt(limit2 / len2));
    }
    return this;
  }

  public epsilonEquals(other: Vector2, epsilon: number): boolean {
    if (other == null) return false;
    if (Math.abs(other.data[0] - this.data[0]) > epsilon) return false;
    if (Math.abs(other.data[1] - this.data[1]) > epsilon) return false;
    return true;
  }

  public isZero(): boolean {
    return this.data[0] === 0 && this.data[1] === 0;
  }

  public setZero(): Vector2 {
    vec2.set(this.data, 0, 0);
    return this;
  }
}

export default Vector2;
