import CGameCtnBlockSkin from './CGameCtnBlockSkin';
import CGameCtnChallengeParameters from './CGameCtnChallengeParameters';
import CGameCtnCollectorList from './CGameCtnCollectorList';
import CGameWaypointSpecialProperty from './CGameWaypointSpecialProperty';

/**
 * Chunk 0x03043000
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
	public playMode?: number;
	public authorScore?: number;
	public editorMode?: number;
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
	public titleId?: number;

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
	public blocks?: {
		blockName: string;
		rotation: number;
		position: { x: number; y: number; z: number };
		author?: string;
		skin?: CGameCtnBlockSkin;
		blockParameters?: CGameWaypointSpecialProperty;
	}[];
	public size?: number[];
	public needUnlock?: boolean;
	public customMusicPackDesc?: string;
	public clipGlobal?: null;
	public hasCustomCamThumbnail?: boolean;
	public thumbnailPosition?: number[];
	public thumbnailFov?: number;
	public thumbnailNearClipPlane?: number;
	public thumbnailFarClipPlane?: number;

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
			this.playMode = r.readUInt32();
		}

		if (version >= 9) {
			const u01 = r.readUInt32();
		}

		if (version >= 10) {
			this.authorScore = r.readUInt32();
		}

		if (version >= 11) {
			this.editorMode = r.readUInt32();
		}

		if (version >= 12) {
			const u01 = r.readUInt32();
		}

		if (version >= 13) {
			this.nbCheckpoints = r.readUInt32();
			this.nbLaps = r.readUInt32();
		}
	};

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
			this.titleId = r.readUInt32();
		}
	};

	protected 0x03043004 = ({ r }: Chunk) => {
		this.headerVersion = r.readUInt32();
	};

	protected 0x03043005 = ({ r }: Chunk) => {
		this.xml = r.readString();
	};

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

	protected 0x03043008 = ({ r }: Chunk) => {
		const version = r.readUInt32();
		this.authorVersion = r.readUInt32();
		this.authorLogin = r.readString();
		this.authorNickname = r.readString();
		this.authorZone = r.readString();
		this.authorExtraInfo = r.readString();
	};

	protected 0x0304300d = ({ r }: Chunk) => {
		this.playerModel = r.readMeta();
	};

	protected 0x03043011 = ({ r }: Chunk) => {
		this.blockStock = r.readNodeReference() as CGameCtnCollectorList;
		this.challengeParameters = r.readNodeReference() as CGameCtnChallengeParameters;
		this.mapKind = r.readUInt32() as MapKind;
	};

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
			const rotation = r.readByte();

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
					rotation,
					position,
				});

				return false;
			}

			let author: string | undefined;
			let skin: CGameCtnBlockSkin | undefined;
			let blockParameters: CGameWaypointSpecialProperty | undefined;

			if ((flags & 0x8000) != 0) {
				author = r.readLookbackString();
				skin = r.readNodeReference() as CGameCtnBlockSkin;
			}

			if (flags & 0x100000) {
				blockParameters = r.readNodeReference() as CGameWaypointSpecialProperty;
			}

			this.blocks?.push({
				blockName,
				rotation,
				position,
				author,
				skin,
				blockParameters,
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

	protected 0x03043021 = ({ r, fullChunkId }: Chunk) => {
		r.forceChunkSkip(fullChunkId);

		return null;
	};

	protected 0x03043022 = ({ r }: Chunk) => {
		const u01 = r.readUInt32();

		return null;
	};

	protected 0x03043024 = ({ r }: Chunk) => {
		this.customMusicPackDesc = r.readFileReference();
	};

	protected 0x03043025 = ({ r }: Chunk) => {
		this.mapCoordOrigin = [r.readUInt32(), r.readUInt32()];
		this.mapCoordTarget = [r.readUInt32(), r.readUInt32()];
	};

	protected 0x03043026 = ({ r }: Chunk) => {
		this.clipGlobal = r.readNodeReference();
	};

	protected 0x03043028 = ({ r }: Chunk) => {
		this.hasCustomCamThumbnail = r.readBoolean();

		if (!this.hasCustomCamThumbnail) {
			this.comments = r.readString();

			return;
		}

		const u01 = r.readByte();
		const u02 = [r.readUInt32(), r.readUInt32(), r.readUInt32()];
		const u03 = [r.readUInt32(), r.readUInt32(), r.readUInt32()];
		const u04 = [r.readUInt32(), r.readUInt32(), r.readUInt32()];

		this.thumbnailPosition = [r.readUInt32(), r.readUInt32(), r.readUInt32()];
		this.thumbnailFov = r.readUInt32();
		this.thumbnailNearClipPlane = r.readUInt32();
		this.thumbnailFarClipPlane = r.readUInt32();

		this.comments = r.readString();
	};

	protected 0x0304302a = ({ r }: Chunk) => {
		const u01 = r.readBoolean();
	};

	protected 0x03043049 = ({ r, fullChunkId }: Chunk) => {
		r.forceChunkSkip(fullChunkId);
	};
}
