import CGameCtnBlockSkin from './CGameCtnBlockSkin';
import CGameWaypointSpecialProperty from './CGameWaypointSpecialProperty';

/**
 * A placed block.
 * @chunk 0x03057000
 */
export default class CGameCtnBlock {
	public blockName?: string;
	public direction?: number;
	public position?: { x: number; y: number; z: number };
	public flags?: number;
	public author?: string;
	public skin?: CGameCtnBlockSkin;
	public waypointSpecialProperty?: CGameWaypointSpecialProperty;
}
