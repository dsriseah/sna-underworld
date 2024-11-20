/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  SNA_Sprite - This class extends THREE.Sprite to provide additional methods
  for managing textures, scaling, and visibility. It also provides sequence
  and spritesheet-based texture setup.
  
\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import * as TextureMgr from '../texture-mgr';
import * as THREE from 'three';
import { GetPaths } from '../../game-state.ts';

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DEFAULT_PNG = GetPaths().defaultSpriteName;

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class SNA_Sprite extends THREE.Sprite {
  //
  texture_path: string;
  baseScale: THREE.Vector3; // the
  tp_to_wu: number; // texturePixel to worldUnit ratio
  zoom: number; // zoom level on top of tp_to_wu scale
  mapSize: THREE.Vector2; // size of the texture map in pixels
  //
  constructor(spriteMaterial?: THREE.SpriteMaterial) {
    if (spriteMaterial === undefined) {
      const map = TextureMgr.Load(DEFAULT_PNG);
      spriteMaterial = new THREE.SpriteMaterial({ map });
      console.log('created sprite with default texture', DEFAULT_PNG);
    }
    super(spriteMaterial);
    this.tp_to_wu = 1; // 1 pixel = 1 world unit
    this.zoom = 1; // no zoom
    this.baseScale = new THREE.Vector3(1, 1, 1);
    this.mapSize = new THREE.Vector2(0, 0);
  }

  /// AUTONOMOUS UPDATES ///

  /** called during UPDATE to animate sprites */
  update(ms: number) {}

  /// TEXTURE LOADERS ///

  /** is texture already loaded for sprite? */
  _texLoaded(): boolean {
    return this.material.map !== null;
  }

  /** asynchronously load a texture and set it as the sprite's texture,
   *  which guarantees that the image map size is set before scaling */
  async setTexture(texPath: string) {
    const tex = await TextureMgr.LoadAsync(texPath);
    this.material.map = tex;
    this.material.needsUpdate = true;
    const ww = tex.image.width;
    const hh = tex.image.height;
    this.mapSize.set(ww, hh);
    // set the scale of the sprite to match the texture size
    this.setScale(ww, hh);
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

  /** set the scale of the sprite using world units */
  setScale(wux: number, hux: number) {
    this.baseScale.set(wux, hux, 1);
    this.scale.set(wux, hux, 1);
  }

  /** return texturemap size in pixels] */
  getMapSize(): { w?: number; h?: number } {
    if (this._texLoaded()) {
      const { width, height } = this.material.map.image;
      return {
        w: width,
        h: height
      };
    }
    console.error('sprite.material.map not yet loaded');
    return {};
  }
  /** return visible portion of texturemap in pixels, which
   *  is a fraction of the total map size for spritesheets */
  getVisibleMapSize(): { w?: number; h?: number } {
    const { w: mw, h: mh } = this.getMapSize();
    if (mw === undefined || mh === undefined) return {};
    const { x: fracW, y: fracH } = this.material.map.repeat;
    return {
      w: mw * fracW,
      h: mh * fracH
    };
  }
  /** calculate the effective scale of the sprite based on the texture scale factor */
  getEffectiveScale() {
    const { w, h } = this.getVisibleMapSize();
    if (w === undefined || h === undefined) return {};
    return { w: w * this.tp_to_wu, h: h * this.tp_to_wu };
  }

  /** the texture scale factor is the ratio of texture pixels to world units,
   *  useful when the image map itself is not to scale with the world units */
  setTextureScaleFactor(tp_to_wu: number): void {
    this.tp_to_wu = tp_to_wu;
    if (this._texLoaded()) {
      this.applyTextureScaleFactor();
    }
  }
  getTextureScaleFactor() {
    return this.tp_to_wu;
  }

  /** Set the scale of the sprite using the saved scale factor:
   *  1. start with texture pixel dimensions of visible map portion
   *  2. multiply by texture scale factor
   *  result is the effective scale of the sprite in world units
   */
  applyTextureScaleFactor() {
    const { w, h } = this.getEffectiveScale();
    if (w === undefined || h === undefined) return {};
    this.scale.set(w, h, 1);
    this.baseScale.x = w; // save the adjusted unitScales
    this.baseScale.y = h;
    return { w, h };
  }

  /// ZOOM BASED ON BASE SCALE ///

  /** Set the zoom level of the sprite based on scale and scale factor
   *  The unitScale is preserved, and the sprite.scale is directly set
   *  based on zoom * unitScale.
   */
  setZoom(zoom: number) {
    this.zoom = zoom;
    this.applyTextureScaleFactor();
    this.scale.set(this.baseScale.x * zoom, this.baseScale.y * zoom, 1);
  }
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
