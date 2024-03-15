import { GBXReader } from '../GBXReader';
import { collectionIDs } from '../Data/CollectionIDs';
import { Hex, Logger, Merger } from '../Handlers';

/**
 * Handle data streams.
 */
export default class DataStream {
	private stream: Buffer | Array<number>;
	private position: number = 0;

	constructor(stream: Buffer | Array<number>) {
		this.stream = stream;
	}

	/**
	 * Creates an array with a callback function applied to each index.
	 * @param length length of the array.
	 * @param callback arrow function with index as argument.
	 * @returns an array with the function applied to each index.
	 */
	public createArray<T>(length: number, callback: (index: number) => T): T[] {
		return Array.from({ length }, (_, index) => callback(index));
	}

	/**
	 * Reads a single byte at the current pointer position without advancing the pointer.
	 * @returns a number between 0 to 255.
	 */
	public peekByte(offset = 0): number {
		const byte = this.stream[this.position + offset];
		return byte;
	}

	/**
	 * Reads a single byte at the current pointer position.
	 * @returns a number between 0 to 255.
	 */
	public readByte(): number {
		const byte = this.peekByte();
		if (byte === undefined) throw new Error('Attempted to read an undefined byte.');
		this.position++;
		return byte;
	}
	/**
	 * Reads multiple bytes at the current pointer position without advancing the pointer.
	 * @param count Amount of bytes to read.
	 * @returns an array of numbers between 0 to 255.
	 */
	public peekBytes(count: number): number[] {
		return this.createArray(count, (index) => this.peekByte(index));
	}

	/**
	 * Reads multiple bytes at the current pointer position.
	 * @param count Amount of bytes to read.
	 * @returns an array of numbers between 0 to 255.
	 */
	public readBytes(count: number): number[] {
		return this.createArray(count, () => this.readByte());
	}

	/**
	 * Reads a byte array as a number.
	 * @param bytes Array of bytes.
	 * @returns a number (signed if the array is >= 4 long, unsigned otherwise).
	 */
	private bytesToNumber(bytes: number[]): number {
		return bytes.reduce((sum, byte, index) => sum | (byte << (index * 8)), 0);
	}

	/**
	 * Reads multiple bytes at the current pointer position
	 * without advancing the pointer and returns them as an unsigned number.
	 * @returns a positive number.
	 */
	public peekNumbers(count: number): number {
		return this.bytesToNumber(this.peekBytes(count)) >>> 0;
	}

	/**
	 * Reads multiple bytes at the current pointer position
	 * and returns them as an unsigned number.
	 * @returns a positive number.
	 */
	public readNumbers(count: number): number {
		return this.bytesToNumber(this.readBytes(count)) >>> 0;
	}

	/**
	 * Reads a 32-bit float, consisting of 4 bytes based on IEEE-754.
	 * @returns a floating point number.
	 */
	public readFloat(): number {
		let bits = this.bytesToNumber(this.readBytes(4));

		if (bits == 0) return 0;

		const sign = bits >>> 31 === 0 ? 1 : -1;
		const exponent = ((bits >>> 23) & 0xff) - 127;
		const significand = (bits & 0x7fffff) | 0x800000;

		return sign * significand * Math.pow(2, exponent - 23);
	}

	/**
	 * Peeks an unsigned 16-bit integer.
	 * @returns unsigned 16-bit integer.
	 */
	public peekUInt16(): number {
		return this.peekNumbers(2);
	}

	/**
	 * Reads an unsigned 16-bit integer.
	 * @returns unsigned 16-bit integer.
	 */
	public readUInt16(): number {
		return this.readNumbers(2);
	}

	/**
	 * Peeks an unsigned 32-bit integer.
	 * @returns unsigned 32-bit integer.
	 */
	public peekUInt32(): number {
		return this.peekNumbers(4);
	}

	/**
	 * Reads an unsigned 32-bit integer.
	 * @returns unsigned 32-bit integer.
	 */
	public readUInt32(): number {
		return this.readNumbers(4);
	}

	/**
	 * Reads a boolean, consisting of 4 bytes.
	 * @returns true or false.
	 */
	public readBoolean(): boolean {
		return !!this.readNumbers(4);
	}

