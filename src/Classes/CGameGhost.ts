import GameVersion from './Utilities/GameVersion';

/**
 * Ghost data.
 * @chunk 0x0303F000
 */
export default class CGameGhost extends GameVersion {
	public isReplaying?: boolean;
	public sampleData?: number[];

	/**
	 * Old sample data
	 */
	protected 0x0303f003 = ({ r }: Chunk) => {
		const length = r.readUInt32();

		this.sampleData = r.readBytes(length);

		const offsets = r.createArray(r.readUInt32(), () => r.readUInt32());
		const times = r.createArray(r.readUInt32(), () => r.readUInt32());
		const isFixedTimeStep = r.readBoolean();
		const samplePeriod = r.readUInt32();
		const version = r.readUInt32();
	};

	/**
	 * Unknown
	 */
	protected 0x0303f004 = ({ r }: Chunk, f: ChunkFunctions) => {
		f.readUnknown(r.readUInt32());
	};

	/**
	 * Sample data
	 */
	protected 0x0303f005 = ({ r }: Chunk) => {
		const uncompressedSize = r.readUInt32();
		const compressedSize = r.readUInt32();

		this.sampleData = r.readBytes(compressedSize);
	};

	/**
	 * Is replaying and sample data
	 */
	protected 0x0303f006 = (chunk: Chunk) => {
		const { r } = chunk;

		this.isReplaying = r.readBoolean();

		this[0x0303f005](chunk);
	};
}
