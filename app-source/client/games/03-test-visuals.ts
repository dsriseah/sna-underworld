/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  03 TEST VISUALS - fix the VisualManager module

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import { SNA, ConsoleStyler } from '@ursys/core';
import { HookGamePhase, GetViewState } from '../game-mcp.ts';
import * as THREE from 'three';
import * as Renderer from '../engine/render-mgr.ts';
import * as VisualMgr from '../engine/visual-mgr.ts';

/// TYPE DECLARATIONS /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = true;
const LOG = console.log.bind(this);
const PR = ConsoleStyler('game', 'TagOrange');
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const VISUALS: { [key: string]: any } = {};

/// LIFECYCLE METHODS /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function SetupScene() {
  // let starfield = VisualMgr.MakeStarField(new THREE.Color(0x888888));
  // Renderer.RP_AddVisual('world', starfield);
  // VISUALS.starfield = starfield;

  let starBright = [
    new THREE.Color(1.0, 1.0, 1.0),
    new THREE.Color(0.5, 0.5, 0.7),
    new THREE.Color(0.3, 0.3, 0.5)
  ];
  let starSpec = {
    parallax: 1
  };
  let starfields = [];
  for (let i = 0; i < 3; i++) {
    let sf = VisualMgr.MakeStarField(starBright[i], starSpec);
    starSpec.parallax *= 0.5;
    sf.position.set(0, 0, -100 - i);
    Renderer.RP_AddVisual('bg', sf);
    starfields.push(sf);
  }
  VISUALS.starfields = starfields;

  let sprite = VisualMgr.MakeSprite();
  Renderer.RP_AddVisual('world', sprite);
  VISUALS.sprite = sprite;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function Prepare() {
  LOG(...PR('Preparing "03 VisualMgr Test"'));
  const { sprite } = VISUALS;
  setInterval(() => {
    if (sprite.visible) sprite.hide();
    else sprite.show();
    sprite.opacity = 0.5;
  }, 500);
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function Update() {
  const { sprite, starfields } = VISUALS;
  sprite.changeHeadingBy(0.01);
  sprite.position.x += 0.1;
  Renderer.GetViewport().track(sprite.position);
  for (let sf of starfields) sf.track(sprite.position);
}

/// SNA DECLARATION EXPORT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default SNA.DeclareModule('03-test-visuals', {
  PreHook: () => {
    HookGamePhase('CONSTRUCT', SetupScene);
    HookGamePhase('START', Prepare);
    HookGamePhase('UPDATE', Update);
  }
});
