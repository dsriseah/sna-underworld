/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  SNA_SpriteSeq - This class extends SNA_Sprite to add sequences and 
  spritesheet-based texture setup.
  
\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import { OpReturn } from '@ursys/core';
import * as TextureMgr from '../texture-mgr';
import * as THREE from 'three';
import { SNA_Sprite } from './vis-sprite.ts';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class SNA_SpriteSeq extends SNA_Sprite {
  //
  constructor(spriteMaterial: THREE.SpriteMaterial) {
    super(spriteMaterial);
  }

  /// AUTONOMOUS UPDATES ///

  /** called during UPDATE to animate sprites */
  update(ms: number) {
    super.update(ms);
  }

  /// TEXTURE LOADERS ///

  // _texLoaded(): boolean
  // async setTexture(texPath)
  //

  /// COLOR AND ALPHA ///
  /// see SpriteMaterial and Material properties

  // set opacity(op)
  // get opacity(op)

  /// POSITION ///
  /// see Three.Object3D position property
  /// https://threejs.org/docs/index.html#api/en/core/Object3D

  /// ROTATION ///
  /// sprite rotation is rotation of the material, not Object3D

  // setHeading(rot)
  // changeHeadingBy(rot)

  /// SIZING ///
  /// sizing a sprite is done by scaling the sprite material map

  // setScale(wux: number, hux: number)
  // getMapSize(): { w?: number; h?: number }
  // getVisibleMapSize(): { w?: number; h?: number }
  // getEffectiveScale() {
  // setTextureScaleFactor(tp_to_wu: number): void
  // applyTextureScaleFactor() {
  // setZoom(zoom: number)
  // getZoom()

  /// VISIBILITY ///

  // show()
  // hide()
}

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export { SNA_SpriteSeq };
