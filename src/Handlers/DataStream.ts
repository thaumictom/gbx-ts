import { collectionIDs } from '../Data/CollectionIDs';
import { GBX } from '../GBX';
import { GBXReader } from '../GBXReader';
import { Logger } from './Logger';

export class DataStream implements IDataStream {
	private stream: Buffer;
	private position: number = 0;

	private lookbackVersion: number;
	private lookbackStrings: string[] = [];

	constructor(stream: Buffer) {
		this.stream = stream;
	}

	/**
	 * Reads a single byte at the current pointer position without advancing the pointer.
	 * @returns a number between 0 to 255.
	 */
	public peekByte(offset = 0): number {
		return this.stream[this.position + offset];
	}

	/**
	 * Reads a single byte at the current pointer position.
	 * @returns a number between 0 to 255.
	 */
	public readByte(): number {
		let byte = this.peekByte();
		this.position++;
		return byte;
	}

	/**
	 * Reads multiple bytes at the current pointer position without advancing the pointer.
	 * @param count Amount of bytes to read.
	 * @returns an array of numbers between 0 to 255.
	 */
	public peekBytes(count: number): number[] {
		return Array.from({ length: count }, (_, index) => this.peekByte(index));
	}

	/**
	 * Reads multiple bytes at the current pointer position.
	 * @param count Amount of bytes to read.
	 * @returns an array of numbers between 0 to 255.
	 */
	public readBytes(count: number): number[] {
		return Array.from({ length: count }, () => this.readByte());
	}

	/**
	 * Reads multiple bytes at the current pointer position
	 * without advancing the pointer and returns them as an unsigned number.
	 * @returns a positive number.
	 */
	public peekNumbers(count: number): number {
		return this.peekBytes(count).reduce((sum, byte, index) => sum | (byte << (index * 8)), 0) >>> 0;
	}

	/**
	 * Reads multiple bytes at the current pointer position
	 * and returns them as an unsigned number.
	 * @returns a positive number.
	 */
	public readNumbers(count: number): number {
		return this.readBytes(count).reduce((sum, byte, index) => sum | (byte << (index * 8)), 0) >>> 0;
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
	 * Peeks an unsigned 32-bit integer.
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

	/**
	 * Reads a node reference.
	 */
	public readNodeReference(): object | null {
		// Convert to signed 32-bit integer
		const index = (this.readNumbers(4) << 1) >> 1;

		if (index >= 0) {
			const classId = this.readNumbers(4);

			const node = new GBXReader(this).readNode();

			return node;
		}

		if (index == -1) return null;

		throw new Error('Invalid node reference');
	}

	/**
	 * Reads a lookback string.
	 * @returns a string.
	 */
	public readLookbackString(): string {
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

	/**
	 * Skips to the next chunk within the same class ID.
	 * @todo Add support for skipping nested chunks.
	 */
	public forceChunkSkip(classId: number): void {
		let index = 0;

		while (true) {
			const possibleChunkId = this.peekUInt32();

			if ((possibleChunkId & 0xfffff000) == classId) {
				Logger.debug(`Force skipped ${index} bytes to 0x${possibleChunkId.toString(16)}`);

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
}
