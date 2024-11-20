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
const PR = ConsoleStyler('state', 'TagCyan');
const DBG = true;

/// FRAMERATE STATE ///////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
let FRAME_RATE = 15; // rate in frames per second
let FRAME_DUR_MS = 1000 / FRAME_RATE; // duration of a frame in milliseconds
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const TIME_STATE = {
  timeMS: 0, // increasing game time in milliseconds
  elapsedMS: 0, // since last frame in milliseconds
  frameRate: FRAME_RATE, // current frame rate
  framDurMS: FRAME_DUR_MS // duration of a frame in milliseconds
};

/// VIEW STATE ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const VIEW_STATE = {
  worldUnits: 10 // number of world units per viewport
};

/// PATHS /////////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const PACK_PATH = '_datapack/underworld/'; // relative to htdoc root
const DEF_SPR_NAME = 'sprites/unknown.png';
const PATHS = {
  datapackPath: PACK_PATH,
  defaultSpriteName: DEF_SPR_NAME
};

/// HELPER METHODS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** Update game loop timers */
function Update() {
  if (FRAME_RATE > 0) {
    const oldTime = TIME_STATE.timeMS;
    TIME_STATE.timeMS += FRAME_DUR_MS;
    TIME_STATE.elapsedMS = TIME_STATE.timeMS - oldTime;
    return TIME_STATE;
  }
}

/// ACCESSOR METHODS //////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function GetTimeState() {
  return TIME_STATE;
}
function GameTimeMS() {
  return TIME_STATE.timeMS;
}
function RealFrameIntervalMS() {
  return TIME_STATE.elapsedMS;
}
function FrameIntervalMS() {
  return FRAME_DUR_MS;
}
function FrameRate() {
  return TIME_STATE.frameRate;
}
function SetFrameRate(rate: number) {
  TIME_STATE.frameRate = rate;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function GetViewState() {
  return VIEW_STATE;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function GetPaths() {
  return PATHS;
}

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export {
  // lifecycle
  Update,
  // state objects
  GetTimeState,
  GetViewState,
  GetPaths,
  // time acceessors
  GameTimeMS,
  RealFrameIntervalMS,
  FrameIntervalMS,
  FrameRate,
  SetFrameRate
};
