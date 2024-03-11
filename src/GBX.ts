import { DataStream, FileHandlers, Hex, Logger, LZOHandler } from './Handlers';
import { GBXReader } from './GBXReader';

export default class GBX<NodeType> {
	private stream!: DataStream;
	private type?: NodeType;

	constructor(options: IOptions) {
		if (options.path) {
			this.stream = new DataStream(FileHandlers.getBufferFromPathSync(options.path));
		}

		if (options.stream) {
			this.stream = new DataStream(options.stream);
		}

		if (options.type) {
			this.type = options.type;
		}
	}

	/**
	 * Parses the headers of the GBX file.
	 */
	public async parseHeaders(): Promise<NodeType> {
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
		const classId = this.stream.readUInt32();

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

		const headerNode = new GBXReader<NodeType>({ headerChunks, type: this.type }).readHeaderChunk(
			classId
		);

		// Read amount of nodes and external nodes
		const nbNodes = this.stream.readUInt32();
		const nbExternalNodes = this.stream.readUInt32();

		if (nbExternalNodes > 0)
			return Promise.reject(new Error('[Unimplemented] External nodes are not supported'));

		if (bodyCompression != 'C') return Promise.reject(new Error('Body is already decompressed'));

		return Promise.resolve(headerNode);
	}

	private mergeInstances(target: NodeType, source: NodeType): NodeType {
		// Merge instance2 into instance1
		for (const key in source) {
			if (Object.prototype.hasOwnProperty.call(source, key) && source[key] !== undefined) {
				target[key] = source[key];
			}
		}
		return target;
	}

	/**
	 * Parses the GBX file entirely.
	 */
	public async parse(): Promise<NodeType> {
		// Read headers
		const headerNode = await this.parseHeaders();

		// Decompression
		const uncompressedSize = this.stream.readUInt32();
		const compressedSize = this.stream.readUInt32();
		const compressedData = this.stream.readBytes(compressedSize);

		const bodyNode = new DataStream(await LZOHandler.decompress(compressedData));

		Logger.debug(`Reading body data`);

		const node = new GBXReader<NodeType>({ stream: bodyNode, type: this.type }).readNode();

		return Promise.resolve(this.mergeInstances(node, headerNode));
	}
}
