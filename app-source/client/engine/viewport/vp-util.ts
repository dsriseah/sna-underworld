/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  Viewport Utilities 

  See the following guide for more details about the above viewport properties
  https://github.com/dsriseah/ursys/wiki/Guide%3A-CGI-Coordinate-Systems

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import * as THREE from 'three';
import type { Viewport } from './class-viewport.ts';

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
function ScreenToWorld(vp: Viewport, clientX: number, clientY: number) {
  let hw = vp.width / 2;
  let hh = vp.height / 2;
  let cx = vp.camWORLD.position.x;
  let cy = vp.camWORLD.position.y;
  let x = (clientX - hw) * vp.worldScale;
  let y = (clientY - hh) * vp.worldScale;
  return { worldX: x + cx, worldY: y + cy };
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function WorldToScreen(vp: Viewport, worldX: number, worldY: number) {
  let hw = vp.width / 2;
  let hh = vp.height / 2;
  let cx = vp.camWORLD.position.x;
  let cy = vp.camWORLD.position.y;
  let x = (worldX - cx) / vp.worldScale + hw;
  let y = (worldY - cy) / vp.worldScale + hh;
  return { screenX: x, screenY: y };
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
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

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export {
  GetFramingDistance, // (cam3D, fWidth, fHeight, safety?) => distance
  GetWorldUnitsVisible, // (vp: Viewport) => {hw, hh, wu}
  ScreenToWorld, // (vp, clientX, clientY) => {worldX, worldY}
  WorldToScreen, // (vp, worldX, worldY) => {screenX, screenY}
  GetClickedVisual // (vp, scene, x, y) => THREE.Object3D[]
};
