/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  04 TEST MAZE - test the maze class

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import { SNA, ConsoleStyler } from '@ursys/core';
import { HookGamePhase } from '../game-mcp.ts';
import { GetViewState } from '../game-state.ts';
import * as THREE from 'three';
import * as Renderer from '../engine/render-mgr.ts';
import * as VisualMgr from '../engine/visual-mgr.ts';
import { MazePlayer } from '../engine/players/play-maze.ts';

/// TYPE DECLARATIONS /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = true;
const LOG = console.log.bind(this);
const PR = ConsoleStyler('game', 'TagOrange');
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const VISUALS: { [key: string]: any } = {};
const PLAYERS: { [key: string]: any } = {};
let WU: number;

/// LIFECYCLE METHODS /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function SetupScene() {
  WU = GetViewState().worldUnits;

  let starBright = [
    new THREE.Color(1.0, 1.0, 1.0),
    new THREE.Color(1.0, 0.5, 0.5),
    new THREE.Color(0.5, 1.0, 0.5),
    new THREE.Color(0.5, 0.5, 1.0),
    new THREE.Color(0.5, 0.5, 0.5)
  ];
  let starSpec = {
    parallax: 1
  };
  let starfields = [];
  for (let i = 0; i < 5; i++) {
    const sb = starBright[i].multiplyScalar(0.1 * starSpec.parallax);
    let sf = VisualMgr.MakeStarField(sb, starSpec);
    starSpec.parallax *= 0.5;
    sf.position.set(0, 0, -100 - i);
    Renderer.RP_AddVisual('bg', sf);
    starfields.push(sf);
  }
  VISUALS.starfields = starfields;

  let maze = new MazePlayer();
  let wallSprites = maze.getVisuals();
  wallSprites.forEach(sprite => {
    Renderer.RP_AddVisual('world', sprite);
  });

  let sprite = VisualMgr.MakeSprite('sprites/ship.png');
  Renderer.RP_AddVisual('world', sprite);
  VISUALS.sprite = sprite;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function Prepare() {
  LOG(...PR('Preparing "04 Test Maze Visual"'));
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function Update() {
  const { sprite, starfields } = VISUALS;
  sprite.changeHeadingBy(0.01);
  const WU2 = WU / 2;
  const ang = sprite.material.rotation;
  // convert head to vector
  const dx = Math.cos(ang);
  const dy = Math.sin(ang);
  // move the sprite
  sprite.position.x += dx * 0.01;
  sprite.position.y += dy * 0.01;
  if (sprite.position.x > WU2) sprite.position.x = -WU2;
  if (sprite.position.y > WU2) sprite.position.x = -WU2;
  // update tracking cameras
  Renderer.GetViewport().track(sprite.position);
  for (let sf of starfields) sf.track(sprite.position);
}

/// SNA DECLARATION EXPORT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default SNA.DeclareModule('04-test-maze', {
  PreHook: () => {
    HookGamePhase('CONSTRUCT', SetupScene);
    HookGamePhase('START', Prepare);
    HookGamePhase('UPDATE', Update);
  }
});
