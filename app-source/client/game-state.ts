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

import { ConsoleStyler, SNA } from '@ursys/core';

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

/// HTML LAYOUT ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const main_container = 'main-gl';
const ui_container = 'ui-html';
const ui_ctrl_keys = 'keys';
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function GetHTMLLayout() {
  return {
    main_gl: main_container,
    side_ui: ui_container,
    ctrl_keys: ui_ctrl_keys
  };
}

/// KEY STATE /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const KEY_STATE = {
  pressed: new Set() // Set<key>
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function m_UpdateStatus() {
  const css = 'padding:2px 6px;background-color:#333;color:#fff;';
  // get all pressed keys
  const keys = Object.keys(KEY_STATE).filter(key => KEY_STATE[key].pressed);
  const stat = `<span style="color:grey">KEYS:</span> ${keys.join(' ')}`;
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
    m_UpdateStatus();
    event.preventDefault();
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
    m_UpdateStatus();
    event.preventDefault();
  });

  main.addEventListener('click', event => {
    const { clientX, clientY } = event;
    console.log(`CLICK (${clientX}, ${clientY})`);
  });

  main.focus();
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function GetKeyState() {
  return KEY_STATE;
}

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
  Update,
  // state objects
  GetTimeState,
  GetViewState,
  GetPaths,
  GetHTMLLayout,
  GetKeyState,
  // time acceessors
  GameTimeMS,
  RealFrameIntervalMS,
  FrameIntervalMS,
  FrameRate,
  SetFrameRate
};
