/**
 * Chunk 0x03079000
 */
export default class CGameCtnMediaClip {
	static 0x00d: Chunk = (r) => {
		const version = r.readUInt32();
		const nbTracks = r.readUInt32();

		let tracks = [];

		for (let i = 0; i < nbTracks; i++) {
			const track = r.readNodeReference(); // CGameCtnMediaTrack
			tracks.push(track);
		}

		const name = r.readString();
		const stopWhenLeave = r.readBoolean();
		const u01 = r.readUInt32();
		const stopWhenRespawn = r.readBoolean();
		const u02 = r.readUInt32();
		const localPlayerClipEntIndex = r.readUInt32();

		return {
			version,
			tracks,
			name,
			stopWhenLeave,
			stopWhenRespawn,
			localPlayerClipEntIndex,
		};
	};
}
