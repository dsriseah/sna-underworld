/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  RENDERER draws the game world's 3D and 2D elements. There are multiple
  "render passes" that draw different layers of the game. Uses the THREE
  ViewPort class to manage a WebGL renderer and camera.

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import * as THREE from 'three';
import { SNA, ConsoleStyler } from '@ursys/core';
import { HookGamePhase, GetViewState } from '../game-mcp.ts';
import { GameTimeMS } from '../game-mcp.ts';
import * as TextureMgr from './texture-mgr.ts';
import { Viewport } from './visuals/class-viewport.ts';

/// TYPE DECLARATIONS /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
type RP_Name = 'bg' | 'fx0' | 'world' | 'fx1' | 'over' | 'hud';
type RP_Dictionary = { [key in RP_Name]: { scene: THREE.Scene; cam: THREE.Camera } };

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = true;
const LOG = console.log.bind(this);
const PR = ConsoleStyler('render', 'TagGreen');
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
let RP_NAMES: RP_Name[] = ['bg', 'fx0', 'world', 'fx1', 'hud'];
let RP_DICT: RP_Dictionary;
let VIEWPORT = new Viewport();
let BG_SPRITE: THREE.Sprite;
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
let CAPTURE_SCREEN = false; // screen capture request flag

/// HELPER METHODS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** invoke queued pre-render functions */
function m_PreRender() {}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** invoke queued post-render functions */
function m_PostRender() {}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** check if screen capture is requested */
function m_CheckCaptureScreen() {
  if (CAPTURE_SCREEN) {
    const gameTime = GameTimeMS();
    // call VIEWPORT.captureScreen();
    // export screen capture
    CAPTURE_SCREEN = false;
  }
}

/// RENDERPASS METHODS ////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** add a visual to a render pass */
function RP_AddVisual(pass: RP_Name, visual: THREE.Object3D) {
  RP_DICT[pass].scene.add(visual);
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** remove a visual from a render pass */
function RP_RemoveVisual(pass: RP_Name, visual: THREE.Object3D) {
  RP_DICT[pass].scene.remove(visual);
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** set fog for a render pass */
function RP_SetFog(pass: RP_Name, fog: THREE.Fog) {
  RP_DICT[pass].scene.fog = fog;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** get the THREE.Scene by name */
function RP_GetScene(pass: RP_Name): THREE.Scene {
  return RP_DICT[pass].scene;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function RP_SetBackgroundImage(texPath: string) {
  const texture = TextureMgr.Load(texPath);
  const mat = new THREE.SpriteMaterial({ map: texture });
  BG_SPRITE = new THREE.Sprite(mat);
  BG_SPRITE.position.set(0, 0, -999);
  BG_SPRITE.scale.set(texture.image.width, texture.image.height, 1);
  RP_AddVisual('bg', BG_SPRITE);
}

/// VIEWPORT UTILITIES ////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** get the Viewport instance */
function GetViewport() {
  return VIEWPORT;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** called when browser window is resized. wpx and hpx are probably clientWidth
 *  and clientHeight of the main container hold the webgl renderer */
function ResizeViewport(wpx: number, hpx: number) {
  if (hpx === undefined) hpx = wpx;
  VIEWPORT.setDimensions(wpx, hpx);
  VIEWPORT.updateViewportCameras();
}

/// SCREEN CAPTURE ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** request a screen capture at the next DrawWorld() call */
function CaptureScreen() {
  CAPTURE_SCREEN = true;
}

/// SCREEN CLICKS /////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** WIP 'what got clicked in the world' */
function GetClickedVisual(x: number, y: number): THREE.Object3D[] {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  mouse.x = (x / VIEWPORT.width) * 2 - 1;
  mouse.y = -(y / VIEWPORT.height) * 2 + 1;
  raycaster.setFromCamera(mouse, VIEWPORT.worldCam());
  const { scene } = RP_DICT['world'];
  const intersects = raycaster.intersectObjects(scene.children, true);
  return intersects.map(i => i.object);
}

/// LIFECYCLE METHODS /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** called during GamePhase INIT */
function Initialize() {
  // initialize render pass dictionary, adding in order of rendering
  RP_DICT = {
    bg: { scene: new THREE.Scene(), cam: VIEWPORT.bgCam() },
    fx0: { scene: new THREE.Scene(), cam: VIEWPORT.worldCam() },
    world: { scene: new THREE.Scene(), cam: VIEWPORT.worldCam() },
    fx1: { scene: new THREE.Scene(), cam: VIEWPORT.worldCam() },
    over: { scene: new THREE.Scene(), cam: VIEWPORT.screenCam() },
    hud: { scene: new THREE.Scene(), cam: VIEWPORT.screenCam() }
  };
  // initialize viewport
  const main = document.getElementById('main-gl');
  const width = main.clientWidth;
  const height = main.clientHeight;
  VIEWPORT.initRenderer({ width, height, containerID: 'main-gl' });
  const { worldUnits } = GetViewState(); // number of world units visible
  VIEWPORT.sizeWorldToViewport(worldUnits);
  VIEWPORT.initializeCameras();
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** called during GamePhase DRAW_WORLD */
function DrawWorld() {
  // invoke pre-render functions
  m_PreRender();
  // render all render passes in order of RP_NAMES
  VIEWPORT.clear();
  Object.keys(RP_DICT).forEach(rp => {
    const { scene, cam } = RP_DICT[rp];
    VIEWPORT.render(scene, cam);
    VIEWPORT.clearDepth();
  });
  // invoke post-render functions
  m_PostRender();
  // check for screen capture request
  m_CheckCaptureScreen();
}

/// SNA DECLARATION EXPORT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default SNA.DeclareModule('RenderMgr', {
  PreHook: () => {
    HookGamePhase('INIT', () => {
      Initialize();
    });
    HookGamePhase('DRAW_WORLD', () => {
      DrawWorld();
    });
  }
});

/// API EXPORTS ///////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export {
  // viewport utilities
  GetViewport, // () => Viewport
  ResizeViewport, // (wpx: number, hpx: number) => void
  // renderpass methods
  RP_AddVisual, // (pass: RP_Name, visual: any) => void
  RP_RemoveVisual, // (pass: RP_Name, visual: any) => void
  RP_GetScene, // (pass: RP_Name) => THREE.Scene
  // scene attributes
  RP_SetFog, // (pass: RP_Name, fog: THREE.Fog) => void
  RP_SetBackgroundImage, // (texPath: string) => Promise<void>
  // screen utilities
  CaptureScreen // () => void
};
