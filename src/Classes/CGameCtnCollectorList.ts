/**
 * Chunk 0x0301b000
 */
export default class CGameCtnCollectorList {
	static 0x000: Chunk = (r) => {
		let blockSet = [];

		const archiveCount = r.readUInt32();

		for (let i = 0; i < archiveCount; i++) {
			const blockName = r.readLookbackString();
			const collection = r.readLookbackString();
			const author = r.readLookbackString();
			const nbPieces = r.readUInt32();

			blockSet.push({
				blockName,
				collection,
				author,
				nbPieces,
			});
		}

		return { blockSet };
	};
}
