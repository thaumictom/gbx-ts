import CGameCtnBlockSkin from './CGameCtnBlockSkin';
import CGameWaypointSpecialProperty from './CGameWaypointSpecialProperty';

/**
 * A placed block.
 * @chunk 0x03057000
 */
export default class CGameCtnBlock {
	public author?: string;
	public blockName?: string;
	public direction?: Direction;
	public flags?: number;
	public position?: Byte3;
	public skin?: NodeReference<CGameCtnBlockSkin>;
	public waypointSpecialProperty?: NodeReference<CGameWaypointSpecialProperty>;
}
