import CGameCtnGhost from './CGameCtnGhost';

/**
 * Chunk 0x0305b000
 */
export default class CGameCtnChallengeParameters {
	public tip: string;
	public tip1: string;
	public tip2: string;
	public tip3: string;
	public tip4: string;
	public bronzeTime: number;
	public silverTime: number;
	public goldTime: number;
	public authorTime: number;
	public timeLimit: number;
	public authorScore: number;
	public raceValidationGhost: CGameCtnGhost;

	protected 0x0305b001 = ({ r }: Chunk) => {
		this.tip1 = r.readString();
		this.tip2 = r.readString();
		this.tip3 = r.readString();
		this.tip4 = r.readString();
	};

	protected 0x0305b004 = ({ r }: Chunk) => {
		this.bronzeTime = r.readUInt32();
		this.silverTime = r.readUInt32();
		this.goldTime = r.readUInt32();
		this.authorTime = r.readUInt32();

		const u01 = r.readUInt32();
	};

	protected 0x0305b008 = ({ r }: Chunk) => {
		this.timeLimit = r.readUInt32();
		this.authorScore = r.readUInt32();
	};

	protected 0x0305b00a = ({ r }: Chunk) => {
		this.tip = r.readString();

		this.bronzeTime = r.readUInt32();
		this.silverTime = r.readUInt32();
		this.goldTime = r.readUInt32();
		this.authorTime = r.readUInt32();
		this.timeLimit = r.readUInt32();
		this.authorScore = r.readUInt32();
	};

	protected 0x0305b00d = ({ r }: Chunk) => {
		this.raceValidationGhost = r.readNodeReference<CGameCtnGhost>();
	};
}
