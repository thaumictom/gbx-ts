import CGameCtnMediaTrack from './CGameCtnMediaTrack';

/**
 * @chunk 0x03079000
 */
export default class CGameCtnMediaClip {
	public tracks?: CGameCtnMediaTrack[];
	public name?: string;
	public stopWhenLeave?: boolean;
	public stopWhenRespawn?: boolean;
	public localPlayerClipEntIndex?: number;

	protected 0x0307900d = ({ r }: Chunk) => {
		this.tracks = [];

		const version = r.readUInt32();
		const nbTracks = r.readUInt32();

		for (let i = 0; i < nbTracks; i++) {
			const track = r.readNodeReference() as CGameCtnMediaTrack;

			this.tracks.push(track);
		}

		this.name = r.readString();
		this.stopWhenLeave = r.readBoolean();
		const u01 = r.readUInt32();
		this.stopWhenRespawn = r.readBoolean();
		const u02 = r.readUInt32();
		this.localPlayerClipEntIndex = r.readUInt32();
	};
}
