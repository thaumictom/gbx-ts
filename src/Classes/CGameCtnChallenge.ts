import CGameCtnBlock from './CGameCtnBlock';
import CGameCtnBlockSkin from './CGameCtnBlockSkin';
import CGameCtnChallengeParameters from './CGameCtnChallengeParameters';
import CGameCtnCollectorList from './CGameCtnCollectorList';
import CGameWaypointSpecialProperty from './CGameWaypointSpecialProperty';

/**
 * A map.
 * @chunk 0x03043000
 */
export default class CGameCtnChallenge {
	public mapInfo?: IMeta;
	public mapName?: string;
	public mapKind?: MapKind;
	public bronzeTime?: number;
	public silverTime?: number;
	public goldTime?: number;
	public authorTime?: number;
	public cost?: number;
	public isLapRace?: boolean;
	public isMultilap?: boolean;
	public playMode?: PlayMode;
	public authorScore?: number;
	public editorMode?: EditorMode;
	public nbCheckpoints?: number;
	public nbLaps?: number;

	public password?: string;
	public decoration?: IMeta;
	public mapCoordOrigin?: number[];
	public mapCoordTarget?: number[];
	public packMask?: number;
	public mapType?: string;
	public mapStyle?: string;
	public lightmapCacheUid?: number[];
	public lightmapVersion?: number;
	public titleId?: string;

	public headerVersion?: number;
	public xml?: string;
	public thumbnailSize?: number;
	public thumbnailData?: number[];
	public comments?: string;
	public authorVersion?: number;
	public authorLogin?: string;
	public authorNickname?: string;
	public authorZone?: string;
	public authorExtraInfo?: string;
	public playerModel?: IMeta;
	public blockStock?: CGameCtnCollectorList;
	public challengeParameters?: CGameCtnChallengeParameters;
	public blocks?: CGameCtnBlock[];
	public size?: number[];
	public needUnlock?: boolean;
	public customMusicPackDesc?: string;
	public hasCustomCamThumbnail?: boolean;
	public thumbnailPosition?: number[];
	public thumbnailFov?: number;
	public thumbnailNearClipPlane?: number;
	public thumbnailFarClipPlane?: number;

	public checkpoints?: number[];
	public modPackDesc?: string;
	public hashedPassword?: number[];
	public crc32?: number;
	public createdWithSimpleEditor?: boolean;
	public thumbnailPitchYawRoll?: number[];
	public objectiveTextAuthor?: string;
	public objectiveTextGold?: string;
	public objectiveTextSilver?: string;
	public objectiveTextBronze?: string;
	public offzoneTriggerSize?: number[];
	public offzones?: { position1: number[]; position2: number[] }[];
	public buildVersion?: string;
	public decoBaseHeightOffset?: number;
	public dayTime?: number;
	public dynamicDaylight?: boolean;
	public dayDuration?: number;
	public worldDistortion?: number[];

	/**
	 * (Header) Map information
	 * @games All games
	 */
	protected 0x03043002 = ({ r }: Chunk) => {
		const version = r.readByte();

		if (version <= 2) {
			this.mapInfo = r.readMeta();
			this.mapName = r.readString();
		}

		const u01 = r.readBoolean();

		if (version >= 1) {
			this.bronzeTime = r.readUInt32();
			this.silverTime = r.readUInt32();
			this.goldTime = r.readUInt32();
			this.authorTime = r.readUInt32();
		}

		if (version == 2) {
			const u01 = r.readByte();
		}

		if (version >= 4) {
			this.cost = r.readUInt32();
		}

		if (version >= 5) {
			this.isLapRace = r.readBoolean();
		}

		if (version == 6) {
			this.isMultilap = r.readBoolean();
		}

		if (version >= 7) {
			this.playMode = r.readUInt32() as PlayMode;
		}

		if (version >= 9) {
			const u01 = r.readUInt32();
		}

		if (version >= 10) {
			this.authorScore = r.readUInt32();
		}

		if (version >= 11) {
			this.editorMode = r.readUInt32() as EditorMode;
		}

		if (version >= 12) {
			const u01 = r.readUInt32();
		}

		if (version >= 13) {
			this.nbCheckpoints = r.readUInt32();
			this.nbLaps = r.readUInt32();
		}
	};

