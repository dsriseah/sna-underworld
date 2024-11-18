/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  MASTER CONTROL PROGRAM (MCP) - This is the game loop controller that can be
  accessed by any module to perform game-related state and control tasks. It
  implements the game's critical loops using PhaseMachine.

  Any SNA game component can hook into this system through the provided
  HookGamePhase() method to add their own logic to the game loop. The game
  component must implement the SNA_Module interface to be added to the app's
  construction chain.

  See render.ts for an example of how to hook into the game loop phases, and
  also game-launch.ts for how to add modules to the game.

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import { ConsoleStyler, CLASS } from '@ursys/core';

/// TYPE DECLARATIONS /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const LOG = console.log.bind(this);
const PR = ConsoleStyler('MCP', 'TagCyan');
const DBG = true;
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
let GAME_TIMER: number; // game loop timer handle
let FRAME_RATE = 30; // rate in frames per second
let FRAME_DUR_MS = 1000 / 30; // duration of a frame in milliseconds
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const STATE = {
  timeMS: 0, // increasing game time in milliseconds
  elapsedMS: 0, // since last frame in milliseconds
  frameRate: FRAME_RATE // current frame rate
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const { PhaseMachine } = CLASS;
const PM = new PhaseMachine('SNA_GAME', {
  GAME_INIT: [
    'INIT', // game initialization
    'LOAD_ASSETS', // game asset loading
    'CONSTRUCT', // game object construction
    'START' // game start
  ],
  LOOP_BEGIN: [
    'CHECKS', // game checks
    'REFEREE' // game referee decisions
  ],
  LOOP_CALC: [
    'INPUT', // player, world inputs
    'UPDATE', // autonomous updates (timers)
    'CONDITIONS' // game trigger checks
  ],
  LOOP_THINK: [
    'THINK', // individual piece AI
    'OVERTHINK', // group manager AI
    'EXECUTE' // deferred actions, if any
  ],
  LOOP_RENDER: [
    'DRAW_WORLD', // threejs draw world
    'DRAW_UI', // draw UI elements over world
    'PLAY_SOUND' // play sound effects
  ],
  END: []
});

/// HELPER METHODS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const { RunPhaseGroup, HookPhase } = PhaseMachine;
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** Update game loop timers */
function m_UpdateTimers() {
  if (FRAME_RATE > 0) {
    const oldTime = STATE.timeMS;
    STATE.timeMS += FRAME_DUR_MS;
    STATE.elapsedMS = STATE.timeMS - oldTime;
    return STATE;
  }
}

/// CONTROL METHODS ///////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** used for data structure initialization */
async function Init() {}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API: Start the game loop */
async function Start() {
  LOG(...PR('Game Initializing'));
  // first run the INIT phase group
  await RunPhaseGroup('SNA_GAME/INIT');
  // then start the game loop
  GAME_TIMER = setInterval(async () => {
    if (m_UpdateTimers().frameRate > 0) {
      await RunPhaseGroup('SNA_GAME/LOOP_BEGIN');
      await RunPhaseGroup('SNA_GAME/LOOP_CALC');
      await RunPhaseGroup('SNA_GAME/LOOP_THINK');
      await RunPhaseGroup('SNA_GAME/LOOP_RENDER');
    }
  }, FRAME_DUR_MS);
  LOG(...PR('Game Loop Started'));
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API: Stop the game loop */
async function Stop() {
  clearInterval(GAME_TIMER);
  STATE.frameRate = 0;
  await RunPhaseGroup('SNA_GAME/END');
  LOG(...PR('Stopped Game Loop'));
}

/// ACCESSOR METHODS //////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** Hook into game loop phases */
function HookGamePhase(phase: string, fn: Function) {
  HookPhase(`SNA_GAME/${phase}`, fn);
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** Get current game loop state */
function GetState() {
  return STATE;
}
function GameTimeMS() {
  return STATE.timeMS;
}
function RealFrameIntervalMS() {
  return STATE.elapsedMS;
}
function FrameIntervalMS() {
  return FRAME_DUR_MS;
}
function FrameRate() {
  return STATE.frameRate;
}

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export {
  Init, // init game loop
  Start, // start game loop
  Stop, // stop the game loop
  //
  HookGamePhase, // (phase,fn)=>void
  GetState, // get current game loop state
  //
  GameTimeMS, // current increasing gametime in milliseconds
  FrameIntervalMS, // frame duration in milliseconds based on set frame rate
  RealFrameIntervalMS, // actual frame duration in milliseconds
  FrameRate // current frame rate
};
