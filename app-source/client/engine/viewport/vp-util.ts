/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  Viewport Utilities 

  See the following guide for more details about the above viewport properties
  https://github.com/dsriseah/ursys/wiki/Guide%3A-CGI-Coordinate-Systems

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import * as THREE from 'three';
import type { Viewport } from './class-viewport.ts';
import { AddViewportStatus } from '../system-screen.ts';

/// CAMERA UTILITIES //////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** calculates how far a 3D camera with a particular FOV needs to move back
 *  to show fWidth and fHeight pixels. Used to frame a particular number
 *  of world units */
function GetFramingDistance(cam3D, fWidth, fHeight, safety?) {
  safety = safety || 0.5;
  let buffer = fWidth * safety;

  fWidth += buffer;
  fHeight += buffer;

  // update world3d camera by positioning it
  // to default see the entire world
  let deg2rad = 180 / Math.PI;
  let hfov = deg2rad * (cam3D.fov / 2);
  let tan = Math.tan(hfov);
  let d = Math.max(fWidth / tan, fHeight / tan);

  // console.log("frame",fWidth*2+'x'+fHeight*2,"D="+d.toFixed(2));
  return d;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** given a viewport, calculate the world units visible based on the
 *  current world camera's fov and aspect ratio */
function GetWorldUnitsVisible(vp: Viewport) {
  const cam = vp.camWORLD;
  if (cam instanceof THREE.PerspectiveCamera) {
    let hw = cam.aspect * Math.tan((cam.fov * Math.PI) / 360);
    let hh = Math.tan((cam.fov * Math.PI) / 360);
    let wu = Math.max(hw, hh) * 2;
    return { hw, hh, wu };
  } else if (cam instanceof THREE.OrthographicCamera) {
    let hw = cam.right - cam.left;
    let hh = cam.top - cam.bottom;
    let wu = Math.max(hw, hh);
    return { hw, hh, wu };
  }
}

/// COORDINATE UTILITIES //////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** Convert screen coordinates to world coordinates */
function ScreenToWorld(vp: Viewport, clientX: number, clientY: number) {
  let wx = clientX * vp.worldScale;
  let wy = clientY * vp.worldScale;
  return [wx, wy];
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** Convert world coordinates to screen coordinates */
function WorldToScreen(vp: Viewport, worldX: number, worldY: number) {
  let cx = worldX / vp.worldScale;
  let cy = worldY / vp.worldScale;
  return [cx, cy];
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** UNTESTED method to get the visual clicked by the user */
function GetClickedVisual(
  vp: Viewport,
  scene: THREE.Scene,
  x: number,
  y: number
): THREE.Object3D[] {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  mouse.x = (x / vp.width) * 2 - 1;
  mouse.y = -(y / vp.height) * 2 + 1;
  raycaster.setFromCamera(mouse, vp.worldCam());
  const intersects = raycaster.intersectObjects(scene.children, true);
  return intersects.map(i => i.object);
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** catch-all function for fixing number formatting */
function _d(n: number, places = 2) {
  if (n >= 0) return `+${n.toFixed(places)}`;
  return n.toFixed(places);
}

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export {
  _d, // (n: number) => string (formatted number)
  GetFramingDistance, // (cam3D, fWidth, fHeight, safety?) => distance
  GetWorldUnitsVisible, // (vp: Viewport) => {hw, hh, wu}
  ScreenToWorld, // (vp, clientX, clientY) => {worldX, worldY}
  WorldToScreen, // (vp, worldX, worldY) => {screenX, screenY}
  GetClickedVisual // (vp, scene, x, y) => THREE.Object3D[]
};
