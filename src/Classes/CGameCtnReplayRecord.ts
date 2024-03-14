import GBX from '../GBX';
import CGameCtnChallenge from './CGameCtnChallenge';
import CGameCtnGhost from './CGameCtnGhost';
import CPlugEntRecordData from './CPlugEntRecordData';

/**
 * A replay.
 * @chunk 0x03093000 / 0x2407e000
 */
export default class CGameCtnReplayRecord {
	public authorExtraInfo?: string;
	public authorLogin?: string;
	public authorNickname?: string;
	public authorVersion?: number;
	public authorZone?: string;
	public challengeData?: GBX<CGameCtnChallenge>;
	public controlEntries?: { name: any; time: number; onoff: number; analog: boolean }[];
	public controlNames?: string[];
	public eventsDuration?: number;
	public extras?: { extra1: number; extra2: number }[];
	public game?: string;
	public ghosts?: NodeReference<CGameCtnGhost>[];
	public mapInfo?: IMeta;
	public playerLogin?: string;
	public playerNickname?: string;
	public playgroundScript?: string;
	public recordData?: NodeReference<CPlugEntRecordData>;
	public time?: number;
	public titleId?: string;
	public xml?: string;

	/**
	 * (Header) Basic information
	 */
	protected 0x03093000 = ({ r }: Chunk, f: ChunkFunctions) => {
		const version = f.readVersion(r.readUInt32());

		if (version >= 2) {
			this.mapInfo = r.readMeta();
			this.time = r.readUInt32();
			this.playerNickname = r.readString();
		}

		if (version >= 6) {
			this.playerLogin = r.readString();
		}

		if (version >= 8) {
			f.readUnknown(r.readByte());

			this.titleId = r.readLookbackString();
		}
	};

	/**
	 * (Header) XML data
	 */
	protected 0x03093001 = ({ r }: Chunk) => {
		this.xml = r.readString();
	};

	/**
	 * (Header) Author information
	 * (Body) Track data
	 */
	protected 0x03093002 = ({ r, isHeaderChunk }: Chunk, f: ChunkFunctions) => {
		if (isHeaderChunk) {
			f.readVersion(r.readUInt32());

			this.authorVersion = r.readUInt32();
			this.authorLogin = r.readString();
			this.authorNickname = r.readString();
			this.authorZone = r.readString();
			this.authorExtraInfo = r.readString();

			return;
		}

		const length = r.readUInt32();

		this.challengeData = new GBX({
			stream: r.readBytes(length),
			type: CGameCtnChallenge,
		});
	};

	/**
	 * Validation TM1.0
	 */
	// protected 0x03093003 = ({ r }: Chunk) => {}

	/**
	 * Ghost data
	 */
	protected 0x03093004 = ({ r }: Chunk, f: ChunkFunctions) => {
		f.readVersion(r.readUInt32());
		f.readUnknown(r.readUInt32());

		this.ghosts = r.createArray(r.readUInt32(), () => r.readNodeReference<CGameCtnGhost>()!);

		f.readUnknown(r.readUInt32());
		f.readUnknown(r.readUInt32());
	};

	/**
	 * Unknown
	 */
	protected 0x03093005 = ({ r }: Chunk, f: ChunkFunctions) => {
		f.readUnknown(r.readUInt32());
	};

	/**
	 * (Skippable) Unknown
	 */
	protected 0x03093007 = ({ r }: Chunk, f: ChunkFunctions) => {
		f.readUnknown(r.readUInt32());
	};

	/**
	 * (Skippable) Game
	 */
	protected 0x03093008 = ({ r }: Chunk, f: ChunkFunctions) => {
		this.game = r.readString();
		f.readUnknown(r.readUInt32());
	};

	/**
	 * MediaTracker Clip
	 */
	protected 0x0309300c = ({ r, fullChunkId }: Chunk) => {
		r.forceChunkSkip(fullChunkId!);
	};

