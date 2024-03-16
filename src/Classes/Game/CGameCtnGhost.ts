import CGameGhost from './CGameGhost';
import CPlugEntRecordData from '../Plug/CPlugEntRecordData';

/**
 * A ghost.
 * @chunk 0x03092000
 */
export default class CGameCtnGhost extends CGameGhost {
	public appearanceVersion?: number;
	public apperanceVersion?: number;
	public badge?: {
		version?: number;
		color?: number[];
		stickers?: { item1: string; item2: string }[];
		layers?: string[];
	};
	public checkpoints?: { time: number; speed?: number; stuntScore?: number }[];
	public controlEntries?: { name: string; time: number; value: number; analog: boolean }[];
	public controlNames?: string[];
	public eventsDuration?: number;
	public ghostAvatarName?: string;
	public ghostClubTag?: string;
	public ghostLogin?: string;
	public ghostNickname?: string;
	public ghostTrigram?: string;
	public ghostUid?: string;
	public ghostZone?: string;
	public hasBadges?: boolean;
	public lightTrailColor?: number[] | Vector3;
	public playerModel?: IMeta;
	public raceTime?: number;
	public recordData?: CPlugEntRecordData;
	public recordingContext?: string;
	public respawns?: number;
	public skinFile?: string;
	public skinPackDescs?: string[];
	public steeringWheelSensitivity?: boolean;
	public stuntScore?: number;
	public validationChallengeUid?: string;
	public validationCpuKind?: number;
	public validationExeChecksum?: number;
	public validationExeVersion?: string;
	public validationOsKind?: number;
	public validationRaceSettings?: string;

	/**
	 * (Skippable) Basic information
	 */
	protected 0x03092000 = ({ r }: Chunk, f: ChunkFunctions) => {
		const version = r.readUInt32();

		if (version >= 9) {
			this.appearanceVersion = r.readUInt32();
		}

		this.playerModel = r.readMeta();
		this.lightTrailColor = r.readVector3();
		this.skinPackDescs = r.createArray(r.readUInt32(), () => r.readFileReference());
		this.hasBadges = r.readBoolean();

		if (this.hasBadges) {
			this.badge = {};

			this.badge.version = r.readUInt32();
			this.badge.color = [r.readUInt32(), r.readUInt32(), r.readUInt32()];

			if (this.badge.version == 0) {
				f.readUnknown(r.readUInt32());
				f.readUnknown(r.readString());
			}

			this.badge.stickers = r.createArray(r.readUInt32(), () => {
				const item1 = r.readString();
				const item2 = r.readString();

				return {
					item1,
					item2,
				};
			});

			this.badge.layers = r.createArray(r.readUInt32(), () => r.readString());
		}

		if (this.apperanceVersion ?? 0 >= 1) {
			f.readUnknown(r.readString());
		}

		this.ghostNickname = r.readString();
		this.ghostAvatarName = r.readString();

		if (version >= 2) {
			this.recordingContext = r.readString();
		}

		if (version >= 4) {
			f.readUnknown(r.readBoolean());
		}

		if (version >= 5) {
			this.recordData = r.readNodeReference<CPlugEntRecordData>();

			f.readUnknown(r.createArray(r.readUInt32(), () => r.readUInt32()));
		}

		if (version >= 6) {
			this.ghostTrigram = r.readString();
		}

		if (version >= 7) {
			this.ghostZone = r.readString();
		}

		if (version >= 8) {
			this.ghostClubTag = r.readString();
		}
	};

	/**
	 * Driver data
	 */
	protected 0x03092003 = ({ r }: Chunk) => {
		this.playerModel = r.readMeta();
		this.skinFile = r.readString();
		this.ghostNickname = r.readString();
	};

	/**
	 * (Skippable) Checkpoints
	 */
	protected 0x03092004 = ({ r }: Chunk) => {
		const nbCheckpoints = r.readUInt32();

		this.checkpoints = r.createArray(nbCheckpoints, () => {
			const time = r.readUInt32();
			const speed = r.readFloat();

			return { time, speed };
		});
	};

	/**
	 * (Skippable) Race time
	 */
	protected 0x03092005 = ({ r }: Chunk) => {
		this.raceTime = r.readUInt32();
	};

	/**
	 * Driver data
	 */
	protected 0x03092006 = ({ r }: Chunk, f: ChunkFunctions) => {
		this.playerModel = r.readMeta();
		this.skinFile = r.readString();

		f.readUnknown(r.readUInt32());

		this.ghostNickname = r.readString();
	};

	/**
	 * Old light trail color
	 */
	protected 0x03092007 = ({ r }: Chunk) => {
		this.lightTrailColor = r.readVector3();
	};

	/**
	 * (Skippable) Respawns
	 */
	protected 0x03092008 = ({ r }: Chunk) => {
		this.respawns = r.readUInt32();
	};

	/**
	 * Light trail color
	 */
	protected 0x03092009 = ({ r }: Chunk) => {
		this.lightTrailColor = [r.readUInt32(), r.readUInt32(), r.readUInt32()];
	};

	/**
	 * (Skippable) Stunt score
	 */
	protected 0x0309200a = ({ r }: Chunk) => {
		this.stuntScore = r.readUInt32();
	};

	/**
	 * (Skippable) Checkpoints
	 */
	protected 0x0309200b = ({ r }: Chunk) => {
		const nbCheckpoints = r.readUInt32();

		this.checkpoints = r.createArray(nbCheckpoints, () => {
			const time = r.readUInt32();
			const stuntScore = r.readUInt32();

			return { time, stuntScore };
		});
	};