	/**
	 * (Header) Common map information
	 * @games All games
	 */
	protected 0x03043003 = ({ r }: Chunk) => {
		const version = r.readByte();

		this.mapInfo = r.readMeta();
		this.mapName = r.readString();
		this.mapKind = r.readByte() as MapKind;

		if (version >= 1) {
			const u01 = r.readUInt32();

			this.password = r.readString();
		}

		if (version >= 2) {
			this.decoration = r.readMeta();
		}

		if (version >= 3) {
			this.mapCoordOrigin = [r.readUInt32(), r.readUInt32()];
		}

		if (version >= 4) {
			this.mapCoordTarget = [r.readUInt32(), r.readUInt32()];
		}

		if (version >= 5) {
			this.packMask = r.readNumbers(16);
		}

		if (version >= 6) {
			this.mapType = r.readString();
			this.mapStyle = r.readString();
		}

		if (version >= 8) {
			this.lightmapCacheUid = r.readBytes(8);
		}

		if (version >= 9) {
			this.lightmapVersion = r.readByte();
		}

		if (version >= 11) {
			this.titleId = r.readLookbackString();
		}
	};

	/**
	 * (Header) Header version
	 * @games TMSX and above
	 */
	protected 0x03043004 = ({ r }: Chunk) => {
		this.headerVersion = r.readUInt32();
	};

	/**
	 * (Header) XML data
	 * @games TMSX and above
	 */
	protected 0x03043005 = ({ r }: Chunk) => {
		this.xml = r.readString();
	};

	/**
	 * (Header) Thumnbnail and comments
	 * @games TMU and above
	 */
	protected 0x03043007 = ({ r }: Chunk) => {
		const version = r.readUInt32();

		this.thumbnailSize = r.readUInt32();

		const thumbnailStart = r.readString('<Thumbnail.jpg>'.length);
		this.thumbnailData = r.readBytes(this.thumbnailSize);
		const thumbnailEnd = r.readString('</Thumbnail.jpg>'.length);

		const commentsStart = r.readString('<Comments>'.length);
		this.comments = r.readString();
		const commentsEnd = r.readString('</Comments>'.length);
	};

	/**
	 * (Header) Author information
	 * @games MP3 and above
	 */
	protected 0x03043008 = ({ r }: Chunk) => {
		const version = r.readUInt32();

		this.authorVersion = r.readUInt32();
		this.authorLogin = r.readString();
		this.authorNickname = r.readString();
		this.authorZone = r.readString();
		this.authorExtraInfo = r.readString();
	};

	/**
	 * Vehicle model
	 * @games All games
	 */
	protected 0x0304300d = ({ r }: Chunk) => {
		this.playerModel = r.readMeta();
	};

	/**
	 * Block data
	 * @games TM1.0 only
	 */
	protected 0x0304300f = ({ r }: Chunk) => {
		this.mapInfo = r.readMeta();
		this.size = [r.readUInt32(), r.readUInt32(), r.readUInt32()];

		const nbBlocks = r.readUInt32();

		this.blocks = r.createArray(nbBlocks, () => r.readNodeReference() as CGameCtnBlock);
		this.needUnlock = r.readBoolean();
		this.decoration = r.readMeta();
	};

	/**
	 * Puzzle block inventory, challenge parameters and map kind
	 * @games All games
	 */
	protected 0x03043011 = ({ r }: Chunk) => {
		this.blockStock = r.readNodeReference() as CGameCtnCollectorList;
		this.challengeParameters = r.readNodeReference() as CGameCtnChallengeParameters;
		this.mapKind = r.readUInt32() as MapKind;
	};

