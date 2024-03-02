import { FileHandlers, Logger, LZO } from './Handlers/Handlers';
import { collectionIDs } from './Data/CollectionIDs';
import {
	CGameCtnBlockSkin,
	CGameCtnChallenge,
	CGameCtnChallengeParameters,
	CGameCtnCollectorList,
	CGameCtnMediaClip,
	CGameCtnMediaTrack,
	CGameWaypointSpecialProperty,
} from './Classes/Chunks';

export class GBX {
	public stream: Buffer;
	public position: number = 0;

	private headerChunks: GBXHeaderChunks[] = [];

	constructor(public options: GBXOptions) {
		if (options.path) {
			this.stream = FileHandlers.getBufferFromPathSync(options.path);
		}
	}

	public async parseHeaders(): Promise<any> {
		// Return if file does not contain the file magic.
		if (this.readString(3) != 'GBX') return Promise.reject(new Error('Not a GBX file'));

		const version = this.readNumbers(2);

		// Return if the file version is not supported.
		if (version < 3) return Promise.reject(new Error('Unsupported GBX version'));

		const byteFormat = this.readChar(); // 'T' (Text) or 'B' (Binary), latter more common
		const refTableCompression = this.readChar(); // Unused
		const bodyCompression = this.readChar(); // 'C' (Compressed) or 'U' (Uncompressed)

		// Unknown character
		if (version >= 4) this.readChar();

		// Class ID
		const classID = this.readNumbers(4);

		// User data size
		if (version >= 6) this.readNumbers(4);

		// Amount of header chunks
		const numHeaderChunks = this.readNumbers(4);

		if (numHeaderChunks == 0) return Promise.reject(new Error('No header chunks'));

		// Read header chunks
		for (let i = 0; i < numHeaderChunks; i++) {
			const chunkId = this.readNumbers(4) & 0xfff;
			const chunkSize = this.readNumbers(4);
			const isCompressed = (chunkSize & 0x80000000) != 0;

			this.headerChunks[chunkId] = {
				size: chunkSize & ~0x80000000,
				isCompressed,
			};
		}

		// Read header chunk data
		for (const el in this.headerChunks) {
			this.headerChunks[el].data = this.readBytes(this.headerChunks[el].size as number);
			delete this.headerChunks[el].size;
		}

		// Read amount of nodes and external nodes
		const numNodes = this.readNumbers(4);
		const numExternalNodes = this.readNumbers(4);

		if (numExternalNodes > 0)
			return Promise.reject(new Error('[Unimplemented] External nodes are not supported'));

		Logger.debug(`Reading class 0x${this.decimalToHexadecimal(classID)}`);

		if (bodyCompression != 'C') return Promise.reject(new Error('Body is already decompressed'));
	}

	public async parse(): Promise<object> {
		// Read headers
		const headers = await this.parseHeaders();

		// Decompression
		const uncompressedSize = this.readNumbers(4);
		const compressedSize = this.readNumbers(4);
		const compressedData = this.readBytes(compressedSize);

		this.changeBuffer(LZO.decompress(compressedData));

		this.readNode();

		return Promise.resolve({});
	}

	private classId: number;
	private chunkId: number;

	/**
	 * Reads a node.
	 */
	private readNode(): void {
		while (true) {
			const fullChunkId = this.readUInt32();

			// Reached end of node
			if (fullChunkId == 0xfacade01) return;

			// Check if chunk is skippable
			if (this.peekUInt32() == 0x534b4950) {
				const skip = this.readUInt32();
				const chunkDataSize = this.readUInt32();

				const isChunkSupported = this.readChunk(fullChunkId);

				if (!isChunkSupported) {
					// Chunk is not supported
					Logger.debug(`Skipped Chunk: 0x${this.decimalToHexadecimal(fullChunkId)}`);
					const data = this.readBytes(chunkDataSize);
				}

				continue;
			}

			// Read unskippable chunk
			this.readChunk(fullChunkId);
		}
	}

	/**
	 * Check if the chunk is supported and process it.
	 * @param fullChunkId The full chunk ID.
	 * @returns A boolean indicating if the chunk is supported.
	 */
	private readChunk(fullChunkId: number): boolean {
		this.classId = fullChunkId & 0xfffff000;
		this.chunkId = fullChunkId & 0xfff;

		const chunkHandlers = {
			0x0301b000: CGameCtnCollectorList,
			0x03043000: CGameCtnChallenge,
			0x03059000: CGameCtnBlockSkin,
			0x0305b000: CGameCtnChallengeParameters,
			0x03078000: CGameCtnMediaTrack,
			0x03079000: CGameCtnMediaClip,
			0x2e009000: CGameWaypointSpecialProperty,
		};

		// Check if chunk is supported
		if (chunkHandlers[this.classId][this.chunkId] == undefined) return false;

		Logger.debug(`Processing Chunk: 0x${this.decimalToHexadecimal(fullChunkId)}`);

		chunkHandlers[this.classId][this.chunkId](this);

		return true;
	}

	/**
	 * Converts a decimal number to a hexadecimal string.
	 * @param decimal A number.
	 * @returns A hexadecimal string.
	 */
	private decimalToHexadecimal(decimal: number) {
		return Math.abs(decimal).toString(16);
	}

	/**
	 * Switches the buffer to a new one, resetting the pointer.
	 * @param newBuffer A new buffer.
	 */
	private changeBuffer(newBuffer: Buffer) {
		this.stream = newBuffer;
		this.position = 0;
	}

