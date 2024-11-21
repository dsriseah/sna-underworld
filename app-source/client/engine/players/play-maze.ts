/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  Maze - This player manages the maze as a player

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import * as VisualMgr from '../visual-mgr.ts';

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const MAZE_DEF = `
X.............XX
..X..XXX..X.....
..X..XXX....XX..
................
..X....XXXXX.X..
X...X......X.X..
X..XXXXX...X...X
..........XX....
XXXX..XX......X.
..............X.
..X..XXXXXX...X.
.X......X.......
.X......X....X..
.XX..X.XXX..XX..
.............X..
..X....X........`;

/// HELPER FUNCTIONS //////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function m_DecodeChar(c: string): number {
  if (c === 'X') return 1;
  return 0;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function m_ParseMaze(def = MAZE_DEF) {
  const rows = def.trim().split('\n');
  const row_count = rows.length;
  const col_count = rows[0].length;
  const maze = [];
  for (let i = 0; i < rows.length; i++) {
    let row = rows[i].trim();
    if (row.length !== col_count) {
      throw new Error(`Row ${i} is not the same length as the first row`);
    }
    let r = [];
    for (let c of row) {
      r.push(m_DecodeChar(c));
    }
    maze.push(r);
  }
  return {
    maze,
    dim_x: row_count,
    dim_y: col_count
  };
}

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class MazePlayer {
  maze: number[][];
  dim_x: number;
  dim_y: number;
  visuals: any[];
  constructor() {
    const { maze, dim_x, dim_y } = m_ParseMaze(MAZE_DEF);
    this.maze = maze;
    this.dim_x = dim_x;
    this.dim_y = dim_y;
  }

  getVisuals() {
    if (Array.isArray(this.visuals)) return this.visuals;
    let visuals = [];
    const hx = this.dim_x / 2;
    const hy = this.dim_y / 2;
    for (let y = 0; y < this.dim_y; y++) {
      for (let x = 0; x < this.dim_x; x++) {
        if (this.maze[y][x] === 1) {
          let wall = VisualMgr.MakeSprite('sprites/wall.png');
          wall.material.map.repeat.set(0.5, 0.5);
          wall.material.map.offset.set(0, 0.5);
          const ss = 3;
          wall.scale.set(ss, ss, 1);
          wall.position.set((x - hx) * ss, (y - hy) * ss, 0);
          visuals.push(wall);
        }
      }
    }
    this.visuals = visuals;
    return visuals;
  }
}

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export { MazePlayer };
