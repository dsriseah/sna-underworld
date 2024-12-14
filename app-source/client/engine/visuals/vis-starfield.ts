/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  Starfield - This class extends THREE.Points to create a starfield effect
  that can be used as a background for a 3D scene. The starfield has a parallax
  effect that can be adjusted to simulate depth when multiple Starfield
  visuals are used.

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import { SNA, ConsoleStyler } from '@ursys/core';
import { GetViewState } from '../../game-state';
import * as THREE from 'three';

/// TYPE DECLARATIONS /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = true;
const LOG = console.log.bind(this);
const PR = ConsoleStyler('starfield', 'TagGreen');

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const STAR_SIZE = 10; // based on the world units visible in viewport
const STAR_DENSITY = 10; // number of stars per world unit

/// HELPER METHODS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** create a dummy starfield for testing */
function m_GenerateDummyGeometry(color: THREE.Color) {
  const vertices = [];
  for (let i = 0; i < 10000; i++) {
    const x = THREE.MathUtils.randFloatSpread(2000);
    const y = THREE.MathUtils.randFloatSpread(2000);
    const z = THREE.MathUtils.randFloatSpread(2000);
    vertices.push(x, y, z);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  return geometry;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** create a point cloud geometry for the starfield. The algorithm draws a
 *  grid of uniformarly spaced points and then randomly offsets them to create
 *  a more natural look. */
function m_GeneratePointsGeometry(color: THREE.Color) {
  //
  let pointsWide = STAR_DENSITY * 4;
  let pointsHigh = STAR_DENSITY * 4;

  let numPoints = pointsWide * pointsHigh;
  let off = numPoints / 4;
  if (Math.floor(off) !== off)
    console.error('point cloud needs to have pointnum divisible by 4');

  let positions = new Float32Array(numPoints * 3);
  let colors = new Float32Array(numPoints * 3);

  // calculate colors and positions array
  let k = 0;
  let dx = 1 / pointsWide;
  let dy = 1 / pointsHigh;

  for (let i = 0; i < pointsWide / 2; i++) {
    for (let j = 0; j < pointsHigh / 2; j++) {
      let u = i / pointsWide;
      let v = j / pointsHigh;
      let x = u - 0.5 + (Math.random() - 0.5) * dx;
      let y = v - 0.5 + (Math.random() - 0.5) * dy;
      let z = 0;

      // the algorithm produces coordinates between -0.5 and +0.5
      // console.log(3 * k, 3 * (k + off), 3 * (k + off * 2), 3 * (k + off * 3));
      positions[3 * k] = x;
      positions[3 * k + 1] = y;
      positions[3 * k + 2] = z;

      positions[3 * (k + off)] = x + 0.5;
      positions[3 * (k + off) + 1] = y;
      positions[3 * (k + off) + 2] = z;

      positions[3 * (k + off * 2)] = x;
      positions[3 * (k + off * 2) + 1] = y + 0.5;
      positions[3 * (k + off * 2) + 2] = z;

      positions[3 * (k + off * 3)] = x + 0.5;
      positions[3 * (k + off * 3) + 1] = y + 0.5;
      positions[3 * (k + off * 3) + 2] = z;

      let intensity = 0.25 + Math.random();

      colors[3 * k] = color.r * intensity;
      colors[3 * k + 1] = color.g * intensity;
      colors[3 * k + 2] = color.b * intensity;

      const koff = k + off;
      colors[3 * koff] = color.r * intensity;
      colors[3 * koff + 1] = color.g * intensity;
      colors[3 * koff + 2] = color.b * intensity;

      colors[3 * (koff * 2)] = color.r * intensity;
      colors[3 * (koff * 2) + 1] = color.g * intensity;
      colors[3 * (koff * 2) + 2] = color.b * intensity;

      colors[3 * (koff * 3)] = color.r * intensity;
      colors[3 * (koff * 3) + 1] = color.g * intensity;
      colors[3 * (koff * 3) + 2] = color.b * intensity;

      k++;
    }
  }

  // create geometry buffer
  let geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const { worldUnits } = GetViewState();
  geometry.scale(worldUnits * 10, worldUnits * 10, 0);
  return geometry;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**	utility method to calculate repositioning of the starfield to create
 *  illusion of infinite space with just one grid. */
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const FIELD_SIZE = 10; // size of the starfield grid
const FIELD_CLAMP = FIELD_SIZE / 2; // half the size of the field
const FIELD_BOUND = FIELD_CLAMP / 2; // quarter the size of the field
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function u_WrapCoordinates(c: number) {
  c = c % FIELD_CLAMP; // modulus
  if (c > +FIELD_BOUND) c = c - FIELD_CLAMP;
  if (c < -FIELD_BOUND) c = c + FIELD_CLAMP;
  // console.log(`old:${old.toFixed(2)}\tmod:${mod.toFixed(2)}\tnew:${c.toFixed(2)}`);
  return c;
}

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class SNA_Starfield extends THREE.Points {
  color: THREE.Color;
  parallax: number;

  /// INIT ///

  constructor(color: THREE.Color, opt?: { parallax: number }) {
    super();
    this.color = color;
    const { parallax } = opt || { parallax: 0 };
    this.parallax = parallax;
    const geo = m_GeneratePointsGeometry(color);
    // const geo = m_GenerateDummyGeometry(color);
    const { worldUnits } = GetViewState();
    const mat = new THREE.PointsMaterial({
      color: color || 0xffffff,
      size: STAR_SIZE / worldUnits
    });
    this.material = mat;
    this.geometry = geo;
  }

  /** set the parallax effect factor */
  setParallax(p: number) {
    this.parallax = p;
  }

  /// POSITION WITHIN FIELD ///

  /** main method to set the position of the starfield */
  trackXYZ(x: number, y: number, z: number) {
    let xx = -x * this.parallax;
    let yy = -y * this.parallax;
    if (Math.random() > 0.9) this.visible = false;
    else this.visible = true;
    // console.log(`old:${x.toFixed(2)} new:${xx.toFixed(2)}`);
    this.position.x = xx;
    this.position.y = yy;
    this.position.z = z * this.parallax;
  }
  track(v3: THREE.Vector3) {
    this.trackXYZ(v3.x, v3.y, v3.z);
  }
  trackXY(x: number, y: number) {
    this.trackXYZ(x, y, this.position.z);
  }
  TrackX(x: number) {
    this.trackXYZ(x, this.position.y, this.position.z);
  }
  TrackY(y: number) {
    this.trackXYZ(this.position.x, y, this.position.z);
  }
}

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export { SNA_Starfield };
