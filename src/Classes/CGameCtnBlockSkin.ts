import { DataStream } from '../Handlers';

/**
 * Chunk 0x03059000
 */
export default class CGameCtnBlockSkin {
	static 0x002(r: DataStream) {
		const text = r.readString();
		const packDesc = r.readFileReference();
		const parentPackDesc = r.readFileReference();

		return {
			text,
			packDesc,
			parentPackDesc,
		};
	}

	static 0x003(r: DataStream) {
		const version = r.readUInt32();
		const foregroundPackDesc = r.readFileReference();

		return { foregroundPackDesc };
	}
}
