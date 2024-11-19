/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  SNA_Sprite - This class extends THREE.Sprite to provide additional methods
  for managing textures, scaling, and visibility. It also provides sequence
  and spritesheet-based texture setup.
  
\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import { OpReturn } from '@ursys/core';
import * as TextureMgr from '../texture-mgr';
import * as THREE from 'three';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class SNA_Sprite extends THREE.Sprite {
  //
  frac_width: number | null;
  frac_height: number | null;
  zoom: number;
  texture_path: string;
  //
  constructor(spriteMaterial: THREE.SpriteMaterial) {
    super(spriteMaterial);
    this.frac_width = null;
    this.frac_height = null;
    this.zoom = 1;
  }

  /// AUTONOMOUS UPDATES ///

  /** called during UPDATE to animate sprites */
  update(ms: number) {}

  /// TEXTURE LOADERS ///

  /** is texture already loaded for sprite? */
  _texLoaded(): boolean {
    return this.material.map !== null;
  }

  /** load a texture and set it as the sprite's texture */
  async setTexture(texPath: string) {
    const tex = await TextureMgr.LoadAsync(texPath);
    this.material.map = tex;
    this.material.needsUpdate = true;
    const ww = tex.image.width;
    const hh = tex.image.height;
    this.setScaleXYZ(ww, hh, 1);
  }

  /// COLOR AND ALPHA ///
  /// see SpriteMaterial and Material properties

  /** add opacity property to sprite */
  set opacity(op: number) {
    if (typeof op !== 'number') {
      this.material.transparent = false;
      this.material.opacity = 1;
    } else {
      this.material.transparent = true;
      this.material.opacity = op;
    }
  }
  get opacity() {
    return this.material.opacity;
  }

  /// POSITION ///
  /// see Three.Object3D position property
  /// https://threejs.org/docs/index.html#api/en/core/Object3D

  /// ROTATION ///
  /// sprite rotation is rotation of the material, not Object3D

  /** add method to set rotation directly */
  setHeading(rot: number) {
    this.material.rotation = rot;
  }

  /** add method to nudge the rotation by an amount */
  changeHeadingBy(rot: number) {
    this.material.rotation -= rot;
  }

  /// SIZING ///
  /// sizing a sprite is done by scaling the sprite material map

  /** get original texture size in image dimensions */
  getTextureSize(): { w: number; h: number } {
    if (this._texLoaded()) {
      const { width, height } = this.material.map.image;
      return {
        w: width,
        h: height
      };
    }
    console.error('getTextureSize: material map not loaded');
    return { w: 0, h: 0 };
  }

  /** return fractional size of sprite, which corresponds
   *  to size in pixels based on the spritesheet dimensions */
  getSize(): { w: number; h: number } {
    if (this._texLoaded()) {
      const fracWidth = this.frac_width || 1;
      const fracHeight = this.frac_height || 1;
      const dim = this.getTextureSize();
      dim.w *= fracWidth;
      dim.h *= fracHeight;
      return dim;
    }
    console.error('getSize: material map not loaded');
    return {
      w: 0,
      h: 0
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
  setZoom(s: number): { w: number; h: number } {
    this.zoom = s;
    if (this._texLoaded()) {
      const { w, h } = this.getSize();
      this.setScaleXYZ(w, h, 1);
      return { w, h };
    }
    console.error('setZoom: material map not loaded');
    return { w: 0, h: 0 };
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
export { SNA_Sprite };
