import Vector from '../../../math/Vector';
import clamp from '../../../math/clamp';
import Path, { PathParam } from '../Path';

/**
 * A {@code LinePathParam} contains the status of a {@link LinePath}.
 *
 * @author davebaol
 */
export class LinePathParam implements PathParam {
  segmentIndex: number;
  distance: number;

  public getDistance(): number {
    return this.distance;
  }

  public setDistance (distance: number): void {
    this.distance = distance;
  }

  /** Returns the index of the current segment along the path */
  public getSegmentIndex(): number {
    return this.segmentIndex;
  }
}

/**
 * A {@code Segment} connects two consecutive waypoints of a {@link LinePath}.
 *
 * @param <T> Type of vector, either 2D or 3D, implementing the {@link Vector} interface
 *
 * @author davebaol
 */
export class Segment<T extends Vector<T>> {
  begin: T;
  end: T;
  length: number;
  cumulativeLength: number;

  /**
   * Creates a {@code Segment} for the 2 given points.
   * @param begin
   * @param end
   */
  constructor(begin: T, end: T) {
    this.begin = begin;
    this.end = end;
    this.length = begin.dst(end);
  }

  /** Returns the start point of this segment. */
  public getBegin(): T {
    return this.begin;
  }

  /** Returns the end point of this segment. */
  public getEnd(): T {
    return this.end;
  }

  /** Returns the length of this segment. */
  public getLength(): number {
    return this.length;
  }

  /** Returns the cumulative length from the first waypoint of the {@link LinePath} this segment belongs to. */
  public getCumulativeLength(): number {
    return this.cumulativeLength;
  }
}

/**
 * A {@code LinePath} is a path for path following behaviors that is made up of a series of waypoints. Each waypoint is connected
 * to the successor with a {@link Segment}.
 *
 * @param <T> Type of vector, either 2D or 3D, implementing the {@link Vector} interface
 *
 * @author davebaol
 * @author Daniel Holderbaum
 */
class LinePath<T extends Vector<T>> implements Path<T, LinePathParam> {

  private segments: Array<Segment<T>>;
  private _isOpen: boolean;
  private pathLength: number;
  private nearestPointOnCurrentSegment: T;
  private nearestPointOnPath: T;
  private tmpB: T;
  private tmpC: T;

  /**
   * Creates a {@code LinePath} for the specified {@code waypoints}.
   * @param waypoints the points making up the path
   * @param isOpen a flag indicating whether the path is open or not
   * @throws IllegalArgumentException if {@code waypoints} is {@code null} or has less than two (2) waypoints.
   */
  public constructor(waypoints: Array<T>, isOpen = false) {
    this._isOpen = isOpen;
    this.createPath(waypoints);

    // const waypoint = waypoints.first();
    const waypoint = waypoints[0];
    this.nearestPointOnCurrentSegment = waypoint.clone();
    this.nearestPointOnPath = waypoint.clone();
    this.tmpB = waypoint.clone();
    this.tmpC = waypoint.clone();
  }

  public isOpen(): boolean {
    return this._isOpen;
  }

  public getLength (): number {
    return this.pathLength;
  }

  public getStartPoint(): T {
    // return this.segments.first().begin;
    return this.segments[0].begin;
  }

  public getEndPoint(): T {
    // return this.segments.peek().end;
    return this.segments[this.segments.length - 1].end;
  }

  /**
   * Returns the square distance of the nearest point on line segment {@code a-b}, from point {@code c}. Also, the {@code out}
   * vector is assigned to the nearest point.
   * @param out the output vector that contains the nearest point on return
   * @param a the start point of the line segment
   * @param b the end point of the line segment
   * @param c the point to calculate the distance from
   */
  public calculatePointSegmentSquareDistance(out: T, a: T, b: T, c: T): number {
    out.copy(a);
    this.tmpB.copy(b);
    this.tmpC.copy(c);

    const ab = this.tmpB.sub(a);
    const abLen2 = ab.sqrLen();
    if (abLen2 !== 0) {
      const t = (this.tmpC.sub(a)).dot(ab) / abLen2;
      out.scaleAndAdd(ab, clamp(t, 0, 1));
    }

    return out.dst2(c);
  }

