/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  Main Application Entry Point

  The SNA web app compiler will dynamically bundle any .ts file into the
  __app_imports.ts file and use it as an entry point for esbuild.

  Since this is the first module to load, we load other SNA components
  here and initialize them before starting the SNA lifecycle.
  
\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

// @ts-ignore missing type definition from esbuild
import { SNA, ConsoleStyler } from '@ursys/core';

/// TYPE DECLARATIONS /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const LOG = console.log.bind(this);
const PR = ConsoleStyler('app', 'TagGreen');

/// LIFECYCLE HOOKS ///////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
SNA.Hook('LOAD_CONFIG', () => {});

/// RUNTIME ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
(async () => {
  LOG(...PR('Initializing UNDERGROUND App'));

  // Set the global configuration object
  SNA.GlobalConfig({ no_hmr: true, no_urnet: true });

  // After all modules are initialized, start the SNA lifecycle this will
  // call PreConfig() and PreHook() all all registered modules.
  await SNA.Start();
})();
