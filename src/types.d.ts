interface IOptions {
	path: string;
}

interface IHeaderChunks {
	size?: number;
	data?: Buffer | number[];
	isCompressed: boolean;
}

interface ICollectionList {
	[key: number]: string;
}

interface IMeta {
	id: string;
	collection: string;
	author: string;
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

	readMeta(): IMeta;
	readFileReference(): string;
	readNodeReference(): object | null;
	readLookbackString(): string;

	forceChunkSkip(classId: number): void;
}
