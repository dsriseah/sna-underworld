/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  SCREEN is a top-level object that is accessible by all module. It owns
  the Viewport object that RENDER MGR uses to render the game world.

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import * as THREE from 'three';
import { SNA, ConsoleStyler } from '@ursys/core';
import { HookGamePhase } from '../game-mcp.ts';
import { GetViewConfig } from '../game-state.ts';
import { Viewport } from './viewport/class-viewport.ts';

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
let RP_DICT: RP_Dictionary;
let VIEWPORT = new Viewport();
let BG_SPRITE: THREE.Sprite;

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
  VIEWPORT.updateScreenCameras();
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
  VIEWPORT.initRenderer('main-gl');
  const { worldUnits } = GetViewConfig(); // number of world units visible
  VIEWPORT.sizeWorldToViewport(worldUnits);
  VIEWPORT.initializeCameras();
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** called during GamePhase DRAW_UI */
function DrawViewportStatus() {
  // update viewport status
  let out;
  const vpinfo = VIEWPORT.info();
  const { camMode, camPos, visWorld } = vpinfo;
  const camx = camPos.x;
  const camy = camPos.y;
  out = `${camx.toFixed(2)}, ${camy.toFixed(2)}`;
  const cam = `<span style="color:grey">CAMERA:</span> ${out}<br>`;
  const { hw, hh } = visWorld;
  const _ = n => n.toFixed(2);
  const range = `${_(camx - hw)}, ${_(camy - hh)} - ${_(camx + hw)}, ${_(camy + hh)}`;
  const wrd = `<span style="color:grey">WORLD&nbsp;:</span> ${range}<range>`;
  //
  const infoElement = document.getElementById('info');
  infoElement.innerHTML = cam + wrd;
}

/// SNA DECLARATION EXPORT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default SNA.NewComponent('Screen', {
  PreHook: () => {
    HookGamePhase('SYS_INIT', () => {
      Initialize();
    });
    HookGamePhase('DRAW_UI', () => {
      DrawViewportStatus();
    });
  }
});

/// API EXPORTS ///////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export {
  // viewport utilities
  GetViewport, // () => Viewport
  ResizeViewport // (wpx: number, hpx: number) => void
};
