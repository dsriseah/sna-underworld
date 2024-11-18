/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  Piece - This class implements the features that a game piece should have
  such as position, direction, rotation. These parameters are independent
  of the visual representation of the piece, which is handled by the
  piece.visual property and assigned by the game initialization code.

  See AbstractPiece for the abstract class that implements attributes that are
  not "physical" concepts.

  See MovingPiece for the class that implements the physics and movement.

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import * as THREE from 'three';
import AbstractPiece from './class-abstract-piece.ts';

/// TYPE DECLARATIONS /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
type ParametricPath = {
  start: THREE.Vector3;
  end: THREE.Vector3;
  last: THREE.Vector3;
};
type PhysicsBody = any; // todo: physics engine

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class Piece extends AbstractPiece {
  //
  cur_pos: THREE.Vector3; // position x,y,z
  cur_rot: THREE.Vector3; // rot x,y,z
  cur_dir: THREE.Vector3; // normalizing heading
  //
  body: PhysicsBody; // physics body
  //
  interp_pos: ParametricPath; // pathing segement
  //
  visual: THREE.Object3D;

  /// INITIALIZATION ///

  constructor(name: string) {
    super(name);
    this.cur_pos = new THREE.Vector3();
    this.cur_rot = new THREE.Vector3();
    this.cur_dir = new THREE.Vector3();
    this.body = null;
  }

  /// VISUAL MANAGEMENT ///

  setVisual(visual: THREE.Object3D): void {
    this.visual = visual;
  }
  getVisual(): THREE.Object3D {
    return this.visual;
  }

  /// ROTATION METHODS ///

  getRotation(): THREE.Vector3 {
    return this.cur_rot;
  }
  setRotation(rot: THREE.Vector3): void {
    this.cur_rot = rot;
  }
  setRotationXYZ(x: number, y: number, z: number): void {
    this.cur_rot.set(x, y, z);
  }
  rotateX(x: number): void {
    this.cur_rot.setX(x);
  }
  rotateY(y: number): void {
    this.cur_rot.setY(y);
  }
  rotateZ(z: number): void {
    this.cur_rot.setZ(z);
  }

  /// POSITIONING METHODS ///

  getPosition(): THREE.Vector3 {
    return this.cur_pos;
  }
  setPosition(pos: THREE.Vector3): void {
    this.setPositionXYZ(pos.x, pos.y, pos.z);
  }
  setPositionXYZ(x: number, y: number, z: number): void {
    // calculating heading vector based on change
    let hx = x - this.cur_pos.x;
    let hy = y - this.cur_pos.y;
    let hz = z - this.cur_pos.z;
    // update if change in heading is "significant"
    if (hx * hx + hy * hy + hz * hz > 0.0001) {
      this.cur_dir.x = hx;
      this.cur_dir.y = hy;
      this.cur_dir.z = hz;
      this.cur_dir.normalize();
    }
    this.cur_pos.set(x, y, z);
    if (this.visual) this.visual.position.set(x, y, z);
    // if (this.body)
  }

  /// PIECE THINK METHODS ///

  /** called during UPDATE phase. put code for autonomous
   *  updates for things like counters here */
  update(stepMS: number): void {}

  /** called during THINK phase. put code for internal AI and
   *  queuing decision-making flags, but no outside effects */
  think(stepMS: number): void {}

  /** called after THINK phase, allows for second-guessing
   *  decisions */
  overthink(stepMS: number): void {}

  /** called during EXECUTE phase. put code for external
   *  effects and actions here */
  execute(stepMS: number): void {}
}

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default Piece;
export { Piece };