	/**
	 * Skips to the next chunk within the same class ID.
	 * @todo Add support for skipping nested chunks.
	 */
	private forceChunkSkip() {
		let index = 0;

		while (true) {
			const possibleChunkId = this.peekUInt32();

			if ((possibleChunkId & 0xfffff000) == this.classId) {
				Logger.debug(
					`Force skipped ${index} bytes to 0x${this.decimalToHexadecimal(possibleChunkId)}`
				);

				break;
			}

			if (possibleChunkId == 0xfacade01 && this.peekByte() == undefined) {
				Logger.warn(`Reached end of file early (Skipped ${index} bytes)`);

				break;
			}

			// TODO Add support for skipping nested chunks

			const skippedByte = this.readByte();

			index++;
		}
	}

	// Primitives

	/**
	 * Reads a single byte at the current pointer position without advancing the pointer.
	 * @returns a number between 0 to 255.
	 */
	private peekByte(offset = 0): number {
		return this.stream[this.position + offset];
	}

	/**
	 * Reads a single byte at the current pointer position.
	 * @returns a number between 0 to 255.
	 */
	private readByte(): number {
		let byte = this.stream[this.position];
		this.position++;
		return byte;
	}

	/**
	 * Reads multiple bytes at the current pointer position without advancing the pointer.
	 * @param count Amount of bytes to read.
	 * @returns an array of numbers between 0 to 255.
	 */
	private peekBytes(count: number): number[] {
		return Array.from({ length: count }, (_, index) => this.peekByte(index));
	}

	/**
	 * Reads multiple bytes at the current pointer position.
	 * @param count Amount of bytes to read.
	 * @returns an array of numbers between 0 to 255.
	 */
	private readBytes(count: number): number[] {
		return Array.from({ length: count }, () => this.readByte());
	}

	/**
	 * Reads multiple bytes at the current pointer position
	 * without advancing the pointer and returns them as an unsigned number.
	 * @returns a positive number.
	 */
	private peekNumbers(count: number): number {
		return this.peekBytes(count).reduce((sum, byte, index) => sum | (byte << (index * 8)), 0) >>> 0;
	}

	/**
	 * Reads multiple bytes at the current pointer position
	 * and returns them as an unsigned number.
	 * @returns a positive number.
	 */
	private readNumbers(count: number): number {
		return this.readBytes(count).reduce((sum, byte, index) => sum | (byte << (index * 8)), 0) >>> 0;
	}

	/**
	 * Peeks an unsigned 16-bit integer.
	 * @returns unsigned 16-bit integer.
	 */
	private peekUInt16(): number {
		return this.peekNumbers(2);
	}

	/**
	 * Reads an unsigned 16-bit integer.
	 * @returns unsigned 16-bit integer.
	 */
	private readUInt16(): number {
		return this.readNumbers(2);
	}

	/**
	 * Peeks an unsigned 32-bit integer.
	 * @returns unsigned 32-bit integer.
	 */
	private peekUInt32(): number {
		return this.peekNumbers(4);
	}

	/**
	 * Peeks an unsigned 32-bit integer.
	 * @returns unsigned 32-bit integer.
	 */
	private readUInt32(): number {
		return this.readNumbers(4);
	}

	/**
	 * Reads a boolean, consisting of 4 bytes.
	 * @returns true or false.
	 */
	private readBoolean(): boolean {
		return !!this.readNumbers(4);
	}

	/**
	 * Reads a string of a given length.
	 * @param count length of the string.
	 * @returns a string.
	 */
	private readString(count = 0): string {
		// If no length is given, read the length first.
		if (count == 0) count = this.readNumbers(4);
		return String.fromCharCode(...this.readBytes(count));
	}

	/**
	 * Reads a single character
	 * @returns a 1-long string.
	 */
	private readChar(): string {
		return this.readString(1);
	}

	/**
	 * Reads three consecutive lookback strings.
	 * @returns object of id, collection and author.
	 */
	private readMeta(): GBXMeta {
		return {
			id: this.readLookbackString(),
			collection: this.readLookbackString(),
			author: this.readLookbackString(),
		};
	}

	/**
	 * Reads a file reference.
	 * @returns a string consisting of a file path.
	 */
	private readFileReference(): string {
		const version = this.readByte();

		if (version >= 3) this.readBytes(32); // Checksum

		const filePath = this.readString();

		if ((filePath.length > 0 && version >= 1) || version >= 3) this.readString(); // LocatorURL

		return filePath;
	}

	/**
	 * Reads a node reference.
	 */
	private readNodeReference(): null | void {
		// Convert to signed 32-bit integer
		const index = (this.readNumbers(4) << 1) >> 1;

		if (index >= 0) {
			const classId = this.readNumbers(4);

			return this.readNode();
		}

		if (index == -1) return null;

		throw new Error('Invalid node reference');
	}

	private lookbackVersion: number;
	private lookbackStrings: string[] = [];

	/**
	 * Reads a lookback string.
	 * @returns a string.
	 */
	private readLookbackString(): string {
		if (this.lookbackVersion == null) this.lookbackVersion = this.readNumbers(4);

		const index = new Uint32Array([this.readNumbers(4)])[0];

		if (index == 0xffffffff) return '';

		if ((index & 0x3fff) == 0 && (index >> 30 == 1 || index >> 30 == -2)) {
			const str = this.readString();
			this.lookbackStrings.push(str);
			return str;
		}

		if ((index & 0x3fff) == 0x3fff) {
			switch (index >> 30) {
				case 2:
					return 'Unassigned';
				case 3:
					return '';
				default:
					throw new Error('Invalid lookback string, the file provided may be corrupt');
			}
		}

		if (index >> 30 == 0) {
			return collectionIDs[index] === undefined ? 'Unknown collection' : collectionIDs[index];
		}

		if (this.lookbackStrings.length > (index & 0x3fff) - 1)
			return this.lookbackStrings[(index & 0x3fff) - 1];

		return '';
	}
}
