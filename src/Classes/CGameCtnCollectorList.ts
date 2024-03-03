/**
 * Chunk 0x0301b000
 */
export class CGameCtnCollectorList {
	static 0x000(r: GBXReader) {
		let blockSet = [];

		const archiveCount = r.readUInt32();

		for (let i = 0; i < archiveCount; i++) {
			const blockName = r.readLookbackString();
			const collection = r.readLookbackString();
			const author = r.readLookbackString();
			const numPieces = r.readUInt32();

			blockSet.push({
				blockName,
				collection,
				author,
				numPieces,
			});
		}

		return { blockSet };
	}
}