	/**
	 * Legacy block data
	 * @games Unknown
	 */
	protected 0x03043013 = ({ r }: Chunk) => {
		this.mapInfo = r.readMeta();
		this.mapName = r.readString();
		this.decoration = r.readMeta();
		this.size = [r.readUInt32(), r.readUInt32(), r.readUInt32()];

		const u01 = r.readBoolean();
		const nbBlocks = r.readUInt32();

		this.blocks = r.createArray(nbBlocks, () => {
			const blockName = r.readLookbackString();
			const direction = r.readByte();

			const position = {
				x: r.readByte(),
				y: r.readByte(),
				z: r.readByte(),
			};

			const flags = r.readUInt16();

			return {
				blockName,
				direction,
				position,
				flags,
			};
		});
	};

	/**
	 * (Skippable) Legacy password
	 * @games TMSX, TMNESWC, TMU
	 */
	protected 0x03043014 = ({ r }: Chunk) => {
		const u01 = r.readBoolean();

		this.password = r.readString();
	};

	/**
	 * (Skippable)
	 * @games TMSX, TMNESWC
	 */
	protected 0x03043016 = ({ r }: Chunk) => {
		const u01 = r.readUInt32();
	};

	/**
	 * (Skippable) Checkpoints
	 * @games TMSX, TMNESWC, TMU, TMF
	 */
	protected 0x03043017 = ({ r }: Chunk) => {
		const nbCheckpoints = r.readUInt32();

		this.checkpoints = r.createArray(nbCheckpoints, () => r.readUInt32());
	};

	/**
	 * (Skippable) Lap information
	 * @games TMSX+
	 */
	protected 0x03043018 = ({ r }: Chunk) => {
		this.isLapRace = r.readBoolean();
		this.nbLaps = r.readUInt32();
	};

	/**
	 * (Skippable) Mod information
	 * @games TMSX+
	 */
	protected 0x03043019 = ({ r }: Chunk) => {
		this.modPackDesc = r.readFileReference();
	};

	/**
	 * @games Unknown
	 */
	protected 0x0304301a = ({ r }: Chunk) => {
		const u01 = r.readNodeReference();
	};

	/**
	 * OldIgs
	 * @games Unknown
	 */
	protected 0x0304301b = ({ r }: Chunk) => {
		const u01 = r.readUInt32();

		if (u01 != 0) throw new Error('Unexpected value SOldIgs > 0 in chunk 0x0304301b');
	};

	/**
	 * (Skippable) Play mode
	 * @games TMSX, TMNESWC, TMU, TMF
	 */
	protected 0x0304301c = ({ r }: Chunk) => {
		this.playMode = r.readUInt32() as PlayMode;
	};

	/**
	 * @games Unknown
	 */
	protected 0x0304301d = ({ r }: Chunk) => {
		const u01 = r.readNodeReference();
	};

	/**
	 * Block data
	 * @games TMSX and above
	 */
	protected 0x0304301f = ({ r }: Chunk) => {
		this.blocks = [];

		this.mapInfo = r.readMeta();
		this.mapName = r.readString();
		this.decoration = r.readMeta();

		this.size = [r.readUInt32(), r.readUInt32(), r.readUInt32()];

		this.needUnlock = r.readBoolean();

		const version = r.readUInt32();
		const nbBlocks = r.readUInt32();

		const readBlock = (): boolean => {
			const blockName = r.readLookbackString();
			const direction = r.readByte();

			// Unimplemented: There is some special cases for the coordinates in version >= 6
			const position = {
				x: r.readByte(),
				y: r.readByte(),
				z: r.readByte(),
			};

			let flags: number = 0;

			if (version == 0) flags = r.readUInt16();
			else if (version > 0) flags = r.readUInt32();

			if (flags == 0xffffffff) {
				this.blocks?.push({
					blockName,
					direction,
					position,
					flags,
				});

				return false;
			}

			let author: string | undefined;
			let skin: CGameCtnBlockSkin | undefined;
			let waypointSpecialProperty: CGameWaypointSpecialProperty | undefined;

			if ((flags & 0x8000) != 0) {
				author = r.readLookbackString();
				skin = r.readNodeReference() as CGameCtnBlockSkin;
			}

			if (flags & 0x100000) {
				waypointSpecialProperty = r.readNodeReference() as CGameWaypointSpecialProperty;
			}

			this.blocks?.push({
				blockName,
				direction,
				position,
				flags,
				author,
				skin,
				waypointSpecialProperty,
			});

			return true;
		};

		for (let i = 0; i < nbBlocks; i++) {
			const isNormal = readBlock();

			if (isNormal) continue;
			else i--;
		}

		// Peek ahead to see if there is any more blocks
		while ((r.peekUInt32() & 0xc0000000) > 0) {
			readBlock();
		}
	};

