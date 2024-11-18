/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  GAME MAIN ENTRY POINT
  - for detailed example, use snippet 'ur-module-example' instead

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import { SNA, ConsoleStyler } from '@ursys/core';
// SNA system modules
// import MOD_RENDER from './engine/test-renderer.ts';
import MOD_RENDER from './engine/renderer.ts';
import * as MCP from './game-mcp.ts';

/// TYPE DECLARATIONS /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import type { DataObj } from 'tsconfig/types';

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const PR = ConsoleStyler('game.cfg', 'TagGray');
const LOG = console.log.bind(this);

/// HELPER METHODS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function SNA_AddModule({ addModule }) {
  LOG(...PR('Adding Modules'));
  // register all components before SNA.Start() is called
  addModule(MOD_RENDER);
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function SNA_PreConfig(cfg: DataObj) {
  // cfg contains settings from the app config file
  LOG(...PR('SNA_PreConfig'));
  const { data } = cfg;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function SNA_PreHook() {
  LOG(...PR('SNA_PreHook'));
  // SNA.Hook('DOM_READY', () => LOG(...PR('DOM_READY')));
  // SNA.Hook('LOAD_DATA', () => LOG(...PR('LOAD_DATA')));
  // SNA.Hook('LOAD_CONFIG', () => LOG(...PR('LOAD_CONFIG')));
  // SNA.Hook('LOAD_ASSETS', () => LOG(...PR('LOAD_ASSETS')));
  // SNA.Hook('APP_CONFIG', () => LOG(...PR('APP_CONFIG')));
  // SNA.Hook('APP_READY', () => LOG(...PR('APP_READY')));
  // SNA.Hook('APP_RESET', () => LOG(...PR('APP_RESET')));
  // SNA.Hook('APP_START', () => LOG(...PR('APP_START')));
  // SNA.Hook('APP_RUN', () => LOG(...PR('APP_RUN')));
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  SNA.Hook('APP_CONFIG', async () => {
    await MCP.Init();
    LOG(...PR('executed APP_CONFIG'));
  });
  SNA.Hook('APP_RUN', async () => {
    await MCP.Start();
    LOG(...PR('executed APP_RUN'));
  });
}

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default SNA.DeclareModule('launcher', {
  AddModule: SNA_AddModule,
  PreConfig: SNA_PreConfig,
  PreHook: SNA_PreHook
});
