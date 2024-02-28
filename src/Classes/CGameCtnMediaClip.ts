/**
 * Chunk 0x03079000
 */
export class CGameCtnMediaClip {
	static 0x00d(r: GBXReader) {
		const version = r.readUInt32();
		const numTracks = r.readUInt32();

		let tracks = [];

		for (let i = 0; i < numTracks; i++) {
			const track = r.readNodeReference(); // CGameCtnMediaTrack
			tracks.push(track);
		}

		const name = r.readString();
		const stopWhenLeave = r.readBoolean();
		const u1 = r.readUInt32();
		const stopWhenRespawn = r.readBoolean();
		const u2 = r.readUInt32();
		const localPlayerClipEntIndex = r.readUInt32();

		return {
			version,
			tracks,
			name,
			stopWhenLeave,
			u1,
			stopWhenRespawn,
			u2,
			localPlayerClipEntIndex,
		};
	}
}
