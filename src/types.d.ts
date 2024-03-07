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

interface Chunk {
	(reader: import('./Handlers').DataStream, fullChunkId: number): object | null;
}
