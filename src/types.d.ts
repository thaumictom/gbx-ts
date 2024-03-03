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

interface CollectionList {
	[key: number]: string;
}

interface IDataStream {
	peekByte(offset: number): number;
	peekBytes(count: number): number[];

	readByte(): number;
	readBytes(count: number): number[];

	peekNumbers(count: number): number;
	readNumbers(count: number): number;

	peekUInt16(): number;
	readUInt16(): number;

	peekUInt32(): number;
	readUInt32(): number;

	readBoolean(): boolean;
	readString(): string;
	readChar(): string;

	readMeta(): GBXMeta;
	readFileReference(): string;
	readNodeReference(): object | null;
	readLookbackString(): string;

	forceChunkSkip(classId: number): void;
}

interface GBXMeta {
	id: string;
	collection: string;
	author: string;
}

interface GBXHeaderChunks {
	size?: number;
	data?: Buffer | number[];
	isCompressed: boolean;
}
