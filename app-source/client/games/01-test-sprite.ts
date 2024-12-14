/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  01 TEST SPRITE - test basic sprite rendering

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import { SNA, ConsoleStyler } from '@ursys/core';
import { HookGamePhase } from '../game-mcp.ts';
import { GetPaths } from '../game-state.ts';
import * as THREE from 'three';
import * as Renderer from '../engine/render-mgr.ts';

/// TYPE DECLARATIONS /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = true;
const LOG = console.log.bind(this);
const PR = ConsoleStyler('game', 'TagOrange');
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const VISUALS: { [key: string]: THREE.Sprite } = {};

/// LIFECYCLE METHODS /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function SetupScene() {
  const { datapackPath, defaultSpriteName } = GetPaths();
  const defaultMap = new THREE.TextureLoader().load(datapackPath + defaultSpriteName);
  const defaultMat = new THREE.SpriteMaterial({ map: defaultMap });
  const defaultSprite = new THREE.Sprite(defaultMat);
  defaultSprite.scale.set(10, 10, 1);
  VISUALS.sprite = defaultSprite;
  Renderer.RP_AddVisual('world', defaultSprite);

  const shipMap = new THREE.TextureLoader().load(datapackPath + 'sprites/ship.png');
  const shipMat = new THREE.SpriteMaterial({ map: shipMap });
  const shipSprite = new THREE.Sprite(shipMat);
  VISUALS.ship = shipSprite;
  shipSprite.translateY(20);
  shipSprite.scale.set(10, 10, 1);
  Renderer.RP_AddVisual('world', shipSprite);

  // Renderer.RP_SetBackgroundImage('bg/discord.png');
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function Update() {
  const { sprite, ship } = VISUALS;
  sprite.material.rotation += 0.01;
  ship.material.rotation -= 0.01;
  const VP = Renderer.GetViewport();
  const cam = VP.worldCam();
  cam.position.x += 0.1;
  if (cam.position.x > 1) cam.position.x = -10;
  VP.track(cam.position);
}

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default SNA.NewComponent('01-test-sprite', {
  PreHook: () => {
    HookGamePhase('CONSTRUCT', SetupScene);
    HookGamePhase('UPDATE', Update);
  }
});
