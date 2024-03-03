/**
 * Chunk 0x2e009000
 */
export default class CGameWaypointSpecialProperty {
	static 0x000(r: IDataStream) {
		const version = r.readUInt32();

		if (version == 1) {
			const spawn = r.readUInt32();
			const order = r.readUInt32();

			return {
				spawn,
				order,
			};
		} else if (version == 2) {
			const tag = r.readString();
			const order = r.readUInt32();

			return {
				tag,
				order,
			};
		}
	}
}
