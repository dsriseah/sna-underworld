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
import { ConsoleStyler } from 'ursys/client';
import * as Screen from '../system-screen.ts';
import { _d, WorldToScreen } from '../viewport/vp-util.ts';

/// TYPE DECLARATIONS /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = true;
const LOG = console.log.bind(this);
const PR = ConsoleStyler('stars', 'TagRed');

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DIM = 2; // number of starfield grids (2x2) do not change!!!
const SPC = 100; // avg spacing between stars in screenspace pixels
const SIZE = 3; // size of the stars in screenspace pixels

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class SNA_Starfield extends THREE.Points {
  wrapX: (wx: number) => number; // clamp worldX to viewport
  wrapY: (wy: number) => number; // clamp worldY to viewport
  color: THREE.Color;
  parallax: number;

  /// INIT ///

  constructor(color: THREE.Color, opt?: { parallax: number }) {
    super();
    this.color = color;
    const { width, height } = Screen.GetViewport().dimensions();
    if (DBG) LOG(...PR(`Background Dimensions: ${width}x${height}`));
    this.makeWorldClampFunctions();
    const { parallax } = opt || { parallax: 0.5 };
    this.parallax = parallax;
    const geo = this.makePointGeometry(color);
    const mat = new THREE.PointsMaterial({
      color: color || 0xffffff,
      size: SIZE
    });
    this.material = mat;
    this.geometry = geo;
  }

  makePointGeometry(color: THREE.Color) {
    const { width, height } = Screen.GetViewport().dimensions();
    const starCol = (width / SPC) * DIM;
    const starRow = (height / SPC) * DIM;
    if (DBG) LOG(...PR(`StarCount: ${starCol}x${starRow} = ${starCol * starRow}`));

    let numPoints = starCol * starRow;
    let off = numPoints / (DIM * DIM); // the geometry
    if (Math.floor(off) !== off)
      console.error('point cloud needs to have pointnum divisible by 4');

    let positions = new Float32Array(numPoints * 3);
    let colors = new Float32Array(numPoints * 3);

    // calculate colors and positions array
    let k = 0; // index for positions array
    let dx = 1 / starCol;
    let dy = 1 / starRow;

    // iterate across the entire grid to genereate normalized coordinates
    for (let i = 0; i < starCol / 2; i++) {
      for (let j = 0; j < starRow / 2; j++) {
        // uv is the gridded coordinate normalized to -0.5 to +0.5
        let u = i / starCol - 0.5;
        let v = j / starRow - 0.5;
        // randomize the position slightly to create a more natural look
        let x = u - (Math.random() - 0.5) * dx;
        let y = v - (Math.random() - 0.5) * dy;
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

    if (DBG) {
      LOG(...PR(`Plotted ${k} stars x 4 = ${k * 4}`));
      // find min, max of positions
      let min = Math.min(...positions);
      let max = Math.max(...positions);
      LOG(...PR(`Position Range: ${min.toFixed(2)} to ${max.toFixed(2)}`));
    }

    // create geometry buffer
    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.scale(width, height, 1);
    geometry.scale(DIM, DIM, 1);
    return geometry;
  }

  /** set the parallax effect factor */
  setParallax(p: number) {
    this.parallax = p;
  }

  /** create clamp functions */
  makeWorldClampFunctions() {
    const { worldUnits } = GetViewConfig();
    const halfWidth = (worldUnits / 2) * DIM;
    const halfHeight = (worldUnits / 2) * DIM;
    const clampWidth = halfWidth / 2;
    const clampHeight = halfHeight / 2;

    this.wrapX = (wx: number) => {
      wx = wx % halfWidth;
      if (wx > clampWidth) wx -= worldUnits;
      else if (wx < -clampWidth) wx += worldUnits;
      return wx;
    };
    this.wrapY = (wy: number) => {
      wy = wy % halfHeight;
      if (wy > clampHeight) return (wy -= worldUnits);
      if (wy < -halfHeight) return (wy += worldUnits);
      return wy;
    };
  }

  /* given a world position, wrap it to the starfield */
  wrapCoordinates(wx: number, wy: number) {
    return [this.wrapX(wx), this.wrapY(wy)];
  }

  /// POSITION WITHIN FIELD ///

  /** main method to set the position of the starfield */
  trackXYZ(wx: number, wy: number, z: number) {
    const VP = Screen.GetViewport();
    const [xx, yy] = this.wrapCoordinates(-wx * this.parallax, -wy * this.parallax);
    const [sx, sy] = WorldToScreen(VP, xx, yy);

    // flicker
    if (Math.random() > 0.9) this.visible = false;
    else this.visible = true;

    this.position.x = sx;
    this.position.y = sy;
  }
  /** track a THREE.Vector3 position */
  track(v3: THREE.Vector3) {
    this.trackXYZ(v3.x, v3.y, v3.z);
  }
  /* track a 2D position */
  trackXY(x: number, y: number) {
    this.trackXYZ(x, y, this.position.z);
  }
  /* track just x */
  TrackX(x: number) {
    this.trackXYZ(x, this.position.y, this.position.z);
  }
  /* track just y */
  TrackY(y: number) {
    this.trackXYZ(this.position.x, y, this.position.z);
  }
}

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export { SNA_Starfield };
