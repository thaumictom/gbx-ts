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
			this.buffer = FileHandlers.getBufferFromPath(options.path);
		}
	}

	public async parseHeaders(): Promise<object> {
		return {};
	}

	public async parse(): Promise<object> {
		this.buffer = await this.buffer;

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
		Logger.debug(`Reading parent class ${type}: 0x${this.decimalToHexadecimal(classID)}`);

		if (bodyCompression != 'C') return Promise.reject(new Error('Body is already decompressed'));

		// Decompression
		const uncompressedSize = this.readNumbers(4);
		const compressedSize = this.readNumbers(4);

		const compressedData = this.readBytes(compressedSize);

		console.log(compressedData.length);

		const decompressedData = LZO.decompress(compressedData);

		this.changeBuffer(decompressedData);

		const node = this.readNode();

		return Promise.resolve(this.result);
	}

	private readNode() {
		while (true) {
			const chunkId = this.readUnsignedNumbers(4);

			// No more chunks left
			if (chunkId == 0xfacade01) {
				Logger.outline(`FINISHED READING NODE`);
				return;
			}

			const peekSkip = this.readUnsignedNumbers(4, true);

			if (peekSkip == 0x534b4950) {
				Logger.debug(`Skipping Chunk: 0x${this.decimalToHexadecimal(chunkId)}`);

				const skip = this.readUnsignedNumbers(4);

				const chunkDataSize = this.readUnsignedNumbers(4);
				const chunkData = this.readBytes(chunkDataSize);

				Logger.debug(`Skipped ${chunkDataSize} bytes`);

				continue;
			}

			this.readChunk(chunkId);
		}
	}

	private parentChunkId: number;
	private childChunkId: number;

	private readChunk(chunkId: number) {
		Logger.debug(`Processing Chunk: 0x${this.decimalToHexadecimal(chunkId)}`);

		this.parentChunkId = chunkId & 0xfffff000;
		this.childChunkId = chunkId & 0xfff;

		switch (this.parentChunkId) {
			case 0x03043000:
				CGameCtnChallenge[this.childChunkId](this);
				break;

			case 0x0301b000:
				CGameCtnCollectorList[this.childChunkId](this);
				break;

			case 0x0305b000:
				CGameCtnChallengeParameters[this.childChunkId](this);
				break;

			case 0x03059000:
				CGameCtnBlockSkin[this.childChunkId](this);
				break;

			case 0x2e009000:
				CGameWaypointSpecialProperty[this.childChunkId](this);
				break;

			case 0x03079000:
				CGameCtnMediaClip[this.childChunkId](this);
				break;

			case 0x03078000:
				CGameCtnMediaTrack[this.childChunkId](this);
				break;

			default:
				throw new Error('Unimplemented chunk');
		}
	}

	// GBXReader
	private readIdent() {
		return {
			id: this.readLookbackString(),
			collection: this.readLookbackString(),
			author: this.readLookbackString(),
		};
	}

	private readUInt16() {
		return this.readUnsignedNumbers(2);
	}

	private readUInt32() {
		return this.readUnsignedNumbers(4);
	}

	private peekUInt32() {
		return this.readUnsignedNumbers(4, true);
	}

	private readBoolean() {
		return this.readBool();
	}

	private forceChunkSkip() {
		let index = 0;

		while (true) {
			const possibleChunkId = this.readUnsignedNumbers(4, true);

			if ((possibleChunkId & 0xfffff000) == (this.parentChunkId & 0xfffff000)) {
				Logger.debug(
					`Found possible next chunk (Skipped ${index} bytes): 0x${this.decimalToHexadecimal(
						possibleChunkId
					)}`
				);

				break;
			}

			if (possibleChunkId == 0xfacade01 && this.readBytes(1, true) == undefined) {
				Logger.debug(`Reached end of file early (Skipped ${index} bytes)`);

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
		const index = this.readNumbers(4);

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

	private getByte(): number {
		return this.buffer[this.pointer];
	}

	private readByte(): number {
		const byte = this.getByte();
		this.pointer++;
		return byte;
	}

	private readBytes(count: number, peek = false): number[] {
		const byteArray = [...Array(count)].map(() => {
			return this.readByte();
		});

		if (peek) this.pointer = this.pointer - count;

		return byteArray;
	}

	private readNumbers(maxValue: number, _count = 0): number {
		if (_count == maxValue) return;
		return (this.readByte() << (_count * 8)) | this.readNumbers(maxValue, _count + 1);
	}

	private readUnsignedNumbers(maxValue: number, peek = false): number {
		const numberArray = this.readNumbers(maxValue) >>> 0;

		if (peek) this.pointer = this.pointer - maxValue;

		return numberArray;
	}

	private readChar(): string {
		return this.readString(1);
	}

	private readString(count = 0): string {
		if (count == 0) count = this.readNumbers(4);
		return String.fromCharCode(...this.readBytes(count));
	}

	private readBool() {
		return !!this.readUnsignedNumbers(4);
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

	private readLookbackString2() {
		if (this.lookbackVersion == null) {
			this.lookbackVersion = this.readNumbers(4);
		}

		if (this.lookbackVersion < 3) {
			throw new Error('Unsupported lookback version');
		}

		const index = this.readNumbers(4) >>> 0; // Convert to unsigned

		if (index == 0xffffffff) {
			return '';
		}

		if (((index & 0xc0000000) != 0 && (index & 0x3fffffff) == 0) || index == 0) {
			const foundString = this.readString();
			this.lookbackStrings.push(foundString);

			return foundString;
		}

		if ((index & 0x3fffffff) == index) {
			return 'CollectionID found.';
		}

		if ((index & 0x3fffffff) > this.lookbackStrings.length) {
			return this.lookbackStrings[(index & 0x3fffffff) - 1];
		}

		return '';
	}
}
