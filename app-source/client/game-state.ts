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

import { ConsoleStyler } from '@ursys/core';

/// TYPE DECLARATIONS /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const LOG = console.log.bind(this);
const PR = ConsoleStyler('state', 'TagCyan');
const DBG = false;

/// FRAMERATE STATE ///////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
let FRAME_RATE = 60; // rate in frames per second
let FRAME_DUR_MS = 1000 / FRAME_RATE; // duration of a frame in milliseconds
let CUR_SLICE = 0; // current frame slace
let SLICE_MAX = 4; // number of frame slots
let SLICE_INTERVAL = Math.floor(FRAME_RATE / 15); // 1/10th of a second
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const TIME_STATE = {
  timeMS: 0, // increasing game time in milliseconds
  elapsedMS: 0, // since last frame in milliseconds
  frameRate: FRAME_RATE, // current frame rate
  frameDurMS: FRAME_DUR_MS, // duration of a frame in milliseconds
  frameCount: 0 // current frame count
};
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
function FrameCount() {
  return TIME_STATE.frameCount;
}
/** Check if the current frame is a slice of the frame rate, a number from
 *  0 to SLICE_MAX. */
function IsFrameSlice(slot: number = 0) {
  if (TIME_STATE.frameCount % SLICE_INTERVAL == 0) {
    CUR_SLICE++;
    if (CUR_SLICE === SLICE_MAX) CUR_SLICE = 0;
    return CUR_SLICE === slot;
  }
  return false;
}

/// VIEW STATE ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const VIEW_STATE = {
  worldUnits: 100, // number of world units per viewport
  screenUnits: 800 // number of visible pixels per viewport
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function GetViewConfig() {
  const { worldUnits, screenUnits } = VIEW_STATE;
  return { worldUnits, screenUnits };
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function SetViewConfigUnsafe(config) {
  const { worldUnits, screenUnits } = config;
  if (typeof worldUnits === 'number') VIEW_STATE.worldUnits = worldUnits;
  if (typeof screenUnits === 'number') VIEW_STATE.screenUnits = screenUnits;
}

/// PATHS /////////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const PACK_PATH = '_datapack/underworld/'; // relative to htdoc root
const DEF_SPR_NAME = 'sprites/unknown.png';
const PATHS = {
  datapackPath: PACK_PATH,
  defaultSpriteName: DEF_SPR_NAME
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function GetPaths() {
  return PATHS;
}

/// HTML LAYOUT ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const main_container = 'main-gl';
const ui_container = 'ui-html';
const ui_ctrl_keys = 'keys';
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function GetHTMLConfig() {
  return {
    main_gl: main_container,
    side_ui: ui_container,
    ctrl_keys: ui_ctrl_keys
  };
}

/// KEY STATE /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
let KEY_STATE = {
  pressed: new Set() // Set<key>
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function GetKeyState() {
  return KEY_STATE;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function m_UpdateConsole() {
  const css = 'padding:2px 6px;background-color:#333;color:#fff;';
  // get all pressed keys
  const keys = Object.keys(KEY_STATE).filter(key => KEY_STATE[key].pressed);
  const stat = `<span style="color:grey;white-space:pre">KEYS :</span> ${keys.join(' ')}`;
  const keysElement = document.getElementById(ui_ctrl_keys);
  keysElement.innerHTML = stat;
  KEY_STATE.pressed = new Set(keys);
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function AttachKeyListeners() {
  const main = document.getElementById(main_container);
  const css = 'padding:2px 6px;background-color:#333;color:#fff;';

  document.addEventListener('keydown', event => {
    let key;
    if (event.key === ' ') key = 'SPACE';
    else key = event.key.toUpperCase();
    KEY_STATE[key] = {
      pressed: true,
      shift: event.shiftKey,
      ctrl: event.ctrlKey,
      alt: event.altKey,
      meta: event.metaKey
    };
    if (DBG) console.log(`KEY DN: %c${key}`, css);
    m_UpdateConsole();
  });

  document.addEventListener('keyup', event => {
    let key;
    if (event.key === ' ') key = 'SPACE';
    else key = event.key.toUpperCase();
    KEY_STATE[key] = {
      pressed: false,
      shift: event.shiftKey,
      ctrl: event.ctrlKey,
      alt: event.altKey,
      meta: event.metaKey
    };
    // console.log(`KEY UP: %c${key}`, css);
    m_UpdateConsole();
    event.preventDefault();
  });

  main.focus();
}

/// LIFECYCLE METHODS /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** Update game loop timers */
function UpdateStateTimers() {
  if (FRAME_RATE > 0) {
    const oldTime = TIME_STATE.timeMS;
    TIME_STATE.timeMS += FRAME_DUR_MS;
    TIME_STATE.elapsedMS = TIME_STATE.timeMS - oldTime;
    TIME_STATE.frameCount++;
    return TIME_STATE;
  }
}

/// SNA DECLARATION EXPORT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// game-stat is a special top-level module, so initialization is handled by
/// game-mcp rather than using the SNA module system because that would result
/// in a circular dependency.

/// API EXPORTS ///////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export {
  // lifecycle
  AttachKeyListeners,
  UpdateStateTimers,
  // config objects
  GetViewConfig,
  SetViewConfigUnsafe,
  // state objects
  GetTimeState,
  GetPaths,
  GetHTMLConfig,
  GetKeyState,
  // time acceessors
  GameTimeMS,
  RealFrameIntervalMS,
  FrameIntervalMS,
  FrameRate,
  SetFrameRate,
  FrameCount,
  // utilities
  IsFrameSlice
};
