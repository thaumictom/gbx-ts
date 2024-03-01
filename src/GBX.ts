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
	public result: GBXResult = { metadata: {} };
	private buffer: Promise<Buffer> | Buffer;
	private pointer = 0;
	private headerChunks = [];

	constructor(public options: GBXOptions) {
		if (options.path) {
			this.buffer = FileHandlers.getBufferFromPathSync(options.path);
		}
	}

	public async parseHeaders(): Promise<object> {
		return {};
	}

	public async parse() {
		// Return if file does not contain the file magic.
		if (!this.hasMagic()) return Promise.reject(new Error('Not a GBX file'));

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
			this.headerChunks[el].data = this.readBytes(this.headerChunks[el].size);
			delete this.headerChunks[el].size;
		}

		// Amount of nodes
		const numNodes = this.readNumbers(4);

		// Amount of external nodes
		const numExternalNodes = this.readNumbers(4);

		if (numExternalNodes > 0)
			return Promise.reject(new Error('[Unimplemented] External nodes are not supported'));

		const type = this.determineType(classID);
		Logger.debug(`Reading class ${type}: 0x${this.decimalToHexadecimal(classID)}`);

		if (bodyCompression != 'C') return Promise.reject(new Error('Body is already decompressed'));

		// Decompression
		const uncompressedSize = this.readNumbers(4);
		const compressedSize = this.readNumbers(4);

		const compressedData = this.readBytes(compressedSize);

		const decompressedData = LZO.decompress(compressedData);

		this.changeBuffer(decompressedData);

		const node = this.readNode();

		return Promise.resolve(this.result);
	}

	private classId: number;
	private chunkId: number;

	private readNode() {
		while (true) {
			const fullChunkId = this.readUInt32();

			// Reached end of node
			if (fullChunkId == 0xfacade01) return;

			// Check if chunk is skippable
			if (this.peekUInt32() == 0x534b4950) {
				const skip = this.readUInt32();
				const chunkDataSize = this.readUInt32();

				try {
					this.readChunk(fullChunkId);
				} catch (error) {
					if (error instanceof UnimplementedChunkError) {
						Logger.debug(`Skipped chunk 0x${this.decimalToHexadecimal(fullChunkId)}`);
						const chunkData = this.readBytes(chunkDataSize);
					} else throw error;
				}

				continue;
			}

			// Read unskippable chunk
			this.readChunk(fullChunkId);
		}
	}

	private readChunk(fullChunkId: number) {
		Logger.debug(`Processing Chunk: 0x${this.decimalToHexadecimal(fullChunkId)}`);

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

		try {
			chunkHandlers[this.classId][this.chunkId](this);
		} catch (error) {
			throw new UnimplementedChunkError(fullChunkId);
		}
	}

	/**
	 * Reads a single byte at the current pointer position without advancing the pointer.
	 * @returns A number between 0 to 255.
	 */
	private peekByte(offset = 0): number {
		return this.buffer[this.pointer + offset];
	}

	/**
	 * Reads a single byte at the current pointer position.
	 * @returns A number between 0 to 255.
	 */
	private readByte(): number {
		const byte = this.peekByte();
		this.pointer++;
		return byte;
	}

	/**
	 * Reads multiple bytes at the current pointer position without advancing the pointer.
	 * @param count Amount of bytes to read.
	 * @returns An array of numbers between 0 to 255.
	 */
	private peekBytes(count: number): number[] {
		return Array.from({ length: count }, (_, index) => this.peekByte(index));
	}

	/**
	 * Reads multiple bytes at the current pointer position.
	 * @param count Amount of bytes to read.
	 * @returns An array of numbers between 0 to 255.
	 */
	private readBytes(count: number): number[] {
		return Array.from({ length: count }, () => this.readByte());
	}

	/**
	 * Reads multiple bytes at the current pointer position
	 * without advancing the pointer and returns them as an unsigned number.
	 * @returns A positive number.
	 */
	private peekNumbers(count: number): number {
		return this.peekBytes(count).reduce((sum, byte, index) => sum | (byte << (index * 8)), 0) >>> 0;
	}

	/**
	 * Reads multiple bytes at the current pointer position
	 * and returns them as an unsigned number.
	 * @returns A positive number.
	 */
	private readNumbers(count: number): number {
		return this.readBytes(count).reduce((sum, byte, index) => sum | (byte << (index * 8)), 0) >>> 0;
	}

	private readIdent() {
		return {
			id: this.readLookbackString(),
			collection: this.readLookbackString(),
			author: this.readLookbackString(),
		};
	}

	private readUInt16() {
		return this.readNumbers(2);
	}

	private readUInt32() {
		return this.readNumbers(4);
	}

	private peekUInt32() {
		return this.peekNumbers(4);
	}

	private readBoolean() {
		return !!this.readNumbers(4);
	}

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

	private readFileReference() {
		const version = this.readByte();

		if (version >= 3) {
			const checksum = this.readBytes(32);
		}

		const filePath = this.readString(); // Issue

		if ((filePath.length > 0 && version >= 1) || version >= 3) {
			const locatorUrl = this.readString();
		}

		return filePath;
	}

	private readNodeReference() {
		console.log(this.peekBytes(16));

		const index = (this.readNumbers(4) << 1) >> 1;

		if (index >= 0) {
			const classId = this.readNumbers(4);

			//Logger.log(`Found classId: 0x${this.decimalToHexadecimal(classId)}`);

			const node = this.readNode();

			return node;
		}

		if (index == -1) return null;

		Logger.error(`Invalid node reference: ${index}`);
		throw new Error('Invalid node reference');
	}

	private decimalToHexadecimal(decimal: number) {
		return Math.abs(decimal).toString(16);
	}

	private determineType(nodeID: number) {
		if (nodeID == 0x03043000 || nodeID == 0x24003000) {
			return 'CGameCtnChallenge';
		}

		if (nodeID == 0x03093000 || nodeID == 0x2407e000 || nodeID == 0x2403f000) {
			return 'CGameCtnReplayRecord';
		}

		return 'Unknown Type';
	}

	private hasMagic(): boolean {
		return this.readString(3) == 'GBX';
	}

	private changeBuffer(newBuffer: Buffer) {
		this.buffer = newBuffer;
		this.pointer = 0;
	}

	private readChar(): string {
		return this.readString(1);
	}

	private readString(count = 0): string {
		if (count == 0) count = this.readNumbers(4);
		return String.fromCharCode(...this.readBytes(count));
	}

	public lookbackVersion: number;
	public lookbackStrings = [];

	private readLookbackString() {
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
			return collectionIDs[index] === undefined ? index : collectionIDs[index];
		}

		if (this.lookbackStrings.length > (index & 0x3fff) - 1)
			return this.lookbackStrings[(index & 0x3fff) - 1];

		return '';
	}
}

class UnimplementedChunkError extends Error {
	constructor(fullChunkId: number) {
		super(`No handler found for unskippable chunk 0x${fullChunkId}`);
	}

	name = 'UnimplementedChunkError';
}
