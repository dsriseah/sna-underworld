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
import SYS_SCREEN from './engine/system-screen.ts';
import MOD_RENDER from './engine/render-mgr.ts';
import MOD_TEXTURE from './engine/texture-mgr.ts';
import MOD_VISUAL from './engine/visual-mgr.ts';
// import GAME from './games/00-test-mesh.ts';
// import GAME from './games/01-test-sprite.ts';
// import GAME from './games/02-test-points.ts';
// import GAME from './games/03-test-visuals.ts';
// import GAME from './games/04-test-maze.ts';
import GAME from './games/05-test-controls.ts';

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
function SNA_AddComponent({ f_AddComponent }) {
  // register all components before SNA.Start() is called
  f_AddComponent(SYS_SCREEN);
  f_AddComponent(MOD_RENDER);
  f_AddComponent(MOD_TEXTURE);
  f_AddComponent(MOD_VISUAL);
  f_AddComponent(GAME);
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
  SNA.HookAppPhase('APP_CONFIG', async () => {
    await MCP.Init();
  });
  //
  SNA.HookAppPhase('APP_RUN', async () => {
    await MCP.Start();
  });
}

/// SNA DECLARATION EXPORT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default SNA.NewComponent('Launcher', {
  AddComponent: SNA_AddComponent,
  PreConfig: SNA_PreConfig,
  PreHook: SNA_PreHook
});
