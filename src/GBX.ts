import { DataStream, FileHandlers, Hex, Logger, LZO } from './Handlers';
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

		const version = this.stream.readNumbers(2);

		// Return if the file version is not supported.
		if (version < 3) return Promise.reject(new Error('Unsupported GBX version'));

		const byteFormat = this.stream.readChar(); // 'T' (Text) or 'B' (Binary), latter more common
		const refTableCompression = this.stream.readChar(); // Unused
		const bodyCompression = this.stream.readChar(); // 'C' (Compressed) or 'U' (Uncompressed)

		// Unknown character
		if (version >= 4) this.stream.readChar();

		// Class ID
		const classID = this.stream.readNumbers(4);

		// User data size
		if (version >= 6) this.stream.readNumbers(4);

		// Amount of header chunks
		const numHeaderChunks = this.stream.readNumbers(4);

		if (numHeaderChunks == 0) return Promise.reject(new Error('No header chunks'));

		// Read header chunks
		for (let i = 0; i < numHeaderChunks; i++) {
			const chunkId = this.stream.readNumbers(4) & 0xfff;
			const chunkSize = this.stream.readNumbers(4);
			const isCompressed = (chunkSize & 0x80000000) != 0;

			this.headerChunks[chunkId] = {
				size: chunkSize & ~0x80000000,
				isCompressed,
			};
		}

		// Read header chunk data
		for (const el in this.headerChunks) {
			this.headerChunks[el].data = this.stream.readBytes(this.headerChunks[el].size as number);
			delete this.headerChunks[el].size;
		}

		// Read amount of nodes and external nodes
		const numNodes = this.stream.readNumbers(4);
		const numExternalNodes = this.stream.readNumbers(4);

		if (numExternalNodes > 0)
			return Promise.reject(new Error('[Unimplemented] External nodes are not supported'));

		Logger.debug(`Reading class 0x${Hex.fromDecimal(classID)}`);

		if (bodyCompression != 'C') return Promise.reject(new Error('Body is already decompressed'));
	}

	/**
	 * Parses the GBX file entirely.
	 */
	public async parse<Type>(): Promise<object> {
		// Read headers
		const headers = await this.parseHeaders();

		// Decompression
		const uncompressedSize = this.stream.readNumbers(4);
		const compressedSize = this.stream.readNumbers(4);
		const compressedData = this.stream.readBytes(compressedSize);

		const node = new GBXReader(new DataStream(LZO.decompress(compressedData))).readNode();

		return Promise.resolve({ node });
	}

	/**
	 * Switches the buffer to a new one, resetting the pointer.
	 * @param newBuffer A new buffer.
	 */
	private changeBuffer(newBuffer: Buffer) {
		this.stream = new DataStream(newBuffer);
	}
}
