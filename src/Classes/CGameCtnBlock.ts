import Node from './Node';
import CGameCtnBlockSkin from './CGameCtnBlockSkin';
import CGameWaypointSpecialProperty from './CGameWaypointSpecialProperty';

/**
 * A placed block.
 * @chunk 0x03057000
 */
export default class CGameCtnBlock extends Node {
	public author?: string;
	public blockName?: string;
	public direction?: Direction;
	public flags?: number;
	public position?: Byte3;
	public skin?: CGameCtnBlockSkin;
	public waypointSpecialProperty?: CGameWaypointSpecialProperty;
}
