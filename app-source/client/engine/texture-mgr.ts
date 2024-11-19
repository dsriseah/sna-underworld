/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  TextureManager - manages loaded texture assets in a dictionary. It's used
  by VisualFactory to load and retrieve textures for sprites.

  https://threejs.org/docs/#api/en/loaders/TextureLoader
  this seems to immediately return a texture object, so the datastructure
  is available immediately after the load() call. However, the dimension
  data is not.

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import { SNA, ConsoleStyler } from '@ursys/core';
import * as THREE from 'three';
import { HookGamePhase } from '../game-mcp.ts';
import { GetPaths } from '../game-mcp.ts';

/// TYPE DECLARATIONS /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = true;
const LOG = console.log.bind(this);
const PR = ConsoleStyler('visual', 'TagGreen');
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DATAPACK_DIR = GetPaths().datapackPath;
const DEFAULT_PNG = 'sprites/default.png';
const TEX_LOADER = new THREE.TextureLoader();
const TEXTURES = {};

/// API METHODS ///////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** return a previously loaded texture */
function Get(texPath: string): THREE.Texture {
  return TEXTURES[texPath];
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** load a texture and return a valid data structure even though the asset
 *  may still be loading. */
function Load(texPath: string): THREE.Texture {
  let texture = Get(texPath);
  if (texture) return texture;
  texture = TEX_LOADER.load(DATAPACK_DIR + texPath);
  if (texture) {
    TEXTURES[texPath] = texture;
    return texture;
  }
  throw Error(`texture ${texPath} not found`);
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function LoadAsync(texPath: string): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    let texture = Get(texPath);
    if (texture) resolve(texture);
    else {
      TEX_LOADER.load(
        DATAPACK_DIR + texPath, //
        texture => {
          TEXTURES[texPath] = texture;
          resolve(texture);
        },
        undefined,
        err => reject(err)
      );
    }
  });
}
/// SNA DECLARATION EXPORT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
async function PreloadTextures() {
  LOG(...PR('...preloading', DEFAULT_PNG));
  await LoadAsync(DEFAULT_PNG);
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default SNA.DeclareModule('textures', {
  PreHook: () => {
    HookGamePhase('LOAD_ASSETS', PreloadTextures);
  }
});

/// API EXPORTS ///////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export {
  Get, // get a texture from the cache
  Load, // load a texture and return its map immediately
  LoadAsync // load a texture and promise to return its map
};
