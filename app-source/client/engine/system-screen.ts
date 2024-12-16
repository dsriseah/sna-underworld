/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  SCREEN is a top-level object that is accessible by all module. It owns
  the Viewport object that RENDER MGR uses to render the game world.

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import * as THREE from 'three';
import { SNA, ConsoleStyler } from '@ursys/core';
import { HookGamePhase } from '../game-mcp.ts';
import { GetViewConfig, FrameCount } from '../game-state.ts';
import { Viewport } from './viewport/class-viewport.ts';

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = true;
const LOG = console.log.bind(this);
const PR = ConsoleStyler('render', 'TagGreen');
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
let VIEWPORT = new Viewport();
const VP_STATS: any = {};

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
  // initialize viewport
  // initialize viewport
  VIEWPORT.initRenderer('main-gl');
  const { worldUnits } = GetViewConfig(); // number of world units visible
  VIEWPORT.sizeWorldToViewport(worldUnits);
  VIEWPORT.initializeCameras();
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function AddViewportStatus(stats: { [key: string]: string }) {
  Object.assign(VP_STATS, stats);
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** called during GamePhase DRAW_UI */
function DrawViewportStatus() {
  if (FrameCount() % 10 !== 0) return;
  // update viewport status
  const vpinfo = VIEWPORT.info();
  const { camMode, camPos, visWorld } = vpinfo;
  const _ = n => {
    if (n >= 0) return `+${n.toFixed(2)}`;
    return n.toFixed(2);
  };
  //
  const camx = camPos.x;
  const camy = camPos.y;
  const camxy = `${_(camx)}, ${_(camy)}`;
  VP_STATS.CAMERA = camxy;
  //
  const { hw, hh } = visWorld;
  const range = `${_(camx - hw)}, ${_(camy - hh)} - ${_(camx + hw)}, ${_(camy + hh)}`;
  VP_STATS.WORLD = range;

  // draw viewport status
  let html = '';
  const keys = Object.keys(VP_STATS);
  const keyLen = keys.reduce((a, b) => Math.max(a, b.length), 0);
  Object.keys(VP_STATS).forEach(key => {
    html += `<span style="color:grey;white-space:pre">${key.padEnd(keyLen)}:</span> ${VP_STATS[key]}<br>`;
  });

  const infoElement = document.getElementById('info');
  infoElement.innerHTML = html;
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
  ResizeViewport, // (wpx: number, hpx: number) => void
  // viewport status
  AddViewportStatus
};
