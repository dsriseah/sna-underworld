/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  Starfield Visual Class

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import { SNA, ConsoleStyler } from '@ursys/core';
import * as THREE from 'three';

/// TYPE DECLARATIONS /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = true;
const LOG = console.log.bind(this);
const PR = ConsoleStyler('starfield', 'TagGreen');

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const STAR_SIZE = 1.5;
const STAR_DENSITY = 10;
const FIELD_SIZE = 2048;
const FIELD_CLAMP = FIELD_SIZE / 2;
const FIELD_BOUND = FIELD_CLAMP / 2;

/// HELPER METHODS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function m_GeneratePointsGeometry(color: THREE.Color) {
  let pointsWide = STAR_DENSITY * 2;
  let pointsHigh = STAR_DENSITY * 2;
  let geometry = new THREE.BufferGeometry();
  let numPoints = pointsWide * pointsHigh;
  let off = numPoints / 4;
  if (Math.floor(off) !== off)
    console.error('point cloud needs to have pointnum divisible by 4');

  let positions = new Float32Array(numPoints * 3);
  let colors = new Float32Array(numPoints * 3);

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

      // console.log(3*k,3*(k+off),3*(k+off*2),3*(k+off*3));
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

      colors[3 * (k + off)] = color.r * intensity;
      colors[3 * (k + off) + 1] = color.g * intensity;
      colors[3 * (k + off) + 2] = color.b * intensity;

      colors[3 * (k + off * 2)] = color.r * intensity;
      colors[3 * (k + off * 2) + 1] = color.g * intensity;
      colors[3 * (k + off * 2) + 2] = color.b * intensity;

      colors[3 * (k + off * 3)] = color.r * intensity;
      colors[3 * (k + off * 3) + 1] = color.g * intensity;
      colors[3 * (k + off * 3) + 2] = color.b * intensity;

      k++;
    }
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.computeBoundingBox();
  return geometry;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*	utility method to calculate repositioning of the starfield to create
    illusion of infinite space with just one grid. */
function u_WrapCoordinates(c) {
  c = c % FIELD_CLAMP;
  if (c > +FIELD_BOUND) c = c - FIELD_CLAMP;
  if (c < -FIELD_BOUND) c = c + FIELD_CLAMP;
  return c;
}

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class StarField extends THREE.Points {
  color: THREE.Color;
  parallax: number;
  geo: THREE.BufferGeometry;
  mat: THREE.PointsMaterial;

  /// INIT ///

  constructor(color: THREE.Color) {
    super();
    this.color = color;
    this.parallax = 1;
    this.geo = m_GeneratePointsGeometry(color);
    this.mat = new THREE.PointsMaterial({
      size: STAR_SIZE,
      vertexColors: true,
      sizeAttenuation: false
    });
  }

  /** set the parallax effect factor */
  setParallax(p) {
    this.parallax = p;
  }

  /// POSITION WITHIN FIELD ///

  /** main method to set the position of the starfield */
  trackXYZ(x: number, y: number, z: number) {
    let xx = u_WrapCoordinates(-x * this.parallax);
    let yy = u_WrapCoordinates(-y * this.parallax);
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
export { StarField };
