/**
 * @chunk 0x03078000
 */
export default class CGameCtnMediaTrack {
	public name?: string;
	public blocks?: any[];

	protected 0x03078001 = ({ r }: Chunk) => {
		this.blocks = [];

		const name = r.readString();
		const nbBlocks = r.readUInt32();

		for (let i = 0; i < nbBlocks; i++) {
			const block = r.readNodeReference(); // CGameCtnMediaBlock

			this.blocks.push(block);
		}

		const u01 = r.readUInt32();
	};
}
