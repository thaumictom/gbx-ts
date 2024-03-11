/**
 * Chunk 0x0303F000
 */
export default class CGameGhost {
	protected 0x0303f005 = ({ r }: Chunk) => {
		const uncompressedSize = r.readUInt32();
		const compressedSize = r.readUInt32();
		const compressedData = r.readBytes(compressedSize);
	};
}
