/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  Base Piece Class - Implements meta properties that may affect how a piece
  interacts with the game world.

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// TYPE DECLARATIONS /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import type { UR_EntID } from 'tsconfig/types';
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
type RoleTypes = 'actor' | 'item' | 'prop' | 'terrain' | 'trigger';
type GroupTypes = 'player' | 'enemy' | 'neutral' | 'decor';
type StatusTypes = 'alive' | 'dead';
interface I_PieceThink {
  update: (stepMS: number) => void;
  think: (stepMS: number) => void;
  overThink?: (stepMS: number) => void;
  execute: (stepMS: number) => void;
}

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
let PIECE_CTR = 0;

/// HELPER METHODS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function NewID(prefix?: string): UR_EntID {
  if (typeof prefix === 'string') return `${prefix}-${PIECE_CTR++}`;
  return `${PIECE_CTR++}`;
}

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
abstract class BasePiece implements I_PieceThink {
  //
  _id: UR_EntID;
  name: string;
  //
  active: boolean; // piece is active in the game world
  roles: Set<RoleTypes>; // piece "roles" (actor, item, prop, terrain, trigger)
  groups: Set<GroupTypes>; // piece "groups" (player, enemy, neutral, etc)
  status: Set<StatusTypes>; // piece "active status" (alive, dead, etc)
  //
  constructor(name: string) {
    this._id = NewID();
    this.name = name || this._id;
    this.active = true;
    this.roles = new Set();
    this.groups = new Set();
    this.status = new Set();
  }

  /// META CHECKS ///

  hasRole(role: RoleTypes): boolean {
    return this.roles.has(role);
  }
  hasRoles(roles: RoleTypes[]): boolean {
    let hasRoles = true;
    return roles.reduce(
      (acc, role) => (this.roles.has(role) ? acc : (hasRoles = false)),
      true
    );
  }
  hasGroup(group: GroupTypes): boolean {
    return this.groups.has(group);
  }
  hasGroups(groups: GroupTypes[]): boolean {
    let hasGroups = true;
    return groups.reduce(
      (acc, group) => (this.groups.has(group) ? acc : (hasGroups = false)),
      true
    );
  }
  isAlive(): boolean {
    return this.status.has('alive');
  }
  isDead(): boolean {
    return this.status.has('dead');
  }

  /// PIECE PROCESSING METHODS ///

  /** called during UPDATE phase. put code for autonomous
   *  updates for things like counters here */
  abstract update(stepMS: number): void;

  /** called during THINK phase. put code for internal AI and
   *  queuing decision-making flags, but no outside effects */
  abstract think(stepMS: number): void;

  abstract overthink(stepMS: number): void;

  /** called during EXECUTE phase. put code for external
   *  effects and actions here */
  abstract execute(stepMS: number): void;
}

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default BasePiece;
export { BasePiece };
export type { RoleTypes };
