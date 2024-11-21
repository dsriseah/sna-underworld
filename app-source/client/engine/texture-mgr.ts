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
import { GetPaths } from '../game-state.ts';

/// TYPE DECLARATIONS /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = true;
const LOG = console.log.bind(this);
const PR = ConsoleStyler('visual', 'TagGreen');
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DATAPACK_DIR = GetPaths().datapackPath;
const DEF_SPR_NAME = GetPaths().defaultSpriteName;
const TEX_LOADER = new THREE.TextureLoader();
const TEXTURES = {};

/// API METHODS ///////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** return a previously loaded texture */
function GetClone(texPath: string): THREE.Texture {
  const tex = TEXTURES[texPath];
  if (tex) {
    const clone = tex.clone();
    clone.colorSpace = 'srgb';
    return clone;
  }
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** return the texture object from the cache */
function GetTexture(texPath: string): THREE.Texture {
  const tex = TEXTURES[texPath];
  if (tex) return tex.clone();
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** load a texture and return a valid data structure even though the asset
 *  may still be loading. By default, a clone of the texture is returned
 *  so you can change .repeat and .offset independently */
function Load(texPath: string, opt?): THREE.Texture {
  const { clone } = opt || { clone: true };
  let texture = clone ? GetClone(texPath) : GetTexture(texPath);
  if (texture) return texture;
  texture = TEX_LOADER.load(DATAPACK_DIR + texPath);
  if (texture) {
    TEXTURES[texPath] = texture;
    texture.colorSpace = 'srgb';
    return texture;
  }
  throw Error(`texture ${texPath} not found`);
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function LoadAsync(texPath: string): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    let texture = GetClone(texPath);
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
  LOG(...PR('.. preloading', DEF_SPR_NAME));
  await LoadAsync(DEF_SPR_NAME);
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default SNA.DeclareModule('TextureMgr', {
  PreHook: () => {
    HookGamePhase('LOAD_ASSETS', PreloadTextures);
  }
});

/// API EXPORTS ///////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export {
  GetClone, // get a texture from the cache
  Load, // load a texture and return its map immediately
  LoadAsync // load a texture and promise to return its map
};
