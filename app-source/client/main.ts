/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  URSYS Bare Module Template
  - for detailed example, use snippet 'ur-module-example' instead

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import { SNA, ConsoleStyler } from '@ursys/core';

/// TYPE DECLARATIONS /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import type { SNA_Module } from 'tsconfig/types';

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const PR = ConsoleStyler('main', 'TagSystem');
const LOG = console.log.bind(this);

/// HELPER METHODS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// API METHODS ///////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function SNA_PreHook() {
  SNA.Hook('LOAD_DATA', () => LOG(...PR('LOAD_DATA')));
  SNA.Hook('LOAD_CONFIG', () => LOG(...PR('LOAD_CONFIG')));
  SNA.Hook('LOAD_ASSETS', () => LOG(...PR('LOAD_ASSETS')));
  SNA.Hook('APP_CONFIG', () => LOG(...PR('APP_CONFIG')));
  SNA.Hook('APP_READY', () => LOG(...PR('APP_READY')));
  SNA.Hook('APP_RESET', () => LOG(...PR('APP_RESET')));
  SNA.Hook('APP_RESET', () => LOG(...PR('APP_RESET')));
  SNA.Hook('APP_RUN', () => LOG(...PR('APP_RUN')));
}
const SNA_MODULE: SNA_Module = {
  _name: 'main',
  PreHook: SNA_PreHook
};
export default SNA_MODULE;