	/**
	 * Reads a string of a given length.
	 * @param count length of the string.
	 * @returns a string.
	 */
	public readString(count = 0): string {
		// If no length is given, read the length first.
		if (count == 0) count = this.readNumbers(4);
		return String.fromCharCode(...this.readBytes(count));
	}

	/**
	 * Reads a single character
	 * @returns a 1-long string.
	 */
	public readChar(): string {
		return this.readString(1);
	}

	/**
	 * Reads two consecutive 32-bit integers.
	 * @returns an array of two numbers.
	 */
	public readInt2(): Int2 {
		return { x: this.readUInt32(), y: this.readUInt32() };
	}

	/**
	 * Reads three consecutive 32-bit integers.
	 * @returns an array of three numbers.
	 */
	public readInt3(): Int3 {
		return { x: this.readUInt32(), y: this.readUInt32(), z: this.readUInt32() };
	}

	/**
	 * Reads a vector of size 2 as floats.
	 * @returns an array of two floats.
	 */
	public readVector2(): Vector2 {
		return { x: this.readFloat(), y: this.readFloat() };
	}

	/**
	 * Reads a vector of size 3 as floats.
	 * @returns an array of three floats.
	 */
	public readVector3(): Vector3 {
		return { x: this.readFloat(), y: this.readFloat(), z: this.readFloat() };
	}

	/**
	 * Reads three consecutive bytes.
	 * @returns an array of three bytes.
	 */
	public readByte3(): Byte3 {
		return { x: this.readByte(), y: this.readByte(), z: this.readByte() };
	}

	/**
	 * Reads three consecutive lookback strings.
	 * @returns object of id, collection and author.
	 */
	public readMeta(): IMeta {
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
	public readFileReference(): string {
		const version = this.readByte();

		if (version >= 3) this.readBytes(32); // Checksum

		const filePath = this.readString();

		if ((filePath.length > 0 && version >= 1) || version >= 3) this.readString(); // LocatorURL

		return filePath;
	}

	private nodeList: any[] = [];

	/**
	 * Reads a node reference.
	 */
	public readNodeReference<NodeType>(): NodeType | undefined {
		// Convert to signed 32-bit integer
		const index = (this.readNumbers(4) << 1) >> 1;

		if (index == -1) return undefined;

		const isNodeInstantiated = this.nodeList[index] !== undefined;

		if (index >= 0 && !isNodeInstantiated) {
			const classId = this.readUInt32();

			const { node, chunks, unknowns, versions } = new GBXReader<NodeType>({
				stream: this,
				classId,
			}).readNode();

			this.nodeList[index] = node;

			//node.chunks = Merger.mergeChunks(chunks, unknowns, versions);

			return node;
		}

		if (isNodeInstantiated) return this.nodeList[index];

		throw new Error('Invalid node reference');
	}

	private lookbackVersion?: number;
	private lookbackStrings: string[] = [];

	/**
	 * Reads a lookback string.
	 * @returns a string.
	 */
	public readLookbackString(): string {
		if (this.lookbackVersion === undefined) this.lookbackVersion = this.readUInt32();

		const index = new Uint32Array([this.readUInt32()])[0];

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

	/**
	 * Skips to the next chunk within the same class ID. Very unsafe, as it does not take lookback strings into account, because of its naive skip method.
	 * @todo Add support for skipping nested chunks.
	 */
	public forceChunkSkip(fullChunkId: number): void {
		while (true) {
			const possibleNextChunkId = this.peekUInt32();

			if ((possibleNextChunkId & 0xffffff00) == (fullChunkId & 0xffffff00)) {
				Logger.warn(`Force skipped chunk: 0x${Hex.fromDecimal(fullChunkId)}`);

				break;
			}

			if (possibleNextChunkId == 0xfacade01 && this.peekByte(4) === undefined) {
				Logger.warn(`Force skipped chunk: 0x${Hex.fromDecimal(fullChunkId)}`);
				Logger.warn(`Reached end of file early`);

				break;
			}

			// TODO Add support for skipping nested chunks

			const skippedByte = this.readByte();
		}
	}
}
