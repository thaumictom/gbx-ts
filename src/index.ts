import { FileHandlers, Logger, LZO } from './Handlers/Handlers';

interface GBXOptions {
	path: string;
}

interface GBXMetadata {
	[x: string]: any;
	bronzeTime?: number;
	silverTime?: number;
	goldTime?: number;
	authorTime?: number;
	mapInfo?: any;
	mapName?: string;
}

interface GBXResult {
	type?: string;
	metadata: GBXMetadata;
}

const collectionIDs = {
	6: 'Stadium',
	11: 'Valley',
	12: 'Canyon',
	13: 'Lagoon',
	25: 'Stadium256',
	26: 'Stadium®',
	10003: 'Common',
};

class GBX {
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

	private readChunk(chunkId: number) {
		Logger.debug(`Processing Chunk: 0x${this.decimalToHexadecimal(chunkId)}`);

		switch (chunkId & 0xfffff000) {
			case 0x03043000: // CGameCtnChallenge
				switch (chunkId & 0xfff) {
					case 0x00d: // PlayerModel
						const vehicle = this.readLookbackString();
						const collection = this.readLookbackString();
						const author = this.readLookbackString();

						return true;
					case 0x011: // Challenge parameters
						const collectorList = this.readNodeReference(); // CGameCtnCollectorList
						const challengeParameters = this.readNodeReference(); // CGameCtnChallengeParameters
						const kind = this.readNumbers(4);

						return true;
					case 0x01f:
						// meta (trackUID, environment, mapAuthor)
						const trackUID = this.readLookbackString();
						const environment = this.readLookbackString();
						const mapAuthor = this.readLookbackString();

						// string trackName
						const trackName = this.readString();

						// meta decoration (timeOfDay, environment, envirAuthor)
						const timeOfDay = this.readLookbackString();
						const environment2 = this.readLookbackString();
						const envirAuthor = this.readLookbackString();

						// uint32 sizeX
						// uint32 sizeY
						// uint32 sizeZ
						const sizeX = this.readUnsignedNumbers(4);
						const sizeY = this.readUnsignedNumbers(4);
						const sizeZ = this.readUnsignedNumbers(4);

						// bool needUnlock
						const needUnlock = this.readBool();

						const version = this.readUnsignedNumbers(4);
						const numBlocks = this.readUnsignedNumbers(4);

						// Returns true if block is normal
						function readBlock(this: GBX) {
							const blockName = this.readLookbackString();
							const rotation = this.readByte();

							// Unimplemented: There is some special cases for the coordinates in version >= 6
							const x = this.readByte();
							const y = this.readByte();
							const z = this.readByte();

							let flags: number;

							if (version == 0) flags = this.readUnsignedNumbers(2);
							else if (version > 0) flags = this.readUnsignedNumbers(4);

							if (flags == 0xffffffff) {
								return false;
							}

							if ((flags & 0x8000) != 0) {
								const author = this.readLookbackString();
								const skin = this.readNodeReference(); // CGameCtnBlockSkin
							}

							if (flags & 0x100000) {
								const blockParameters = this.readNodeReference(); // CGameWaypointSpecialProperty
							}

							return true;
						}

						for (let i = 0; i < numBlocks; i++) {
							const isNormal = readBlock.bind(this)();

							if (isNormal) continue;

							i--;
						}

						// Peek ahead to see if there is any more blocks
						while ((this.readUnsignedNumbers(4, true) & 0xc0000000) > 0) {
							readBlock.bind(this)();
						}

						return true;
					case 0x022:
						const u1 = this.readUnsignedNumbers(4);

						return true;
					case 0x024:
						const customMusicPackDesc = this.readFileReference();

						return true;
					case 0x025:
						const mapCoordOriginX = this.readUnsignedNumbers(4);
						const mapCoordOriginY = this.readUnsignedNumbers(4);

						const mapCoordTargetX = this.readUnsignedNumbers(4);
						const mapCoordTargetY = this.readUnsignedNumbers(4);

						return true;
					case 0x026:
						const clipGlobal = this.readNodeReference(); // Empty

						return true;
					case 0x028:
						const hasCustomCamThumbnail = this.readBool();

						if (hasCustomCamThumbnail) {
							const u1 = this.readByte();

							const u2X = this.readUnsignedNumbers(4);
							const u2Y = this.readUnsignedNumbers(4);
							const u2Z = this.readUnsignedNumbers(4);

							const u3X = this.readUnsignedNumbers(4);
							const u3Y = this.readUnsignedNumbers(4);
							const u3Z = this.readUnsignedNumbers(4);

							const u4X = this.readUnsignedNumbers(4);
							const u4Y = this.readUnsignedNumbers(4);
							const u4Z = this.readUnsignedNumbers(4);

							const thumbnailPositionX = this.readUnsignedNumbers(4);
							const thumbnailPositionY = this.readUnsignedNumbers(4);
							const thumbnailPositionZ = this.readUnsignedNumbers(4);

							const thumbnailFov = this.readUnsignedNumbers(4);

							const thumbnailNearClipPlane = this.readUnsignedNumbers(4);
							const thumbnailFarClipPlane = this.readUnsignedNumbers(4);
						}

						const comments = this.readString();

						return true;
					case 0x02a:
						const u2 = this.readBool();

						return true;
					case 0x049:
						this.forceChunkSkip(chunkId);

						return true;
					default:
						throw new Error('Unimplemented chunk');
				}
			case 0x0301b000: // CCGameCtnCollectorList
				const archiveCount = this.readNumbers(4);

				for (let i = 0; i < archiveCount; i++) {
					const blockName = this.readLookbackString();
					const collection = this.readLookbackString();
					const author = this.readLookbackString();
					const numPieces = this.readNumbers(4);
				}

				return true;
			case 0x0305b000: // CGameCtnChallengeParameters
				switch (chunkId & 0xfff) {
					case 0x001: // Tips
						const tip1 = this.readString();
						const tip2 = this.readString();
						const tip3 = this.readString();
						const tip4 = this.readString();

						return true;
					case 0x004: // Challenge parameters
						const bronzeTime = this.readUnsignedNumbers(4);
						const silverTime = this.readUnsignedNumbers(4);
						const goldTime = this.readUnsignedNumbers(4);
						const authorTime = this.readUnsignedNumbers(4);
						const u1 = this.readUnsignedNumbers(4);

						return true;
					case 0x008:
						const timeLimit = this.readUnsignedNumbers(4);
						const authorScore = this.readUnsignedNumbers(4);

						return true;
					case 0x00a: // Skippable
						return false;
					case 0x00d: // Race Validation Ghost
						const raceValidationGhost = this.readNodeReference();

						return true;
					default:
						throw new Error('Unimplemented chunk');
				}
			case 0x03059000: // CGameCtnBlockSkin
				switch (chunkId & 0xfff) {
					case 0x002: // Skin
						const text = this.readString();
						const packDesc = this.readFileReference();
						const parentPackDesc = this.readFileReference();

						return true;
					case 0x003:
						const version = this.readUnsignedNumbers(4);
						const secondaryPackDesc = this.readFileReference();

						return true;
					default:
						throw new Error('Unimplemented chunk');
				}
			case 0x2e009000: // CGameWaypointSpecialProperty
				const version = this.readUnsignedNumbers(4);

				if (version == 1) {
					const spawn = this.readUnsignedNumbers(4);
					const order = this.readUnsignedNumbers(4);
				} else if (version == 2) {
					const tag = this.readString();
					const order = this.readUnsignedNumbers(4);
				}

				return true;

			case 0x03079000: // CGameCtnMediaClip
				switch (chunkId & 0xfff) {
					case 0x00d: // Media Clip
						// version
						// list<CGameCtnMediaTrack>_deprec Tracks
						// string Name
						// bool StopWhenLeave
						// bool
						// bool StopWhenRespawn
						// string // Same as 0x009 U01
						// float
						// int LocalPlayerClipEntIndex // = -1
						const version = this.readUnsignedNumbers(4);

						const numTracks = this.readUnsignedNumbers(4);

						for (let i = 0; i < numTracks; i++) {
							const track = this.readNodeReference(); // CGameCtnMediaTrack
						}

					default:
						throw new Error('Unimplemented chunk');
				}
			case 0x03078000: // CGameCtnMediaTrack
				switch (chunkId & 0xfff) {
					case 0x000:
						return true;
					case 0x001:
						const name = this.readString();
						const numBlocks = this.readUnsignedNumbers(4);

						for (let i = 0; i < numBlocks; i++) {
							const block = this.readNodeReference(); // CGameCtnMediaBlock
						}

						const u1 = this.readUnsignedNumbers(4);

						return true;
					default:
						throw new Error('Unimplemented chunk');
				}
			default:
				Logger.error(`Unknown unskippable chunk: 0x${this.decimalToHexadecimal(chunkId)}`);
				throw new Error('Unknown chunk');
		}
	}

	private forceChunkSkip(parentChunkId: number) {
		let index = 0;

		while (true) {
			const possibleChunkId = this.readUnsignedNumbers(4, true);

			if ((possibleChunkId & 0xfffff000) == (parentChunkId & 0xfffff000)) {
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
			if (collectionIDs[index] == undefined) {
				//Logger.warn(`CollectionID not found: ${index}`);
				return index;
			}

			return collectionIDs[index];
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

export { GBX };
