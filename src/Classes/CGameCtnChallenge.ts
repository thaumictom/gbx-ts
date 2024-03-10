/**
 * Chunk 0x03043000
 */
export default class CGameCtnChallenge {
	static 0x002: Chunk = (r) => {
		let mapInfo: IMeta,
			mapName: string,
			bronzeTime: number,
			silverTime: number,
			goldTime: number,
			authorTime: number,
			cost: number,
			isLapRace: boolean,
			isMultilap: boolean,
			playMode: number,
			authorScore: number,
			editorMode: number,
			nbCheckpoints: number,
			nbLaps: number;

		const version = r.readByte();

		if (version <= 2) {
			mapInfo = r.readMeta();
			mapName = r.readString();
		}

		const u01 = r.readBoolean();

		if (version >= 1) {
			bronzeTime = r.readUInt32();
			silverTime = r.readUInt32();
			goldTime = r.readUInt32();
			authorTime = r.readUInt32();
		}

		if (version == 2) {
			const u01 = r.readByte();
		}

		if (version >= 4) {
			cost = r.readUInt32();
		}

		if (version >= 5) {
			isLapRace = r.readBoolean();
		}

		if (version == 6) {
			isMultilap = r.readBoolean();
		}

		if (version >= 7) {
			playMode = r.readUInt32();
		}

		if (version >= 9) {
			const u01 = r.readUInt32();
		}

		if (version >= 10) {
			authorScore = r.readUInt32();
		}

		if (version >= 11) {
			editorMode = r.readUInt32();
		}

		if (version >= 12) {
			const u01 = r.readUInt32();
		}

		if (version >= 13) {
			nbCheckpoints = r.readUInt32();
			nbLaps = r.readUInt32();
		}

		return {
			mapInfo,
			mapName,
			bronzeTime,
			silverTime,
			goldTime,
			authorTime,
			cost,
			isLapRace,
			isMultilap,
			playMode,
			authorScore,
			editorMode,
			nbCheckpoints,
			nbLaps,
		};
	};

	static 0x003: Chunk = (r) => {
		const version = r.readByte();
		const mapInfo = r.readMeta();
		const mapName = r.readString();
		const mapKind = r.readByte() as MapKind;

		let password: string,
			decoration: IMeta,
			mapCoordOrigin: number[],
			mapCoordTarget: number[],
			packMask: number,
			mapType: string,
			mapStyle: string,
			lightmapCacheUid: any,
			lightmapVersion: any,
			titleId: number;

		if (version >= 1) {
			const u01 = r.readUInt32();
			password = r.readString();
		}

		if (version >= 2) {
			decoration = r.readMeta();
		}

		if (version >= 3) {
			mapCoordOrigin = [r.readUInt32(), r.readUInt32()];
		}

		if (version >= 4) {
			mapCoordTarget = [r.readUInt32(), r.readUInt32()];
		}

		if (version >= 5) {
			packMask = r.readNumbers(16);
		}

		if (version >= 6) {
			mapType = r.readString();
			mapStyle = r.readString();
		}

		if (version >= 8) {
			lightmapCacheUid = r.readBytes(8);
		}

		if (version >= 9) {
			lightmapVersion = r.readByte();
		}

		if (version >= 11) {
			titleId = r.readUInt32();
		}

		return {
			mapInfo,
			mapName,
			mapKind,
			password,
			decoration,
			mapCoordOrigin,
			mapCoordTarget,
			packMask,
			mapType,
			mapStyle,
			lightmapCacheUid,
			lightmapVersion,
			titleId,
		};
	};

	static 0x004: Chunk = (r) => {
		const version = r.readUInt32();

		return { version };
	};

	static 0x005: Chunk = (r) => {
		const xml = r.readString();

		return { xml };
	};

	static 0x007: Chunk = (r) => {
		const version = r.readUInt32();

		const thumbnailSize = r.readUInt32();

		const thumbnailStart = r.readString('<Thumbnail.jpg>'.length);
		const thumbnailData = r.readBytes(thumbnailSize);
		const thumbnailEnd = r.readString('</Thumbnail.jpg>'.length);

		const commentsStart = r.readString('<Comments>'.length);
		const comments = r.readString();
		const commentsEnd = r.readString('</Comments>'.length);

		return {
			thumbnailSize,
			thumbnailData,
			comments,
		};
	};

