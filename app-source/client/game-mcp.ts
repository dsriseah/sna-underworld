/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  top-level game loop module and state
  can be imported by other modules in the 'system' directory

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import { ConsoleStyler, CLASS } from '@ursys/core';

/// TYPE DECLARATIONS /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const LOG = console.log.bind(this);
const PR = ConsoleStyler('RUN CTRL', 'TagCyan');
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
const PM = new PhaseMachine('UWORLD', {
  INIT: [],
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
async function Init() {
  LOG(...PR('Initialized Game Loop'));
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
async function Start() {
  // first run the INIT phase group
  await RunPhaseGroup('UWORLD/INIT');
  // then start the game loop
  GAME_TIMER = setInterval(async () => {
    if (m_UpdateTimers().frameRate > 0) {
      await RunPhaseGroup('UWORLD/LOOP_BEGIN');
      await RunPhaseGroup('UWORLD/LOOP_CALC');
      await RunPhaseGroup('UWORLD/LOOP_THINK');
      await RunPhaseGroup('UWORLD/LOOP_RENDER');
    }
  }, FRAME_DUR_MS);
  LOG(...PR('Started Game Loop'));
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
async function Stop() {
  clearInterval(GAME_TIMER);
  STATE.frameRate = 0;
  await RunPhaseGroup('UWORLD/END');
  LOG(...PR('Stopped Game Loop'));
}

/// ACCESSOR METHODS //////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** Hook into game loop phases */
function HookGamePhase(phase: string, fn: Function) {
  HookPhase(`UWORLD/${phase}`, fn);
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
