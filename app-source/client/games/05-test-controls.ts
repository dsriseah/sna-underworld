/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  04 TEST MAZE - test the maze class

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import { SNA, ConsoleStyler } from '@ursys/core';
import { HookGamePhase } from '../game-mcp.ts';
import { GetViewConfig, GetKeyState, GetTimeState } from '../game-state.ts';
import * as THREE from 'three';
import * as Renderer from '../engine/render-mgr.ts';
import * as VisualMgr from '../engine/visual-mgr.ts';
import * as Screen from '../engine/system-screen.ts';
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
  WU = GetViewConfig().worldUnits;

  let starBright = [
    new THREE.Color(1.0, 1.0, 1.0)
    // new THREE.Color(1.0, 0.5, 0.5),
    // new THREE.Color(0.5, 1.0, 0.5),
    // new THREE.Color(0.5, 0.5, 1.0),
    // new THREE.Color(0.5, 0.5, 0.5)
  ];
  let starSpec = {
    parallax: 0.1
  };
  let starfields = [];
  for (let i = 0; i < starBright.length; i++) {
    const sb = starBright[i].multiplyScalar(0.1);
    let sf = VisualMgr.MakeStarField(sb, starSpec);
    starSpec.parallax += 0.1;
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
  sprite.material.map.center.set(0.5, 0.5);
  sprite.setScale(10); // 10 world units = 1/10th of the viewport
  Renderer.RP_AddVisual('world', sprite);
  VISUALS.sprite = sprite;

  /** janky piece definition */
  const ship = {
    sprite,
    s_max_impulse: 1, // max speed in world units
    s_drag: 0.99, // moving friction
    s_thrust_drag: 0.6, // thrust friction
    s_impulse: 0, // impuse accumulator (degrades from friction)
    s_max_speed: 1.5, // max speed in world units/second
    speed: 0, // current speed

    r_max_rate: 0.1, // max turning speed in radians
    r_drag: 0.75, // turning friction
    r_turning: 0, // turning accumulator (degrades from friction)
    heading: 0 // current direction (set to rotation)
  };
  PLAYERS.ship = ship;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function Prepare() {
  LOG(...PR('Preparing "05 Test Controls"'));
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function Update() {
  const { starfields, sprite } = VISUALS;
  const { ship } = PLAYERS;

  const { pressed } = GetKeyState();
  const { frameRate } = GetTimeState();
  const baseFrameRate = 15;
  let frameScale = baseFrameRate / frameRate; // 0.25 at 60fps, 0.5 at 30fps

  const S_IMPULSE = (0.1 * frameScale) / 2;
  const R_TURNING = (0.1 * frameScale) / 2;

  ship.s_impulse *= ship.s_thrust_drag;
  if (pressed.has('W')) {
    ship.s_impulse += S_IMPULSE;
    if (ship.s_impulse > ship.s_max_impulse) ship.s_impulse = ship.s_max_impulse;
  }
  if (pressed.has('S')) {
    ship.s_impulse -= S_IMPULSE / 4;
    if (ship.s_impulse < -ship.s_max_impulse) ship.s_impulse = -ship.s_max_impulse;
  }

  ship.r_turning *= ship.r_drag;
  if (pressed.has('A')) {
    ship.r_turning += R_TURNING;
    if (ship.r_turning > ship.r_max_rate) ship.r_turning = ship.r_max_rate;
  }
  if (pressed.has('D')) {
    ship.r_turning -= R_TURNING;
    if (ship.r_turning < -ship.r_max_rate) ship.r_turning = -ship.r_max_rate;
  }

  ship.speed += ship.s_impulse;
  if (ship.speed > ship.s_max_speed) ship.speed = ship.s_max_speed;
  if (ship.speed < -ship.s_max_speed) ship.speed = -ship.s_max_speed;
  // update position
  const dx = Math.cos(ship.heading);
  const dy = Math.sin(ship.heading);
  sprite.position.x += dx * ship.speed;
  sprite.position.y += dy * ship.speed;
  ship.speed *= ship.s_drag;
  // update rotation
  ship.heading += ship.r_turning;
  if (ship.heading > Math.PI) ship.heading -= Math.PI * 2;
  if (ship.heading < -Math.PI) ship.heading += Math.PI * 2;
  sprite.material.map.rotation = ship.heading;

  // hack: tracking would ordinarily be part of the sprite Update()
  Screen.GetViewport().track(sprite.position);
  for (let sf of starfields) sf.track(sprite.position);
}

/// SNA DECLARATION EXPORT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default SNA.NewComponent('05-test-controls', {
  PreHook: () => {
    HookGamePhase('CONSTRUCT', SetupScene);
    HookGamePhase('START', Prepare);
    HookGamePhase('UPDATE', Update);
  }
});
