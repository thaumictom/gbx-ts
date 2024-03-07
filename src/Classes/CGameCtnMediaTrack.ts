/**
 * Chunk 0x03078000
 */
export default class CGameCtnMediaTrack {
	static 0x001: Chunk = (r) => {
		const name = r.readString();
		const nbBlocks = r.readUInt32();

		let blocks = [];

		for (let i = 0; i < nbBlocks; i++) {
			const block = r.readNodeReference(); // CGameCtnMediaBlock

			blocks.push(block);
		}

		const u01 = r.readUInt32();

		return {
			name,
			blocks,
		};
	};
}
