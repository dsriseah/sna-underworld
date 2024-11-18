/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  VISUALFACTORY

  HOOK: 'LOAD_ASSETS'
  .. uses three.ImageUtils.loadTexture
  .. set DEFAULT_SPR_TEXTURE path

  MakeDefaultSprite() : InqSprite
  .. uses three.SpriteMaterial class
  .. returns InqSprite instance

  MakeStaticSprite( textPath, callback ) : InqSprite
  .. uses three.ImageUtils.loadTexture
  .. returns InqSprite instance

  MakeGroundPlane({ width, depth, color }) : three.Mesh
  .. uses three.PlaneGeometry class
  .. uses three.MeshBasicMaterial class
  .. uses three.Mesh class
  .. returns three.Mesh instance

  MakeSphere({ radius, segmentsW, segmentsH }) : three.Mesh
  .. uses three.MeshPhongMaterial class
  .. uses three.SphereGeometry class
  .. uses three.Mesh class
  .. returns three.Mesh instance

  MakeTextSprite( text, parameters ) : three.Sprite
  .. skip for now

  MakeRectangle({ width, height, color }) : three.Mesh
  .. uses three.PlaneGeometry class
  .. uses three.MeshBasicMaterial class
  .. uses three.Mesh class
  .. adds SetPositionByTL, etc positioning methods
  .. returns three.Mesh instance

  MakeCircle({ radius, segments, color }) : three.Mesh
  .. uses three.MeshBasicMaterial class
  .. uses three.CircleGeometry class
  .. uses three.Mesh class
  .. returns three.Mesh instance

  MakeAreaCircle({ radius, segments, color, opacity }) : three.Mesh
  .. uses MakeCircle method
  .. adds opacity and blending to material 

  MakeLine({ color, lineWidth }) : three.Line
  .. uses three.Geometry class
  .. uses three.LineBasicMaterial class
  .. pushes coordinates into the geo.vertices
  .. returns three.Line instance

  MakeStarField({ color, parallax }) : StarField
  .. uses custom StarField 

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import { SNA, ConsoleStyler } from '@ursys/core';
import * as THREE from 'three';
import { HookGamePhase } from '../game-run.ts';
import { SNA_Sprite } from './visual/class-sprite.ts';
import { GetTexture } from './texture-mgr.ts';
import { StarField } from './visual/class-starfield.ts';

/// TYPE DECLARATIONS /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = true;
const LOG = console.log.bind(this);
const PR = ConsoleStyler('visual', 'TagGreen');
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DEFAULT_PNG = '_datapack/underworld/sprites/default.png';
const TEX_LOADER = new THREE.TextureLoader();
const TEXTURES = {};

/// GAME LIFECYCLE HELPERS ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** Invoked by HookGamePhase  in SNA_Module declaration */
function m_UpdateSequencers() {
  // update all sequencers
}

/// API: CUSTOM METHODS ///////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** create a positionable starfield */
function MakeStarField(color: THREE.Color, opt: { parallax: number }): StarField {
  const sf = new StarField(color);
  const { parallax } = opt;
  if (parallax) sf.setParallax(parallax);
  return sf;
}

/// API: SPRITE METHODS ///////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** create a sprite with size set to texture dimensions */
function MakeStaticSprite(texPath: string) {
  const texture = GetTexture(texPath);
  if (texture === undefined) throw Error(`asset ${texPath} not found`);
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
  const spr = new SNA_Sprite(spriteMaterial);
  const { width, height } = texture.image;
  spr.setScaleXYZ(width, height, 1);
  return;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** create a sprite using default texture */
function MakeDefaultSprite() {
  return MakeStaticSprite(DEFAULT_PNG);
}

/// API: MESH METHODS /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function MakeGroundPlane({ width, depth, color }) {}
function MakeSphere({ radius, segmentsW, segmentsH }) {}
function MakeTextSprite(text, parameters) {}
function MakeRectangle({ width, height, color }) {}
function MakeCircle({ radius, segments, color }) {}
function MakeAreaCircle({ radius, segments, color, opacity }) {}

/// API: LINE METHODS /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function MakeLine({ color, lineWidth }) {}

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default SNA.DeclareModule('visualfactory', {
  PreHook: () => {
    HookGamePhase('INIT', async () => {});
    HookGamePhase('UPDATE', () => {
      m_UpdateSequencers();
    });
  }
});
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export {
  MakeDefaultSprite, // make a placeholder sprite
  MakeStaticSprite, // make a sprite with a specific texture
  MakeStarField // make a positionable starfield
};
