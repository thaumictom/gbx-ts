/**
 * A list of blocks defining the puzzle inventory.
 * @chunk 0x0301b000
 */
export default class CGameCtnCollectorList {
	public blockSet?: { blockModel: IMeta; count: number }[];

	/**
	 * Puzzle pieces
	 */
	protected 0x0301b000 = ({ r }: Chunk) => {
		const nbBlocks = r.readUInt32();

		this.blockSet = r.createArray(nbBlocks, () => {
			const blockModel = r.readMeta();
			const count = r.readUInt32();

			return {
				blockModel,
				count,
			};
		});
	};
}
