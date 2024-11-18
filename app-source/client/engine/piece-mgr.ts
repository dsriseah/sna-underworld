/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  PIECE MANAGER

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import { SNA, ConsoleStyler } from '@ursys/core';
import * as THREE from 'three';
import { HookGamePhase } from '../game-mcp.ts';
import Piece from './piece/class-piece.ts';
import MovingPiece from './piece/class-moving-piece.ts';

/// TYPE DECLARATIONS /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import type { UR_EntID } from 'tsconfig/types';

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = true;
const LOG = console.log.bind(this);
const PR = ConsoleStyler('piece', 'TagGreen');
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
let PIECE_CTR = 0;
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
let PIECE_DICT: { [id: UR_EntID]: Piece } = {};
let PIECE_LIST: Piece[] = [];
let ACTIVE_PIECES: Piece[] = [];
let MOVING_PIECES: MovingPiece[] = [];

/// HELPER METHODS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function NewPieceID(prefix?: string): UR_EntID {
  if (typeof prefix === 'string') return `${prefix}-${PIECE_CTR++}`;
  return `${PIECE_CTR++}`;
}

/// API: CREATION METHODS /////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function NewPiece(name: string): Piece {
  const piece = new Piece(name);
  PIECE_DICT[piece._id] = piece;
  return piece;
}

/// API: GAME LIFECYCLE METHODS ///////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** call update on every piece defined */
function UpdateAll(stepMS: number) {
  const keys = Object.keys(PIECE_DICT);
  const num = keys.length;
  if (num <= 0) return;
  PIECE_LIST = [];
  for (let i = 0; i < num; i++) {
    const p = PIECE_DICT[keys[i]];
    PIECE_LIST.push(p);
    p.update(stepMS);
  }
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** call think on every piece defined */
function ThinkAll(stepMS: number) {
  const pieces = PIECE_LIST;
  for (let i = 0; i < pieces.length; i++) {
    const p = pieces[i];
    p.think(stepMS);
  }
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** call execute on every piece defined */
function ExecuteAll(stepMS: number) {
  const pieces = PIECE_LIST;
  for (let i = 0; i < pieces.length; i++) {
    const p = pieces[i];
    p.execute(stepMS);
  }
}

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export {
  NewPiece, // return new Piece
  UpdateAll, // call update on every piece defined
  ThinkAll, // call think on every piece defined
  ExecuteAll // call execute on every piece defined
};
