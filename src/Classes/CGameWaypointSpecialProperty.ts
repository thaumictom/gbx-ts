/**
 * Chunk 0x2e009000
 */
export default class CGameWaypointSpecialProperty {
	public spawn?: number;
	public tag?: string;
	public order?: number;

	protected 0x2e009000 = ({ r }: Chunk) => {
		const version = r.readUInt32();

		if (version == 1) {
			this.spawn = r.readUInt32();
			this.order = r.readUInt32();
		} else if (version == 2) {
			this.tag = r.readString();
			this.order = r.readUInt32();
		}
	};
}
