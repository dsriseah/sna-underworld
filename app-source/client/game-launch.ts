/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  GAME LAUNCHER - This is a glue module that is the bridge between the SNA APP
  Lifecyle and the MCP Game Lifecycle that's implemented in game-mcp.ts. These
  are two separate lifecycles: one for the app and one for the game to
  implement a typical game loop of GET_INPUT, UPDATE, DRAW, ASSESS.

  MCP Game Modules also use the SNA_Module hook system to be invoked early
  enough to perform their own initialization ahead of the game starting 
  through the MCP.Start() method. Such modules use the MCP.HookGamePhase()
  method to attach to the game loop phase during SNA PreHook(). See
  renderer.ts for an example!

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import { SNA, ConsoleStyler } from '@ursys/core';
import * as MCP from './game-mcp.ts';
import MOD_RENDER from './engine/renderer.ts';
// import GAME from './games/00-test-mesh.ts';
// import GAME from './games/01-test-sprite.ts';
import GAME from './games/02-test-points.ts';

/// TYPE DECLARATIONS /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import type { DataObj } from 'tsconfig/types';

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const PR = ConsoleStyler('launch', 'TagGray');
const LOG = console.log.bind(this);

/// HELPER METHODS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** Hook for SNA to add modules to the game using the passed function */
function SNA_AddModule({ f_AddModule }) {
  // register all components before SNA.Start() is called
  f_AddModule(MOD_RENDER);
  f_AddModule(GAME);
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** Hook for SNA to provide a configuration object that's passed on
 *  from game-boot that gets it from startup params. */
function SNA_PreConfig(cfg: DataObj) {
  // cfg contains settings from the app config file
  const { data } = cfg;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** Hook for SNA to give module change to attached to APP LIFECYCLE phases
 *  before the app starts up.
 *  WARNING: This is NOT the same as using the MCP HookGamePhase() method,
 *  which is for the GAME LIFECYCLE phases! */
function SNA_PreHook() {
  //
  SNA.Hook('APP_CONFIG', async () => {
    await MCP.Init();
  });
  //
  SNA.Hook('APP_RUN', async () => {
    await MCP.Start();
  });
}

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default SNA.DeclareModule('launcher', {
  AddModule: SNA_AddModule,
  PreConfig: SNA_PreConfig,
  PreHook: SNA_PreHook
});
