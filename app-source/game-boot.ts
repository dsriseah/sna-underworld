/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  Main Application Entry Point

  The SNA web app compiler will dynamically bundle any .ts file into the
  __app_imports.ts file and use it as an entry point for esbuild.

  Since this is the first module to load, we load other SNA components
  here and initialize them before starting the SNA lifecycle.
  
\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import { SNA, ConsoleStyler } from '@ursys/core';
import MOD_Launcher from './client/game-launch.ts';

/// TYPE DECLARATIONS /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const LOG = console.log.bind(this);
const PR = ConsoleStyler('boot', 'TagGray');

/// LIFECYCLE HOOKS ///////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
SNA.Hook('LOAD_CONFIG', () => {});

/// RUNTIME ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
(async () => {
  LOG(...PR('Initializing UNDERGROUND App'));

  const isSecure = location.protocol === 'https:';
  const noPortSpec = location.port === '';

  const cssPro =
    'color: #008000;padding:4px 8px;' +
    'background-color:#00800020;font-weight:bold;';
  const cssDev =
    'color: #ff0000;padding:4px 8px;' +
    'background-color:#ff000020;font-weight:bold;';

  const cfg: any = {};
  if (isSecure && noPortSpec) {
    LOG('%cRunning in Production Mode', cssPro);
    cfg.no_urnet = true;
    cfg.no_hmr = true;
  } else {
    LOG('%cRunning in Development Mode', cssDev);
  }

  // call global config and then register Launcher, which will register all
  // other modules for the game side.
  console.group('SNA STARTUP INFO');
  SNA.GlobalConfig(cfg);
  SNA.RegisterComponent(MOD_Launcher);
  // After all modules are initialized, start the SNA lifecycle this will
  // call PreConfig() and PreHook() all all registered modules.
  await SNA.Start();
  console.groupEnd();
})();