	/**
	 * Validation
	 */
	protected 0x0309300d = ({ r }: Chunk, f: ChunkFunctions) => {
		this.eventsDuration = r.readUInt32();

		if (this.eventsDuration == 0) return;

		f.readUnknown(r.readUInt32());

		this.controlNames = r.createArray(r.readUInt32(), () => r.readLookbackString());

		const nbControlEntries = r.readUInt32();

		f.readUnknown(r.readUInt32());

		this.controlEntries = r.createArray(nbControlEntries, () => {
			const time = r.readUInt32() + 100000;
			const controlNameIndex = r.readByte();
			const onoff = r.readUInt32();

			const name = this.controlNames![controlNameIndex];
			const analog = ['Steer', 'Gas', 'AccelerateReal', 'BrakeReal'].includes(name);

			return { name, time, onoff, analog };
		});
	};

	/**
	 * Events
	 */
	protected 0x0309300e = ({ r, fullChunkId }: Chunk) => {
		r.forceChunkSkip(fullChunkId!);
	};

	/**
	 * (Skippable) Game and unknown data
	 */
	protected 0x0309300f = ({ r }: Chunk, f: ChunkFunctions) => {
		this.game = r.readString();

		f.readUnknown(r.readUInt32());
		f.readUnknown(r.readUInt32());
		f.readUnknown(r.readUInt32());
		f.readUnknown(r.readString());
	};

	/**
	 * Simple events display
	 */
	protected 0x03093010 = ({ r, fullChunkId }: Chunk) => {
		r.forceChunkSkip(fullChunkId!);
	};

	/**
	 * Ghost data
	 */
	protected 0x03093014 = ({ r }: Chunk, f: ChunkFunctions) => {
		f.readVersion(r.readUInt32());

		this.ghosts = r.createArray(r.readUInt32(), () => r.readNodeReference<CGameCtnGhost>()!);

		f.readUnknown(r.readUInt32());

		this.extras = r.createArray(r.readUInt32(), () => {
			const extra1 = r.readUInt32();
			const extra2 = r.readUInt32();

			return {
				extra1,
				extra2,
			};
		});
	};

	/**
	 * MediaTracker Clip
	 */
	protected 0x03093015 = ({ r, fullChunkId }: Chunk) => {
		r.forceChunkSkip(fullChunkId!);
	};

	/**
	 * (Skippable) Author information
	 */
	protected 0x03093018 = ({ r }: Chunk) => {
		this.titleId = r.readLookbackString();
		this.authorVersion = r.readUInt32();
		this.authorLogin = r.readString();
		this.authorNickname = r.readString();
		this.authorZone = r.readString();
		this.authorExtraInfo = r.readString();
	};

	/**
	 * (Skippable) Scenery vortex key
	 */
	// protected 0x0309301a = ({ r }: Chunk) => {}

	/**
	 * (Skippable) Player of interest
	 */
	protected 0x0309301b = ({ r }: Chunk, f: ChunkFunctions) => {
		f.readVersion(r.readUInt32());
		f.readUnknown(
			r.createArray(r.readUInt32(), () => {
				return { 1: r.readUInt32(), 2: r.readUInt32() };
			})
		);
	};

	/**
	 * (Skippable) Playground script (Campaign solo)
	 */
	protected 0x0309301c = ({ r }: Chunk, f: ChunkFunctions) => {
		f.readVersion(r.readUInt32());

		this.playgroundScript = r.readString();
	};

	/**
	 * (Skippable) Unknown
	 */
	protected 0x03093021 = ({ r }: Chunk, f: ChunkFunctions) => {
		f.readVersion(r.readUInt32());
		f.readUnknown(r.readBoolean());
	};

	/**
	 * (Skippable) Record data
	 */
	protected 0x03093024 = ({ r }: Chunk, f: ChunkFunctions) => {
		f.readVersion(r.readUInt32());
		f.readUnknown(r.readUInt32());

		this.recordData = r.readNodeReference<CPlugEntRecordData>();
	};

	/**
	 * (Skippable) Unknown
	 */
	protected 0x03093025 = ({ r }: Chunk, f: ChunkFunctions) => {
		f.readVersion(r.readUInt32());
		f.readUnknown(r.readUInt32());
		f.readUnknown(r.readUInt32());
	};
}
