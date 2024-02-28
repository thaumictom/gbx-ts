/**
 * Chunk 0x03043000
 */
export class CGameCtnChallenge {
	static 0x00d(r: GBXReader) {
		const playerModel = r.readIdent();

		return playerModel;
	}

	static 0x011(r: GBXReader) {
		const collectorList = r.readNodeReference(); // CGameCtnCollectorList
		const challengeParameters = r.readNodeReference(); // CGameCtnChallengeParameters
		const kind = r.readUInt32();

		return {
			collectorList,
			challengeParameters,
			kind,
		};
	}

	static 0x1f(r: GBXReader) {
		let blocks = [];

		const mapMeta = r.readIdent();
		const mapName = r.readString();
		const decorationMeta = r.readIdent();

		const size = [r.readUInt32(), r.readUInt32(), r.readUInt32()];

		const needUnlock = r.readBoolean();

		const version = r.readUInt32();
		const numBlocks = r.readUInt32();

		const readBlock = (): boolean => {
			const blockName = r.readLookbackString();
			const rotation = r.readByte();

			// Unimplemented: There is some special cases for the coordinates in version >= 6
			const x = r.readByte();
			const y = r.readByte();
			const z = r.readByte();

			let flags: number;

			if (version == 0) flags = r.readUInt16();
			else if (version > 0) flags = r.readUInt32();

			if (flags == 0xffffffff) {
				blocks.push({
					blockName,
					rotation,
					x,
					y,
					z,
				});

				return false;
			}

			let author, skin, blockParameters;

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
				x,
				y,
				z,
				author,
				skin,
				blockParameters,
			});

			return true;
		};

		for (let i = 0; i < numBlocks; i++) {
			const isNormal = readBlock();

			if (isNormal) continue;
			else i--;
		}

		// Peek ahead to see if there is any more blocks
		while ((r.peekUInt32() & 0xc0000000) > 0) {
			readBlock();
		}

		return {
			mapMeta,
			mapName,
			decorationMeta,
			size,
			needUnlock,
			blocks,
		};
	}

	static 0x022(r: GBXReader) {
		const u01 = r.readUInt32();

		return u01;
	}

	static 0x024(r: GBXReader) {
		const customMusicPackDesc = r.readFileReference();

		return customMusicPackDesc;
	}

	static 0x025(r: GBXReader) {
		const mapCoordOrigin = [r.readUInt32(), r.readUInt32()];
		const mapCoordTarget = [r.readUInt32(), r.readUInt32()];

		return {
			mapCoordOrigin,
			mapCoordTarget,
		};
	}

	static 0x026(r: GBXReader) {
		const clipGlobal = r.readNodeReference(); // Empty

		return clipGlobal;
	}

	static 0x028(r: GBXReader) {
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
			u01,
			u02,
			u03,
			u04,
			thumbnailPosition,
			thumbnailFov,
			thumbnailNearClipPlane,
			thumbnailFarClipPlane,
			comments,
		};
	}

	static 0x02a(r: GBXReader) {
		const u01 = r.readBoolean();

		return u01;
	}

	static 0x049(r: GBXReader) {
		r.forceChunkSkip();

		return null;
	}
}
