import Node from './Node';
import CGameCtnGhost from './CGameCtnGhost';

/**
 * Parameters of a map.
 * @chunk 0x0305b000
 */
export default class CGameCtnChallengeParameters extends Node {
	public authorScore?: number;
	public authorTime?: number;
	public bronzeTime?: number;
	public goldTime?: number;
	public isValidatedForScriptModes?: boolean;
	public mapStyle?: string;
	public mapType?: string;
	public raceValidationGhost?: CGameCtnGhost;
	public silverTime?: number;
	public timeLimit?: number;
	public tip?: string;
	public tip1?: string;
	public tip2?: string;
	public tip3?: string;
	public tip4?: string;

	/**
	 * Unknown
	 */
	protected 0x0305b000 = ({ r }: Chunk, f: ChunkFunctions) => {
		f.readUnknown(r.readUInt32());
		f.readUnknown(r.readUInt32());
		f.readUnknown(r.readUInt32());
		f.readUnknown(r.readUInt32());
		f.readUnknown(r.readUInt32());
		f.readUnknown(r.readUInt32());
		f.readUnknown(r.readUInt32());
		f.readUnknown(r.readUInt32());
	};

	/**
	 * Tips
	 */
	protected 0x0305b001 = ({ r }: Chunk) => {
		this.tip1 = r.readString();
		this.tip2 = r.readString();
		this.tip3 = r.readString();
		this.tip4 = r.readString();
	};

	/**
	 * Unknown
	 */
	protected 0x0305b002 = ({ r }: Chunk, f: ChunkFunctions) => {
		f.readUnknown(r.readUInt32());
		f.readUnknown(r.readUInt32());
		f.readUnknown(r.readUInt32());
		f.readUnknown(r.readFloat());
		f.readUnknown(r.readFloat());
		f.readUnknown(r.readFloat());
		f.readUnknown(r.readUInt32());
		f.readUnknown(r.readUInt32());
		f.readUnknown(r.readUInt32());
		f.readUnknown(r.readUInt32());
		f.readUnknown(r.readUInt32());
		f.readUnknown(r.readUInt32());
		f.readUnknown(r.readUInt32());
		f.readUnknown(r.readUInt32());
		f.readUnknown(r.readUInt32());
		f.readUnknown(r.readUInt32());
	};

	/**
	 * Unknown
	 */
	protected 0x0305b003 = ({ r }: Chunk, f: ChunkFunctions) => {
		f.readUnknown(r.readUInt32());
		f.readUnknown(r.readFloat());
		f.readUnknown(r.readUInt32());
		f.readUnknown(r.readUInt32());
		f.readUnknown(r.readUInt32());
	};

	/**
	 * Medal times
	 */
	protected 0x0305b004 = ({ r }: Chunk, f: ChunkFunctions) => {
		this.bronzeTime = r.readUInt32();
		this.silverTime = r.readUInt32();
		this.goldTime = r.readUInt32();
		this.authorTime = r.readUInt32();

		f.readUnknown(r.readUInt32());
	};

	/**
	 * Unknown
	 */
	protected 0x0305b005 = ({ r }: Chunk, f: ChunkFunctions) => {
		f.readUnknown(r.readUInt32());
		f.readUnknown(r.readUInt32());
		f.readUnknown(r.readUInt32());
	};

	/**
	 * Items
	 */
	protected 0x0305b006 = ({ r }: Chunk, f: ChunkFunctions) => {
		f.readUnknown(r.createArray(r.readUInt32(), () => r.readUInt32()));
	};

	/**
	 * Unknown
	 */
	protected 0x0305b007 = ({ r }: Chunk, f: ChunkFunctions) => {
		f.readUnknown(r.readUInt32());
	};

	/**
	 * Stunts
	 */
	protected 0x0305b008 = ({ r }: Chunk) => {
		this.timeLimit = r.readUInt32();
		this.authorScore = r.readUInt32();
	};

	/**
	 * (Skippable) Medal times
	 */
	protected 0x0305b00a = ({ r }: Chunk) => {
		this.tip = r.readString();

		this.bronzeTime = r.readUInt32();
		this.silverTime = r.readUInt32();
		this.goldTime = r.readUInt32();
		this.authorTime = r.readUInt32();
		this.timeLimit = r.readUInt32();
		this.authorScore = r.readUInt32();
	};

	/**
	 * Race validation ghost
	 */
	protected 0x0305b00d = ({ r }: Chunk) => {
		this.raceValidationGhost = r.readNodeReference<CGameCtnGhost>();
	};

	/**
	 * (Skippable) Map type
	 */
	protected 0x0305b00e = ({ r }: Chunk) => {
		this.mapType = r.readString();
		this.mapStyle = r.readString();
		this.isValidatedForScriptModes = r.readBoolean();
	};
}
