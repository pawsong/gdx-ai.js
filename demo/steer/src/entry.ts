import Stats = require('stats.js');
import dat = require('dat.gui/build/dat.gui');
import SteeringTestBase from './SteeringTestBase';
import ArriveTest2d from './2d/tests/ArriveTest2d';
import CollisionAvoidanceTest2d from './2d/tests/CollisionAvoidanceTest2d';
import FaceTest2d from './2d/tests/FaceTest2d';
import RaycastObstacleAvoidanceTest2d from './2d/tests/RaycastObstacleAvoidanceTest2d';
import SeekTest2d from './2d/tests/SeekTest2d';
import WanderTest2d from './2d/tests/WanderTest2d';
import PriorityTest2d from './2d/tests/PriorityTest2d';
import SeekTest3d from './3d/tests/SeekTest3d';
import FollowPathTest3d from './3d/tests/FollowPathTest3d';
import JumpTest3d from './3d/tests/JumpTest3d';
import FaceTest3d from './3d/tests/FaceTest3d';
import LookWhereYouAreGoingTest3d from './3d/tests/LookWhereYouAreGoingTest3d';
import RaycastObstacleAvoidanceTest3d from './3d/tests/RaycastObstacleAvoidanceTest3d';
import * as queryString from 'query-string';

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
stats.dom.style.top = 'inherit';
stats.dom.style.right = '0';
stats.dom.style.bottom = '0';
stats.dom.style.left = 'inherit';
document.body.appendChild(stats.dom);

const BEHAVIOR_2D_ARRIVE = '[2D] Arrive';
const BEHAVIOR_2D_COLLISION_AVOIDANCE = '[2D] Collision Avoidance';
const BEHAVIOR_2D_FACE = '[2D] Face';
const BEHAVIOR_2D_RAYCAST_OBSTACLE_AVOIDANCE = '[2D] Raycast Obstacle Avoidance';
const BEHAVIOR_2D_SEEK = '[2D] Seek';
const BEHAVIOR_2D_WANDER = '[2D] Wander';
const BEHAVIOR_2D_PRIORITY = '[2D] Priority';

const BEHAVIOR_3D_FACE = '[3D] Face';
const BEHAVIOR_3D_FOLLOW_CLOSED_PATH = '[3D] Follow Closed Path';
const BEHAVIOR_3D_FOLLOW_OPEN_PATH = '[3D] Follow Open Path';
const BEHAVIOR_3D_JUMP = '[3D] Jump';
const BEHAVIOR_3D_LOOK_WHERE_YOU_ARE_GOING = '[3D] Look Where You Are Going';
const BEHAVIOR_3D_RAYCAST_OBSTACLE_AVOIDANCE = '[3D] Raycast Obstacle Avoidance';
const BEHAVIOR_3D_SEEK = '[3D] Seek';

const behaviors = {
  '2d_arrive': BEHAVIOR_2D_ARRIVE,
  '2d_collision_avoidance': BEHAVIOR_2D_COLLISION_AVOIDANCE,
  '2d_face': BEHAVIOR_2D_FACE,
  '2d_raycast_obstacle_avoidance': BEHAVIOR_2D_RAYCAST_OBSTACLE_AVOIDANCE,
  '2d_wander': BEHAVIOR_2D_WANDER,
  '2d_seek': BEHAVIOR_2D_SEEK,
  '2d_priority': BEHAVIOR_2D_PRIORITY,

  '3d_face': BEHAVIOR_3D_FACE,
  '3d_follow_closed_path': BEHAVIOR_3D_FOLLOW_CLOSED_PATH,
  '3d_follow_open_path': BEHAVIOR_3D_FOLLOW_OPEN_PATH,
  '3d_jump': BEHAVIOR_3D_JUMP,
  '3d_look_where_you_are_going': BEHAVIOR_3D_LOOK_WHERE_YOU_ARE_GOING,
  '3d_raycast_obstacle_avoidance': BEHAVIOR_3D_RAYCAST_OBSTACLE_AVOIDANCE,
  '3d_seek': BEHAVIOR_3D_SEEK,
};

