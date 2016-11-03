import * as THREE from 'three';
window['THREE'] = THREE;
import 'three/examples/js/controls/OrbitControls';
import dat = require('dat.gui/build/dat.gui');
import Vector3 from 'gdx-ai/lib/math/Vector3';
import SteeringTestBase from '../SteeringTestBase';
import SteeringActor3d from './SteeringActor3d';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(SteeringTestBase.CANVAS_BG_COLOR);
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize(SteeringTestBase.CANVAS_WIDTH, SteeringTestBase.CANVAS_HEIGHT);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.domElement.classList.add('canvas');
renderer.domElement.classList.add('hide');
document.body.appendChild(renderer.domElement);

const badlogic = require('file!../../../data/badlogic.jpg');

interface ActorOptions {
  independentFacing?: boolean;
  collidables?: THREE.Object3D[];
}

/**
 * Base class for bullet steering behavior tests.
 *
 * @author Daniel Holderbaum
 */
abstract class SteeringTest3d extends SteeringTestBase<Vector3> {
  static renderer = renderer;

  protected scene: THREE.Scene;
  protected camera: THREE.PerspectiveCamera;
  protected plane: THREE.Mesh;

  protected detailTable: dat.GUI;

  private controls: THREE.OrbitControls;
  private readyForClick: boolean;
  private raycaster = new THREE.Raycaster();
  private cursorIntersectables: THREE.Object3D[];

  constructor() {
    super();
    this.initScene();
    this.addPlane();
  }

  onCreate() {
    renderer.domElement.classList.remove('hide');
    this.detailTable = new dat.GUI({ width: 370 });
    this.detailTable.domElement.style.marginRight = '0';
    this.readyForClick = false;

    this.controls.addEventListener('change', this.handleControlsChange);
    SteeringTest3d.renderer.domElement.addEventListener('mousedown', this.handleMouseDown);
    SteeringTest3d.renderer.domElement.addEventListener('mouseup', this.handleMouseUp);
  }

  onRender() {
    renderer.render(this.scene, this.camera);
  }

  onDestroy() {
    SteeringTest3d.renderer.domElement.removeEventListener('mousedown', this.handleMouseDown);
    this.detailTable.destroy();
    renderer.domElement.classList.add('hide');
    this.controls.dispose();
  }

  protected addCharacter(options: ActorOptions = {}) {
    const radius = 1;
    const geometry = new THREE.CylinderGeometry(radius, radius, 4, 32);
    geometry.translate(0, 2, 0);

    const material = new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load(badlogic),
    });

    const actor = new SteeringActor3d({
      geometry, material,
      mass: 0.01,
      independentFacing: options.independentFacing,
      collisionDistance: radius,
      collidables: options.collidables,
    });

    this.add(actor);
    return actor;
  }

  protected addTarget() {
    const geometry = new THREE.BoxGeometry(1, 8, 1);
    geometry.translate(0, 4, 0);
    const material = new THREE.MeshLambertMaterial({ color: 0xFF4081 });
    const actor = new SteeringActor3d({ geometry, material, mass: 1 });
    actor.setPosition(10, 0, -20);

    this.add(actor);
    return actor;
  }

  protected add(object: SteeringActor3d) {
    this.addActor(object);
    this.scene.add(object.mesh);
  }

  protected onClick(intersect: THREE.Intersection) {
    return undefined;
  }

  private initScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      45, SteeringTestBase.CANVAS_WIDTH / SteeringTestBase.CANVAS_HEIGHT, 1, 10000);
    this.camera.position.set(30, 30, 30);
    this.controls = new THREE.OrbitControls(this.camera, renderer.domElement);

    const dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.castShadow = true;

    dirLight.color.setHSL(0.1, 1, 0.95);
    dirLight.position.set(0, 1.75, 1);
    dirLight.position.multiplyScalar(50);

    const shadowCamera = <THREE.OrthographicCamera> dirLight.shadow.camera;

    const d = 120;
    shadowCamera.left = -d;
    shadowCamera.right = d;
    shadowCamera.top = d;
    shadowCamera.bottom = -d;
    shadowCamera.far = 200;
    dirLight.shadow.bias = -0.0001;
    dirLight.shadow.mapSize.width = 4096;
    dirLight.shadow.mapSize.height = 4096;

    this.scene.add(dirLight);
    this.scene.add(new THREE.AmbientLight(0x222222));

    // this.cameraHelper = new THREE.CameraHelper(dirLight.shadow.camera);
    // this.scene.add(this.cameraHelper);

    const axisHelper = new THREE.AxisHelper(500);
    this.scene.add(axisHelper);
  }

  private addPlane() {
    const geometry = new THREE.PlaneGeometry(200, 200);
    geometry.rotateX(Math.PI / 2);

    const material = new THREE.MeshLambertMaterial({ color: 0x9E9E9E, side: THREE.DoubleSide });
    this.plane = new THREE.Mesh(geometry, material);
    this.plane.receiveShadow = true;

    this.scene.add(this.plane);

    this.cursorIntersectables = [this.plane];
  }

  private handleControlsChange = () => this.readyForClick = false;

  private handleMouseDown = () => this.readyForClick = true;

  private handleMouseUp = (event: MouseEvent) => {
    if (!this.readyForClick) return;

    const { width, height } = SteeringTest3d.renderer.domElement;

    // update the picking ray with the camera and mouse position
    this.raycaster.setFromCamera({
      x: (event.offsetX / width) * 2 - 1,
      y: - ( event.offsetY / height ) * 2 + 1,
    }, this.camera);

    // calculate objects intersecting the picking ray
    const [intersect] = this.raycaster.intersectObjects(this.cursorIntersectables);
    if (!intersect) return;

    this.onClick(intersect);
  }
}

export default SteeringTest3d;