	static 0x008: Chunk = (r) => {
		const version = r.readUInt32();
		const authorVersion = r.readUInt32();
		const authorLogin = r.readString();
		const authorNickname = r.readString();
		const authorZone = r.readString();
		const authorExtraInfo = r.readString();

		return {
			authorVersion,
			authorLogin,
			authorNickname,
			authorZone,
			authorExtraInfo,
		};
	};

	static 0x00d: Chunk = (r) => {
		const playerModel = r.readMeta();

		return { playerModel };
	};

	static 0x011: Chunk = (r) => {
		const blockStock = r.readNodeReference(); // CGameCtnCollectorList
		const challengeParameters = r.readNodeReference(); // CGameCtnChallengeParameters
		const mapKind = r.readUInt32() as MapKind;

		return {
			blockStock,
			challengeParameters,
			mapKind,
		};
	};

	static 0x01f: Chunk = (r) => {
		let blocks = [];

		const mapInfo = r.readMeta();
		const mapName = r.readString();
		const decoration = r.readMeta();

		const size = [r.readUInt32(), r.readUInt32(), r.readUInt32()];

		const needUnlock = r.readBoolean();

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

			let flags: number;

			if (version == 0) flags = r.readUInt16();
			else if (version > 0) flags = r.readUInt32();

			if (flags == 0xffffffff) {
				blocks.push({
					blockName,
					rotation,
					position,
				});

				return false;
			}

			let author: string, skin: object, blockParameters: object;

			if ((flags & 0x8000) != 0) {
				author = r.readLookbackString();
				skin = r.readNodeReference(); // CGameCtnBlockSkin
			}

			if (flags & 0x100000) {
				blockParameters = r.readNodeReference(); // CGameWaypointSpecialProperty
			}

			blocks.push({
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

		return {
			mapInfo,
			mapName,
			decoration,
			size,
			needUnlock,
			blocks,
		};
	};

	static 0x021: Chunk = (r, fullChunkId) => {
		r.forceChunkSkip(fullChunkId);

		return null;
	};

	static 0x022: Chunk = (r) => {
		const u01 = r.readUInt32();

		return null;
	};

	static 0x024: Chunk = (r) => {
		const customMusicPackDesc = r.readFileReference();

		return { customMusicPackDesc };
	};

	static 0x025: Chunk = (r) => {
		const mapCoordOrigin = [r.readUInt32(), r.readUInt32()];
		const mapCoordTarget = [r.readUInt32(), r.readUInt32()];

		return {
			mapCoordOrigin,
			mapCoordTarget,
		};
	};

	static 0x026: Chunk = (r) => {
		const clipGlobal = r.readNodeReference(); // Empty

		return { clipGlobal };
	};

	static 0x028: Chunk = (r) => {
		const hasCustomCamThumbnail = r.readBoolean();

		if (!hasCustomCamThumbnail) {
			const comments = r.readString();

			return {
				hasCustomCamThumbnail,
				comments,
			};
		}

		const u01 = r.readByte();
		const u02 = [r.readUInt32(), r.readUInt32(), r.readUInt32()];
		const u03 = [r.readUInt32(), r.readUInt32(), r.readUInt32()];
		const u04 = [r.readUInt32(), r.readUInt32(), r.readUInt32()];
		const thumbnailPosition = [r.readUInt32(), r.readUInt32(), r.readUInt32()];
		const thumbnailFov = r.readUInt32();
		const thumbnailNearClipPlane = r.readUInt32();
		const thumbnailFarClipPlane = r.readUInt32();

		const comments = r.readString();

		return {
			hasCustomCamThumbnail,
			thumbnailPosition,
			thumbnailFov,
			thumbnailNearClipPlane,
			thumbnailFarClipPlane,
			comments,
		};
	};

	static 0x02a: Chunk = (r) => {
		const u01 = r.readBoolean();

		return null;
	};

	static 0x049: Chunk = (r, fullChunkId) => {
		r.forceChunkSkip(fullChunkId);

		return null;
	};
}
