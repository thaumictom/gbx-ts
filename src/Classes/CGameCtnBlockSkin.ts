/**
 * Chunk 0x03059000
 */
export class CGameCtnBlockSkin {
	static 0x002(r: GBXReader) {
		const text = r.readString();
		const packDesc = r.readFileReference();
		const parentPackDesc = r.readFileReference();

		return {
			text,
			packDesc,
			parentPackDesc,
		};
	}

	static 0x003(r: GBXReader) {
		const version = r.readUInt32();
		const secondaryPackDesc = r.readFileReference();

		return secondaryPackDesc;
	}
}
