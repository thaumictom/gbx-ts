import { DataStream, Logger, Hex } from './Handlers';
import { classWrap } from './Data/ClassWrap';
import getNodeType from './Data/NodeTypes';

interface GBXReaderOptions {
	classId: number;
	stream?: DataStream;
	headerChunks?: IHeaderChunks[];
}

export class GBXReader<NodeType> {
	private current?: any;

	constructor(public options: GBXReaderOptions) {
		Object.assign(this, options);
	}

	/**
	 * Reads a node.
	 */
	public readNode(): { node: NodeType; chunks?: any[] } {
		const stream = this.options.stream as DataStream;

		let chunks: any[] = [];

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
				throw new Error(`Failed processing unskippable chunk 0x${Hex.fromDecimal(fullChunkId)}.`);
			}
		}

		return { node: this.current as NodeType, chunks };
	}

	/**
	 * Check if the chunk is supported and process it.
	 * @param fullChunkId The full chunk ID.
	 * @returns A boolean indicating if the chunk is supported.
	 */
	public readChunk(fullChunkId: number, isHeaderChunk = false): boolean {
		const r = this.options.stream;

		let classIdFromNode = this.options.classId;
		let classId = fullChunkId & 0xfffff000;

		classIdFromNode = classWrap[classIdFromNode] ?? classIdFromNode;
		classId = classWrap[classId] ?? classId;

		// Get chunk handler
		const chunkHandler = getNodeType(classIdFromNode);

		const wrappedChunkId = classId + (fullChunkId & 0xfff);

		// Check if class is supported
		if (chunkHandler === undefined) return false;

		// Create new chunk class if not already created
		if (this.current === undefined) this.current = new chunkHandler();

		// Wrap chunk ID

		// Check if chunk is supported
		if (this.current[wrappedChunkId] === undefined) return false;

		Logger.debug(
			`Processing ${isHeaderChunk ? 'header chunk' : 'chunk'}: 0x${Hex.fromDecimal(wrappedChunkId)}`
		);

		// Read chunk
		this.current[wrappedChunkId]({ r, fullChunkId, isHeaderChunk });

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
