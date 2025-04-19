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

import { ConsoleStyler, CLASS } from 'ursys/client';
import * as GSTATE from './game-state.ts';

/// TYPE DECLARATIONS /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const LOG = console.log.bind(this);
const PR = ConsoleStyler('MCP', 'TagCyan');
const DBG = true;
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
let GAME_TIMER: number; // game loop timer handle
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const PM = new CLASS.PhaseMachine('SNA_GAME', {
  GAME_INIT: [
    'SYS_INIT', // game system initialization
    'MGR_INIT', // game manager initialization
    'INIT', // non-system module initialization
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
    'PLAY_SOUND', // play sound effects
    'DRAW_WORLD', // threejs draw world
    'DRAW_UI' // draw UI elements over world
  ],
  END: [] // game over
});

/// CONTROL METHODS ///////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** used for data structure initialization */
async function Init() {
  GSTATE.AttachKeyListeners();
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API: Start the game loop */
async function Start() {
  const pre = 'Game Lifecycle';
  LOG(...PR(`${pre} is initializing`));
  const { RunPhaseGroup } = CLASS.PhaseMachine;
  // first run the INIT phase group
  await RunPhaseGroup('SNA_GAME/INIT');
  // then start the game loop
  const { frameRate, frameDurMS } = GSTATE.GetTimeState();
  LOG(...PR(`${pre} tick rate set to ${frameDurMS.toFixed(2)}ms`));
  GAME_TIMER = setInterval(async () => {
    if (frameRate > 0) {
      GSTATE.UpdateStateTimers();
      await RunPhaseGroup('SNA_GAME/LOOP_BEGIN');
      await RunPhaseGroup('SNA_GAME/LOOP_CALC');
      await RunPhaseGroup('SNA_GAME/LOOP_THINK');
      await RunPhaseGroup('SNA_GAME/LOOP_RENDER');
    }
  }, frameDurMS);
  LOG(...PR(`${pre} is running (${frameRate}fps)`));
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API: Stop the game loop */
async function Stop() {
  clearInterval(GAME_TIMER);
  GSTATE.SetFrameRate(0);
  await PM.RunPhaseGroup('SNA_GAME/END');
  LOG(...PR('Stopped Game Loop'));
}

/// ACCESSOR METHODS //////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** Hook into game loop phases */
function HookGamePhase(phase: string, fn: Function) {
  const { HookPhase } = CLASS.PhaseMachine;
  HookPhase(`SNA_GAME/${phase}`, fn);
}

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export {
  Init, // init game loop
  Start, // start game loop
  Stop, // stop the game loop
  //
  HookGamePhase // (phase,fn)=>void
};
