import { DataStream, FileHandlers, Hex, Logger, LZOHandler } from './Handlers';
import { GBXReader } from './GBXReader';

export class GBX {
	private headerChunks: IHeaderChunks[] = [];
	private stream: DataStream;

	constructor(public options: IOptions) {
		if (options.path) {
			this.stream = new DataStream(FileHandlers.getBufferFromPathSync(options.path));
		}
	}

	/**
	 * Parses the headers of the GBX file.
	 */
	public async parseHeaders(): Promise<any> {
		// Return if file does not contain the file magic.
		if (this.stream.readString(3) != 'GBX') return Promise.reject(new Error('Not a GBX file'));

		Logger.debug(`Found GBX magic`);

		const version = this.stream.readNumbers(2);

		// Return if the file version is not supported.
		if (version < 3) return Promise.reject(new Error('Unsupported GBX version'));

		Logger.debug(`Reading GBX version ${version}`);

		const byteFormat = this.stream.readChar(); // 'T' (Text) or 'B' (Binary), latter more common
		const refTableCompression = this.stream.readChar(); // Unused
		const bodyCompression = this.stream.readChar(); // 'C' (Compressed) or 'U' (Uncompressed)

		// Unknown character
		if (version >= 4) this.stream.readChar();

		// Class ID
		const classId = this.stream.readNumbers(4);

		// User data size
		if (version >= 6) this.stream.readNumbers(4);

		// Amount of header chunks
		const nbHeaderChunks = this.stream.readNumbers(4);

		if (nbHeaderChunks == 0) return Promise.reject(new Error('No header chunks'));

		// Read header chunks
		for (let i = 0; i < nbHeaderChunks; i++) {
			const chunkId = this.stream.readNumbers(4) & 0xfff;
			const chunkSize = this.stream.readNumbers(4) & ~0x80000000;
			const isHeavy = (chunkSize & 0x80000000) != 0;

			this.headerChunks.push({
				chunkId,
				chunkSize,
				isHeavy,
			});
		}

		Logger.debug(`Reading header data`);

		let headerNode = {};

		// Read header chunk data
		for (const el in this.headerChunks) {
			const fullChunkId = classId + this.headerChunks[el].chunkId;
			const data = new DataStream(this.stream.readBytes(this.headerChunks[el].chunkSize as number));

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
		const nbNodes = this.stream.readNumbers(4);
		const nbExternalNodes = this.stream.readNumbers(4);

		if (nbExternalNodes > 0)
			return Promise.reject(new Error('[Unimplemented] External nodes are not supported'));

		if (bodyCompression != 'C') return Promise.reject(new Error('Body is already decompressed'));

		return Promise.resolve({ headerNode });
	}

	/**
	 * Parses the GBX file entirely.
	 */
	public async parse(): Promise<object> {
		// Read headers
		const { headerNode } = await this.parseHeaders();

		// Decompression
		const uncompressedSize = this.stream.readNumbers(4);
		const compressedSize = this.stream.readNumbers(4);
		const compressedData = this.stream.readBytes(compressedSize);

		const data = new DataStream(await LZOHandler.decompress(compressedData));

		Logger.debug(`Reading body data`);

		const node = new GBXReader(data).readNode();

		return Promise.resolve({ headerNode, node });
	}

	/**
	 * Switches the buffer to a new one, resetting the pointer.
	 * @param newBuffer A new buffer.
	 */
	private changeBuffer(newBuffer: Buffer) {
		this.stream = new DataStream(newBuffer);
	}
}
