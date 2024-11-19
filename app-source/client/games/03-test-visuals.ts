/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  03 TEST VISUALS - fix the VisualManager module

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import { SNA, ConsoleStyler } from '@ursys/core';
import { HookGamePhase } from '../game-mcp.ts';
import * as THREE from 'three';
import * as Renderer from '../engine/renderer.ts';
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
  let sprite = VisualMgr.MakeDefaultSprite();
  Renderer.RP_AddVisual('world', sprite);
  VISUALS.sprite = sprite;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function Prepare() {
  const { sprite } = VISUALS;
  sprite.position.set(0, 0, 0);
  setInterval(() => {
    if (sprite.visible) sprite.hide();
    else sprite.show();
    sprite.opacity = 0.5;
  }, 500);
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function Update() {
  const { sprite } = VISUALS;
  sprite.changeHeadingBy(0.01);
}

/// SNA DECLARATION EXPORT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default SNA.DeclareModule('game', {
  PreHook: () => {
    HookGamePhase('CONSTRUCT', SetupScene);
    HookGamePhase('START', Prepare);
    HookGamePhase('UPDATE', Update);
  }
});
