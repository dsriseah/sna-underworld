/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  Viewport - This class manages a ThreeJS WebGLRenderer and the cameras that
  render the game world at a particular size in the HTML web app. It provides a
  world camera and a screen camera for rendering 3D and 2D scenes which are used
  by the RENDERER module to draw its renderpasses comprised of various
  THREE.Scene objects. It also provides utilities sizing the WebGL canvas to
  the container element, and capturing the screen as a base64 encoded image.

  \*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import * as THREE from 'three';

/// TYPE DECLARATIONS /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
type ViewportMode = 'fixed' | 'scaled' | 'fluid';
type ScreenCapFormat = 'jpg' | 'png';

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
let viewport_count = 0;
// scratch variables
let v = new THREE.Vector3(0, 0, 0);

/// HELPERS ////////////////////////////////////////////////////////////////////

/** calculates how far a 3D camera with a particular FOV needs to move back
 *  to show fWidth and fHeight pixels. Used to frame a particular number
 *  of world units */
function m_GetFramingDistance(cam3D, fWidth, fHeight, safety?) {
  safety = safety || 0.5;
  let buffer = fWidth * safety;

  fWidth += buffer;
  fHeight += buffer;

  // update world3d camera by positioning it
  // to default see the entire world
  let deg2rad = 180 / Math.PI;
  let hfov = deg2rad * (cam3D.fov / 2);
  let tan = Math.tan(hfov);
  let d = Math.max(fWidth / tan, fHeight / tan);

  // console.log("frame",fWidth*2+'x'+fHeight*2,"D="+d.toFixed(2));
  return d;
}

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class Viewport {
  name: string; // name of the viewport
  mode: ViewportMode; // fixed, scaled, fluid
  width: number; // width in pixels
  height: number; // height in pixels
  aspect: number; // aspect ratio
  containerID: string; // container element
  container: HTMLElement; // container element
  threeGL: THREE.WebGLRenderer; // WebGL renderer object
  worldOrigin: THREE.Vector3; // where world cams are looking
  worldUnits: number; // number of visible world units in frame
  worldScale: number; // scale factor for world cams to fit world units
  worldAspect: number; // computed world aspect ratio for 3d cams
  worldUp: THREE.Vector3; // up-vector for orienting world cams
  camBG: THREE.OrthographicCamera; // background image (pixel coords)
  camWORLD: THREE.Camera; // pieces (world coords) set to...
  cam2D: THREE.OrthographicCamera; // ...2d orthographic (world coords)
  cam3D: THREE.PerspectiveCamera; // ...3d perspective (world coords)
  camSCREEN: THREE.OrthographicCamera; // screen (pixel coords)
  pickers: any; // subscribes to mouse click events

  constructor() {
    this.name = 'viewport' + viewport_count++;
    this.mode = 'fixed';
  }

  /** Step 1. Initialize the WebGL surface and size containers exactly */
  initRenderer({ width, height, containerID }): void {
    this.width = width;
    this.height = height;
    this.aspect = width / height;
    this.containerID = containerID;

    // create THREEJS renderer
    const container = document.getElementById(containerID);
    if (container === null) throw Error(`container ${containerID} not found`);
    this.container = container;
    this.threeGL = new THREE.WebGLRenderer();
    this.threeGL.setClearColor(0x000000, 1);
    this.threeGL.autoClear = false;
    this.container.appendChild(this.threeGL.domElement);

    // size the renderer
    this.threeGL.setSize(this.width, this.height);
    this.container.style.width = this.width + 'px';
    this.container.style.height = this.height + 'px';
  }

  /** Step 2. Set the World-to-Renderer mapping with "WorldUnits", which specify
   *  the minimum guaranteed number of units to be shown in the current display.
   *  A value of 10 means that 10 units (-5 to 5) will be visible in world
   *  cameras */
  sizeWorldToViewport(wu: number = 10): void {
    if (!this.threeGL) throw Error('call initRenderer() first');
    if (typeof wu !== 'number') throw Error(`arg1 must be a number ${wu}`);
    // save world values
    this.worldOrigin = new THREE.Vector3(0, 0, 0);
    this.worldUp = new THREE.Vector3(0, 1, 0); // y-axis is up, camera looks on XY
    this.worldUnits = wu;
    this.worldScale = Math.max(wu / this.width, wu / this.height);
    this.worldAspect = this.width / this.height;
  }

  /** Step 3. Create all the cameras */
  initializeCameras(): void {
    if (!this.worldUnits) throw Error('call sizeWorldToViewport() first');
    let hw = this.width / 2;
    let hh = this.height / 2;
    this.worldAspect = hw / hh;
    // 2D cameras use screenspace coordinates
    this.camBG = new THREE.OrthographicCamera(-hw, hw, hh, -hh, 0, 1000);
    this.camSCREEN = new THREE.OrthographicCamera(-hw, hw, hh, -hh, 0, 1000);
    // 3d world cameras use world coordinates
    let whw = (this.width * this.worldScale) / 2;
    let whh = (this.height * this.worldScale) / 2;
    let wox = this.worldOrigin.x;
    let woy = this.worldOrigin.y;
    // point 3d worldcam at world origin
    this.cam3D = new THREE.PerspectiveCamera(53.1, this.aspect, 1, 10000);
    this.cam3D.position.set(wox, woy, 10);
    this.cam3D.up = this.worldUp;
    this.cam3D.lookAt(this.worldOrigin);

    // point 2d worldcam at world origin
    this.cam2D = new THREE.OrthographicCamera(
      -whw + wox,
      whw + wox,
      whh + woy,
      -whh + woy,
      0,
      10000
    );
    this.cam2D.position.set(wox, woy, 10);
    this.cam2D.up = this.worldUp;
    this.cam2D.lookAt(this.worldOrigin);

    // set the 3d worldcam at distance so it can see the right number of
    // world units defined in step 2
    let d = m_GetFramingDistance(this.cam3D, whw, whh);
    this.cam3D.position.z = d;
    this.cam2D.position.z = d;

    // assign default world camera as 2D
    this.camWORLD = this.cam3D;
  }

  /// VIEWPORT SIZE METHOD in SCREEN COORDINATES ///

  /** for updating when browser size changes (see SCREEN module) */
  setDimensions(width: number, height: number): void {
    if (!this.threeGL) {
      console.error('WebGL is not initialized');
      return;
    }
    if (!width) width = this.width;
    if (!height) height = this.height;
    if (!(width && height && this.threeGL)) {
      console.error(
        'ViewPort requires valid width and height. Did you InitializeRenderer()?'
      );
    }
    this.aspect = this.width / this.height;
    this.worldAspect = this.aspect;
    // save values
    this.width = width;
    this.height = height;
    this.aspect = width / height;

    // set the renderer size
    this.threeGL.setSize(this.width, this.height);
    // set the container dimensions as well
    this.container.style.width = this.width + 'px';
    this.container.style.height = this.height + 'px';
    let canvas = this.webGLCanvas();
    canvas.style.width = this.width + 'px';
    canvas.style.height = this.height + 'px';
  }

  /** return the current dimensions of the viewport */
  dimensions(): any {
    if (!this.threeGL) {
      console.error('WebGL is not initialized');
      return;
    }
    return {
      width: this.width,
      height: this.height,
      aspect: this.aspect,
      scaledWidth: this.container.offsetWidth,
      scaledHeight: this.container.offsetHeight
    };
  }

  /** update the viewport cameras that use screen coordinates */
  updateViewportCameras(): void {
    let hw = this.width / 2;
    let hh = this.height / 2;
    this.camBG.left = -hw;
    this.camBG.right = +hw;
    this.camBG.top = +hh;
    this.camBG.bottom = -hh;

    this.camSCREEN.left = -hw;
    this.camSCREEN.right = +hw;
    this.camSCREEN.top = +hh;
    this.camSCREEN.bottom = -hh;

    this.camBG.updateProjectionMatrix();
    this.camSCREEN.updateProjectionMatrix();
  }

  /// WORLD CAMERAS in WORLD COORDINATES ///

  /** return the current world dimensions */
  worldDimensions(): any {
    return {
      worldUnits: this.worldUnits,
      worldScale: this.worldScale,
      worldAspect: this.worldAspect
    };
  }

  /** recalculate the world cameras */
  updateWorldCameras(): void {
    let whw = (this.width * this.worldScale) / 2;
    let whh = (this.height * this.worldScale) / 2;
    let wox = this.worldOrigin.x;
    let woy = this.worldOrigin.y;
    // update world2d camera
    this.cam2D.left = -whw + wox;
    this.cam2D.right = +whw + wox;
    this.cam2D.top = +whh + woy;
    this.cam2D.bottom = -whh + woy;
    // update aspect
    this.cam3D.aspect = this.aspect;
    // update project matrices
    this.cam2D.updateProjectionMatrix();
    this.cam3D.updateProjectionMatrix();
  }

  /// WORLD CAMERA UTILITIES ///

  /** set the world origin for the world cameras so the
   *  entire world is visible */
  frameToWorld(): void {
    let whw = (this.width * this.worldScale) / 2;
    let whh = (this.height * this.worldScale) / 2;
    // update world3d camera by positioning it
    // to default see the entire world
    let d = m_GetFramingDistance(this.cam3D, whw, whh);
    // update camera distances
    this.cam3D.position.z = d;
    this.cam2D.position.z = d;
  }

  /** point the world cameras at a point in the world */
  track(vector3: THREE.Vector3): void {
    v.x = vector3.x;
    v.y = vector3.y;
    v.z = vector3.z;
    this.cam2D.position.x = v.x;
    this.cam2D.position.y = v.y;
    this.cam3D.position.x = v.x;
    this.cam3D.position.y = v.y;
    this.cam3D.lookAt(v);
  }

  /// ACCESSOR METHODS ///

  /** this viewport instance's aspect ratio */
  aspectRatio(): number {
    return this.aspect;
  }

  /** the background cam for rendering 2D texture scenes */
  bgCam(): THREE.OrthographicCamera {
    return this.camBG;
  }

  /** the current world camera for rendering the playfield scenes */
  worldCam(): THREE.Camera {
    return this.camWORLD;
  }

  /** cam2D is one of two world cameras, returned by worldCam() and
   *  set through selectWorld2D() */
  worldCam2D(): THREE.OrthographicCamera {
    return this.cam2D;
  }

  /** cam3D is one of two world cameras, returned by worldCam() and
   *  set through selectWorld3D() */
  worldCam3D(): THREE.PerspectiveCamera {
    return this.cam3D;
  }

  /** the screen camera for rendering 2D overlay scenes */
  screenCam(): THREE.OrthographicCamera {
    return this.camSCREEN;
  }

  /** return the WebGL renderer that can render() */
  webGL(): THREE.WebGLRenderer {
    return this.threeGL;
  }

  /** return the WebGL canvas element */
  webGLCanvas(): HTMLElement {
    return this.threeGL.domElement;
  }

  /// RENDERING CONTROL ///

  /** set the 2D World Camera to be used by render() */
  selectWorld2D(): void {
    this.camWORLD = this.cam2D;
  }

  /** set the 3D World Camera to be used by render() */
  selectWorld3D(): void {
    this.camWORLD = this.cam3D;
  }

  /** render the WebGL scene using the currently set WorldCam */
  render(rpass: THREE.Scene, camera?: THREE.Camera): void {
    if (!camera) camera = this.camWORLD;
    this.threeGL.render(rpass, camera);
  }

  /** clear the WebGL render buffer */
  clear(): void {
    this.threeGL.clear();
  }

  /** clear the WebGL render depth buffer only */
  clearDepth(): void {
    this.threeGL.clearDepth();
  }

  /// SCREEN CAPTURE ///

  /** return a base64 encoded image of the current screen */
  captureScreen(fmt: ScreenCapFormat = 'png'): string {
    let img = this.threeGL.domElement.toDataURL(fmt);
    return img;
  }
}

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export { Viewport };