  public createParam(): LinePathParam {
    return new LinePathParam();
  }

  // We pass the last parameter value to the path in order to calculate the current
  // parameter value. This is essential to avoid nasty problems when lines are close together.
  // We should limit the algorithm to only considering areas of the path close to the previous
  // parameter value. The character is unlikely to have moved far, after all.
  // This technique, assuming the new value is close to the old one, is called coherence, and it is a
  // feature of many geometric algorithms.
  // TODO: Currently coherence is not implemented.
  public calculateDistance(agentCurrPos: T, parameter: LinePathParam): number {
    // Find the nearest segment
    let smallestDistance2 = Infinity;
    let nearestSegment: Segment<T> = null;
    for (let i = 0, len = this.segments.length; i < len; i++) {
      // Segment<T> segment = segments.get(i);
      const segment = this.segments[i];
      const distance2 = this.calculatePointSegmentSquareDistance(
        this.nearestPointOnCurrentSegment, segment.begin, segment.end,
        agentCurrPos);

      // first point
      if (distance2 < smallestDistance2) {
        this.nearestPointOnPath.copy(this.nearestPointOnCurrentSegment);
        smallestDistance2 = distance2;
        nearestSegment = segment;
        parameter.segmentIndex = i;
      }
    }

    // Distance from path start
    const lengthOnPath = nearestSegment.cumulativeLength - this.nearestPointOnPath.dst(nearestSegment.end);

    parameter.setDistance(lengthOnPath);

    return lengthOnPath;
  }

  public calculateTargetPosition(out: T, param: LinePathParam, targetDistance: number): void {
    if (this._isOpen) {
      // Open path support
      if (targetDistance < 0) {
        // Clamp target distance to the min
        targetDistance = 0;
      } else if (targetDistance > this.pathLength) {
        // Clamp target distance to the max
        targetDistance = this.pathLength;
      }
    } else {
      // Closed path support
      if (targetDistance < 0) {
        // Backwards
        targetDistance = this.pathLength + (targetDistance % this.pathLength);
      } else if (targetDistance > this.pathLength) {
        // Forward
        targetDistance = targetDistance % this.pathLength;
      }
    }

    // Walk through lines to see on which line we are
    let desiredSegment: Segment<T> = null;
    for (let i = 0, len = this.segments.length; i < len; i++) {
      const segment = this.segments[i];
      if (segment.cumulativeLength >= targetDistance) {
        desiredSegment = segment;
        break;
      }
    }

    // begin-------targetPos-------end
    const distance = desiredSegment.cumulativeLength - targetDistance;

    out.copy(desiredSegment.begin)
      .sub(desiredSegment.end)
      .scale(distance / desiredSegment.length)
      .add(desiredSegment.end);
  }

  /**
   * Sets up this {@link Path} using the given way points.
   * @param waypoints The way points of this path.
   * @throws IllegalArgumentException if {@code waypoints} is {@code null} or empty.
   */
  public createPath(waypoints: Array<T>): void {
    if (waypoints == null || waypoints.length < 2) {
      throw new Error('waypoints cannot be null and must contain at least two (2) waypoints');
    }

    // this.segments = new Array<Segment<T>>(waypoints.length);
    this.segments = new Array<Segment<T>>();

    this.pathLength = 0;
    let curr = waypoints[0];
    let prev: T = null;
    for (let i = 1, len = waypoints.length; i <= len; i++) {
      prev = curr;
      if (i < len) {
        curr = waypoints[i];
      } else if (this._isOpen) {
        break; // keep the path open
      } else {
        curr = waypoints[0]; // close the path
      }
      const segment = new Segment<T>(prev, curr);
      this.pathLength += segment.length;
      segment.cumulativeLength = this.pathLength;
      // this.segments.push(segment);
      this.segments.push(segment);
    }
  }

  public getSegments(): Array<Segment<T>> {
    return this.segments;
  }
}

export default LinePath;
