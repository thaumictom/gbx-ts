import CGameGhost from './CGameGhost';
import CPlugEntRecordData from './CPlugEntRecordData';

/**
 * A ghost.
 * @chunk 0x03092000
 */
export default class CGameCtnGhost extends CGameGhost {
	public appearanceVersion?: number;
	public playerModel?: IMeta;
	public lightTrailColor?: number[];
	public skinPackDescs?: string[];
	public hasBadges?: boolean;
	public badge?: {
		version?: number;
		color?: number[];
		stickers?: { item1: string; item2: string }[];
		layers?: string[];
	};
	public apperanceVersion?: number;
	public ghostNickname?: string;
	public ghostAvatarName?: string;
	public recordingContext?: string;
	public recordData?: CPlugEntRecordData;
	public ghostTrigram?: string;
	public ghostZone?: string;
	public ghostClubTag?: string;

	public skinFile?: string;
	public checkpoints?: {
		time: number;
		speed: number;
	}[];
	public raceTime?: number;
	public respawns?: number;
	public stuntScore?: number;
	public ghostUid?: string;
	public validateChallengeUid?: string;

	public ghostLogin?: string;
	public eventsDuration?: number;
	public controlNames?: string[];
	public controlEntries?: { name: string; time: number; onoff: number; analog: boolean }[];
	public validationExeVersion?: string;
	public validationExeChecksum?: number;
	public validationOsKind?: number;
	public validationCpuKind?: number;
	public validationRaceSettings?: string;
	public steeringWheelSensitivity?: boolean;

	/**
	 * (Skippable) Basic information
	 */
	protected 0x03092000 = ({ r }: Chunk) => {
		const version = r.readUInt32();

		if (version >= 9) {
			this.appearanceVersion = r.readUInt32();
		}

		this.playerModel = r.readMeta();
		this.lightTrailColor = [r.readUInt32(), r.readUInt32(), r.readUInt32()];
		this.skinPackDescs = r.createArray(r.readUInt32(), () => r.readFileReference());
		this.hasBadges = r.readBoolean();

		if (this.hasBadges) {
			this.badge = {};

			this.badge.version = r.readUInt32();
			this.badge.color = [r.readUInt32(), r.readUInt32(), r.readUInt32()];

			if (this.badge.version == 0) {
				const u01 = r.readUInt32();
				const u02 = r.readString();
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
			const u01 = r.readString();
		}

		this.ghostNickname = r.readString();
		this.ghostAvatarName = r.readString();

		if (version >= 2) {
			this.recordingContext = r.readString();
		}

		if (version >= 4) {
			const u01 = r.readBoolean();
		}

		if (version >= 5) {
			this.recordData = r.readNodeReference() as CPlugEntRecordData;

			const u01 = r.createArray(r.readUInt32(), () => r.readUInt32());
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
			const speed = r.readUInt32();

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
	protected 0x03092006 = ({ r }: Chunk) => {
		this.playerModel = r.readMeta();
		this.skinFile = r.readString();

		const u01 = r.readUInt32();

		this.ghostNickname = r.readString();
	};

	/**
	 * Old light trail color
	 */
	protected 0x03092007 = ({ r }: Chunk) => {
		this.lightTrailColor = [r.readUInt32(), r.readUInt32(), r.readUInt32()];
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
	 * Unknown
	 */
	protected 0x0309200c = ({ r }: Chunk) => {
		const u01 = r.readUInt32();
	};

	/**
	 * Driver data
	 */
	protected 0x0309200d = ({ r }: Chunk) => {
		this.playerModel = r.readMeta();
		this.skinFile = r.readString();

		const u01 = r.readUInt32();
		const u02 = r.readUInt32();
		const u03 = r.readUInt32();
		const u04 = r.readUInt32();

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
		this.validateChallengeUid = r.readLookbackString();
	};

	/**
	 * Validation (TMU)
	 */
	protected 0x03092011 = ({ r }: Chunk, version?: number) => {
		this.eventsDuration = r.readUInt32();

		if (this.eventsDuration == 0 && (version ?? 0) >= 1) return;

		const u01 = r.readUInt32();

		this.controlNames = r.createArray(r.readUInt32(), () => r.readLookbackString());

		const nbControlEntries = r.readUInt32();

		const u02 = r.readUInt32();

		this.controlEntries = r.createArray(nbControlEntries, () => {
			const time = r.readUInt32() + 100000;
			const controlNameIndex = r.readByte();
			const onoff = r.readUInt32();

			const name = this.controlNames![controlNameIndex];
			const analog = ['Steer', 'Gas', 'AccelerateReal', 'BrakeReal'].includes(name);

			return { name, time, onoff, analog };
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
	protected 0x03092012 = ({ r }: Chunk) => {
		const u01 = r.readUInt32();
		const u02 = r.readNumbers(16);
	};

	/**
	 * (Skippable) Unknown
	 */
	protected 0x03092013 = ({ r }: Chunk) => {
		const u01 = r.readUInt32();
		const u02 = r.readUInt32();
	};

	/**
	 * (Skippable) Unknown
	 */
	protected 0x03092014 = ({ r }: Chunk) => {
		const u01 = r.readUInt32();
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
		const u01 = r.readMeta();
	};

	/**
	 * Validation (TMUF)
	 */
	protected 0x03092019 = ({ r }: Chunk, version?: number) => {
		this[0x03092011]({ r }, version);

		if (this.eventsDuration == 0 && (version ?? 0) >= 1) return;

		const u03 = r.readUInt32();
	};

	/**
	 * (Skippable) Unknown
	 */
	protected 0x0309201a = ({ r }: Chunk) => {
		const u01 = r.readUInt32();
	};

	/**
	 * (Skippable) Unknown
	 */
	protected 0x03092023 = ({ r }: Chunk) => {
		const version = r.readUInt32();
		const u01 = r.readString();
		const u02 = r.readUInt32();
		const u03 = r.readString();
		const u04 = r.readUInt32();
		const u05 = r.readUInt32();
		const u06 = r.readString();
		const u07 = r.readUInt32();
		const u08 = r.readString();

		if (version >= 2) {
			const u01 = r.readByte();
			const u02 = r.readUInt32();
			const u03 = r.readUInt32();
		}

		if (version >= 3) {
			const u01 = r.readByte();
			const u02 = r.readByte();
		}
	};

	/**
	 * (Skippable) Validation TM2
	 */
	protected 0x03092025 = ({ r }: Chunk) => {
		const version = r.readUInt32();

		this[0x03092019]({ r }, version);

		this.steeringWheelSensitivity = r.readBoolean();
	};

	/**
	 * (Skippable) Unknown
	 */
	protected 0x03092026 = ({ r }: Chunk) => {
		const u01 = r.readNumbers(16);
	};
}
