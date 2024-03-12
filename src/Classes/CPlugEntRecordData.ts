/**
 * Data of an entity in a timeline.
 * @chunk 0x0911f000
 */
export default class CPlugEntRecordData {
	public uncompressedSize?: number;
	public compressedSize?: number;
	public compressedData?: number[];

	/**
	 * Data of the entity
	 */
	protected 0x0911f000 = ({ r }: Chunk) => {
		const version = r.readUInt32();

		if (version >= 5) {
			this.uncompressedSize = r.readUInt32();
			this.compressedSize = r.readUInt32();
			this.compressedData = r.readBytes(this.compressedSize);
		}
	};
}
