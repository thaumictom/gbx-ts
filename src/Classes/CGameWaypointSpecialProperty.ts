/**
 * Chunk 0x2e009000
 */
export default class CGameWaypointSpecialProperty {
	public order?: number;
	public spawn?: number;
	public tag?: string;

	protected 0x2e009000 = ({ r }: Chunk, f: ChunkFunctions) => {
		const version = f.readVersion(r.readUInt32());

		if (version == 1) {
			this.spawn = r.readUInt32();
			this.order = r.readUInt32();
		} else if (version == 2) {
			this.tag = r.readString();
			this.order = r.readUInt32();
		}
	};
}
