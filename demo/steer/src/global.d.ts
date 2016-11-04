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

declare function require(string): any;
