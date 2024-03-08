/**
 * Chunk 0x03092000
 */
export default class CGameCtnGhost {
	static 0x00c: Chunk = (r) => {
		const u01 = r.readUInt32();

		return null;
	};

	static 0x00e: Chunk = (r) => {
		const uid = r.readLookbackString();

		return {
			uid,
		};
	};

	static 0x00f: Chunk = (r) => {
		const ghostLogin = r.readString();

		return {
			ghostLogin,
		};
	};

	static 0x010: Chunk = (r) => {
		const u01 = r.readLookbackString();

		return null;
	};

	static 0x012: Chunk = (r) => {
		const u01 = r.readUInt32();
		const u02 = r.readNumbers(16);

		return null;
	};

	static 0x015: Chunk = (r) => {
		//lookbackstring playerMobilId
		const playerMobilId = r.readLookbackString();

		return {
			playerMobilId,
		};
	};

	static 0x018: Chunk = (r) => {
		const u01 = r.readMeta();

		return null;
	};

	static 0x019: Chunk = (r) => {
		const eventsDuration = r.readUInt32();
		const u01 = r.readUInt32();
		const nbControlNames = r.readUInt32();

		const controlNames = [];

		for (let i = 0; i < nbControlNames; i++) {
			controlNames.push(r.readLookbackString());
		}

		const nbControlEntries = r.readUInt32();
		const u02 = r.readUInt32();

		const controlEntries = [];

		for (let i = 0; i < nbControlEntries; i++) {
			controlEntries.push({
				time: r.readUInt32() + 100000,
				controlNameIndex: r.readByte(),
				onoff: r.readUInt32(),
			});
		}

		const gameVersion = r.readString();
		const exeChecksum = r.readUInt32();
		const osKind = r.readUInt32();
		const cpuKind = r.readUInt32();
		const raceSettingsXML = r.readString();
		const u03 = r.readUInt32();

		return {
			eventsDuration,
			controlNames,
			controlEntries,
			gameVersion,
			exeChecksum,
			osKind,
			cpuKind,
			raceSettingsXML,
		};
	};
}
