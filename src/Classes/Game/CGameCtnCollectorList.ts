import Node from '../Node';

/**
 * A list of blocks defining the puzzle inventory.
 * @chunk 0x0301b000
 */
export default class CGameCtnCollectorList extends Node {
	public blockSet?: { blockModel: IMeta; count: number }[];

	/**
	 * Puzzle pieces
	 */
	protected 0x0301b000 = ({ r }: Chunk) => {
		this.blockSet = r.createArray(r.readUInt32(), () => {
			const blockModel = r.readMeta();
			const count = r.readUInt32();

			return {
				blockModel,
				count,
			};
		});
	};
}
