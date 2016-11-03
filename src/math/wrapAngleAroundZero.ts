import PI2 from './PI2';

/**
 * Wraps the given angle to the range [-PI, PI]
 * @param a the angle in radians
 * @return the given angle wrapped to the range [-PI, PI]
 */
function wrapAngleAroundZero(a: number): number {
  if (a >= 0) {
    let rotation = a % PI2;
    if (rotation > Math.PI) rotation -= PI2;
    return rotation;
  } else {
    let rotation = -a % PI2;
    if (rotation > Math.PI) rotation -= PI2;
    return -rotation;
  }
}

export default wrapAngleAroundZero;
