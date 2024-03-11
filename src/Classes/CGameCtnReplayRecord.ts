import GBX from '../GBX';
import CGameCtnChallenge from './CGameCtnChallenge';
import CGameCtnGhost from './CGameCtnGhost';

/**
 * Chunk 0x03093000 (0x2407e000)
 */
export default class CGameCtnReplayRecord {
	public mapInfo: IMeta;
	public time: number;
	public playerNickname: string;
	public playerLogin: string;
	public titleUID: string;
	public authorVersion: number;
	public authorLogin: string;
	public authorNickname: string;
	public authorZone: string;
	public authorExtraInfo: string;
	public xml: string;
	public challengeData: GBX<CGameCtnChallenge>;
	public ghosts: any[];
	public extras: any[];

	protected 0x03093000 = ({ r }: Chunk) => {
		const version = r.readUInt32();

		if (version >= 2) {
			this.mapInfo = r.readMeta();
			this.time = r.readUInt32();
			this.playerNickname = r.readString();
		}

		if (version >= 6) {
			this.playerLogin = r.readString();
		}

		if (version >= 8) {
			const u01 = r.readByte();

			this.titleUID = r.readLookbackString();
		}
	};

	protected 0x03093001 = ({ r }: Chunk) => {
		this.xml = r.readString();
	};

	protected 0x03093002 = ({ r, isHeaderChunk }: Chunk) => {
		if (isHeaderChunk) {
			const version = r.readUInt32();

			this.authorVersion = r.readUInt32();
			this.authorLogin = r.readString();
			this.authorNickname = r.readString();
			this.authorZone = r.readString();
			this.authorExtraInfo = r.readString();
		} else {
			const length = r.readUInt32();

			this.challengeData = new GBX<CGameCtnChallenge>({ stream: r.readBytes(length) });
		}
	};

	protected 0x03093007 = ({ r }: Chunk) => {
		const u01 = r.readUInt32();
	};

	protected 0x03093014 = ({ r }: Chunk) => {
		const version = r.readUInt32();

		const nbGhosts = r.readUInt32();

		this.ghosts = r.createArray(nbGhosts, () => r.readNodeReference<CGameCtnGhost>());

		const u01 = r.readUInt32();

		const nbExtras = r.readUInt32();

		this.extras = r.createArray(nbExtras, () => {
			const extra1 = r.readUInt32();
			const extra2 = r.readUInt32();

			return {
				extra1,
				extra2,
			};
		});
	};

	protected 0x03093015 = ({ r, fullChunkId }: Chunk) => {
		r.forceChunkSkip(fullChunkId);
	};
}