const w = window.parent || window;
const loc = w.location;

const behaviorIds = {};
Object.keys(behaviors).forEach(key => behaviorIds[behaviors[key]] = key);

function createTest(behaviorType: string): SteeringTestBase<any> {
  switch(behaviorType) {
    case BEHAVIOR_2D_ARRIVE: {
      return new ArriveTest2d();
    }
    case BEHAVIOR_2D_COLLISION_AVOIDANCE: {
      return new CollisionAvoidanceTest2d();
    }
    case BEHAVIOR_2D_FACE: {
      return new FaceTest2d();
    }
    case BEHAVIOR_2D_RAYCAST_OBSTACLE_AVOIDANCE: {
      return new RaycastObstacleAvoidanceTest2d();
    }
    case BEHAVIOR_2D_SEEK: {
      return new SeekTest2d();
    }
    case BEHAVIOR_2D_WANDER: {
      return new WanderTest2d();
    }
    case BEHAVIOR_2D_PRIORITY: {
      return new PriorityTest2d();
    }
    case BEHAVIOR_3D_FACE: {
      return new FaceTest3d();
    }
    case BEHAVIOR_3D_FOLLOW_CLOSED_PATH: {
      return new FollowPathTest3d(false);
    }
    case BEHAVIOR_3D_FOLLOW_OPEN_PATH: {
      return new FollowPathTest3d(true);
    }
    case BEHAVIOR_3D_JUMP: {
      return new JumpTest3d();
    }
    case BEHAVIOR_3D_LOOK_WHERE_YOU_ARE_GOING: {
      return new LookWhereYouAreGoingTest3d();
    }
    case BEHAVIOR_3D_RAYCAST_OBSTACLE_AVOIDANCE: {
      return new RaycastObstacleAvoidanceTest3d();
    }
    case BEHAVIOR_3D_SEEK: {
      return new SeekTest3d();
    }
    default: {
      break;
    }
  }
  return null;
}

const qs = queryString.parse(loc.search);

let currentTest: SteeringTestBase<any>;

function changeBehavior(behaviorType: string) {
  const nextTest = createTest(behaviorType);
  if (!nextTest) {
    throw new Error(`Invalid behavior type ${behaviorType}`);
  }

  if (currentTest) currentTest.destroy();
  nextTest.create();
  currentTest = nextTest;

  qs.behavior = behaviorIds[behaviorType];

  const path = `${loc.protocol}//${loc.host}${loc.pathname}?${queryString.stringify(qs)}`;

  if (w.history.pushState) {
    w.history.pushState({ path }, '', path);
  }
}

const target = {
  behavior: behaviors[qs.behavior] || BEHAVIOR_2D_ARRIVE,
  reset: () => changeBehavior(target.behavior),
};

const gui = new dat.GUI({ width: 360 });
gui.domElement.style.cssFloat = 'left';
gui.domElement.style.marginLeft = '0';
gui.add(target, 'behavior', [
  BEHAVIOR_2D_ARRIVE,
  BEHAVIOR_2D_COLLISION_AVOIDANCE,
  BEHAVIOR_2D_FACE,
  BEHAVIOR_2D_RAYCAST_OBSTACLE_AVOIDANCE,
  BEHAVIOR_2D_SEEK,
  BEHAVIOR_2D_WANDER,
  BEHAVIOR_2D_PRIORITY,

  BEHAVIOR_3D_FACE,
  BEHAVIOR_3D_FOLLOW_CLOSED_PATH,
  BEHAVIOR_3D_FOLLOW_OPEN_PATH,
  BEHAVIOR_3D_JUMP,
  BEHAVIOR_3D_LOOK_WHERE_YOU_ARE_GOING,
  BEHAVIOR_3D_RAYCAST_OBSTACLE_AVOIDANCE,
  BEHAVIOR_3D_SEEK,
]).onChange((value: string) => changeBehavior(value));
gui.add(target, 'reset');

changeBehavior(target.behavior);

function animate() {
  requestAnimationFrame(animate);
  stats.update();

  // render the container
  currentTest.render();
}
animate();
