/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  SNA_Sprite adds some utility methods to the base THREE.Sprite class

  TODO: add back the sequence and fx code
  
\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import { OpReturn } from '@ursys/core';
import * as THREE from 'three';

/// TYPE DECLARATIONS /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DEFAULT_PNG = '_datapack/underworld/sprites/default.png';
let DEFAULT_SPR_TEXTURE: THREE.Texture;

/// HELPER METHODS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class SNA_Sprite extends THREE.Sprite {
  //
  frac_width: number | null;
  frac_height: number | null;
  zoom: number;
  texture_path: string;
  //
  tex_loader: THREE.TextureLoader;
  constructor(spriteMaterial: THREE.SpriteMaterial) {
    super(spriteMaterial);
    this.tex_loader = new THREE.TextureLoader();
    this.frac_width = null;
    this.frac_height = null;
    this.zoom = 1;
  }

  /// AUTONOMOUS UPDATES ///

  /** called during UPDATE to animate sprites */
  update(ms: number) {}

  /// TEXTURE LOADERS ///

  /** is texture already loaded for sprite? */
  _texLoaded(texPath?: string): boolean {
    if (typeof texPath === 'string') {
      return this.texture_path === texPath;
    }
  }

  /** async load a texture and return it */
  async _loadTexture(texPath: string): Promise<THREE.Texture> {
    if (this._texLoaded(texPath)) return this.material.map;
    return new Promise((resolve, reject) => {
      this.tex_loader.load(
        texPath,
        texture => {
          this.texture_path = texPath;
          resolve(texture);
        },
        undefined,
        err => {
          reject(err);
        }
      );
    });
  }

  /** load a texture and set it as the sprite's texture */
  async setTexture(texPath: string) {
    const tex = await this._loadTexture(texPath);
    tex.mapping = THREE.UVMapping;
    this.material.map = tex;
    this.material.needsUpdate = true;
    const ww = tex.image.width;
    const hh = tex.image.height;
    this.setScaleXYZ(ww, hh, 1);
  }

  /// ROTATION ///

  /** rotate the sprite */
  rotate(rot: number) {
    this.material.rotation = rot;
  }

  /// SIZING ///

  /** get texture size in image dimensions */
  getTextureSize(): OpReturn {
    if (this._texLoaded()) {
      return {
        w: this.material.map.image.width,
        h: this.material.map.image.height
      };
    }
    return { error: 'texture not loaded' };
  }

  /** return fractional size of sprite */
  getSize(): OpReturn {
    if (this._texLoaded()) {
      const fracWidth = this.frac_width || 1;
      const fracHeight = this.frac_height || 1;
      const dim = this.getTextureSize();
      dim.w *= fracWidth;
      dim.h *= fracHeight;
      return dim;
    }
    return {
      error: `texture not yet loaded, size can't be computed`
    };
  }

  /** scale sprite by x,y,z factors */
  setScaleXYZ(x: number, y: number, z: number) {
    const s = this.zoom;
    this.scale.set(s * x, s * y, z);
  }

  /** return the scaling applied to the sprite */
  getScaleXYZ(): OpReturn {
    return { x: this.scale.x, y: this.scale.y, z: this.scale.z };
  }

  /** set the zoom level of the sprite */
  setZoom(s: number): OpReturn {
    this.zoom = s;
    if (this._texLoaded()) {
      const { w, h } = this.getSize();
      this.setScaleXYZ(w, h, 1);
      return { w, h };
    }
    return { error: `texture not yet loaded, zoom can't be computed` };
  }

  /** reutrn the current zoom level */
  getZoom() {
    return this.zoom;
  }

  /// VISIBILITY ///

  /** show the sprite */
  show() {
    this.visible = true;
  }

  /** hide the sprite */
  hide() {
    this.visible = false;
  }
}

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default SNA_Sprite;
export { SNA_Sprite };
