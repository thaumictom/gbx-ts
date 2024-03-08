/**
 * Chunk 0x0303F000
 */
export default class CGameGhost {
	static 0x005: Chunk = (r) => {
		const uncompressedSize = r.readUInt32();
		const compressedSize = r.readUInt32();
		const compressedData = r.readBytes(compressedSize);

		return null;
	};
}
