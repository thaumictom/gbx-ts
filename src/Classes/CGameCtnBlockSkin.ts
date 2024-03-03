/**
 * Chunk 0x03059000
 */
export default class CGameCtnBlockSkin {
	static 0x002(r: IDataStream) {
		const text = r.readString();
		const packDesc = r.readFileReference();
		const parentPackDesc = r.readFileReference();

		return {
			text,
			packDesc,
			parentPackDesc,
		};
	}

	static 0x003(r: IDataStream) {
		const version = r.readUInt32();
		const foregroundPackDesc = r.readFileReference();

		return { foregroundPackDesc };
	}
}
