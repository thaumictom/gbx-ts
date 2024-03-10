interface IOptions {
	path: string;
}

interface IHeaderChunks {
	chunkId: number;
	chunkSize?: number;
	isHeavy: boolean;
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

declare enum MapKind {
	EndMarker,
	Campaign,
	Puzzle,
	Retro,
	TimeAttack,
	Rounds,
	InProgress,
	Campaign_7,
	Multi,
	Solo,
	Site,
	SoloNadeo,
	MultiNadeo,
}
