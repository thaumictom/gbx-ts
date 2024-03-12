import CGameCtnGhost from './CGameCtnGhost';

/**
 * Parameters of a map.
 * @chunk 0x0305b000
 */
export default class CGameCtnChallengeParameters {
	public tip?: string;
	public tip1?: string;
	public tip2?: string;
	public tip3?: string;
	public tip4?: string;
	public bronzeTime?: number;
	public silverTime?: number;
	public goldTime?: number;
	public authorTime?: number;
	public timeLimit?: number;
	public authorScore?: number;
	public raceValidationGhost?: CGameCtnGhost;
	public mapType?: string;
	public mapStyle?: string;
	public isValidatedForScriptModes?: boolean;

	/**
	 * Unknown
	 */
	protected 0x0305b000 = ({ r }: Chunk) => {
		const u01 = r.readUInt32();
		const u02 = r.readUInt32();
		const u03 = r.readUInt32();
		const u04 = r.readUInt32();
		const u05 = r.readUInt32();
		const u06 = r.readUInt32();
		const u07 = r.readUInt32();
		const u08 = r.readUInt32();
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
	protected 0x0305b002 = ({ r }: Chunk) => {
		const u01 = r.readUInt32();
		const u02 = r.readUInt32();
		const u03 = r.readUInt32();
		const u04 = r.readUInt32(); // Float
		const u05 = r.readUInt32(); // Float
		const u06 = r.readUInt32(); // Float
		const u07 = r.readUInt32();
		const u08 = r.readUInt32();
		const u09 = r.readUInt32();
		const u10 = r.readUInt32();
		const u11 = r.readUInt32();
		const u12 = r.readUInt32();
		const u13 = r.readUInt32();
		const u14 = r.readUInt32();
		const u15 = r.readUInt32();
		const u16 = r.readUInt32();
	};

	/**
	 * Unknown
	 */
	protected 0x0305b003 = ({ r }: Chunk) => {
		const u01 = r.readUInt32();
		const u02 = r.readUInt32(); // Float
		const u03 = r.readUInt32();
		const u04 = r.readUInt32();
		const u05 = r.readUInt32();
	};

	/**
	 * Medal times
	 */
	protected 0x0305b004 = ({ r }: Chunk) => {
		this.bronzeTime = r.readUInt32();
		this.silverTime = r.readUInt32();
		this.goldTime = r.readUInt32();
		this.authorTime = r.readUInt32();

		const u01 = r.readUInt32();
	};

	/**
	 * Unknown
	 */
	protected 0x0305b005 = ({ r }: Chunk) => {
		const u01 = r.readUInt32();
		const u02 = r.readUInt32();
		const u03 = r.readUInt32();
	};

	/**
	 * Items
	 */
	protected 0x0305b006 = ({ r }: Chunk) => {
		const u01 = r.createArray(r.readUInt32(), () => r.readUInt32());
	};

	/**
	 * Unknown
	 */
	protected 0x0305b007 = ({ r }: Chunk) => {
		const u01 = r.readUInt32();
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
		this.raceValidationGhost = r.readNodeReference() as CGameCtnGhost;
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
