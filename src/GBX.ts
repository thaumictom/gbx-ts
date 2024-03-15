import { DataStream, FileHandlers, Logger, LZOHandler, Merger } from './Handlers';
import { GBXReader } from './GBXReader';

export default class GBX<NodeType> {
	private stream!: DataStream;
	public classId?: number;
	public chunks?: Chunks;
	public node?: NodeType;

	constructor(options: IOptions) {
		if (options.path) {
			this.stream = new DataStream(FileHandlers.getBufferFromPathSync(options.path));
		}

		if (options.stream) {
			this.stream = new DataStream(options.stream);
		}
	}

	/**
	 * Parses the headers of the GBX file.
	 */
	public async parseHeaders<NodeType>(): Promise<NodeType> {
		// Return if file does not contain the file magic.
		if (this.stream.readString(3) != 'GBX') return Promise.reject(new Error('Not a GBX file'));

		Logger.debug(`Found GBX magic`);

		const version = this.stream.readUInt16();

		// Return if the file version is not supported.
		if (version < 3) return Promise.reject(new Error('Unsupported GBX version'));

		Logger.debug(`Reading GBX version ${version}`);

		const byteFormat = this.stream.readChar(); // 'T' (Text) or 'B' (Binary), latter more common
		const refTableCompression = this.stream.readChar(); // Unused
		const bodyCompression = this.stream.readChar(); // 'C' (Compressed) or 'U' (Uncompressed)

		// Unknown character
		if (version >= 4) this.stream.readChar();

		// Class ID
		this.classId = this.stream.readUInt32();

		// User data size
		if (version >= 6) this.stream.readUInt32();

		// Amount of header chunks
		const nbHeaderChunks = this.stream.readUInt32();

		if (nbHeaderChunks == 0) return Promise.reject(new Error('No header chunks'));

		let headerChunks: IHeaderChunks[] = [];

		// Read header chunks
		for (let i = 0; i < nbHeaderChunks; i++) {
			const chunkId = this.stream.readUInt32() & 0xfff;
			const chunkSize = this.stream.readUInt32() & ~0x80000000;
			const isHeavy = (chunkSize & 0x80000000) != 0;

			headerChunks.push({
				chunkId,
				chunkSize,
				isHeavy,
			});
		}

		for (let i = 0; i < nbHeaderChunks; i++) {
			headerChunks[i].chunkData = this.stream.readBytes(headerChunks[i].chunkSize as number);
		}

		Logger.debug(`Reading header data`);

		const { node, chunks, unknowns, versions } = new GBXReader<NodeType>({
			headerChunks,
			classId: this.classId,
		}).readHeaderChunk(this.classId);

		// Read amount of nodes and external nodes
		const nbNodes = this.stream.readUInt32();
		const nbExternalNodes = this.stream.readUInt32();

		if (nbExternalNodes > 0)
			return Promise.reject(new Error('[Unimplemented] External nodes are not supported'));

		if (bodyCompression != 'C') return Promise.reject(new Error('Body is already decompressed'));

		// Set list of chunks
		this.chunks = chunks;

		// @ts-ignore (Chunks does exist on node)
		node.chunks = Merger.mergeChunks(chunks, unknowns, versions);

		return Promise.resolve(node);
	}

	/**
	 * Parses the GBX file entirely.
	 */
	public async parse(): Promise<NodeType> {
		// Read headers
		const headerNode = await this.parseHeaders<NodeType>();

		// Decompression
		const uncompressedSize = this.stream.readUInt32();
		const compressedSize = this.stream.readUInt32();
		const compressedData = this.stream.readBytes(compressedSize);

		const bodyNode = new DataStream(await LZOHandler.decompress(compressedData));

		Logger.debug('Reading body data');

		const { node, chunks, unknowns, versions } = new GBXReader<NodeType>({
			stream: bodyNode,
			classId: this.classId!,
		}).readNode();

		const mergedNode = Merger.mergeInstances(headerNode, node);

		// Set list of chunks
		this.chunks = { ...this.chunks, ...chunks };

		// @ts-ignore (Chunks does exist on node)
		mergedNode.chunks = { ...mergedNode.chunks, ...Merger.mergeChunks(chunks, unknowns, versions) };

		return Promise.resolve(mergedNode);
	}
}
