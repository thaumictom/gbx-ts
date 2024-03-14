type Unknowns = { [x: number]: any[] };
type Versions = { [x: number]: number };

export default class Merger {
	/**
	 * Merge unknowns and versions into an object of chunks.
	 * @param chunks A list of chunks.
	 * @param unknowns An object of unknowns.
	 * @param versions An object of versions.
	 * @returns combined chunks.
	 */
	static mergeChunks(chunks: number[], unknowns: Unknowns, versions: Versions): ChunkList {
		let merged: ChunkList = {};

		for (const chunk of chunks) {
			merged[chunk] = {
				unknowns: unknowns[chunk],
				version: versions[chunk],
			};
		}

		return merged;
	}

	/**
	 * Merge two instances of the same class.
	 * @param target Instance to merge into.
	 * @param source Instance to merge from.
	 * @returns Merged instance.
	 */
	static mergeInstances<NodeType>(target: NodeType, source: NodeType): NodeType {
		// Merge instance2 into instance1
		for (const key in source) {
			if (Object.prototype.hasOwnProperty.call(source, key) && source[key] !== undefined) {
				target[key] = source[key];
			}
		}
		return target;
	}
}
