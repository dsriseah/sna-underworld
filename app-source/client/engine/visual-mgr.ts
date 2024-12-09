/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  VisualManager - This provides various methods for creating visual elements
  such as sprites, meshes, and lines. 

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import { SNA, ConsoleStyler } from '@ursys/core';
import * as THREE from 'three';
import { HookGamePhase } from '../game-mcp.ts';
import * as TextureMgr from './texture-mgr.ts';
import { SNA_Sprite } from './visuals/vis-sprite.ts';
import { SNA_Starfield } from './visuals/vis-starfield.ts';

/// TYPE DECLARATIONS /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = true;
const LOG = console.log.bind(this);
const PR = ConsoleStyler('visual', 'TagGreen');

/// API: SPRITES //////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** create a sprite with size set to texture dimensions */
function MakeSprite(texPath?: string) {
  let mat: THREE.SpriteMaterial;
  if (typeof texPath === 'string') {
    const map = TextureMgr.Load(texPath);
    mat = new THREE.SpriteMaterial({ map });
  }
  const spr = new SNA_Sprite(mat);
  return spr;
}

/// API: CUSTOM VISUALS ///////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** create a positionable starfield */
function MakeStarField(
  color: THREE.Color,
  opt?: { parallax: number }
): SNA_Starfield {
  const sf = new SNA_Starfield(color);
  if (opt !== undefined) {
    const { parallax } = opt;
    if (parallax) sf.setParallax(parallax);
  }
  return sf;
}

/// API: MESHES ///////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function MakeGroundPlane({ width, depth, color }) {}
function MakeSphere({ radius, segmentsW, segmentsH }) {}
function MakeTextSprite(text, parameters) {}
function MakeRectangle({ width, height, color }) {}
function MakeCircle({ radius, segments, color }) {}
function MakeAreaCircle({ radius, segments, color, opacity }) {}

/// API: LINES ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function MakeLine({ color, lineWidth }) {}

/// SNA DECLARATION EXPORT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function VisualUpdates() {
  // update all frame-based autonomous visual elements
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default SNA.NewComponent('VisualMgr', {
  PreHook: () => {
    HookGamePhase('UPDATE', VisualUpdates);
  }
});

/// API EXPORTS ///////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export {
  MakeSprite, // make a placeholder sprite
  MakeStarField // make a positionable starfield
};