	/**
	 * Unknown
	 */
	protected 0x0309200c = ({ r }: Chunk, f: ChunkFunctions) => {
		f.readUnknown(r.readUInt32());
	};

	/**
	 * Driver data
	 */
	protected 0x0309200d = ({ r }: Chunk, f: ChunkFunctions) => {
		this.playerModel = r.readMeta();
		this.skinFile = r.readString();

		f.readUnknown(r.readUInt32());
		f.readUnknown(r.readUInt32());
		f.readUnknown(r.readUInt32());
		f.readUnknown(r.readUInt32());

		this.ghostNickname = r.readString();
	};

	/**
	 * Ghost UID
	 */
	protected 0x0309200e = ({ r }: Chunk) => {
		this.ghostUid = r.readLookbackString();
	};

	/**
	 * Ghost login
	 */
	protected 0x0309200f = ({ r }: Chunk) => {
		this.ghostLogin = r.readString();
	};

	/**
	 * Validation map UID
	 */
	protected 0x03092010 = ({ r }: Chunk) => {
		this.validationChallengeUid = r.readLookbackString();
	};

	/**
	 * Validation (TMU)
	 */
	protected 0x03092011 = ({ r }: Chunk, f: ChunkFunctions, version?: number) => {
		this.eventsDuration = r.readUInt32();

		if (this.eventsDuration == 0 && (version ?? 0) >= 1) return;

		f.readUnknown(r.readUInt32());

		this.controlNames = r.createArray(r.readUInt32(), () => r.readLookbackString());

		const nbControlEntries = r.readUInt32();

		f.readUnknown(r.readUInt32());

		this.controlEntries = r.createArray(nbControlEntries, () => {
			const time = r.readUInt32() - 100000;
			const controlNameIndex = r.readByte();
			const value = r.readUInt32();

			const name = this.controlNames![controlNameIndex];
			const analog = ['Steer', 'Gas', 'AccelerateReal', 'BrakeReal'].includes(name);

			return { name, time, value, analog };
		});

		this.validationExeVersion = r.readString();
		this.validationExeChecksum = r.readUInt32();
		this.validationOsKind = r.readUInt32();
		this.validationCpuKind = r.readUInt32();
		this.validationRaceSettings = r.readString();
	};

	/**
	 * Unknown
	 */
	protected 0x03092012 = ({ r }: Chunk, f: ChunkFunctions) => {
		f.readUnknown(r.readUInt32());
		f.readUnknown(r.readNumbers(16));
	};

	/**
	 * (Skippable) Unknown
	 */
	protected 0x03092013 = ({ r }: Chunk, f: ChunkFunctions) => {
		f.readUnknown(r.readUInt32());
		f.readUnknown(r.readUInt32());
	};

	/**
	 * (Skippable) Unknown
	 */
	protected 0x03092014 = ({ r }: Chunk, f: ChunkFunctions) => {
		f.readUnknown(r.readUInt32());
	};

	/**
	 * Ghost nickname
	 */
	protected 0x03092015 = ({ r }: Chunk) => {
		this.ghostNickname = r.readLookbackString();
	};

	/**
	 * (Skippable) Ghost metadata
	 */
	protected 0x03092017 = ({ r }: Chunk) => {
		this.skinPackDescs = r.createArray(r.readUInt32(), () => r.readFileReference());
		this.ghostNickname = r.readString();
		this.ghostAvatarName = r.readString();
	};

	/**
	 * Player model
	 */
	protected 0x03092018 = ({ r }: Chunk) => {
		this.playerModel = r.readMeta();
	};

	/**
	 * Validation (TMUF)
	 */
	protected 0x03092019 = (chunk: Chunk, f: ChunkFunctions, version?: number) => {
		this[0x03092011](chunk, f, version);
		const { r } = chunk;

		if (this.eventsDuration == 0 && (version ?? 0) >= 1) return;

		f.readUnknown(r.readUInt32());
	};

	/**
	 * (Skippable) Unknown
	 */
	protected 0x0309201a = ({ r }: Chunk, f: ChunkFunctions) => {
		f.readUnknown(r.readUInt32());
	};

	/**
	 * (Skippable) Unknown
	 */
	protected 0x03092023 = ({ r }: Chunk, f: ChunkFunctions) => {
		const version = f.readVersion(r.readUInt32());
		f.readUnknown(r.readString());
		f.readUnknown(r.readUInt32());
		f.readUnknown(r.readString());
		f.readUnknown(r.readUInt32());
		f.readUnknown(r.readUInt32());
		f.readUnknown(r.readString());
		f.readUnknown(r.readUInt32());
		f.readUnknown(r.readString());

		if (version >= 2) {
			f.readUnknown(r.readByte());
			f.readUnknown(r.readUInt32());
			f.readUnknown(r.readUInt32());
		}

		if (version >= 3) {
			f.readUnknown(r.readByte());
			f.readUnknown(r.readByte());
		}
	};

	/**
	 * (Skippable) Validation TM2
	 */
	protected 0x03092025 = (chunk: Chunk, f: ChunkFunctions) => {
		const { r } = chunk;

		const version = f.readVersion(r.readUInt32());

		this[0x03092019](chunk, f, version);

		this.steeringWheelSensitivity = r.readBoolean();
	};

	/**
	 * (Skippable) Unknown
	 */
	protected 0x03092026 = ({ r }: Chunk, f: ChunkFunctions) => {
		f.readUnknown(r.readNumbers(16));
	};
}
