import PIXI = require('pixi.js');
import SteeringTest2d from '../SteeringTest2d';

function createRandomWalls(n: number): PIXI.Graphics[] {
  const walls: PIXI.Graphics[] = [];
  const { width: rendererWidth, height: rendererHeight } = SteeringTest2d.renderer;
  for (let i = 0; i < n; i++) {
    const graphics = new PIXI.Graphics();

    const width = rendererWidth / 16 + Math.random() * rendererWidth / 4;
    const height = rendererHeight / 16 + Math.random() * rendererHeight / 4;

    const r = 0xFF * Math.random();
    const g = 0xFF * Math.random();
    const b = 0xFF * Math.random();

    graphics.beginFill((r << 16) + (g << 8) + (b << 0)); // Red
    graphics.drawRect(- width / 2, - height / 2, width, height);
    graphics.endFill();

    const minX = 50 + width / 2;
    const minY = 50 + height / 2;
    const maxX = rendererWidth - 50 - width / 2;
    const maxY = rendererHeight - 50 - height / 2;

    graphics.position.x = minX + (maxX - minX) * Math.random();
    graphics.position.y = minY + (maxY - minY) * Math.random();

    walls.push(graphics);
  }
  return walls;
}

export default createRandomWalls;
