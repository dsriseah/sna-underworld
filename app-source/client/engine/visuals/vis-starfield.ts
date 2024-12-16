/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  Starfield - Parallax Repeating Starfield effect for Orthographic Camera
  Background with same resolution as the canvas. 

  - Use trackXY() to draw the starfield relative to the provided position. 
  - use setParallax() to set the movement factor

  point geometry algorihm

  The number of points in the grid are based on the number of worldunits
  that are visible in the viewport (e.g. 100). 




\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import * as THREE from 'three';
import { GetViewConfig } from '../../game-state.ts';
import { GetViewport } from '../system-screen.ts';

/// TYPE DECLARATIONS /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = true;
const LOG = console.log.bind(this);

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DIM = 2; // number of starfield grids (2x2)
const SPC = 10; // avg spacing between stars in screenspace pixels

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class SNA_Starfield extends THREE.Points {
  width: number; // viewport width
  height: number; // viewport height;
  halfWidth: number; // half viewport width
  halfHeight: number; // half viewport height
  clampWidth: number; // quarter viewport width
  clampHeight: number; // quarter viewport height
  wrapX: (x: number) => number; // clamp x to viewport
  wrapY: (y: number) => number; // clamp y to viewport
  color: THREE.Color;
  parallax: number;

  /// INIT ///

  constructor(color: THREE.Color, opt?: { parallax: number }) {
    super();
    this.color = color;
    const { width, height } = GetViewport().dimensions();
    this.width = width;
    this.height = height;
    this.makeClampFunctions();
    const { parallax } = opt || { parallax: 0 };
    this.parallax = parallax;
    const geo = this.makePointGeometry(color);
    // const geo = m_GenerateDummyGeometry(color);
    const mat = new THREE.PointsMaterial({
      color: color || 0xffffff,
      size: 1
    });
    this.material = mat;
    this.geometry = geo;
  }

  makeClampFunctions() {
    this.halfWidth = this.width / 2;
    this.halfHeight = this.height / 2;
    this.clampWidth = this.halfWidth / 2;
    this.clampHeight = this.halfHeight / 2;
    this.wrapX = (x: number) => {
      if (x > this.clampWidth) return x - this.halfWidth;
      if (x < -this.clampWidth) return x + this.halfWidth;
      return x;
    };
    this.wrapY = (y: number) => {
      if (y > this.clampHeight) return y - this.halfHeight;
      if (y < -this.clampHeight) return y + this.halfHeight;
      return y;
    };
  }

  makePointGeometry(color: THREE.Color) {
    const { width, height } = this;
    const pointsWide = (width / SPC) * DIM;
    const pointsHigh = (height / SPC) * DIM;

    let numPoints = pointsWide * pointsHigh;
    let off = numPoints / (DIM * DIM); // the geometry
    if (Math.floor(off) !== off)
      console.error('point cloud needs to have pointnum divisible by 4');

    let positions = new Float32Array(numPoints * 3);
    let colors = new Float32Array(numPoints * 3);

    // calculate colors and positions array
    let k = 0; // index for positions array
    let dx = 1 / pointsWide;
    let dy = 1 / pointsHigh;

    // iterate across the entire grid to genereate normalized coordinates
    for (let i = 0; i < pointsWide / 2; i++) {
      for (let j = 0; j < pointsHigh / 2; j++) {
        // uv is the gridded coordinate normalized to -0.5 to +0.5
        let u = i / pointsWide - 0.5;
        let v = j / pointsHigh - 0.5;
        // randomize the position slightly to create a more natural look
        // let x = u - (Math.random() - 0.5) * dx;
        // let y = v - (Math.random() - 0.5) * dy;
        let x = u;
        let y = v;
        let z = 0;

        // lower-left quadrant
        positions[3 * k] = x;
        positions[3 * k + 1] = y;
        positions[3 * k + 2] = z;
        // lower-right quadrant
        positions[3 * (k + off) + 0] = x + 0.5;
        positions[3 * (k + off) + 1] = y;
        positions[3 * (k + off) + 2] = z;
        // upper left quadrant
        positions[3 * (k + off * 2) + 0] = x;
        positions[3 * (k + off * 2) + 1] = y + 0.5;
        positions[3 * (k + off * 2) + 2] = z;
        // upper right quadrant
        positions[3 * (k + off * 3) + 0] = x + 0.5;
        positions[3 * (k + off * 3) + 1] = y + 0.5;
        positions[3 * (k + off * 3) + 2] = z;

        let intensity = 0.25 + Math.random();

        // colors for lower-left quadrant
        colors[3 * k] = color.r * intensity;
        colors[3 * k + 1] = color.g * intensity;
        colors[3 * k + 2] = color.b * intensity;
        // colors for lower-right quadrant
        colors[3 * k + off] = color.r * intensity;
        colors[3 * k + off + 1] = color.g * intensity;
        colors[3 * k + off + 2] = color.b * intensity;
        // colors for upper-left quadrant
        colors[3 * k + off * 2] = color.r * intensity;
        colors[3 * k + off * 2 + 1] = color.g * intensity;
        colors[3 * k + off * 2 + 2] = color.b * intensity;
        // colors for upper-right quadrant
        colors[3 * k + off * 3] = color.r * intensity;
        colors[3 * k + off * 3 + 1] = color.g * intensity;
        colors[3 * k + off * 3 + 2] = color.b * intensity;

        // increment the index
        k++;
      }
    }
    // create geometry buffer
    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    // spread points large enough so
    geometry.scale(width, height, 0);
    return geometry;
  }

  /** set the parallax effect factor */
  setParallax(p: number) {
    this.parallax = p;
  }

  wrapCoordinates(x: number, y: number) {
    return {
      x: this.wrapX(x),
      y: this.wrapY(y)
    };
  }

  /// POSITION WITHIN FIELD ///

  /** main method to set the position of the starfield */
  trackXYZ(x: number, y: number, z: number) {
    let xx = -x * this.parallax;
    let yy = -y * this.parallax;
    if (Math.random() > 0.9) this.visible = false;
    else this.visible = true;
    // console.log(`old:${x.toFixed(2)} new:${xx.toFixed(2)}`);
    this.position.x = this.wrapX(xx);
    this.position.y = this.wrapY(yy);
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
