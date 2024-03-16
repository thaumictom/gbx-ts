import Node from '../Node';

/**
 * Data of an entity in a timeline.
 * @chunk 0x0911f000
 */
export default class CPlugEntRecordData extends Node {
	public compressedData?: number[];
	public compressedSize?: number;
	public uncompressedSize?: number;

	/**
	 * Data of the entity
	 */
	protected 0x0911f000 = ({ r }: Chunk, f: ChunkFunctions) => {
		const version = f.readVersion(r.readUInt32());

		if (version >= 5) {
			this.uncompressedSize = r.readUInt32();
			this.compressedSize = r.readUInt32();
			this.compressedData = r.readBytes(this.compressedSize);
		}
	};
}