	/**
	 * Deprecated MediaTracker data
	 * @games Unknown
	 */
	protected 0x03043020 = ({ r, fullChunkId }: Chunk) => {
		r.forceChunkSkip(fullChunkId!);
	};

	/**
	 * Legacy MediaTracker data
	 * @games TMSX, TMNESWC, TMU, TMF
	 */
	protected 0x03043021 = ({ r, fullChunkId }: Chunk) => {
		r.forceChunkSkip(fullChunkId!);
	};

	/**
	 * @games TMSX+
	 */
	protected 0x03043022 = ({ r }: Chunk) => {
		const u01 = r.readUInt32();
	};

	/**
	 * Legacy map origin/target
	 * @games Unknown
	 */
	protected 0x03043023 = ({ r }: Chunk) => {
		this.mapCoordOrigin = [r.readUInt32(), r.readUInt32()];
		this.mapCoordTarget = this.mapCoordOrigin;
	};

	/**
	 * Custom music
	 * @games TMSX+
	 */
	protected 0x03043024 = ({ r }: Chunk) => {
		this.customMusicPackDesc = r.readFileReference();
	};

	/**
	 * Map origin/target
	 * @games TMSX+
	 */
	protected 0x03043025 = ({ r }: Chunk) => {
		this.mapCoordOrigin = [r.readUInt32(), r.readUInt32()];
		this.mapCoordTarget = [r.readUInt32(), r.readUInt32()];
	};

	/**
	 * Clip global
	 * @games TMNESWC+
	 */
	protected 0x03043026 = ({ r }: Chunk) => {
		const u01 = r.readNodeReference();
	};

	/**
	 * Old realtime thumbnail
	 * @games Unknown
	 */
	protected 0x03043027 = ({ r }: Chunk) => {
		this.hasCustomCamThumbnail = r.readBoolean();

		if (!this.hasCustomCamThumbnail) return;

		const u01 = r.readByte();
		const u02 = [r.readUInt32(), r.readUInt32(), r.readUInt32()];
		const u03 = [r.readUInt32(), r.readUInt32(), r.readUInt32()];
		const u04 = [r.readUInt32(), r.readUInt32(), r.readUInt32()];

		this.thumbnailPosition = [r.readUInt32(), r.readUInt32(), r.readUInt32()];
		this.thumbnailFov = r.readUInt32();
		this.thumbnailNearClipPlane = r.readUInt32();
		this.thumbnailFarClipPlane = r.readUInt32();
	};

	/**
	 * Old realtime thumbnail and comments
	 * @games TMU+
	 */
	protected 0x03043028 = ({ r }: Chunk) => {
		this[0x03043027]({ r });

		this.comments = r.readString();
	};

	/**
	 * (Skippable) Password
	 * @games TMF+
	 */
	protected 0x03043029 = ({ r }: Chunk) => {
		this.hashedPassword = r.readBytes(16);
		this.crc32 = r.readUInt32();
	};

