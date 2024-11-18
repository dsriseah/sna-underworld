/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  01 TEST SPRITE - test basic sprite rendering

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import { SNA, ConsoleStyler } from '@ursys/core';
import { HookGamePhase } from '../game-mcp.ts';
import * as THREE from 'three';
import * as Renderer from '../engine/renderer.ts';

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
  const defaultMap = new THREE.TextureLoader().load(
    '_datapack/underworld/sprites/default.png'
  );
  const defaultMat = new THREE.SpriteMaterial({ map: defaultMap });
  const defaultSprite = new THREE.Sprite(defaultMat);
  VISUALS.sprite = defaultSprite;
  Renderer.RP_AddVisual('world', defaultSprite);

  const shipMap = new THREE.TextureLoader().load(
    '_datapack/underworld/sprites/crixa.png'
  );
  const shipMat = new THREE.SpriteMaterial({ map: shipMap });
  const shipSprite = new THREE.Sprite(shipMat);
  VISUALS.ship = shipSprite;
  shipSprite.translateY(1);
  Renderer.RP_AddVisual('world', shipSprite);

  Renderer.RP_SetBackgroundImage('_datapack/underworld/bg/discord.png');
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function Update() {
  const { sprite, ship } = VISUALS;
  sprite.material.rotation += 0.01;
  ship.material.rotation -= 0.01;
  const VP = Renderer.GetViewport();
  const cam = VP.worldCam();
  cam.position.x += 0.01;
  if (cam.position.x > 1) cam.position.x = -1;
  VP.track(cam.position);
}

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default SNA.DeclareModule('game', {
  PreHook: () => {
    HookGamePhase('CONSTRUCT', async () => {
      LOG(...PR('CONSTRUCT'));
      SetupScene();
    });
    HookGamePhase('UPDATE', () => {
      Update();
    });
  }
});
