import { DataStream, Logger, Hex } from './Handlers';
import * as Chunk from './Classes';

export class GBXReader {
	private stream: DataStream;

	private classId: number;
	private chunkId: number;

	constructor(stream: DataStream) {
		this.stream = stream;
	}

	/**
	 * Reads a node.
	 */
	public readNode(): object {
		let node = {};

		while (true) {
			const fullChunkId = this.stream.readUInt32();

			// Reached end of node
			if (fullChunkId == 0xfacade01) break;

			// Check if chunk is skippable
			if (this.stream.peekUInt32() == 0x534b4950) {
				const skip = this.stream.readUInt32();
				const chunkDataSize = this.stream.readUInt32();

				const isChunkSupported = this.readChunk(fullChunkId);

				if (!isChunkSupported) {
					// Chunk is not supported
					Logger.warn(`Skipped chunk: 0x${Hex.fromDecimal(fullChunkId)}`);
					const data = this.stream.readBytes(chunkDataSize);
				}

				continue;
			}

			let chunkData = this.readChunk(fullChunkId);

			if (chunkData === false)
				throw new Error(`Failed processing unskippable chunk: 0x${Hex.fromDecimal(fullChunkId)}`);

			chunkData = chunkData as object;

			// Check for duplicate keys
			for (const key in chunkData) {
				if (chunkData[key] === undefined) {
					delete chunkData[key];
					continue;
				}

				if (node.hasOwnProperty(key)) {
					throw new Error(`Duplicate key: ${key}`);
				}
			}

			if (chunkData !== null) node = { ...node, ...chunkData };
		}

		return node;
	}

	/**
	 * Check if the chunk is supported and process it.
	 * @param fullChunkId The full chunk ID.
	 * @returns A boolean indicating if the chunk is supported, otherwise an object with data or null.
	 */
	public readChunk(fullChunkId: number): boolean | object | null {
		this.classId = fullChunkId & 0xfffff000;
		this.chunkId = fullChunkId & 0xfff;

		const chunkHandlers = {
			0x0301b000: Chunk.CGameCtnCollectorList,
			0x03043000: Chunk.CGameCtnChallenge,
			0x03059000: Chunk.CGameCtnBlockSkin,
			0x0305b000: Chunk.CGameCtnChallengeParameters,
			0x03078000: Chunk.CGameCtnMediaTrack,
			0x03079000: Chunk.CGameCtnMediaClip,
			0x2e009000: Chunk.CGameWaypointSpecialProperty,
		};

		// Check if chunk is supported
		if (
			chunkHandlers[this.classId] === undefined ||
			chunkHandlers[this.classId][this.chunkId] === undefined
		)
			return false;

		Logger.debug(`Processing Chunk: 0x${Hex.fromDecimal(fullChunkId)}`);

		return chunkHandlers[this.classId][this.chunkId](this.stream, fullChunkId);
	}
}