	/**
	 * Simple editor
	 * @games TMF+
	 */
	protected 0x0304302a = ({ r }: Chunk) => {
		this.createdWithSimpleEditor = r.readBoolean();
	};

	/**
	 * (Skippable) Realtime thumbnail and comments
	 * @games TMF+
	 */
	protected 0x0304302d = ({ r }: Chunk) => {
		this.thumbnailPosition = [r.readUInt32(), r.readUInt32(), r.readUInt32()];
		this.thumbnailPitchYawRoll = [r.readUInt32(), r.readUInt32(), r.readUInt32()];
		this.thumbnailFov = r.readUInt32();

		const u01 = r.readUInt32();
		const u02 = r.readUInt32();

		this.thumbnailNearClipPlane = r.readUInt32();
		this.thumbnailFarClipPlane = r.readUInt32();
		this.comments = r.readString();
	};

	/**
	 * (Skippable)
	 * @games MP3+
	 */
	protected 0x03043034 = ({ r }: Chunk) => {
		const length = r.readUInt32();
		const data = r.readBytes(length);
	};

	/**
	 * (Skippable) Realtime thumbnail and comments
	 * @games MP3+
	 */
	protected 0x03043036 = ({ r }: Chunk) => {
		this[0x0304302d]({ r });
	};

	/**
	 * (Skippable) CarMarksBuffer
	 * @games MP3+
	 */
	// protected 0x0304303e = ({ r }: Chunk) => {};

	/**
	 * (Skippable) Items
	 * @games MP3+
	 */
	// protected 0x03043040 = ({ r }: Chunk) => {};

	/**
	 * (Skippable) Author information
	 * @games MP3
	 */
	protected 0x03043042 = ({ r }: Chunk) => {
		const version = r.readUInt32();

		this.authorVersion = r.readUInt32();
		this.authorLogin = r.readString();
		this.authorNickname = r.readString();
		this.authorZone = r.readString();
		this.authorExtraInfo = r.readString();
	};

	/**
	 * (Skippable) Genealogies
	 * @games MP3+
	 */
	// protected 0x03043043 = ({ r }: Chunk) => {};

	/**
	 * (Skippable) Metadata
	 * @games MP3+
	 */
	// protected 0x03043044 = ({ r }: Chunk) => {};

	/**
	 * (Skippable)
	 * @games MP3, TMT
	 */
	protected 0x03043047 = ({ r }: Chunk) => {
		const version = r.readUInt32();
		const u01 = r.readString();

		if (version >= 1) throw new Error('Unexpected version >= 1 in chunk 0x03043047');
	};

	/**
	 * (Skippable) Baked blocks
	 * @games MP3+
	 */
	// protected 0x03043048 = ({ r }: Chunk) => {};

	/**
	 * MediaTracker data
	 * @games MP3+
	 */
	protected 0x03043049 = ({ r, fullChunkId }: Chunk) => {
		r.forceChunkSkip(fullChunkId!);
	};

	/**
	 * (Skippable) Objectives
	 * @games MP3+
	 */
	protected 0x0304304b = ({ r }: Chunk) => {
		this.objectiveTextAuthor = r.readString();
		this.objectiveTextGold = r.readString();
		this.objectiveTextSilver = r.readString();
		this.objectiveTextBronze = r.readString();
	};

	/**
	 * (Skippable) Offzones
	 * @games MP3+
	 */
	protected 0x03043050 = ({ r }: Chunk) => {
		const version = r.readUInt32();

		this.offzoneTriggerSize = [r.readUInt32(), r.readUInt32(), r.readUInt32()];

		const nbOffzones = r.readUInt32();

		this.offzones = r.createArray(nbOffzones, () => {
			return {
				position1: [r.readUInt32(), r.readUInt32(), r.readUInt32()],
				position2: [r.readUInt32(), r.readUInt32(), r.readUInt32()],
			};
		});
	};

