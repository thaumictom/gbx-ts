import { DataStream, FileHandlers, Hex, Logger, LZOHandler } from './Handlers';
import { GBXReader } from './GBXReader';

export class GBX {
	private stream: DataStream;

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
	public async parseHeaders(): Promise<{ headerNode: {} }> {
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

		Logger.debug(`Reading header data`);

		let headerNode = {};

		// Read header chunk data
		for (const el in headerChunks) {
			const fullChunkId = classId + headerChunks[el].chunkId;
			const data = new DataStream(this.stream.readBytes(headerChunks[el].chunkSize as number));

			const chunkData = new GBXReader(data).readChunk(fullChunkId, true) as object;

			if (!chunkData) {
				// Chunk is not supported
				Logger.warn(`Skipped header chunk: 0x${Hex.fromDecimal(fullChunkId)}`);
			}

			// Check for duplicate keys
			for (const key in chunkData) {
				if (chunkData[key] === undefined) {
					delete chunkData[key];
					continue;
				}

				if (headerNode.hasOwnProperty(key)) {
					throw new Error(`Duplicate key: ${key}`);
				}
			}

			if (chunkData !== null) headerNode = { ...headerNode, ...chunkData };
		}

		// Read amount of nodes and external nodes
		const nbNodes = this.stream.readUInt32();
		const nbExternalNodes = this.stream.readUInt32();

		if (nbExternalNodes > 0)
			return Promise.reject(new Error('[Unimplemented] External nodes are not supported'));

		if (bodyCompression != 'C') return Promise.reject(new Error('Body is already decompressed'));

		return Promise.resolve({ headerNode });
	}

	/**
	 * Parses the GBX file entirely.
	 */
	public async parse(): Promise<{ headerNode: {}; node: object }> {
		// Read headers
		const { headerNode } = await this.parseHeaders();

		// Decompression
		const uncompressedSize = this.stream.readUInt32();
		const compressedSize = this.stream.readUInt32();
		const compressedData = this.stream.readBytes(compressedSize);

		const data = new DataStream(await LZOHandler.decompress(compressedData));

		Logger.debug(`Reading body data`);

		const node = new GBXReader(data).readNode();

		return Promise.resolve({ headerNode, node });
	}
}
