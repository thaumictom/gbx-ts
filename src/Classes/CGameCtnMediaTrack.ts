/**
 * Chunk 0x03078000
 */
export class CGameCtnMediaTrack {
	static 0x001(r: GBXReader) {
		const name = r.readString();
		const numBlocks = r.readUInt32();

		let blocks = [];

		for (let i = 0; i < numBlocks; i++) {
			const block = r.readNodeReference(); // CGameCtnMediaBlock

			blocks.push(block);
		}

		const u1 = r.readUInt32();

		return {
			name,
			blocks,
			u1,
		};
	}
}
