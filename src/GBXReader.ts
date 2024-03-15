import { DataStream, Logger, Hex, Merger } from './Handlers';
import { classWrap } from './Data/ClassWrap';
import getNodeType from './Data/NodeTypes';

interface GBXReaderOptions {
	classId: number;
	stream?: DataStream;
	headerChunks?: IHeaderChunks[];
}

export class GBXReader<NodeType> {
	private current?: any;

	private fullChunkId: number = 0;
	private versions: { [key: number]: number } = {};
	private unknowns: { [key: number]: any[] } = {};

	constructor(public options: GBXReaderOptions) {
		Object.assign(this, options);
	}

	protected readVersion(version: number): number {
		this.versions[this.fullChunkId] = version;

		return version;
	}

	protected readUnknown<T>(unknown: T): T {
		if (this.unknowns[this.fullChunkId] === undefined) this.unknowns[this.fullChunkId] = [];

		this.unknowns[this.fullChunkId].push(unknown);

		return unknown;
	}

	/**
	 * Reads a node.
	 */
	public readNode(): NodeType {
		const stream = this.options.stream as DataStream;

		let chunks: Chunks = {};

		while (true) {
			const fullChunkId = stream.readUInt32();

			// Reached end of node
			if (fullChunkId == 0xfacade01) break;

			// Add chunk to list
			chunks[fullChunkId] = true;

			// Check if chunk is skippable
			if (stream.peekUInt32() == 0x534b4950) {
				const skip = stream.readUInt32();
				const chunkDataSize = stream.readUInt32();

				const isChunkSupported = this.readChunk(fullChunkId, false, chunkDataSize);

				if (!isChunkSupported) {
					// Chunk is not supported
					Logger.warn(`Skipped chunk: 0x${Hex.fromDecimal(fullChunkId)}`);
					const data = stream.readBytes(chunkDataSize);

					// Overwrite to false, since the chunk is not supported
					chunks[fullChunkId] = false;
				}

				continue;
			}

			const isChunkSupported = this.readChunk(fullChunkId);

			if (!isChunkSupported) {
				throw new Error(`Failed processing unskippable chunk 0x${Hex.fromDecimal(fullChunkId)}.`);
			}
		}

		this.current.chunks = Merger.mergeChunks(chunks, this.unknowns, this.versions);

		return this.current as NodeType;
	}

	/**
	 * Check if the chunk is supported and process it.
	 * @param fullChunkId The full chunk ID.
	 * @returns A boolean indicating if the chunk is supported.
	 */
	public readChunk(fullChunkId: number, isHeaderChunk = false, length: number = 0): boolean {
		const r = this.options.stream;
		this.fullChunkId = fullChunkId;

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
		this.current[wrappedChunkId](
			{
				r, // DataStream
				length, // Length of the chunk (only on skippable chunks, otherwise 0)
				fullChunkId, // Full chunk ID
				isHeaderChunk, // Boolean indicating if the chunk is a header chunk
			},
			{
				readVersion: this.readVersion.bind(this),
				readUnknown: this.readUnknown.bind(this),
			}
		);

		return true;
	}

	/**
	 * Reads a header chunk.
	 */
	public readHeaderChunk(classId: number): NodeType {
		const headerChunks = this.options.headerChunks;

		let chunks: Chunks = {};

		for (let i = 0; i < headerChunks!.length; i++) {
			const currentChunk = headerChunks![i];

			const fullChunkId = classId + currentChunk.chunkId;

			this.options.stream = new DataStream(currentChunk.chunkData!);

			const isChunkSupported = this.readChunk(fullChunkId, true);

			if (!isChunkSupported) {
				// Chunk is not supported
				Logger.warn(`Skipped chunk: 0x${Hex.fromDecimal(fullChunkId)}`);
				chunks[fullChunkId] = false;
			}

			// Chunk is supported
			chunks[fullChunkId] = true;
		}

		this.current.chunks = Merger.mergeChunks(chunks, this.unknowns, this.versions);

		return this.current as NodeType;
	}
}
