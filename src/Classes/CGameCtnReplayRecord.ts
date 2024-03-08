/**
 * Chunk 0x03093000
 */
export default class CGameCtnReplayRecord {
	static 0x000: Chunk = (r) => {
		const version = r.readUInt32();

		let mapInfo: IMeta, time: number, playerNickname: string, playerLogin: string, titleUID: string;

		if (version >= 2) {
			mapInfo = r.readMeta();
			time = r.readUInt32();
			playerNickname = r.readString();
		}

		if (version >= 6) {
			playerLogin = r.readString();
		}

		if (version >= 8) {
			const u01 = r.readByte();
			titleUID = r.readLookbackString();
		}

		return {
			mapInfo,
			time,
			playerNickname,
			playerLogin,
			titleUID,
		};
	};

	static 0x001: Chunk = (r) => {
		const xml = r.readString();

		return {
			xml,
		};
	};

	static 0xf002: Chunk = (r) => {
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

	static 0x002: Chunk = (r) => {
		const length = r.readUInt32();

		const data = r.readBytes(length);

		return {
			data,
		};
	};

	static 0x007: Chunk = (r) => {
		const u01 = r.readUInt32();

		return null;
	};

	static 0x014: Chunk = (r, fullChunkId) => {
		const version = r.readUInt32();

		const nbGhosts = r.readUInt32();

		const ghosts = r.createArray(nbGhosts, () => r.readNodeReference()); // CGameCtnGhost

		const u01 = r.readUInt32();

		const nbExtras = r.readUInt32();
		const extras = r.createArray(nbExtras, () => {
			const extra1 = r.readUInt32();
			const extra2 = r.readUInt32();

			return {
				extra1,
				extra2,
			};
		});

		return {
			ghosts,
			extras,
		};
	};

	static 0x015: Chunk = (r, fullChunkId) => {
		r.forceChunkSkip(fullChunkId); // errors out

		return null;
	};
}
