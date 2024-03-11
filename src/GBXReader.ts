import { DataStream, Logger, Hex } from './Handlers';
import { classWrap } from './Data/ClassWrap';
import * as Chunk from '.';

type Chunks = (typeof Chunk)[keyof typeof Chunk];

interface GBXReaderOptions {
	stream?: DataStream;
	headerChunks?: IHeaderChunks[];
	type?: any;
}

export class GBXReader<NodeType> {
	private current?: any;

	constructor(public options: GBXReaderOptions) {
		Object.assign(this, options);
	}

	/**
	 * Reads a node.
	 */
	public readNode(): NodeType {
		const stream = this.options.stream as DataStream;
		const type = this.options.type;

		while (true) {
			const fullChunkId = stream.readUInt32();

			// Reached end of node
			if (fullChunkId == 0xfacade01) break;

			// Check if chunk is skippable
			if (stream.peekUInt32() == 0x534b4950) {
				const skip = stream.readUInt32();
				const chunkDataSize = stream.readUInt32();

				const isChunkSupported = this.readChunk(fullChunkId);

				if (!isChunkSupported) {
					// Chunk is not supported
					Logger.warn(`Skipped chunk: 0x${Hex.fromDecimal(fullChunkId)}`);
					const data = stream.readBytes(chunkDataSize);
				}

				continue;
			}

			const isChunkSupported = this.readChunk(fullChunkId);

			if (!isChunkSupported) {
				throw new Error(
					`Failed processing unskippable chunk 0x${Hex.fromDecimal(fullChunkId)}. ${
						type ? 'Are you using the right type?' : ''
					}`
				);
			}
		}

		return this.current as NodeType;
	}

	/**
	 * Check if the chunk is supported and process it.
	 * @param fullChunkId The full chunk ID.
	 * @returns A boolean indicating if the chunk is supported.
	 */
	public readChunk(fullChunkId: number, isHeaderChunk = false): boolean {
		const r = this.options.stream;
		const chunkType = this.options.type;

		let classId = fullChunkId & 0xfffff000;
		let chunkId = fullChunkId & 0xfff;

		let newChunkId = fullChunkId;

		// Check if class has a wrapper
		if (classWrap[classId] !== undefined) {
			classId = classWrap[classId] & 0xfffff000;
			newChunkId = classId + chunkId;
		}

		const chunkHandlers: { [key: number]: Chunks } = {
			0x0301b000: Chunk.CGameCtnCollectorList,
			0x0303f000: Chunk.CGameCtnGhost,
			0x03043000: Chunk.CGameCtnChallenge,
			0x03059000: Chunk.CGameCtnBlockSkin,
			0x0305b000: Chunk.CGameCtnChallengeParameters,
			0x03078000: Chunk.CGameCtnMediaTrack,
			0x03079000: Chunk.CGameCtnMediaClip,
			0x03092000: Chunk.CGameCtnGhost,
			0x03093000: Chunk.CGameCtnReplayRecord,
			0x2e009000: Chunk.CGameWaypointSpecialProperty,
		};

		if (chunkType !== undefined) {
			// Create new chunk class if not already created
			if (this.current === undefined) this.current = new chunkType();

			// Check if chunk is supported
			if (this.current[newChunkId] === undefined) return false;

			Logger.debug(
				`Processing ${isHeaderChunk ? 'header chunk' : 'chunk'}: 0x${Hex.fromDecimal(fullChunkId)}`
			);

			this.current[newChunkId]({ r, fullChunkId, isHeaderChunk });

			return true;
		}

		if (chunkHandlers[classId] === undefined)
			// Check if class is supported
			return false;

		// Create new chunk class if not already created
		if (this.current === undefined) this.current = new chunkHandlers[classId]();

		// Check if chunk is supported
		if (this.current[newChunkId] === undefined) return false;

		Logger.debug(
			`Processing ${isHeaderChunk ? 'header chunk' : 'chunk'}: 0x${Hex.fromDecimal(fullChunkId)}`
		);

		// Read chunk
		this.current[newChunkId]({ r, fullChunkId, isHeaderChunk });

		return true;
	}

	/**
	 * Reads a header chunk.
	 */
	public readHeaderChunk(classId: number): NodeType {
		const headerChunks = this.options.headerChunks;

		for (let i = 0; i < headerChunks!.length; i++) {
			const currentChunk = headerChunks![i];

			const fullChunkId = classId + currentChunk.chunkId;

			this.options.stream = new DataStream(currentChunk.chunkData!);

			const isChunkSupported = this.readChunk(fullChunkId, true);

			if (!isChunkSupported) {
				// Chunk is not supported
				Logger.warn(`Skipped chunk: 0x${Hex.fromDecimal(fullChunkId)}`);
			}
		}

		return this.current as NodeType;
	}
}