	/**
	 * (Skippable) Title information
	 * @games MP3+
	 */
	protected 0x03043051 = ({ r }: Chunk) => {
		const version = r.readUInt32();

		this.titleId = r.readLookbackString();
		this.buildVersion = r.readString();
	};

	/**
	 * (Skippable) Decoration height
	 * @games MP3+
	 */
	protected 0x03043052 = ({ r }: Chunk) => {
		const version = r.readUInt32();

		this.decoBaseHeightOffset = r.readUInt32();
	};

	/**
	 * (Skippable) Bot paths
	 * @games MP3+
	 */
	// protected 0x03043053 = ({ r }: Chunk) => {};

	/**
	 * (Skippable) Embedded objects
	 * @games MP3+
	 */
	// protected 0x03043054 = ({ r }: Chunk) => {};

	/**
	 * (Skippable) Light settings
	 * @games MP4+
	 */
	protected 0x03043056 = ({ r }: Chunk) => {
		const version = r.readUInt32();
		const u01 = r.readUInt32();

		this.dayTime = r.readUInt32();

		const u02 = r.readUInt32();

		this.dynamicDaylight = r.readBoolean();
		this.dayDuration = r.readUInt32();
	};

	/**
	 * (Skippable) SubMapsInfos
	 * @games MP4 only
	 */
	protected 0x03043058 = ({ r }: Chunk) => {
		const version = r.readUInt32();
		const u01 = r.readUInt32();

		if (u01 > 0) throw new Error('Unexpected value > 0 in chunk 0x03043058');
	};

	/**
	 * (Skippable) World distortion
	 * @games MP4+
	 */
	protected 0x03043059 = ({ r }: Chunk) => {
		const version = r.readUInt32();

		this.worldDistortion = [r.readUInt32(), r.readUInt32(), r.readUInt32()];

		if (version == 0) {
			throw new Error('Unexpected version 0 in chunk 0x03043059');
		}

		if (version >= 1) {
			const u01 = r.readBoolean();
			if (u01) throw new Error('Unexpected value true in chunk 0x03043059');
		}

		if (version >= 3) {
			const u01 = r.readUInt32();
			const u02 = r.readUInt32();
		}
	};

	/**
	 * (Skippable)
	 * @games TM2020 only
	 */
	protected 0x0304305a = ({ r }: Chunk) => {
		const u01 = r.readUInt32();
		const u02 = r.readUInt32();
	};

	/**
	 * (Skippable) Lightmaps
	 * @games TM2020 only
	 */
	// protected 0x0304305b = ({ r }: Chunk) => {};

	/**
	 * (Skippable) Free blocks
	 * @games TM2020 only
	 */
	// protected 0x0304305f = ({ r }: Chunk) => {};

	/**
	 * (Skippable) MapElemColor
	 */
	// protected 0x03043062 = ({ r }: Chunk) => {};

	/**
	 * (Skippable) AnimPhaseOffset
	 * @games TM2020 only
	 */
	// protected 0x03043063 = ({ r }: Chunk) => {};

	/**
	 * (Skippable) Foreground pack desc
	 * @games TM2020 only
	 */
	// protected 0x03043065 = ({ r }: Chunk) => {};

	/**
	 * (Skippable) MapElemLmQuality
	 * @games TM2020 only
	 */
	// protected 0x03043068 = ({ r }: Chunk) => {};

	/**
	 * (Skippable) Macroblock instances
	 * @games TM2020 only
	 */
	// protected 0x03043069 = ({ r }: Chunk) => {};

	/**
	 * (Skippable) Light settings (2)
	 * @games TM2020 only
	 */
	protected 0x0304306b = ({ r }: Chunk) => {
		const u01 = r.readUInt32();

		this.dayTime = r.readUInt32();

		const u02 = r.readUInt32();

		this.dynamicDaylight = r.readBoolean();
		this.dayDuration = r.readUInt32();
	};
}
