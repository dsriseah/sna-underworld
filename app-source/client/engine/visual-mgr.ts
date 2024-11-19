/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  VisualManager - This provides various methods for creating visual elements
  such as sprites, meshes, and lines. 

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import { SNA, ConsoleStyler } from '@ursys/core';
import * as THREE from 'three';
import { HookGamePhase } from '../game-mcp.ts';
import * as TextureMgr from './texture-mgr.ts';
import { SNA_Sprite } from './visual/class-sprite.ts';
import { SNA_Starfield } from './visual/class-starfield.ts';

/// TYPE DECLARATIONS /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = true;
const LOG = console.log.bind(this);
const PR = ConsoleStyler('visual', 'TagGreen');
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DEFAULT_PNG = 'sprites/default.png';
const TEX_LOADER = new THREE.TextureLoader();
const TEXTURES = {};

/// API: SPRITES //////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** create a sprite with size set to texture dimensions */
function MakeStaticSprite(texPath: string) {
  const map = TextureMgr.Load(texPath);
  const mat = new THREE.SpriteMaterial({ map });
  const spr = new THREE.Sprite(mat);
  return spr;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function MakeSNA_Sprite(texPath: string) {
  const map = TextureMgr.Load(texPath);
  const mat = new THREE.SpriteMaterial({ map });
  const spr = new SNA_Sprite(mat);
  return spr;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** create a sprite using default texture */
function MakeDefaultSprite() {
  return MakeSNA_Sprite(DEFAULT_PNG);
  // return MakeStaticSprite(DEFAULT_PNG);
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
export default SNA.DeclareModule('visualfactory', {
  PreHook: () => {
    HookGamePhase('UPDATE', VisualUpdates);
  }
});

/// API EXPORTS ///////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export {
  MakeDefaultSprite, // make a placeholder sprite
  MakeStaticSprite, // make a sprite with a specific texture
  MakeStarField // make a positionable starfield
};
