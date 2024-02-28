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

interface GBXReader {
	readByte(): number;
	readBytes(length: number): Buffer;

	readUInt16(): number;
	readUInt32(): number;
	readString(): string;
	readBoolean(): boolean;

	peekUInt32(): number;

	readLookbackString(): string;
	readNodeReference(): any;
	readFileReference(): any;
	readIdent(): [string, string, string];

	forceChunkSkip(): void;
}
