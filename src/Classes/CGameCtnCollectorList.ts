/**
 * Chunk 0x0301b000
 */
export default class CGameCtnCollectorList {
	public blockSet?: { blockName: string; collection: string; author: string; nbPieces: number }[];

	protected 0x0301b000 = ({ r }: Chunk) => {
		this.blockSet = [];

		const archiveCount = r.readUInt32();

		for (let i = 0; i < archiveCount; i++) {
			const blockName = r.readLookbackString();
			const collection = r.readLookbackString();
			const author = r.readLookbackString();
			const nbPieces = r.readUInt32();

			this.blockSet.push({
				blockName,
				collection,
				author,
				nbPieces,
			});
		}
	};
}
