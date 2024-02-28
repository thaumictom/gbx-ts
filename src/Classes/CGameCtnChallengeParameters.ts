/**
 * Chunk 0x0305b000
 */
export class CGameCtnChallengeParameters {
	static 0x001(r: GBXReader) {
		const tip1 = r.readString();
		const tip2 = r.readString();
		const tip3 = r.readString();
		const tip4 = r.readString();

		return {
			tip1,
			tip2,
			tip3,
			tip4,
		};
	}

	static 0x004(r: GBXReader) {
		const bronzeTime = r.readUInt32();
		const silverTime = r.readUInt32();
		const goldTime = r.readUInt32();
		const authorTime = r.readUInt32();
		const u01 = r.readUInt32();

		return {
			bronzeTime,
			silverTime,
			goldTime,
			authorTime,
			u01,
		};
	}

	static 0x008(r: GBXReader) {
		const timeLimit = r.readUInt32();
		const authorScore = r.readUInt32();

		return {
			timeLimit,
			authorScore,
		};
	}

	static 0x00d(r: GBXReader) {
		const raceValidationGhost = r.readNodeReference();

		return raceValidationGhost;
	}
}
