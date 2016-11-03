declare module 'dat.gui/build/dat.gui' {
  export = dat;
}

declare namespace dat {
  interface GUI {
    destroy(): any;
  }
}

declare module 'pixi.js' {
  export = PIXI;
}

declare module 'gl-matrix/src/gl-matrix/vec2' {
  import { vec2 } from 'gl-matrix';
  export = vec2;
}

declare module 'gl-matrix/src/gl-matrix/vec3' {
  import { vec3 } from 'gl-matrix';
  export = vec3;
}

declare module 'gl-matrix/src/gl-matrix/mat4' {
  import { mat4 } from 'gl-matrix';
  export = mat4;
}

declare module 'gl-matrix/src/gl-matrix/quat' {
  import { quat } from 'gl-matrix';
  export = quat;
}

declare function require(string): any;
